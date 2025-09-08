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
    score: 0, // API에 avgRating 없음
    likesCount: data.interestCount || 0,
    viewCount: data.viewCount || 0,
    contentImageUrls: data.contentImageUrls || [], // 상세 이미지들
    ticketPrices: data.ticketPrices || [],
    region: data.region || null,
  };
}

// 이벤트 후기 목록 조회 (실제 API 응답 구조 반영)
export async function getEventReviews(eventId) {
  const data = await unwrap(api.get(`/v1/event-reviews?eventId=${eventId}`));

  return data.map((review) => ({
    id: review.id,
    eventId: review.eventId,
    userNickname: review.author?.nickname || "익명",
    userProfileImg: review.author?.profileImageUrl || "",
    userProfileImgAlt: review.author?.nickname || "프로필",
    content: review.content || "",
    score: review.rating || 0,
    createdDate: new Date(review.createdAt)
      .toLocaleDateString("ko-KR", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\. /g, ".")
      .replace(/\.$/, ""),
    // 원본 데이터도 보관
    author: review.author,
    rating: review.rating,
    createdAt: review.createdAt,
  }));
}

// 이벤트 후기 작성
export async function createEventReview(reviewData) {
  const data = await unwrap(
    api.post("/v1/event-reviews", {
      eventId: reviewData.eventId,
      memberId: reviewData.memberId,
      rating: reviewData.rating,
      content: reviewData.content,
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

// 내 리뷰 목록 조회 (임시방편: 전체 리뷰에서 필터링)
export async function getMyEventReviewsFromAPI({ memberId }) {
  // 중첩 객체 처리
  const actualMemberId = memberId?.memberId || memberId;
  console.log("실제 사용할 memberId:", actualMemberId);

  if (!actualMemberId) {
    return [];
  }

  try {
    console.log("API 호출 시작 - /v1/events");
    const events = await unwrap(api.get("/v1/events"));

    const allReviews = [];

    // 각 이벤트의 리뷰들을 병렬로 조회

    const reviewPromises = events.map(async (event) => {
      try {
        const reviews = await unwrap(
          api.get(`/v1/event-reviews?eventId=${event.id}`)
        );

        const myReviews = reviews.filter(
          (review) => review.author?.id === actualMemberId
        );
        console.log(`이벤트 ${event.id} - 내 리뷰: ${myReviews.length}개`);
        return myReviews;
      } catch (error) {
        console.warn(`이벤트 ${event.id} 리뷰 조회 실패:`, error);
        return [];
      }
    });

    const reviewResults = await Promise.all(reviewPromises);
    reviewResults.forEach((reviews) => allReviews.push(...reviews));

    console.log("최종 내 리뷰 개수:", allReviews.length);

    // 프론트엔드 형식으로 변환
    return allReviews.map((review) => ({
      id: review.id,
      reviewId: review.id,
      eventId: review.eventId,
      userNickname: review.author?.nickname || "익명",
      userProfileImg: review.author?.profileImageUrl || "",
      userProfileImgAlt: review.author?.nickname || "프로필",
      content: review.content || "",
      score: review.rating || 0,
      rating: review.rating || 0,
      createdDate: new Date(review.createdAt)
        .toLocaleDateString("ko-KR", {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\. /g, ".")
        .replace(/\.$/, ""),
      createdAt: review.createdAt,
      // 이벤트 정보는 별도로 조회해야 함 (현재 API 응답에 없음)
      event: {
        name: "이벤트", // 추후 이벤트 정보 조회로 보강
        type: "이벤트",
        image: "/img/default_img.svg",
      },
    }));
  } catch (error) {
    console.error("내 리뷰 조회 실패:", error);
    return [];
  }
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
