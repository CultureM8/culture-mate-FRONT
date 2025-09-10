const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT_MEMBERS || "/members";

const API_URL = `${BASE_URL}${API_BASE}${ENDPOINT}`;

// 회원 관련 API 함수들
const memberApi = {
  // 1. 전체 회원 조회 (GET /api/v1/members)
  getAllMembers: async () => {
    try {
      const response = await fetch(`${API_URL}`, {
        method: "GET",
        credentials: 'include', // 추가
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("전체 회원 조회 실패:", error);
      throw error;
    }
  },

  // 2. 회원 등록 (POST /api/v1/members)
  createMember: async (memberData) => {
    try {
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        credentials: 'include', // 추가
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memberData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("회원 등록 실패:", error);
      throw error;
    }
  },

  // 3. 회원 상태 변경 (PATCH /api/v1/members/{id}/status)
  updateMemberStatus: async (memberId, status) => {
    try {
      const response = await fetch(`${API_URL}/${memberId}/status`, {
        method: "PATCH",
        credentials: 'include', // 추가
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("회원 상태 변경 실패:", error);
      throw error;
    }
  },

  // 4. 회원 역할 변경 (PATCH /api/v1/members/{id}/role)
  updateMemberRole: async (memberId, role) => {
    try {
      const response = await fetch(`${API_URL}/${memberId}/role`, {
        method: "PATCH",
        credentials: 'include', // 추가
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("회원 역할 변경 실패:", error);
      throw error;
    }
  },

  // 5. 회원 비밀번호 변경 (PATCH /api/v1/members/{id}/password)
  updateMemberPassword: async (memberId, passwordData) => {
    try {
      const response = await fetch(`${API_URL}/${memberId}/password`, {
        method: "PATCH",
        credentials: 'include', // 추가
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("회원 비밀번호 변경 실패:", error);
      throw error;
    }
  },

  // 6. 회원 상태별 조회 (GET /api/v1/members/status/{status})
  getMembersByStatus: async (status) => {
    try {
      const response = await fetch(`${API_URL}/status/${status}`, {
        method: "GET",
        credentials: 'include', // 추가
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("회원 상태별 조회 실패:", error);
      throw error;
    }
  },

  // 7. 로그인 ID로 회원 조회 (GET /api/v1/members/login/{loginId})
  getMemberByLoginId: async (loginId) => {
    try {
      const response = await fetch(`${API_URL}/login/${loginId}`, {
        method: "GET",
        credentials: 'include', // 추가
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("로그인 ID로 회원 조회 실패:", error);
      throw error;
    }
  },

  // 8. 회원 ID로 회원 조회 (GET /api/v1/members/id/{id})
  getMemberById: async (memberId) => {
    try {
      const response = await fetch(`${API_URL}/id/${memberId}`, {
        method: "GET",
        credentials: 'include', // 추가
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("회원 ID로 회원 조회 실패:", error);
      throw error;
    }
  },

  // 9. 회원 삭제 (DELETE /api/v1/members/{memberId})
  deleteMember: async (memberId) => {
    try {
      const response = await fetch(`${API_URL}/${memberId}`, {
        method: "DELETE",
        credentials: 'include', // 추가
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // DELETE 요청은 일반적으로 본문이 없거나 간단한 응답만 반환
      if (response.status === 204) {
        return { success: true, message: "회원이 성공적으로 삭제되었습니다." };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("회원 삭제 실패:", error);
      throw error;
    }
  },
};

export default memberApi;