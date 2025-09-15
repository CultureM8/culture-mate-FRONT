// /lib/chatApi.js  (통합본)

// ====== 환경 설정 ======
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT_CHAT || "/chatroom"; // 백엔드와 일치

const API_URL = `${BASE_URL}${API_BASE}${ENDPOINT}`;

// ====== 공통 fetch 설정/헬퍼 ======
const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // JWT 토큰 추가
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

// 공통 에러/응답 처리
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorData}`);
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return null; // DELETE 등 비어있는 응답
  }
  return await response.json();
};

// ====== 요청 데이터 유효성 검사 ======
const validateChatRoomRequest = (data) => {
  const errors = [];
  if (!data.name || data.name.trim().length === 0 || data.name.length > 50) {
    errors.push("채팅방 이름은 1-50자 이내여야 합니다");
  }
  if (data.togetherId && !Number.isInteger(data.togetherId)) {
    errors.push("동행 ID는 정수여야 합니다");
  }
  if (errors.length > 0) {
    throw new Error(`유효성 검사 실패: ${errors.join(", ")}`);
  }
};

const validateMessageRequest = (data) => {
  const errors = [];
  if (
    !data.content ||
    data.content.trim().length === 0 ||
    data.content.length > 1000
  ) {
    errors.push("메시지 내용은 1-1000자 이내여야 합니다");
  }
  if (!data.senderId || !Number.isInteger(data.senderId)) {
    errors.push("발신자 ID는 필수이며 정수여야 합니다");
  }
  if (errors.length > 0) {
    throw new Error(`유효성 검사 실패: ${errors.join(", ")}`);
  }
};

// ====== Chat API 서비스 객체 (두 번째 코드 우선) ======
const chatApi = {
  /**
   * POST /api/v1/chat/room
   * 새 채팅방 생성
   */
  createRoom: async (roomData) => {
    try {
      validateChatRoomRequest(roomData);
      const res = await fetch(`${API_URL}/create`, {
        method: "POST",
        credentials: "include",
        headers: getHeaders(),
        body: JSON.stringify(roomData),
      });
      return handleResponse(res);
    } catch (error) {
      console.error("chatApi.createRoom 에러:", error);
      throw error;
    }
  },

  /**
   * GET /api/v1/chat/room/{roomId}
   * 특정 채팅방 정보 조회
   */
  getRoomById: async (roomId) => {
    try {
      if (!roomId || !Number.isInteger(Number(roomId))) {
        throw new Error("올바른 채팅방 ID를 입력해주세요");
      }
      const res = await fetch(`${API_URL}/${roomId}`, {
        method: "GET",
        credentials: "include",
        headers: getHeaders(),
      });
      return handleResponse(res);
    } catch (error) {
      console.error(`chatApi.getRoomById(${roomId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * GET /api/v1/chatroom/my
   * 내가 참여한 채팅방 목록 조회
   */
  getAllRooms: async () => {
    try {
      const res = await fetch(`${API_URL}/my`, {
        method: "GET",
        credentials: "include",
        headers: getHeaders(),
      });
      return handleResponse(res);
    } catch (error) {
      console.error("chatApi.getAllRooms 에러:", error);
      throw error;
    }
  },

  /**
   * GET /api/v1/chatroom/{roomId}/messages
   * 특정 채팅방의 메시지 목록 조회
   */
  getMessages: async (roomId, params = {}) => {
    try {
      if (!roomId || !Number.isInteger(Number(roomId))) {
        throw new Error("올바른 채팅방 ID를 입력해주세요");
      }
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(
          ([, value]) => value !== undefined && value !== null && value !== ""
        )
      );
      const qs = new URLSearchParams(cleanParams).toString();
      const url = qs
        ? `${API_URL}/${roomId}/messages?${qs}`
        : `${API_URL}/${roomId}/messages`;

      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: getHeaders(),
      });
      return handleResponse(res);
    } catch (error) {
      console.error(`chatApi.getMessages(${roomId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * POST /api/v1/chat/room/{roomId}/message
   * 채팅방에 메시지 전송
   */
  sendMessage: async (roomId, messageData) => {
    try {
      if (!roomId || !Number.isInteger(Number(roomId))) {
        throw new Error("올바른 채팅방 ID를 입력해주세요");
      }
      validateMessageRequest(messageData);
      const res = await fetch(`${API_URL}/${roomId}/message`, {
        method: "POST",
        credentials: "include",
        headers: getHeaders(),
        body: JSON.stringify(messageData),
      });
      return handleResponse(res);
    } catch (error) {
      console.error(`chatApi.sendMessage(${roomId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * PUT /api/v1/chat/room/{roomId}
   * 채팅방 정보 수정
   */
  updateRoom: async (roomId, updateData) => {
    try {
      if (!roomId || !Number.isInteger(Number(roomId))) {
        throw new Error("올바른 채팅방 ID를 입력해주세요");
      }
      validateChatRoomRequest(updateData);
      const res = await fetch(`${API_URL}/${roomId}`, {
        method: "PUT",
        credentials: "include",
        headers: getHeaders(),
        body: JSON.stringify(updateData),
      });
      return handleResponse(res);
    } catch (error) {
      console.error(`chatApi.updateRoom(${roomId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * DELETE /api/v1/chat/room/{roomId}
   * 채팅방 삭제
   */
  deleteRoom: async (roomId) => {
    try {
      if (!roomId || !Number.isInteger(Number(roomId))) {
        throw new Error("올바른 채팅방 ID를 입력해주세요");
      }
      const res = await fetch(`${API_URL}/${roomId}/leave`, {
        method: "DELETE",
        credentials: "include",
        headers: getHeaders(),
      });
      return handleResponse(res);
    } catch (error) {
      console.error(`chatApi.deleteRoom(${roomId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * GET /api/v1/chat/rooms/user/{userId}
   * 특정 사용자가 참여한 채팅방 목록
   */
  getRoomsByUser: async (userId) => {
    try {
      if (!userId || !Number.isInteger(Number(userId))) {
        throw new Error("올바른 사용자 ID를 입력해주세요");
      }
      const res = await fetch(`${API_URL}/my`, {
        method: "GET",
        credentials: "include",
        headers: getHeaders(),
      });
      return handleResponse(res);
    } catch (error) {
      console.error(`chatApi.getRoomsByUser(${userId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * POST /api/v1/chat/room/{roomId}/join
   * 채팅방 입장 (body: { userId })
   */
  joinRoom: async (roomId, userId) => {
    try {
      if (!roomId || !Number.isInteger(Number(roomId))) {
        throw new Error("올바른 채팅방 ID를 입력해주세요");
      }
      // userId는 서버에서 JWT로 자동 처리
      const res = await fetch(`${API_URL}/${roomId}/join`, {
        method: "POST",
        credentials: "include",
        headers: getHeaders(),
        body: JSON.stringify({}), // 빈 바디 또는 userId 선택적
      });
      return handleResponse(res);
    } catch (error) {
      console.error(`chatApi.joinRoom(${roomId}, ${userId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * POST /api/v1/chat/room/{roomId}/leave
   * 채팅방 나가기 (body: { userId })
   */
  leaveRoom: async (roomId, userId) => {
    try {
      if (!roomId || !Number.isInteger(Number(roomId))) {
        throw new Error("올바른 채팅방 ID를 입력해주세요");
      }
      // userId는 서버에서 JWT로 자동 처리
      const res = await fetch(`${API_URL}/${roomId}/leave`, {
        method: "DELETE",
        credentials: "include",
        headers: getHeaders(),
      });
      return handleResponse(res);
    } catch (error) {
      console.error(`chatApi.leaveRoom(${roomId}, ${userId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * ✅ [추가] GET /api/v1/chat/room/{roomId}/members
   * 채팅방 멤버 목록 조회 (첫 번째 코드 호환 기능)
   */
  getRoomMembers: async (roomId) => {
    try {
      const id = Number(roomId);
      if (!Number.isFinite(id)) {
        const err = new Error("getRoomMembers: roomId must be a number");
        err.status = 400;
        throw err;
      }
      const res = await fetch(`${API_URL}/${id}/members`, {
        method: "GET",
        credentials: "include",
        headers: getHeaders(),
      });
      return handleResponse(res);
    } catch (error) {
      console.error(`chatApi.getRoomMembers(${roomId}) 에러:`, error);
      throw error;
    }
  },
};

// ====== 데이터 변환 유틸 ======
const chatDataUtils = {
  convertToRoomApiFormat: (formData) => ({
    name: formData.name?.trim() || "",
    togetherId: formData.togetherId ? parseInt(formData.togetherId) : null,
  }),

  convertToMessageApiFormat: (formData) => ({
    content: formData.content?.trim() || "",
    senderId: formData.senderId || 1, // 현재 로그인 사용자 ID로 교체
  }),

  processApiResponse: (apiData) => ({
    ...apiData,
    formattedCreatedAt: apiData.createdAt
      ? new Date(apiData.createdAt).toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : "",
    isTogetherRoom: !!apiData.togetherId,
  }),

  formatMessageTime: (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  },

  formatMessageDate: (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\. /g, "-")
      .replace(".", "");
  },

  isValidRoomName: (name) =>
    !!name && name.trim().length >= 1 && name.trim().length <= 50,

  isValidMessageContent: (content) =>
    !!content && content.trim().length >= 1 && content.trim().length <= 1000,

  getOnlineStatusText: (isOnline) => (isOnline ? "온라인" : "오프라인"),

  formatUnreadCount: (count) => {
    if (!count || count === 0) return "";
    if (count > 99) return "99+";
    return String(count);
  },

  getRoomType: (roomData) => (roomData.togetherId ? "together" : "general"),

  isMyMessage: (messageData, currentUserId) =>
    messageData.senderId === currentUserId,
};

// ====== 호환/별칭 Exports ======
// (첫 번째 코드 호환)
export const listChatRooms = chatApi.getAllRooms; // GET /rooms/list
export const createChatRoom = chatApi.createRoom; // body { name }
export const joinRoom = chatApi.joinRoom; // body { userId }
export const getChatRoom = chatApi.getRoomById; // GET /room/{id}
export const getChatMessages = chatApi.getMessages; // GET /room/{id}/messages
export const getChatRoomMembers = chatApi.getRoomMembers;
export { getChatRoomMembers as getRoomMembers }; // 별칭 유지

// ====== 기존 두 번째 코드식 Exports ======
const getChats = chatApi.getAllRooms;

export {
  chatApi,
  chatDataUtils,
  getChats,
  // 필요 시 개별 접근을 위한 별칭들
  getChats as getChatRooms,
};

export default chatApi;
export const sendChatMessage = chatApi.sendMessage;
