const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";
const ENDPOINT =
  process.env.NEXT_PUBLIC_ENDPOINT_EVENT_REVIEWS || "/event-reviews";

const API_URL = `${BASE_URL}${API_BASE}${ENDPOINT}`;

// 공통 헤더
const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// 공통 에러 처리
const handleApiError = async (response) => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }
  return response;
};

/**
 * GET /api/v1/event-reviews/{eventId}
 */
export const getEventReviews = async (eventId) => {
  try {
    if (!eventId) throw new Error("eventId는 필수 파라미터입니다.");
    const url = `${API_URL}/${eventId}?_=${Date.now()}`; // 캐시 무력화
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: getHeaders(),
      cache: "no-store",
    });
    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error("eventReviewApi.getEventReviews 에러:", error);
    throw error;
  }
};

/**
 * GET /api/v1/event-reviews/my
 */
export const getMyEventReviews = async () => {
  try {
    const response = await fetch(`${API_URL}/my`, {
      method: "GET",
      credentials: "include",
      headers: getHeaders(),
    });
    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error("eventReviewApi.getMyEventReviews 에러:", error);
    throw error;
  }
};

export const getAllEventReviews = async (eventId = 1) => {
  try {
    return await getEventReviews(eventId);
  } catch (error) {
    console.error("전체 이벤트 리뷰 조회 오류:", error);
    throw error;
  }
};

/**
 * POST /api/v1/event-reviews
 */
export const createEventReview = async (eventReviewData) => {
  try {
    if (!eventReviewData.eventId) throw new Error("eventId는 필수입니다.");
    if (!eventReviewData.content || eventReviewData.content.trim().length === 0)
      throw new Error("리뷰 내용은 필수입니다.");
    if (
      !eventReviewData.rating ||
      eventReviewData.rating < 1 ||
      eventReviewData.rating > 5
    )
      throw new Error("평점은 1-5 사이의 값이어야 합니다.");

    const response = await fetch(`${API_URL}`, {
      method: "POST",
      credentials: "include",
      headers: getHeaders(),
      body: JSON.stringify(eventReviewData),
    });
    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error("eventReviewApi.createEventReview 에러:", error);
    throw error;
  }
};

/**
 * PUT /api/v1/event-reviews/{id}
 */
export const updateEventReview = async (reviewId, eventReviewData) => {
  try {
    if (!reviewId) throw new Error("reviewId는 필수입니다.");

    const response = await fetch(`${API_URL}/${reviewId}`, {
      method: "PUT",
      credentials: "include",
      headers: getHeaders(),
      body: JSON.stringify(eventReviewData),
    });
    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error("eventReviewApi.updateEventReview 에러:", error);
    throw error;
  }
};

/**
 * DELETE /api/v1/event-reviews/{id}
 */
export const deleteEventReview = async (reviewId) => {
  try {
    if (!reviewId) throw new Error("reviewId는 필수입니다.");

    const url = `${API_URL}/${reviewId}`;
    const response = await fetch(url, {
      method: "DELETE",
      credentials: "include",
      headers: getHeaders(),
    });
    await handleApiError(response);

    const ct = response.headers.get("content-type") || "";
    if (response.status === 204)
      return { success: true, message: "리뷰가 성공적으로 삭제되었습니다." };
    if (!ct.includes("application/json")) {
      const text = await response.text().catch(() => "");
      return {
        success: true,
        message: text || "리뷰가 성공적으로 삭제되었습니다.",
      };
    }
    return await response.json();
  } catch (error) {
    console.error("eventReviewApi.deleteEventReview 에러:", error);
    throw error;
  }
};

/**
 * (경로가 이벤트 포함인 서버용)
 * DELETE /api/v1/events/{eventId}/reviews/{reviewId}
 */
export const deleteEventReviewByEvent = async (eventId, reviewId) => {
  if (!eventId) throw new Error("eventId는 필수입니다.");
  if (!reviewId) throw new Error("reviewId는 필수입니다.");

  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";
  const url = `${base}${apiBase}/events/${eventId}/reviews/${reviewId}`;
  console.log("[DELETE Review(EventRoute)] →", url);

  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
    headers: getHeaders(),
  });
  await handleApiError(res);

  const ct = res.headers.get("content-type") || "";
  if (res.status === 204) return { success: true };
  if (!ct.includes("application/json")) {
    const txt = await res.text().catch(() => "");
    return { success: true, message: txt || "deleted" };
  }
  return await res.json();
};

/**
 * 검증
 */
export const validateReviewData = (reviewData) => {
  const errors = [];
  if (!reviewData.eventId) errors.push("이벤트 ID는 필수입니다.");
  if (!reviewData.content || reviewData.content.trim().length === 0)
    errors.push("리뷰 내용을 입력해주세요.");
  if (reviewData.content && reviewData.content.length > 1000)
    errors.push("리뷰 내용은 1000자 이내로 입력해주세요.");
  if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5)
    errors.push("평점은 1-5 사이의 값이어야 합니다.");

  return { isValid: errors.length === 0, errors };
};

const eventReviewApi = {
  getEventReviews,
  getMyEventReviews,
  getAllEventReviews,
  createEventReview,
  updateEventReview,
  deleteEventReview,
  deleteEventReviewByEvent,
  validateReviewData,
};

export default eventReviewApi;
