"use client";

import { useState, useRef, useEffect } from "react";
import FriendListItem from "@/components/mypage/FriendListItem";
import Image from "next/image";

export default function RequestChat({
  chatRequestData,
  onClose,
  onFriendClick,
  onAccept,
  onReject,
}) {
  /* 데이터 유효성 검사*/
  if (!chatRequestData) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">채팅 데이터를 불러오는 중...</p>
      </div>
    );
  }

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  /*초기 메시지 설정*/
  useEffect(() => {
    if (!chatRequestData) return;

    const initialMessages = [
      {
        id: 1,
        sender: chatRequestData.fromUserId || "unknown",
        senderName: chatRequestData.fromUserName || "익명",
        message: chatRequestData.message || "메시지 없음",
        timestamp: new Date(chatRequestData.createdAt || Date.now()),
        isInitial: true,
      },
    ];
    setMessages(initialMessages);
  }, [chatRequestData]);

  /* 친구 클릭 핸들러*/
  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
    if (onFriendClick) {
      onFriendClick(friend);
    }
  };

  /*슬라이드 닫기 핸들러*/
  const handleSlideClose = () => {
    if (onClose) {
      onClose();
    }
  };

  /* 수락 핸들러*/
  const handleAccept = async () => {
    if (!onAccept) return;
    setIsProcessing(true);
    try {
      await onAccept(chatRequestData.requestId);
    } finally {
      setIsProcessing(false);
    }
  };

  /*거절 핸들러*/
  const handleReject = async () => {
    if (!onReject) return;
    setIsProcessing(true);
    try {
      await onReject(chatRequestData.requestId);
    } finally {
      setIsProcessing(false);
    }
  };

  /*메시지 전송 핸들러*/
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      sender: "current_user_id",
      senderName: "current_user_nickname",
      message: newMessage.trim(),
      timestamp: new Date(),
      isInitial: false,
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  /* 엔터키 처리*/
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /* 신청자 정보*/
  const friendData = {
    id: chatRequestData.fromUserId || "unknown",
    name: chatRequestData.fromUserName || "익명",
    profileImage:
      chatRequestData.fromUserProfileImage || "/img/default_img.svg",
    location: "위치 정보 없음",
    age: 0,
    interests: [],
    status: "온라인",
    introduction: "한줄 자기소개",
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 - 사용자 정보 */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 flex-shrink-0">
        <FriendListItem
          friend={friendData}
          onClick={handleFriendClick}
          isSelected={selectedFriend?.id === friendData.id}
        />
        <button
          onClick={handleSlideClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
          <svg
            className="w-6 h-6 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* 채팅 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 ">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "current_user_id" ? "justify-end" : "justify-start"
            }`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.sender === "current_user_id"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}>
              {/* 최초 신청 메시지 표시 */}
              {msg.isInitial && (
                <div className="text-xs opacity-75 mb-1">동행 신청 메시지</div>
              )}
              <p className="text-sm">{msg.message}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.sender === "current_user_id"
                    ? "text-blue-100"
                    : "text-gray-500"
                }`}>
                {msg.timestamp.toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 영역 - 맨 아래 고정 */}
      <div className="border-t border-gray-200 p-3 flex-shrink-0">
        {/* 대기중 신청의 경우 수락/거절 버튼 */}
        {chatRequestData.status === "pending" && (
          <div className="flex gap-2 mb-3">
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors">
              {isProcessing ? "처리 중..." : "거절"}
            </button>
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
              {isProcessing ? "처리 중..." : "수락"}
            </button>
          </div>
        )}

        {/* 메시지 입력창 */}
        <div className="relative">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
            className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 pr-16  focus:ring-blue-500 focus:border-blue-500 outline-none scrollbar-hide"
            rows="2"
            style={{
              height: "100px",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          />
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="absolute bottom-2 right-2 px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
            전송
          </button>
        </div>
      </div>
    </div>
  );
}
