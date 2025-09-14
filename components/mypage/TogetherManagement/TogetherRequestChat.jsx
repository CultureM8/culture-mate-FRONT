"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import FriendListItem from "@/components/mypage/FriendListItem";
import SockJS from "sockjs-client";
import { Client as StompClient } from "@stomp/stompjs";
import { listChatRooms, joinRoom } from "@/lib/chatApi";
import chatApi from "@/lib/api/chatApi";
import { WS_ENDPOINT, subDestination, pubDestination } from "@/lib/chatClient";
import { createAuthenticatedStompClient } from "@/lib/websocket-jwt-patch";

// 개발 환경에서 WebSocket 테스트 도구 로드
if (process.env.NODE_ENV === 'development') {
  import("@/lib/websocket-test-utils");
}

/** 비어있지 않은 첫 문자열을 반환(숫자-only도 허용) */
function preferName(...cands) {
  for (const v of cands) {
    if (v === undefined || v === null) continue;
    const s = String(v).trim();
    if (!s) continue;
    return s;
  }
  return "사용자";
}

/** 채팅방 목록(roomsRaw) 동행 요청 정보(req) 매칭 */
function pickRoomIdForRequest(roomsRaw, req) {
  const list = Array.isArray(roomsRaw) ? roomsRaw : [];
  const rows = list
    .map((r) => ({ id: r.id ?? r.roomId, name: String(r.roomName ?? "") }))
    .filter((r) => r.id != null && r.name);

  const me = String(req?.toUserId ?? req?.toLoginId ?? "");
  const him = String(req?.fromUserId ?? req?.fromLoginId ?? "");
  const post = req?.postId ? String(req.postId) : null;

  const both = rows.filter((r) => r.name.includes(me) && r.name.includes(him));
  if (post) {
    const hit =
      both.find((r) => r.name.includes(post)) ||
      rows.find((r) => r.name.includes(post));
    if (hit) return hit.id;
  }
  const tCodeHit = both.find((r) => /T_\d{8}/.test(r.name));
  if (tCodeHit) return tCodeHit.id;
  if (both.length) return both[0].id;
  return rows.at(-1)?.id ?? null;
}

export default function TogetherRequestChat({
  //동행 신청 정보(메시지, 보낸 사람, 받은 사람 등)가 담긴 핵심 데이터 객체
  chatRequestData,
  roomId: roomIdProp = null,
  onClose,
  onFriendClick,
  //신청 수락 및 거절 시 호출될 함수
  onAccept,
  onReject,
  // 과거 호환(있다면 우선 사용)
  onAcceptTogetherRequest,
  onRejectTogetherRequest,
  // 탭 구분: 보낸함이면 true
  isFromSentBox = false,
}) {
  // 단일 핸들러 통일
  const acceptHandler = onAcceptTogetherRequest ?? onAccept;
  const rejectHandler = onRejectTogetherRequest ?? onReject;

  if (!chatRequestData) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">채팅 데이터를 불러오는 중...</p>
      </div>
    );
  }

  /* ---------- 멤버 ID (숫자) ---------- */
  const myMemberIdRaw = isFromSentBox //내코드
    ? chatRequestData.fromUserId ?? chatRequestData.fromMemberId ?? null //보낸채팅일때
    : chatRequestData.toUserId ?? chatRequestData.toMemberId ?? null; //받은채팅일때

  const otherMemberIdRaw = isFromSentBox //상대코드
    ? chatRequestData.toUserId ?? chatRequestData.toMemberId ?? null //보낸채팅
    : chatRequestData.fromUserId ?? chatRequestData.fromMemberId ?? null; //받은채팅

  const myId = myMemberIdRaw != null ? String(myMemberIdRaw) : null;

  /* ---------- 내 이름/상대 이름 ---------- */
  const myDisplayName = isFromSentBox //내이름
    ? //보낸채팅일때
      preferName(
        chatRequestData.fromUserName,
        chatRequestData.fromNickname,
        chatRequestData.fromLoginId,
        myId
      )
    : //받은채팅일때
      preferName(
        chatRequestData.toUserName,
        chatRequestData.toNickname,
        chatRequestData.toLoginId,
        myId
      );

  const otherUser = useMemo(() => {
    //상대이름
    //보낸채팅
    if (isFromSentBox) {
      return {
        id: chatRequestData.toUserId ?? chatRequestData.toLoginId ?? "unknown",
        name: preferName(
          chatRequestData.toUserName,
          chatRequestData.toNickname,
          chatRequestData.toLoginId,
          chatRequestData.toUserId
        ),
        profileImage:
          chatRequestData.toUserProfileImage || "/img/default_img.svg",
      };
    }
    return {
      id:
        chatRequestData.fromUserId ?? chatRequestData.fromLoginId ?? "unknown",
      name: preferName(
        chatRequestData.fromUserName,
        chatRequestData.fromNickname,
        chatRequestData.fromLoginId,
        chatRequestData.fromUserId
      ),
      profileImage:
        chatRequestData.fromUserProfileImage || "/img/default_img.svg",
    };
  }, [chatRequestData, isFromSentBox]);

  /* ---------- 상태 ---------- */
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting"); // "connecting" | "connected" | "error"

  const [roomId, setRoomId] = useState(
    roomIdProp || chatRequestData.roomId || null
  );
  const stompRef = useRef(null);
  const sentInitialRef = useRef(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  /* ---------- 스크롤 자동화 ---------- */
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // 메시지가 변경될 때마다 아래로 스크롤
  useEffect(() => {
    // 짧은 지연 후 스크롤 (DOM 업데이트 완료 후)
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  /* ---------- 채팅방/요청 변경 시 메시지 초기화 ---------- */
  useEffect(() => {
    // roomId나 chatRequestData가 변경될 때 메시지 초기화
    const initialSender = isFromSentBox
      ? myId
      : String(
          chatRequestData.fromUserId ??
            chatRequestData.fromLoginId ??
            chatRequestData.fromMemberId ??
            "unknown"
        );

    const initialSenderName = isFromSentBox
      ? myDisplayName
      : preferName(
          chatRequestData.fromUserName,
          chatRequestData.fromNickname,
          chatRequestData.fromLoginId,
          chatRequestData.fromUserId
        );

    const initialMessage = {
      id: "initial-1",
      sender: initialSender,
      senderName: initialSenderName,
      message: chatRequestData.message || "메시지 없음",
      timestamp: new Date(chatRequestData.createdAt || Date.now()),
      isInitial: true,
    };

    // 초기 메시지만 설정 (히스토리는 WebSocket 연결 시 로드)
    setMessages([initialMessage]);
  }, [chatRequestData?.requestId, roomId]); // requestId와 roomId 변경 시에만 초기화

  /* ---------- 외부 roomId 반영 ---------- */
  useEffect(() => {
    if (roomIdProp && roomIdProp !== roomId) setRoomId(roomIdProp);
  }, [roomIdProp, roomId]);

  /* ---------- JWT 인증 WebSocket 연결 ---------- */
  useEffect(() => {
    if (!roomId) {
      setConnectionStatus("connecting");
      return;
    }

    setConnectionStatus("connecting");

    const initializeAuthenticatedWebSocket = async () => {
      try {
        console.log('=== JWT 인증 WebSocket 초기화 ===');
        console.log('roomId:', roomId, 'myId:', myId);

        // JWT 인증된 STOMP 클라이언트 생성
        const client = createAuthenticatedStompClient(WS_ENDPOINT);

        // 연결 성공 핸들러 오버라이드
        client.onConnect = async () => {
          console.log('✅ JWT 인증 WebSocket 연결 성공!', roomId);
          setConnectionStatus("connected");

          // 1. 채팅 히스토리 로드
          try {
            console.log('📜 채팅 히스토리 로딩 시작...', roomId);

            // 올바른 API 경로로 직접 호출 (/api/v1/chatroom/{roomId}/messages)
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`/api/v1/chatroom/${roomId}/messages`, {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...(token && { "Authorization": `Bearer ${token}` })
              }
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }

            const result = await response.json();
            const historyMessages = result.content || result || [];

            if (Array.isArray(historyMessages)) {
              const formattedHistory = historyMessages.map(msg => ({
                id: msg.id || `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                sender: String(msg.senderId ?? msg.memberId ?? "unknown"),
                senderName: String(msg.senderId ?? msg.memberId) === myId
                  ? myDisplayName
                  : otherUser.name,
                message: String(msg.content ?? ""),
                timestamp: new Date(msg.createdAt || Date.now()),
                isHistory: true
              }));

              console.log(`✅ 채팅 히스토리 로드 완료: ${formattedHistory.length}개`);

              // 초기 메시지와 히스토리 메시지 합치기
              setMessages(prev => {
                const initialMessages = prev.filter(m => m.isInitial);

                if (formattedHistory.length > 0) {
                  // 초기 신청 메시지와 동일한 내용의 히스토리 메시지 제거
                  const initialMessage = initialMessages[0];
                  const filteredHistory = initialMessage ? formattedHistory.filter(histMsg => {
                    // 신청 메시지와 내용이 같으면 히스토리에서 제외
                    return !(histMsg.message === initialMessage.message &&
                             histMsg.sender === initialMessage.sender);
                  }) : formattedHistory;

                  // 초기 메시지(신청 메시지) + 필터링된 히스토리
                  return [...initialMessages, ...filteredHistory];
                } else {
                  // 히스토리가 없으면 초기 메시지만
                  return initialMessages;
                }
              });
            }
          } catch (error) {
            console.warn('⚠️ 채팅 히스토리 로드 실패 (무시):', error);
          }

          // 2. 실시간 메시지 구독
          client.subscribe(subDestination(roomId), (frame) => {
            try {
              const body = JSON.parse(frame.body);
              const senderId = String(body.senderId ?? "unknown");

              console.log('새 메시지 수신:', body);

              setMessages((prev) => [
                ...prev,
                {
                  id: `srv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  sender: senderId,
                  senderName: senderId === myId ? myDisplayName : otherUser.name,
                  message: String(body.content ?? ""),
                  timestamp: new Date(),
                },
              ]);
            } catch (e) {
              console.error("메시지 파싱 오류:", e);
            }
          });

          // 최초 1회: 신청 본문을 실제 방으로 전송 (동행 신청 수락 후에만)
          // 초기 메시지는 UI에서만 표시하고, 실제 DB 전송은 하지 않음
          console.log('초기 메시지는 UI에서만 표시, DB 전송 안함');
          sentInitialRef.current = true;
        };

        // JWT 관련 오류 핸들러
        client.onStompError = (frame) => {
          console.error('❌ STOMP 연결 오류:', frame);
          setConnectionStatus("error");
          if (frame.headers.message?.includes('JWT') ||
              frame.headers.message?.includes('토큰') ||
              frame.headers.message?.includes('인증')) {
            console.error('JWT 인증 오류 - 로그인 상태 확인 필요');
            alert('인증이 만료되었습니다. 다시 로그인해주세요.');
            // 로그인 페이지로 리다이렉트 가능
          }
        };

        client.onWebSocketError = (event) => {
          console.error('❌ WebSocket 연결 오류:', event);
          setConnectionStatus("error");
        };

        // STOMP 클라이언트 저장
        stompRef.current = client;

        // 연결 시작
        client.activate();

        console.log('JWT 인증 WebSocket 연결 시도 중...');

      } catch (error) {
        console.error('WebSocket 초기화 실패:', error);
        setConnectionStatus("error");
        if (error.message?.includes('JWT') || error.message?.includes('토큰')) {
          alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
          // window.location.href = '/login';
        }
      }
    };

    initializeAuthenticatedWebSocket();

    return () => {
      if (stompRef.current) {
        console.log('🔌 JWT 인증 WebSocket 연결 정리 중...');
        try {
          stompRef.current.deactivate();
        } catch (e) {
          console.error('WebSocket 정리 중 오류:', e);
        }
        stompRef.current = null;
      }
    };
  }, [roomId, myId]); // 의존성 최소화로 중복 연결 방지

  /* ---------- 재시도 기능 ---------- */
  const handleRetryConnection = () => {
    setConnectionStatus("connecting");
    // WebSocket 연결 useEffect를 다시 트리거하기 위해 roomId를 재설정
    const currentRoomId = roomId;
    setRoomId(null);
    setTimeout(() => setRoomId(currentRoomId), 100);
  };

  /* ---------- 수락 ---------- */
  const handleAccept = async () => {
    if (!acceptHandler) return;
    setIsProcessing(true);

    try {
      const ret = await acceptHandler(chatRequestData.requestId);

      let rid =
        (typeof ret === "string" && ret) ||
        (ret && ret.roomId) ||
        chatRequestData.roomId ||
        null;

      if (!rid) {
        const rooms = await listChatRooms();
        rid = pickRoomIdForRequest(rooms, chatRequestData);
      }

      if (!rid) {
        alert("채팅방을 찾지 못했습니다. 다시 시도해주세요.");
        return;
      }

      setRoomId(rid);

      // 백엔드에 두 멤버 모두 참가 등록 (가능 시)
      try {
        if (myMemberIdRaw != null) {
          await joinRoom(Number(rid), Number(myMemberIdRaw));
        }
      } catch (joinError) {
        console.warn("내 참가 등록 실패(무시):", joinError);
      }

      try {
        if (otherMemberIdRaw != null) {
          await joinRoom(Number(rid), Number(otherMemberIdRaw));
        }
      } catch (joinError) {
        console.warn("상대 참가 등록 실패(무시):", joinError);
      }

      // 그룹챗 열기 이벤트 (togetherId로 전달하여 올바른 그룹채팅방 찾기)
      try {
        const togetherId = chatRequestData.togetherId || chatRequestData.postId || chatRequestData.requestId;
        console.log('그룹채팅 열기: togetherId =', togetherId);
        window.dispatchEvent(
          new CustomEvent("open-group-chat", { detail: { togetherId: togetherId } })
        );
      } catch (error) {
        console.error('그룹챗 열기 이벤트 오류:', error);
      }

      // 페이지 이동
      if (typeof window !== "undefined") {
        if (window.location.pathname !== "/mypage/together-manage") {
          setTimeout(() => {
            window.location.href = "/mypage/together-manage";
          }, 80);
        }
      }

      // 모달 닫기
      onClose && setTimeout(onClose, 160);
    } catch (e) {
      console.error("채팅 수락 중 오류:", e);
      alert("신청 처리에 실패했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  /* ---------- 거절/취소 ---------- */
  const handleReject = async () => {
    if (!rejectHandler) return;
    setIsProcessing(true);
    try {
      await rejectHandler(chatRequestData.requestId);
    } finally {
      setIsProcessing(false);
    }
  };

  /* ---------- 전송 ---------- */
  const handleSendMessage = () => {
    console.log("=== 메시지 전송 디버깅 ===");
    console.log("roomId:", roomId);
    console.log("myMemberIdRaw:", myMemberIdRaw);
    console.log("STOMP connected:", stompRef.current?.connected);
    console.log("message:", newMessage.trim());

    const msg = newMessage.trim();
    if (!msg) return;

    if (!roomId) {
      alert("채팅방 정보(roomId)가 없습니다. 수락 또는 방 생성 후 전송하세요.");
      return;
    }
    if (!myMemberIdRaw) {
      alert("내 사용자 ID를 확인할 수 없습니다. 다시 시도해주세요.");
      return;
    }
    if (stompRef.current && stompRef.current.connected) {
      stompRef.current.publish({
        destination: pubDestination(roomId),
        body: JSON.stringify({
          roomId: Number(roomId),
          senderId: Number(myMemberIdRaw),
          content: msg,
        }),
      });

      // 낙관적 업데이트 제거: 서버 응답을 통한 실시간 구독으로만 메시지 표시
      console.log('메시지 전송 완료, 서버 응답 대기 중...');
    } else {
      alert("채팅 서버 연결이 끊어졌습니다. 새로고침 후 다시 시도해주세요.");
      return;
    }
    setNewMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /* ---------- 헤더(상대 정보) ---------- */
  const friendData = {
    id: otherUser.id,
    name: otherUser.name,
    profileImage: otherUser.profileImage,
    location: "위치 정보 없음",
    age: 0,
    interests: [],
    status: "온라인",
    introduction: "한줄 자기소개",
  };

  /* ---------- UI ---------- */
  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 flex-shrink-0">
        <FriendListItem friend={friendData} onClick={onFriendClick} />
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          aria-label="close">
          <svg
            className="w-6 h-6 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* 받은함에서 대기중일 때만 수락/거절 버튼 노출 */}
      {chatRequestData.status === "pending" && !isFromSentBox && (
        <div className="border-b border-gray-200 p-3 flex gap-2">
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:bg-gray-100">
            {isProcessing ? "처리 중..." : "거절"}
          </button>
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300">
            {isProcessing ? "처리 중..." : "수락"}
          </button>
        </div>
      )}

      {/* 메시지 */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        {/* 연결 오류 시 오버레이 */}
        {connectionStatus === "error" && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
            <div className="text-center p-6">
              <div className="mb-4">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">채팅방에 연결할 수 없습니다</p>
              <p className="text-sm text-gray-500 mb-4">
                네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요
              </p>
              <button
                onClick={handleRetryConnection}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* 연결 중일 때 메시지 영역 투명도 조정 */}
        <div className={`space-y-2 ${connectionStatus === "connecting" ? "opacity-50" : ""}`}>
          {messages.map((msg) => {
            const mine =
              String(msg.sender) === myId || String(msg.sender) === "me";
            return (
              <div
                key={msg.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    mine ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                  }`}>
                  {msg.isInitial && (
                    <div className="text-xs opacity-75 mb-1">
                      {isFromSentBox ? "보낸 동행 신청" : "받은 동행 신청"}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.message}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      mine ? "text-blue-100" : "text-gray-500"
                    }`}>
                    {new Date(msg.timestamp).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* 연결 중 상태 표시 */}
        {connectionStatus === "connecting" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white px-4 py-2 rounded-lg shadow-md flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-blue-500 animate-spin"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm text-gray-600">채팅방을 준비하는 중...</span>
            </div>
          </div>
        )}
      </div>

      {/* 입력/액션 */}
      <div className="border-t border-gray-200 p-3 flex-shrink-0">
        <div className="relative">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              connectionStatus === "connected"
                ? "메시지를 입력하세요... (Shift+Enter 줄바꿈)"
                : connectionStatus === "connecting"
                ? "채팅방에 연결하는 중..."
                : "채팅방에 연결되지 않음"
            }
            disabled={connectionStatus !== "connected"}
            className={`w-full resize-none border rounded-lg px-3 py-2 pr-16 outline-none scrollbar-hide ${
              connectionStatus === "connected"
                ? "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                : "border-gray-200 bg-gray-50 text-gray-400"
            }`}
            rows={2}
          />
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || connectionStatus !== "connected"}
            className="absolute bottom-2 right-2 px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 disabled:bg-gray-300">
            전송
          </button>
        </div>
      </div>
    </div>
  );
}
