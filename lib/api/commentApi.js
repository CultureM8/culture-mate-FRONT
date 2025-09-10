// commentApi.js - 댓글 관련 API 함수들

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";

const API_URL = `${BASE_URL}${API_BASE}`;

// 게시글에 댓글 작성
export const createBoardComment = async (boardId, commentData) => {
  try {
    const response = await fetch(`${API_URL}/board/${boardId}/comments`, {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("게시글 댓글 작성 실패:", error);
    throw error;
  }
};

// 댓글 수정
export const updateComment = async (boardId, commentId, commentData) => {
  try {
    const response = await fetch(`${API_URL}/board/${boardId}/comments/${commentId}`, {
      method: "PUT",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("댓글 수정 실패:", error);
    throw error;
  }
};

// 게시글의 부모 댓글 목록 조회 (replyCount 포함)
export const getBoardComments = async (boardId) => {
  try {
    const response = await fetch(`${API_URL}/board/${boardId}/comments`, {
      method: "GET",
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("게시글 댓글 목록 조회 실패:", error);
    throw error;
  }
};

// 특정 댓글의 대댓글 조회
export const getReplyComments = async (boardId, parentId) => {
  try {
    const response = await fetch(`${API_URL}/board/${boardId}/comments/${parentId}/replies`, {
      method: "GET",
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("대댓글 목록 조회 실패:", error);
    throw error;
  }
};

// 댓글 삭제
export const deleteComment = async (boardId, commentId, requesterId) => {
  try {
    const response = await fetch(`${API_URL}/board/${boardId}/comments/${commentId}?requesterId=${requesterId}`, {
      method: "DELETE",
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("댓글 삭제 실패:", error);
    throw error;
  }
};

// 댓글 좋아요/좋아요 취소
export const toggleCommentLike = async (boardId, commentId, memberId) => {
  try {
    const response = await fetch(`${API_URL}/board/${boardId}/comments/${commentId}/like?memberId=${memberId}`, {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text(); // "댓글 좋아요 성공" 또는 "댓글 좋아요 취소" 메시지 반환
  } catch (error) {
    console.error("댓글 좋아요 실패:", error);
    throw error;
  }
};