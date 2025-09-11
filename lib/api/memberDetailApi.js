const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT_MEMBER_DETAIL || "/member-detail";

const API_URL = `${BASE_URL}${API_BASE}${ENDPOINT}`;

// 공통 헤더 생성 함수
const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// 공통 에러 처리 함수
const handleApiError = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP Error: ${response.status}`);
  }
  return response;
};

// 회원 상세 정보 조회 (GET /api/v1/member-detail/{memberId})
export const getMemberDetail = async (memberId) => {
  try {
    if (!memberId) {
      throw new Error('회원 ID가 필요합니다.');
    }

    const response = await fetch(`${API_URL}/${memberId}`, {
      method: 'GET',
      credentials: 'include', // 추가
      headers: getHeaders(),
    });

    await handleApiError(response);
    const data = await response.json();

    return formatMemberDetailResponse(data);
  } catch (error) {
    console.error('회원 상세정보 조회 실패:', error);
    throw error;
  }
};

// 회원 상세 정보 수정 (PUT /api/v1/member-detail/{memberId})
export const updateMemberDetail = async (memberId, memberData) => {
  try {
    if (!memberId) {
      throw new Error('회원 ID가 필요합니다.');
    }

    // 요청 데이터 유효성 검사
    validateMemberDetailRequest(memberData);

    const requestData = formatMemberDetailRequest(memberData);

    const response = await fetch(`${API_URL}/${memberId}`, {
      method: 'PUT',
      credentials: 'include', // 추가
      headers: getHeaders(),
      body: JSON.stringify(requestData),
    });

    await handleApiError(response);
    const data = await response.json();

    return formatMemberDetailResponse(data);
  } catch (error) {
    console.error('회원 상세정보 수정 실패:', error);
    throw error;
  }
};

// 회원 상세 정보 삭제 (DELETE /api/v1/member-detail/{memberId})
export const deleteMemberDetail = async (memberId) => {
  try {
    if (!memberId) {
      throw new Error('회원 ID가 필요합니다.');
    }

    const response = await fetch(`${API_URL}/${memberId}`, {
      method: 'DELETE',
      credentials: 'include', // 추가
      headers: getHeaders(),
    });

    await handleApiError(response);
    
    return { 
      success: true, 
      message: '회원 정보가 성공적으로 삭제되었습니다.' 
    };
  } catch (error) {
    console.error('회원 상세정보 삭제 실패:', error);
    throw error;
  }
};

/**
 * POST /api/v1/member-detail/{memberId}
 * 회원 상세 정보 생성
 * @param {number} memberId - 회원 ID
 * @param {Object} memberData - 생성할 상세 정보
 * @returns {Promise<Object>} 생성된 상세 정보
 */
export const createMemberDetail = async (memberId, memberData) => {
  try {
    if (!memberId) {
      throw new Error('회원 ID가 필요합니다.');
    }

    // 요청 데이터 유효성 검사
    validateMemberDetailRequest(memberData);

    const requestData = formatMemberDetailRequest(memberData);

    const response = await fetch(`${API_URL}/${memberId}`, {
      method: 'POST',
      credentials: 'include',
      headers: getHeaders(),
      body: JSON.stringify(requestData),
    });

    await handleApiError(response);
    const data = await response.json();

    return formatMemberDetailResponse(data);
  } catch (error) {
    console.error('회원 상세정보 생성 실패:', error);
    throw error;
  }
};

/**
 * PATCH /api/v1/member-detail/{memberId}/image
 * 회원 이미지 업로드/수정 (프로필, 배경)
 * @param {number} memberId - 회원 ID
 * @param {File} imageFile - 이미지 파일
 * @param {string} type - 이미지 타입 ('profile' 또는 'background')
 * @returns {Promise<void>} 업로드 성공
 */
export const updateMemberImage = async (memberId, imageFile, type) => {
  try {
    if (!memberId) {
      throw new Error('회원 ID가 필요합니다.');
    }
    if (!imageFile) {
      throw new Error('이미지 파일이 필요합니다.');
    }
    if (!['profile', 'background'].includes(type)) {
      throw new Error('이미지 타입은 profile 또는 background여야 합니다.');
    }

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('type', type);

    const headers = {};
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/${memberId}/image`, {
      method: 'PATCH',
      credentials: 'include',
      headers: headers, // FormData는 Content-Type 자동 설정
      body: formData,
    });

    await handleApiError(response);
    return { success: true, message: `${type} 이미지가 성공적으로 업로드되었습니다.` };
  } catch (error) {
    console.error('회원 이미지 업로드 실패:', error);
    throw error;
  }
};

/**
 * DELETE /api/v1/member-detail/{memberId}/image
 * 회원 이미지 삭제 (프로필, 배경)
 * @param {number} memberId - 회원 ID
 * @param {string} type - 이미지 타입 ('profile' 또는 'background')
 * @returns {Promise<void>} 삭제 성공
 */
export const deleteMemberImage = async (memberId, type) => {
  try {
    if (!memberId) {
      throw new Error('회원 ID가 필요합니다.');
    }
    if (!['profile', 'background'].includes(type)) {
      throw new Error('이미지 타입은 profile 또는 background여야 합니다.');
    }

    const response = await fetch(`${API_URL}/${memberId}/image?type=${type}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getHeaders(),
    });

    await handleApiError(response);
    return { success: true, message: `${type} 이미지가 성공적으로 삭제되었습니다.` };
  } catch (error) {
    console.error('회원 이미지 삭제 실패:', error);
    throw error;
  }
};

/**
 * POST /api/v1/member-detail/{memberId}/gallery
 * 회원 갤러리 이미지 업로드 (다중)
 * @param {number} memberId - 회원 ID
 * @param {FileList|Array} images - 이미지 파일들
 * @returns {Promise<void>} 업로드 성공
 */
export const uploadMemberGalleryImages = async (memberId, images) => {
  try {
    if (!memberId) {
      throw new Error('회원 ID가 필요합니다.');
    }
    if (!images || images.length === 0) {
      throw new Error('업로드할 이미지가 필요합니다.');
    }

    const formData = new FormData();
    Array.from(images).forEach(image => {
      formData.append('images', image);
    });

    const headers = {};
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/${memberId}/gallery`, {
      method: 'POST',
      credentials: 'include',
      headers: headers,
      body: formData,
    });

    await handleApiError(response);
    return { success: true, message: '갤러리 이미지가 성공적으로 업로드되었습니다.' };
  } catch (error) {
    console.error('갤러리 이미지 업로드 실패:', error);
    throw error;
  }
};

/**
 * GET /api/v1/member-detail/{memberId}/gallery
 * 회원 갤러리 이미지 목록 조회
 * @param {number} memberId - 회원 ID
 * @returns {Promise<Array>} 이미지 경로 목록
 */
export const getMemberGalleryImages = async (memberId) => {
  try {
    if (!memberId) {
      throw new Error('회원 ID가 필요합니다.');
    }

    const response = await fetch(`${API_URL}/${memberId}/gallery`, {
      method: 'GET',
      credentials: 'include',
      headers: getHeaders(),
    });

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error('갤러리 이미지 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * DELETE /api/v1/member-detail/{memberId}/gallery
 * 회원 갤러리 이미지 삭제 (경로 기반)
 * @param {number} memberId - 회원 ID
 * @param {string} imagePath - 삭제할 이미지 경로
 * @returns {Promise<void>} 삭제 성공
 */
export const deleteMemberGalleryImage = async (memberId, imagePath) => {
  try {
    if (!memberId) {
      throw new Error('회원 ID가 필요합니다.');
    }
    if (!imagePath) {
      throw new Error('삭제할 이미지 경로가 필요합니다.');
    }

    const response = await fetch(`${API_URL}/${memberId}/gallery?imagePath=${encodeURIComponent(imagePath)}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getHeaders(),
    });

    await handleApiError(response);
    return { success: true, message: '갤러리 이미지가 성공적으로 삭제되었습니다.' };
  } catch (error) {
    console.error('갤러리 이미지 삭제 실패:', error);
    throw error;
  }
};

/**
 * DELETE /api/v1/member-detail/{memberId}/gallery/all
 * 회원 갤러리 이미지 전체 삭제
 * @param {number} memberId - 회원 ID
 * @returns {Promise<void>} 삭제 성공
 */
export const deleteAllMemberGalleryImages = async (memberId) => {
  try {
    if (!memberId) {
      throw new Error('회원 ID가 필요합니다.');
    }

    const response = await fetch(`${API_URL}/${memberId}/gallery/all`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getHeaders(),
    });

    await handleApiError(response);
    return { success: true, message: '모든 갤러리 이미지가 성공적으로 삭제되었습니다.' };
  } catch (error) {
    console.error('갤러리 이미지 전체 삭제 실패:', error);
    throw error;
  }
};

// 유효성 검사 함수
const validateMemberDetailRequest = (data) => {
  if (!data) {
    throw new Error('회원 데이터가 필요합니다.');
  }

  // userName 필수 검사 (최소 1글자)
  if (!data.userName || data.userName.trim().length === 0) {
    throw new Error('사용자명은 필수입니다.');
  }

  // profileImageId 검사 (숫자여야 함)
  if (data.profileImageId && !Number.isInteger(data.profileImageId)) {
    throw new Error('프로필 이미지 ID는 숫자여야 합니다.');
  }

  // backgroundImageId 검사 (숫자여야 함)  
  if (data.backgroundImageId && !Number.isInteger(data.backgroundImageId)) {
    throw new Error('배경 이미지 ID는 숫자여야 합니다.');
  }

  // togetherScore 검사 (0 이상의 정수)
  if (data.togetherScore !== undefined && 
      (!Number.isInteger(data.togetherScore) || data.togetherScore < 0)) {
    throw new Error('동행 점수는 0 이상의 정수여야 합니다.');
  }

  // visibility 검사 (PUBLIC 또는 PRIVATE)
  if (data.visibility && !['PUBLIC', 'PRIVATE'].includes(data.visibility)) {
    throw new Error('공개 범위는 PUBLIC 또는 PRIVATE이어야 합니다.');
  }
};

// 요청 데이터 포맷팅 함수
const formatMemberDetailRequest = (data) => {
  return {
    userName: data.userName?.trim(),
    profileImageId: data.profileImageId || null,
    backgroundImageId: data.backgroundImageId || null,
    intro: data.intro?.trim() || '',
    togetherScore: data.togetherScore || 0,
    email: data.email?.trim() || '',
    visibility: data.visibility || 'PUBLIC',
    abti: data.abti?.trim() || ''
  };
};

// 응답 데이터 포맷팅 함수
const formatMemberDetailResponse = (apiData) => {
  if (!apiData) return null;

  return {
    id: apiData.id,
    userName: apiData.userName || '',
    profileImageId: apiData.profileImageId || null,
    backgroundImageId: apiData.backgroundImageId || null,
    intro: apiData.intro || '',
    togetherScore: apiData.togetherScore || 0,
    email: apiData.email || '',
    visibility: apiData.visibility || 'PUBLIC',
    createdAt: apiData.createdAt,
    updatedAt: apiData.updatedAt,
    abti: apiData.abti || ''
  };
};

// 유틸리티 함수들
export const memberDetailUtils = {
  /*
   * 동행 점수에 따른 등급 계산
   */
  getScoreGrade: (score) => {
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  },

  /*
   * 공개 범위 한글 변환
   */
  getVisibilityLabel: (visibility) => {
    const labels = {
      'PUBLIC': '공개',
      'PRIVATE': '비공개'
    };
    return labels[visibility] || '알 수 없음';
  },

  /*
   * 프로필 이미지 URL 생성
   */
  getProfileImageUrl: (imageId) => {
    if (!imageId) return '/img/profile.svg'; // 기본 프로필 이미지
    return `${BASE_URL}${API_BASE}/images/${imageId}`;
  },

  /*
   * 배경 이미지 URL 생성
   */
  getBackgroundImageUrl: (imageId) => {
    if (!imageId) return null;
    return `${BASE_URL}${API_BASE}/images/${imageId}`;
  },

  /*
   * ABTI 유효성 검사
   */
  isValidAbti: (abti) => {
    if (!abti || abti.length !== 4) return false;
    
    const pattern = /^[EI][NS][TF][JP]$/;
    return pattern.test(abti.toUpperCase());
  },

  /*
   * 이메일 유효성 검사
   */
  isValidEmail: (email) => {
    if (!email) return true; // 선택 필드이므로 빈 값 허용
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  },

  /*
   * 사용자명 유효성 검사
   */
  isValidUserName: (userName) => {
    if (!userName) return false;
    return userName.trim().length >= 1 && userName.trim().length <= 50;
  },

  /*
   * 소개글 길이 검사
   */
  isValidIntro: (intro) => {
    if (!intro) return true; // 선택 필드
    return intro.length <= 200;
  }
};

export default {
  getMemberDetail,
  updateMemberDetail,
  deleteMemberDetail,
  createMemberDetail,
  updateMemberImage,
  deleteMemberImage,
  uploadMemberGalleryImages,
  getMemberGalleryImages,
  deleteMemberGalleryImage,
  deleteAllMemberGalleryImages,
  utils: memberDetailUtils
};