"use client";
import { useState, useEffect, useMemo } from "react";
import PostEventMiniCard from "@/components/global/PostEventMiniCard";
import FriendListItem from "@/components/mypage/FriendListItem";
import FriendProfileSlide from "@/components/mypage/FriendProfileSlide";
import { getEventById } from "@/lib/eventData";
import { togetherData } from "@/lib/togetherData";

export default function MyTogether({ eventsData, friendsData }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isSlideVisible, setIsSlideVisible] = useState(false);
  const [isFriendProfileVisible, setIsFriendProfileVisible] = useState(false);
  const [eventDataMap, setEventDataMap] = useState(new Map());
  const [filterStatus, setFilterStatus] = useState("all");

  /* 이벤트 데이터 가져오기*/
  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventsData || eventsData.length === 0) return;

      const eventDataPromises = eventsData.map(async (event) => {
        if (event.eventId) {
          try {
            const eventInfo = await getEventById(event.eventId);
            return [event.eventId, eventInfo];
          } catch (error) {
            console.error(
              `이벤트 데이터를 가져오는데 실패했습니다 (ID: ${event.eventId}):`,
              error
            );
            return [event.eventId, null];
          }
        }
        return [event.eventId, null];
      });

      const results = await Promise.all(eventDataPromises);
      const newEventDataMap = new Map(results);
      setEventDataMap(newEventDataMap);
    };

    fetchEventData();
  }, [eventsData]);

  // 호스트/게스트/전체 필터링
  const filteredFriends = useMemo(() => {
    if (!friendsData || friendsData.length === 0) return [];
    switch (filterStatus) {
      case "host":
        return friendsData.filter((f) => f.isHost === true);
      case "guest":
        return friendsData.filter((f) => f.isHost === false);
      default:
        return friendsData;
    }
  }, [friendsData, filterStatus]);

  /* 이벤트 클릭 핸들러*/
  const handleEventClick = (eventData) => {
    setSelectedEvent(eventData);
    setSelectedFriend(null); /* 친구 프로필 초기화*/
    setIsFriendProfileVisible(false);
    setIsSlideVisible(true);
  };

  /* 친구 클릭 핸들러*/
  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
    setIsFriendProfileVisible(true);
  };

  /* 슬라이드 닫기 핸들러*/
  const handleSlideClose = () => {
    setIsSlideVisible(false);
    setIsFriendProfileVisible(false);
    setTimeout(() => {
      setSelectedEvent(null);
      setSelectedFriend(null);
    }, 300);
  };

  /* 친구 프로필에서 뒤로가기 핸들러*/
  const handleBackToFriendList = () => {
    setIsFriendProfileVisible(false);
    setSelectedFriend(null);
  };

  /* PostEventMiniCard용 데이터 변환 함수 */
  const transformEventData = (postData) => {
    const eventInfo = eventDataMap.get(postData.eventId);

    /* 같은 이벤트에 대한 동행 모집글 개수 계산 */
    const registeredPostsCount = togetherData.filter(
      (post) => post.eventId === postData.eventId
    ).length;

    return {
      eventImage: postData.imgSrc,
      eventType: postData.eventType,
      eventName: postData.eventName,
      description:
        "이벤트 설명에 대한 내용이 들어갑니다. 두 줄 넘어가면 나머지는 ...으로 표기",
      recommendations: eventInfo?.likesCount || 0,
      starScore: eventInfo?.score || 0,
      initialLiked: false,
      registeredPosts: registeredPostsCount,
    };
  };

  return (
    <>
      {/* 필터 버튼 */}

      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-4 py-2 rounded-lg text-xs  transition-colors ${
            filterStatus === "all"
              ? "bg-blue-500 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}>
          전체
        </button>
        <button
          onClick={() => setFilterStatus("host")}
          className={`px-4 py-2 rounded-lg text-xs  transition-colors ${
            filterStatus === "host"
              ? "bg-blue-500 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}>
          호스트 동행
        </button>
        <button
          onClick={() => setFilterStatus("guest")}
          className={`px-4 py-2 rounded-lg text-xs  transition-colors ${
            filterStatus === "guest"
              ? "bg-blue-500 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}>
          게스트 동행
        </button>
      </div>

      <div className="flex gap-0 max-h-[800px] min-h-[600px]">
        {/* 이벤트 목록 */}
        <div
          className={`
        transition-all duration-300 ease-in-out
        ${isSlideVisible ? "w-1/2" : "w-full"}
      `}>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full">
            {eventsData && eventsData.length > 0 ? (
              <div className="space-y-0 overflow-y-auto h-full">
                {eventsData.map((event) => (
                  <div
                    key={event.togetherId || event.id}
                    onClick={() => handleEventClick(event)}
                    className={`
                    cursor-pointer transition-colors duration-200
                    ${
                      selectedEvent?.togetherId === event.togetherId ||
                      selectedEvent?.id === event.id
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : "hover:bg-gray-50"
                    }
                  `}>
                    <PostEventMiniCard
                      {...transformEventData(event)}
                      alt={`${event.eventName} 이미지`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-[#76787a] font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif]">
                  <p className="text-lg mb-2">아직 이벤트 목록이 없네요</p>
                  <p className="text-sm">새로운 이벤트에 참여해보세요!</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 슬라이드 영역 (친구 목록 &친구 프로필) */}
        <div
          className={`
        transition-all duration-300 ease-in-out overflow-hidden
        ${isSlideVisible ? "w-1/2" : "w-0"}
      `}>
          <div className="w-full h-full bg-white rounded-lg shadow-sm ml-2">
            {/*프로필창 */}
            {isFriendProfileVisible ? (
              <div className="relative w-full h-full">
                {/* 뒤로가기 버튼 */}
                <div className="absolute top-4 left-4 z-10">
                  <button
                    onClick={handleBackToFriendList}
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

                {/* 친구 프로필 컴포넌트 */}
                <FriendProfileSlide
                  friend={selectedFriend}
                  isVisible={isFriendProfileVisible}
                  onClose={handleSlideClose}
                />
              </div>
            ) : (
              /* 참여 친구 목록창 */
              <>
                {/* 슬라이드 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div>
                    <h2 className="text-lg font-semibold text-[#26282a] font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif]">
                      참여 동행 멤버
                    </h2>
                    <p className="text-sm text-[#76787a] font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif]">
                      {selectedEvent?.eventName || "이벤트"}의 참여자들
                    </p>
                  </div>
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

                {/* 친구 목록 */}
                <div className="overflow-y-auto h-[calc(100%-80px)]">
                  {filteredFriends && filteredFriends.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {filteredFriends.map((friend) => (
                        <FriendListItem
                          key={friend.id}
                          friend={friend}
                          onClick={handleFriendClick} // 친구 클릭 시 프로필 표시
                          isSelected={selectedFriend?.id === friend.id}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="text-[#76787a] font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif]">
                        <p className="text-lg mb-2">참여 멤버가 없습니다</p>
                        <p className="text-sm">첫 번째 참여자가 되어보세요!</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
