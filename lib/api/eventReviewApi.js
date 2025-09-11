const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT_EVENT_REVIEWS || "/event-reviews";

const API_URL = `${BASE_URL}${API_BASE}${ENDPOINT}`;

// 공통 헤더 생성 함수 (JWT 토큰 자동 추가)
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// 공통 에러 처리 함수
const handleApiError = async (response) => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // JSON 파싱 실패 시 기본 메시지 사용
    }
    throw new Error(errorMessage);
  }
  return response;
};

/**
 * GET /api/v1/event-reviews/{eventId}
 * 특정 이벤트의 리뷰 목록 조회
 * @param {number} eventId - 이벤트 ID (필수)
 * @returns {Promise<Array>} 리뷰 목록
 */
export const getEventReviews = async (eventId) => {
  try {
    if (!eventId) {
      throw new Error('eventId는 필수 파라미터입니다.');
    }

    const response = await fetch(`${API_URL}/${eventId}`, {
      method: 'GET',
      credentials: 'include',
      headers: getHeaders(),
    });

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error('eventReviewApi.getEventReviews 에러:', error);
    throw error;
  }
};

/**
 * GET /api/v1/event-reviews/my
 * 내가 작성한 리뷰 목록 조회 (인증 필요)
 * @returns {Promise<Array>} 내 리뷰 목록 (이벤트 정보 포함)
 */
export const getMyEventReviews = async () => {
  try {
    const response = await fetch(`${API_URL}/my`, {
      method: 'GET',
      credentials: 'include',
      headers: getHeaders(),
    });

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error('eventReviewApi.getMyEventReviews 에러:', error);
    throw error;
  }
};

// 전체 이벤트 리뷰 목록 조회 (테스트용 - eventId 기본값 사용)
export const getAllEventReviews = async (eventId = 1) => {
  try {
    return await getEventReviews(eventId);
  } catch (error) {
    console.error('전체 이벤트 리뷰 조회 오류:', error);
    throw error;
  }
};

/**
 * POST /api/v1/event-reviews
 * 이벤트 리뷰 등록 (인증 필요)
 * @param {Object} eventReviewData - 리뷰 데이터
 * @param {number} eventReviewData.eventId - 이벤트 ID
 * @param {string} eventReviewData.content - 리뷰 내용
 * @param {number} eventReviewData.rating - 평점 (1-5)
 * @returns {Promise<Object>} 생성된 리뷰 정보
 */
export const createEventReview = async (eventReviewData) => {
  try {
    // 필수 필드 검증 (memberId는 백엔드에서 JWT로 처리)
    if (!eventReviewData.eventId) {
      throw new Error('eventId는 필수입니다.');
    }
    if (!eventReviewData.content || eventReviewData.content.trim().length === 0) {
      throw new Error('리뷰 내용은 필수입니다.');
    }
    if (!eventReviewData.rating || eventReviewData.rating < 1 || eventReviewData.rating > 5) {
      throw new Error('평점은 1-5 사이의 값이어야 합니다.');
    }

    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      credentials: 'include',
      headers: getHeaders(),
      body: JSON.stringify(eventReviewData),
    });

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error('eventReviewApi.createEventReview 에러:', error);
    throw error;
  }
};

/**
 * PUT /api/v1/event-reviews/{id}
 * 이벤트 리뷰 수정 (작성자 본인만, 인증 필요)
 * @param {number} reviewId - 리뷰 ID
 * @param {Object} eventReviewData - 수정할 리뷰 데이터
 * @param {string} eventReviewData.content - 리뷰 내용
 * @param {number} eventReviewData.rating - 평점 (1-5)
 * @returns {Promise<Object>} 수정된 리뷰 정보
 */
export const updateEventReview = async (reviewId, eventReviewData) => {
  try {
    if (!reviewId) {
      throw new Error('reviewId는 필수입니다.');
    }

    const response = await fetch(`${API_URL}/${reviewId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: getHeaders(),
      body: JSON.stringify(eventReviewData),
    });

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error('eventReviewApi.updateEventReview 에러:', error);
    throw error;
  }
};

/**
 * DELETE /api/v1/event-reviews/{id}
 * 이벤트 리뷰 삭제 (작성자 본인만, 인증 필요)
 * @param {number} reviewId - 삭제할 리뷰 ID
 * @returns {Promise<void>} 삭제 성공
 */
export const deleteEventReview = async (reviewId) => {
  try {
    if (!reviewId) {
      throw new Error('reviewId는 필수입니다.');
    }

    const response = await fetch(`${API_URL}/${reviewId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getHeaders(),
    });

    await handleApiError(response);
    
    // DELETE 요청은 보통 204 No Content를 반환
    if (response.status === 204) {
      return { success: true, message: '리뷰가 성공적으로 삭제되었습니다.' };
    }
    
    return await response.json();
  } catch (error) {
    console.error('eventReviewApi.deleteEventReview 에러:', error);
    throw error;
  }
};

/**
 * 리뷰 데이터 검증 함수
 * @param {Object} reviewData - 검증할 리뷰 데이터
 * @returns {Object} 검증 결과 { isValid: boolean, errors: Array }
 */
export const validateReviewData = (reviewData) => {
  const errors = [];
  
  if (!reviewData.eventId) {
    errors.push('이벤트 ID는 필수입니다.');
  }
  
  if (!reviewData.content || reviewData.content.trim().length === 0) {
    errors.push('리뷰 내용을 입력해주세요.');
  }
  
  if (reviewData.content && reviewData.content.length > 1000) {
    errors.push('리뷰 내용은 1000자 이내로 입력해주세요.');
  }
  
  if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
    errors.push('평점은 1-5 사이의 값이어야 합니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 기본 export (통일성을 위해 수정)
const eventReviewApi = {
  getEventReviews,
  getMyEventReviews,
  getAllEventReviews,
  createEventReview,
  updateEventReview,
  deleteEventReview,
  validateReviewData
};

export default eventReviewApi;