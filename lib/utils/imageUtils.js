/**
 * 이미지 URL 처리를 위한 유틸리티 함수들
 */

import { IMAGES } from "@/constants/path";

/**
 * 백엔드에서 받은 이미지 URL을 절대 URL로 변환
 * @param {string|undefined|null} url - 백엔드에서 받은 이미지 URL
 * @returns {string} 절대 URL 또는 기본 이미지 URL
 */
export const toAbsoluteImageUrl = (url) => {
  // null, undefined, 빈 문자열 체크
  if (!url || typeof url !== "string") {
    return IMAGES.GALLERY_DEFAULT_IMG;
  }

  const trimmedUrl = url.trim();
  if (
    trimmedUrl === "" ||
    trimmedUrl === "null" ||
    trimmedUrl === "undefined"
  ) {
    return IMAGES.GALLERY_DEFAULT_IMG;
  }

  // 이미 절대 URL인 경우
  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    return trimmedUrl;
  }

  // 상대 URL인 경우 베이스 URL 추가
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

  // URL이 '/'로 시작하지 않으면 추가
  const path = trimmedUrl.startsWith("/") ? trimmedUrl : `/${trimmedUrl}`;

  const finalUrl = `${baseUrl}${path}`;

  return finalUrl;
};

/**
 * 이벤트 메인 이미지 URL 처리
 * @param {object} eventData - 이벤트 데이터
 * @param {boolean} preferThumbnail - 썸네일 이미지 우선 사용 여부 (기본값: false, 원본 이미지 우선)
 * @returns {string} 처리된 이미지 URL
 */
export const getEventMainImageUrl = (eventData, preferThumbnail = false) => {
  if (!eventData) {
    return IMAGES.GALLERY_DEFAULT_IMG;
  }

  let imageUrl;

  if (preferThumbnail) {
    // 썸네일 이미지 우선: thumbnailImagePath -> mainImagePath 순서
    imageUrl =
      eventData.thumbnailImagePath || // 백엔드 Response/ResponseCard (썸네일)
      eventData.mainImagePath || // 백엔드 ResponseDetail (고화질)
      eventData.mainImageUrl || // 기존 프론트엔드 필드명
      eventData.imgSrc || // 기존 프론트엔드 필드명
      eventData.imageUrl ||
      eventData.image;
  } else {
    // 기본 동작: mainImagePath -> thumbnailImagePath 순서 (원본 이미지 우선)
    imageUrl =
      eventData.mainImagePath || // 백엔드 ResponseDetail (고화질)
      eventData.thumbnailImagePath || // 백엔드 Response/ResponseCard (썸네일)
      eventData.mainImageUrl || // 기존 프론트엔드 필드명
      eventData.imgSrc || // 기존 프론트엔드 필드명
      eventData.imageUrl ||
      eventData.image;
  }

  return toAbsoluteImageUrl(imageUrl);
};

/**
 * 이벤트 콘텐츠 이미지 URL 배열 처리
 * @param {object} eventData - 이벤트 데이터
 * @returns {string[]} 처리된 이미지 URL 배열
 */
export const getEventContentImageUrls = (eventData) => {
  if (!eventData) {
    return [];
  }

  // 백엔드 ResponseDetail에서 contentImages 필드 사용
  const contentImages =
    eventData.contentImages ||
    eventData.contentImageUrls ||
    eventData.detailImages ||
    eventData.imageUrls ||
    eventData.images ||
    [];

  if (!Array.isArray(contentImages)) {
    return [];
  }

  const processedImages = contentImages
    .filter((url) => url && typeof url === "string" && url.trim() !== "")
    .map((url) => toAbsoluteImageUrl(url));

  return processedImages;
};

/**
 * AI 추천 이벤트 이미지 URL 처리
 * @param {object} suggestionData - AI 추천 데이터
 * @param {boolean} preferThumbnail - 썸네일 이미지 우선 사용 여부 (기본값: false, 원본 이미지 우선)
 * @returns {string} 처리된 이미지 URL
 */
export const getAISuggestionImageUrl = (
  suggestionData,
  preferThumbnail = false
) => {
  if (!suggestionData) {
    return IMAGES.GALLERY_DEFAULT_IMG;
  }

  // AI 추천 데이터는 이미 mapSuggestionItem에서 처리되어 imgSrc 필드를 가질 수 있음
  // 하지만 원본 데이터가 있다면 고화질 버전을 우선 사용
  let imageUrl;

  if (preferThumbnail) {
    // 썸네일 우선
    imageUrl =
      suggestionData.imgSrc ||
      suggestionData.thumbnailImagePath ||
      suggestionData.mainImagePath ||
      suggestionData.mainImageUrl ||
      suggestionData.imageUrl ||
      suggestionData.image;
  } else {
    // 기본 동작: 원본 이미지 우선
    imageUrl =
      suggestionData.mainImagePath ||
      suggestionData.imgSrc ||
      suggestionData.thumbnailImagePath ||
      suggestionData.mainImageUrl ||
      suggestionData.imageUrl ||
      suggestionData.image;
  }


  return toAbsoluteImageUrl(imageUrl);
};

/**
 * 이미지 로딩 오류 처리 핸들러
 * @param {Event} event - 이미지 오류 이벤트
 * @param {string} fallbackUrl - 대체 이미지 URL (선택사항)
 */
export const handleImageError = (
  event,
  fallbackUrl = IMAGES.GALLERY_DEFAULT_IMG
) => {
  const img = event.currentTarget || event.target;

  // 무한 루프 방지
  if (img.getAttribute("data-fallback-applied") === "true") {
    return;
  }

  img.setAttribute("data-fallback-applied", "true");
  img.src = fallbackUrl;
};

/**
 * 이미지 URL 유효성 검사
 * @param {string} url - 검사할 URL
 * @returns {boolean} 유효한 URL인지 여부
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== "string") return false;

  const trimmedUrl = url.trim();
  if (
    trimmedUrl === "" ||
    trimmedUrl === "null" ||
    trimmedUrl === "undefined"
  ) {
    return false;
  }

  try {
    new URL(
      trimmedUrl.startsWith("http")
        ? trimmedUrl
        : `http://localhost${trimmedUrl}`
    );
    return true;
  } catch {
    return false;
  }
};
