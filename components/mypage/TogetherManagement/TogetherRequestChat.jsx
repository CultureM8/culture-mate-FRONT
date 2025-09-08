"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import FriendListItem from "@/components/mypage/FriendListItem";
import SockJS from "sockjs-client";
import { Client as StompClient } from "@stomp/stompjs";
import { listChatRooms, joinRoom } from "@/lib/chatApi";
import { WS_ENDPOINT, subDestination, pubDestination } from "@/lib/chatClient";

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

  const [roomId, setRoomId] = useState(
    roomIdProp || chatRequestData.roomId || null
  );
  const stompRef = useRef(null);
  const sentInitialRef = useRef(false);
  const messagesEndRef = useRef(null);

  /* ---------- 최초 1회: 신청 메시지 한 줄 렌더 ---------- */
  useEffect(() => {
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

    setMessages([
      {
        id: "initial-1",
        sender: initialSender,
        senderName: initialSenderName,
        message: chatRequestData.message || "메시지 없음",
        timestamp: new Date(chatRequestData.createdAt || Date.now()),
        isInitial: true,
      },
    ]);
  }, [chatRequestData, isFromSentBox, myId, myDisplayName]);

  /* ---------- 외부 roomId 반영 ---------- */
  useEffect(() => {
    if (roomIdProp && roomIdProp !== roomId) setRoomId(roomIdProp);
  }, [roomIdProp, roomId]);

  /* ---------- STOMP ---------- */
  useEffect(() => {
    if (!roomId) return;

    const sock = new SockJS(WS_ENDPOINT);
    const client = new StompClient({
      webSocketFactory: () => sock,
      reconnectDelay: 2000,
      onConnect: () => {
        client.subscribe(subDestination(roomId), (frame) => {
          try {
            const body = JSON.parse(frame.body);
            const senderId = String(body.senderId ?? "unknown");
            setMessages((prev) => [
              ...prev,
              {
                id: `srv-${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2, 6)}`,
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

        // 최초 1회: 신청 본문을 실제 방으로 전송 (있을 때만)
        if (!sentInitialRef.current && chatRequestData?.message && myId) {
          client.publish({
            destination: pubDestination(),
            body: JSON.stringify({
              roomId: Number(roomId),
              senderId: Number(myMemberIdRaw),
              content: chatRequestData.message,
            }),
          });
          sentInitialRef.current = true;
        }
      },
    });

    client.activate();
    stompRef.current = client;

    return () => {
      try {
        client.deactivate();
      } catch {}
      stompRef.current = null;
    };
  }, [
    roomId,
    chatRequestData,
    myId,
    myDisplayName,
    otherUser?.name,
    myMemberIdRaw,
  ]);

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

      // 그룹챗 열기 이벤트
      try {
        window.dispatchEvent(
          new CustomEvent("open-group-chat", { detail: { roomId: rid } })
        );
      } catch {}

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
        destination: pubDestination(),
        body: JSON.stringify({
          roomId: Number(roomId),
          senderId: Number(myMemberIdRaw),
          content: msg,
        }),
      });
    } else {
      alert("채팅 서버 연결이 끊어졌습니다. 새로고침 후 다시 시도해주세요.");
      return;
    }

    // 낙관적 반영
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        sender: String(myMemberIdRaw),
        senderName: myDisplayName,
        message: msg,
        timestamp: new Date(),
      },
    ]);
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

      {/* 메시지 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

      {/* 입력/액션 */}
      <div className="border-t border-gray-200 p-3 flex-shrink-0">
        {/* 받은함에서 대기중일 때만 수락/거절 노출 */}
        {chatRequestData.status === "pending" && !isFromSentBox && (
          <div className="flex gap-2 mb-3">
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

        <div className="relative">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요... (Shift+Enter 줄바꿈)"
            className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 pr-16 focus:ring-blue-500 focus:border-blue-500 outline-none scrollbar-hide"
            rows={2}
          />
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="absolute bottom-2 right-2 px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 disabled:bg-gray-300">
            전송
          </button>
        </div>
      </div>
    </div>
  );
}
