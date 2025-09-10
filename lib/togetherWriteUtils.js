// lib/togetherWriteUtils.js
import { createTogether } from "@/lib/togetherApi";

/**
 * 폼 데이터를 백엔드 Request DTO로 변환
 */
export const transformToBackendRequest = ({
  title,
  content,
  selectedEvent,
  form,
  user,
}) => {
  // 인원수 파싱 ("2명" -> 2)
  const parseParticipantCount = (countStr) => {
    if (!countStr) return 2; // 기본값
    const match = countStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 2;
  };

  // 지역 정보 파싱 (현재는 단순 처리, 나중에 지역 검색 API와 연동 필요)
  const parseRegion = (locationQuery) => {
    // TODO: 실제 지역 검색 API와 연동하여 정확한 level1, level2, level3 추출
    // 현재는 임시로 전체 텍스트를 level1으로 처리
    if (!locationQuery || locationQuery.trim() === "") {
      return {
        level1: "서울특별시",
        level2: "강남구",
        level3: null,
      };
    }

    // 간단한 파싱 로직 (예: "서울 강남구 역삼동" -> level1: "서울특별시", level2: "강남구", level3: "역삼동")
    const parts = locationQuery.trim().split(/\s+/);
    return {
      level1: parts[0] || "서울특별시",
      level2: parts[1] || "강남구",
      level3: parts[2] || null,
    };
  };

  // 주소 분리 (현재는 전체를 address로, 나중에 상세 주소 분리 로직 추가)
  const parseAddress = (locationQuery) => {
    if (!locationQuery || locationQuery.trim() === "") {
      return {
        address: "서울특별시 강남구",
        addressDetail: "상세 주소 미입력",
      };
    }

    return {
      address: locationQuery.trim(),
      addressDetail: "상세 주소 미입력", // TODO: 별도 입력 필드 또는 분리 로직 필요
    };
  };

  const region = parseRegion(form.locationQuery);
  const addressInfo = parseAddress(form.locationQuery);
  const maxParticipants = parseParticipantCount(form.companionCount);

  return {
    eventId: selectedEvent?.id || selectedEvent?.eventId || null,
    hostId: user?.id || user?.memberId || null,
    title: title.trim(),
    content: content.trim() || null,
    regionDto: {
      level1: region.level1,
      level2: region.level2,
      level3: region.level3,
    },
    address: addressInfo.address,
    addressDetail: addressInfo.addressDetail,
    meetingDate: form.companionDate, // YYYY-MM-DD 형식
    maxParticipants: maxParticipants,
  };
};

/**
 * 모임 생성 API 호출
 */
export const submitTogetherPost = async ({
  title,
  content,
  selectedEvent,
  form,
  user,
}) => {
  // 필수 필드 검증
  if (!title?.trim()) {
    throw new Error("제목을 입력해주세요.");
  }

  if (!form.companionDate) {
    throw new Error("모임 날짜를 선택해주세요.");
  }

  if (!user?.id && !user?.memberId) {
    throw new Error("로그인 정보를 확인할 수 없습니다.");
  }

  // 이벤트 ID 검증 (필수)
  if (!selectedEvent?.id && !selectedEvent?.eventId) {
    throw new Error("이벤트를 선택해주세요.");
  }

  // 백엔드 요청 형식으로 변환
  const requestPayload = transformToBackendRequest({
    title,
    content,
    selectedEvent,
    form,
    user,
  });

  console.log("Together 작성 요청:", requestPayload);
  console.log("사용자 정보:", user);
  console.log("선택된 이벤트:", selectedEvent);
  console.log("폼 데이터:", form);
  
  // JSON 직렬화 테스트
  console.log("JSON 직렬화 테스트:", JSON.stringify(requestPayload, null, 2));

  // API 호출
  try {
    const response = await createTogether(requestPayload);
    console.log("Together 작성 성공:", response);
    return response;
  } catch (error) {
    console.error("Together 작성 실패:", error);

    // 에러 메시지 정리
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "모임 글 작성에 실패했습니다.";

    throw new Error(errorMessage);
  }
};

/**
 * 폼 데이터 유효성 검증
 */
export const validateTogetherForm = ({
  title,
  content,
  selectedEvent,
  form,
  user,
}) => {
  const errors = [];

  if (!title?.trim()) {
    errors.push("제목을 입력해주세요.");
  }

  if (!selectedEvent?.id && !selectedEvent?.eventId) {
    errors.push("이벤트를 선택해주세요.");
  }

  if (!form.companionDate) {
    errors.push("모임 날짜를 선택해주세요.");
  }

  if (!form.companionCount || form.companionCount === "00 명") {
    errors.push("모임 인원을 선택해주세요.");
  }

  if (!user || !user.id) {
    errors.push("로그인 정보를 확인할 수 없습니다.");
  }

  // 날짜 검증 (과거 날짜 체크)
  if (form.companionDate) {
    const meetingDate = new Date(form.companionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간 제거하여 날짜만 비교

    if (meetingDate < today) {
      errors.push("모임 날짜는 오늘 이후로 선택해주세요.");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
