// TogetherRequestChat.jsx의 StompClient 설정에 추가할 코드

/**
 * JWT 토큰을 가져와서 connectHeaders 객체를 반환
 * TogetherRequestChat.jsx에서 사용
 */
export function getJwtConnectHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  if (!token) {
    console.error('❌ JWT 토큰이 없습니다. 로그인이 필요합니다.');
    throw new Error("JWT 토큰이 없습니다. 로그인이 필요합니다.");
  }

  console.log('🔑 JWT 토큰을 WebSocket 헤더에 추가합니다.');

  return {
    Authorization: `Bearer ${token}`,
    token: token,  // 백업 헤더
    'Content-Type': 'application/json'
  };
}

/**
 * 현재 사용자가 로그인 되어있는지 확인
 */
export function isUserAuthenticated() {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return !!token;
}

/**
 * 간단한 사용법:
 * TogetherRequestChat.jsx에서 다음 2줄만 추가하면 됩니다:
 *
 * 1. import { getJwtConnectHeaders } from "@/lib/simple-jwt-fix";
 *
 * 2. StompClient 생성 부분에 connectHeaders 추가:
 *    const client = new StompClient({
 *      webSocketFactory: () => sock,
 *      reconnectDelay: 2000,
 *      debug: (msg) => console.log('[WebSocket Debug]', msg),
 *      connectHeaders: getJwtConnectHeaders(), // 이 줄만 추가!
 *      onConnect: () => {
 *        // 기존 코드...
 */