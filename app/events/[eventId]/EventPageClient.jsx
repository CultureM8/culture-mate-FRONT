"use client";
import { getEventReviews } from "@/lib/eventApi";
import EventDetail from "@/components/events/detail/EventDetail";
import GalleryLayout from "@/components/global/GalleryLayout";
import HorizontalTab from "@/components/global/HorizontalTab";
import TogetherGallery from "@/components/together/TogetherGallery";
import { useState, useEffect } from "react";
import { togetherData } from "@/lib/togetherData";
import { eventReviewData } from "@/lib/eventReviewData";
import SearchFilterSort from "@/components/global/SearchFilterSort";
import EventFilterModal from "@/components/events/main/EventFilterModal";
import ListLayout from "@/components/global/ListLayout";
import TogetherList from "@/components/together/TogetherList";
import EventReviewList from "@/components/events/detail/review/EventReviewList";
import EventReviewModal from "@/components/events/detail/review/EventReviewModal";

export default function EventPageClient({ eventData }) {
  const [currentMenu, setCurrentMenu] = useState("상세 정보");
  const menuList = ["상세 정보", "후기", "모집중인 동행"];
  const [togetherViewType, setTogetherViewType] = useState("List");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviews, setReviews] = useState(
    eventReviewData.filter((item) => item.eventId === eventData.eventId)
  );
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const openFilterModal = () => setIsFilterModalOpen(true);
  const closeFilterModal = () => setIsFilterModalOpen(false);
  const openReviewModal = () => setIsReviewModalOpen(true);
  const closeReviewModal = () => setIsReviewModalOpen(false);

  // 후기 데이터 로드
  useEffect(() => {
    if (currentMenu === "후기" && eventData?.eventId) {
      loadReviews();
    }
  }, [currentMenu, eventData?.eventId]);

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const reviewData = await getEventReviews(eventData.eventId);
      setReviews(reviewData);
    } catch (error) {
      console.error("후기 데이터 로드 실패:", error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };
  const handleReviewAdded = (newReview) => {
    setReviews((prev) => [...prev, newReview]);
  };

  return (
    <>
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
        {/* {currentMenu === menuList[1] && (
          // 이벤트 리뷰
          <>
            <div className="flex justify-end py-4">
              <button
                onClick={openReviewModal}
                className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
                후기 작성
              </button>
            </div>
            <ListLayout Component={EventReviewList} items={reviews} />
            <EventReviewModal
              isOpen={isReviewModalOpen}
              onClose={closeReviewModal}
              eventId={eventData.eventId}
              onReviewAdded={handleReviewAdded}
              eventData={eventData}
            />
          </>
        )} */}
        {/* 백엔드 */}
        {currentMenu === menuList[1] && (
          // 이벤트 리뷰
          <>
            <div className="flex justify-end py-4">
              <button
                onClick={openReviewModal}
                className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
                후기 작성
              </button>
            </div>
            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <div>후기를 불러오는 중...</div>
              </div>
            ) : reviews.length > 0 ? (
              <ListLayout Component={EventReviewList} items={reviews} />
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
            {/* 필터 모달창 => 동행용 필터로 추후에 교체해야함. */}
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
