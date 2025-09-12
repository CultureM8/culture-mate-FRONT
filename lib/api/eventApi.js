const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT_EVENTS || "/events";

const API_URL = `${BASE_URL}${API_BASE}${ENDPOINT}`;

// ===== 이벤트 검색 관련 =====

/**
 * 이벤트 목록 조회
 * @param {Object} searchParams - 검색 조건
 * @param {string} searchParams.keyword - 검색 키워드
 * @param {string} searchParams "region.level1" - 1차 지역 (예: 서울특별시)
 * @param {string} searchParams "region.level2" - 2차 지역 (예: 강남구)
 * @param {string} searchParams "region.level3" - 3차 지역 (예: 역삼동)
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
    
    // 지역 파라미터 처리 개선 - 새로운 region.level 방식 추가
    if (searchParams['region.level1']) {
      queryParams.append('region.level1', searchParams['region.level1']);
    }
    if (searchParams['region.level2']) {
      queryParams.append('region.level2', searchParams['region.level2']);
    }
    if (searchParams['region.level3']) {
      queryParams.append('region.level3', searchParams['region.level3']);
    }
    
    // 하위 호환성을 위한 기존 방식도 유지
    if (searchParams.regionDto) {
      if (searchParams.regionDto.level1) {
        queryParams.append('region.level1', searchParams.regionDto.level1);
      }
      if (searchParams.regionDto.level2) {
        queryParams.append('region.level2', searchParams.regionDto.level2);
      }
      if (searchParams.regionDto.level3) {
        queryParams.append('region.level3', searchParams.regionDto.level3);
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
    
    console.log('API 호출 URL:', url); // 디버깅용 로그 추가
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
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
    
    // 중첩 객체 구조로 변경 - EventSearchDto.region 구조에 맞춤
    if (searchParams['region.level1'] || searchParams['region.level2'] || searchParams['region.level3']) {
      // region 파라미터를 중첩 구조로 전송
      if (searchParams['region.level1']) {
        queryParams.append('region.level1', searchParams['region.level1']);
      }
      if (searchParams['region.level2']) {
        queryParams.append('region.level2', searchParams['region.level2']);
      }
      if (searchParams['region.level3']) {
        queryParams.append('region.level3', searchParams['region.level3']);
      }
    }
    
    // 하위 호환성을 위한 기존 방식도 유지
    if (searchParams.regionDto) {
      if (searchParams.regionDto.level1) {
        queryParams.append('region.level1', searchParams.regionDto.level1);
      }
      if (searchParams.regionDto.level2) {
        queryParams.append('region.level2', searchParams.regionDto.level2);
      }
      if (searchParams.regionDto.level3) {
        queryParams.append('region.level3', searchParams.regionDto.level3);
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
    
    // 상세한 디버깅 로그 추가
    console.log('=== 검색 API 디버깅 ===');
    console.log('전송 파라미터:', searchParams);
    console.log('쿼리 파라미터:', Object.fromEntries(queryParams));
    console.log('완성된 URL:', url);
    console.log('=======================');
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`이벤트 검색 실패: ${response.status}`);
    }

    const result = await response.json();
    console.log('백엔드 응답:', result); // 백엔드 응답 디버깅 로그 추가
    return result;
  } catch (error) {
    console.error('이벤트 검색 에러:', error);
    throw error;
  }
};

// ===== 이벤트 CRUD 관련 ===== (기존 코드 유지)

/**
 * 특정 이벤트 상세 조회
 * @param {number} eventId - 이벤트 ID
 * @returns {Promise<Object>} 이벤트 상세 정보
 */
export const getEventById = async (eventId) => {
  try {
    const response = await fetch(`${API_URL}/${eventId}`, {
      method: 'GET',
      credentials: 'include',
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
    // FormData를 사용한 multipart/form-data 방식으로 변경
    const formData = new FormData();
    
    formData.append('eventRequestDto', JSON.stringify(eventData));
    
    if (mainImage) {
      formData.append('mainImage', mainImage);
    }
    
    if (imagesToAdd && imagesToAdd.length > 0) {
      imagesToAdd.forEach(image => {
        formData.append('imagesToAdd', image);
      });
    }

    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      credentials: 'include',
      body: formData, // JSON 대신 FormData 사용
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
    // FormData를 사용한 multipart/form-data 방식으로 변경
    const formData = new FormData();
    
    formData.append('eventRequestDto', JSON.stringify(eventData));
    
    if (mainImage) {
      formData.append('mainImage', mainImage);
    }
    
    if (imagesToAdd && imagesToAdd.length > 0) {
      imagesToAdd.forEach(image => {
        formData.append('imagesToAdd', image);
      });
    }

    const response = await fetch(`${API_URL}/${eventId}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData, // JSON 대신 FormData 사용
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

    return await response.text(); // JSON 대신 text() 사용
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

    // 204 상태 코드 처리 추가
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

export const EVENT_TYPES = {
  MUSICAL: 'MUSICAL',
  MOVIE: 'MOVIE', 
  THEATER: 'THEATER',
  EXHIBITION: 'EXHIBITION',
  CLASSICAL: 'Classical', // 'CLASSICAL'에서 'Classical'로 변경
  DANCE: 'DANCE',
  CONCERT: 'CONCERT',
  FESTIVAL: 'FESTIVAL',
  LOCAL_EVENT: 'LOCAL_EVENT',
  OTHER: 'OTHER',
};

export const EVENT_TYPE_LABELS = {
  [EVENT_TYPES.MUSICAL]: '뮤지컬',
  [EVENT_TYPES.MOVIE]: '영화',
  [EVENT_TYPES.THEATER]: '연극',
  [EVENT_TYPES.EXHIBITION]: '전시회', // '전시'에서 '전시회'로 변경
  [EVENT_TYPES.CLASSICAL]: '클래식',
  [EVENT_TYPES.DANCE]: '무용',
  [EVENT_TYPES.CONCERT]: '콘서트',
  [EVENT_TYPES.FESTIVAL]: '페스티벌',
  [EVENT_TYPES.LOCAL_EVENT]: '지역행사',
  [EVENT_TYPES.OTHER]: '기타',
};

// ===== 유틸리티 함수 =====

export const getEventTypeLabel = (eventType) => {
  return EVENT_TYPE_LABELS[eventType] || eventType;
};

export const isValidDateFormat = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString);
};

export const validateEventData = (eventData) => {
  const errors = [];

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

  if (eventData.startDate && !isValidDateFormat(eventData.startDate)) {
    errors.push('시작일 형식이 올바르지 않습니다. (YYYY-MM-DD)');
  }

  if (eventData.endDate && !isValidDateFormat(eventData.endDate)) {
    errors.push('종료일 형식이 올바르지 않습니다. (YYYY-MM-DD)');
  }

  if (eventData.startDate && eventData.endDate && eventData.startDate > eventData.endDate) {
    errors.push('시작일은 종료일보다 이전이어야 합니다.');
  }

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

// 기본 export 추가
const eventApi = {
  getEvents,
  getEventById,
  searchEvents,
  getEventContentImages,
  createEvent,
  createEventWithoutImages,
  updateEvent,
  deleteEvent,
  toggleEventInterest,
  validateEventData,
  getEventTypeLabel,
  isValidDateFormat
};

export default eventApi;