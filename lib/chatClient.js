// /lib/chatClient.js
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

// 백엔드 WebSocket 엔드포인트 (직접 연결)
export const WS_ENDPOINT = process.env.NEXT_PUBLIC_CHAT_WS || "http://localhost:8080/websocket";

// 구독 경로
export function subDestination(roomId) {
  return `/topic/chatroom/${roomId}`;
}

// 발행 경로
export function pubDestination(roomId) {
  return `/app/chatroom/${roomId}/send`;
}

export function createChatClient() {
  // ws:// 값을 실수로 넣어도 작동하도록 http로 교체
  const sockUrl = WS_ENDPOINT.startsWith("ws")
    ? WS_ENDPOINT.replace(/^ws/i, "http")
    : WS_ENDPOINT;

  const client = new Client({
    webSocketFactory: () => new SockJS(sockUrl),
    reconnectDelay: 3000,
    debug: (msg) => console.log('[STOMP Debug]', msg), // 디버그 활성화
  });
  return client;
}

/**
 * STOMP 연결 + 구독
 * @param {string|number} roomId
 * @param {(msg:any)=>void} onMessage
 */
export function connectAndSubscribe(roomId, onMessage) {
  const client = createChatClient();

  return new Promise((resolve, reject) => {
    client.onConnect = () => {
      const sub = client.subscribe(subDestination(roomId), (frame) => {
        let body = null;
        try {
          body = JSON.parse(frame.body);
        } catch {
          body = frame.body;
        }
        onMessage(body);
      });

      resolve({
        client,
        unsubscribe: () => {
          try {
            sub?.unsubscribe();
          } catch {}
          try {
            client.deactivate();
          } catch {}
        },
      });
    };

    client.onStompError = (frame) => reject(frame);
    client.onWebSocketError = (event) => reject(event);
    client.activate();
  });
}

// 서버 DTO: { roomId, senderId, content }
function buildOutgoing(roomId, message) {
  const content = message?.content ?? message?.message ?? message?.text ?? "";
  const senderId =
    message?.senderId ??
    message?.memberId ??
    message?.userId ??
    message?.fromUserId ??
    null;

  const body = { roomId, content };
  if (senderId != null) body.senderId = senderId;
  return body;
}

export function sendChat(client, roomId, message) {
  const body = buildOutgoing(roomId, message);
  client.publish({
    destination: pubDestination(roomId),
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}
