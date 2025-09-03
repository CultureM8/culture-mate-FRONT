"use client";
import { useState, useEffect, useContext, useMemo } from "react";
import RequestChat from "@/components/mypage/TogetherManagement/RequestChat";
import {
  getChatRequestsForUser,
  updateChatRequestStatus,
  getUnreadChatRequestsCount,
} from "@/lib/chatRequestUtils";
import ChatRequestCard from "@/components/mypage/TogetherManagement/ChatRequestCard";
import { LoginContext } from "@/components/auth/LoginProvider";
import FriendProfileSlide from "@/components/mypage/FriendProfileSlide";

export default function TogetherMessage() {
  const [chatRequests, setChatRequests] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState("received");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isSlideVisible, setIsSlideVisible] = useState(false);
  const [isFriendProfileVisible, setIsFriendProfileVisible] = useState(false);

  const { user } = useContext(LoginContext);
  const currentUserId = user?.id || user?.user_id || user?.login_id;

  /* 목록/카운트 로드*/
  useEffect(() => {
    if (!currentUserId) return;

    const loadAll = () => {
      let requests = [];
      if (activeTab === "received") {
        requests = getChatRequestsForUser(currentUserId);
      } else {
        requests = []; /*보낸 신청 구현 시 대체*/
      }
      /*최신순 정렬*/
      requests.sort((a, b) => {
        const av = new Date(a.createdAt || 0).getTime();
        const bv = new Date(b.createdAt || 0).getTime();
        return bv - av;
      });
      setChatRequests(requests);

      const count = getUnreadChatRequestsCount(currentUserId);
      setUnreadCount(count);
    };

    loadAll();
    const interval = setInterval(loadAll, 5000);
    return () => clearInterval(interval);
  }, [activeTab, currentUserId]);

  /* 탭 바뀔 때 슬라이드/선택 리셋*/
  useEffect(() => {
    setIsSlideVisible(false);
    setIsFriendProfileVisible(false);
    setSelectedRequest(null);
    setSelectedFriend(null);
  }, [activeTab]);

  const handleAcceptRequest = async (requestId) => {
    try {
      await updateChatRequestStatus(requestId, "accepted");

      if (currentUserId) {
        const list = getChatRequestsForUser(currentUserId);
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setChatRequests(list);
        setUnreadCount(getUnreadChatRequestsCount(currentUserId));
      }
      alert("동행 신청을 수락했습니다!");
    } catch (e) {
      console.error(e);
      alert("신청 처리에 실패했습니다.");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await updateChatRequestStatus(requestId, "rejected");
      if (currentUserId) {
        const list = getChatRequestsForUser(currentUserId);
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setChatRequests(list);
        setUnreadCount(getUnreadChatRequestsCount(currentUserId));
      }
      alert("동행 신청을 거절했습니다.");
    } catch (e) {
      console.error(e);
      alert("신청 처리에 실패했습니다.");
    }
  };

  const handleOpenChat = (request) => {
    setSelectedRequest(request);
    setSelectedFriend(null);
    setIsFriendProfileVisible(false);
    setIsSlideVisible(true);
  };
  const handleOpenChatRoom = (request) => handleOpenChat(request);

  const handleSlideClose = () => {
    setIsSlideVisible(false);
    setIsFriendProfileVisible(false);
    setTimeout(() => {
      setSelectedRequest(null);
      setSelectedFriend(null);
    }, 300);
  };

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
    setIsFriendProfileVisible(true);
  };

  const handleBackToChat = () => {
    setIsFriendProfileVisible(false);
    setSelectedFriend(null);
  };

  const filteredRequests = useMemo(() => {
    return chatRequests.filter((request) =>
      filterStatus === "all" ? true : request.status === filterStatus
    );
  }, [chatRequests, filterStatus]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="flex justify-between mb-2">
        <span className="w-fit">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="text-xs px-2 py-2 border border-gray-300 rounded-lg bg-white text-[#26282a] focus:outline-none focus:border-[#26282a] focus:ring focus:ring-blue-500 min-w-[100px]">
            <option value="received">
              받은 신청{unreadCount > 0 ? ` (${unreadCount})` : ""}
            </option>
            {/* <option value="sent">보낸 신청</option> */}
          </select>
        </span>

        <span className="flex gap-2">
          {["all", "pending", "accepted", "rejected"].map((k) => (
            <button
              key={k}
              onClick={() => setFilterStatus(k)}
              className={`px-2 py-2 rounded-lg text-xs transition-colors min-w-[60px] ${
                filterStatus === k
                  ? "bg-blue-500 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}>
              {
                {
                  all: "전체",
                  pending: "대기중",
                  accepted: "수락됨",
                  rejected: "거절됨",
                }[k]
              }
            </button>
          ))}
        </span>
      </div>

      {/* 본문 */}
      <div className="flex gap-0 flex-1 max-h-[800px] min-h-[600px]">
        {/* 목록 */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isSlideVisible ? "w-1/2" : "w-full"
          }`}>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full">
            {filteredRequests.length > 0 ? (
              <div className="space-y-0 overflow-y-auto h-full">
                {filteredRequests.map((request) => (
                  <div
                    key={request.requestId}
                    onClick={() => handleOpenChat(request)}
                    className={`cursor-pointer transition-colors duration-200 ${
                      selectedRequest?.requestId === request.requestId
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : "hover:bg-gray-50"
                    }`}>
                    <ChatRequestCard
                      request={request}
                      onAccept={handleAcceptRequest}
                      onReject={handleRejectRequest}
                      onOpenChat={handleOpenChatRoom}
                      type={activeTab}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <div className="text-[#76787a] font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif]">
                  {activeTab === "received" ? (
                    <>
                      <p className="text-lg mb-2">받은 채팅 신청이 없습니다</p>
                      <p className="text-sm">
                        동행 모집글을 작성하여 신청을 받아보세요!
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg mb-2">보낸 채팅 신청이 없습니다</p>
                      <p className="text-sm">
                        관심있는 동행에 채팅을 신청해보세요!
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 슬라이드 (채팅 / 프로필) */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isSlideVisible ? "w-1/2" : "w-0"
          }`}>
          <div className="w-full h-full bg-white rounded-lg shadow-sm ml-2 flex flex-col">
            {isFriendProfileVisible ? (
              <div className="relative w-full h-full">
                <div className="absolute top-4 left-4 z-10">
                  <button
                    onClick={handleBackToChat}
                    className="p-2 bg-white hover:bg-gray-100 rounded-full shadow-md transition-colors duration-200">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                </div>

                <FriendProfileSlide
                  friend={selectedFriend}
                  isVisible={isFriendProfileVisible}
                  onClose={handleSlideClose}
                />
              </div>
            ) : (
              selectedRequest && (
                <div className="flex-1 flex flex-col min-h-0">
                  <RequestChat
                    chatRequestData={selectedRequest}
                    isOpen={isSlideVisible}
                    onClose={handleSlideClose}
                    onFriendClick={handleFriendClick}
                    onAccept={handleAcceptRequest}
                    onReject={handleRejectRequest}
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
