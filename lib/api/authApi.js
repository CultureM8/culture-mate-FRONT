const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT_AUTH || "/auth";

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
  
  // 응답이 비어있는 경우 (일부 인증 요청)
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return { success: true };
  }
  
  return await response.json();
};

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

// 회원가입 요청 데이터 유효성 검사
const validateRegisterRequest = (data) => {
  const errors = [];
  
  if (!data.loginId || data.loginId.trim().length === 0) {
    errors.push('로그인 ID는 필수입니다');
  }
  
  if (!data.password || data.password.length === 0) {
    errors.push('비밀번호는 필수입니다');
  }
  
  if (!data.email || data.email.trim().length === 0) {
    errors.push('이메일은 필수입니다');
  }
  
  if (data.loginId && (data.loginId.length < 4 || data.loginId.length > 20)) {
    errors.push('로그인 ID는 4-20자 이내여야 합니다');
  }
  
  if (data.password && data.password.length < 6) {
    errors.push('비밀번호는 최소 6자 이상이어야 합니다');
  }
  
  // 이메일 형식 검사
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailPattern.test(data.email)) {
    errors.push('올바른 이메일 형식이 아닙니다');
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
   * @returns {Promise<Object>} 로그인 성공 시 토큰 정보
   */
  login: async (loginData) => {
    try {
      // 유효성 검사
      validateLoginRequest(loginData);
      
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: defaultHeaders,
        body: JSON.stringify({
          loginId: loginData.loginId.trim(),
          password: loginData.password
        }),
      });
      
      const result = await handleResponse(response);
      
      // 토큰이 있으면 localStorage에 저장
      if (result.accessToken) {
        localStorage.setItem('accessToken', result.accessToken);
      }
      if (result.refreshToken) {
        localStorage.setItem('refreshToken', result.refreshToken);
      }
      
      return result;
    } catch (error) {
      console.error('authApi.login 에러:', error);
      throw error;
    }
  },

  /**
   * POST /api/v1/auth/logout
   * 사용자 로그아웃
   * @returns {Promise<Object>} 로그아웃 성공 여부
   */
  logout: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...defaultHeaders,
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
      });
      
      const result = await handleResponse(response);
      
      // 로그아웃 성공 시 토큰 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      return result;
    } catch (error) {
      console.error('authApi.logout 에러:', error);
      // 로그아웃 에러여도 토큰은 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw error;
    }
  },

  /**
   * POST /api/v1/auth/register
   * 회원가입
   * @param {Object} registerData - 회원가입 요청 데이터
   * @param {string} registerData.loginId - 로그인 ID (4-20자, 필수)
   * @param {string} registerData.password - 비밀번호 (6자 이상, 필수)
   * @param {string} registerData.email - 이메일 (필수)
   * @param {string} registerData.userName - 사용자명 (선택)
   * @returns {Promise<Object>} 회원가입 성공 정보
   */
  register: async (registerData) => {
    try {
      // 유효성 검사
      validateRegisterRequest(registerData);
      
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        credentials: 'include',
        headers: defaultHeaders,
        body: JSON.stringify({
          loginId: registerData.loginId.trim(),
          password: registerData.password,
          email: registerData.email.trim(),
          userName: registerData.userName?.trim() || registerData.loginId.trim()
        }),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('authApi.register 에러:', error);
      throw error;
    }
  },

  /**
   * POST /api/v1/auth/refresh
   * 액세스 토큰 갱신
   * @returns {Promise<Object>} 새로운 토큰 정보
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('리프레시 토큰이 없습니다');
      }
      
      const response = await fetch(`${API_URL}/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...defaultHeaders,
          'Authorization': `Bearer ${refreshToken}`
        },
      });
      
      const result = await handleResponse(response);
      
      // 새로운 토큰으로 교체
      if (result.accessToken) {
        localStorage.setItem('accessToken', result.accessToken);
      }
      if (result.refreshToken) {
        localStorage.setItem('refreshToken', result.refreshToken);
      }
      
      return result;
    } catch (error) {
      console.error('authApi.refreshToken 에러:', error);
      // 토큰 갱신 실패 시 기존 토큰 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw error;
    }
  },

  /**
   * GET /api/v1/auth/me
   * 현재 로그인된 사용자 정보 조회
   * @returns {Promise<Object>} 사용자 정보
   */
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('액세스 토큰이 없습니다');
      }
      
      const response = await fetch(`${API_URL}/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          ...defaultHeaders,
          'Authorization': `Bearer ${token}`
        },
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('authApi.getCurrentUser 에러:', error);
      throw error;
    }
  },

  /**
   * POST /api/v1/auth/check-id
   * 로그인 ID 중복 확인
   * @param {string} loginId - 확인할 로그인 ID
   * @returns {Promise<Object>} 중복 여부 결과
   */
  checkLoginId: async (loginId) => {
    try {
      if (!loginId || loginId.trim().length === 0) {
        throw new Error('로그인 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/check-id`, {
        method: 'POST',
        credentials: 'include',
        headers: defaultHeaders,
        body: JSON.stringify({ loginId: loginId.trim() }),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('authApi.checkLoginId 에러:', error);
      throw error;
    }
  },

  /**
   * POST /api/v1/auth/check-email
   * 이메일 중복 확인
   * @param {string} email - 확인할 이메일
   * @returns {Promise<Object>} 중복 여부 결과
   */
  checkEmail: async (email) => {
    try {
      if (!email || email.trim().length === 0) {
        throw new Error('이메일을 입력해주세요');
      }
      
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        throw new Error('올바른 이메일 형식이 아닙니다');
      }
      
      const response = await fetch(`${API_URL}/check-email`, {
        method: 'POST',
        credentials: 'include',
        headers: defaultHeaders,
        body: JSON.stringify({ email: email.trim() }),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('authApi.checkEmail 에러:', error);
      throw error;
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
   * 리프레시 토큰 가져오기
   */
  getRefreshToken: () => {
    return localStorage.getItem('refreshToken');
  },

  /**
   * 모든 토큰 제거 (강제 로그아웃)
   */
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
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
  },

  /**
   * 이메일 유효성 검사
   */
  isValidEmail: (email) => {
    if (!email) return false;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  },

  /**
   * 비밀번호 강도 확인
   */
  getPasswordStrength: (password) => {
    if (!password) return 'weak';
    
    let score = 0;
    
    // 길이 체크
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // 문자 종류 체크
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  },

  /**
   * 토큰 만료 확인 (JWT 디코딩)
   */
  isTokenExpired: (token) => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  },

  /**
   * 자동 로그아웃 타이머 설정
   */
  setAutoLogoutTimer: (callback, minutes = 30) => {
    return setTimeout(() => {
      authUtils.clearTokens();
      if (callback) callback();
    }, minutes * 60 * 1000);
  }
};

export { authApi, authUtils };
export default authApi;