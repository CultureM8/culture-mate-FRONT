const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT_EVENT_REVIEWS || "/event-reviews";

const API_URL = `${BASE_URL}${API_BASE}${ENDPOINT}`;

// 공통 헤더 생성 함수
const getHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
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

// 이벤트 리뷰 목록 조회 (eventId 필수 파라미터)
export const getEventReviews = async (eventId) => {
  try {
    if (!eventId) {
      throw new Error('eventId는 필수 파라미터입니다.');
    }

    const response = await fetch(`${API_URL}?eventId=${eventId}`, {
      method: 'GET',
      credentials: 'include', // 추가
      headers: getHeaders(),
    });

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error('이벤트 리뷰 목록 조회 오류:', error);
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

// 이벤트 리뷰 등록
export const createEventReview = async (eventReviewData) => {
  try {
    // 필수 필드 검증
    if (!eventReviewData.eventId) {
      throw new Error('eventId는 필수입니다.');
    }
    if (!eventReviewData.memberId) {
      throw new Error('memberId는 필수입니다.');
    }
    if (!eventReviewData.content || eventReviewData.content.trim().length === 0) {
      throw new Error('리뷰 내용은 필수입니다.');
    }
    if (!eventReviewData.rating || eventReviewData.rating < 1 || eventReviewData.rating > 5) {
      throw new Error('평점은 1-5 사이의 값이어야 합니다.');
    }

    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      credentials: 'include', // 추가
      headers: getHeaders(true),
      body: JSON.stringify(eventReviewData),
    });

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error('이벤트 리뷰 등록 오류:', error);
    throw error;
  }
};

// 특정 이벤트 리뷰 수정
export const updateEventReview = async (reviewId, eventReviewData) => {
  try {
    if (!reviewId) {
      throw new Error('reviewId는 필수입니다.');
    }

    const response = await fetch(`${API_URL}/${reviewId}`, {
      method: 'PUT',
      credentials: 'include', // 추가
      headers: getHeaders(true),
      body: JSON.stringify(eventReviewData),
    });

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error('이벤트 리뷰 수정 오류:', error);
    throw error;
  }
};

// 특정 이벤트 리뷰 삭제
export const deleteEventReview = async (reviewId) => {
  try {
    if (!reviewId) {
      throw new Error('reviewId는 필수입니다.');
    }

    const response = await fetch(`${API_URL}/${reviewId}`, {
      method: 'DELETE',
      credentials: 'include', // 추가
      headers: getHeaders(true),
    });

    await handleApiError(response);
    
    // DELETE 요청은 보통 204 No Content를 반환
    if (response.status === 204) {
      return { success: true, message: '리뷰가 성공적으로 삭제되었습니다.' };
    }
    
    return await response.json();
  } catch (error) {
    console.error('이벤트 리뷰 삭제 오류:', error);
    throw error;
  }
};

// 기본 export
export default {
  getEventReviews,
  getAllEventReviews,
  createEventReview,
  updateEventReview,
  deleteEventReview
};