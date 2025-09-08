"use client";

import { useEffect, useMemo, useState, useContext } from "react";
import ReviewHistoryCard from "@/components/mypage/history/ReviewHistoryCard";
import { getMyEventReviews } from "@/lib/eventReviewData";
import { getEventById } from "@/lib/eventData";
import EditSetting from "@/components/global/EditSetting";
import { LoginContext } from "@/components/auth/LoginProvider";

export default function HistoryEvent() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // 편집 모드 관련 상태
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  // 로그인 컨텍스트에서 사용자 정보 가져오기
  const { user, isLogined } = useContext(LoginContext);

  /* 최신 작성 순 정렬 */
  const sorted = useMemo(() => {
    return [...reviews].sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return tb - ta;
    });
  }, [reviews]);

  // 편집 모드 토글
  const onToggleEdit = () => {
    setEditMode((v) => !v);
    setSelectedIds(new Set()); // 모드 전환 시 선택 초기화
  };

  // 리뷰 선택 토글
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 선택 삭제
  const onDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (!confirm("선택한 후기를 삭제하시겠습니까?")) return;

    // 선택된 리뷰들 제거
    setReviews((prev) =>
      prev.filter((rv) => {
        const reviewId =
          rv.reviewId || rv.id || `${rv.eventId}-${rv.createdAt}`;
        return !selectedIds.has(reviewId);
      })
    );
    setSelectedIds(new Set());
  };

  // 카드에 편집 관련 prop을 주입
  const itemsWithEditProps = useMemo(
    () =>
      sorted.map((rv) => {
        const reviewId =
          rv.reviewId || rv.id || `${rv.eventId}-${rv.createdAt}`;
        return {
          ...rv,
          editMode,
          selected: selectedIds.has(reviewId),
          onToggleSelect: () => toggleSelect(reviewId),
          enableInteraction: !editMode, // 편집 중엔 다른 상호작용 비활성화
        };
      }),
    [sorted, editMode, selectedIds]
  );

  useEffect(() => {
    // 로그인되지 않았으면 데이터 로드하지 않음
    console.log("사용자 정보:", user);
    console.log("백엔드 사용 여부:", process.env.NEXT_PUBLIC_USE_BACKEND);
    if (!isLogined || !user) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        /* 리뷰 목록 불러오기 - 백엔드 연동 */
        const list = await getMyEventReviews({ memberId: user.id });

        /* 이벤트 메타 없는 항목 보강 */
        const enriched = await Promise.all(
          (list || []).map(async (rv) => {
            if (rv.event?.name && rv.event?.type && rv.event?.image) return rv;
            // try {
            //   const ev = await getEventById(rv.eventId);
            try {
              console.log("API 호출 시작 - memberId:", user.id);
              /* 리뷰 목록 불러오기 - 백엔드 연동 */
              const list = await getMyEventReviews({ memberId: user.id });
              console.log("API 응답 받은 데이터:", list);

              // ... 나머지 코드
              return {
                ...rv,
                event: {
                  // 🔧 DUMMY_EVENTS 키에 맞춰 매핑
                  name: ev?.title || "이벤트",
                  type: ev?.eventType || "이벤트",
                  image:
                    ev?.imgSrc || rv?.event?.image || "/img/default_img.svg",
                },
              };
            } catch {
              return {
                ...rv,
                event: {
                  name: rv?.eventName || "이벤트",
                  type: rv?.eventType || "이벤트",
                  image: rv?.eventImage || rv?.imgSrc || "/img/default_img.svg",
                },
              };
            }
          })
        );
        setReviews(enriched);
      } catch (error) {
        console.error("리뷰 데이터 로드 실패:", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [isLogined, user]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 h-full">
        <div className="space-y-3">
          <div className="h-28 bg-gray-100 animate-pulse rounded" />
          <div className="h-28 bg-gray-100 animate-pulse rounded" />
          <div className="h-28 bg-gray-100 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  // 로그인되지 않은 경우
  if (!isLogined) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full">
        <div className="p-12 text-center">
          <p className="text-[#76787a]">로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  if (!sorted.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full">
        <div className="p-12 text-center">
          <p className="text-[#76787a]">작성한 후기가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* EditSetting 컴포넌트 추가 */}
      <div className="flex justify-end ">
        <EditSetting
          editMode={editMode}
          selectedCount={selectedIds.size}
          onToggleEdit={onToggleEdit}
          onDeleteSelected={onDeleteSelected}
          onOpenSetting={() => {}} // 설정 기능이 필요하면 구현
        />
      </div>

      {/* 리뷰 목록 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex flex-col">
          {itemsWithEditProps.map((rv, index) => {
            const reviewId =
              rv.reviewId || rv.id || `${rv.eventId}-${rv.createdAt}`;
            return (
              <div
                key={reviewId}
                className={`${
                  index !== itemsWithEditProps.length - 1
                    ? "border-b border-gray-200"
                    : ""
                } ${
                  rv.selected ? "bg-blue-50" : ""
                } transition-colors duration-200`}>
                <ReviewHistoryCard
                  review={rv}
                  variant="row"
                  editMode={rv.editMode}
                  selected={rv.selected}
                  onToggleSelect={rv.onToggleSelect}
                  enableInteraction={rv.enableInteraction}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
