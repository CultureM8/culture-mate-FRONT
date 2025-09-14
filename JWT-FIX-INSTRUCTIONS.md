# JWT WebSocket 연결 수정 방법

## 1단계: import 추가

`TogetherRequestChat.jsx` 파일의 상단에 다음 import를 추가하세요:

```javascript
import { getJwtConnectHeaders } from "@/lib/simple-jwt-fix";
```

기존 import 섹션이 다음과 같이 변경됩니다:
```javascript
import { listChatRooms, joinRoom } from "@/lib/chatApi";
import { WS_ENDPOINT, subDestination, pubDestination } from "@/lib/chatClient";
import { getJwtConnectHeaders } from "@/lib/simple-jwt-fix";  // 이 줄 추가
```

## 2단계: StompClient 설정 수정

184번째 줄 근처의 `new StompClient` 부분을 찾아서:

**기존 코드:**
```javascript
const client = new StompClient({
  webSocketFactory: () => sock,
  reconnectDelay: 2000,
  debug: (msg) => console.log('[WebSocket Debug]', msg), // 디버그 활성화
  onConnect: () => {
```

**수정 후:**
```javascript
const client = new StompClient({
  webSocketFactory: () => sock,
  reconnectDelay: 2000,
  debug: (msg) => console.log('[WebSocket Debug]', msg), // 디버그 활성화
  connectHeaders: getJwtConnectHeaders(),  // 이 줄 추가!
  onConnect: () => {
```

## 3단계: 에러 처리 추가 (선택사항)

useEffect 시작 부분에 토큰 확인 코드를 추가할 수도 있습니다:

```javascript
useEffect(() => {
  if (!roomId) return;

  // JWT 토큰 확인
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error('JWT 토큰이 없습니다. 로그인이 필요합니다.');
      return;
    }
  } catch (error) {
    console.error('토큰 확인 중 오류:', error);
    return;
  }

  const sock = new SockJS(WS_ENDPOINT);
  // ... 나머지 코드
```

## 완료!

이렇게 수정하면 WebSocket 연결 시 JWT 토큰이 자동으로 포함되어 서버에서 인증이 정상적으로 처리됩니다.

### 테스트 방법:
1. 파일을 저장
2. 브라우저에서 채팅방 열기
3. 개발자 도구 콘솔에서 다음 메시지 확인:
   - `🔑 JWT 토큰을 WebSocket 헤더에 추가합니다.`
   - `✅ WebSocket 연결 성공!`
   - `STOMP connected: true`

### 만약 오류가 발생하면:
- 로그인이 되어있는지 확인
- localStorage에 accessToken이 있는지 확인
- 서버가 정상 실행 중인지 확인