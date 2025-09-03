// lib/chatRequestUtils.js
const KEY = "chatRequests";
const load = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const save = (rows) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(rows));
};

/* 채팅 신청 데이터를 메모리에 저장 ( 백엔드 연동 시 API 호출로 대체)*/

let chatRequestsStorage = load(); // ← 메모리 초기화 시에도 복원

/* 초기 샘플 데이터*/
const initializeSampleData = () => {
  if (chatRequestsStorage.length === 0) {
    chatRequestsStorage = [
      {
        requestId: "req_sample_1",
        fromUserId: "user123",
        fromUserName: "김철수",
        fromUserProfileImage: "/img/default_img.svg",
        toUserId: "user-mf0a6tb4",
        postId: "together001",
        message:
          "안녕하세요! 저도 악뮤 팬이에요 함께하고 싶어서 신청드립니다. 잘 부탁드려요!",
        status: "pending",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        postTitle: "콘서트 '악동들 AKMU' 떼창하러 갈 사람?",
        postDate: "2025-08-02",
        eventName: "악동들 AKMU",
        eventType: "콘서트/페스티벌",
      },
      {
        requestId: "req_sample_2",
        fromUserId: "user456",
        fromUserName: "이영희",
        fromUserProfileImage: "/img/default_img.svg",
        toUserId: "user-mf0a6tb4",
        postId: "together002",
        message: "모네에 관심이 많아서 신청합니다. 함께 즐거운 시간 보내요!",
        status: "pending",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        postTitle: "전시 '모네에서 앤디워홀까지' 같이 갈 사람?",
        postDate: "2025-09-10",
        eventName: "모네에서 앤디워홀까지",
        eventType: "전시",
      },
    ];
  }
};

// ✅ 현재 사용자(userId)에게 도착한 샘플 데이터를 주입(중복 없이)
export const seedChatRequestsForUser = (userId) => {
  if (!userId) return [];

  const now = Date.now();
  const samples = [
    {
      requestId: `req_seed_${now}_1`,
      fromUserId: "user123",
      fromUserName: "김철수",
      fromLoginId: "kim123",
      fromUserProfileImage: "/img/default_img.svg",
      toUserId: userId, // ★ 현재 사용자에게 도착
      postId: "together001",
      message:
        "안녕하세요! 저도 악뮤 팬이에요 함께하고 싶어서 신청드립니다. 잘 부탁드려요!",
      status: "pending",
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      postTitle: "콘서트 '악동들 AKMU' 떼창하러 갈 사람?",
      postDate: "2025-08-02",
      eventName: "악동들 AKMU",
      eventType: "콘서트/페스티벌",
      eventImage: "/img/default_img.svg",
    },
    {
      requestId: `req_seed_${now}_2`,
      fromUserId: "user456",
      fromUserName: "이영희",
      fromLoginId: "lee456",
      fromUserProfileImage: "/img/default_img.svg",
      toUserId: userId, // ★ 현재 사용자에게 도착
      postId: "together002",
      message: "모네에 관심이 많아서 신청합니다. 함께 즐거운 시간 보내요!",
      status: "pending",
      createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      postTitle: "전시 '모네에서 앤디워홀까지' 같이 갈 사람?",
      postDate: "2025-09-10",
      eventName: "모네에서 앤디워홀까지",
      eventType: "전시",
      eventImage: "/img/default_img.svg",
    },
  ];

  // 이미 해당 사용자에게 온 요청이 하나도 없을 때만 주입
  const hasForUser = chatRequestsStorage.some((r) => r.toUserId === userId);
  if (!hasForUser) {
    chatRequestsStorage = [...chatRequestsStorage, ...samples];
  }
  return chatRequestsStorage.filter((r) => r.toUserId === userId);
};

/*채팅 신청 추가*/

// addChatRequest, updateChatRequestStatus, deleteChatRequest 끝에서 save 호출
export const addChatRequest = (requestData) => {
  chatRequestsStorage.push(requestData);
  save(chatRequestsStorage); // 저장
  return requestData;
};
// updateChatRequestStatus / deleteChatRequest 내부에서도 변경 후 save(chatRequestsStorage)

/*특정 사용자가 받은 채팅 신청 목록 조회*/
export const getChatRequestsForUser = (userId) => {
  // 스토리지가 비었으면 현재 사용자 기준으로 시드 생성
  if (chatRequestsStorage.length === 0) {
    return seedChatRequestsForUser(userId);
  }
  // 스토리지에 데이터는 있는데 현재 사용자에게 온 게 없다면 시드 보강
  const rows = chatRequestsStorage.filter((r) => r.toUserId === userId);
  if (rows.length === 0) {
    return seedChatRequestsForUser(userId);
  }
  return rows;
};

// 특정 사용자가 보낸 채팅 신청 목록 조회
export const getChatRequestsFromUser = (userId) => {
  initializeSampleData();
  return chatRequestsStorage.filter((request) => request.fromUserId === userId);
};

// 채팅 신청 상태 업데이트 (수락/거절)
export const updateChatRequestStatus = (requestId, status) => {
  const requestIndex = chatRequestsStorage.findIndex(
    (request) => request.requestId === requestId
  );
  if (requestIndex !== -1) {
    chatRequestsStorage[requestIndex].status = status;
    chatRequestsStorage[requestIndex].updatedAt = new Date().toISOString();
    return chatRequestsStorage[requestIndex];
  }
  return null;
};

// 채팅 신청 삭제
export const deleteChatRequest = (requestId) => {
  initializeSampleData();
  const requestIndex = chatRequestsStorage.findIndex(
    (request) => request.requestId === requestId
  );
  if (requestIndex !== -1) {
    const deletedRequest = chatRequestsStorage.splice(requestIndex, 1)[0];
    return deletedRequest;
  }
  return null;
};

// 읽지 않은 채팅 신청 개수 조회
export const getUnreadChatRequestsCount = (userId) => {
  return chatRequestsStorage.filter(
    (request) => request.toUserId === userId && request.status === "pending"
  ).length;
};

// 특정 채팅 신청 조회
export const getChatRequestById = (requestId) => {
  initializeSampleData();
  return chatRequestsStorage.find((request) => request.requestId === requestId);
};

// 모든 채팅 신청 데이터 조회 (디버깅용)
export const getAllChatRequests = () => {
  initializeSampleData();
  return [...chatRequestsStorage];
};
