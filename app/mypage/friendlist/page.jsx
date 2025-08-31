"use client"

import { useState } from "react";
import FriendListItem from "@/components/mypage/FriendListItem";
import FriendProfileSlide from "@/components/mypage/FriendProfileSlide";
import PageTitle from "@/components/global/PageTitle";

export default function FriendListPage() {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isSlideVisible, setIsSlideVisible] = useState(false);

  // 더미 친구 데이터 (추후 API로 대체)
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
      galleryImages: [null, null, null, null, null, null]
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
      galleryImages: [null, null, null, null, null, null]
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
      galleryImages: [null, null, null, null, null, null]
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
      galleryImages: [null, null, null, null, null, null]
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
      galleryImages: [null, null, null, null, null, null]
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
      galleryImages: [null, null, null, null, null, null]
    }
  ];

  // 친구 클릭 핸들러
  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
    setIsSlideVisible(true);
  };

  // 슬라이드 닫기 핸들러
  const handleSlideClose = () => {
    setIsSlideVisible(false);
    setTimeout(() => {
      setSelectedFriend(null);
    }, 300);
  };

  return (
    <>
      <PageTitle>내 동행관리</PageTitle>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* 탭 메뉴 */}
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button className="px-6 py-3 text-[#26282a] font-medium border-b-2 border-[#26282a] font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif]">
                내 소속 동행
              </button>
              <button className="px-6 py-3 text-[#76787a] font-medium font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] hover:text-[#26282a] transition-colors">
                동행자 프로필
              </button>
              <button className="px-6 py-3 text-[#76787a] font-medium font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] hover:text-[#26282a] transition-colors">
                동행관리
              </button>
            </div>
          </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="flex gap-0 h-[calc(100vh-200px)]">
          {/* 왼쪽: 동행 목록 */}
          <div className={`
            transition-all duration-300 ease-in-out
            ${isSlideVisible ? 'w-1/2' : 'w-full'}
          `}>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full">
              {friendsData.length > 0 ? (
                <div className="divide-y divide-gray-200 overflow-y-auto h-full">
                  {friendsData.map((friend) => (
                    <FriendListItem
                      key={friend.id}
                      friend={friend}
                      onClick={handleFriendClick}
                      isSelected={selectedFriend?.id === friend.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-[#76787a] font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif]">
                    <p className="text-lg mb-2">아직 동행 목록이 없네요</p>
                    <p className="text-sm">새로운 동행에 참여해보세요!</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 슬라이드 영역 */}
          <div className={`
            transition-all duration-300 ease-in-out overflow-hidden
            ${isSlideVisible ? 'w-1/2' : 'w-0'}
          `}>
            <div className="w-full h-full">
              <FriendProfileSlide
                friend={selectedFriend}
                isVisible={isSlideVisible}
                onClose={handleSlideClose}
              />
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}