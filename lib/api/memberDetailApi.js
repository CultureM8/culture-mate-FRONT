import { api, unwrap } from '@/lib/apiBase';
import { EVENT_TYPE_OPTIONS } from '@/constants/eventTypes';

const ENDPOINT = "/v1/member-detail";

// 회원 상세 정보 조회 (GET /api/v1/member-detail/{memberId} 또는 /api/v1/member-detail/)
export const getMemberDetail = async (memberId) => {
  try {
    // memberId가 없으면 자신의 정보 조회, 있으면 해당 회원 정보 조회
    const url = memberId ? `${ENDPOINT}/${memberId}` : ENDPOINT;

    const data = await unwrap(
      api.get(url)
    );

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

    const data = await unwrap(
      api.put(`${ENDPOINT}/${memberId}`, requestData)
    );

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

    await unwrap(
      api.delete(`${ENDPOINT}/${memberId}`)
    );
    
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

    const data = await unwrap(
      api.post(`${ENDPOINT}/${memberId}`, requestData)
    );

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

    await unwrap(
      api.patch(`${ENDPOINT}/${memberId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    );

    return { success: true, message: `${type} 이미지가 성공적으로 업로드되었습니다.` };
  } catch (error) {
    console.error('회원 이미지 업로드 실패:', error);
    throw error;
  }
};

/**
 * PUT /api/v1/member-detail/{memberId}/with-images
 * 회원 정보와 이미지 통합 업데이트
 * @param {number} memberId - 회원 ID
 * @param {Object} memberData - 회원 텍스트 데이터 (닉네임, 소개, MBTI 등)
 * @param {File|null} profileImage - 프로필 이미지 파일 (선택사항)
 * @param {File|null} backgroundImage - 배경 이미지 파일 (선택사항)
 * @returns {Promise<void>} 업데이트 성공
 */
export const updateMemberWithImages = async (memberId, memberData, profileImage = null, backgroundImage = null) => {
  try {
    if (!memberId) {
      throw new Error('회원 ID가 필요합니다.');
    }
    if (!memberData) {
      throw new Error('회원 데이터가 필요합니다.');
    }

    const formData = new FormData();

    // JSON 데이터 추가
    formData.append('data', JSON.stringify(memberData));

    // 이미지 파일들 추가 (있는 경우에만)
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }
    if (backgroundImage) {
      formData.append('backgroundImage', backgroundImage);
    }

    await unwrap(
      api.put(`${ENDPOINT}/${memberId}/with-images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    );

    return { success: true, message: '회원 정보가 성공적으로 업데이트되었습니다.' };
  } catch (error) {
    console.error('회원 정보 통합 업데이트 실패:', error);
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

    await unwrap(
      api.delete(`${ENDPOINT}/${memberId}/image`, {
        params: { type }
      })
    );

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

    await unwrap(
      api.post(`${ENDPOINT}/${memberId}/gallery`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    );

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

    return await unwrap(
      api.get(`${ENDPOINT}/${memberId}/gallery`)
    );
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

    await unwrap(
      api.delete(`${ENDPOINT}/${memberId}/gallery`, {
        params: { imagePath }
      })
    );

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

    await unwrap(
      api.delete(`${ENDPOINT}/${memberId}/gallery/all`)
    );

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

  // nickname 필수 검사 (최소 1글자)
  if (!data.nickname || data.nickname.trim().length === 0) {
    throw new Error('닉네임은 필수입니다.');
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
    nickname: data.nickname?.trim(),
    profileImageId: data.profileImageId || null,
    backgroundImageId: data.backgroundImageId || null,
    intro: data.intro?.trim() || '',
    mbti: data.mbti?.trim() || '',
    togetherScore: data.togetherScore || 0,
    email: data.email?.trim() || '',
    visibility: data.visibility || 'PUBLIC'
  };
};

// 응답 데이터 포맷팅 함수
const formatMemberDetailResponse = (apiData) => {
  if (!apiData) return null;

  return {
    id: apiData.id,
    nickname: apiData.nickname || '',
    profileImageId: apiData.profileImagePath || null,
    backgroundImageId: apiData.backgroundImagePath || null,
    intro: apiData.intro || '',
    mbti: apiData.mbti || '',
    togetherScore: apiData.togetherScore || 0,
    email: apiData.email || '',
    visibility: apiData.visibility || 'PUBLIC',
    interestEventTypes: apiData.interestEventTypes || [],
    interestTags: apiData.interestTags || [],
    createdAt: apiData.createdAt,
    updatedAt: apiData.updatedAt
  };
};

/**
 * PUT /api/v1/member-detail/{memberId}/interests/event-types
 * 관심 이벤트 타입 업데이트
 * @param {number} memberId - 회원 ID
 * @param {Array<string>} eventTypes - 이벤트 타입 배열
 * @returns {Promise<void>} 업데이트 성공
 */
export const updateInterestEventTypes = async (memberId, eventTypes) => {
  try {
    if (!memberId) {
      throw new Error('회원 ID가 필요합니다.');
    }

    await unwrap(
      api.put(`${ENDPOINT}/${memberId}/interests/event-types`, {
        eventTypes: eventTypes || []
      })
    );

    return { success: true, message: '관심 이벤트 타입이 성공적으로 업데이트되었습니다.' };
  } catch (error) {
    console.error('관심 이벤트 타입 업데이트 실패:', error);
    throw error;
  }
};

/**
 * PUT /api/v1/member-detail/{memberId}/interests/tags
 * 관심 태그 업데이트
 * @param {number} memberId - 회원 ID
 * @param {Array<string>} tags - 태그 배열
 * @returns {Promise<void>} 업데이트 성공
 */
export const updateInterestTags = async (memberId, tags) => {
  try {
    if (!memberId) {
      throw new Error('회원 ID가 필요합니다.');
    }

    await unwrap(
      api.put(`${ENDPOINT}/${memberId}/interests/tags`, {
        tags: tags || []
      })
    );

    return { success: true, message: '관심 태그가 성공적으로 업데이트되었습니다.' };
  } catch (error) {
    console.error('관심 태그 업데이트 실패:', error);
    throw error;
  }
};

// EventType 상수 (백엔드 enum과 동일)

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
   * 프로필 이미지 URL 생성 (경로 기반)
   */
  getProfileImageUrl: (imagePath) => {
    if (!imagePath) return '/img/profile.svg'; // 기본 프로필 이미지
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
    return `${baseUrl}${imagePath}`;
  },

  /*
   * 배경 이미지 URL 생성 (경로 기반)
   */
  getBackgroundImageUrl: (imagePath) => {
    if (!imagePath) return null;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
    return `${baseUrl}${imagePath}`;
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
   * 닉네임 유효성 검사
   */
  isValidNickname: (nickname) => {
    if (!nickname) return false;
    return nickname.trim().length >= 1 && nickname.trim().length <= 50;
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
  updateMemberWithImages,
  deleteMemberImage,
  uploadMemberGalleryImages,
  getMemberGalleryImages,
  deleteMemberGalleryImage,
  deleteAllMemberGalleryImages,
  utils: memberDetailUtils
};