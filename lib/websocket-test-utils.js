// WebSocket JWT 인증 테스트 및 디버깅 유틸리티

import { createAuthenticatedStompClient, getConnectionStatus } from './websocket-jwt-patch.js';

/**
 * WebSocket 연결 테스트
 * 브라우저 콘솔에서 사용 가능한 테스트 함수들
 */
export const WebSocketTestUtils = {

  /**
   * JWT 토큰 상태 확인
   */
  checkJwtToken() {
    const token = localStorage.getItem('accessToken');
    console.log('=== JWT 토큰 상태 ===');
    console.log('토큰 존재:', !!token);
    console.log('토큰 길이:', token ? token.length : 0);

    if (token) {
      try {
        // JWT 페이로드 디코딩 (간단한 Base64 디코딩)
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('토큰 만료 시간:', new Date(payload.exp * 1000).toLocaleString());
        console.log('현재 시간:', new Date().toLocaleString());
        console.log('토큰 만료 여부:', payload.exp * 1000 < Date.now());
        console.log('사용자 ID:', payload.loginId);
      } catch (e) {
        console.warn('토큰 디코딩 실패:', e);
      }
    }

    return !!token;
  },

  /**
   * WebSocket 연결 테스트 (향상된 디버깅)
   */
  async testConnection(endpoint = "http://localhost:8080/websocket") {
    console.log('=== WebSocket 연결 테스트 시작 ===');
    console.log('엔드포인트:', endpoint);

    // 토큰 전달 방식들 출력
    const token = localStorage.getItem('accessToken');
    if (token) {
      console.log('🔑 사용할 토큰 전달 방식들:');
      console.log('  1. URL 파라미터: ?access_token=***');
      console.log('  2. STOMP connectHeaders');
      console.log('  3. WebSocket Sub-Protocol');
      console.log('  4. SockJS 헤더 (제한적)');
    }

    if (!this.checkJwtToken()) {
      console.error('❌ JWT 토큰이 없습니다. 로그인이 필요합니다.');
      return false;
    }

    try {
      const client = createAuthenticatedStompClient(endpoint, {
        maxRetries: 1,
        retryDelay: 2000
      });

      return new Promise((resolve) => {
        let resolved = false;

        const originalOnConnect = client.onConnect;
        client.onConnect = (frame) => {
          console.log('✅ 연결 성공!');
          console.log('프레임:', frame);
          if (originalOnConnect) originalOnConnect(frame);

          if (!resolved) {
            resolved = true;
            resolve(true);

            // 5초 후 연결 해제
            setTimeout(() => {
              console.log('🔌 테스트 연결 해제');
              client.deactivate();
            }, 5000);
          }
        };

        const originalOnStompError = client.onStompError;
        client.onStompError = (frame) => {
          console.error('❌ STOMP 오류:', frame);
          if (originalOnStompError) originalOnStompError(frame);

          if (!resolved) {
            resolved = true;
            resolve(false);
          }
        };

        const originalOnWebSocketError = client.onWebSocketError;
        client.onWebSocketError = (error) => {
          console.error('❌ WebSocket 오류:', error);
          if (originalOnWebSocketError) originalOnWebSocketError(error);

          if (!resolved) {
            resolved = true;
            resolve(false);
          }
        };

        // 10초 타임아웃
        setTimeout(() => {
          if (!resolved) {
            console.error('⏰ 연결 타임아웃');
            resolved = true;
            resolve(false);
          }
        }, 10000);

        client.activate();
      });

    } catch (error) {
      console.error('❌ 연결 테스트 실패:', error);
      return false;
    }
  },

  /**
   * 채팅방 구독 테스트
   */
  async testChatRoomSubscription(roomId, endpoint = "http://localhost:8080/websocket") {
    console.log(`=== 채팅방 ${roomId} 구독 테스트 ===`);

    if (!this.checkJwtToken()) {
      console.error('❌ JWT 토큰이 없습니다.');
      return false;
    }

    try {
      const client = createAuthenticatedStompClient(endpoint);

      return new Promise((resolve) => {
        let resolved = false;

        client.onConnect = () => {
          console.log('✅ WebSocket 연결 성공');

          try {
            // 채팅방 구독 시도
            const subscription = client.subscribe(`/topic/chatroom/${roomId}`, (message) => {
              console.log('📨 메시지 수신:', JSON.parse(message.body));
            });

            console.log('✅ 채팅방 구독 성공');

            if (!resolved) {
              resolved = true;
              resolve(true);

              // 10초 후 연결 해제
              setTimeout(() => {
                console.log('🔌 테스트 종료');
                subscription.unsubscribe();
                client.deactivate();
              }, 10000);
            }

          } catch (subscribeError) {
            console.error('❌ 구독 실패:', subscribeError);
            if (!resolved) {
              resolved = true;
              resolve(false);
            }
          }
        };

        client.onStompError = (frame) => {
          console.error('❌ STOMP 오류:', frame);
          if (!resolved) {
            resolved = true;
            resolve(false);
          }
        };

        client.activate();
      });

    } catch (error) {
      console.error('❌ 채팅방 구독 테스트 실패:', error);
      return false;
    }
  },

  /**
   * 환경 정보 출력
   */
  showEnvironmentInfo() {
    console.log('=== 환경 정보 ===');
    console.log('현재 URL:', window.location.href);
    console.log('User Agent:', navigator.userAgent);
    console.log('WebSocket 지원:', 'WebSocket' in window);
    console.log('SockJS 지원:', typeof SockJS !== 'undefined');
    console.log('localStorage 사용 가능:', typeof Storage !== 'undefined');

    // 네트워크 상태 (지원하는 브라우저만)
    if ('connection' in navigator) {
      console.log('네트워크 상태:', navigator.connection.effectiveType);
      console.log('온라인 상태:', navigator.onLine);
    }

    // 저장된 토큰 정보
    console.log('저장된 토큰들:', Object.keys(localStorage).filter(key =>
      key.includes('token') || key.includes('Token') || key.includes('auth')
    ));
  }
};

/**
 * 브라우저 콘솔에서 쉽게 사용할 수 있도록 전역에 등록
 */
if (typeof window !== 'undefined') {
  window.wsTest = WebSocketTestUtils;
  console.log('💡 WebSocket 테스트 도구가 window.wsTest로 등록되었습니다.');
  console.log('사용법:');
  console.log('  window.wsTest.checkJwtToken() - JWT 토큰 확인');
  console.log('  window.wsTest.testConnection() - 연결 테스트');
  console.log('  window.wsTest.testChatRoomSubscription(123) - 채팅방 구독 테스트');
  console.log('  window.wsTest.showEnvironmentInfo() - 환경 정보 확인');
}