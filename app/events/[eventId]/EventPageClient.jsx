"use client";

import { getEventReviews } from "@/lib/api/eventReviewApi";
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
import { useRouter } from "next/navigation";

/** region → location 문자열(undef-safe) */
const toLocation = (obj) => {
  // 백엔드 RegionDto.Response 구조 (level1, level2, level3)
  const level1 =
    typeof obj?.region?.level1 === "string" ? obj.region.level1.trim() : "";
  const level2 =
    typeof obj?.region?.level2 === "string" ? obj.region.level2.trim() : "";
  const level3 =
    typeof obj?.region?.level3 === "string" ? obj.region.level3.trim() : "";

  // 기존 구조 호환성 (city, district)
  const city =
    typeof obj?.region?.city === "string" ? obj.region.city.trim() : "";
  const district =
    typeof obj?.region?.district === "string" ? obj.region.district.trim() : "";

  // level 구조를 우선 사용, 없으면 기존 구조 사용
  const parts =
    level1 || level2 || level3
      ? [level1, level2, level3].filter(Boolean)
      : [city, district].filter(Boolean);

  return parts.length > 0
    ? parts.join(" ")
    : (obj?.eventLocation && String(obj.eventLocation).trim()) || "미정";
};

const mapDetail = (data) => {
  console.log("mapDetail - input data:", data);
  console.log("mapDetail - isInterested from backend:", data?.isInterested);

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

  // 백엔드 RegionDto.Response 구조에 맞게 수정
  const regionLevel1 = data?.region?.level1 || "";
  const regionLevel2 = data?.region?.level2 || "";
  const regionLevel3 = data?.region?.level3 || "";
  const fullAddr = [regionLevel1, regionLevel2, regionLevel3]
    .filter(Boolean)
    .join(" ");

  const result = {
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
    imgSrc: getEventMainImageUrl(data, true), // EventInfo용이므로 고화질 사용
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
    isInterested: Boolean(data.isInterested), // 백엔드에서 받은 관심 상태 매핑
  };

  console.log("mapDetail - output result:", result);
  return result;
};

// 동행 데이터 매핑 함수
const mapTogetherData = (together) => {
  const togetherId = together.id || null;

  return {
    // 기본 식별자
    id: togetherId,
    togetherId: togetherId,

    // 제목/내용
    title: together.title || "제목 없음",
    content: together.content || "",

    // 이벤트 정보
    eventType: together.event?.eventType || "기타",
    eventName: together.event?.title || together.event?.eventName || "이벤트명",
    eventSnapshot: together.event,
    event: together.event,

    // 호스트 정보
    host: together.host,
    hostId: together.host?.id,
    hostNickname: together.host?.nickname || together.host?.displayName,
    hostLoginId: together.host?.loginId || together.host?.login_id,

    // 참여자 정보
    maxParticipants: together.maxParticipants,
    currentParticipants: together.currentParticipants,
    group: `${together.currentParticipants || 0}/${together.maxParticipants}`,

    // 날짜 및 장소
    meetingDate: together.meetingDate,
    date: together.meetingDate,
    meetingLocation: together.meetingLocation,
    region: together.region,
    address: together.meetingLocation || "",

    // 상태
    active: together.active,
    isClosed: !together.active,
    isInterested: together.isInterested || false,

    // 이미지 - getEventMainImageUrl 사용
    imgSrc: together.event
      ? getEventMainImageUrl(together.event)
      : "/img/default_img.svg",

    // href
    href: `/together/${togetherId}`,

    // 기타
    _key: `together_${togetherId}`,
  };
};

export default function EventPageClient({ eventData: initialEventData }) {
  const router = useRouter();
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
    await updateEventData();
  };

  // 리뷰 편집 처리
  const handleEditReview = (reviewData) => {
    setEditingReview(reviewData);
    setIsReviewModalOpen(true);
  };

  // 리뷰 수정 완룉 처리
  const handleReviewUpdated = async (updatedReview) => {
    setEditingReview(null);
    await loadReviews();
    await updateEventData();
  };

  // 모집중인 동행 > 글쓰기 버튼 동작 (TogetherPage와 동일 경로/가드)
  const handleWriteTogether = () => {
    console.log("handleWriteTogether 호출됨");
    console.log("현재 로그인 상태:", { ready, isLogined, user, currentUserId });

    const eid = eventData?.eventId || eventData?.id;
    console.log("이벤트 ID:", eid);

    const qs = eid ? `?eventId=${encodeURIComponent(String(eid))}` : "";
    const targetUrl = `/together/write${qs}`;

    console.log("이동할 URL:", targetUrl);

    if (ready && isLogined && currentUserId != null) {
      console.log("로그인된 상태로 이동");
      router.push(targetUrl);
    } else {
      console.log("비로그인 상태로 로그인 페이지로 이동");
      router.push(`/login?next=${encodeURIComponent(targetUrl)}`);
    }
  };

  // 이벤트 데이터 업데이트 (공통 로직)
  const updateEventData = async () => {
    try {
      const raw = await getEventById(eventData.eventId);
      const updated = mapDetail(raw);
      setEventData(updated);
      console.log("이벤트 데이터 업데이트 완료:", updated);
    } catch (error) {
      console.error("이벤트 데이터 업데이트 실패:", error);
    }
  };

  // 관심 상태 변경 이벤트 리스너
  useEffect(() => {
    if (!eventData?.eventId) return;

    const handleInterestChanged = (event) => {
      const { eventId: changedEventId, interested } = event.detail;

      if (String(changedEventId) === String(eventData.eventId)) {
        console.log("EventPageClient - 관심 상태 변경 감지:", interested);

        // 즉시 UI 업데이트 (빠른 반응) - likesCount도 함께 업데이트
        setEventData((prev) => ({
          ...prev,
          isInterested: Boolean(interested),
          likesCount: interested
            ? (prev.likesCount || 0) + 1
            : Math.max((prev.likesCount || 0) - 1, 0),
        }));

        // 백엔드에서 최신 상태도 비동기로 가져오기 (정확성 보장)
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

  // 동행 데이터 로드 함수
  const loadTogetherData = async () => {
    console.log("loadTogetherData 함수 실행됨");

    if (!eventData?.eventId) {
      console.log("eventId가 없어서 동행 데이터 로드 건너뜀");
      return;
    }

    setTogetherLoading(true);
    try {
      console.log("동행 데이터 로드 시작, eventId:", eventData.eventId);
      console.log("togetherApi.search 호출 전");

      const togetherList = await togetherApi.search({
        eventId: eventData.eventId,
      });

      console.log("동행 데이터 로드 성공:", togetherList);
      const safeList = Array.isArray(togetherList) ? togetherList : [];

      // 동행 데이터 매핑 적용
      const mappedData = safeList.map(mapTogetherData);
      console.log("매핑된 동행 데이터:", mappedData);
      setTogetherData(mappedData);
    } catch (error) {
      console.error("동행 데이터 로드 실패:", error);
      console.error("Error details:", error.message, error.stack);
      setTogetherData([]);
    } finally {
      setTogetherLoading(false);
      console.log("동행 데이터 로드 완료");
    }
  };

  // 모집중인 동행 탭으로 이동했을 때 데이터 로드
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
                commonProps={{ currentUserId, onEditReview: handleEditReview }}
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
          </>
        )}

        {currentMenu === menuList[2] && (
          // 모집중인 동행
          <>
            <div className="flex items-center justify-between">
              <SearchFilterSort
                enableViewType
                viewType={togetherViewType}
                setViewType={setTogetherViewType}
                filterAction={openFilterModal}
              />
              <button
                onClick={(e) => {
                  try {
                    console.log("글쓰기 버튼 클릭됨");
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
