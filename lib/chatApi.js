// /lib/chatApi.js
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || "";

// 공용 파서
async function jsonOrText(res) {
  const ct = res.headers.get("content-type") || "";
  const txt = await res.text();
  if (ct.includes("application/json")) {
    try {
      return JSON.parse(txt);
    } catch (e) {
      return { __raw: txt, __jsonError: String(e) };
    }
  }
  return { __raw: txt };
}

// 공용 요청 래퍼
async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  if (res.ok) return await jsonOrText(res);

  const body = await jsonOrText(res);
  const err = new Error(
    `${options.method || "GET"} ${url} 실패 (${res.status})`
  );
  err.status = res.status;
  err.url = url;
  err.body = body;
  throw err;
}

/** 방 목록 (Spring: GET /chat/rooms/list) */
export async function listChatRooms() {
  return await request(`/chat/rooms/list`, { method: "GET" });
}

/** 방 생성 (Spring: POST /chat/room?name=...) */
export async function createChatRoom(name) {
  const q = encodeURIComponent(String(name || "room"));
  return await request(`/chat/room?name=${q}`, { method: "POST" });
}

/** 방 참가 (Spring: POST /chat/room/{roomId}/join?memberId=123) */
export async function joinRoom(roomId, memberId) {
  const rid = Number(roomId);
  const mid = Number(memberId);
  if (!Number.isFinite(rid) || !Number.isFinite(mid)) {
    const e = new Error(`joinRoom: 잘못된 인자 rid=${roomId}, mid=${memberId}`);
    e.status = 400;
    throw e;
  }
  return await request(`/chat/room/${rid}/join?memberId=${mid}`, {
    method: "POST",
  });
}

/** 방 상세 (Spring: GET /chat/room/{roomId}) */
export async function getChatRoom(roomId) {
  const rid = Number(roomId);
  if (!Number.isFinite(rid)) {
    const e = new Error(`getChatRoom: roomId가 숫자가 아님 (${roomId})`);
    e.status = 400;
    throw e;
  }
  return await request(`/chat/room/${rid}`, { method: "GET" });
}

/** 히스토리(있으면 사용, 없으면 호출 안 됨) */
export async function getChatMessages(roomId) {
  const rid = Number(roomId);
  if (!Number.isFinite(rid)) {
    const e = new Error(`getChatMessages: roomId가 숫자가 아님 (${roomId})`);
    e.status = 400;
    throw e;
  }
  // 백엔드에 없다면 사용하지 마세요. 있다면 경로 맞추세요.
  return await request(`/api/chat/room/${rid}/messages`, { method: "GET" });
}

// @@
//  // (이미 있는) 공통 request 헬퍼와 BASE, 그리고 listChatRooms/joinRoom 등은 그대로 .
//  // 아래 신규 함수만 추가하면 됩니다.
// /**
//  * 채팅방 멤버 목록 조회
//  * GET /chat/room/{roomId}/members
//  * @returns Array<{ id:number, name:string, profileImage:string }>
//  */
export async function getChatRoomMembers(roomId) {
  const id = Number(roomId);
  if (!Number.isFinite(id)) {
    const err = new Error("getChatRoomMembers: roomId must be a number");
    err.status = 400;
    throw err;
  }
  // 프로젝트의 request 헬퍼가 이미 있다면 그대로 사용
  return request(`/chat/room/${id}/members`, {
    method: "GET",
    withAuth: true,
  });
}
// 기존 코드에서 getRoomMembers로 import하는 곳이 있으므로, 호환용 별칭도 함께 export
export { getChatRoomMembers as getRoomMembers };
