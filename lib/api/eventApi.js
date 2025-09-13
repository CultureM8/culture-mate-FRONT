const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT_EVENTS || "/events";

const API_URL = `${BASE_URL}${API_BASE}${ENDPOINT}`;

// ===== 이벤트 검색 관련 =====

/**
 * 검색 파라미터를 URLSearchParams로 변환하는 헬퍼 함수
 * @param {Object} searchParams - 검색 조건
 * @returns {URLSearchParams} 변환된 쿼리 파라미터
 */
const buildQueryParams = (searchParams) => {
  const queryParams = new URLSearchParams();

  // 기본 검색 조건들
  if (searchParams.keyword) queryParams.append('keyword', searchParams.keyword);
  if (searchParams.eventType) queryParams.append('eventType', searchParams.eventType);
  if (searchParams.startDate) queryParams.append('startDate', searchParams.startDate);
  if (searchParams.endDate) queryParams.append('endDate', searchParams.endDate);
  if (searchParams.empty !== undefined) queryParams.append('empty', searchParams.empty);

  // ======= 조건부 분기: 지역 파라미터 처리 =======
  // 새로운 region.level 방식 우선 처리
  if (searchParams['region.level1']) {
    queryParams.append('region.level1', searchParams['region.level1']);
  }
  if (searchParams['region.level2']) {
    queryParams.append('region.level2', searchParams['region.level2']);
  }
  if (searchParams['region.level3']) {
    queryParams.append('region.level3', searchParams['region.level3']);
  }

  // 하위 호환성: 기존 regionDto 방식 (새 방식이 없을 때만)
  if (searchParams.regionDto && !searchParams['region.level1']) {
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
  // ===============================================

  return queryParams;
};

/**
 * 통합 이벤트 조회 (조건에 따라 검색/목록 조회)
 * @param {Object} searchParams - 검색 조건
 * @param {string} searchParams.keyword - 검색 키워드
 * @param {string} searchParams["region.level1"] - 1차 지역 (예: 서울특별시)
 * @param {string} searchParams["region.level2"] - 2차 지역 (예: 강남구)
 * @param {string} searchParams["region.level3"] - 3차 지역 (예: 역삼동)
 * @param {Object} searchParams.regionDto - 기존 지역 정보 (하위 호환성)
 * @param {string} searchParams.eventType - 이벤트 타입 (MUSICAL, MOVIE, THEATER, etc.)
 * @param {string} searchParams.startDate - 시작일 (YYYY-MM-DD)
 * @param {string} searchParams.endDate - 종료일 (YYYY-MM-DD)
 * @param {boolean} searchParams.empty - 빈 값 여부
 * @returns {Promise<Array>} 이벤트 목록
 */
export const getEvents = async (searchParams = {}) => {
  try {
    const queryParams = buildQueryParams(searchParams);

    // ======= 조건부 분기: 검색 vs 목록 조회 =======
    const hasSearchConditions = Object.keys(searchParams).length > 0 &&
      Object.values(searchParams).some(value =>
        value !== undefined && value !== null && value !== ""
      );

    const endpoint = hasSearchConditions ? "/search" : "";
    // =============================================

    const url = `${API_URL}${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`이벤트 ${hasSearchConditions ? '검색' : '목록 조회'} 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('이벤트 조회 에러:', error);
    throw error;
  }
};

/**
 * 이벤트 검색 (getEvents wrapper)
 * @param {Object} searchParams - 검색 조건 (getEvents와 동일한 파라미터)
 * @returns {Promise<Array>} 검색된 이벤트 목록
 */
export const searchEvents = async (searchParams = {}) => {
  return await getEvents(searchParams);
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
 * FormData 구성 헬퍼 함수
 * @param {Object} eventData - 이벤트 데이터
 * @param {File} mainImage - 메인 이미지 파일
 * @param {File[]} imagesToAdd - 추가 이미지 파일들
 * @returns {FormData} 구성된 FormData 객체
 */
const buildFormData = (eventData, mainImage, imagesToAdd) => {
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

  return formData;
};

/**
 * 이벤트 생성 (이미지 포함/미포함 통합)
 * 백엔드에서 이미지 유무 자동 처리하므로 프론트엔드 분기 불필요
 * @param {Object} eventData - 이벤트 데이터
 * @param {File} mainImage - 메인 이미지 파일 (선택사항)
 * @param {File[]} imagesToAdd - 추가 이미지 파일들 (선택사항)
 * @returns {Promise<Object>} 생성된 이벤트 정보
 */
export const createEvent = async (eventData, mainImage = null, imagesToAdd = null) => {
  try {
    // ======= 항상 FormData 방식 사용 =======
    // 백엔드가 이미지 없어도 multipart/form-data로 처리
    const formData = buildFormData(eventData, mainImage, imagesToAdd);
    // =====================================

    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      credentials: 'include',
      body: formData  // 항상 FormData
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
 * 이벤트 수정 (이미지 포함/미포함 통합, 인증 필요)
 * 백엔드에서 이미지 유무 자동 처리하므로 프론트엔드 분기 불필요
 * @param {number} eventId - 이벤트 ID
 * @param {Object} eventData - 수정할 이벤트 데이터
 * @param {File} mainImage - 메인 이미지 파일 (선택사항)
 * @param {File[]} imagesToAdd - 추가할 이미지 파일들 (선택사항)
 * @returns {Promise<Object>} 수정된 이벤트 정보
 */
export const updateEvent = async (eventId, eventData, mainImage = null, imagesToAdd = null) => {
  try {
    // ======= 항상 FormData 방식 사용 =======
    // 백엔드가 이미지 없어도 multipart/form-data로 처리
    const formData = buildFormData(eventData, mainImage, imagesToAdd);
    // =====================================

    const response = await fetch(`${API_URL}/${eventId}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData  // 항상 FormData
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

// 기본 export - createEventWithoutImages 제거
const eventApi = {
  getEvents,
  getEventById,
  searchEvents,
  getEventContentImages,
  createEvent,        // 통합된 함수
  updateEvent,        // 통합된 함수
  deleteEvent,
  toggleEventInterest,
  validateEventData,
  getEventTypeLabel,
  isValidDateFormat
};

export default eventApi;