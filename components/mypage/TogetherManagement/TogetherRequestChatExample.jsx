"use client";

import { useState, useRef, useEffect } from "react";
import { connectWithHistory } from "@/lib/chatIntegration";

/**
 * 통합된 WebSocket + REST API 채팅 컴포넌트 사용 예제
 */
export default function TogetherRequestChatExample({
  roomId,
  myId,
  myDisplayName,
  otherUser,
  onClose
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const chatConnectionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 메시지 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket 연결 및 히스토리 로드
  useEffect(() => {
    if (!roomId || !myId) return;

    setIsLoading(true);

    const initializeChat = async () => {
      try {
        console.log('=== 채팅 초기화 시작 ===');
        console.log('roomId:', roomId, 'myId:', myId);

        // 새 메시지 수신 콜백
        const handleNewMessage = (message) => {
          console.log('새 메시지 수신:', message);
          setMessages(prev => [...prev, message]);
        };

        // WebSocket 연결 + 히스토리 로드
        const connection = await connectWithHistory(
          roomId,
          handleNewMessage,
          myId,
          myDisplayName,
          otherUser
        );

        // 연결 성공
        chatConnectionRef.current = connection;
        setIsConnected(true);

        // 히스토리 메시지 설정
        if (connection.historyMessages && connection.historyMessages.length > 0) {
          console.log(`히스토리 메시지 ${connection.historyMessages.length}개 로드됨`);
          setMessages(connection.historyMessages);
        }

        console.log('=== 채팅 초기화 완료 ===');

      } catch (error) {
        console.error('채팅 초기화 실패:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      if (chatConnectionRef.current) {
        console.log('WebSocket 연결 해제');
        chatConnectionRef.current.unsubscribe();
        chatConnectionRef.current = null;
      }
    };
  }, [roomId, myId, myDisplayName, otherUser]);

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isConnected) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    try {
      if (chatConnectionRef.current && chatConnectionRef.current.sendMessage) {
        // WebSocket으로 실시간 전송
        chatConnectionRef.current.sendMessage(messageContent, myId);
        console.log('메시지 전송 완료:', messageContent);
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  };

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">채팅방을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 border rounded-lg bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <img
            src={otherUser.profileImage || "/img/default_img.svg"}
            alt={otherUser.name}
            className="w-8 h-8 rounded-full"
          />
          <h3 className="font-semibold">{otherUser.name}</h3>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {isConnected ? '온라인' : '연결 끊어짐'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((message) => {
          const isMyMessage = message.sender === myId;
          return (
            <div
              key={message.id}
              className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                isMyMessage
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {!isMyMessage && (
                  <div className="text-xs font-semibold mb-1">
                    {message.senderName}
                  </div>
                )}
                <div className="text-sm">{message.message}</div>
                <div className={`text-xs mt-1 ${
                  isMyMessage ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {message.isHistory && (
                    <span className="ml-1 opacity-75">(기록)</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "메시지를 입력하세요..." : "연결을 확인하세요..."}
            disabled={!isConnected}
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}