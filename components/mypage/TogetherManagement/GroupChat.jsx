"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FriendProfileSlide from "@/components/mypage/FriendProfileSlide";
import { connectAndSubscribe, sendChat } from "@/lib/chatClient";
import { getChatRoom, getChatMessages } from "@/lib/chatApi";

/**
 * props:
 * - groupData: { roomId, id, groupName?, participants?, authorId?, hostId? }
 * - currentUserId: string|number (필수)
 * - currentUserName?: string
 * - onClose: () => void
 */
export default function GroupChat({
  groupData,
  currentUserId,
  currentUserName = "사용자",
  onClose,
}) {
  const {
    roomId: roomIdRaw,
    id: roomIdAlt,
    groupName: groupTitle = "단체 채팅",
    participants: seedFromProps = [],
    authorId,
    hostId,
  } = groupData ?? {};

  // 백/다른 호출부에서 id로 주는 경우까지 흡수
  const roomId = roomIdRaw ?? roomIdAlt ?? null;

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

  // 메시지 추가시 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
  }, [roomId, currentUserId, currentUserName, effectiveAuthorId]); // eslint-disable-line

  // ---------- 초기 로드(상세/히스토리) ----------
  useEffect(() => {
    if (!roomId) {
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
        // 방 상세(참가자 등) — 실패해도 치명적이지 않게
        try {
          const detail = await getChatRoom(Number(roomId));
          if (cancelled) return;
          const fromDetail = parseParticipants(detail);
          setParticipants((prev) =>
            ensureMeAndHost(
              mergeParticipants(prev, fromDetail),
              currentUserId,
              currentUserName,
              effectiveAuthorId
            )
          );
        } catch {
          // 무시(서버 스펙이 없을 수도 있음)
        }

        // 히스토리
        const raw = await getChatMessages(Number(roomId));
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
  }, [roomId, currentUserId, currentUserName, effectiveAuthorId]);

  // ---------- STOMP ----------
  useEffect(() => {
    if (!roomId) return;

    let alive = true;
    setConnected(false);

    connectAndSubscribe(roomId, (msg) => {
      const n = normalizeMessages([msg]);
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
    })
      .then(({ client, unsubscribe }) => {
        if (!alive) {
          unsubscribe?.();
          client?.deactivate?.();
          return;
        }
        clientRef.current = client;
        unsubRef.current = unsubscribe;
        setConnected(true);

        // 지연 전송
        const q = [...queueRef.current];
        queueRef.current = [];
        q.forEach((body) => {
          try {
            sendChat(clientRef.current, roomId, body);
          } catch {}
        });
      })
      .catch((err) => {
        console.warn("STOMP 연결 실패:", err);
        setConnected(false);
      });

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
  }, [roomId]);

  // ---------- 전송 ----------
  const handleSend = () => {
    const text = newMessage.trim();
    if (!text) return;

    if (roomId == null || roomId === undefined || roomId === "") {
      console.warn("roomId missing:", { roomId, groupData });
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

    const optimisticId =
      (typeof crypto !== "undefined" && crypto.randomUUID?.()) ||
      `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const payload = {
      roomId: Number(roomId),
      senderId: senderNumericId,
      content: text,
      createdAt: Date.now(),
      id: optimisticId,
    };

    // 낙관적 반영(중복셋 포함)
    msgIdsRef.current.add(String(optimisticId));
    msgSigsRef.current.add(
      makeMessageSig({
        sender: String(currentUserId),
        message: text,
        timestamp: Date.now(),
      })
    );

    setMessages((prev) => [
      ...prev,
      {
        id: optimisticId,
        sender: String(currentUserId),
        senderName: currentUserName,
        message: text,
        timestamp: new Date(),
      },
    ]);
    setNewMessage("");

    if (!clientRef.current) {
      queueRef.current.push(payload);
      return;
    }
    try {
      sendChat(clientRef.current, roomId, payload);
    } catch {
      queueRef.current.push(payload);
    }
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
                src={p.avatar || "/img/default_img.svg"}
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
        {connected ? "연결됨" : "서버 준비 중… 입력하면 연결 후 전송됩니다"}
      </div>

      {/* 메시지 */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-visible"
        style={{ height: "100%", scrollBehavior: "smooth" }}>
        {messages.map((msg) => {
          const sid = String(msg.sender);
          const mine = isMine(sid);
          const author = participantsMap.get(sid);
          const showName = mine
            ? currentUserName || "사용자"
            : author?.name || msg.senderName || "사용자";
          const avatar = author?.avatar || "/img/default_img.svg";

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
                src={p.avatar || "/img/default_img.svg"}
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
        avatar:
          x?.avatar ||
          x?.profileImage ||
          x?.member?.memberDetail?.profileImage ||
          "/img/default_img.svg",
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
        avatar:
          host?.profileImage ||
          host?.memberDetail?.profileImage ||
          "/img/default_img.svg",
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
      avatar:
        mem?.profileImage ||
        mem?.memberDetail?.profileImage ||
        "/img/default_img.svg",
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

  // 내가 호스트인 경우 (나 혼자만)
  if (hostId && myId === hostId) {
    const existing = out.find((p) => String(p.id) === myId);
    if (existing) {
      return [{ ...existing, isHost: true, name: meName || existing.name }];
    } else {
      return [
        {
          id: myId,
          name: meName,
          avatar: "/img/default_img.svg",
          isHost: true,
        },
      ];
    }
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
