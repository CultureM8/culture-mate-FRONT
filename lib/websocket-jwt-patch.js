// JWT 토큰이 포함된 WebSocket 연결을 위한 패치
import SockJS from "sockjs-client";
import { Client as StompClient } from "@stomp/stompjs";

/**
 * JWT 토큰을 포함한 STOMP 클라이언트 생성
 * @param {string} endpoint - WebSocket 엔드포인트
 * @returns {StompClient} JWT 헤더가 포함된 STOMP 클라이언트
 */
export function createAuthenticatedStompClient(endpoint) {
  // JWT 토큰 가져오기
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  if (!token) {
    throw new Error("JWT 토큰이 없습니다. 로그인이 필요합니다.");
  }

  console.log('🔑 JWT 토큰으로 WebSocket 연결 생성 중...');

  const sock = new SockJS(endpoint);
  const client = new StompClient({
    webSocketFactory: () => sock,
    reconnectDelay: 3000,
    debug: (msg) => console.log('[STOMP Debug]', msg),

    // JWT 토큰 헤더 추가
    connectHeaders: {
      Authorization: `Bearer ${token}`,
      token: token,  // 백업 헤더
      'Content-Type': 'application/json'
    },

    // 연결 성공 시 로그
    onConnect: (frame) => {
      console.log('✅ JWT 인증된 WebSocket 연결 성공!');
      console.log('Frame:', frame);
    },

    // 연결 실패 시 로그
    onStompError: (frame) => {
      console.error('❌ STOMP 오류:', frame);
      console.error('Error details:', frame.headers);
    },

    // WebSocket 오류 시 로그
    onWebSocketError: (error) => {
      console.error('❌ WebSocket 오류:', error);
    },

    // 연결 해제 시 로그
    onDisconnect: (frame) => {
      console.log('🔌 WebSocket 연결 해제');
      console.log('Disconnect frame:', frame);
    }
  });

  return client;
}

/**
 * TogetherRequestChat.jsx에서 사용할 수 있는 완전한 useEffect 교체 코드
 * @param {number} roomId - 채팅방 ID
 * @param {function} setMessages - 메시지 상태 설정 함수
 * @param {object} stompRef - STOMP 클라이언트 ref
 * @param {string} WS_ENDPOINT - WebSocket 엔드포인트
 * @param {function} subDestination - 구독 경로 함수
 * @param {string} myId - 내 사용자 ID
 * @param {string} myDisplayName - 내 표시 이름
 * @param {object} otherUser - 상대방 정보
 * @param {object} chatRequestData - 채팅 요청 데이터
 * @param {ref} sentInitialRef - 초기 메시지 전송 여부 ref
 * @param {function} pubDestination - 발행 경로 함수
 * @param {string} myMemberIdRaw - 내 멤버 ID (숫자)
 * @returns {function} cleanup 함수
 */
export function useAuthenticatedWebSocket({
  roomId,
  setMessages,
  stompRef,
  WS_ENDPOINT,
  subDestination,
  myId,
  myDisplayName,
  otherUser,
  chatRequestData,
  sentInitialRef,
  pubDestination,
  myMemberIdRaw
}) {

  const initializeWebSocket = async () => {
    if (!roomId) return;

    try {
      console.log('=== JWT 인증 WebSocket 초기화 ===');
      console.log('roomId:', roomId, 'myId:', myId);

      // JWT 인증된 STOMP 클라이언트 생성
      const client = createAuthenticatedStompClient(WS_ENDPOINT);

      // 연결 성공 핸들러 오버라이드
      client.onConnect = () => {
        console.log('✅ WebSocket 연결 성공!', roomId);

        // 실시간 메시지 구독
        client.subscribe(subDestination(roomId), (frame) => {
          try {
            const body = JSON.parse(frame.body);
            const senderId = String(body.senderId ?? "unknown");

            console.log('새 메시지 수신:', body);

            setMessages((prev) => [
              ...prev,
              {
                id: `srv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                sender: senderId,
                senderName: senderId === myId ? myDisplayName : otherUser.name,
                message: String(body.content ?? ""),
                timestamp: new Date(),
              },
            ]);
          } catch (e) {
            console.error("메시지 파싱 오류:", e);
          }
        });

        // 최초 1회: 신청 본문을 실제 방으로 전송 (있을 때만)
        if (!sentInitialRef.current && chatRequestData?.message && myId) {
          console.log('초기 메시지 전송:', chatRequestData.message);

          client.publish({
            destination: pubDestination(),
            body: JSON.stringify({
              roomId: Number(roomId),
              senderId: Number(myMemberIdRaw),
              content: chatRequestData.message,
            }),
            headers: { "content-type": "application/json" }
          });

          sentInitialRef.current = true;
        }
      };

      // 오류 핸들러들
      client.onStompError = (frame) => {
        console.error('❌ STOMP 연결 오류:', frame);
        console.error('에러 헤더:', frame.headers);
        console.error('에러 본문:', frame.body);
      };

      client.onWebSocketError = (event) => {
        console.error('❌ WebSocket 연결 오류:', event);
      };

      // STOMP 클라이언트 저장
      stompRef.current = client;

      // 연결 시작
      client.activate();

      console.log('WebSocket 연결 시도 중...');

    } catch (error) {
      console.error('WebSocket 초기화 실패:', error);
    }
  };

  // cleanup 함수
  const cleanup = () => {
    if (stompRef.current) {
      console.log('🔌 WebSocket 연결 정리 중...');
      try {
        stompRef.current.deactivate();
      } catch (e) {
        console.error('WebSocket 정리 중 오류:', e);
      }
      stompRef.current = null;
    }
  };

  return { initializeWebSocket, cleanup };
}

/**
 * 간단한 사용법 예제 코드
 */
export const USAGE_EXAMPLE = `
// TogetherRequestChat.jsx에서 사용하는 방법:

import { useAuthenticatedWebSocket } from "@/lib/websocket-jwt-patch";

// 기존 useEffect를 이것으로 교체:
useEffect(() => {
  const { initializeWebSocket, cleanup } = useAuthenticatedWebSocket({
    roomId,
    setMessages,
    stompRef,
    WS_ENDPOINT,
    subDestination,
    myId,
    myDisplayName,
    otherUser,
    chatRequestData,
    sentInitialRef,
    pubDestination,
    myMemberIdRaw
  });

  initializeWebSocket();
  return cleanup;
}, [roomId, myId, myDisplayName, otherUser]);
`;