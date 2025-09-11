// axios 기반 API 구조로 마이그레이션
import { api, unwrap } from "@/lib/apiBase";

// 로그인 요청 데이터 유효성 검사
const validateLoginRequest = (data) => {
  const errors = [];
  
  if (!data.loginId || data.loginId.trim().length === 0) {
    errors.push('로그인 ID는 필수입니다');
  }
  
  if (!data.password || data.password.length === 0) {
    errors.push('비밀번호는 필수입니다');
  }
  
  if (data.loginId && data.loginId.length > 50) {
    errors.push('로그인 ID는 50자 이내여야 합니다');
  }
  
  if (data.password && data.password.length > 100) {
    errors.push('비밀번호는 100자 이내여야 합니다');
  }
  
  if (errors.length > 0) {
    throw new Error(`유효성 검사 실패: ${errors.join(', ')}`);
  }
};


// Auth API 서비스 객체
const authApi = {
  /**
   * POST /api/v1/auth/login
   * 사용자 로그인
   * @param {Object} loginData - 로그인 요청 데이터
   * @param {string} loginData.loginId - 로그인 ID (필수)
   * @param {string} loginData.password - 비밀번호 (필수)
   * @returns {Promise<Object>} 로그인 성공 시 토큰 정보 {token, user, message}
   */
  login: async (loginData) => {
    try {
      // 유효성 검사
      validateLoginRequest(loginData);
      
      // axios 사용 (interceptor 혜택 유지)
      const result = await unwrap(
        api.post('/v1/auth/login', {
          loginId: loginData.loginId.trim(),
          password: loginData.password
        })
      );
      
      // 토큰이 있으면 localStorage에 저장
      if (result.token) {
        localStorage.setItem('accessToken', result.token);
      }
      
      return result;
    } catch (error) {
      console.error('authApi.login 에러:', error);
      throw error;
    }
  },

  /**
   * 로그아웃
   * @returns {Promise<boolean>} 로그아웃 성공 여부
   */
  logout: async () => {
    try {
      localStorage.removeItem('accessToken');
      return true;
    } catch (error) {
      console.error('authApi.logout 에러:', error);
      return false;
    }
  }
};

// 인증 상태 관리 유틸리티 함수들
const authUtils = {
  /**
   * 로그인 상태 확인
   */
  isLoggedIn: () => {
    return !!localStorage.getItem('accessToken');
  },

  /**
   * 현재 저장된 토큰 가져오기
   */
  getAccessToken: () => {
    return localStorage.getItem('accessToken');
  },

  /**
   * 토큰 제거 (로그아웃)
   */
  clearTokens: () => {
    localStorage.removeItem('accessToken');
  },

  /**
   * Authorization 헤더 생성
   */
  getAuthHeader: () => {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },

  /**
   * 로그인 ID 유효성 검사
   */
  isValidLoginId: (loginId) => {
    if (!loginId) return false;
    return loginId.length >= 4 && loginId.length <= 20;
  },

  /**
   * 비밀번호 유효성 검사
   */
  isValidPassword: (password) => {
    if (!password) return false;
    return password.length >= 6;
  }
};

export { authApi, authUtils };
export default authApi;