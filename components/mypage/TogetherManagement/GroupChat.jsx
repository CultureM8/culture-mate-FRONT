"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FriendProfileSlide from "@/components/mypage/FriendProfileSlide";
import { WS_ENDPOINT, subDestination, pubDestination } from "@/lib/chatClient";
import { createAuthenticatedStompClient } from "@/lib/websocket-jwt-patch";
import { getChatRoom, getChatMessages } from "@/lib/api/chatApi";
import { togetherApi } from "@/lib/api/togetherApi";
import { getProfileImageUrl } from "@/lib/utils/imageUtils";

/**
 * props:
 * - groupData: { togetherId, roomId?, id?, groupName?, participants?, authorId?, hostId? }
 * - currentUserId: string|number (필수)
 * - currentUserName?: string
 * - onClose: () => void
 *
 * NOTE: groupData.id나 groupData.togetherId는 Together ID이고,
 *       실제 채팅방의 roomId는 서버에서 조회해야 함
 */
export default function GroupChat({
  groupData,
  currentUserId,
  currentUserName = "사용자",
  onClose,
}) {
  const {
    roomId,           // 서버에서 제공하는 실제 ChatRoom ID
    togetherId,       // Together ID (명시적으로 사용)
    groupName: groupTitle = "단체 채팅",
    participants: seedFromProps = [],
    authorId,
    hostId,
  } = groupData ?? {};

  // 디버깅: props 값 확인

  // 실제 채팅방 roomId 상태 관리 - roomId가 togetherId와 같으면 null로 초기화
  const [actualRoomId, setActualRoomId] = useState(
    roomId && roomId !== togetherId ? roomId : null
  );
  const [roomLoading, setRoomLoading] = useState(!actualRoomId && togetherId); // actualRoomId가 없고 togetherId가 있으면 로딩

  // 작성자 ID 결정
  const effectiveAuthorId = authorId || hostId || null;

  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // 참가자
  const [participants, setParticipants] = useState(() =>
    ensureMeAndHost(
      normalizeParticipants(seedFromProps),
      currentUserId,
      currentUserName,
      effectiveAuthorId
    )
  );

  const [showParticipantsPanel, setShowParticipantsPanel] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileTarget, setProfileTarget] = useState(null);

  // 내부 ref
  const clientRef = useRef(null);
  const unsubRef = useRef(null);
  const queueRef = useRef([]); // 연결 전 임시 큐
  const msgIdsRef = useRef(new Set()); // id 중복 방지
  const msgSigsRef = useRef(new Set()); // ★ 내용+보낸이+시간 서명 중복 방지
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  /* ---------- 스크롤 자동화 (TogetherRequestChat 패턴) ---------- */
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // 메시지가 변경될 때마다 아래로 스크롤 (TogetherRequestChat 패턴)
  useEffect(() => {
    // 짧은 지연 후 스크롤 (DOM 업데이트 완료 후)
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // 기존 messagesEndRef 스크롤은 제거 (messagesContainerRef 사용)

  // togetherId로 실제 채팅방 정보 가져오기
  useEffect(() => {
    async function fetchChatRoom() {
      if (!togetherId || actualRoomId) {
        return; // 이미 roomId가 있으면 패스
      }

      try {
        setRoomLoading(true);
        const chatRoomData = await togetherApi.getChatroom(togetherId);
        setActualRoomId(chatRoomData.id); // 실제 채팅방 ID 설정
      } catch (error) {
        console.error('채팅방 정보 가져오기 오류:', error);
      } finally {
        setRoomLoading(false);
      }
    }

    fetchChatRoom();
  }, [togetherId, actualRoomId]);

  const participantsMap = useMemo(() => {
    const m = new Map();
    for (const p of participants) m.set(String(p.id), p);
    return m;
  }, [participants]);

  const isMine = (id) =>
    String(id) === String(currentUserId) || String(id) === "me";

  // ---------- props 시드 반영(방 바뀔 때 1회) ----------
  useEffect(() => {
    const seeded = ensureMeAndHost(
      normalizeParticipants(seedFromProps),
      currentUserId,
      currentUserName,
      effectiveAuthorId
    );
    if (seeded.length) setParticipants(seeded);
  }, [actualRoomId, currentUserId, currentUserName, effectiveAuthorId]); // eslint-disable-line

  // ---------- 초기 로드(상세/히스토리) ----------
  useEffect(() => {
    if (!actualRoomId) {
      setConnected(false);
      setMessages([]);
      msgIdsRef.current.clear();
      msgSigsRef.current.clear();
      setParticipants((prev) =>
        ensureMeAndHost(prev, currentUserId, currentUserName, effectiveAuthorId)
      );
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        // Together 참가자 정보 로드 (승인된 참가자들만)
        try {
          const { getParticipants } = await import('@/lib/api/togetherApi');
          const participantsData = await getParticipants(togetherId, 'APPROVED'); // APPROVED + HOST 모두 조회

          const fromTogether = participantsData.map(member => ({
            id: String(member.id || member.memberId),
            name: member.nickname || member.userName || member.loginId || String(member.id),
            nickname: member.nickname,
            displayName: member.nickname,
            avatar: getProfileImageUrl(member.thumbnailImagePath || member.memberDetail?.profileImage)
          }));

          setParticipants((prev) =>
            ensureMeAndHost(
              mergeParticipants(prev, fromTogether),
              currentUserId,
              currentUserName,
              effectiveAuthorId
            )
          );
        } catch (error) {
          console.error('🔴 Together 참가자 로드 실패:', error);
          console.error('🔴 togetherId:', togetherId);
          console.error('🔴 에러 상세:', error.message, error.stack);
          // 무시(서버 연결 실패 등)
        }

        // 히스토리 로드 (TogetherRequestChat 방식으로 직접 fetch)
        try {
          console.log('📜 채팅 히스토리 로딩 시작...', actualRoomId);

          // chatApi를 사용한 메시지 조회
          const result = await getChatMessages(actualRoomId);
          const historyMessages = result.content || result || [];

          if (Array.isArray(historyMessages)) {
            const norm = normalizeMessages(historyMessages);

            // 중복셋 초기화 & 등록 (id + 서명)
            msgIdsRef.current.clear();
            msgSigsRef.current.clear();
            for (const m of norm) {
              msgIdsRef.current.add(String(m.id));
              msgSigsRef.current.add(makeMessageSig(m));
            }

            // 시간순 정렬
            norm.sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
            setMessages(norm);

            console.log(`✅ 채팅 히스토리 로드 완료: ${norm.length}개`);
          }
        } catch (historyError) {
          console.warn('⚠️ 채팅 히스토리 로드 실패 (기존 방식으로 fallback):', historyError);

          // fallback: 기존 방식
          try {
            const raw = await getChatMessages(Number(actualRoomId));
            if (cancelled) return;
            const norm = normalizeMessages(raw);

            // 중복셋 초기화 & 등록 (id + 서명)
            msgIdsRef.current.clear();
            msgSigsRef.current.clear();
            for (const m of norm) {
              msgIdsRef.current.add(String(m.id));
              msgSigsRef.current.add(makeMessageSig(m));
            }

            // 시간순 정렬
            norm.sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
            setMessages(norm);
          } catch (fallbackError) {
            console.warn("히스토리 로드 완전 실패:", fallbackError);
          }
        }
      } catch (e) {
        console.warn("초기 로드 실패", {
          message: e?.message,
          status: e?.status,
          url: e?.url,
          body: e?.body,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [actualRoomId, currentUserId, currentUserName, effectiveAuthorId]);

  // ---------- JWT 인증 STOMP 연결 ----------
  useEffect(() => {
    if (!actualRoomId) return;

    let alive = true;
    setConnected(false);

    const initializeAuthenticatedWebSocket = async () => {
      try {

        // JWT 인증된 STOMP 클라이언트 생성
        const client = createAuthenticatedStompClient(WS_ENDPOINT);

        // 연결 성공 핸들러
        client.onConnect = () => {
          if (!alive) {
            client?.deactivate?.();
            return;
          }

          setConnected(true);

          // 실시간 메시지 구독
          const subscription = client.subscribe(subDestination(actualRoomId), (frame) => {
            try {
              const body = JSON.parse(frame.body);
              const n = normalizeMessages([body]);
              if (!n.length) return;

              // ★ id + 서명 기반 de-dupe
              const fresh = n.filter((m) => {
                const idKey = String(m.id);
                const sig = makeMessageSig(m);
                if (msgIdsRef.current.has(idKey) || msgSigsRef.current.has(sig))
                  return false;
                msgIdsRef.current.add(idKey);
                msgSigsRef.current.add(sig);
                return true;
              });
              if (!fresh.length) return;

              setMessages((prev) => {
                const next = [...prev, ...fresh];
                next.sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
                return next;
              });
            } catch (e) {
              console.error("GroupChat 메시지 파싱 오류:", e);
            }
          });

          clientRef.current = client;
          unsubRef.current = () => {
            try {
              subscription?.unsubscribe();
            } catch {}
            try {
              client?.deactivate();
            } catch {}
          };

          // 지연 전송 처리 (TogetherRequestChat에는 없는 기능이지만 유지)
          const q = [...queueRef.current];
          queueRef.current = [];
          q.forEach((body) => {
            try {
              client.publish({
                destination: pubDestination(actualRoomId),
                body: JSON.stringify(body),
                headers: { "content-type": "application/json" },
              });
            } catch {}
          });
        };

        // JWT 관련 오류 핸들러
        client.onStompError = (frame) => {
          if (!alive) return;
          setConnected(false);
          if (frame.headers.message?.includes('JWT') ||
              frame.headers.message?.includes('토큰') ||
              frame.headers.message?.includes('인증')) {
            console.error('GroupChat JWT 인증 오류 - 로그인 상태 확인 필요');
          }
        };

        client.onWebSocketError = (event) => {
          if (!alive) return;
          setConnected(false);
        };

        // 연결 시작
        client.activate();

      } catch (error) {
        console.error('GroupChat WebSocket 초기화 실패:', error);
        if (!alive) return;
        setConnected(false);
        if (error.message?.includes('JWT') || error.message?.includes('토큰')) {
          console.error('GroupChat JWT 토큰 없음 - 로그인 필요');
        }
      }
    };

    initializeAuthenticatedWebSocket();

    return () => {
      alive = false;
      try {
        unsubRef.current?.();
      } catch {}
      try {
        clientRef.current?.deactivate();
      } catch {}
      unsubRef.current = null;
      clientRef.current = null;
      setConnected(false);
    };
  }, [actualRoomId]);

  // ---------- 전송 (TogetherRequestChat 방식과 동일) ----------
  const handleSend = () => {

    const text = newMessage.trim();
    if (!text) return;

    if (actualRoomId == null || actualRoomId === undefined || actualRoomId === "") {
      console.warn("actualRoomId missing:", { actualRoomId, groupData });
      alert(
        "채팅방 정보(roomId)가 없습니다. 방을 먼저 연 뒤 다시 시도해주세요."
      );
      return;
    }

    // 숫자 Member ID 보장
    const senderNumericId = Number(currentUserId);
    if (!Number.isFinite(senderNumericId)) {
      alert(
        "내 사용자 ID(currentUserId)가 올바르지 않습니다. 다시 로그인하거나 새로고침 후 시도해주세요."
      );
      return;
    }

    // 연결 상태 확인
    if (!clientRef.current || !clientRef.current.connected) {
      alert("채팅 서버 연결이 끊어졌습니다. 새로고침 후 다시 시도해주세요.");
      return;
    }

    // TogetherRequestChat과 동일한 전송 방식
    try {
      clientRef.current.publish({
        destination: pubDestination(actualRoomId),
        body: JSON.stringify({
          roomId: Number(actualRoomId),
          senderId: senderNumericId,
          content: text,
        }),
        headers: { "content-type": "application/json" },
      });


      // 낙관적 업데이트 제거: 서버 응답을 통한 실시간 구독으로만 메시지 표시
      // (TogetherRequestChat과 동일한 방식)
    } catch (error) {
      console.error("GroupChat 메시지 전송 실패:", error);
      alert("메시지 전송에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    setNewMessage("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ---------- 프로필 ----------
  const openProfile = (person) => {
    if (!person) return;
    setProfileTarget(person);
    setProfileOpen(true);
  };
  const closeProfile = () => {
    setProfileOpen(false);
    setProfileTarget(null);
  };

  const headerPreview = useMemo(() => {
    const names = (participants || []).map((p) => p.name);
    return names.slice(0, 3).join(", ") + (names.length > 3 ? " 외" : "");
  }, [participants]);

  return (
    <div
      className="relative flex flex-col h-full"
      style={{ overflow: "hidden" }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex -space-x-2">
            {(participants || []).slice(0, 5).map((p) => (
              <img
                key={p.id}
                src={getProfileImageUrl(p.avatar)}
                alt={p.name}
                className="w-8 h-8 rounded-full border border-white object-cover"
              />
            ))}
          </div>
        </div>

        <div className="min-w-0 flex-1 px-3">
          <h2 className="font-medium text-gray-900 truncate">
            {String(groupTitle ?? "단체 채팅")}
          </h2>
          <button
            type="button"
            onClick={() => setShowParticipantsPanel(true)}
            className="text-xs text-gray-500 hover:underline">
            참가자 {(participants || []).length}명
            {(participants || []).length > 0 && (
              <span className="ml-1">· {headerPreview}</span>
            )}
          </button>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          aria-label="닫기">
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

      {/* 연결 상태 안내 */}
      <div className="px-3 py-1 text-center text-xs text-gray-500 border-b">
        {roomLoading
          ? "채팅방 정보 로딩 중..."
          : connected
            ? "연결됨"
            : "서버 준비 중… 입력하면 연결 후 전송됩니다"}
      </div>

      {/* 메시지 (TogetherRequestChat 패턴 적용) */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const sid = String(msg.sender);
          const mine = isMine(sid);
          const author = participantsMap.get(sid);

          const showName = mine
            ? currentUserName || "나"
            : author?.name || author?.nickname || author?.displayName || msg.senderName || "사용자";
          const avatar = getProfileImageUrl(author?.avatar);

          return (
            <div
              key={msg.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[70%] sm:max-w-xs lg:max-w-md">
                <div
                  className={`flex items-center mb-1 ${
                    mine ? "justify-end" : "justify-start"
                  }`}>
                  {!mine && (
                    <img
                      src={avatar}
                      alt={showName}
                      className="w-6 h-6 rounded-full object-cover mr-2 cursor-pointer"
                      onClick={() =>
                        openProfile(
                          author || { id: sid, name: showName, avatar }
                        )
                      }
                    />
                  )}
                  <span
                    className="text-xs text-gray-500 cursor-pointer hover:underline"
                    onClick={() =>
                      openProfile(author || { id: sid, name: showName, avatar })
                    }>
                    {showName}
                    {author?.isHost && (
                      <span className="ml-1 inline-block px-1.5 py-0.5 text-[10px] rounded bg-yellow-100 text-yellow-700 border border-yellow-200 align-middle">
                        호스트
                      </span>
                    )}
                  </span>
                  {mine && (
                    <img
                      src={avatar}
                      alt={showName}
                      className="w-6 h-6 rounded-full object-cover ml-2 cursor-pointer"
                      onClick={() =>
                        openProfile(
                          author || { id: sid, name: showName, avatar }
                        )
                      }
                    />
                  )}
                </div>

                <div
                  className={`px-4 py-2 rounded-lg break-words whitespace-pre-wrap ${
                    mine
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}>
                  <p className="text-sm">{msg.message}</p>
                  <p
                    className={`text-[11px] mt-1 ${
                      mine ? "text-blue-100" : "text-gray-500"
                    }`}>
                    {new Date(msg.timestamp).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 */}
      <div className="border-t border-gray-200 p-3 flex-shrink-0">
        <div className="relative">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
            className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 pr-16 focus:ring-blue-500 focus:border-blue-500 outline-none scrollbar-hide"
            rows={2}
          />
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="absolute bottom-2 right-2 px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 disabled:bg-gray-300">
            전송
          </button>
        </div>
      </div>

      {/* 참가자 패널 */}
      {showParticipantsPanel && (
        <ParticipantsPanel
          participants={participants}
          onClose={() => setShowParticipantsPanel(false)}
          onClick={openProfile}
        />
      )}

      {/* 프로필 슬라이드 */}
      {profileOpen && profileTarget && (
        <ProfileOverlay person={profileTarget} onClose={closeProfile} />
      )}
    </div>
  );
}

/* ======= UI 조각 ======= */
function ParticipantsPanel({ participants, onClose, onClick }) {
  return (
    <div className="absolute inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full bg-white shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <div className="text-lg font-semibold">참가자</div>
            <div className="text-sm text-gray-500">{participants.length}명</div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors">
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

        <div className="divide-y">
          {participants.map((p) => (
            <button
              key={p.id}
              onClick={() => onClick(p)}
              className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
              <img
                src={getProfileImageUrl(p.avatar)}
                alt={p.name}
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  {p.name}
                  {p.isHost && (
                    <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] rounded bg-yellow-100 text-yellow-700 border border-yellow-200 align-middle">
                      호스트
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileOverlay({ person, onClose }) {
  return (
    <div className="absolute inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 bg-white">
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={onClose}
            className="p-2 bg-white hover:bg-gray-100 rounded-full shadow-md transition-colors duration-200">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
        <FriendProfileSlide
          friend={person}
          isVisible={true}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

/* ================== 헬퍼 ================== */

// 메시지 서명: 보낸이 | 5초단위 시간 | 정규화한 내용
function makeMessageSig(m) {
  const sender = String(m.sender ?? m.senderId ?? m.userId ?? "");
  const text = String(m.message ?? m.content ?? "")
    .replace(/\s+/g, " ")
    .trim();
  const t = new Date(m.timestamp ?? m.createdAt ?? m.createAt ?? Date.now());
  const bucket5s = Number.isFinite(t.getTime())
    ? Math.floor(t.getTime() / 5000)
    : 0;
  return `${sender}|${bucket5s}|${text}`;
}

function normalizeParticipants(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((x) => {
      const id =
        x?.id ??
        x?.memberId ??
        x?.participantId ??
        x?.member?.id ??
        x?.participant?.id;
      if (id == null) return null;

      const name =
        x?.display_name ||
        x?.nickname ||
        x?.member?.memberDetail?.nickname ||
        x?.name ||
        x?.member?.loginId ||
        x?.loginId ||
        String(id);

      return {
        id: String(id),
        name,
        avatar: getProfileImageUrl(
          x?.avatar ||
          x?.profileImage ||
          x?.member?.memberDetail?.profileImage
        ),
        isHost: !!x?.isHost,
      };
    })
    .filter(Boolean);
}

function parseParticipants(detail) {
  if (!detail || typeof detail !== "object") return [];
  const out = [];

  const host =
    detail.host || detail?.together?.host || detail.owner || detail.createdBy;
  if (host) {
    const hostId =
      host?.id ?? host?.member?.id ?? host?.memberId ?? host?.hostId;
    if (hostId != null) {
      out.push({
        id: String(hostId),
        name:
          host?.display_name ||
          host?.nickname ||
          host?.memberDetail?.nickname ||
          host?.name ||
          host?.loginId ||
          String(hostId),
        avatar: getProfileImageUrl(
          host?.profileImage ||
          host?.memberDetail?.profileImage
        ),
        isHost: true,
      });
    }
  }

  const arrays =
    detail.participants ||
    detail?.together?.participants ||
    detail.chatMembers ||
    detail.members ||
    [];

  for (const row of arrays) {
    const mem = row?.participant || row?.member || row;
    const id = mem?.id ?? row?.id ?? row?.memberId ?? row?.participantId;
    if (id == null) continue;

    out.push({
      id: String(id),
      name:
        mem?.display_name ||
        mem?.nickname ||
        mem?.memberDetail?.nickname ||
        mem?.name ||
        mem?.loginId ||
        String(id),
      avatar: getProfileImageUrl(
        mem?.profileImage ||
        mem?.memberDetail?.profileImage
      ),
      isHost: false,
    });
  }

  return out;
}

function mergeParticipants(a = [], b = []) {
  const m = new Map();
  [...a, ...b].forEach((p) => {
    const k = String(p.id);
    const prev = m.get(k);
    m.set(k, { ...(prev || {}), ...p });
  });
  let hostSeen = false;
  const arr = [];
  for (const p of m.values()) {
    if (p.isHost) {
      if (hostSeen) arr.push({ ...p, isHost: false });
      else {
        hostSeen = true;
        arr.push(p);
      }
    } else arr.push(p);
  }
  return arr;
}

// 작성자/나를 확실히 포함
function ensureMeAndHost(list = [], meId, meName = "사용자", authorId = null) {
  let out = Array.isArray(list) ? [...list] : [];


  if (!meId) {
    return out.length > 0
      ? out
      : [
          {
            id: "default",
            name: "사용자",
            avatar: "/img/default_img.svg",
            isHost: true,
          },
        ];
  }

  const myId = String(meId);
  const hostId = authorId ? String(authorId) : null;

  // 내가 호스트인 경우 (모든 참가자 포함, 나를 호스트로 표시)
  if (hostId && myId === hostId) {
    let hasMe = false;
    out = out.map((p) => {
      if (String(p.id) === myId) {
        hasMe = true;
        return { ...p, isHost: true, name: meName || p.name };
      }
      return { ...p, isHost: false };
    });

    // 내가 목록에 없으면 추가
    if (!hasMe) {
      out.push({
        id: myId,
        name: meName,
        avatar: "/img/default_img.svg",
        isHost: true,
      });
    }

    return out;
  }

  // 다른 사람이 호스트인 경우 (작성자 + 나)
  if (hostId && myId !== hostId) {
    let hasHost = false;
    out = out.map((p) => {
      if (String(p.id) === hostId) {
        hasHost = true;
        return { ...p, isHost: true };
      }
      return { ...p, isHost: false };
    });

    if (!hasHost) {
      out.unshift({
        id: hostId,
        name: hostName,
        avatar: "/img/default_img.svg",
        isHost: true,
      });
    }

    const meIndex = out.findIndex((p) => String(p.id) === myId);
    if (meIndex === -1) {
      out.push({
        id: myId,
        name: meName,
        avatar: "/img/default_img.svg",
        isHost: false,
      });
    } else {
      out[meIndex] = { ...out[meIndex], name: meName };
    }

    return out;
  }

  // authorId가 없는 경우 기본 보정
  if (!out.some((p) => p.isHost)) {
    if (out.length) {
      const first = out[0];
      out[0] = { ...first, isHost: true, name: first.name || "사용자" };
    } else {
      out.push({
        id: "host",
        name: "사용자",
        avatar: "/img/default_img.svg",
        isHost: true,
      });
    }
  }

  // 나 확인/추가
  const k = String(meId);
  const i = out.findIndex((p) => String(p.id) === k);
  if (i === -1) {
    out.push({
      id: k,
      name: meName || String(meId) || "사용자",
      avatar: "/img/default_img.svg",
      isHost: false,
    });
  } else {
    const cur = out[i];
    out[i] = { ...cur, name: meName || cur.name || String(meId) || "사용자" };
  }


  return out;
}

// 다양한 백엔드 스키마를 흡수
function normalizeMessages(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList.map((m, idx) => {
    const id =
      m.id ??
      m.messageId ??
      `${m.memberId ?? m.senderId ?? m.userId ?? "unknown"}-${
        m.createAt ?? m.createdAt ?? m.timestamp ?? Date.now()
      }-${idx}`;

    const senderId =
      m.memberId ??
      m.senderId ??
      m.userId ??
      m.fromUserId ??
      m.authorId ??
      m.sender ??
      "unknown";

    const senderName =
      m.senderName ?? m.userName ?? m.fromUserName ?? m.authorName ?? "";

    const content = m.content ?? m.message ?? m.text ?? "";

    const ts = m.createAt ?? m.createdAt ?? m.timestamp ?? Date.now();

    return {
      id: String(id),
      sender: String(senderId),
      senderName,
      message: String(content),
      timestamp: new Date(ts),
    };
  });
}
