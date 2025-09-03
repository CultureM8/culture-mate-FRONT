"use client";
import { useState, useEffect, useContext } from "react";

import TogetherMessage from "@/components/mypage/TogetherManagement/TogetherMessage";
import { togetherData } from "@/lib/togetherData";
import { getUnreadChatRequestsCount } from "@/lib/chatRequestUtils";
import { LoginContext } from "@/components/auth/LoginProvider";
import MyTogether from "@/components/mypage/TogetherManagement/MyTogether";

export default function TogetherManagePage() {
  const [activeTab, setActiveTab] =
    useState("together"); /* 'together' | 'message'*/
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const { user } = useContext(LoginContext);
  8;
  const currentUserId = user?.id || user?.user_id;
  8;

  useEffect(() => {
    if (!currentUserId) return;
    8;

    /* 읽지 않은 메시지 개수 로드*/
    const loadUnreadCount = () => {
      const count = getUnreadChatRequestsCount(currentUserId);
      setUnreadMessageCount(count);
      console.log("읽지 않은 메시지 개수:", count);
      console.log("사용자 ID:", currentUserId);
    };

    loadUnreadCount();

    /* 주기적으로 읽지 않은 메시지 개수 업데이트 */
    const interval = setInterval(loadUnreadCount, 10000); /* 10초마다*/

    return () => clearInterval(interval);
  }, [currentUserId, activeTab]);

  const eventsData = togetherData.slice(0, 10).map((item, index) => ({
    ...item,
    id: item.togetherId || `event_${index}`,
  })); /* 예시로 처음 10개만 표시*/

  /*더미 친구 데이터 (추후 API로 대체)*/
  const friendsData = [
    {
      id: 1,
      name: "이용자1",
      introduction: "한줄 자기소개 한줄 자기소개 한줄 자기소개 한줄 자기소개",
      profileImage: null,
      backgroundImage: null,
      age: "25 세",
      gender: "여",
      mbti: "ENFP",
      interests: ["영화", "연극", "전시", "콘서트/페스티벌"],
      tags: "#신촌 #맛집탐방 #전시회 #영화관람 #드라이브 #야경감상",
      galleryImages: [null, null, null, null, null, null],
      isHost: true,
    },
    {
      id: 2,
      name: "이용자2",
      introduction: "안녕하세요! 문화생활을 좋아하는 사람입니다.",
      profileImage: null,
      backgroundImage: null,
      age: "28 세",
      gender: "남",
      mbti: "INFJ",
      interests: ["뮤지컬", "클래식", "미술관", "독립영화"],
      tags: "#홍대 #카페투어 #뮤지컬 #클래식음악 #미술관투어 #독서모임",
      galleryImages: [null, null, null, null, null, null],
      isHost: false,
    },
    {
      id: 3,
      name: "이용자3",
      introduction: "함께 즐거운 시간을 보내요~",
      profileImage: null,
      backgroundImage: null,
      age: "23 세",
      gender: "여",
      mbti: "ESFP",
      interests: ["페스티벌", "댄스", "팝업스토어", "브런치"],
      tags: "#강남 #페스티벌 #댄스 #팝업스토어 #브런치카페 #쇼핑",
      galleryImages: [null, null, null, null, null, null],
      isHost: false,
    },
    {
      id: 4,
      name: "이용자4",
      introduction: "새로운 경험을 좋아합니다!",
      profileImage: null,
      backgroundImage: null,
      age: "30 세",
      gender: "남",
      mbti: "INTJ",
      interests: ["전시회", "강연", "독서모임", "영화제"],
      tags: "#종로 #전시회 #강연 #독서 #영화제 #토론",
      galleryImages: [null, null, null, null, null, null],
      isHost: false,
    },
    {
      id: 5,
      name: "이용자5",
      introduction: "예술과 문화를 사랑하는 사람이에요",
      profileImage: null,
      backgroundImage: null,
      age: "26 세",
      gender: "여",
      mbti: "ISFP",
      interests: ["갤러리", "공연", "워크샵", "마켓"],
      tags: "#성수동 #갤러리투어 #공연관람 #워크샵 #플리마켓 #핸드메이드",
      galleryImages: [null, null, null, null, null, null],
      isHost: false,
    },
    {
      id: 6,
      name: "이용자6",
      introduction: "음악과 함께하는 일상을 즐겨요",
      profileImage: null,
      backgroundImage: null,
      age: "27 세",
      gender: "남",
      mbti: "ESTP",
      interests: ["콘서트", "라이브", "클럽", "음악축제"],
      tags: "#홍대 #콘서트 #라이브음악 #클럽 #음악축제 #밴드",
      galleryImages: [null, null, null, null, null, null],
      isHost: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#26282a] font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif]">
            내 동행관리
          </h1>
        </div>

        {/* 탭 메뉴 */}
        <div className="mb-2">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("together")}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "together"
                  ? "text-[#26282a] border-[#26282a]"
                  : "text-[#76787a] border-transparent hover:text-[#26282a]"
              } font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif]`}>
              나의 소속 동행
            </button>
            <button
              onClick={() => setActiveTab("message")}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "message"
                  ? "text-[#26282a] border-[#26282a]"
                  : "text-[#76787a] border-transparent hover:text-[#26282a]"
              } font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] relative`}>
              동행채팅
              {unreadMessageCount > 0 && (
                <span className="absolute -top-1 -right-1 px-2 py-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center">
                  {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 탭별 컨텐츠 */}
        {activeTab === "together" ? (
          <MyTogether eventsData={eventsData} friendsData={friendsData} />
        ) : (
          <TogetherMessage />
        )}
      </div>
    </div>
  );
}
