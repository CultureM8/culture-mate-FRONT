import { IMAGES } from "@/constants/path";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT_EVENTS || "/events";

const API_URL = `${BASE_URL}${API_BASE}${ENDPOINT}`;

// ===== 이벤트 검색 관련 =====

/**
 * 이벤트 목록 조회
 * @param {Object} searchParams - 검색 조건
 * @param {string} searchParams.keyword - 검색 키워드
 * @param {Object} searchParams.regionDto - 지역 정보
 * @param {string} searchParams.regionDto.level1 - 1차 지역 (예: 서울특별시)
 * @param {string} searchParams.regionDto.level2 - 2차 지역 (예: 강남구)
 * @param {string} searchParams.regionDto.level3 - 3차 지역 (예: 역삼동)
 * @param {string} searchParams.eventType - 이벤트 타입 (MUSICAL, MOVIE, THEATER, etc.)
 * @param {string} searchParams.startDate - 시작일 (YYYY-MM-DD)
 * @param {string} searchParams.endDate - 종료일 (YYYY-MM-DD)
 * @param {boolean} searchParams.empty - 빈 값 여부
 * @returns {Promise<Array>} 이벤트 목록
 */
export const getEvents = async (searchParams = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // 검색 조건들을 쿼리 파라미터로 추가
    if (searchParams.keyword) {
      queryParams.append('keyword', searchParams.keyword);
    }
    
    if (searchParams.regionDto) {
      if (searchParams.regionDto.level1) {
        queryParams.append('regionDto.level1', searchParams.regionDto.level1);
      }
      if (searchParams.regionDto.level2) {
        queryParams.append('regionDto.level2', searchParams.regionDto.level2);
      }
      if (searchParams.regionDto.level3) {
        queryParams.append('regionDto.level3', searchParams.regionDto.level3);
      }
    }
    
    if (searchParams.eventType) {
      queryParams.append('eventType', searchParams.eventType);
    }
    
    if (searchParams.startDate) {
      queryParams.append('startDate', searchParams.startDate);
    }
    
    if (searchParams.endDate) {
      queryParams.append('endDate', searchParams.endDate);
    }
    
    if (searchParams.empty !== undefined) {
      queryParams.append('empty', searchParams.empty);
    }

    const url = `${API_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include', // 추가
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`이벤트 목록 조회 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('이벤트 목록 조회 에러:', error);
    throw error;
  }
};

/**
 * 이벤트 검색
 * @param {Object} searchParams - 검색 조건 (getEvents와 동일한 파라미터)
 * @returns {Promise<Array>} 검색된 이벤트 목록
 */
export const searchEvents = async (searchParams = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (searchParams.keyword) {
      queryParams.append('keyword', searchParams.keyword);
    }
    
    if (searchParams.regionDto) {
      if (searchParams.regionDto.level1) {
        queryParams.append('regionDto.level1', searchParams.regionDto.level1);
      }
      if (searchParams.regionDto.level2) {
        queryParams.append('regionDto.level2', searchParams.regionDto.level2);
      }
      if (searchParams.regionDto.level3) {
        queryParams.append('regionDto.level3', searchParams.regionDto.level3);
      }
    }
    
    if (searchParams.eventType) {
      queryParams.append('eventType', searchParams.eventType);
    }
    
    if (searchParams.startDate) {
      queryParams.append('startDate', searchParams.startDate);
    }
    
    if (searchParams.endDate) {
      queryParams.append('endDate', searchParams.endDate);
    }
    
    if (searchParams.empty !== undefined) {
      queryParams.append('empty', searchParams.empty);
    }

    const url = `${API_URL}/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include', // 추가
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`이벤트 검색 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('이벤트 검색 에러:', error);
    throw error;
  }
};

// ===== 이벤트 CRUD 관련 =====

/**
 * 특정 이벤트 상세 조회
 * @param {number} eventId - 이벤트 ID
 * @returns {Promise<Object>} 이벤트 상세 정보
 */
export const getEventById = async (eventId) => {
  try {
    const response = await fetch(`${API_URL}/${eventId}`, {
      method: 'GET',
      credentials: 'include', // 추가
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`이벤트 조회 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('이벤트 조회 에러:', error);
    throw error;
  }
};

/**
 * POST /api/v1/events (multipart/form-data)
 * 새 이벤트 생성 (이미지 업로드 지원)
 * @param {Object} eventData - 이벤트 생성 데이터
 * @param {File} mainImage - 메인 이미지 파일 (선택사항)
 * @param {File[]} imagesToAdd - 내용 이미지 파일 배열 (선택사항)
 * @returns {Promise<Object>} 생성된 이벤트 정보
 */
export const createEvent = async (eventData, mainImage = null, imagesToAdd = null) => {
  try {
    const formData = new FormData();
    
    // 이벤트 데이터를 JSON 문자열로 만들어 추가
    formData.append('eventRequestDto', JSON.stringify(eventData));
    
    // 메인 이미지 추가
    if (mainImage) {
      formData.append('mainImage', mainImage);
    }
    
    // 내용 이미지들 추가
    if (imagesToAdd && imagesToAdd.length > 0) {
      imagesToAdd.forEach(image => {
        formData.append('imagesToAdd', image);
      });
    }

    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      credentials: 'include',
      // Content-Type 헤더를 설정하지 않음 (브라우저가 자동으로 multipart/form-data 설정)
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`이벤트 생성 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('이벤트 생성 에러:', error);
    throw error;
  }
};

/**
 * POST /api/v1/events (JSON - 이미지 없이)
 * 새 이벤트 생성 (이미지 없이)
 * @param {Object} eventData - 이벤트 생성 데이터
 * @returns {Promise<Object>} 생성된 이벤트 정보
 */
export const createEventWithoutImages = async (eventData) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error(`이벤트 생성 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('이벤트 생성 에러:', error);
    throw error;
  }
};

/**
 * PUT /api/v1/events/{id} (multipart/form-data)
 * 이벤트 수정 (이미지 업로드 지원, 인증 필요)
 * @param {number} eventId - 이벤트 ID
 * @param {Object} eventData - 수정할 이벤트 데이터
 * @param {File} mainImage - 메인 이미지 파일 (선택사항)
 * @param {File[]} imagesToAdd - 추가할 내용 이미지 파일 배열 (선택사항)
 * @returns {Promise<Object>} 수정된 이벤트 정보
 */
export const updateEvent = async (eventId, eventData, mainImage = null, imagesToAdd = null) => {
  try {
    const formData = new FormData();
    
    // 이벤트 데이터를 JSON 문자열로 만들어 추가
    formData.append('eventRequestDto', JSON.stringify(eventData));
    
    // 메인 이미지 추가
    if (mainImage) {
      formData.append('mainImage', mainImage);
    }
    
    // 내용 이미지들 추가
    if (imagesToAdd && imagesToAdd.length > 0) {
      imagesToAdd.forEach(image => {
        formData.append('imagesToAdd', image);
      });
    }

    const response = await fetch(`${API_URL}/${eventId}`, {
      method: 'PUT',
      credentials: 'include',
      // Content-Type 헤더를 설정하지 않음 (브라우저가 자동으로 multipart/form-data 설정)
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`이벤트 수정 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('이벤트 수정 에러:', error);
    throw error;
  }
};

// ===== 이벤트 관심 등록 관련 =====

/**
 * POST /api/v1/events/{eventId}/interest
 * 이벤트 관심 등록/해제 (인증 필요)
 * @param {number} eventId - 이벤트 ID
 * @returns {Promise<string>} 관심 등록 결과 메시지
 * @note memberId는 백엔드에서 @AuthenticationPrincipal로 자동 추출
 */
export const toggleEventInterest = async (eventId) => {
  try {
    const response = await fetch(`${API_URL}/${eventId}/interest`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`이벤트 관심 등록/해제 실패: ${response.status}`);
    }

    return await response.text(); // 백엔드에서 String 반환
  } catch (error) {
    console.error('이벤트 관심 등록/해제 에러:', error);
    throw error;
  }
};

/**
 * DELETE /api/v1/events/{id}
 * 이벤트 삭제 (인증 필요)
 * @param {number} eventId - 삭제할 이벤트 ID
 * @returns {Promise<void>} 삭제 성공
 */
export const deleteEvent = async (eventId) => {
  try {
    const response = await fetch(`${API_URL}/${eventId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`이벤트 삭제 실패: ${response.status}`);
    }

    if (response.status === 204) {
      return { success: true, message: '이벤트가 성공적으로 삭제되었습니다.' };
    }

    return await response.json();
  } catch (error) {
    console.error('이벤트 삭제 에러:', error);
    throw error;
  }
};

/**
 * GET /api/v1/events/{eventId}/content-images
 * 이벤트 설명 이미지 목록 조회
 * @param {number} eventId - 이벤트 ID
 * @returns {Promise<Array>} 이미지 경로 배열
 */
export const getEventContentImages = async (eventId) => {
  try {
    const response = await fetch(`${API_URL}/${eventId}/content-images`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`이벤트 이미지 목록 조회 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('이벤트 이미지 목록 조회 에러:', error);
    throw error;
  }
};

// ===== 이벤트 타입 상수 =====

/**
 * 이벤트 타입 상수
 */
export const EVENT_TYPES = {
  MUSICAL: 'MUSICAL',
  MOVIE: 'MOVIE', 
  THEATER: 'THEATER',
  EXHIBITION: 'EXHIBITION',
  CLASSICAL: 'Classical',
  DANCE: 'DANCE',
  CONCERT: 'CONCERT',
  FESTIVAL: 'FESTIVAL',
  LOCAL_EVENT: 'LOCAL_EVENT',
  OTHER: 'OTHER',
};

/**
 * 이벤트 타입 라벨
 */
export const EVENT_TYPE_LABELS = {
  [EVENT_TYPES.MUSICAL]: '뮤지컬',
  [EVENT_TYPES.MOVIE]: '영화',
  [EVENT_TYPES.THEATER]: '연극',
  [EVENT_TYPES.EXHIBITION]: '전시회',
  [EVENT_TYPES.CLASSICAL]: '클래식',
  [EVENT_TYPES.DANCE]: '무용',
  [EVENT_TYPES.CONCERT]: '콘서트',
  [EVENT_TYPES.FESTIVAL]: '페스티벌',
  [EVENT_TYPES.LOCAL_EVENT]: '지역행사',
  [EVENT_TYPES.OTHER]: '기타',
};

// ===== 유틸리티 함수 =====

/**
 * 이벤트 타입 라벨 반환
 * @param {string} eventType - 이벤트 타입
 * @returns {string} 이벤트 타입 라벨
 */
export const getEventTypeLabel = (eventType) => {
  return EVENT_TYPE_LABELS[eventType] || eventType;
};

/**
 * 날짜 형식 검증
 * @param {string} dateString - 날짜 문자열 (YYYY-MM-DD)
 * @returns {boolean} 유효한 날짜 형식인지 여부
 */
export const isValidDateFormat = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString);
};

/**
 * 이벤트 데이터 검증
 * @param {Object} eventData - 검증할 이벤트 데이터
 * @returns {Object} 검증 결과 { isValid: boolean, errors: Array }
 */
export const validateEventData = (eventData) => {
  const errors = [];

  // 필수 필드 검증
  if (!eventData.title || eventData.title.trim().length === 0) {
    errors.push('이벤트 제목은 필수입니다.');
  }

  if (!eventData.eventType || !EVENT_TYPES[eventData.eventType]) {
    errors.push('올바른 이벤트 타입을 선택해주세요.');
  }

  if (!eventData.eventLocation || eventData.eventLocation.trim().length === 0) {
    errors.push('이벤트 장소는 필수입니다.');
  }

  if (!eventData.description || eventData.description.trim().length === 0) {
    errors.push('이벤트 설명은 필수입니다.');
  }

  // 날짜 검증
  if (eventData.startDate && !isValidDateFormat(eventData.startDate)) {
    errors.push('시작일 형식이 올바르지 않습니다. (YYYY-MM-DD)');
  }

  if (eventData.endDate && !isValidDateFormat(eventData.endDate)) {
    errors.push('종료일 형식이 올바르지 않습니다. (YYYY-MM-DD)');
  }

  if (eventData.startDate && eventData.endDate && eventData.startDate > eventData.endDate) {
    errors.push('시작일은 종료일보다 이전이어야 합니다.');
  }

  // 숫자 필드 검증
  if (eventData.durationMin !== undefined && (eventData.durationMin < 0 || !Number.isInteger(eventData.durationMin))) {
    errors.push('소요시간은 0 이상의 정수여야 합니다.');
  }

  if (eventData.minAge !== undefined && (eventData.minAge < 0 || !Number.isInteger(eventData.minAge))) {
    errors.push('최소 연령은 0 이상의 정수여야 합니다.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 백엔드 EventDto.ResponseCard를 PostEventMiniCard 컴포넌트 형태로 변환
export const transformEventCardData = (eventCard) => {
  if (!eventCard) return null;
  
  // 이미지 경로 처리: 백엔드 상대경로를 완전한 URL로 변환
  const getImageUrl = (path) => {
    if (!path) return IMAGES.GALLERY_DEFAULT_IMG;
    if (path.startsWith('http')) return path; // 이미 완전한 URL
    return `${BASE_URL}${path}`; // 상대경로에 BASE_URL 추가
  };
  
  return {
    eventImage: getImageUrl(eventCard.thumbnailImagePath),
    eventType: eventCard.eventType || "이벤트",
    eventName: eventCard.title || "이벤트명", 
    description: eventCard.description || "",
    score: eventCard.avgRating || 0,
    recommendations: eventCard.interestCount || 0,
    registeredPosts: eventCard.reviewCount || 0,
    initialLiked: eventCard.isInterested || false,
  };
};

// Event API 서비스 객체 (백엔드 컨트롤러와 완전 매칭)
const eventApi = {
  // 조회 계열
  getEvents,
  getEventById,
  searchEvents,
  getEventContentImages,
  
  // CRUD 계열
  createEvent,
  createEventWithoutImages,
  updateEvent,
  deleteEvent,
  
  // 기능 계열
  toggleEventInterest,
  
  // 유틸리티
  validateEventData,
  getEventTypeLabel,
  isValidDateFormat,
  
  // 데이터 변환
  transformEventCardData
};

// Named exports는 개별 function에서 이미 선언됨 (중복 제거)

// Default export (통일성을 위해 수정)
export default eventApi;