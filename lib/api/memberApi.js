import { api, unwrap } from '@/lib/apiBase';

const ENDPOINT = "/v1/member";

// 회원 관련 API 함수들 (백엔드 통합 엔드포인트 구조에 맞춤)
const memberApi = {
  /**
   * GET /api/v1/member
   * 통합 회원 조회 API (쿼리 파라미터 기반)
   * @param {Object} params - 조회 조건
   * @param {number} params.id - 회원 ID로 단일 조회
   * @param {string} params.loginId - 로그인 ID로 단일 조회
   * @param {string} params.status - 상태별 목록 조회 (ACTIVE, DORMANT, SUSPENDED, BANNED)
   * @returns {Promise<Object|Array>} 단일 회원 또는 회원 목록
   */
  getMember: async (params = {}) => {
    try {
      return await unwrap(
        api.get(ENDPOINT, { params })
      );
    } catch (error) {
      console.error('memberApi.getMember 에러:', error);
      throw error;
    }
  },

  /**
   * 전체 회원 조회 (편의 메서드)
   */
  getAllMembers: async () => {
    return memberApi.getMember(); // 파라미터 없이 호출하면 전체 조회
  },

  /**
   * ID로 단일 회원 조회 (편의 메서드)
   */
  getMemberById: async (id) => {
    return memberApi.getMember({ id });
  },

  /**
   * 로그인 ID로 단일 회원 조회 (편의 메서드)
   */
  getMemberByLoginId: async (loginId) => {
    return memberApi.getMember({ loginId });
  },

  /**
   * 상태별 회원 목록 조회 (편의 메서드)
   */
  getMembersByStatus: async (status) => {
    return memberApi.getMember({ status });
  },

  /**
   * POST /api/v1/member
   * 회원 가입 (새로운 회원 등록)
   * @param {Object} memberData - 회원 가입 데이터
   * @param {string} memberData.loginId - 로그인 ID
   * @param {string} memberData.password - 비밀번호
   * @param {string} memberData.email - 이메일
   * @param {string} memberData.userName - 사용자명
   * @returns {Promise<Object>} 등록된 회원 정보
   */
  createMember: async (memberData) => {
    try {
      return await unwrap(
        api.post(ENDPOINT, memberData)
      );
    } catch (error) {
      console.error('memberApi.createMember 에러:', error);
      throw error;
    }
  },

  /**
   * PATCH /api/v1/member/{id}/status
   * 회원 상태 변경 (관리자용)
   * @param {number} memberId - 회원 ID
   * @param {string} status - 변경할 상태 (ACTIVE, DORMANT, SUSPENDED, BANNED)
   * @returns {Promise<Object>} 수정된 회원 정보
   */
  updateMemberStatus: async (memberId, status) => {
    try {
      return await unwrap(
        api.patch(`${ENDPOINT}/${memberId}/status`, null, {
          params: { status }
        })
      );
    } catch (error) {
      console.error('memberApi.updateMemberStatus 에러:', error);
      throw error;
    }
  },

  /**
   * PATCH /api/v1/member/{id}/role
   * 회원 권한 변경 (관리자용)
   * @param {number} memberId - 회원 ID
   * @param {string} role - 변경할 권한 (ADMIN, MEMBER)
   * @returns {Promise<Object>} 수정된 회원 정보
   */
  updateMemberRole: async (memberId, role) => {
    try {
      return await unwrap(
        api.patch(`${ENDPOINT}/${memberId}/role`, null, {
          params: { role }
        })
      );
    } catch (error) {
      console.error('memberApi.updateMemberRole 에러:', error);
      throw error;
    }
  },

  /**
   * PATCH /api/v1/member/{id}/password
   * 회원 비밀번호 변경
   * @param {number} memberId - 회원 ID
   * @param {string} newPassword - 새 비밀번호
   * @returns {Promise<Object>} 수정된 회원 정보
   */
  updateMemberPassword: async (memberId, newPassword) => {
    try {
      return await unwrap(
        api.patch(`${ENDPOINT}/${memberId}/password`, null, {
          params: { newPassword }
        })
      );
    } catch (error) {
      console.error('memberApi.updateMemberPassword 에러:', error);
      throw error;
    }
  },


  /**
   * DELETE /api/v1/member/{memberId}
   * 회원 삭제
   * @param {number} memberId - 삭제할 회원 ID
   * @returns {Promise<void>} 삭제 성공
   */
  deleteMember: async (memberId) => {
    try {
      return await unwrap(
        api.delete(`${ENDPOINT}/${memberId}`)
      );
    } catch (error) {
      console.error('memberApi.deleteMember 에러:', error);
      throw error;
    }
  }
};

// 회원 상태 상수
export const MEMBER_STATUS = {
  ACTIVE: 'ACTIVE',
  DORMANT: 'DORMANT', 
  SUSPENDED: 'SUSPENDED',
  BANNED: 'BANNED'
};

// 회원 권한 상수
export const MEMBER_ROLE = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER'
};

// 회원 데이터 검증 함수
export const validateMemberData = (memberData) => {
  const errors = [];
  
  if (!memberData.loginId || memberData.loginId.trim().length === 0) {
    errors.push('로그인 ID는 필수입니다.');
  }
  
  if (memberData.loginId && (memberData.loginId.length < 4 || memberData.loginId.length > 20)) {
    errors.push('로그인 ID는 4-20자 이내여야 합니다.');
  }
  
  if (!memberData.password || memberData.password.length === 0) {
    errors.push('비밀번호는 필수입니다.');
  }
  
  if (memberData.password && memberData.password.length < 6) {
    errors.push('비밀번호는 최소 6자 이상이어야 합니다.');
  }
  
  if (!memberData.email || memberData.email.trim().length === 0) {
    errors.push('이메일은 필수입니다.');
  }
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (memberData.email && !emailPattern.test(memberData.email)) {
    errors.push('올바른 이메일 형식이 아닙니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 개별 함수들도 export
export const {
  getMember,
  getAllMembers,
  getMemberById,
  getMemberByLoginId,
  getMembersByStatus,
  createMember,
  updateMemberStatus,
  updateMemberRole,
  updateMemberPassword,
  deleteMember
} = memberApi;

export default memberApi;