// JWT 토큰이 포함된 WebSocket 연결을 위한 패치
import SockJS from "sockjs-client";
import { Client as StompClient } from "@stomp/stompjs";

/**
 * JWT 토큰을 포함한 STOMP 클라이언트 생성 (오류 처리 및 재연결 강화)
 * @param {string} endpoint - WebSocket 엔드포인트
 * @param {object} options - 연결 옵션
 * @returns {StompClient} JWT 헤더가 포함된 STOMP 클라이언트
 */
export function createAuthenticatedStompClient(endpoint, options = {}) {
  // JWT 토큰 가져오기
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  if (!token) {
    throw new Error("JWT 토큰이 없습니다. 로그인이 필요합니다.");
  }


  // 연결 시도 횟수 추적
  let connectionAttempts = 0;
  const maxRetries = options.maxRetries || 3;
  const retryDelay = options.retryDelay || 3000;

  // 여러 방식으로 JWT 토큰 전달 시도

  // 방법 1: URL 파라미터로 토큰 전달
  const sockUrl = `${endpoint}?access_token=${encodeURIComponent(token)}`;

  const sock = new SockJS(sockUrl, null, {
    // SockJS 옵션에 추가 헤더 포함 시도
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Auth-Token': token
    }
  });

  const client = new StompClient({
    webSocketFactory: () => sock,
    reconnectDelay: retryDelay,
    debug: () => {}, // 디버그 로그 비활성화

    // 방법 2: STOMP connectHeaders로 토큰 전달
    connectHeaders: {
      'Authorization': `Bearer ${token}`,
      'token': token,
      'access_token': token,
      'X-Auth-Token': token,
      'jwt': token
    },

    // 방법 3: WebSocket Sub-Protocol 사용 (가장 확실한 방법)
    protocols: [`access_token.${token}`, `jwt.${token}`],


    // 연결 성공 시 로그
    onConnect: (frame) => {
      connectionAttempts = 0; // 성공 시 재시도 카운터 리셋
    },

    // STOMP 프로토콜 오류 처리
    onStompError: (frame) => {
      console.error('❌ STOMP 오류:', frame);
      console.error('Error headers:', frame.headers);
      console.error('Error body:', frame.body);

      // JWT 관련 오류 감지
      const errorMessage = frame.headers.message || frame.body || '';
      if (errorMessage.includes('JWT') ||
          errorMessage.includes('토큰') ||
          errorMessage.includes('인증') ||
          errorMessage.includes('만료')) {

        console.error('🔒 JWT 인증 오류 감지 - 토큰 갱신 또는 재로그인 필요');

        // 토큰 만료 시 처리
        handleTokenExpiration();
      }
    },

    // WebSocket 연결 오류 처리
    onWebSocketError: (error) => {
      console.error('❌ WebSocket 연결 오류:', error);
      connectionAttempts++;

      if (connectionAttempts < maxRetries) {
        console.log(`🔄 WebSocket 재연결 시도 ${connectionAttempts}/${maxRetries}`);
        setTimeout(() => {
          if (client.state !== 'CONNECTED') {
            try {
              client.activate();
            } catch (e) {
              console.error('재연결 시도 실패:', e);
            }
          }
        }, retryDelay * connectionAttempts); // 지수 백오프
      } else {
        console.error('🚫 최대 재연결 시도 횟수 초과. 수동 새로고침이 필요합니다.');
        showConnectionError();
      }
    },

    // WebSocket 연결 해제 처리
    onWebSocketClose: (event) => {
      console.log('🔌 WebSocket 연결 해제:', event);

      // 정상적인 해제가 아닌 경우 재연결 시도
      if (event && event.code !== 1000 && connectionAttempts < maxRetries) {
        console.log('🔄 비정상 연결 해제 감지 - 재연결 시도');
        setTimeout(() => {
          if (client.state !== 'CONNECTED') {
            client.activate();
          }
        }, retryDelay);
      }
    },

    // 연결 해제 시 로그
    onDisconnect: (frame) => {
      console.log('🔌 STOMP 연결 해제');
      console.log('Disconnect frame:', frame);
    }
  });

  return client;
}

/**
 * JWT 토큰 만료 처리
 */
function handleTokenExpiration() {
  if (typeof window !== "undefined") {
    // 토큰 만료 알림
    const shouldRefresh = confirm(
      '인증이 만료되었습니다. 페이지를 새로고침하여 다시 로그인하시겠습니까?'
    );

    if (shouldRefresh) {
      // 현재 페이지 새로고침
      window.location.reload();
    } else {
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
    }
  }
}

/**
 * 연결 오류 UI 표시
 */
function showConnectionError() {
  if (typeof window !== "undefined") {
    const shouldRetry = confirm(
      '채팅 서버 연결에 실패했습니다. 페이지를 새로고침하여 다시 시도하시겠습니까?'
    );

    if (shouldRetry) {
      window.location.reload();
    }
  }
}

/**
 * WebSocket 연결 상태 체크 유틸리티
 * @param {StompClient} client - STOMP 클라이언트
 * @returns {object} 연결 상태 정보
 */
export function getConnectionStatus(client) {
  if (!client) {
    return {
      status: 'DISCONNECTED',
      isConnected: false,
      isConnecting: false,
      message: '클라이언트가 없습니다'
    };
  }

  const state = client.state;
  return {
    status: state,
    isConnected: state === 'CONNECTED',
    isConnecting: state === 'CONNECTING',
    message: getStatusMessage(state)
  };
}

/**
 * 연결 상태 메시지 반환
 * @param {string} state - STOMP 연결 상태
 * @returns {string} 상태 메시지
 */
function getStatusMessage(state) {
  switch (state) {
    case 'CONNECTED':
      return '연결됨';
    case 'CONNECTING':
      return '연결 중...';
    case 'DISCONNECTING':
      return '연결 해제 중...';
    case 'DISCONNECTED':
      return '연결 해제됨';
    default:
      return '알 수 없는 상태';
  }
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
            destination: pubDestination(roomId),
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