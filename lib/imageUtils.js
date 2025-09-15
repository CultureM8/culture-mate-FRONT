/**
 * 이미지 URL 변환 유틸리티
 * 백엔드 이미지 경로를 절대 URL로 변환합니다.
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

/**
 * 이미지 경로를 절대 URL로 변환
 * @param {string} imagePath - 이미지 경로
 * @returns {string} 절대 URL 또는 기본 이미지
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath || !imagePath.trim()) {
    return "/img/default_img.svg";
  }

  // 이미 절대 URL인 경우
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // 백엔드 이미지 경로를 절대 URL로 변환
  if (imagePath.startsWith('/images/')) {
    return `${BASE_URL}${imagePath}`;
  }

  // 로컬 이미지 (public 폴더)
  return imagePath;
};

/**
 * 프로필 이미지 URL 가져오기
 * @param {string} profileImagePath - 프로필 이미지 경로
 * @returns {string} 프로필 이미지 URL
 */
export const getProfileImageUrl = (profileImagePath) => {
  return getImageUrl(profileImagePath) || "/img/default_img.svg";
};

/**
 * 이벤트 이미지 URL 가져오기
 * @param {object} event - 이벤트 객체
 * @returns {string} 이벤트 이미지 URL
 */
export const getEventImageUrl = (event) => {
  const imagePath = event?.eventImage ?? event?.eventImg ?? event?.imgSrc ?? "";
  return getImageUrl(imagePath) || "/img/default_img.svg";
};