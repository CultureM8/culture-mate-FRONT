const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT_BOARD || "/board";

const API_URL = `${BASE_URL}${API_BASE}${ENDPOINT}`;

// 게시글 목록 조회 (검색 포함)
export const getBoardList = async (searchParams = {}) => {
  try {
    const params = new URLSearchParams();
    
    // 검색 조건이 있을 때만 파라미터 추가
    if (searchParams.keyword) {
      params.append('keyword', searchParams.keyword);
    }
    if (searchParams.authorId) {
      params.append('authorId', searchParams.authorId);
    }
    if (searchParams.eventId) {
      params.append('eventId', searchParams.eventId);
    }
    if (searchParams.eventType) {
      params.append('eventType', searchParams.eventType);
    }
    if (searchParams.empty !== undefined) {
      params.append('empty', searchParams.empty);
    }

    const url = `${API_URL}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include', // 추가
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('게시글 목록 조회 실패:', error);
    throw error;
  }
};

// 게시글 검색
export const searchBoards = async (searchParams) => {
  try {
    const params = new URLSearchParams();
    
    if (searchParams.keyword) {
      params.append('keyword', searchParams.keyword);
    }
    if (searchParams.authorId) {
      params.append('authorId', searchParams.authorId);
    }
    if (searchParams.eventId) {
      params.append('eventId', searchParams.eventId);
    }
    if (searchParams.eventType) {
      params.append('eventType', searchParams.eventType);
    }
    if (searchParams.empty !== undefined) {
      params.append('empty', searchParams.empty);
    }

    const response = await fetch(`${API_URL}/search?${params.toString()}`, {
      method: 'GET',
      credentials: 'include', // 추가
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('게시글 검색 실패:', error);
    throw error;
  }
};

// 특정 작성자의 게시글 목록 조회
export const getBoardsByAuthor = async (memberId) => {
  try {
    const response = await fetch(`${API_URL}/author/${memberId}`, {
      method: 'GET',
      credentials: 'include', // 추가
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('작성자별 게시글 조회 실패:', error);
    throw error;
  }
};

// 게시글 상세 조회
export const getBoardDetail = async (boardId) => {
  try {
    const response = await fetch(`${API_URL}/${boardId}`, {
      method: 'GET',
      credentials: 'include', // 추가
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('게시글 상세 조회 실패:', error);
    throw error;
  }
};

// 게시글 작성
export const createBoard = async (boardData) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      credentials: 'include', // 추가
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(boardData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('게시글 작성 실패:', error);
    throw error;
  }
};

// 게시글 수정
export const updateBoard = async (boardId, boardData) => {
  try {
    const response = await fetch(`${API_URL}/${boardId}`, {
      method: 'PUT',
      credentials: 'include', // 추가
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(boardData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('게시글 수정 실패:', error);
    throw error;
  }
};

// 게시글 삭제
export const deleteBoard = async (boardId) => {
  try {
    const response = await fetch(`${API_URL}/${boardId}`, {
      method: 'DELETE',
      credentials: 'include', // 추가
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('게시글 삭제 실패:', error);
    throw error;
  }
};

// 게시글 좋아요/좋아요 취소
export const toggleBoardLike = async (boardId) => {
  try {
    const response = await fetch(`${API_URL}/${boardId}/like`, {
      method: 'POST',
      credentials: 'include', // 추가
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('게시글 좋아요 처리 실패:', error);
    throw error;
  }
};

// 게시글 데이터 검증 함수
export const validateBoardData = (boardData) => {
  const errors = [];

  if (!boardData.title || boardData.title.trim().length === 0) {
    errors.push('제목을 입력해주세요.');
  }
  if (boardData.title && boardData.title.length > 100) {
    errors.push('제목은 100자 이내로 입력해주세요.');
  }

  if (!boardData.content || boardData.content.trim().length === 0) {
    errors.push('내용을 입력해주세요.');
  }

  if (!boardData.authorId) {
    errors.push('작성자 정보가 필요합니다.');
  }

  if (!boardData.eventType) {
    errors.push('이벤트 타입을 선택해주세요.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// 게시글 요청 데이터 포맷팅 함수
export const formatBoardRequestData = (formData) => {
  return {
    title: formData.title?.trim() || '',
    content: formData.content?.trim() || '',
    authorId: formData.authorId || null,
    eventId: formData.eventId || null,
    eventType: formData.eventType || null,
  };
};

// 이벤트 타입 옵션들
export const EVENT_TYPE_OPTIONS = [
  { value: 'MUSICAL', label: '뮤지컬' },
  { value: 'MOVIE', label: '영화' },
  { value: 'THEATER', label: '연극' },
  { value: 'EXHIBITION', label: '전시' },
  { value: 'Classical', label: '클래식' },
  { value: 'DANCE', label: '무용' },
  { value: 'CONCERT', label: '콘서트' },
  { value: 'FESTIVAL', label: '축제' },
  { value: 'LOCAL_EVENT', label: '지역행사' },
  { value: 'OTHER', label: '기타' },
];

// 게시글 정렬 옵션들
export const BOARD_SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
  { value: 'popular', label: '인기순' },
  { value: 'comments', label: '댓글많은순' },
];

// 게시글 필터 옵션들
export const BOARD_FILTER_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'withEvent', label: '이벤트 포함' },
  { value: 'withoutEvent', label: '자유게시글' },
];