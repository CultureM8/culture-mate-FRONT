const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT_DATA_INIT || "/init";

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
  
  // 응답이 비어있는 경우 처리
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return { message: '요청이 성공적으로 처리되었습니다.' };
  }
  
  return await response.json();
};

// 입력 데이터 유효성 검사
const validateInitRequest = (endpoint, params = {}) => {
  const errors = [];
  
  if (!endpoint || typeof endpoint !== 'string') {
    errors.push('초기화 엔드포인트가 필요합니다');
  }
  
  // 회원 초기화의 경우 count 파라미터 검증
  if (endpoint === 'members' && params.count) {
    const count = parseInt(params.count);
    if (isNaN(count) || count < 1 || count > 1000) {
      errors.push('회원 생성 개수는 1-1000 사이여야 합니다');
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`유효성 검사 실패: ${errors.join(', ')}`);
  }
};

// Data Init API 서비스 객체
const dataInitApi = {
  /**
   * POST /api/v1/init/regions
   * 지역 데이터 초기화
   * @returns {Promise<Object>} 초기화 결과 메시지
   */
  initRegions: async () => {
    try {
      validateInitRequest('regions');
      
      const response = await fetch(`${API_URL}/regions`, {
        method: 'POST',
        credentials: 'include',
        headers: defaultHeaders,
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('dataInitApi.initRegions 에러:', error);
      throw error;
    }
  },

  /**
   * POST /api/v1/init/admin
   * 관리자 데이터 초기화
   * @returns {Promise<Object>} 초기화 결과 메시지
   */
  initAdmin: async () => {
    try {
      validateInitRequest('admin');
      
      const response = await fetch(`${API_URL}/admin`, {
        method: 'POST',
        credentials: 'include',
        headers: defaultHeaders,
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('dataInitApi.initAdmin 에러:', error);
      throw error;
    }
  },

  /**
   * POST /api/v1/init/members
   * 더미 회원 데이터 초기화
   * @param {number} count - 생성할 더미 회원 수 (기본값: 20, 최대: 1000)
   * @returns {Promise<Object>} 초기화 결과 메시지
   */
  initMembers: async (count = 20) => {
    try {
      validateInitRequest('members', { count });
      
      const params = new URLSearchParams({ count: count.toString() });
      
      const response = await fetch(`${API_URL}/members?${params}`, {
        method: 'POST',
        credentials: 'include',
        headers: defaultHeaders,
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error(`dataInitApi.initMembers(${count}) 에러:`, error);
      throw error;
    }
  },

  /**
   * 전체 데이터 초기화 (순서: 지역 → 관리자 → 회원)
   * @param {number} memberCount - 생성할 더미 회원 수 (기본값: 20)
   * @returns {Promise<Array>} 각 초기화 단계별 결과
   */
  initAll: async (memberCount = 20) => {
    try {
      const results = [];
      
      // 1. 지역 데이터 초기화
      console.log('지역 데이터 초기화 시작...');
      const regionResult = await dataInitApi.initRegions();
      results.push({
        step: 'regions',
        status: 'success',
        data: regionResult
      });
      
      // 2. 관리자 데이터 초기화
      console.log('관리자 데이터 초기화 시작...');
      const adminResult = await dataInitApi.initAdmin();
      results.push({
        step: 'admin',
        status: 'success',
        data: adminResult
      });
      
      // 3. 더미 회원 데이터 초기화
      console.log(`더미 회원 데이터 ${memberCount}개 초기화 시작...`);
      const memberResult = await dataInitApi.initMembers(memberCount);
      results.push({
        step: 'members',
        status: 'success',
        data: memberResult
      });
      
      return results;
    } catch (error) {
      console.error('dataInitApi.initAll 에러:', error);
      throw error;
    }
  }
};

// 데이터 초기화 유틸리티 함수들
const dataInitUtils = {
  /**
   * 초기화 상태를 로컬 스토리지에 저장
   * @param {string} type - 초기화 타입 ('regions', 'admin', 'members', 'all')
   * @param {boolean} success - 성공 여부
   * @param {string} timestamp - 초기화 시간
   */
  saveInitStatus: (type, success, timestamp = new Date().toISOString()) => {
    try {
      const initHistory = JSON.parse(localStorage.getItem('dataInitHistory') || '{}');
      initHistory[type] = {
        success,
        timestamp,
        date: new Date(timestamp).toLocaleString('ko-KR')
      };
      localStorage.setItem('dataInitHistory', JSON.stringify(initHistory));
    } catch (error) {
      console.warn('초기화 상태 저장 실패:', error);
    }
  },

  /**
   * 저장된 초기화 상태 조회
   * @param {string} type - 초기화 타입 (선택적)
   * @returns {Object} 초기화 히스토리
   */
  getInitStatus: (type = null) => {
    try {
      const initHistory = JSON.parse(localStorage.getItem('dataInitHistory') || '{}');
      return type ? initHistory[type] : initHistory;
    } catch (error) {
      console.warn('초기화 상태 조회 실패:', error);
      return type ? null : {};
    }
  },

  /**
   * 초기화 상태 초기화
   */
  clearInitStatus: () => {
    try {
      localStorage.removeItem('dataInitHistory');
    } catch (error) {
      console.warn('초기화 상태 삭제 실패:', error);
    }
  },

  /**
   * 초기화 진행률 계산
   * @param {Array} results - initAll 실행 결과
   * @returns {Object} 진행률 정보
   */
  calculateProgress: (results) => {
    if (!Array.isArray(results)) return { total: 0, completed: 0, percentage: 0 };
    
    const total = 3; // regions, admin, members
    const completed = results.filter(result => result.status === 'success').length;
    const percentage = Math.round((completed / total) * 100);
    
    return {
      total,
      completed,
      percentage,
      isComplete: completed === total
    };
  },

  /**
   * 초기화 결과 포맷팅
   * @param {Object} result - API 응답 결과
   * @param {string} type - 초기화 타입
   * @returns {Object} 포맷팅된 결과
   */
  formatInitResult: (result, type) => {
    const typeLabels = {
      'regions': '지역 데이터',
      'admin': '관리자 데이터',
      'members': '더미 회원 데이터',
      'all': '전체 데이터'
    };
    
    return {
      type: type,
      typeLabel: typeLabels[type] || type,
      message: result?.message || '초기화가 완료되었습니다.',
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleString('ko-KR'),
      success: true
    };
  },

  /**
   * 에러 결과 포맷팅
   * @param {Error} error - 에러 객체
   * @param {string} type - 초기화 타입
   * @returns {Object} 포맷팅된 에러 결과
   */
  formatInitError: (error, type) => {
    const typeLabels = {
      'regions': '지역 데이터',
      'admin': '관리자 데이터',
      'members': '더미 회원 데이터',
      'all': '전체 데이터'
    };
    
    return {
      type: type,
      typeLabel: typeLabels[type] || type,
      message: error?.message || '초기화 중 오류가 발생했습니다.',
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleString('ko-KR'),
      success: false,
      error: true
    };
  },

  /**
   * 관리자 권한 확인 (초기화는 관리자만 가능)
   * @returns {boolean} 관리자 권한 여부
   */
  checkAdminPermission: () => {
    try {
      // 실제로는 JWT 토큰이나 사용자 정보에서 관리자 권한을 확인해야 함
      const userRole = localStorage.getItem('userRole');
      return userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
    } catch (error) {
      console.warn('관리자 권한 확인 실패:', error);
      return false;
    }
  },

  /**
   * 초기화 전 확인 메시지 생성
   * @param {string} type - 초기화 타입
   * @param {number} count - 회원 수 (members의 경우)
   * @returns {string} 확인 메시지
   */
  getConfirmMessage: (type, count = null) => {
    const messages = {
      'regions': '지역 데이터를 초기화하시겠습니까?\n기존 지역 데이터가 모두 삭제되고 새로운 데이터로 대체됩니다.',
      'admin': '관리자 데이터를 초기화하시겠습니까?\n기존 관리자 정보가 모두 삭제되고 기본 관리자 계정이 생성됩니다.',
      'members': `더미 회원 데이터 ${count || 20}개를 생성하시겠습니까?\n테스트용 회원 계정이 생성됩니다.`,
      'all': `전체 데이터를 초기화하시겠습니까?\n\n1. 지역 데이터 초기화\n2. 관리자 데이터 초기화\n3. 더미 회원 ${count || 20}개 생성\n\n기존 데이터가 모두 삭제될 수 있습니다.`
    };
    
    return messages[type] || '데이터를 초기화하시겠습니까?';
  }
};

export { dataInitApi, dataInitUtils };
export default dataInitApi;