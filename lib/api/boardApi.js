const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT_BOARD || "/board";

const API_URL = `${BASE_URL}${API_BASE}${ENDPOINT}`;

// 공통 헤더 생성 함수 (JWT 토큰 자동 추가)
const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
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

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return { success: true };
  }

  return await response.json();
};

/**
 * GET /api/v1/board
 * 전체 게시글 목록 조회
 * @param {Object} searchParams - 검색 조건 (선택사항)
 * @returns {Promise<Array>} 게시글 목록
 */
export const getBoardList = async (searchParams = {}) => {
  try {
    const params = new URLSearchParams();

    // 검색 조건이 있을 때만 파라미터 추가
    if (searchParams.keyword) {
      params.append("keyword", searchParams.keyword);
    }
    if (searchParams.authorId) {
      params.append("authorId", searchParams.authorId);
    }
    if (searchParams.eventId) {
      params.append("eventId", searchParams.eventId);
    }
    if (searchParams.eventType) {
      params.append("eventType", searchParams.eventType);
    }
    if (searchParams.empty !== undefined) {
      params.append("empty", searchParams.empty);
    }

    const url = `${API_URL}${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: getHeaders(),
    });

    return handleResponse(response);
  } catch (error) {
    console.error("boardApi.getBoardList 에러:", error);
    throw error;
  }
};

/**
 * GET /api/v1/board/search
 * 게시글 통합 검색
 * @param {Object} searchParams - 검색 조건
 * @param {string} searchParams.keyword - 검색 키워드
 * @param {number} searchParams.authorId - 작성자 ID
 * @param {number} searchParams.eventId - 이벤트 ID
 * @param {string} searchParams.eventType - 이벤트 타입
 * @param {boolean} searchParams.empty - 빈 검색 여부
 * @returns {Promise<Array>} 검색된 게시글 목록
 */
export const searchBoards = async (searchParams) => {
  try {
    const params = new URLSearchParams();

    if (searchParams.keyword) {
      params.append("keyword", searchParams.keyword);
    }
    if (searchParams.authorId) {
      params.append("authorId", searchParams.authorId);
    }
    if (searchParams.eventId) {
      params.append("eventId", searchParams.eventId);
    }
    if (searchParams.eventType) {
      params.append("eventType", searchParams.eventType);
    }
    if (searchParams.empty !== undefined) {
      params.append("empty", searchParams.empty);
    }

    const response = await fetch(`${API_URL}/search?${params.toString()}`, {
      method: "GET",
      credentials: "include",
      headers: getHeaders(),
    });

    return handleResponse(response);
  } catch (error) {
    console.error("boardApi.searchBoards 에러:", error);
    throw error;
  }
};

/**
 * GET /api/v1/board/author/{memberId}
 * 작성자 기준 게시글 목록 조회
 * @param {number} memberId - 작성자 회원 ID
 * @returns {Promise<Array>} 해당 작성자의 게시글 목록
 */
export const getBoardsByAuthor = async (memberId) => {
  try {
    const response = await fetch(`${API_URL}/author/${memberId}`, {
      method: "GET",
      credentials: "include",
      headers: getHeaders(),
    });

    return handleResponse(response);
  } catch (error) {
    console.error("boardApi.getBoardsByAuthor 에러:", error);
    throw error;
  }
};

/**
 * GET /api/v1/board/{boardId}
 * 특정 게시글 상세 조회
 * @param {number} boardId - 게시글 ID
 * @returns {Promise<Object>} 게시글 상세 정보
 */
export const getBoardDetail = async (boardId) => {
  try {
    const response = await fetch(`${API_URL}/${boardId}`, {
      method: "GET",
      credentials: "include",
      headers: getHeaders(),
    });

    return handleResponse(response);
  } catch (error) {
    console.error("boardApi.getBoardDetail 에러:", error);
    throw error;
  }
};

/**
 * POST /api/v1/board
 * 게시글 생성
 * @param {Object} boardData - 게시글 생성 데이터
 * @param {string} boardData.title - 게시글 제목
 * @param {string} boardData.content - 게시글 내용
 * @param {number} boardData.authorId - 작성자 ID
 * @param {number} boardData.eventId - 이벤트 ID (선택사항)
 * @param {string} boardData.eventType - 이벤트 타입 (선택사항)
 * @returns {Promise<Object>} 생성된 게시글 정보
 */
export const createBoard = async (boardData) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      credentials: "include",
      headers: getHeaders(),
      body: JSON.stringify(boardData),
    });

    return handleResponse(response);
  } catch (error) {
    console.error("boardApi.createBoard 에러:", error);
    throw error;
  }
};

/**
 * PUT /api/v1/board/{boardId}
 * 게시글 수정 (인증 필요)
 * @param {number} boardId - 게시글 ID
 * @param {Object} boardData - 수정할 게시글 데이터
 * @returns {Promise<Object>} 수정된 게시글 정보
 */
export const updateBoard = async (boardId, boardData) => {
  try {
    const response = await fetch(`${API_URL}/${boardId}`, {
      method: "PUT",
      credentials: "include",
      headers: getHeaders(),
      body: JSON.stringify(boardData),
    });

    return handleResponse(response);
  } catch (error) {
    console.error("boardApi.updateBoard 에러:", error);
    throw error;
  }
};

/**
 * DELETE /api/v1/board/{boardId}
 * 게시글 삭제 (인증 필요)
 * @param {number} boardId - 삭제할 게시글 ID
 * @returns {Promise<void>} 삭제 성공
 */
export const deleteBoard = async (boardId) => {
  try {
    const response = await fetch(`${API_URL}/${boardId}`, {
      method: "DELETE",
      credentials: "include",
      headers: getHeaders(),
    });

    return handleResponse(response);
  } catch (error) {
    console.error("boardApi.deleteBoard 에러:", error);
    throw error;
  }
};

/**
 * POST /api/v1/board/{boardId}/like
 * 게시글 좋아요 토글 (추가/취소)
 * @param {number} boardId - 게시글 ID
 * @param {number} memberId - 회원 ID (백엔드에서 @RequestParam으로 받음)
 * @returns {Promise<string>} 좋아요 처리 결과 메시지
 */
export const toggleBoardLike = async (boardId, memberId) => {
  try {
    const response = await fetch(
      `${API_URL}/${boardId}/like?memberId=${memberId}`,
      {
        method: "POST",
        credentials: "include",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text(); // 백엔드에서 String 반환 ("좋아요 성공" 또는 "좋아요 취소")
  } catch (error) {
    console.error("게시글 좋아요 처리 실패:", error);
    throw error;
  }
};

// 게시글 데이터 검증 함수
export const validateBoardData = (boardData) => {
  const errors = [];

  if (!boardData.title || boardData.title.trim().length === 0) {
    errors.push("제목을 입력해주세요.");
  }
  if (boardData.title && boardData.title.length > 100) {
    errors.push("제목은 100자 이내로 입력해주세요.");
  }

  if (!boardData.content || boardData.content.trim().length === 0) {
    errors.push("내용을 입력해주세요.");
  }

  if (!boardData.authorId) {
    errors.push("작성자 정보가 필요합니다.");
  }

  if (!boardData.eventType) {
    errors.push("이벤트 타입을 선택해주세요.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 게시글 요청 데이터 포맷팅 함수
export const formatBoardRequestData = (formData) => {
  return {
    title: formData.title?.trim() || "",
    content: formData.content?.trim() || "",
    authorId: formData.authorId || null,
    eventId: formData.eventId || null,
    eventType: formData.eventType || null,
  };
};

// 이벤트 타입 옵션들
export const EVENT_TYPE_OPTIONS = [
  { value: "MUSICAL", label: "뮤지컬" },
  { value: "MOVIE", label: "영화" },
  { value: "THEATER", label: "연극" },
  { value: "EXHIBITION", label: "전시" },
  { value: "Classical", label: "클래식" },
  { value: "DANCE", label: "무용" },
  { value: "CONCERT", label: "콘서트" },
  { value: "FESTIVAL", label: "축제" },
  { value: "LOCAL_EVENT", label: "지역행사" },
  { value: "OTHER", label: "기타" },
];

// 게시글 정렬 옵션들
export const BOARD_SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
  { value: "popular", label: "인기순" },
  { value: "comments", label: "댓글많은순" },
];

// 게시글 필터 옵션들
export const BOARD_FILTER_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'withEvent', label: '이벤트 포함' },
  { value: 'withoutEvent', label: '자유게시글' },
];

// 백엔드 BoardDto.Response를 프론트엔드 형태로 변환
export const transformBoardData = (post) => {
  if (!post) return null;
  
  return {
    id: post.id,
    title: post.title || "제목",
    content: post.content,
    author: post.author?.nickname || "익명",
    authorId: post.author?.id,
    eventCard: post.eventCard,
    likeCount: post.likeCount || 0,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    views: 0, // 백엔드에 아직 구현되지 않음
    recommendations: post.likeCount || 0, // likeCount를 recommendations로 매핑
    comments: 0, // 백엔드에 아직 구현되지 않음
  };
};

// 게시글 목록을 프론트엔드 형태로 변환
export const transformBoardList = (posts) => {
  if (!Array.isArray(posts)) return [];
  return posts.map(transformBoardData).filter(Boolean);
};
