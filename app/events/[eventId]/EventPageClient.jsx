"use client";

import {
  getEventReviews,
  deleteEventReview,
  deleteEventReviewByEvent,
} from "@/lib/api/eventReviewApi";
import EventDetail from "@/components/events/detail/EventDetail";
import EventInfo from "./EventInfo";
import GalleryLayout from "@/components/global/GalleryLayout";
import HorizontalTab from "@/components/global/HorizontalTab";
import TogetherGallery from "@/components/together/TogetherGallery";
import TogetherList from "@/components/together/TogetherList";
import togetherApi from "@/lib/api/togetherApi";
import SearchFilterSort from "@/components/global/SearchFilterSort";
import EventFilterModal from "@/components/events/main/EventFilterModal";
import ListLayout from "@/components/global/ListLayout";
import EventReviewList from "@/components/events/detail/review/EventReviewList";
import EventReviewModal from "@/components/events/detail/review/EventReviewModal";
import { getEventById } from "@/lib/api/eventApi";
import { useState, useEffect, useContext } from "react";
import { LoginContext } from "@/components/auth/LoginProvider";
import {
  getEventMainImageUrl,
  getEventContentImageUrls,
} from "@/lib/utils/imageUtils";
import { useRouter, useSearchParams } from "next/navigation";

/** region → location 문자열(undef-safe) */
const toLocation = (obj) => {
  const level1 =
    typeof obj?.region?.level1 === "string" ? obj.region.level1.trim() : "";
  const level2 =
    typeof obj?.region?.level2 === "string" ? obj.region.level2.trim() : "";
  const level3 =
    typeof obj?.region?.level3 === "string" ? obj.region.level3.trim() : "";

  const city =
    typeof obj?.region?.city === "string" ? obj.region.city.trim() : "";
  const district =
    typeof obj?.region?.district === "string" ? obj.region.district.trim() : "";

  const parts =
    level1 || level2 || level3
      ? [level1, level2, level3].filter(Boolean)
      : [city, district].filter(Boolean);

  return parts.length > 0
    ? parts.join(" ")
    : (obj?.eventLocation && String(obj.eventLocation).trim()) || "미정";
};

const mapDetail = (data) => {
  const priceList = Array.isArray(data?.ticketPrices)
    ? data.ticketPrices.map((p) => ({
        type: p.ticketType,
        price: Number(p.price).toLocaleString(),
      }))
    : [];

  const ticketTypes =
    Array.isArray(data?.ticketPrices) && data.ticketPrices.length > 0
      ? data.ticketPrices.map((p) => p.ticketType).join(", ")
      : "미정";

  const regionLevel1 = data?.region?.level1 || "";
  const regionLevel2 = data?.region?.level2 || "";
  const regionLevel3 = data?.region?.level3 || "";
  const fullAddr = [regionLevel1, regionLevel2, regionLevel3]
    .filter(Boolean)
    .join(" ");

  return {
    eventId: data.id,
    title: data.title,
    content: data.description || data.content || "",
    location: toLocation(data),
    eventLocation: data.eventLocation || "미정",
    address: data.address || fullAddr,
    addressDetail: data.addressDetail || "",
    startDate: data.startDate,
    endDate: data.endDate,
    viewTime: data.durationMin ? `${data.durationMin}분` : "미정",
    ageLimit: data.minAge ? `${data.minAge}세 이상` : "전체관람가",
    ticketType: ticketTypes,
    price:
      priceList.length > 0
        ? priceList.map((p) => `${p.type} ${p.price}원`).join(", ")
        : "미정",
    priceList,
    eventType: data.eventType,
    imgSrc: getEventMainImageUrl(data, true),
    alt: data.title,
    isHot: false,
    score: data.avgRating ? Number(data.avgRating) : 0,
    avgRating: data.avgRating ? Number(data.avgRating) : 0,
    reviewCount: data.reviewCount || 0,
    likesCount: data.interestCount || 0,
    viewCount: data.viewCount || 0,
    contentImageUrls: getEventContentImageUrls(data),
    ticketPrices: data.ticketPrices || [],
    region: data.region || null,
    isInterested: Boolean(data.isInterested),
  };
};

// 동행 데이터 매핑 함수
const mapTogetherData = (together) => {
  const togetherId = together.id || null;

  return {
    id: togetherId,
    togetherId: togetherId,
    title: together.title || "제목 없음",
    content: together.content || "",
    eventType: together.event?.eventType || "기타",
    eventName: together.event?.title || together.event?.eventName || "이벤트명",
    eventSnapshot: together.event,
    event: together.event,
    host: together.host,
    hostId: together.host?.id,
    hostNickname: together.host?.nickname || together.host?.displayName,
    hostLoginId: together.host?.loginId || together.host?.login_id,
    maxParticipants: together.maxParticipants,
    currentParticipants: together.currentParticipants,
    group: `${together.currentParticipants || 0}/${together.maxParticipants}`,
    meetingDate: together.meetingDate,
    date: together.meetingDate,
    meetingLocation: together.meetingLocation,
    region: together.region,
    address: together.meetingLocation || "",
    active: together.active,
    isClosed: !together.active,
    isInterested: together.isInterested || false,
    imgSrc: together.event
      ? getEventMainImageUrl(together.event)
      : "/img/default_img.svg",
    href: `/together/${togetherId}`,
    _key: `together_${togetherId}`,
  };
};

export default function EventPageClient({ eventData: initialEventData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginContext = useContext(LoginContext);
  const user = loginContext?.user || null;
  const isLogined = loginContext?.isLogined || false;
  const ready = loginContext?.ready || false;
  const currentUserId = user?.id ?? user?.user_id ?? user?.memberId ?? null;
  const [currentMenu, setCurrentMenu] = useState("상세 정보");
  const menuList = ["상세 정보", "후기", "모집중인 동행"];

  const [togetherViewType, setTogetherViewType] = useState("List");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [eventData, setEventData] = useState(initialEventData);
  const [hasMyReview, setHasMyReview] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [togetherData, setTogetherData] = useState([]);
  const [togetherLoading, setTogetherLoading] = useState(false);

  const openFilterModal = () => setIsFilterModalOpen(true);
  const closeFilterModal = () => setIsFilterModalOpen(false);
  const openReviewModal = () => {
    setEditingReview(null);
    setIsReviewModalOpen(true);
  };
  const closeReviewModal = () => {
    setEditingReview(null);
    setIsReviewModalOpen(false);
  };

  const reviewKey = (eid, uid) => `reviewed:${eid}:${uid}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!eventData?.eventId || currentUserId == null) return;
    const flag = localStorage.getItem(
      reviewKey(eventData.eventId, currentUserId)
    );
    setHasMyReview(flag === "1");
  }, [eventData?.eventId, currentUserId]);

  useEffect(() => {
    setEventData(initialEventData);
  }, [initialEventData]);

  // URL 파라미터/해시 → 탭 이동
  useEffect(() => {
    if (typeof window === "undefined") return;
    const tabParam = searchParams.get("tab");
    const hash = window.location.hash.slice(1);
    const targetTab = tabParam || hash;
    if (targetTab && menuList.includes(targetTab)) {
      setCurrentMenu(targetTab);
    }
    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1);
      if (newHash && menuList.includes(newHash)) setCurrentMenu(newHash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [searchParams]);

  useEffect(() => {
    if (currentMenu === "후기" && eventData?.eventId) {
      loadReviews();
    }
  }, [currentMenu, eventData?.eventId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (hash && currentMenu === hash) {
      setTimeout(() => {
        const tabElement =
          document.querySelector(`[data-tab="${hash}"]`) ||
          document.querySelector(".min-h-50");
        if (tabElement) {
          tabElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [currentMenu]);

  const isMineReview = (rv, myId) => {
    if (!rv || myId == null) return false;
    const c = [
      rv.memberId,
      rv.userId,
      rv.authorId,
      rv.writerId,
      rv.member?.id,
      rv.user?.id,
      rv.author?.id,
      rv.writer?.id,
    ].filter((v) => v !== undefined && v !== null);
    return c.some((v) => String(v) === String(myId));
  };

  const loadReviews = async () => {
    if (!eventData?.eventId) {
      console.log("⏹️ loadReviews: eventData.eventId가 없음");
      return;
    }

    console.log("🔄 loadReviews 시작, eventId:", eventData.eventId);
    setReviewsLoading(true);
    try {
      const reviewData = await getEventReviews(eventData.eventId);
      console.log("📦 getEventReviews 응답:", reviewData);
      const list = Array.isArray(reviewData) ? reviewData : [];
      console.log("📝 리뷰 배열로 변환:", list.length, "개");

      // 내 리뷰 상단 정렬
      const sortedList = list.sort((a, b) => {
        const aIsMine = isMineReview(a, currentUserId);
        const bIsMine = isMineReview(b, currentUserId);
        if (aIsMine && !bIsMine) return -1;
        if (!aIsMine && bIsMine) return 1;
        return 0;
      });

      console.log("🔢 정렬된 리뷰 리스트:", sortedList.length, "개");
      setReviews(sortedList);

      if (currentUserId != null) {
        const mine = list.some((rv) => isMineReview(rv, currentUserId));
        console.log("👤 내 리뷰 존재 여부:", mine);
        setHasMyReview(mine);
        if (typeof window !== "undefined") {
          const k = reviewKey(eventData.eventId, currentUserId);
          if (mine) localStorage.setItem(k, "1");
          else localStorage.removeItem(k);
        }
      }
    } catch (error) {
      console.error("❌ 후기 데이터 로드 실패:", error);
      setReviews([]);
    } finally {
      console.log("🔄 loadReviews 완료");
      setReviewsLoading(false);
    }
  };

  const handleReviewAdded = async (savedReview) => {
    setHasMyReview(true);
    if (typeof window !== "undefined" && currentUserId != null) {
      localStorage.setItem(reviewKey(eventData.eventId, currentUserId), "1");
    }
    await loadReviews();
    await updateEventData();
  };

  const handleEditReview = (reviewData) => {
    setEditingReview(reviewData);
    setIsReviewModalOpen(true);
  };

  const handleReviewUpdated = async (updatedReview) => {
    setEditingReview(null);
    await loadReviews();
    await updateEventData();
  };

  // ★ 삭제 핸들러 (경로 자동 대응 + 낙관적 갱신 포함)
  const handleDeleteReview = async (reviewData) => {
    console.log("🗑️ handleDeleteReview 호출됨, reviewData:", reviewData);

    const reviewId =
      reviewData?.id ?? reviewData?.reviewId ?? reviewData?.review_id;

    if (!reviewId) {
      console.error("❌ 리뷰 ID가 없음:", reviewData);
      alert("리뷰 ID를 찾을 수 없습니다.");
      return;
    }

    console.log("🔍 추출된 reviewId:", reviewId);

    if (!confirm("정말로 이 리뷰를 삭제하시겠습니까?")) {
      console.log("⏹️ 사용자가 삭제를 취소했습니다.");
      return;
    }

    const eventIdSafe =
      reviewData?.eventId ??
      reviewData?.event_id ??
      eventData?.eventId ??
      eventData?.id;

    console.log("🎯 eventIdSafe:", eventIdSafe);

    try {
      console.log("🔄 deleteEventReview API 호출 시작, reviewId:", reviewId);

      let result;
      try {
        if (eventIdSafe) {
          console.log("📡 deleteEventReviewByEvent 호출:", eventIdSafe, reviewId);
          result = await deleteEventReviewByEvent(eventIdSafe, reviewId);
        } else {
          console.log("📡 deleteEventReview 호출:", reviewId);
          result = await deleteEventReview(reviewId);
        }
      } catch (err) {
        console.warn(
          "⚠️ event-route DELETE 실패, review-only 경로로 재시도:",
          err?.message
        );
        result = await deleteEventReview(reviewId);
      }
      console.log("✅ deleteEventReview 완료:", result);

      // 즉시 리스트에서 제거
      console.log("🗂️ 로컬 리뷰 리스트에서 삭제 전 개수:", reviews?.length);
      setReviews((prev) => {
        const filtered = Array.isArray(prev)
          ? prev.filter(
              (rv) =>
                String(rv?.id ?? rv?.reviewId ?? rv?.review_id) !==
                String(reviewId)
            )
          : prev;
        console.log("🗂️ 로컬 리뷰 리스트에서 삭제 후 개수:", Array.isArray(filtered) ? filtered.length : 0);
        return filtered;
      });

      // 내 리뷰 플래그/로컬스토리지 정리
      console.log("🧹 내 리뷰 플래그 및 로컬스토리지 정리");
      setHasMyReview(false);
      if (typeof window !== "undefined" && currentUserId != null) {
        const key = reviewKey(eventData.eventId, currentUserId);
        console.log("🧹 로컬스토리지 키 삭제:", key);
        localStorage.removeItem(key);
      }

      // 서버 최신 상태 재조회
      console.log("🔄 삭제 후 리뷰 목록 재조회 시작");
      await loadReviews();
      await updateEventData();
      console.log(
        "✅ 삭제 후 리뷰 목록 재조회 완료, 현재 리뷰 수:",
        reviews?.length
      );

      alert("리뷰가 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("❌ 리뷰 삭제 실패:", error);
      alert(`리뷰 삭제에 실패했습니다: ${error.message}`);
    }
  };

  // 모집중인 동행 > 글쓰기 버튼 동작
  const handleWriteTogether = () => {
    const eid = eventData?.eventId || eventData?.id;
    const qs = eid ? `?eventId=${encodeURIComponent(String(eid))}` : "";
    const targetUrl = `/together/write${qs}`;
    if (ready && isLogined && currentUserId != null) {
      router.push(targetUrl);
    } else {
      router.push(`/login?next=${encodeURIComponent(targetUrl)}`);
    }
  };

  const updateEventData = async () => {
    try {
      const raw = await getEventById(eventData.eventId);
      const updated = mapDetail(raw);
      setEventData(updated);
    } catch (error) {
      console.error("이벤트 데이터 업데이트 실패:", error);
    }
  };

  // 관심 상태 변경 브로드캐스트 리스너
  useEffect(() => {
    if (!eventData?.eventId) return;
    const handleInterestChanged = (event) => {
      const { eventId: changedEventId, interested } = event.detail;
      if (String(changedEventId) === String(eventData.eventId)) {
        setEventData((prev) => ({
          ...prev,
          isInterested: Boolean(interested),
          likesCount: interested
            ? (prev.likesCount || 0) + 1
            : Math.max((prev.likesCount || 0) - 1, 0),
        }));
        setTimeout(() => {
          updateEventData();
        }, 100);
      }
    };
    window.addEventListener("event-interest-changed", handleInterestChanged);
    return () =>
      window.removeEventListener(
        "event-interest-changed",
        handleInterestChanged
      );
  }, [eventData?.eventId]);

  // 동행 데이터 로드
  const loadTogetherData = async () => {
    if (!eventData?.eventId) return;
    setTogetherLoading(true);
    try {
      const togetherList = await togetherApi.search({
        eventId: eventData.eventId,
      });
      const safeList = Array.isArray(togetherList) ? togetherList : [];
      const mappedData = safeList.map(mapTogetherData);
      setTogetherData(mappedData);
    } catch (error) {
      console.error("동행 데이터 로드 실패:", error);
      setTogetherData([]);
    } finally {
      setTogetherLoading(false);
    }
  };

  useEffect(() => {
    if (currentMenu === "모집중인 동행") {
      loadTogetherData();
    }
  }, [currentMenu, eventData?.eventId]);

  return (
    <>
      <EventInfo eventData={eventData} />

      <HorizontalTab
        currentMenu={currentMenu}
        menuList={menuList}
        setCurrentMenu={setCurrentMenu}
        width={800}
        align="center"
      />

      <div className="min-h-50" data-tab-content={currentMenu}>
        {currentMenu === menuList[0] && (
          <div data-tab="상세 정보">
            <EventDetail eventData={eventData} />
          </div>
        )}

        {currentMenu === menuList[1] && (
          <div data-tab="후기">
            <div className="flex justify-end py-4">
              {!hasMyReview && (
                <button
                  onClick={openReviewModal}
                  className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
                  후기 작성
                </button>
              )}
            </div>

            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <div>후기를 불러오는 중...</div>
              </div>
            ) : reviews.length > 0 ? (
              <ListLayout
                Component={EventReviewList}
                items={reviews}
                commonProps={{
                  currentUserId,
                  onEditReview: (rv) => handleEditReview(rv),
                  onDeleteReview: (rv) => handleDeleteReview(rv),
                }}
              />
            ) : (
              <div className="flex justify-center py-8 text-gray-500">
                아직 작성된 후기가 없습니다.
              </div>
            )}

            <EventReviewModal
              isOpen={isReviewModalOpen}
              onClose={closeReviewModal}
              eventId={eventData.eventId}
              onReviewAdded={handleReviewAdded}
              onReviewUpdated={handleReviewUpdated}
              editMode={!!editingReview}
              reviewData={editingReview}
              eventData={eventData}
            />
          </div>
        )}

        {currentMenu === menuList[2] && (
          <div data-tab="모집중인 동행">
            <div className="flex items-center justify-between">
              <SearchFilterSort
                enableViewType
                viewType={togetherViewType}
                setViewType={setTogetherViewType}
                filterAction={openFilterModal}
              />
              <button
                onClick={() => {
                  try {
                    handleWriteTogether();
                  } catch (error) {
                    console.error("글쓰기 버튼 클릭 에러:", error);
                    alert("오류가 발생했습니다: " + error.message);
                  }
                }}
                className="h-10 px-4 rounded bg-blue-600 text-white hover:bg-blue-500"
                title="동행 글쓰기">
                글쓰기
              </button>
            </div>

            {togetherLoading ? (
              <div className="flex justify-center py-8">
                <div>동행 데이터를 불러오는 중...</div>
              </div>
            ) : togetherData && togetherData.length > 0 ? (
              togetherViewType === "Gallery" ? (
                <GalleryLayout
                  Component={TogetherGallery}
                  items={togetherData}
                />
              ) : (
                <ListLayout Component={TogetherList} items={togetherData} />
              )
            ) : (
              <div className="flex justify-center py-8 text-gray-500">
                모집중인 동행이 없습니다.
              </div>
            )}

            <EventFilterModal
              isOpen={isFilterModalOpen}
              onClose={closeFilterModal}
            />
          </div>
        )}
      </div>
    </>
  );
}
