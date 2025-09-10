// /lib/togetherRequestApi.js - 로컬스토리지 버전
import {
  addChatRequest,
  updateChatRequestStatus,
  getChatRequestsForUser,
  getChatRequestsFromUser,
} from "./chatRequestUtils";

export async function createTogetherRequest({
  togetherId,
  applicantId,
  message,
}) {
  // 로컬스토리지에 저장
  const request = addChatRequest({
    togetherId,
    fromUserId: String(applicantId),
    toUserId: "임시호스트", // 실제로는 Together에서 hostId 가져와야 함
    message,
    status: "pending",
    postId: togetherId,
    postTitle: "테스트 모집글",
    eventName: "테스트 이벤트",
    eventType: "기타",
  });

  // 약간의 지연으로 실제 API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    requestId: request.requestId,
    message: "동행 신청이 완료되었습니다.",
  };
}

export async function acceptTogetherRequest(requestId) {
  const updated = updateChatRequestStatus(requestId, "accepted");

  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    success: true,
    chatRoomId: `room_${Date.now()}`, // 임시 채팅방 ID
    message: "동행 신청이 수락되었습니다.",
  };
}

export async function rejectTogetherRequest(requestId) {
  updateChatRequestStatus(requestId, "rejected");

  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    success: true,
    message: "동행 신청이 거절되었습니다.",
  };
}

export async function getReceivedTogetherRequests(memberId) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return getChatRequestsForUser(memberId);
}

export async function getSentTogetherRequests(memberId) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return getChatRequestsFromUser(memberId);
}
