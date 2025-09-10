import { api, unwrap } from "@/lib/apiBase";

// 이벤트 상세 정보 조회 (실제 API 응답 구조 반영)
export async function getEventById(eventId) {
  const data = await unwrap(api.get(`/v1/events/${eventId}`));

  // 지역 정보 처리
  const locationString = data.region
    ? `${data.region.city} ${data.region.district}`
    : data.eventLocation || "미정";

  // 티켓 가격 정보 처리
  const priceString =
    data.ticketPrices?.length > 0
      ? data.ticketPrices
          .map((p) => `${p.seatGrade}석 ${p.price.toLocaleString()}원`)
          .join(", ")
      : "미정";

  return {
    eventId: data.id,
    title: data.title,
    content: data.content || "", // 상세 설명
    location: locationString,
    eventLocation: data.eventLocation || "미정",
    address: data.region
      ? `${data.region.country} ${data.region.city} ${data.region.district}`
      : "",
    startDate: data.startDate,
    endDate: data.endDate,
    viewTime: "미정", // API에 durationMin 없음
    ageLimit: "전체관람가", // API에 minAge 없음
    price: priceString,
    eventType: data.eventType,
    imgSrc: data.mainImageUrl
      ? data.mainImageUrl.startsWith("http")
        ? data.mainImageUrl
        : `http://localhost:8080${data.mainImageUrl}`
      : "/img/default_img.svg",
    alt: data.title,
    isHot: false,
    score: data.avgRating ? Number(data.avgRating) : 0,
    avgRating: data.avgRating ? Number(data.avgRating) : 0,
    reviewCount: data.reviewCount || 0,
    likesCount: data.interestCount || 0,
    viewCount: data.viewCount || 0,
    contentImageUrls: data.contentImageUrls || [], // 상세 이미지들
    ticketPrices: data.ticketPrices || [],
    region: data.region || null,
  };
}

// 이벤트 후기 목록 조회
export async function getEventReviews(eventId) {
  const data = await unwrap(api.get(`/v1/event-reviews/${eventId}`));

  return data.map((review) => ({
    id: review.id,
    eventId: review.eventId,
    memberId: review.author?.id || review.author?.memberId, // author에서 ID 추출
    rating: review.rating,
    content: review.content || "",
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    // 사용자 정보도 함께 보관
    author: review.author,
  }));
}

// 이벤트 후기 작성
export async function createEventReview(reviewData) {
  const data = await unwrap(
    api.post("/v1/event-reviews", {
      eventId: reviewData.eventId,
      rating: reviewData.rating,
      content: reviewData.content,
      // memberId 제거 - 백엔드에서 인증된 사용자 정보 사용
    })
  );

  return data;
}

// 전체 이벤트 목록 조회 (실제 API 응답 구조 반영)
export async function getAllEvents() {
  const data = await unwrap(api.get("/v1/events"));

  return data.map((event) => {
    const locationString = event.region
      ? `${event.region.city} ${event.region.district}`
      : event.eventLocation || "미정";

    return {
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      location: locationString,
      imgSrc: event.mainImageUrl
        ? event.mainImageUrl.startsWith("http")
          ? event.mainImageUrl
          : `http://localhost:8080${event.mainImageUrl}`
        : "/img/default_img.svg",
      alt: event.title,
      href: `/events/${event.id}`,
      isHot: false,
      eventType: event.eventType,
      id: event.id.toString(),
      viewCount: event.viewCount || 0,
      interestCount: event.interestCount || 0,
      region: event.region,
    };
  });
}

// 이벤트 검색 (실제 API 응답 구조 반영)
export async function searchEvents(searchParams = {}) {
  const params = new URLSearchParams();

  if (searchParams.keyword) params.append("keyword", searchParams.keyword);
  if (searchParams.eventType)
    params.append("eventType", searchParams.eventType);
  if (searchParams.regionDto)
    params.append("regionDto", searchParams.regionDto);
  if (searchParams.startDate)
    params.append("startDate", searchParams.startDate);
  if (searchParams.endDate) params.append("endDate", searchParams.endDate);

  const data = await unwrap(api.get(`/v1/events/search?${params.toString()}`));

  return data.map((event) => {
    const locationString = event.region
      ? `${event.region.city} ${event.region.district}`
      : event.eventLocation || "미정";

    return {
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      location: locationString,
      imgSrc: event.mainImageUrl
        ? event.mainImageUrl.startsWith("http")
          ? event.mainImageUrl
          : `http://localhost:8080${event.mainImageUrl}`
        : "/img/default_img.svg",
      alt: event.title,
      href: `/events/${event.id}`,
      isHot: false,
      eventType: event.eventType,
      id: event.id.toString(),
      viewCount: event.viewCount || 0,
      interestCount: event.interestCount || 0,
      region: event.region,
    };
  });
}

// 타입별 이벤트 조회
export async function getEventsByType(eventType) {
  if (eventType === "전체") {
    return getAllEvents();
  }

  const typeMapping = {
    뮤지컬: "MUSICAL",
    영화: "MOVIE",
    연극: "THEATER",
    전시: "EXHIBITION",
    "클래식/무용": "CLASSIC",
    "콘서트/페스티벌": "CONCERT",
    지역행사: "LOCAL_EVENT",
    기타: "OTHER",
  };

  const backendType = typeMapping[eventType];
  if (!backendType) {
    return getAllEvents();
  }

  return searchEvents({ eventType: backendType });
}

// 내 리뷰 목록 조회 (백엔드 전용)
export async function getMyEventReviewsFromAPI() {
  const data = await unwrap(api.get("/v1/event-reviews/my"));

  return data.map((review) => ({
    id: review.id,
    reviewId: review.id,
    rating: review.rating,
    content: review.content ?? "",
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    // 작성자
    author: review.author ?? null,
    userNickname: review.author?.nickname ?? "익명",
    userProfileImg: review.author?.thumbnailImagePath ?? "",
    // 이벤트
    event: review.event
      ? {
          id: review.event.id,
          name: review.event.title,
          type: review.event.eventType,
          image: review.event.thumbnailImagePath
            ? review.event.thumbnailImagePath.startsWith("http")
              ? review.event.thumbnailImagePath
              : `http://localhost:8080${review.event.thumbnailImagePath}`
            : "/img/default_img.svg",
        }
      : null,
  }));
}

// 해당 이벤트의 동행 모집글 조회 (임시 - TogetherController에 eventId 검색이 없어서)
export async function getEventTogethers(eventId) {
  // 현재 TogetherController에 eventId로 검색하는 API가 없음
  // 임시로 전체 조회 후 필터링 (백엔드에 API 추가 필요)
  try {
    const data = await unwrap(api.get("/v1/together"));
    return data.filter((together) => together.eventId === eventId);
  } catch (error) {
    console.warn("동행 데이터를 가져올 수 없습니다:", error);
    return [];
  }
}

// 이벤트 관심 등록/해제
export async function toggleEventInterest(eventId, memberId) {
  const data = await unwrap(
    api.post(`/v1/events/${eventId}/interest?memberId=${memberId}`)
  );
  return data; // "관심 등록" 또는 "관심 취소"
}
