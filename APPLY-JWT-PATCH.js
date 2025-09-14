// JWT WebSocket 패치를 적용하는 스크립트

// 1. 이 스크립트를 복사해서 브라우저 콘솔에 붙여넣기 하세요
// 2. localStorage에 JWT 토큰을 확인해서 connectHeaders를 생성합니다

function getJwtConnectHeaders() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("JWT 토큰이 없습니다. 로그인이 필요합니다.");
  }
  console.log('🔑 JWT 토큰을 WebSocket 헤더에 추가합니다.');
  return {
    Authorization: `Bearer ${token}`,
    token: token,
    'Content-Type': 'application/json'
  };
}

// 현재 로그인 상태 확인
console.log('=== JWT 토큰 상태 확인 ===');
try {
  const headers = getJwtConnectHeaders();
  console.log('✅ JWT 토큰 정상 확인됨');
  console.log('토큰 헤더:', headers);
} catch (error) {
  console.error('❌ JWT 토큰 문제:', error.message);
  console.log('localStorage accessToken:', localStorage.getItem("accessToken"));
}

// 테스트용 WebSocket 연결 함수
function testJwtWebSocketConnection() {
  const WS_ENDPOINT = "http://localhost:8080/websocket";

  try {
    const connectHeaders = getJwtConnectHeaders();
    console.log('JWT 헤더로 WebSocket 연결 테스트 중...');
    console.log('연결 헤더:', connectHeaders);

    // 여기에 실제 WebSocket 연결 로직을 넣을 수 있습니다
    return connectHeaders;
  } catch (error) {
    console.error('WebSocket 연결 테스트 실패:', error);
    return null;
  }
}

// 테스트 실행
testJwtWebSocketConnection();

console.log(`
=== 수동 수정 가이드 ===

TogetherRequestChat.jsx 파일에서 다음을 수정하세요:

1. import 문 추가 (8번째 줄 근처):
   import { getJwtConnectHeaders } from "@/lib/simple-jwt-fix";

2. StompClient 설정 수정 (184번째 줄 근처):
   const client = new StompClient({
     webSocketFactory: () => sock,
     reconnectDelay: 2000,
     debug: (msg) => console.log('[WebSocket Debug]', msg),
     connectHeaders: getJwtConnectHeaders(), // 이 줄 추가!
     onConnect: () => {
       console.log('✅ JWT 인증 WebSocket 연결 성공!', roomId);
       // 기존 코드...

그러면 JWT 토큰이 자동으로 WebSocket 헤더에 포함됩니다!
`);