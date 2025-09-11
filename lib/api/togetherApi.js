const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT_TOGETHER || "/together";

const API_URL = `${BASE_URL}${API_BASE}${ENDPOINT}`;

// 공통 fetch 설정 (토큰 포함)
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  // 토큰 자동 추가 (기존 방식과 동일)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// 에러 처리 헬퍼 함수
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorData}`);
  }
  
  // 응답이 비어있는 경우 (DELETE 등)
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return null;
  }
  
  return await response.json();
};

// 입력 데이터 유효성 검사 (기존 구조에 맞춤)
const validateTogetherRequest = (data) => {
  const errors = [];
  
  if (!data.title || data.title.length > 100) {
    errors.push('제목은 1-100자 이내여야 합니다');
  }
  
  if (!data.meetingLocation || data.meetingLocation.length > 255) {
    errors.push('모임장소는 1-255자 이내여야 합니다');
  }
  
  if (data.content && data.content.length > 2000) {
    errors.push('내용은 2000자 이내여야 합니다');
  }
  
  if (!data.maxParticipants || data.maxParticipants < 2 || data.maxParticipants > 100) {
    errors.push('최대 참여인원은 2-100명 사이여야 합니다');
  }
  
  if (!data.eventId) {
    errors.push('이벤트 ID가 없습니다');
  }
  
  if (!data.hostId || !Number.isInteger(data.hostId)) {
    errors.push('호스트 ID는 정수여야 합니다');
  }
  
  if (!data.meetingDate) {
    errors.push('만남 날짜는 필수입니다');
  }
  
  if (!data.regionDto || !data.regionDto.level1) {
    errors.push('지역 정보는 필수입니다');
  }
  
  if (errors.length > 0) {
    throw new Error(`유효성 검사 실패: ${errors.join(', ')}`);
  }
};

// Together API 서비스 객체
const togetherApi = {
  /**
   * GET /api/v1/together
   * 전체 동행 게시글 목록 조회
   * @returns {Promise<Array>} 동행 게시글 목록
   */
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}`, {
        method: 'GET',
        credentials: 'include',
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('togetherApi.getAll 에러:', error);
      throw error;
    }
  },

  /**
   * GET /api/v1/together/{id}
   * 특정 동행 게시글 조회
   * @param {number} id - 동행 게시글 ID
   * @returns {Promise<Object>} 동행 게시글 상세 정보
   */
  getById: async (id) => {
    try {
      if (!id || !Number.isInteger(Number(id))) {
        throw new Error('올바른 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'GET',
        credentials: 'include', // 추가
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`togetherApi.getById(${id}) 에러:`, error);
      throw error;
    }
  },

  /**
   * POST /api/v1/together
   * 새 동행 게시글 생성
   * @param {Object} newTogether - 기존 구조 기반 데이터
   * @param {number} newTogether.eventId - 이벤트 ID (필수)
   * @param {number} newTogether.hostId - 호스트 ID (필수)
   * @param {string} newTogether.title - 제목 (1-100자, 필수)
   * @param {Object} newTogether.regionDto - 지역 정보 (필수)
   * @param {string} newTogether.regionDto.level1 - 시/도 (필수)
   * @param {string} newTogether.regionDto.level2 - 시/군/구
   * @param {string} newTogether.regionDto.level3 - 읍/면/동
   * @param {string} newTogether.meetingLocation - 모임장소 (1-255자, 필수)
   * @param {string} newTogether.meetingDate - 만남 날짜 (YYYY-MM-DD, 필수)
   * @param {number} newTogether.maxParticipants - 최대 참여 인원 (2-100, 필수)
   * @param {string} newTogether.content - 내용 (선택사항)
   * @returns {Promise<Object>} 생성된 동행 게시글 정보
   */
  create: async (newTogether) => {
    try {
      // 스키마 기반 유효성 검사
      validateTogetherRequest(newTogether);
      
      const response = await fetch(`${API_URL}`, {
        method: 'POST',
        credentials: 'include', // 추가
        headers: getHeaders(),
        body: JSON.stringify(newTogether),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('togetherApi.create 에러:', error);
      throw error;
    }
  },

  /**
   * PUT /api/v1/together/{id}
   * 동행 게시글 수정
   * @param {number} id - 동행 게시글 ID
   * @param {Object} updatedTogether - 수정할 데이터 (TogetherRequestDto 스키마 기반)
   * @returns {Promise<Object>} 수정된 동행 게시글 정보
   */
  update: async (id, updatedTogether) => {
    try {
      if (!id || !Number.isInteger(Number(id))) {
        throw new Error('올바른 ID를 입력해주세요');
      }
      
      // 스키마 기반 유효성 검사
      validateTogetherRequest(updatedTogether);
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        credentials: 'include', // 추가
        headers: getHeaders(),
        body: JSON.stringify(updatedTogether),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`togetherApi.update(${id}) 에러:`, error);
      throw error;
    }
  },

  /**
   * DELETE /api/v1/together/{id}
   * 동행 게시글 삭제
   * @param {number} id - 동행 게시글 ID
   * @returns {Promise<void>} 삭제 성공 (응답 없음)
   */
  delete: async (id) => {
    try {
      if (!id || !Number.isInteger(Number(id))) {
        throw new Error('올바른 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include', // 추가
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`togetherApi.delete(${id}) 에러:`, error);
      throw error;
    }
  },

  /**
   * GET /api/v1/together/with/{memberId}
   * 특정 회원이 참여한 동행 목록 조회
   * @param {number} memberId - 회원 ID
   * @returns {Promise<Array>} 회원이 참여한 동행 목록
   */
  getByMember: async (memberId) => {
    try {
      if (!memberId || !Number.isInteger(Number(memberId))) {
        throw new Error('올바른 회원 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/with/${memberId}`, {
        method: 'GET',
        credentials: 'include', // 추가
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`togetherApi.getByMember(${memberId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * GET /api/v1/together/search
   * 동행 게시글 검색
   * @param {Object} searchParams - 검색 조건
   * @param {string} searchParams.keyword - 검색 키워드
   * @param {string} searchParams'regionDto.level1'- 시/도
   * @param {string} searchParams'regionDto.level2'- 시/군/구
   * @param {string} searchParams'regionDto.level3'- 읍/면/동
   * @param {string} searchParams.startDate - 시작 날짜 (YYYY-MM-DD)
   * @param {string} searchParams.endDate - 종료 날짜 (YYYY-MM-DD)
   * @param {string} searchParams.eventType - 이벤트 타입
   * @param {boolean} searchParams.isRecruiting - 모집 중 여부
   * @param {boolean} searchParams.empty - 빈 검색 여부
   * @returns {Promise<Array>} 검색된 동행 목록
   */
  search: async (searchParams = {}) => {
    try {
      // 빈 값 제거
      const cleanParams = Object.fromEntries(
        Object.entries(searchParams).filter(([_, value]) => 
          value !== undefined && value !== null && value !== ''
        )
      );
      
      const params = new URLSearchParams(cleanParams).toString();
      const url = params ? `${API_URL}/search?${params}` : `${API_URL}/search`;
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // 추가
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('togetherApi.search 에러:', error);
      throw error;
    }
  },

  /**
   * GET /api/v1/together/hosted-by/{hostId}
   * 특정 호스트가 작성한 동행 목록 조회
   * @param {number} hostId - 호스트 ID
   * @returns {Promise<Array>} 호스트가 작성한 동행 목록
   */
  getByHost: async (hostId) => {
    try {
      if (!hostId || !Number.isInteger(Number(hostId))) {
        throw new Error('올바른 호스트 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/hosted-by/${hostId}`, {
        method: 'GET',
        credentials: 'include', // 추가
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`togetherApi.getByHost(${hostId}) 에러:`, error);
      throw error;
    }
  }
};

// 데이터 변환 유틸리티 함수들
const togetherDataUtils = {
  /**
   * 프론트엔드 폼 데이터를 TogetherRequestDto 형식으로 변환
   */
  convertToApiFormat: (formData) => {
    return {
      eventId: parseInt(formData.eventId) || 0,
      hostId: formData.hostId || 1, // 현재 로그인된 사용자 ID
      title: formData.title || '',
      regionDto: {
        level1: formData.level1 || '',
        level2: formData.level2 || '',
        level3: formData.level3 || ''
      },
      address: formData.address || '',
      addressDetail: formData.addressDetail || '',
      meetingDate: formData.meetingDate || '',
      maxParticipants: parseInt(formData.maxParticipants) || 2,
      content: formData.content || ''
    };
  },

  /**
   * 백엔드 응답을 프론트엔드에서 사용하기 쉽게 가공
   * (백엔드 구조 그대로 유지하면서 필요한 필드만 추가)
   */
  processApiResponse: (apiData) => {
    return {
      ...apiData, // 백엔드 데이터 그대로 유지
      // 필요한 계산된 필드들만 추가
      participantsText: `${apiData.currentParticipants || 0}/${apiData.maxParticipants}`,
      formattedDate: apiData.meetingDate?.replace(/-/g, '.'),
      fullAddress: [apiData.address, apiData.addressDetail].filter(Boolean).join(' '),
      isRecruitingActive: apiData.active && 
                        apiData.currentParticipants < apiData.maxParticipants &&
                        new Date(apiData.meetingDate) > new Date(),
    };
  },

  /**
   * 지역 정보를 문자열로 조합
   */
  formatRegion: (regionDto) => {
    if (!regionDto) return '';
    return [regionDto.level1, regionDto.level2, regionDto.level3]
      .filter(Boolean)
      .join(' ');
  },

  /**
   * 날짜 포맷팅 (YYYY-MM-DD → YYYY.MM.DD)
   */
  formatDate: (dateString) => {
    return dateString?.replace(/-/g, '.') || '';
  },

  /**
   * 모집 상태 확인
   */
  getRecruitmentStatus: (togetherData) => {
    const now = new Date();
    const meetingDate = new Date(togetherData.meetingDate);
    
    if (meetingDate < now) {
      return 'completed'; // 완료됨
    } else if (togetherData.currentParticipants >= togetherData.maxParticipants) {
      return 'full'; // 모집완료
    } else if (togetherData.active) {
      return 'recruiting'; // 모집중
    } else {
      return 'closed'; // 모집마감
    }
  }
};

// Export 수정: named export로 변경
export { togetherApi, togetherDataUtils };
export default togetherApi;