"use client"

import { useState } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";
import PostEventMiniCard from "@/components/global/PostEventMiniCard";

export default function TogetherRecruitmentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCount, setSelectedCount] = useState("00 명");
  const [locationQuery, setLocationQuery] = useState("");

  // 테스트용 더미 데이터
  const mockEventData = {
    eventImage: "/img/default_img.svg",
    eventType: "페스티벌", // 아무렇게나 쳐도 보이긴 하는데 일단은 냅둠
    eventName: "이벤트명",
    description: "이벤트 설명 최대 2줄 넘어가면 나머지는 ...으로 표기",
    recommendations: 500,
    starScore: 4.5,
    initialLiked: false,
    registeredPosts: 25
  };

  const handleSearch = () => {
    console.log("검색:", searchQuery);
  };

  const handleLocationSearch = () => {
    console.log("지역 검색:", locationQuery);
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-8 py-6">
        
        {/* 페이지 제목 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black">동행 모집</h1>
        </div>
        
        {/* 검색 필터 섹션 */}
        <div className="mb-8 space-y-4">
          {/* 이벤트 선택/추가 - 타원형, 여백 4분의 1 크기 */}
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-700 w-32 flex-shrink-0">이벤트 선택/추가</label>
            <div className="relative w-1/4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 px-4 pr-12 border border-gray-300 rounded-full bg-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="검색"
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <Image src={ICONS.SEARCH} alt="search" width={18} height={18} />
              </button>
            </div>
          </div>

          {/* 동행 날짜 - 밑줄 스타일, 여백 6분의 1 크기 */}
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-700 w-32 flex-shrink-0">동행 날짜</label>
            <div className="relative w-1/6">
              <input
                type="text"
                value="0000-00-00"
                className="w-full h-8 px-2 bg-transparent text-sm border-0 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                placeholder="0000-00-00"
                readOnly
              />
              <Image
                src={ICONS.CALENDAR}
                alt="calendar"
                width={16}
                height={16}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              />
            </div>
          </div>

          {/* 동행 인원 - 밑줄 스타일, 여백 6분의 1 크기 */}
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-700 w-32 flex-shrink-0">동행 인원</label>
            <div className="relative w-1/6">
              <select
                value={selectedCount}
                onChange={(e) => setSelectedCount(e.target.value)}
                className="w-full h-8 px-2 bg-transparent text-sm border-0 border-b border-gray-300 appearance-none focus:outline-none focus:border-blue-500"
              >
                <option value="00 명">00 명</option>
                <option value="1명">1명</option>
                <option value="2명">2명</option>
                <option value="3명">3명</option>
                <option value="4명">4명</option>
                <option value="5명+">5명+</option>
              </select>
              <Image
                src={ICONS.DOWN_ARROW}
                alt="dropdown"
                width={14}
                height={14}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
              />
            </div>
          </div>

          {/* 이벤트 주소 - 타원형, 여백 4분의 1 크기 */}
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-700 w-32 flex-shrink-0">이벤트 주소</label>
            <div className="relative w-1/4">
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full h-10 px-4 pr-12 border border-gray-300 rounded-full bg-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="검색"
              />
              <button
                onClick={handleLocationSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <Image src={ICONS.SEARCH} alt="search" width={18} height={18} />
              </button>
            </div>
          </div>
        </div>

        {/* PostEventMiniCard - 수정된 가로 리스트형으로 표시 */}
        <div className="mb-8">
          <PostEventMiniCard {...mockEventData} />
        </div>

        {/* 추가 컨텐츠 영역들 */}
        <div className="space-y-6 mb-8">
          <div className="w-full h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-lg">추가 컨텐츠 영역 #1</span>
          </div>
          
          <div className="w-full h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-lg">추가 컨텐츠 영역 #2</span>
          </div>
        </div>

      </div>
    </div>
  );
}