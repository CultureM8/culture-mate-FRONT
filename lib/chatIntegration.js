// ChatAPI + WebSocket 통합 기능
import chatApi from "@/lib/api/chatApi";
import { WS_ENDPOINT, subDestination, pubDestination } from "@/lib/chatClient";
import SockJS from "sockjs-client";
import { Client as StompClient } from "@stomp/stompjs";

/**
 * WebSocket 연결과 함께 기존 메시지 히스토리를 로드하는 통합 함수
 * @param {number} roomId - 채팅방 ID
 * @param {function} onMessage - 새 메시지 수신 콜백
 * @param {string} myId - 내 사용자 ID
 * @param {string} myDisplayName - 내 표시 이름
 * @param {object} otherUser - 상대방 정보
 * @returns {object} - {client, unsubscribe, loadHistory}
 */
export async function connectWithHistory(roomId, onMessage, myId, myDisplayName, otherUser) {
  // JWT 토큰 가져오기
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (!token) {
    throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
  }

  const sock = new SockJS(WS_ENDPOINT);
  const client = new StompClient({
    webSocketFactory: () => sock,
    reconnectDelay: 2000,
    debug: (msg) => console.log('[STOMP Debug]', msg),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
      token: token  // 백업 헤더
    }
  });

  return new Promise((resolve, reject) => {
    client.onConnect = async () => {
      console.log('✅ WebSocket 연결 성공!', roomId);

      try {
        // 1. 채팅방 정식 입장 처리
        await chatApi.joinRoom(roomId, myId);
        console.log('✅ 채팅방 정식 입장 완료');

        // 2. 기존 메시지 히스토리 로드
        const historyResponse = await chatApi.getMessages(roomId);
        const historyMessages = Array.isArray(historyResponse) ? historyResponse : [];

        const formattedHistory = historyMessages.map(msg => ({
          id: msg.id || `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          sender: String(msg.senderId),
          senderName: msg.senderId == myId ? myDisplayName : otherUser.name,
          message: msg.content || '',
          timestamp: new Date(msg.createdAt || Date.now()),
          isHistory: true
        }));

        console.log(`✅ 메시지 히스토리 로드 완료: ${formattedHistory.length}개`);

        // 3. 실시간 메시지 구독
        const subscription = client.subscribe(subDestination(roomId), (frame) => {
          try {
            const body = JSON.parse(frame.body);
            const senderId = String(body.senderId ?? "unknown");

            const newMessage = {
              id: `srv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              sender: senderId,
              senderName: senderId === myId ? myDisplayName : otherUser.name,
              message: String(body.content ?? ""),
              timestamp: new Date(),
              isHistory: false
            };

            onMessage(newMessage);
          } catch (e) {
            console.error("메시지 파싱 오류:", e);
          }
        });

        resolve({
          client,
          historyMessages: formattedHistory,
          unsubscribe: () => {
            try {
              subscription?.unsubscribe();
            } catch {}
            try {
              client.deactivate();
            } catch {}
          },
          sendMessage: (content, senderId) => {
            const body = {
              roomId: Number(roomId),
              senderId: Number(senderId),
              content: content
            };

            client.publish({
              destination: pubDestination(),
              body: JSON.stringify(body),
              headers: { "content-type": "application/json" }
            });
          }
        });

      } catch (error) {
        console.error('채팅방 초기화 실패:', error);
        // 히스토리 로드 실패해도 실시간 채팅은 가능하도록
        const subscription = client.subscribe(subDestination(roomId), (frame) => {
          try {
            const body = JSON.parse(frame.body);
            const senderId = String(body.senderId ?? "unknown");

            const newMessage = {
              id: `srv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              sender: senderId,
              senderName: senderId === myId ? myDisplayName : otherUser.name,
              message: String(body.content ?? ""),
              timestamp: new Date(),
              isHistory: false
            };

            onMessage(newMessage);
          } catch (e) {
            console.error("메시지 파싱 오류:", e);
          }
        });

        resolve({
          client,
          historyMessages: [],
          unsubscribe: () => {
            try {
              subscription?.unsubscribe();
            } catch {}
            try {
              client.deactivate();
            } catch {}
          },
          sendMessage: (content, senderId) => {
            const body = {
              roomId: Number(roomId),
              senderId: Number(senderId),
              content: content
            };

            client.publish({
              destination: pubDestination(),
              body: JSON.stringify(body),
              headers: { "content-type": "application/json" }
            });
          }
        });
      }
    };

    client.onStompError = (frame) => {
      console.error('STOMP 연결 오류:', frame);
      reject(frame);
    };

    client.onWebSocketError = (event) => {
      console.error('WebSocket 연결 오류:', event);
      reject(event);
    };

    client.activate();
  });
}

/**
 * 채팅방 정보 조회
 * @param {number} roomId
 * @returns {object} 채팅방 정보
 */
export async function getChatRoomInfo(roomId) {
  try {
    const roomInfo = await chatApi.getRoomById(roomId);
    return roomInfo;
  } catch (error) {
    console.error('채팅방 정보 조회 실패:', error);
    return null;
  }
}

/**
 * 채팅방 멤버 목록 조회
 * @param {number} roomId
 * @returns {array} 멤버 목록
 */
export async function getChatRoomMembers(roomId) {
  try {
    const members = await chatApi.getRoomMembers(roomId);
    return Array.isArray(members) ? members : [];
  } catch (error) {
    console.error('채팅방 멤버 조회 실패:', error);
    return [];
  }
}