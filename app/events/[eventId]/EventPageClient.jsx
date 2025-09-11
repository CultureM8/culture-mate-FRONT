"use client";

import { getEventReviews } from "@/lib/api/eventReviewApi"; //  리뷰 API (통합된 API)
import EventDetail from "@/components/events/detail/EventDetail";
import EventInfo from "./EventInfo";
import GalleryLayout from "@/components/global/GalleryLayout";
import HorizontalTab from "@/components/global/HorizontalTab";
import TogetherGallery from "@/components/together/TogetherGallery";
import { togetherData } from "@/lib/togetherData";
import SearchFilterSort from "@/components/global/SearchFilterSort";
import EventFilterModal from "@/components/events/main/EventFilterModal";
import ListLayout from "@/components/global/ListLayout";
import EventReviewList from "@/components/events/detail/review/EventReviewList";
import EventReviewModal from "@/components/events/detail/review/EventReviewModal";
import { getEventById } from "@/lib/eventApi";
import { useState, useEffect, useContext } from "react";
import { LoginContext } from "@/components/auth/LoginProvider";

const toImg = (url) => {
  if (!url) return "/img/default_img.svg";
  if (url.startsWith("http")) return url;
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
  return `${base}${url}`;
};

/** region → location 문자열(undef-safe) */
const toLocation = (obj) => {
  const city =
    typeof obj?.region?.city === "string" ? obj.region.city.trim() : "";
  const district =
    typeof obj?.region?.district === "string" ? obj.region.district.trim() : "";
  const parts = [city, district].filter(Boolean);
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

  const country =
    typeof data?.region?.country === "string" ? data.region.country.trim() : "";
  const city2 =
    typeof data?.region?.city === "string" ? data.region.city.trim() : "";
  const district2 =
    typeof data?.region?.district === "string"
      ? data.region.district.trim()
      : "";
  const fullAddr = [country, city2, district2].filter(Boolean).join(" ");

  return {
    eventId: data.id,
    title: data.title,
    content: data.description || data.content || "",
    location: toLocation(data),
    eventLocation: data.eventLocation || "미정",
    address: fullAddr,
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
    imgSrc: toImg(data.mainImageUrl),
    alt: data.title,
    isHot: false,
    score: data.avgRating ? Number(data.avgRating) : 0,
    avgRating: data.avgRating ? Number(data.avgRating) : 0,
    reviewCount: data.reviewCount || 0,
    likesCount: data.interestCount || 0,
    viewCount: data.viewCount || 0,
    contentImageUrls: data.contentImageUrls || [],
    ticketPrices: data.ticketPrices || [],
    region: data.region || null,
  };
};

export default function EventPageClient({ eventData: initialEventData }) {
  const { user } = useContext(LoginContext) || {};
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
  const openFilterModal = () => setIsFilterModalOpen(true);
  const closeFilterModal = () => setIsFilterModalOpen(false);
  const openReviewModal = () => setIsReviewModalOpen(true);
  const closeReviewModal = () => setIsReviewModalOpen(false);
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

  useEffect(() => {
    if (currentMenu === "후기" && eventData?.eventId) {
      loadReviews();
    }
  }, [currentMenu, eventData?.eventId]);

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
    setReviewsLoading(true);
    try {
      const reviewData = await getEventReviews(eventData.eventId);
      const list = Array.isArray(reviewData) ? reviewData : [];
      
      // 내 리뷰를 최상단으로 정렬
      const sortedList = list.sort((a, b) => {
        const aIsMine = isMineReview(a, currentUserId);
        const bIsMine = isMineReview(b, currentUserId);
        
        // 내 리뷰가 있으면 맨 위로
        if (aIsMine && !bIsMine) return -1;
        if (!aIsMine && bIsMine) return 1;
        
        // 둘 다 내 리뷰이거나 둘 다 내 리뷰가 아니면 기존 순서 유지
        return 0;
      });
      
      setReviews(sortedList);

      if (currentUserId != null) {
        const mine = list.some((rv) => isMineReview(rv, currentUserId));
        setHasMyReview(mine);
        if (typeof window !== "undefined") {
          const k = reviewKey(eventData.eventId, currentUserId);
          if (mine) localStorage.setItem(k, "1");
          else localStorage.removeItem(k);
        }
      }
    } catch (error) {
      console.error("후기 데이터 로드 실패:", error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleReviewAdded = async (savedReview) => {
    setHasMyReview(true);
    if (typeof window !== "undefined" && currentUserId != null) {
      localStorage.setItem(reviewKey(eventData.eventId, currentUserId), "1");
    }
    await loadReviews();
    try {
      const raw = await getEventById(eventData.eventId);
      const updated = mapDetail(raw);
      setEventData(updated);
      console.log("이벤트 데이터 업데이트 완료:", updated);
    } catch (error) {
      console.error("이벤트 데이터 업데이트 실패:", error);
    }
  };

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

      <div className="min-h-50">
        {currentMenu === menuList[0] && (
          // 이벤트 상세 정보
          <EventDetail eventData={eventData} />
        )}

        {currentMenu === menuList[1] && (
          // 이벤트 리뷰
          <>
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
                commonProps={{ currentUserId }}
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
              eventData={eventData}
            />
          </>
        )}

        {currentMenu === menuList[2] && (
          // 모집중인 동행
          <>
            <SearchFilterSort
              enableViewType
              viewType={togetherViewType}
              setViewType={setTogetherViewType}
              filterAction={openFilterModal}
            />
            {togetherViewType === "Gallery" ? (
              <GalleryLayout
                Component={TogetherGallery}
                items={togetherData.filter(
                  (item) => item.eventId === eventData.eventId
                )}
              />
            ) : (
              <ListLayout
                Component={TogetherList}
                items={togetherData.filter(
                  (item) => item.eventId === eventData.eventId
                )}
              />
            )}
            {/* 필터 모달창 => 동행용 필터로 추후 교체 예정 */}
            <EventFilterModal
              isOpen={isFilterModalOpen}
              onClose={closeFilterModal}
            />
          </>
        )}
      </div>
    </>
  );
}
