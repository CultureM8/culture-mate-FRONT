// TogetherRequestChat.jsx에서 사용할 수 있는 간단한 패치 함수들

import { connectWithHistory } from "./chatIntegration";

/**
 * 기존 TogetherRequestChat 컴포넌트에서 사용할 수 있는 useEffect 교체용 함수
 */
export function useIntegratedChat(roomId, myId, myDisplayName, otherUser, onNewMessage) {
  let connection = null;

  const initializeChat = async () => {
    if (!roomId || !myId) return null;

    try {
      console.log('=== 통합 채팅 초기화 ===');

      connection = await connectWithHistory(
        roomId,
        onNewMessage,
        myId,
        myDisplayName,
        otherUser
      );

      console.log('✅ 통합 채팅 초기화 완료');
      return connection;

    } catch (error) {
      console.error('통합 채팅 초기화 실패:', error);
      return null;
    }
  };

  const cleanup = () => {
    if (connection) {
      connection.unsubscribe();
      connection = null;
    }
  };

  return { initializeChat, cleanup };
}

/**
 * 기존 TogetherRequestChat에 추가할 수 있는 히스토리 로드 기능
 */
export async function loadChatHistory(roomId, myId, myDisplayName, otherUser) {
  try {
    const chatApi = (await import("@/lib/api/chatApi")).default;

    // 기존 메시지 히스토리 로드
    const historyResponse = await chatApi.getMessages(roomId);
    const historyMessages = Array.isArray(historyResponse) ? historyResponse : [];

    return historyMessages.map(msg => ({
      id: msg.id || `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: String(msg.senderId),
      senderName: msg.senderId == myId ? myDisplayName : otherUser.name,
      message: msg.content || '',
      timestamp: new Date(msg.createdAt || Date.now()),
      isHistory: true
    }));

  } catch (error) {
    console.error('메시지 히스토리 로드 실패:', error);
    return [];
  }
}

/**
 * 간단한 사용법 가이드를 위한 코드 스니펫
 */
export const INTEGRATION_USAGE_EXAMPLE = `
// TogetherRequestChat.jsx에서 사용하는 방법:

// 1. import 추가
import { connectWithHistory } from "@/lib/logic/chatIntegration";

// 2. WebSocket 연결 부분을 교체
useEffect(() => {
  if (!roomId) return;

  const initializeChat = async () => {
    try {
      const connection = await connectWithHistory(
        roomId,
        (newMessage) => {
          // 새 메시지 수신시 실행될 콜백
          setMessages(prev => [...prev, newMessage]);
        },
        myId,
        myDisplayName,
        otherUser
      );

      // 히스토리 메시지가 있으면 설정
      if (connection.historyMessages?.length > 0) {
        setMessages(prev => [...connection.historyMessages, ...prev]);
      }

      stompRef.current = connection;

    } catch (error) {
      console.error('채팅 초기화 실패:', error);
    }
  };

  initializeChat();

  return () => {
    if (stompRef.current) {
      stompRef.current.unsubscribe();
    }
  };
}, [roomId, myId, myDisplayName, otherUser]);

// 3. 메시지 전송 부분도 교체 가능
const handleSendMessage = () => {
  if (stompRef.current?.sendMessage) {
    stompRef.current.sendMessage(newMessage, myId);
    setNewMessage("");
  }
};
`;