"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import TogetherList from "../../together/TogetherList";
import ListLayout from "../../global/ListLayout";
import SearchFilterSort from "../../global/SearchSort";
import EditSetting from "../../global/EditSetting";
import useLogin from "@/hooks/useLogin";
import { loadPosts, deletePost } from "@/lib/storage";
import { getChatRequestsFromUser } from "@/lib/chatRequestUtils";
import { togetherApi } from "@/lib/api/togetherApi";
import { getEventMainImageUrl } from "@/lib/utils/imageUtils";

/**내 동행 게스트카드 숨김 저장소*/
const hiddenKey = (userKey) => `history:hidden:together:${userKey}`;
const loadHiddenIds = (userKey) => {
  if (!userKey || typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(hiddenKey(userKey));
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
};
const saveHiddenIds = (userKey, set) => {
  if (!userKey || typeof window === "undefined") return;
  localStorage.setItem(hiddenKey(userKey), JSON.stringify(Array.from(set)));
};

export default function HistoryWith({ togetherData = [] }) {
  const { ready, isLogined, user } = useLogin();

  /* 로그인 유저 식별자 */
  const userIds = useMemo(() => {
    const arr = [
      user?.id,
      user?.user_id,
      user?.login_id,
      user?.loginId,
      user?.email,
    ]
      .map((v) => (v == null ? null : String(v).trim()))
      .filter(Boolean);
    return Array.from(new Set(arr));
  }, [user]);
  const userKey = userIds[0] || "anon";

  /* 숨김 상태 */
  const [hiddenIds, setHiddenIds] = useState(() => loadHiddenIds(userKey));
  useEffect(() => {
    setHiddenIds(loadHiddenIds(userKey));
  }, [userKey]);

  /* 호스트 글: 백엔드 API 우선, 실패 시 로컬스토리지 fallback */
  const [hostFromApi, setHostFromApi] = useState([]);
  const [rawPosts, setRawPosts] = useState([]); // fallback
  useEffect(() => {
    const arr = loadPosts("together") || [];
    setRawPosts(arr);
  }, []);
  useEffect(() => {
    // 로그인 사용자가 있으면 내 호스트 글을 API로 로드
    const myId = user?.id ?? user?.user_id ?? null; // loginId만 있는 경우엔 서버 스펙에 따라 변환 필요
    if (!isLogined || !myId) {
      setHostFromApi([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const list = await togetherApi.getByHost(myId);
        if (!cancelled) setHostFromApi(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!cancelled) setHostFromApi([]);
        console.warn("호스트 동행(API) 로드 실패, 로컬스토리지로 대체:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLogined, user]);

  /* 내가 쓴 글(호스트) 정규화 — 백엔드 Together 엔티티 */
  const normalizeHostApi = useCallback((t) => {
    if (!t) return null;
    const regionStr = t.region
      ? [t.region.level1, t.region.level2, t.region.level3]
          .filter(Boolean)
          .join(" ")
      : "";
    const meeting = t.meetingDate
      ? typeof t.meetingDate === "string"
        ? t.meetingDate.replace(/-/g, ".")
        : new Date(t.meetingDate).toLocaleDateString()
      : "";
    return {
      source: "host",
      isHost: true,
      togetherId: t.id,
      imgSrc: getEventMainImageUrl(t.event) || "/img/default_img.svg",
      alt: t.event?.title || t.event?.name || t.title || "",
      title: t.title || "",
      eventType: t.event?.eventType || "기타",
      eventName: t.event?.name || "",
      group: t.maxParticipants ?? 1,
      date: meeting,
      address: regionStr || t.meetingLocation || "",
      authorNickname: t.host?.nickname ?? null,
      authorLoginId: t.host?.loginId ?? null,
      authorObj: t.host ?? null,
      _createdAt: t.createdAt ?? null,
    };
  }, []);

  /* 호스트 동행 정규화 — 레거시(로컬스토리지 더미) */
  const normalizeHostLocal = useCallback((post) => {
    const a =
      post?.author && typeof post.author === "object" ? post.author : {};
    const imgSrc =
      post?.eventSnapshot?.eventImage ||
      post?.eventSnapshot?.imgSrc ||
      post?.eventSnapshot?.image ||
      "/img/default_img.svg";
    return {
      source: "host",
      isHost: true,
      togetherId: post.id,
      imgSrc,
      alt: post?.eventSnapshot?.name || post?.title || "",
      title: post?.title || "",
      eventType: post?.eventSnapshot?.eventType || post?.eventType || "기타",
      eventName:
        post?.eventSnapshot?.name ||
        post?.eventSnapshot?.eventName ||
        post?.eventName ||
        "",
      group: post?.companionCount ?? post?.maxPeople ?? 1,
      date:
        post?.companionDate || new Date(post?.createdAt).toLocaleDateString(),
      address: post?.eventSnapshot?.location || "",
      authorNickname: a?.nickname ?? post.author_nickname ?? null,
      authorLoginId: post.author_login_id ?? a?.login_id ?? null,
      authorObj: a,
      author: typeof post.author === "string" ? post.author : undefined,
      _createdAt: post?.createdAt || null,
    };
  }, []);

  /* 게스트 정규화 — 백엔드 API (getByMember) 응답 - MyTogether 방식과 동일 */
  const normalizeGuestApi = useCallback((item) => {
    if (!item) return null;

    const regionStr = item.region
      ? [item.region.level1, item.region.level2, item.region.level3]
          .filter(Boolean)
          .join(" ")
      : "";
    const meeting = item.meetingDate
      ? typeof item.meetingDate === "string"
        ? item.meetingDate.replace(/-/g, ".")
        : new Date(item.meetingDate).toLocaleDateString()
      : "";

    return {
      source: "guest",
      isHost: false,
      togetherId: item.id,
      imgSrc: item.event?.thumbnailImagePath || getEventMainImageUrl(item.event) || "/img/default_img.svg",
      alt: item.event?.title || item.event?.name || item.title || "",
      title: item.title || "모집글 제목",
      eventType: item.event?.eventType || "기타",
      eventName: item.event?.title || item.event?.name || "",
      group: item.maxParticipants ?? 1,
      date: meeting,
      address: regionStr || item.meetingLocation || "",
      authorNickname: item.host?.nickname ?? null,
      authorLoginId: item.host?.loginId ?? null,
      authorObj: item.host ?? null,
      _createdAt: item.createdAt ?? null,
      // MyTogether 방식과 동일한 이벤트 스냅샷 매핑
      eventSnapshot: item.event ? {
        name: item.event.title,
        eventType: item.event.eventType,
        eventImage: item.event.thumbnailImagePath,
        location: item.event.location
      } : item.eventSnapshot
    };
  }, []);

  /* 게스트 정규화 — Participants / Together / Dummy 모두 수용 */
  const normalizeGuestDummy = useCallback((raw) => {
    if (!raw) return null;

    // 1) Participants 응답 형태: { id, status, together: {...}, participant: {...} }
    if (raw.together && typeof raw.together === "object") {
      const t = raw.together;
      const regionStr = t.region
        ? [t.region.level1, t.region.level2, t.region.level3]
            .filter(Boolean)
            .join(" ")
        : "";
      const meeting = t.meetingDate
        ? typeof t.meetingDate === "string"
          ? t.meetingDate.replace(/-/g, ".")
          : new Date(t.meetingDate).toLocaleDateString()
        : "";
      return {
        source: "guest",
        isHost: false,
        togetherId: t.id,
        imgSrc:
          t.mainImagePath || t.thumbnailImagePath || t.event?.imagePath || "/img/default_img.svg",
        alt: t.event?.name || t.title || "",
        title: t.title || "모집글 제목",
        eventType: t.event?.eventType || "이벤트유형",
        eventName: t.event?.name || "",
        group: t.maxParticipants ?? 1,
        date: meeting,
        address: regionStr || t.meetingLocation || "",
        authorNickname: t.host?.nickname ?? null,
        authorLoginId: t.host?.loginId ?? null,
        authorObj: t.host ?? null,
        _createdAt: t.createdAt ?? null,
      };
    }

    // 2) Together 엔티티 직접 전달된 경우
    if (raw.title && (raw.region || raw.meetingDate || raw.maxParticipants)) {
      const t = raw;
      const regionStr = t.region
        ? [t.region.level1, t.region.level2, t.region.level3]
            .filter(Boolean)
            .join(" ")
        : "";
      const meeting = t.meetingDate
        ? typeof t.meetingDate === "string"
          ? t.meetingDate.replace(/-/g, ".")
          : new Date(t.meetingDate).toLocaleDateString()
        : "";
      return {
        source: "guest",
        isHost: false,
        togetherId: t.id,
        imgSrc:
          t.mainImagePath || t.thumbnailImagePath || t.event?.imagePath || "/img/default_img.svg",
        alt: t.event?.name || t.title || "",
        title: t.title || "모집글 제목",
        eventType: t.event?.eventType || "이벤트유형",
        eventName: t.event?.name || "",
        group: t.maxParticipants ?? 1,
        date: meeting,
        address: regionStr || t.meetingLocation || "",
        authorNickname: t.host?.nickname ?? null,
        authorLoginId: t.host?.loginId ?? null,
        authorObj: t.host ?? null,
        _createdAt: t.createdAt ?? null,
      };
    }

    // 3) 레거시 프론트 더미(이전 구조)
    return {
      source: "guest",
      isHost: false,
      togetherId:
        raw.togetherId ?? raw.id ?? `dummy_${raw.eventId ?? Math.random()}`,
      imgSrc: raw.imgSrc || raw.eventImage || "/img/default_img.svg",
      alt: raw.alt || raw.eventName || raw.title || "",
      title: raw.title || "모집글 제목",
      eventType: raw.eventType || "이벤트유형",
      eventName: raw.eventName || "",
      group: raw.group ?? raw.maxParticipants ?? raw.maxPeople ?? 1,
      date: raw.date || "",
      address: raw.address || raw.location || "",
      authorNickname: raw.authorNickname ?? raw?.author?.nickname ?? null,
      authorLoginId: raw.authorLoginId ?? raw?.author?.loginId ?? null,
      authorObj: raw.authorObj ?? raw.author ?? null,
      _createdAt: raw.createdAt ?? null,
    };
  }, []);

  /* 게스트 동행: 백엔드 API로 내 신청 목록 로드 */
  const [guestFromApi, setGuestFromApi] = useState([]);
  const [guestFromRequests, setGuestFromRequests] = useState([]); // fallback으로 유지

  useEffect(() => {
    // 로그인 사용자가 있으면 내가 참여한 동행 목록을 API로 로드 (MyTogether 방식과 동일)
    const effectiveUserId = user?.id ?? user?.user_id ?? user?.memberId ?? null;
    if (!isLogined || !effectiveUserId) {
      setGuestFromApi([]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        // MyTogether와 동일한 방식: getByMember 사용
        const guestData = await togetherApi.getByMember(effectiveUserId).catch(() => []);
        if (!cancelled) {
          setGuestFromApi(Array.isArray(guestData) ? guestData : []);
        }
      } catch (e) {
        if (!cancelled) {
          setGuestFromApi([]);
          console.warn("게스트 동행(API) 로드 실패, fallback으로 대체:", e);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLogined, user]);

  /* 채팅신청 기반 게스트 목록 로드 (fallback으로 유지) */
  useEffect(() => {
    if (guestFromApi.length > 0) {
      setGuestFromRequests([]);
      return;
    }

    try {
      const me = userKey && userKey !== "anon" ? String(userKey) : null;
      if (!me) {
        setGuestFromRequests([]);
        return;
      }
      const sent = getChatRequestsFromUser(me) || [];
      const accepted = sent.filter((r) => r.status === "accepted");
      const seen = new Set();
      const mapped = [];
      for (const r of accepted) {
        const tid = r.postId ?? r.togetherId;
        if (!tid || seen.has(String(tid))) continue;
        seen.add(String(tid));
        mapped.push({
          source: "guest",
          isHost: false,
          togetherId:
            r.postId ?? r.togetherId ?? `req_${r.id ?? Math.random()}`,
          imgSrc: r.eventImage || r.imgSrc || "/img/default_img.svg",
          alt: r.eventName || r.postTitle || "",
          title: r.postTitle || "모집글 제목",
          eventType: r.eventType || "이벤트유형",
          eventName: r.eventName || "이벤트명",
          group: r.group || "",
          date:
            r.postDate ||
            (r.createdAt
              ? new Date(r.createdAt).toLocaleDateString()
              : "0000.00.00"),
          address: "",
          authorNickname: r.toUserName ?? null,
          authorLoginId: r.toUserId || "",
          _createdAt: r.createdAt || null,
        });
      }
      setGuestFromRequests(mapped);
    } catch (e) {
      console.warn("게스트 동행(fallback) 로드 실패:", e);
      setGuestFromRequests([]);
    }
  }, [userKey, guestFromApi]);

  const hostRecords = useMemo(() => {
    if (hostFromApi.length > 0) {
      const arr = hostFromApi
        .slice()
        .sort(
          (x, y) =>
            new Date(y?.createdAt || 0).getTime() -
            new Date(x?.createdAt || 0).getTime()
        );
      return arr.map(normalizeHostApi).filter(Boolean);
    }
    // 로컬스토리지 폴백
    const mine = rawPosts.filter((p) => true /* 이전 isMyAuthor 제거 */);
    mine.sort(
      (x, y) =>
        new Date(y?.createdAt || 0).getTime() -
        new Date(x?.createdAt || 0).getTime()
    );
    return mine.map(normalizeHostLocal).filter(Boolean);
  }, [hostFromApi, rawPosts, normalizeHostApi, normalizeHostLocal]);

  // 게스트 최종: 백엔드 API 우선, fallback으로 props + 채팅 요청 데이터
  const guestRecords = useMemo(() => {
    // API에서 데이터를 성공적으로 가져온 경우
    if (guestFromApi.length > 0) {
      const apiData = guestFromApi
        .slice()
        .sort(
          (x, y) =>
            new Date(y?.createdAt || 0).getTime() -
            new Date(x?.createdAt || 0).getTime()
        )
        .map(normalizeGuestApi)
        .filter(Boolean);

      console.log("게스트 데이터 (API):", apiData);
      return apiData;
    }

    // fallback: props + 채팅 요청 데이터
    const fromProp = (togetherData || [])
      .map(normalizeGuestDummy)
      .filter(Boolean);
    const joined = [...fromProp, ...guestFromRequests];

    const seen = new Set();
    const fallbackData = joined.filter((x) => {
      const key = String(x.togetherId ?? "");
      if (!key) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log("게스트 데이터 (fallback):", fallbackData);
    return fallbackData;
  }, [
    guestFromApi,
    togetherData,
    normalizeGuestApi,
    normalizeGuestDummy,
    guestFromRequests,
  ]);

  // 편집/선택/삭제
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [filterStatus, setFilterStatus] = useState("all"); // all | host | guest

  const onToggleEdit = () => {
    setEditMode((v) => !v);
    setSelectedIds(new Set());
  };
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    const count = selectedIds.size;
    if (count === 0) return;
    if (!confirm(`선택한 ${count}개 항목을 삭제할까요?\n\n⚠️ 호스트 동행: Together 게시글도 함께 삭제됩니다.\n⚠️ 게스트 동행: 참여 신청이 취소됩니다.`)) return;

    const nextHidden = new Set(hiddenIds);

    // 호스트/게스트 구분 집합
    const hostSet = new Set(hostRecords.map((x) => String(x.togetherId)));
    const guestSet = new Set(guestRecords.map((x) => String(x.togetherId)));
    const useHostApi = hostFromApi.length > 0;
    const useGuestApi = guestFromApi.length > 0;

    const deleteOps = [];
    const cancelOps = [];

    selectedIds.forEach((id) => {
      const key = String(id);

      if (hostSet.has(key)) {
        // 호스트 동행: Together 게시글 완전 삭제
        if (useHostApi) {
          console.log(`호스트 동행 삭제 시도: Together ID ${key}`);
          deleteOps.push(
            togetherApi.delete(Number(key)).catch((error) => {
              console.error(`Together 삭제 실패 (ID: ${key}):`, error);
              // API 실패 시에도 숨김 처리
              nextHidden.add(key);
            })
          );
        } else {
          // 레거시 로컬스토리지에서 삭제
          console.log(`레거시 Together 데이터 삭제: ${key}`);
          deletePost("together", key, { purgeExtras: true });
        }
      } else if (guestSet.has(key)) {
        // 게스트 동행: 참여 신청 취소 (API가 있는 경우)
        if (useGuestApi) {
          console.log(`게스트 동행 참여 취소 시도: Together ID ${key}`);
          cancelOps.push(
            togetherApi.cancelParticipation(Number(key)).catch((error) => {
              console.warn(`참여 취소 실패 (ID: ${key}):`, error);
              // 취소 실패 시 숨김 처리로 대체
              nextHidden.add(key);
            })
          );
        } else {
          // API 없는 경우 숨김 처리
          console.log(`게스트 동행 숨김 처리: ${key}`);
          nextHidden.add(key);
        }
      } else {
        // 기타 경우 숨김 처리
        nextHidden.add(key);
      }
    });

    // 모든 삭제/취소 작업 실행
    const allOps = [...deleteOps, ...cancelOps];
    if (allOps.length > 0) {
      try {
        console.log(`총 ${allOps.length}개 작업 실행 중...`);
        await Promise.all(allOps);
        console.log("모든 작업 완료");
      } catch (e) {
        console.warn("일부 작업 실패:", e);
      }
    }

    // 숨김 상태 저장
    saveHiddenIds(userKey, nextHidden);
    setHiddenIds(nextHidden);
    setSelectedIds(new Set());

    // 목록 갱신
    if (useHostApi) {
      try {
        const myId = user?.id ?? user?.user_id ?? null;
        if (myId) {
          const list = await togetherApi.getByHost(myId);
          setHostFromApi(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        console.warn("호스트 목록 갱신 실패:", e);
      }
    } else {
      const arr = loadPosts("together") || [];
      setRawPosts(arr);
    }

    // 게스트 목록도 갱신
    if (useGuestApi) {
      try {
        const myId = user?.id ?? user?.user_id ?? user?.memberId ?? null;
        if (myId) {
          const guestData = await togetherApi.getByMember(myId).catch(() => []);
          setGuestFromApi(Array.isArray(guestData) ? guestData : []);
        }
      } catch (e) {
        console.warn("게스트 목록 갱신 실패:", e);
      }
    }

    alert(`${count}개 항목이 처리되었습니다.`);
  };

  // 숨김 적용 + 탭 필터 + 합치기
  const filtered = useMemo(() => {
    const hide = (arr) =>
      arr.filter((x) => !hiddenIds.has(String(x.togetherId)));

    console.log('=== HistoryWith 필터링 디버그 ===');
    console.log('filterStatus:', filterStatus);
    console.log('hostRecords:', hostRecords.map(h => ({ togetherId: h.togetherId, title: h.title, isHost: h.isHost, source: h.source })));
    console.log('guestRecords:', guestRecords.map(g => ({ togetherId: g.togetherId, title: g.title, isHost: g.isHost, source: g.source })));

    let result;
    if (filterStatus === "host") {
      result = hide(hostRecords);
      console.log('호스트 필터 결과:', result.length, '개');
    } else if (filterStatus === "guest") {
      result = hide(guestRecords);
      console.log('게스트 필터 결과:', result.length, '개');
    } else {
      // 전체: 호스트 먼저, 게스트(합쳐진) 다음
      result = hide(hostRecords).concat(hide(guestRecords));
      console.log('전체 필터 결과:', result.length, '개 (호스트:', hide(hostRecords).length, '+ 게스트:', hide(guestRecords).length, ')');
    }

    console.log('최종 결과:', result.map(r => ({ togetherId: r.togetherId, title: r.title, isHost: r.isHost, source: r.source })));
    return result;
  }, [filterStatus, hostRecords, guestRecords, hiddenIds]);

  // 카드에 편집 prop 주입
  const itemsWithEditProps = useMemo(
    () =>
      filtered.map((it) => ({
        ...it,
        editMode,
        selected: selectedIds.has(it.togetherId),
        onToggleSelect: () => toggleSelect(it.togetherId),
      })),
    [filtered, editMode, selectedIds]
  );

  // 가드/빈 상태
  if (ready && !isLogined) {
    return (
      <div className="mt-6 p-6 bg-white rounded-lg text-center text-gray-600">
        내 동행 기록을 보려면 로그인해주세요.
      </div>
    );
  }

  return (
    <div className=" space-y-1">
      <div className="flex items-center justify-between">
        {/* 호스트/게스트/전체 필터 */}
        <div className="flex gap-2 ">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg text-xs transition-colors ${
              filterStatus === "all"
                ? "bg-blue-500 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}>
            전체
          </button>
          <button
            onClick={() => setFilterStatus("host")}
            className={`px-4 py-2 rounded-lg text-xs transition-colors ${
              filterStatus === "host"
                ? "bg-blue-500 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}>
            호스트 동행
          </button>
          <button
            onClick={() => setFilterStatus("guest")}
            className={`px-4 py-2 rounded-lg text-xs transition-colors ${
              filterStatus === "guest"
                ? "bg-blue-500 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}>
            게스트 동행
          </button>
        </div>

        {/* 편집/선택삭제 */}
        <EditSetting
          editMode={editMode}
          selectedCount={selectedIds.size}
          onToggleEdit={onToggleEdit}
          onDeleteSelected={handleDeleteSelected}
          onOpenSetting={() => {}}
        />
      </div>

      {itemsWithEditProps.length === 0 ? (
        <div className="p-6 bg-white rounded-lg text-center text-gray-600">
          표시할 동행 기록이 없습니다.
        </div>
      ) : (
        <ListLayout Component={TogetherList} items={itemsWithEditProps} />
      )}
    </div>
  );
}
