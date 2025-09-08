"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import TogetherList from "../../together/TogetherList";
import ListLayout from "../../global/ListLayout";
import SearchFilterSort from "../../global/SearchSort";
import EditSetting from "../../global/EditSetting";
import useLogin from "@/hooks/useLogin";
import { loadPosts, deletePost } from "@/lib/storage";
import { getChatRequestsFromUser } from "@/lib/chatRequestUtils";

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

  /* 스토리지에서 전체 together 글(프론트 더미용) */
  const [rawPosts, setRawPosts] = useState([]);
  useEffect(() => {
    const arr = loadPosts("together") || [];
    setRawPosts(arr);
  }, []);

  /* 내가 쓴 글(호스트) 판별 */
  const isMyAuthor = useCallback(
    (p) => {
      const a = p?.author && typeof p.author === "object" ? p.author : {};
      const authorCandidates = [
        p?.author_login_id,
        p?.authorLoginId,
        p?.authorId,
        p?.author_id,
        a?.user_id,
        a?.id,
        a?.login_id,
        a?.loginId,
        typeof p?.author === "string" ? p.author : null,
      ]
        .map((v) => (v == null ? null : String(v).trim()))
        .filter(Boolean);
      return userIds.some((u) => authorCandidates.includes(u));
    },
    [userIds]
  );

  /* 호스트동행글(내가 쓴 글) 정규화 */
  const normalizeHost = useCallback((post) => {
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
      // 정렬용
      _createdAt: post?.createdAt || null,
    };
  }, []);

  /* 게스트(더미) 정규화 — props로 넘어온 더미 */
  const normalizeGuestDummy = useCallback((d) => {
    return {
      source: "guest",
      isHost: false,
      togetherId: d.togetherId ?? d.id ?? `dummy_${d.eventId ?? Math.random()}`,
      imgSrc: d.imgSrc || "/img/default_img.svg",
      alt: d.alt || d.eventName || d.title || "",
      title: d.title || "모집글 제목",
      eventType: d.eventType || "이벤트유형",
      eventName: d.eventName || "",
      group: d.group ?? d.maxPeople ?? 1,
      date: d.date || "", // 더미는 작성일이 없으니 표시만
      address: d.address || d.location || "",
      authorNickname: d.authorNickname ?? null,
      authorLoginId: d.authorLoginId ?? null,
      authorObj: d.authorObj ?? null,
      author: typeof d.author === "string" ? d.author : undefined,
      _createdAt: null, // 정렬용 없음
    };
  }, []);

  /* 게스트(실데이터: 내가 보낸 신청 중 '수락') 정규화 */
  const normalizeGuestRequest = useCallback((r) => {
    return {
      source: "guest",
      isHost: false,
      togetherId: r.postId ?? r.togetherId ?? `req_${r.id ?? Math.random()}`,
      imgSrc: r.eventImage || r.imgSrc || "/img/default_img.svg",
      alt: r.eventName || r.postTitle || "",
      title: r.postTitle || "모집글 제목",
      eventType: r.eventType || "이벤트유형",
      eventName: r.eventName || "이벤트명",
      group: r.group || "", // 서버 붙으면 참여인원으로 갱신 가능
      date:
        r.postDate ||
        (r.createdAt
          ? new Date(r.createdAt).toLocaleDateString()
          : "0000.00.00"),
      address: "",
      authorNickname: r.toUserName ?? null, // 호스트 표시가 필요하면 사용
      authorLoginId: r.toUserId || "", // 호스트 loginId(식별 용도)
      _createdAt: r.createdAt || null,
    };
  }, []);

  /* 채팅신청 기반 게스트 목록 로드 */
  const [guestFromRequests, setGuestFromRequests] = useState([]);
  useEffect(() => {
    try {
      const me = userKey && userKey !== "anon" ? String(userKey) : null;
      if (!me) {
        setGuestFromRequests([]);
        return;
      }
      const sent = getChatRequestsFromUser(me) || [];
      const accepted = sent.filter((r) => r.status === "accepted");

      // 같은 together(postId) 중복 제거
      const seen = new Set();
      const mapped = [];
      for (const r of accepted) {
        const tid = r.postId ?? r.togetherId;
        if (!tid || seen.has(String(tid))) continue;
        seen.add(String(tid));
        mapped.push(normalizeGuestRequest(r));
      }
      setGuestFromRequests(mapped);
    } catch (e) {
      console.warn("게스트 동행(실데이터) 로드 실패:", e);
      setGuestFromRequests([]);
    }
  }, [userKey, normalizeGuestRequest]);

  /* 데이터 구성 */
  const hostRecords = useMemo(() => {
    const mine = rawPosts.filter(isMyAuthor);
    mine.sort(
      (x, y) =>
        new Date(y?.createdAt || 0).getTime() -
        new Date(x?.createdAt || 0).getTime()
    );
    return mine.map(normalizeHost);
  }, [rawPosts, isMyAuthor, normalizeHost]);

  // 게스트 최종: 실데이터 + 더미 합치고 togetherId로 dedupe
  const guestRecords = useMemo(() => {
    const fromDummy = (togetherData || []).map(normalizeGuestDummy);
    const joined = [...guestFromRequests, ...fromDummy];

    const seen = new Set();
    return joined.filter((x) => {
      const key = String(x.togetherId ?? "");
      if (!key) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [togetherData, normalizeGuestDummy, guestFromRequests]);

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

  const handleDeleteSelected = () => {
    const count = selectedIds.size;
    if (count === 0) return;
    if (!confirm(`선택한 ${count}개 항목을 삭제할까요?`)) return;

    // 호스트는 실제 삭제, 게스트(실데이터/더미)는 숨김 처리
    const nextHidden = new Set(hiddenIds);

    // 호스트 집합/게스트 집합 만들어 구분 삭제
    const hostSet = new Set(hostRecords.map((x) => String(x.togetherId)));
    const guestSet = new Set(guestRecords.map((x) => String(x.togetherId)));

    selectedIds.forEach((id) => {
      const key = String(id);
      if (hostSet.has(key)) {
        deletePost("together", key, { purgeExtras: true });
      } else if (guestSet.has(key)) {
        nextHidden.add(key); // 내 히스토리에서만 숨김
      } else {
        nextHidden.add(key);
      }
    });

    saveHiddenIds(userKey, nextHidden);
    setHiddenIds(nextHidden);
    setSelectedIds(new Set());

    // 호스트 목록 갱신
    const arr = loadPosts("together") || [];
    setRawPosts(arr);
  };

  // 숨김 적용 + 탭 필터 + 합치기
  const filtered = useMemo(() => {
    const hide = (arr) =>
      arr.filter((x) => !hiddenIds.has(String(x.togetherId)));

    if (filterStatus === "host") {
      return hide(hostRecords);
    }
    if (filterStatus === "guest") {
      return hide(guestRecords);
    }
    // 전체: 호스트 먼저, 게스트(합쳐진) 다음
    return hide(hostRecords).concat(hide(guestRecords));
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
