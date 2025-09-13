import togetherApi from "@/lib/api/togetherApi";

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
  // 지역 정보 처리 - 이제 직접 선택된 지역 사용
  const getRegionDto = () => {
    const { meetingRegion } = form;
    if (!meetingRegion || (!meetingRegion.level1 && !meetingRegion.level2 && !meetingRegion.level3)) {
      // 기본값 설정
      return {
        level1: "서울특별시",
        level2: "강남구",
        level3: null,
      };
    }

    return {
      level1: meetingRegion.level1 || null,
      level2: meetingRegion.level2 || null,
      level3: meetingRegion.level3 || null,
    };
  };

  const region = getRegionDto();

  // companionCount에서 숫자 추출 (예: "05 명" -> 5)
  const parseParticipantCount = (companionCount) => {
    if (!companionCount) return 2; // 기본값
    const numMatch = companionCount.match(/\d+/);
    return numMatch ? parseInt(numMatch[0]) : 2;
  };

  // 필수 필드 검증 - null 방지
  const eventId = selectedEvent?.id || selectedEvent?.eventId;
  const hostId = user?.id || user?.memberId;
  const maxParticipants = form.maxParticipants || parseParticipantCount(form.companionCount);

  if (!eventId) {
    throw new Error("이벤트 ID가 없습니다.");
  }
  
  if (!hostId) {
    throw new Error("사용자 ID가 없습니다.");
  }

  if (!form.companionDate) {
    throw new Error("모임 날짜가 없습니다.");
  }

  if (!form.meetingLocation?.trim()) {
    throw new Error("모임장소가 없습니다.");
  }

  return {
    eventId: eventId,
    hostId: hostId,
    title: title.trim(),
    content: content.trim() || "",  // null 대신 빈 문자열
    region: {
      level1: region.level1,
      level2: region.level2,
      level3: region.level3,
    },
    meetingLocation: form.meetingLocation.trim(),
    meetingDate: form.companionDate, // YYYY-MM-DD 형식 문자열
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
    const response = await togetherApi.create(requestPayload);
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

  if (!form.maxParticipants && (!form.companionCount || form.companionCount === "00 명")) {
    errors.push("모임 인원을 선택해주세요.");
  }

  // 모임장소 유효성 검증
  if (!form.meetingRegion || (!form.meetingRegion.level1 && !form.meetingRegion.level2)) {
    errors.push("모임 지역을 선택해주세요.");
  }

  if (!form.meetingLocation?.trim()) {
    errors.push("모임장소를 입력해주세요.");
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