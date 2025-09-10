import { api, unwrap } from "@/lib/apiBase";

// 이벤트 상세 정보 조회 (실제 API 응답 구조 반영)
export async function getEventById(eventId) {
  try {
    const data = await unwrap(api.get(`/v1/events/${eventId}`));

    if (!data) {
      throw new Error("이벤트 데이터를 찾을 수 없습니다.");
    }

    // 지역 정보 처리
    const locationString = data.region
      ? `${data.region.city} ${data.region.district}`
      : data.eventLocation || "미정";

    // 티켓 가격 정보 처리
    const priceString =
      data.ticketPrices?.length > 0
        ? data.ticketPrices
            .map((p) => `${p.ticketType} ${p.price.toLocaleString()}원`)
            .join(", ")
        : "미정";

    // ticketType 처리 - ticketPrices에서 추출
    const ticketTypes =
      data.ticketPrices?.length > 0
        ? data.ticketPrices.map((p) => p.ticketType).join(", ")
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
      ticketType: ticketTypes,
      price: priceString,
      priceList:
        data.ticketPrices?.length > 0
          ? data.ticketPrices.map((p) => ({
              type: p.ticketType,
              price: p.price.toLocaleString(),
            }))
          : [],
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
  } catch (error) {
    console.error(`getEventById(${eventId}) 에러:`, error);
    throw error; // 상위에서 처리하도록 다시 throw
  }
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
  try {
    const data = await unwrap(api.get("/v1/events"));

    if (!data || !Array.isArray(data)) {
      console.warn("getAllEvents: 유효하지 않은 응답 데이터:", data);
      return [];
    }

    return data.map((event) => {
      const city =
        typeof event?.region?.city === "string" ? event.region.city.trim() : "";
      const district =
        typeof event?.region?.district === "string"
          ? event.region.district.trim()
          : "";
      const locationParts = [city, district].filter(Boolean);
      const locationString =
        locationParts.length > 0
          ? locationParts.join(" ")
          : (event?.eventLocation && String(event.eventLocation).trim()) ||
            "미정";

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
        score: event.avgRating ? Number(event.avgRating) : 0, // 별점 정보 추가
        avgRating: event.avgRating ? Number(event.avgRating) : 0, // 평균 별점
      };
    });
  } catch (error) {
    console.error("getAllEvents 에러:", error);

    // 타임아웃 에러인 경우 특별히 처리
    if (error.message.includes("timeout")) {
      console.warn("API 타임아웃 발생, 빈 배열 반환");
    }

    return []; // 에러 시 빈 배열 반환
  }
}

// 이벤트 검색
export async function searchEvents(searchParams = {}) {
  try {
    const params = new URLSearchParams();

    if (searchParams.keyword) params.append("keyword", searchParams.keyword);
    if (searchParams.eventType)
      params.append("eventType", searchParams.eventType);
    if (searchParams.regionDto)
      params.append("regionDto", searchParams.regionDto);
    if (searchParams.startDate)
      params.append("startDate", searchParams.startDate);
    if (searchParams.endDate) params.append("endDate", searchParams.endDate);

    const data = await unwrap(
      api.get(`/v1/events/search?${params.toString()}`)
    );

    if (!data || !Array.isArray(data)) {
      console.warn("searchEvents: 유효하지 않은 응답 데이터:", data);
      return [];
    }

    return data.map((event) => {
      const city =
        typeof event?.region?.city === "string" ? event.region.city.trim() : "";
      const district =
        typeof event?.region?.district === "string"
          ? event.region.district.trim()
          : "";
      const locationParts = [city, district].filter(Boolean);
      const locationString =
        locationParts.length > 0
          ? locationParts.join(" ")
          : (event?.eventLocation && String(event.eventLocation).trim()) ||
            "미정";

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
        score: event.avgRating ? Number(event.avgRating) : 0, // 별점 정보 추가
        avgRating: event.avgRating ? Number(event.avgRating) : 0, // 평균 별점
      };
    });
  } catch (error) {
    console.error("searchEvents 에러:", error);
    return []; // 에러 시 빈 배열 반환
  }
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
  try {
    const data = await unwrap(api.get("/v1/event-reviews/my"));

    if (!data || !Array.isArray(data)) {
      console.warn(
        "getMyEventReviewsFromAPI: 유효하지 않은 응답 데이터:",
        data
      );
      return [];
    }

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
  } catch (error) {
    console.error("getMyEventReviewsFromAPI 에러:", error);
    return [];
  }
}

// 해당 이벤트의 동행 모집글 조회 (임시)
export async function getEventTogethers(eventId) {
  try {
    const data = await unwrap(api.get("/v1/together"));
    return data.filter((together) => together.eventId === eventId);
  } catch (error) {
    console.warn("동행 데이터를 가져올 수 없습니다:", error);
    return [];
  }
}

export async function toggleEventInterest(eventId) {
  try {
    // 현재 api 인스턴스 설정 확인
    console.log("[api.defaults]", {
      baseURL: api?.defaults?.baseURL,
      withCredentials: api?.defaults?.withCredentials,
      headers: api?.defaults?.headers,
    });

    const res = await api.post(`/v1/events/${eventId}/interest`);
    console.log(
      "[toggleEventInterest] status",
      res.status,
      res.headers,
      res.data
    );

    const data = res.data;

    let interested;
    if (
      data &&
      typeof data === "object" &&
      Object.prototype.hasOwnProperty.call(data, "interested")
    ) {
      interested = !!data.interested;
    } else if (typeof data === "string") {
      const s = data.trim();
      if (s.includes("등록")) interested = true;
      else if (s.includes("취소")) interested = false;
    }

    return { raw: data, interested };
  } catch (err) {
    // 응답/요청/메시지 모두 출력
    console.error("[toggleEventInterest][ERR]", {
      message: err?.message,
      status: err?.response?.status,
      headers: err?.response?.headers,
      data: err?.response?.data,
      reqHeaders: err?.config?.headers,
      url: err?.config?.url,
      method: err?.config?.method,
      baseURL: err?.config?.baseURL,
      withCredentials: err?.config?.withCredentials,
    });
    throw err;
  }
}

export async function getMyInterestedEventsVia(endpoint) {
  const data = await unwrap(api.get(endpoint));
  if (!Array.isArray(data)) return [];

  return data.map((event) => {
    const city =
      typeof event?.region?.city === "string" ? event.region.city.trim() : "";
    const district =
      typeof event?.region?.district === "string"
        ? event.region.district.trim()
        : "";
    const locationParts = [city, district].filter(Boolean);
    const locationString =
      locationParts.length > 0
        ? locationParts.join(" ")
        : (event?.eventLocation && String(event.eventLocation).trim()) ||
          "미정";

    const img = event?.mainImageUrl
      ? event.mainImageUrl.startsWith("http")
        ? event.mainImageUrl
        : `http://localhost:8080${event.mainImageUrl}`
      : "/img/default_img.svg";

    return {
      // EventGallery 카드에서 쓰는 표준 필드
      title: event.title || "",
      imgSrc: img,
      alt: event.title || "",
      href: `/events/${event.id}`,
      startDate: event.startDate || "0000.00.00",
      endDate: event.endDate || "0000.00.00",
      location: locationString,
      score: event.avgRating ? Number(event.avgRating) : 0,
      avgRating: event.avgRating ? Number(event.avgRating) : 0,
      enableInterest: true,
      // 내부 식별
      eventId: event.id,
      eventType: event.eventType,
      isHot: false,
    };
  });
}
