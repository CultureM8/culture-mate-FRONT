"use client";

import { useMemo, useState, useEffect, useContext } from "react";
import TogetherList from "@/components/together/TogetherList";
import GroupChat from "@/components/mypage/TogetherManagement/GroupChat";
import { listChatRooms, getChatRoom, joinRoom } from "@/lib/chatApi";
import { LoginContext } from "@/components/auth/LoginProvider";
import { loadPosts } from "@/lib/storage";
import { getChatRequestsFromUser } from "@/lib/chatRequestUtils";
import { pickReadableName } from "@/lib/nameUtils";

export default function MyTogether({
  togetherCard = [],
  externalRoomId = null,
  currentUserId = null,
  currentUserName = null,
}) {
  // LoginContext 기반 파생값
  const {
    uid: ctxUid,
    displayName: ctxDisplayName,
    user: ctxUser,
  } = useContext(LoginContext);

  const effectiveUserId =
    currentUserId ??
    ctxUid ??
    ctxUser?.id ??
    ctxUser?.user_id ??
    ctxUser?.login_id ??
    null;

  const effectiveLoginId = ctxUser?.login_id ?? ctxUser?.loginId ?? null;

  const effectiveUserName =
    currentUserName ??
    ctxDisplayName ??
    (effectiveUserId != null ? String(effectiveUserId) : "사용자");

  // 필터: host | guest
  const [roleFilter, setRoleFilter] = useState("host");

  // 좌측 리스트/슬라이드
  const [selectedTogether, setSelectedTogether] = useState(null);
  const [isSlideVisible, setIsSlideVisible] = useState(false);
  const [forcedRoomId, setForcedRoomId] = useState(null);

  // 호스트/게스트 데이터
  const [hostItems, setHostItems] = useState([]);
  const [guestItems, setGuestItems] = useState([]);

  // 카드 클릭
  const handleTogetherListClick = (item) => {
    setSelectedTogether(item);
    setIsSlideVisible(true);
  };

  const handleSlideClose = () => {
    setIsSlideVisible(false);
  };

  // 외부에서 roomId 직접 열기
  useEffect(() => {
    if (!externalRoomId) return;
    setForcedRoomId(externalRoomId);
    if (!selectedTogether) {
      setSelectedTogether({
        title: "그룹 채팅",
        togetherId: `room-${externalRoomId}`,
      });
    }
    setIsSlideVisible(true);
  }, [externalRoomId]);

  // 호스트 목록: 내가 작성한 동행(로컬 저장 글)
  useEffect(() => {
    try {
      const posts = loadPosts("together");
      const myUid = effectiveUserId != null ? String(effectiveUserId) : null;
      const myLogin = effectiveLoginId ? String(effectiveLoginId) : null;

      const mine = posts.filter((p) => {
        const a = (typeof p.author === "object" && p.author) || {};
        const uid =
          a.id != null
            ? String(a.id)
            : a.user_id != null
            ? String(a.user_id)
            : null;
        const login = p.author_login_id ?? a.login_id ?? null;

        const uidMatch = myUid && uid && myUid === uid;
        const loginMatch = myLogin && login && String(login) === myLogin;
        return uidMatch || loginMatch;
      });

      const mapped = mine.map((p) => ({
        togetherId: p.id,
        imgSrc:
          p.eventSnapshot?.eventImage ||
          p.eventSnapshot?.image ||
          p.eventSnapshot?.imgSrc ||
          "/img/default_img.svg",
        title: p.title || "모집글 제목",
        eventType: p.eventSnapshot?.eventType || "이벤트유형",
        eventName:
          p.eventSnapshot?.name || p.eventSnapshot?.title || "이벤트명",
        group: p.companionCount || p.maxPeople || 1,
        date:
          p.companionDate ||
          (p.createdAt
            ? new Date(p.createdAt).toLocaleDateString()
            : "0000.00.00"),
        address: p.eventSnapshot?.location || "",
        author: p.author,
        author_login_id: p.author_login_id,
      }));

      setHostItems(mapped);
    } catch (e) {
      console.warn("호스트 동행 로드 실패:", e);
      setHostItems([]);
    }
  }, [effectiveUserId, effectiveLoginId]);

  // 게스트 목록: 내가 보낸 신청 중 수락된 것
  useEffect(() => {
    try {
      if (!effectiveUserId) {
        setGuestItems([]);
        return;
      }

      const me = effectiveUserId != null ? String(effectiveUserId) : null;
      const sent = me ? getChatRequestsFromUser(me) : [];
      const accepted = sent.filter((r) => r.status === "accepted");

      const seen = new Set();
      const mapped = [];
      for (const r of accepted) {
        const tid = r.postId ?? r.togetherId ?? null;
        if (!tid || seen.has(String(tid))) continue;
        seen.add(String(tid));

        mapped.push({
          togetherId: tid,
          imgSrc: r.eventImage || r.imgSrc || "/img/default_img.svg",
          title: r.postTitle || "모집글 제목",
          eventType: r.eventType || "이벤트유형",
          eventName: r.eventName || "이벤트명",
          group: r.group || "",
          date: r.postDate || "0000.00.00",
          address: "",
          author_login_id: r.toUserId || "",
        });
      }
      setGuestItems(mapped);
    } catch (e) {
      console.warn("게스트 동행 로드 실패:", e);
      setGuestItems([]);
    }
  }, [effectiveUserId]);

  // ✅ RequestChat → "open-group-chat" 이벤트 수신해서 GroupChat 패널 열기
  useEffect(() => {
    const onOpenGroupChat = (e) => {
      const rid = e?.detail?.roomId;
      if (!rid) return;
      setForcedRoomId(rid);
      setIsSlideVisible(true);

      // 좌측 카드 미선택 상태라면 임시 선택값 세팅(레이아웃 변화 없음)
      if (!selectedTogether) {
        setSelectedTogether({
          title: "그룹 채팅",
          togetherId: `room-${rid}`,
        });
      }
    };
    window.addEventListener("open-group-chat", onOpenGroupChat);
    return () => window.removeEventListener("open-group-chat", onOpenGroupChat);
  }, [selectedTogether]);

  // 카드 클릭 시 roomId 탐색/생성
  useEffect(() => {
    if (!selectedTogether) return;
    if (forcedRoomId) return;
    const tgtId = selectedTogether.togetherId ?? selectedTogether.id;
    if (!tgtId) return;

    let stop = false;
    (async () => {
      try {
        const roomsRaw = await listChatRooms();
        const rooms = Array.isArray(roomsRaw)
          ? roomsRaw
          : roomsRaw?.data ||
            roomsRaw?.items ||
            roomsRaw?.list ||
            roomsRaw?.rooms ||
            [];

        // 1) 리스트에서 together 매칭
        for (const r of rooms) {
          if (r?.together?.id && String(r.together.id) === String(tgtId)) {
            if (!stop) setForcedRoomId(r.id ?? r.roomId);
            return;
          }
        }

        // 2) 상세 스캔
        for (const r of rooms) {
          const rid = r?.id ?? r?.roomId;
          if (!rid) continue;
          const detail = await getChatRoom(rid);
          const tid = detail?.together?.id ?? detail?.togetherId;
          if (String(tid) === String(tgtId)) {
            if (!stop) setForcedRoomId(rid);
            return;
          }
        }

        // 3) 없으면(선택) 생성 시도 — 모듈 없으면 그냥 패스
        try {
          const mod = await import("@/lib/chatApi");
          if (typeof mod.createChatRoom === "function") {
            const newRoom = await mod.createChatRoom(
              `${selectedTogether.title || "단체 채팅"} - ${tgtId}`
            );
            if (!stop && newRoom?.id) setForcedRoomId(newRoom.id);
          }
        } catch {
          /* 생성 API 미제공 환경이면 무시 */
        }
      } catch (error) {
        console.warn("채팅방 생성/탐색 실패:", error);
        if (!stop) {
          setForcedRoomId(tgtId); // 임시 폴백
        }
      }
    })();

    return () => {
      stop = true;
    };
  }, [selectedTogether, forcedRoomId]);

  // GroupChat에 넘길 데이터
  const groupData = useMemo(() => {
    const rid =
      forcedRoomId ??
      selectedTogether?.roomId ??
      selectedTogether?.chatRoomId ??
      selectedTogether?.groupRoomId ??
      selectedTogether?.togetherRoomId ??
      null;

    // 작성자(호스트) ID/이름
    const hostIdRaw =
      selectedTogether?.author?.id ??
      selectedTogether?.authorId ??
      selectedTogether?.author?.user_id ??
      selectedTogether?.author_login_id ??
      selectedTogether?.author?.login_id ??
      null;

    const hostName = pickReadableName(
      selectedTogether?.author?.memberDetail?.nickname,
      selectedTogether?.author?.nickname,
      selectedTogether?.author?.login_id,
      selectedTogether?.author_login_id
    );

    const meName = pickReadableName(effectiveUserName);

    const participantsSeed = [
      effectiveUserId && {
        id: String(effectiveUserId),
        name: meName,
        avatar: "/img/default_img.svg",
        isHost: false,
      },
      hostIdRaw && {
        id: String(hostIdRaw),
        name: hostName || "작성자",
        avatar: "/img/default_img.svg",
        isHost: true,
      },
    ].filter(Boolean);

    if (!rid) {
      const fallbackRoomId =
        selectedTogether?.togetherId ?? selectedTogether?.id;
      return {
        roomId: fallbackRoomId,
        groupName: selectedTogether?.title ?? "단체 채팅",
        participants: participantsSeed,
        authorId: hostIdRaw,
      };
    }
    return {
      roomId: rid,
      groupName: selectedTogether?.title ?? "단체 채팅",
      participants: participantsSeed,
      authorId: hostIdRaw,
    };
  }, [forcedRoomId, selectedTogether, effectiveUserId, effectiveUserName]);

  // 현재 필터에 맞는 리스트
  const listToRender =
    roleFilter === "host"
      ? hostItems.length
        ? hostItems
        : togetherCard
      : guestItems;

  return (
    <>
      {/* 상단: 호스트/게스트 필터 */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-[#76787a]">
          {roleFilter === "host"
            ? "내가 작성한 동행"
            : "내가 게스트로 참여한 동행"}
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs px-2 py-2 border border-gray-300 rounded-lg bg-white text-[#26282a] focus:outline-none focus:border-[#26282a] min-w-[140px]">
          <option value="host">호스트 동행</option>
          <option value="guest">게스트 동행</option>
        </select>
      </div>

      <div className="flex gap-0 max-h:[800px] min-h:[600px]">
        {/* 좌측: 동행 카드 리스트 */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isSlideVisible ? "w-1/2" : "w-full"
          }`}>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full">
            {Array.isArray(listToRender) && listToRender.length > 0 ? (
              <div className="space-y-0 overflow-y-auto h-full">
                {listToRender.map((item) => {
                  const isActive =
                    selectedTogether?.togetherId === item.togetherId;
                  return (
                    <div
                      key={item.togetherId ?? item.id}
                      className={`transition-colors duration-200 ${
                        isActive
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : "hover:bg-gray-50"
                      }`}>
                      <TogetherList
                        {...item}
                        onCardClick={() => handleTogetherListClick(item)}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-[#76787a]">
                  {roleFilter === "host"
                    ? "아직 내가 작성한 동행이 없습니다."
                    : "아직 수락된 게스트 동행이 없습니다."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 우측: GroupChat */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isSlideVisible ? "w-1/2" : "w-0"
          }`}>
          <div className="w-full h-full bg-white rounded-lg shadow-sm ml-2 flex flex-col">
            {isSlideVisible && (
              <GroupChat
                key={
                  groupData.roomId || selectedTogether?.togetherId || "gc-empty"
                }
                groupData={groupData}
                currentUserId={effectiveUserId}
                onClose={handleSlideClose}
                currentUserName={effectiveUserName}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
