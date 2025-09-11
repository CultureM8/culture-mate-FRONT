const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT_CHATROOM || "/chatroom";

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


// 공통 헤더 생성 함수 (JWT 토큰 자동 추가)
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// ChatRoom API 서비스 객체
const chatRoomApi = {
  /**
   * GET /api/v1/chatroom
   * 전체 채팅방 목록 조회 (관리자용)
   * @returns {Promise<Array>} 채팅방 목록
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
      console.error('chatRoomApi.getAll 에러:', error);
      throw error;
    }
  },

  /**
   * GET /api/v1/chatroom/{roomId}
   * 특정 채팅방 조회
   * @param {number} roomId - 채팅방 ID
   * @returns {Promise<Object>} 채팅방 상세 정보
   */
  getById: async (roomId) => {
    try {
      if (!roomId || !Number.isInteger(Number(roomId))) {
        throw new Error('올바른 채팅방 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/${roomId}`, {
        method: 'GET',
        credentials: 'include',
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`chatRoomApi.getById(${roomId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * POST /api/v1/chatroom/create
   * 새 채팅방 생성
   * @returns {Promise<Object>} 생성된 채팅방 정보
   */
  create: async () => {
    try {
      const response = await fetch(`${API_URL}/create`, {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('chatRoomApi.create 에러:', error);
      throw error;
    }
  },

  /**
   * GET /api/v1/chatroom/my
   * 내 채팅방 목록 조회 (로그인한 회원)
   * @returns {Promise<Array>} 내가 참여한 채팅방 목록
   */
  getMy: async () => {
    try {
      const response = await fetch(`${API_URL}/my`, {
        method: 'GET',
        credentials: 'include',
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('chatRoomApi.getMy 에러:', error);
      throw error;
    }
  },

  /**
   * POST /api/v1/chatroom/{roomId}/join
   * 채팅방 입장
   * @param {number} roomId - 채팅방 ID
   * @returns {Promise<void>} 입장 결과
   */
  joinRoom: async (roomId) => {
    try {
      if (!roomId || !Number.isInteger(Number(roomId))) {
        throw new Error('올바른 채팅방 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/${roomId}/join`, {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`chatRoomApi.joinRoom(${roomId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * GET /api/v1/chatroom/{roomId}/messages
   * 채팅 메시지 조회
   * @param {number} roomId - 채팅방 ID
   * @returns {Promise<Array>} 메시지 목록
   */
  getMessages: async (roomId) => {
    try {
      if (!roomId || !Number.isInteger(Number(roomId))) {
        throw new Error('올바른 채팅방 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/${roomId}/messages`, {
        method: 'GET',
        credentials: 'include',
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`chatRoomApi.getMessages(${roomId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * DELETE /api/v1/chatroom/{roomId}/leave
   * 채팅방 나가기
   * @param {number} roomId - 채팅방 ID
   * @returns {Promise<void>} 나가기 결과
   */
  leaveRoom: async (roomId) => {
    try {
      if (!roomId || !Number.isInteger(Number(roomId))) {
        throw new Error('올바른 채팅방 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/${roomId}/leave`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`chatRoomApi.leaveRoom(${roomId}) 에러:`, error);
      throw error;
    }
  }
};

// 데이터 변환 유틸리티 함수들
const chatRoomDataUtils = {
  /**
   * 백엔드 응답을 프론트엔드에서 사용하기 쉽게 가공
   */
  processApiResponse: (apiData) => {
    return {
      ...apiData,
      formattedCreatedAt: apiData.createdAt?.replace('T', ' ').substring(0, 19),
      formattedUpdatedAt: apiData.updatedAt?.replace('T', ' ').substring(0, 19),
    };
  },

  /**
   * 날짜 포맷팅 (ISO → YYYY-MM-DD HH:MM:SS)
   */
  formatDateTime: (isoString) => {
    if (!isoString) return '';
    return isoString.replace('T', ' ').substring(0, 19);
  }
};

// 추가 편의 함수들 export
export const getChatRooms = chatRoomApi.getAll;
export const getChatRoom = chatRoomApi.getById;
export const createChatRoom = chatRoomApi.create;
export const getMyChatRooms = chatRoomApi.getMy;
export const getChatMessages = chatRoomApi.getMessages;
export const joinChatRoom = chatRoomApi.joinRoom;
export const leaveChatRoom = chatRoomApi.leaveRoom;

export { chatRoomApi, chatRoomDataUtils };
export default chatRoomApi;