// Next 리라이트: /api/* -> http://localhost:8080/* 로 프록시된다고 가정
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  withCredentials: false,
});

// 공통 에러 래퍼 (선택)
const unwrap = (p) =>
  p
    .then((r) => r.data)
    .catch((e) => {
      // 필요하면 여기서 공통 처리(토스트/로그)
      throw e;
    });

/* ===== 채팅 REST =====
 * 백엔드 스웨거 경로 기준:
 *  GET  /chat/rooms/list
 *  GET  /chat/room/{roomId}
 *  POST /chat/room
 *  GET  /chat/room/{roomId}/messages
 */

// 방 목록
export function fetchChatRooms() {
  return unwrap(api.get("/chat/rooms/list"));
}

// 방 단건
export function fetchChatRoom(roomId) {
  return unwrap(api.get(`/chat/room/${roomId}`));
}

// 방 생성 (payload 필드는 백엔드 요구에 맞게: 예) { roomName, togetherId }
export function createChatRoom(payload) {
  return unwrap(api.post("/chat/room", payload));
}

// 특정 방 메시지 히스토리
export function fetchChatMessages(roomId) {
  return unwrap(api.get(`/chat/room/${roomId}/messages`));
}

// (옵션) 헬스체크/테스트
export function ping() {
  return unwrap(api.get("/hello")); // 백엔드에 /hello 있으면 사용
}

export default api;
