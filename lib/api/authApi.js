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
   * POST /api/v1/auth/register
   * 회원가입
   * @param {Object} registerData - 회원가입 요청 데이터
   * @param {string} registerData.loginId - 로그인 ID (필수)
   * @param {string} registerData.password - 비밀번호 (필수)
   * @param {string} registerData.nickname - 닉네임 (필수)
   * @param {string} registerData.email - 이메일 (선택)
   * @returns {Promise<Object>} 회원가입 성공 시 회원 정보
   */
  register: async (registerData) => {
    try {
      // 유효성 검사
      const loginIdError = authUtils.getLoginIdValidationMessage(registerData.loginId);
      if (loginIdError) {
        throw new Error(loginIdError);
      }

      // 통일된 비밀번호 검증 사용
      const passwordError = authUtils.getPasswordValidationMessage(registerData.password);
      if (passwordError) {
        throw new Error(passwordError);
      }

      if (!registerData.nickname || !registerData.nickname.trim()) {
        throw new Error('닉네임은 필수입니다');
      }

      const result = await unwrap(
        api.post('/v1/auth/register', {
          loginId: registerData.loginId.trim(),
          password: registerData.password,
          nickname: registerData.nickname.trim(),
          email: registerData.email ? registerData.email.trim() : null
        })
      );

      return result;
    } catch (error) {
      console.error('authApi.register 에러:', error);
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
  },

  /**
   * GET /api/v1/auth/check-login-id
   * 아이디 중복 확인
   * @param {string} loginId - 확인할 로그인 ID
   * @returns {Promise<Object>} 중복 확인 결과 {isDuplicate, message}
   */
  checkLoginIdDuplicate: async (loginId) => {
    try {
      if (!loginId || !loginId.trim()) {
        throw new Error('아이디를 입력해주세요.');
      }

      const result = await unwrap(
        api.get('/v1/auth/check-login-id', {
          params: { loginId: loginId.trim() }
        })
      );

      return result;
    } catch (error) {
      console.error('authApi.checkLoginIdDuplicate 에러:', error);
      throw error;
    }
  },

  /**
   * GET /api/v1/auth/check-email
   * 이메일 중복 확인
   * @param {string} email - 확인할 이메일
   * @returns {Promise<Object>} 중복 확인 결과 {isDuplicate, message}
   */
  checkEmailDuplicate: async (email) => {
    try {
      if (!email || !email.trim()) {
        throw new Error('이메일을 입력해주세요.');
      }

      const result = await unwrap(
        api.get('/v1/auth/check-email', {
          params: { email: email.trim() }
        })
      );

      return result;
    } catch (error) {
      console.error('authApi.checkEmailDuplicate 에러:', error);
      throw error;
    }
  },

  /**
   * POST /api/v1/auth/verify-current-password
   * 현재 비밀번호 확인
   * @param {string} currentPassword - 확인할 현재 비밀번호
   * @returns {Promise<Object>} 비밀번호 확인 결과 {isValid, message}
   */
  verifyCurrentPassword: async (currentPassword) => {
    try {
      if (!currentPassword || !currentPassword.trim()) {
        throw new Error('현재 비밀번호를 입력해주세요.');
      }

      const result = await unwrap(
        api.post('/v1/auth/verify-current-password', {
          currentPassword: currentPassword.trim()
        })
      );

      return result;
    } catch (error) {
      console.error('authApi.verifyCurrentPassword 에러:', error);
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
   * 4-20자, 영문+숫자+언더스코어만 허용
   */
  isValidLoginId: (loginId) => {
    if (!loginId) return false;

    // 4-20자, 영문+숫자+언더스코어만 허용
    const loginIdRegex = /^[a-zA-Z0-9_]{4,20}$/;
    return loginIdRegex.test(loginId);
  },

  /**
   * 로그인 ID 검증 오류 메시지 반환
   */
  getLoginIdValidationMessage: (loginId) => {
    if (!loginId) return "아이디를 입력해주세요.";
    if (loginId.length < 4) return "아이디는 4자 이상이어야 합니다.";
    if (loginId.length > 20) return "아이디는 20자 이하여야 합니다.";
    if (!/^[a-zA-Z0-9_]+$/.test(loginId)) return "아이디는 영문, 숫자, 언더스코어만 사용 가능합니다.";
    return null; // 유효한 경우
  },

  /**
   * 비밀번호 유효성 검사
   * 8자 이상, 영문+숫자+특수문자 각 1개 이상 포함
   */
  isValidPassword: (password) => {
    if (!password) return false;

    // 8자 이상, 영문+숫자+특수문자 각 1개 이상, 허용된 문자만 사용
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=.,?])[a-zA-Z\d!@#$%^&*()_+\-=.,?]{8,}$/;
    return passwordRegex.test(password);
  },

  /**
   * 비밀번호 검증 오류 메시지 반환
   */
  getPasswordValidationMessage: (password) => {
    if (!password) return "비밀번호를 입력해주세요.";
    if (password.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
    if (!/[a-zA-Z]/.test(password)) return "영문자를 포함해야 합니다.";
    if (!/\d/.test(password)) return "숫자를 포함해야 합니다.";
    if (!/[!@#$%^&*()_+\-=.,?]/.test(password)) return "특수문자(!@#$%^&*()_+-=.,?)를 포함해야 합니다.";
    if (!/^[a-zA-Z\d!@#$%^&*()_+\-=.,?]+$/.test(password)) return "허용되지 않은 문자가 포함되어 있습니다.";
    return null; // 유효한 경우
  },

  /**
   * 이메일 유효성 검사
   */
  isValidEmail: (email) => {
    if (!email) return true; // 선택 필드이므로 빈 값 허용
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * 이메일 검증 오류 메시지 반환
   */
  getEmailValidationMessage: (email) => {
    if (!email || !email.trim()) return null; // 선택 필드이므로 빈 값 허용
    if (!authUtils.isValidEmail(email)) return "올바른 이메일 형식이 아닙니다.";
    return null; // 유효한 경우
  }
};

export { authApi, authUtils };
export default authApi;