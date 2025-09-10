const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT_CHAT || "/chat";

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

// 채팅방 요청 데이터 유효성 검사
const validateChatRoomRequest = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim().length === 0 || data.name.length > 50) {
    errors.push('채팅방 이름은 1-50자 이내여야 합니다');
  }
  
  if (data.togetherId && !Number.isInteger(data.togetherId)) {
    errors.push('동행 ID는 정수여야 합니다');
  }
  
  if (errors.length > 0) {
    throw new Error(`유효성 검사 실패: ${errors.join(', ')}`);
  }
};

// 메시지 요청 데이터 유효성 검사
const validateMessageRequest = (data) => {
  const errors = [];
  
  if (!data.content || data.content.trim().length === 0 || data.content.length > 1000) {
    errors.push('메시지 내용은 1-1000자 이내여야 합니다');
  }
  
  if (!data.senderId || !Number.isInteger(data.senderId)) {
    errors.push('발신자 ID는 필수이며 정수여야 합니다');
  }
  
  if (errors.length > 0) {
    throw new Error(`유효성 검사 실패: ${errors.join(', ')}`);
  }
};

// Chat API 서비스 객체
const chatApi = {
  /**
   * POST /api/v1/chat/room
   * 새 채팅방 생성
   * @param {Object} roomData - 채팅방 생성 데이터
   * @param {string} roomData.name - 채팅방 이름 (1-50자, 필수)
   * @param {number} roomData.togetherId - 연결된 동행 ID (선택)
   * @returns {Promise<Object>} 생성된 채팅방 정보
   */
  createRoom: async (roomData) => {
    try {
      // 유효성 검사
      validateChatRoomRequest(roomData);
      
      const response = await fetch(`${API_URL}/room`, {
        method: 'POST',
        credentials: 'include',
        headers: defaultHeaders,
        body: JSON.stringify(roomData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('chatApi.createRoom 에러:', error);
      throw error;
    }
  },

  /**
   * GET /api/v1/chat/room/{roomId}
   * 특정 채팅방 정보 조회
   * @param {number} roomId - 채팅방 ID
   * @returns {Promise<Object>} 채팅방 상세 정보
   */
  getRoomById: async (roomId) => {
    try {
      if (!roomId || !Number.isInteger(Number(roomId))) {
        throw new Error('올바른 채팅방 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/room/${roomId}`, {
        method: 'GET',
        credentials: 'include',
        headers: defaultHeaders,
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`chatApi.getRoomById(${roomId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * GET /api/v1/chat/rooms/list
   * 전체 채팅방 목록 조회
   * @returns {Promise<Array>} 채팅방 목록
   */
  getAllRooms: async () => {
    try {
      const response = await fetch(`${API_URL}/rooms/list`, {
        method: 'GET',
        credentials: 'include',
        headers: defaultHeaders,
      });
      return handleResponse(response);
    } catch (error) {
      console.error('chatApi.getAllRooms 에러:', error);
      throw error;
    }
  },

  /**
   * GET /api/v1/chat/room/{roomId}/messages
   * 특정 채팅방의 메시지 목록 조회
   * @param {number} roomId - 채팅방 ID
   * @param {Object} params - 조회 조건
   * @param {number} params.page - 페이지 번호 (선택)
   * @param {number} params.size - 페이지 크기 (선택)
   * @returns {Promise<Object>} 메시지 목록 (페이징 정보 포함)
   */
  getMessages: async (roomId, params = {}) => {
    try {
      if (!roomId || !Number.isInteger(Number(roomId))) {
        throw new Error('올바른 채팅방 ID를 입력해주세요');
      }
      
      // 빈 값 제거
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => 
          value !== undefined && value !== null && value !== ''
        )
      );
      
      const queryString = new URLSearchParams(cleanParams).toString();
      const url = queryString ? 
        `${API_URL}/room/${roomId}/messages?${queryString}` : 
        `${API_URL}/room/${roomId}/messages`;
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: defaultHeaders,
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`chatApi.getMessages(${roomId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * POST /api/v1/chat/room/{roomId}/message
   * 채팅방에 메시지 전송
   * @param {number} roomId - 채팅방 ID
   * @param {Object} messageData - 메시지 데이터
   * @param {string} messageData.content - 메시지 내용 (1-1000자, 필수)
   * @param {number} messageData.senderId - 발신자 ID (필수)
   * @returns {Promise<Object>} 전송된 메시지 정보
   */
  sendMessage: async (roomId, messageData) => {
    try {
      if (!roomId || !Number.isInteger(Number(roomId))) {
        throw new Error('올바른 채팅방 ID를 입력해주세요');
      }
      
      // 유효성 검사
      validateMessageRequest(messageData);
      
      const response = await fetch(`${API_URL}/room/${roomId}/message`, {
        method: 'POST',
        credentials: 'include',
        headers: defaultHeaders,
        body: JSON.stringify(messageData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`chatApi.sendMessage(${roomId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * PUT /api/v1/chat/room/{roomId}
   * 채팅방 정보 수정
   * @param {number} roomId - 채팅방 ID
   * @param {Object} updateData - 수정할 데이터
   * @param {string} updateData.name - 수정할 채팅방 이름
   * @returns {Promise<Object>} 수정된 채팅방 정보
   */
  updateRoom: async (roomId, updateData) => {
    try {
      if (!roomId || !Number.isInteger(Number(roomId))) {
        throw new Error('올바른 채팅방 ID를 입력해주세요');
      }
      
      // 유효성 검사
      validateChatRoomRequest(updateData);
      
      const response = await fetch(`${API_URL}/room/${roomId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: defaultHeaders,
        body: JSON.stringify(updateData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`chatApi.updateRoom(${roomId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * DELETE /api/v1/chat/room/{roomId}
   * 채팅방 삭제
   * @param {number} roomId - 채팅방 ID
   * @returns {Promise<void>} 삭제 성공 (응답 없음)
   */
  deleteRoom: async (roomId) => {
    try {
      if (!roomId || !Number.isInteger(Number(roomId))) {
        throw new Error('올바른 채팅방 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/room/${roomId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: defaultHeaders,
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`chatApi.deleteRoom(${roomId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * GET /api/v1/chat/rooms/user/{userId}
   * 특정 사용자가 참여한 채팅방 목록 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Array>} 사용자가 참여한 채팅방 목록
   */
  getRoomsByUser: async (userId) => {
    try {
      if (!userId || !Number.isInteger(Number(userId))) {
        throw new Error('올바른 사용자 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/rooms/user/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: defaultHeaders,
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`chatApi.getRoomsByUser(${userId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * POST /api/v1/chat/room/{roomId}/join
   * 채팅방 입장
   * @param {number} roomId - 채팅방 ID
   * @param {number} userId - 입장할 사용자 ID
   * @returns {Promise<Object>} 입장 결과
   */
  joinRoom: async (roomId, userId) => {
    try {
      if (!roomId || !Number.isInteger(Number(roomId))) {
        throw new Error('올바른 채팅방 ID를 입력해주세요');
      }
      if (!userId || !Number.isInteger(Number(userId))) {
        throw new Error('올바른 사용자 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/room/${roomId}/join`, {
        method: 'POST',
        credentials: 'include',
        headers: defaultHeaders,
        body: JSON.stringify({ userId }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`chatApi.joinRoom(${roomId}, ${userId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * POST /api/v1/chat/room/{roomId}/leave
   * 채팅방 나가기
   * @param {number} roomId - 채팅방 ID
   * @param {number} userId - 나갈 사용자 ID
   * @returns {Promise<Object>} 나가기 결과
   */
  leaveRoom: async (roomId, userId) => {
    try {
      if (!roomId || !Number.isInteger(Number(roomId))) {
        throw new Error('올바른 채팅방 ID를 입력해주세요');
      }
      if (!userId || !Number.isInteger(Number(userId))) {
        throw new Error('올바른 사용자 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/room/${roomId}/leave`, {
        method: 'POST',
        credentials: 'include',
        headers: defaultHeaders,
        body: JSON.stringify({ userId }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`chatApi.leaveRoom(${roomId}, ${userId}) 에러:`, error);
      throw error;
    }
  }
};

// 데이터 변환 유틸리티 함수들
const chatDataUtils = {
  /**
   * 프론트엔드 폼 데이터를 채팅방 생성 API 형식으로 변환
   */
  convertToRoomApiFormat: (formData) => {
    return {
      name: formData.name?.trim() || '',
      togetherId: formData.togetherId ? parseInt(formData.togetherId) : null,
    };
  },

  /**
   * 프론트엔드 폼 데이터를 메시지 전송 API 형식으로 변환
   */
  convertToMessageApiFormat: (formData) => {
    return {
      content: formData.content?.trim() || '',
      senderId: formData.senderId || 1, // 현재 로그인된 사용자 ID
    };
  },

  /**
   * 백엔드 응답을 프론트엔드에서 사용하기 쉽게 가공
   */
  processApiResponse: (apiData) => {
    return {
      ...apiData, // 백엔드 데이터 그대로 유지
      // 필요한 계산된 필드들만 추가
      formattedCreatedAt: apiData.createdAt ? 
        new Date(apiData.createdAt).toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) : '',
      isTogetherRoom: !!apiData.togetherId,
    };
  },

  /**
   * 메시지 시간 포맷팅 (HH:MM:SS)
   */
  formatMessageTime: (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  },

  /**
   * 메시지 날짜 포맷팅 (YYYY-MM-DD)
   */
  formatMessageDate: (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '-').replace('.', '');
  },

  /**
   * 채팅방 이름 유효성 검사
   */
  isValidRoomName: (name) => {
    if (!name) return false;
    return name.trim().length >= 1 && name.trim().length <= 50;
  },

  /**
   * 메시지 내용 유효성 검사
   */
  isValidMessageContent: (content) => {
    if (!content) return false;
    return content.trim().length >= 1 && content.trim().length <= 1000;
  },

  /**
   * 온라인 상태 표시
   */
  getOnlineStatusText: (isOnline) => {
    return isOnline ? '온라인' : '오프라인';
  },

  /**
   * 읽지 않은 메시지 수 포맷팅
   */
  formatUnreadCount: (count) => {
    if (!count || count === 0) return '';
    if (count > 99) return '99+';
    return count.toString();
  },

  /**
   * 채팅방 타입 확인
   */
  getRoomType: (roomData) => {
    if (roomData.togetherId) {
      return 'together'; // 동행 채팅방
    }
    return 'general'; // 일반 채팅방
  },

  /**
   * 메시지 전송자 여부 확인
   */
  isMyMessage: (messageData, currentUserId) => {
    return messageData.senderId === currentUserId;
  }
};

// getChats 별칭 함수 (호환성을 위해)
const getChats = chatApi.getAllRooms;

// Export 수정: named export로 변경
export { 
  chatApi, 
  chatDataUtils,
  getChats,
  // 개별 함수들도 export (필요시 직접 import 가능)
  chatApi as default
};

export const getChatRooms = chatApi.getAllRooms;
export const getChatMessages = chatApi.getMessages;
export const createChatRoom = chatApi.createRoom;
export const sendChatMessage = chatApi.sendMessage;