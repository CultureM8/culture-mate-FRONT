const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT_COMMENT || "/board";

const API_URL = `${BASE_URL}${API_BASE}${ENDPOINT}`;

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

// 에러 처리 헬퍼 함수
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorData}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return { success: true };
  }
  
  return await response.json();
};

/**
 * POST /api/v1/board/{boardId}/comments
 * 게시글에 댓글 작성
 * @param {number} boardId - 게시글 ID
 * @param {Object} commentData - 댓글 작성 데이터
 * @param {string} commentData.content - 댓글 내용
 * @param {number} commentData.authorId - 작성자 ID
 * @param {number} commentData.parentCommentId - 대댓글인 경우 부모 댓글 ID (선택사항)
 * @returns {Promise<Object>} 생성된 댓글 정보
 */
export const createBoardComment = async (boardId, commentData) => {
  try {
    const response = await fetch(`${API_URL}/${boardId}/comments`, {
      method: 'POST',
      credentials: 'include',
      headers: getHeaders(),
      body: JSON.stringify(commentData),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('commentApi.createBoardComment 에러:', error);
    throw error;
  }
};

/**
 * PUT /api/v1/board/{boardId}/comments/{commentId}
 * 댓글 수정
 * @param {number} boardId - 게시글 ID
 * @param {number} commentId - 댓글 ID
 * @param {Object} commentData - 수정할 댓글 데이터
 * @param {number} requesterId - 요청자 ID
 * @returns {Promise<Object>} 수정된 댓글 정보
 */
export const updateComment = async (boardId, commentId, commentData, requesterId) => {
  try {
    const response = await fetch(`${API_URL}/${boardId}/comments/${commentId}?requesterId=${requesterId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: getHeaders(),
      body: JSON.stringify(commentData),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('commentApi.updateComment 에러:', error);
    throw error;
  }
};

/**
 * GET /api/v1/board/{boardId}/comments
 * 게시글의 부모 댓글 목록 조회 (replyCount 포함)
 * @param {number} boardId - 게시글 ID
 * @returns {Promise<Array>} 댓글 목록
 */
export const getBoardComments = async (boardId) => {
  try {
    const response = await fetch(`${API_URL}/${boardId}/comments`, {
      method: 'GET',
      credentials: 'include',
      headers: getHeaders(),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('commentApi.getBoardComments 에러:', error);
    throw error;
  }
};

/**
 * GET /api/v1/board/{boardId}/comments/{parentId}/replies
 * 특정 댓글의 대댓글 조회
 * @param {number} boardId - 게시글 ID
 * @param {number} parentId - 부모 댓글 ID
 * @returns {Promise<Array>} 대댓글 목록
 */
export const getReplyComments = async (boardId, parentId) => {
  try {
    const response = await fetch(`${API_URL}/${boardId}/comments/${parentId}/replies`, {
      method: 'GET',
      credentials: 'include',
      headers: getHeaders(),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('commentApi.getReplyComments 에러:', error);
    throw error;
  }
};

/**
 * DELETE /api/v1/board/{boardId}/comments/{commentId}
 * 댓글 삭제
 * @param {number} boardId - 게시글 ID
 * @param {number} commentId - 삭제할 댓글 ID
 * @param {number} requesterId - 요청자 ID
 * @returns {Promise<void>} 삭제 성공
 */
export const deleteComment = async (boardId, commentId, requesterId) => {
  try {
    const response = await fetch(`${API_URL}/${boardId}/comments/${commentId}?requesterId=${requesterId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getHeaders(),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('commentApi.deleteComment 에러:', error);
    throw error;
  }
};

/**
 * POST /api/v1/board/{boardId}/comments/{commentId}/like
 * 댓글 좋아요 토글 (추가/취소)
 * @param {number} boardId - 게시글 ID
 * @param {number} commentId - 댓글 ID
 * @param {number} memberId - 회원 ID
 * @returns {Promise<string>} 좋아요 처리 결과 메시지
 */
export const toggleCommentLike = async (boardId, commentId, memberId) => {
  try {
    const response = await fetch(`${API_URL}/${boardId}/comments/${commentId}/like?memberId=${memberId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text(); // 백엔드에서 String 반환 ("댓글 좋아요 성공" 또는 "댓글 좋아요 취소")
  } catch (error) {
    console.error('댓글 좋아요 처리 실패:', error);
    throw error;
  }
};

// 댓글 데이터 검증 함수
export const validateCommentData = (commentData) => {
  const errors = [];

  if (!commentData.content || commentData.content.trim().length === 0) {
    errors.push('댓글 내용을 입력해주세요.');
  }
  if (commentData.content && commentData.content.length > 500) {
    errors.push('댓글은 500자 이내로 입력해주세요.');
  }

  if (!commentData.authorId) {
    errors.push('작성자 정보가 필요합니다.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// 댓글 요청 데이터 포맷팅 함수
export const formatCommentRequestData = (formData) => {
  return {
    content: formData.content?.trim() || '',
    authorId: formData.authorId || null,
    parentCommentId: formData.parentCommentId || null,
  };
};