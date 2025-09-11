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

// 입력 데이터 유효성 검사 (스키마 기반)
const validateChatRoomRequest = (data) => {
  const errors = [];
  
  if (!data.roomName || data.roomName.trim().length === 0 || data.roomName.length > 100) {
    errors.push('채팅방 이름은 1-100자 이내여야 합니다');
  }
  
  if (!data.togetherId || !Number.isInteger(data.togetherId)) {
    errors.push('동행 ID는 정수여야 합니다');
  }
  
  if (data.maxParticipants && (data.maxParticipants < 2 || data.maxParticipants > 100)) {
    errors.push('최대 참여인원은 2-100명 사이여야 합니다');
  }
  
  if (errors.length > 0) {
    throw new Error(`유효성 검사 실패: ${errors.join(', ')}`);
  }
};

// ChatRoom API 서비스 객체
const chatRoomApi = {
  /**
   * GET /api/v1/chatroom
   * 전체 채팅방 목록 조회
   * @returns {Promise<Array>} 채팅방 목록
   */
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}`, {
        method: 'GET',
        credentials: 'include',
        headers: defaultHeaders,
      });
      return handleResponse(response);
    } catch (error) {
      console.error('chatRoomApi.getAll 에러:', error);
      throw error;
    }
  },

  /**
   * GET /api/v1/chatroom/{id}
   * 특정 채팅방 조회
   * @param {number} id - 채팅방 ID
   * @returns {Promise<Object>} 채팅방 상세 정보
   */
  getById: async (id) => {
    try {
      if (!id || !Number.isInteger(Number(id))) {
        throw new Error('올바른 채팅방 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: defaultHeaders,
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`chatRoomApi.getById(${id}) 에러:`, error);
      throw error;
    }
  },

  /**
   * POST /api/v1/chatroom
   * 새 채팅방 생성
   * @param {Object} newChatRoom - ChatRoomRequestDto 스키마 기반 데이터
   * @param {string} newChatRoom.roomName - 채팅방 이름 (1-100자, 필수)
   * @param {number} newChatRoom.togetherId - 동행 ID (필수)
   * @param {number} newChatRoom.maxParticipants - 최대 참여인원 (2-100, 선택)
   * @param {number} newChatRoom.participantCount - 현재 참여인원 (선택)
   * @param {string} newChatRoom.content - 채팅방 설명 (선택)
   * @param {number} newChatRoom.interestCount - 관심수 (선택)
   * @param {string} newChatRoom.thumbnailImagePath - 썸네일 이미지 경로 (선택)
   * @param {string} newChatRoom.mainImagePath - 메인 이미지 경로 (선택)
   * @param {boolean} newChatRoom.recruiting - 모집 여부 (선택)
   * @returns {Promise<Object>} 생성된 채팅방 정보
   */
  create: async (newChatRoom) => {
    try {
      // 스키마 기반 유효성 검사
      validateChatRoomRequest(newChatRoom);
      
      const response = await fetch(`${API_URL}`, {
        method: 'POST',
        credentials: 'include',
        headers: defaultHeaders,
        body: JSON.stringify(newChatRoom),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('chatRoomApi.create 에러:', error);
      throw error;
    }
  },

  /**
   * PUT /api/v1/chatroom/{id}
   * 채팅방 정보 수정
   * @param {number} id - 채팅방 ID
   * @param {Object} updatedChatRoom - 수정할 데이터 (ChatRoomRequestDto 스키마 기반)
   * @returns {Promise<Object>} 수정된 채팅방 정보
   */
  update: async (id, updatedChatRoom) => {
    try {
      if (!id || !Number.isInteger(Number(id))) {
        throw new Error('올바른 채팅방 ID를 입력해주세요');
      }
      
      // 스키마 기반 유효성 검사
      validateChatRoomRequest(updatedChatRoom);
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: defaultHeaders,
        body: JSON.stringify(updatedChatRoom),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`chatRoomApi.update(${id}) 에러:`, error);
      throw error;
    }
  },

  /**
   * DELETE /api/v1/chatroom/{id}
   * 채팅방 삭제
   * @param {number} id - 채팅방 ID
   * @returns {Promise<void>} 삭제 성공 (응답 없음)
   */
  delete: async (id) => {
    try {
      if (!id || !Number.isInteger(Number(id))) {
        throw new Error('올바른 채팅방 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: defaultHeaders,
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`chatRoomApi.delete(${id}) 에러:`, error);
      throw error;
    }
  },

  /**
   * GET /api/v1/chatroom/together/{togetherId}
   * 특정 동행의 채팅방 조회
   * @param {number} togetherId - 동행 ID
   * @returns {Promise<Object>} 동행의 채팅방 정보
   */
  getByTogether: async (togetherId) => {
    try {
      if (!togetherId || !Number.isInteger(Number(togetherId))) {
        throw new Error('올바른 동행 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/together/${togetherId}`, {
        method: 'GET',
        credentials: 'include',
        headers: defaultHeaders,
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`chatRoomApi.getByTogether(${togetherId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * GET /api/v1/chatroom/member/{memberId}
   * 특정 회원이 참여한 채팅방 목록 조회
   * @param {number} memberId - 회원 ID
   * @returns {Promise<Array>} 회원이 참여한 채팅방 목록
   */
  getByMember: async (memberId) => {
    try {
      if (!memberId || !Number.isInteger(Number(memberId))) {
        throw new Error('올바른 회원 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/member/${memberId}`, {
        method: 'GET',
        credentials: 'include',
        headers: defaultHeaders,
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`chatRoomApi.getByMember(${memberId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * POST /api/v1/chatroom/{id}/join
   * 채팅방 참여
   * @param {number} id - 채팅방 ID
   * @param {number} memberId - 참여할 회원 ID
   * @returns {Promise<Object>} 참여 결과
   */
  joinRoom: async (id, memberId) => {
    try {
      if (!id || !Number.isInteger(Number(id))) {
        throw new Error('올바른 채팅방 ID를 입력해주세요');
      }
      
      if (!memberId || !Number.isInteger(Number(memberId))) {
        throw new Error('올바른 회원 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/${id}/join`, {
        method: 'POST',
        credentials: 'include',
        headers: defaultHeaders,
        body: JSON.stringify({ memberId }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`chatRoomApi.joinRoom(${id}, ${memberId}) 에러:`, error);
      throw error;
    }
  },

  /**
   * POST /api/v1/chatroom/{id}/leave
   * 채팅방 나가기
   * @param {number} id - 채팅방 ID
   * @param {number} memberId - 나갈 회원 ID
   * @returns {Promise<Object>} 나가기 결과
   */
  leaveRoom: async (id, memberId) => {
    try {
      if (!id || !Number.isInteger(Number(id))) {
        throw new Error('올바른 채팅방 ID를 입력해주세요');
      }
      
      if (!memberId || !Number.isInteger(Number(memberId))) {
        throw new Error('올바른 회원 ID를 입력해주세요');
      }
      
      const response = await fetch(`${API_URL}/${id}/leave`, {
        method: 'POST',
        credentials: 'include',
        headers: defaultHeaders,
        body: JSON.stringify({ memberId }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`chatRoomApi.leaveRoom(${id}, ${memberId}) 에러:`, error);
      throw error;
    }
  }
};

// 데이터 변환 유틸리티 함수들
const chatRoomDataUtils = {
  /**
   * 프론트엔드 폼 데이터를 ChatRoomRequestDto 형식으로 변환
   */
  convertToApiFormat: (formData) => {
    return {
      roomName: formData.roomName?.trim() || '',
      togetherId: parseInt(formData.togetherId) || 0,
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
      participantCount: formData.participantCount ? parseInt(formData.participantCount) : 0,
      content: formData.content?.trim() || '',
      interestCount: formData.interestCount ? parseInt(formData.interestCount) : 0,
      thumbnailImagePath: formData.thumbnailImagePath?.trim() || '',
      mainImagePath: formData.mainImagePath?.trim() || '',
      recruiting: formData.recruiting !== undefined ? Boolean(formData.recruiting) : true
    };
  },

  /**
   * 백엔드 응답을 프론트엔드에서 사용하기 쉽게 가공
   */
  processApiResponse: (apiData) => {
    return {
      ...apiData,
      // 필요한 계산된 필드들 추가
      participantsText: apiData.maxParticipants 
        ? `${apiData.participantCount || 0}/${apiData.maxParticipants}`
        : `${apiData.participantCount || 0}명`,
      formattedCreatedAt: apiData.createdAt?.replace('T', ' ').substring(0, 19),
      formattedUpdatedAt: apiData.updatedAt?.replace('T', ' ').substring(0, 19),
      isRecruitingActive: apiData.recruiting && 
                        (!apiData.maxParticipants || apiData.participantCount < apiData.maxParticipants),
      hasMainImage: Boolean(apiData.mainImagePath),
      hasThumbnailImage: Boolean(apiData.thumbnailImagePath)
    };
  },

  /**
   * 날짜 포맷팅 (ISO → YYYY-MM-DD HH:MM:SS)
   */
  formatDateTime: (isoString) => {
    if (!isoString) return '';
    return isoString.replace('T', ' ').substring(0, 19);
  },

  /**
   * 모집 상태 확인
   */
  getRecruitmentStatus: (chatRoomData) => {
    if (!chatRoomData.recruiting) {
      return 'closed'; // 모집마감
    } else if (chatRoomData.maxParticipants && 
               chatRoomData.participantCount >= chatRoomData.maxParticipants) {
      return 'full'; // 모집완료
    } else {
      return 'recruiting'; // 모집중
    }
  },

  /**
   * 모집 상태 한글 텍스트
   */
  getRecruitmentStatusText: (chatRoomData) => {
    const status = chatRoomDataUtils.getRecruitmentStatus(chatRoomData);
    const statusMap = {
      'recruiting': '모집중',
      'full': '모집완료',
      'closed': '모집마감'
    };
    return statusMap[status] || '알 수 없음';
  },

  /**
   * 채팅방 이름 유효성 검사
   */
  isValidRoomName: (roomName) => {
    if (!roomName) return false;
    const trimmed = roomName.trim();
    return trimmed.length >= 1 && trimmed.length <= 100;
  },

  /**
   * 이미지 URL 생성
   */
  getImageUrl: (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL}${imagePath}`;
  },

  /**
   * 썸네일 이미지 URL 생성
   */
  getThumbnailUrl: (chatRoomData) => {
    return chatRoomDataUtils.getImageUrl(chatRoomData.thumbnailImagePath);
  },

  /**
   * 메인 이미지 URL 생성
   */
  getMainImageUrl: (chatRoomData) => {
    return chatRoomDataUtils.getImageUrl(chatRoomData.mainImagePath);
  }
};

// 추가 편의 함수들 export
export const getChatRooms = chatRoomApi.getAll;
export const getChatRoom = chatRoomApi.getById;
export const createChatRoom = chatRoomApi.create;
export const updateChatRoom = chatRoomApi.update;
export const deleteChatRoom = chatRoomApi.delete;
export const getChatRoomsByMember = chatRoomApi.getByMember;
export const getChatRoomByTogether = chatRoomApi.getByTogether;
export const joinChatRoom = chatRoomApi.joinRoom;
export const leaveChatRoom = chatRoomApi.leaveRoom;

export { chatRoomApi, chatRoomDataUtils };
export default chatRoomApi;