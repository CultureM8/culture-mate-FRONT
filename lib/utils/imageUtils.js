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
  // 디버깅 로그
  console.log("toAbsoluteImageUrl - input url:", url);

  // null, undefined, 빈 문자열 체크
  if (!url || typeof url !== "string") {
    console.log(
      "toAbsoluteImageUrl - returning default image: no url or not string"
    );
    return IMAGES.GALLERY_DEFAULT_IMG;
  }

  const trimmedUrl = url.trim();
  if (
    trimmedUrl === "" ||
    trimmedUrl === "null" ||
    trimmedUrl === "undefined"
  ) {
    console.log(
      "toAbsoluteImageUrl - returning default image: empty or null string"
    );
    return IMAGES.GALLERY_DEFAULT_IMG;
  }

  // 이미 절대 URL인 경우
  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    console.log("toAbsoluteImageUrl - returning absolute URL:", trimmedUrl);
    return trimmedUrl;
  }

  // 상대 URL인 경우 베이스 URL 추가
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

  // URL이 '/'로 시작하지 않으면 추가
  const path = trimmedUrl.startsWith("/") ? trimmedUrl : `/${trimmedUrl}`;

  const finalUrl = `${baseUrl}${path}`;
  console.log("toAbsoluteImageUrl - constructed URL:", finalUrl);

  return finalUrl;
};

/**
 * 이벤트 메인 이미지 URL 처리
 * @param {object} eventData - 이벤트 데이터
 * @param {boolean} preferHighQuality - 고해상도 이미지 우선 사용 여부 (기본값: false)
 * @returns {string} 처리된 이미지 URL
 */
export const getEventMainImageUrl = (eventData, preferHighQuality = false) => {
  console.log("getEventMainImageUrl - eventData:", eventData);
  console.log("getEventMainImageUrl - preferHighQuality:", preferHighQuality);

  if (!eventData) {
    console.log("getEventMainImageUrl - no eventData, returning default");
    return IMAGES.GALLERY_DEFAULT_IMG;
  }

  let imageUrl;

  if (preferHighQuality) {
    // 고화질 이미지 우선: mainImagePath -> thumbnailImagePath 순서
    imageUrl =
      eventData.mainImagePath || // 백엔드 ResponseDetail (고화질)
      eventData.thumbnailImagePath || // 백엔드 Response/ResponseCard (썸네일)
      eventData.mainImageUrl || // 기존 프론트엔드 필드명
      eventData.imgSrc || // 기존 프론트엔드 필드명
      eventData.imageUrl ||
      eventData.image;
  } else {
    // 일반적인 경우: thumbnailImagePath -> mainImagePath 순서 (기존 동작 유지)
    imageUrl =
      eventData.thumbnailImagePath || // 백엔드 Response/ResponseCard (썸네일)
      eventData.mainImagePath || // 백엔드 ResponseDetail (고화질)
      eventData.mainImageUrl || // 기존 프론트엔드 필드명
      eventData.imgSrc || // 기존 프론트엔드 필드명
      eventData.imageUrl ||
      eventData.image;
  }

  console.log("getEventMainImageUrl - found imageUrl:", imageUrl);

  return toAbsoluteImageUrl(imageUrl);
};

/**
 * 이벤트 콘텐츠 이미지 URL 배열 처리
 * @param {object} eventData - 이벤트 데이터
 * @returns {string[]} 처리된 이미지 URL 배열
 */
export const getEventContentImageUrls = (eventData) => {
  console.log("getEventContentImageUrls - eventData:", eventData);

  if (!eventData) {
    console.log("getEventContentImageUrls - no eventData");
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

  console.log("getEventContentImageUrls - contentImages:", contentImages);

  if (!Array.isArray(contentImages)) {
    console.log("getEventContentImageUrls - not an array");
    return [];
  }

  const processedImages = contentImages
    .filter((url) => url && typeof url === "string" && url.trim() !== "")
    .map((url) => toAbsoluteImageUrl(url));

  console.log("getEventContentImageUrls - processed images:", processedImages);

  return processedImages;
};

/**
 * AI 추천 이벤트 이미지 URL 처리
 * @param {object} suggestionData - AI 추천 데이터
 * @param {boolean} preferHighQuality - 고해상도 이미지 우선 사용 여부 (기본값: true)
 * @returns {string} 처리된 이미지 URL
 */
export const getAISuggestionImageUrl = (
  suggestionData,
  preferHighQuality = true
) => {
  console.log("getAISuggestionImageUrl - suggestionData:", suggestionData);
  console.log(
    "getAISuggestionImageUrl - preferHighQuality:",
    preferHighQuality
  );

  if (!suggestionData) {
    console.log(
      "getAISuggestionImageUrl - no suggestionData, returning default"
    );
    return IMAGES.GALLERY_DEFAULT_IMG;
  }

  // AI 추천 데이터는 이미 mapSuggestionItem에서 처리되어 imgSrc 필드를 가질 수 있음
  // 하지만 원본 데이터가 있다면 고화질 버전을 우선 사용
  let imageUrl;

  if (preferHighQuality) {
    // 고화질 이미지 우선
    imageUrl =
      suggestionData.mainImagePath ||
      suggestionData.imgSrc ||
      suggestionData.thumbnailImagePath ||
      suggestionData.mainImageUrl ||
      suggestionData.imageUrl ||
      suggestionData.image;
  } else {
    // 썸네일 우선 (기존 동작)
    imageUrl =
      suggestionData.imgSrc ||
      suggestionData.thumbnailImagePath ||
      suggestionData.mainImagePath ||
      suggestionData.mainImageUrl ||
      suggestionData.imageUrl ||
      suggestionData.image;
  }

  console.log("getAISuggestionImageUrl - found imageUrl:", imageUrl);

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
