const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT_REGIONS || "/regions";

const API_URL = `${BASE_URL}${API_BASE}${ENDPOINT}`;

// 공통 fetch 설정
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
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

// 입력 데이터 유효성 검사
const validateRegionRequest = (data) => {
  const errors = [];
  
  // level1은 필수
  if (!data.level1 || data.level1.trim().length === 0) {
    errors.push('시/도(level1)는 필수입니다');
  }
  
  if (data.level1 && data.level1.length > 50) {
    errors.push('시/도(level1)는 50자 이내여야 합니다');
  }
  
  if (data.level2 && data.level2.length > 50) {
    errors.push('시/군/구(level2)는 50자 이내여야 합니다');
  }
  
  if (data.level3 && data.level3.length > 50) {
    errors.push('읍/면/동(level3)는 50자 이내여야 합니다');
  }
  
  if (errors.length > 0) {
    throw new Error(`유효성 검사 실패: ${errors.join(', ')}`);
  }
};

// Region API 서비스 객체
const regionApi = {
  /**
   * POST /api/v1/regions
   * 새로운 지역 추가
   * @param {Object} regionData - 지역 정보
   * @param {string} regionData.level1 - 시/도 (필수)
   * @param {string} regionData.level2 - 시/군/구 (선택)
   * @param {string} regionData.level3 - 읍/면/동 (선택)
   * @returns {Promise<Object>} 생성된 지역 정보
   */
  create: async (regionData) => {
    try {
      // 유효성 검사
      validateRegionRequest(regionData);
      
      const response = await fetch(`${API_URL}`, {
        method: 'POST',
        credentials: 'include',
        headers: defaultHeaders,
        body: JSON.stringify(regionData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('regionApi.create 에러:', error);
      throw error;
    }
  },

  /**
   * GET /api/v1/regions/search
   * 지역 검색 (조건에 맞는 지역과 하위 지역들 포함)
   * @param {Object} searchParams - 검색 조건
   * @param {string} searchParams.level1 - 시/도
   * @param {string} searchParams.level2 - 시/군/구
   * @param {string} searchParams.level3 - 읍/면/동
   * @returns {Promise<Array>} 검색된 지역 목록
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
        credentials: 'include',
        headers: defaultHeaders,
      });
      return handleResponse(response);
    } catch (error) {
      console.error('regionApi.search 에러:', error);
      throw error;
    }
  },

  /**
   * GET /api/v1/regions/all
   * 전체 지역 조회
   * @returns {Promise<Array>} 전체 지역 목록
   */
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/all`, {
        method: 'GET',
        credentials: 'include',
        headers: defaultHeaders,
      });
      return handleResponse(response);
    } catch (error) {
      console.error('regionApi.getAll 에러:', error);
      throw error;
    }
  },

  /**
   * GET /api/v1/regions/{id}
   * 특정 지역 조회
   * @param {number} id - 지역 ID
   * @returns {Promise<Object>} 지역 상세 정보
   */
  getById: async (id) => {
    try {
      if (!id || !Number.isInteger(Number(id))) {
        throw new Error('올바른 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: defaultHeaders,
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`regionApi.getById(${id}) 에러:`, error);
      throw error;
    }
  },

  /**
   * PUT /api/v1/regions/{id}
   * 지역 수정
   * @param {number} id - 지역 ID
   * @param {Object} regionData - 수정할 지역 정보
   * @returns {Promise<Object>} 수정된 지역 정보
   */
  update: async (id, regionData) => {
    try {
      if (!id || !Number.isInteger(Number(id))) {
        throw new Error('올바른 ID를 입력해주세요');
      }
      
      // 유효성 검사
      validateRegionRequest(regionData);
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: defaultHeaders,
        body: JSON.stringify(regionData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`regionApi.update(${id}) 에러:`, error);
      throw error;
    }
  },

  /**
   * DELETE /api/v1/regions/{id}
   * 지역 삭제
   * @param {number} id - 지역 ID
   * @returns {Promise<void>} 삭제 성공 (응답 없음)
   */
  delete: async (id) => {
    try {
      if (!id || !Number.isInteger(Number(id))) {
        throw new Error('올바른 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: defaultHeaders,
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`regionApi.delete(${id}) 에러:`, error);
      throw error;
    }
  },

  /**
   * GET /api/v1/regions/dropdown/level1
   * 드롭다운을 위한 Level1 지역 목록 조회 (시/도)
   * @returns {Promise<Array>} Level1 지역명 목록
   */
  getLevel1Regions: async () => {
    try {
      const response = await fetch(`${API_URL}/dropdown/level1`, {
        method: 'GET',
        headers: defaultHeaders,
      });
      return handleResponse(response);
    } catch (error) {
      console.error('regionApi.getLevel1Regions 에러:', error);
      throw error;
    }
  },

  /**
   * GET /api/v1/regions/dropdown/level2
   * 드롭다운을 위한 Level2 지역 목록 조회 (시/군/구)
   * @param {string} level1 - 상위 지역(시/도)
   * @returns {Promise<Array>} Level2 지역명 목록
   */
  getLevel2Regions: async (level1) => {
    try {
      if (!level1 || level1.trim().length === 0) {
        throw new Error('시/도(level1)를 입력해주세요');
      }
      
      const params = new URLSearchParams({ level1 }).toString();
      const response = await fetch(`${API_URL}/dropdown/level2?${params}`, {
        method: 'GET',
        headers: defaultHeaders,
      });
      return handleResponse(response);
    } catch (error) {
      console.error('regionApi.getLevel2Regions 에러:', error);
      throw error;
    }
  },

  /**
   * GET /api/v1/regions/dropdown/level3
   * 드롭다운을 위한 Level3 지역 목록 조회 (읍/면/동)
   * @param {string} level1 - 시/도
   * @param {string} level2 - 시/군/구
   * @returns {Promise<Array>} Level3 지역명 목록
   */
  getLevel3Regions: async (level1, level2) => {
    try {
      if (!level1 || level1.trim().length === 0) {
        throw new Error('시/도(level1)를 입력해주세요');
      }
      if (!level2 || level2.trim().length === 0) {
        throw new Error('시/군/구(level2)를 입력해주세요');
      }
      
      const params = new URLSearchParams({ level1, level2 }).toString();
      const response = await fetch(`${API_URL}/dropdown/level3?${params}`, {
        method: 'GET',
        headers: defaultHeaders,
      });
      return handleResponse(response);
    } catch (error) {
      console.error('regionApi.getLevel3Regions 에러:', error);
      throw error;
    }
  }
};

// 데이터 변환 유틸리티 함수들
const regionDataUtils = {
  /**
   * 프론트엔드 폼 데이터를 RegionDto 형식으로 변환
   */
  convertToApiFormat: (formData) => {
    return {
      level1: formData.level1?.trim() || '',
      level2: formData.level2?.trim() || '',
      level3: formData.level3?.trim() || ''
    };
  },

  /**
   * 백엔드 응답을 프론트엔드에서 사용하기 쉽게 가공
   */
  processApiResponse: (apiData) => {
    return {
      ...apiData,
      // 지역 전체 주소 조합
      fullAddress: [apiData.level1, apiData.level2, apiData.level3]
        .filter(Boolean)
        .join(' '),
      // 계층 구조 정보
      hierarchyLevel: apiData.level3 ? 3 : apiData.level2 ? 2 : 1,
      // 표시용 이름 (가장 하위 지역명)
      displayName: apiData.level3 || apiData.level2 || apiData.level1
    };
  },

  /**
   * 지역 정보를 문자열로 조합
   */
  formatRegion: (regionData) => {
    if (!regionData) return '';
    return [regionData.level1, regionData.level2, regionData.level3]
      .filter(Boolean)
      .join(' ');
  },

  /**
   * 지역 계층 구조 확인
   */
  getHierarchyLevel: (regionData) => {
    if (!regionData) return 0;
    if (regionData.level3) return 3;
    if (regionData.level2) return 2;
    if (regionData.level1) return 1;
    return 0;
  },

  /**
   * 지역 데이터 유효성 검사
   */
  isValidRegion: (regionData) => {
    if (!regionData || typeof regionData !== 'object') return false;
    
    // level1은 필수
    if (!regionData.level1 || regionData.level1.trim().length === 0) {
      return false;
    }
    
    // 각 레벨의 길이 제한
    const maxLength = 50;
    if (regionData.level1.length > maxLength) return false;
    if (regionData.level2 && regionData.level2.length > maxLength) return false;
    if (regionData.level3 && regionData.level3.length > maxLength) return false;
    
    return true;
  },

  /**
   * 드롭다운 옵션 형태로 변환
   */
  toDropdownOptions: (regionList, valueField = 'displayName') => {
    if (!Array.isArray(regionList)) return [];
    
    return regionList.map(region => ({
      value: region[valueField] || region.level1 || region.level2 || region.level3,
      label: region.displayName || region.level1 || region.level2 || region.level3,
      data: region
    }));
  },

  /**
   * 지역 검색을 위한 쿼리 생성
   */
  buildSearchQuery: (searchInput) => {
    if (!searchInput || typeof searchInput !== 'string') return {};
    
    const trimmed = searchInput.trim();
    if (trimmed.length === 0) return {};
    
    // 단순한 검색: 입력값을 level1부터 순차적으로 매칭 시도
    const parts = trimmed.split(' ').filter(Boolean);
    const query = {};
    
    if (parts.length >= 1) query.level1 = parts[0];
    if (parts.length >= 2) query.level2 = parts[1];
    if (parts.length >= 3) query.level3 = parts[2];
    
    return query;
  }
};

export { regionApi, regionDataUtils };
export default regionApi;