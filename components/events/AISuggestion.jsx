"use client";

import { ICONS } from "@/constants/path";
import Image from "next/image";
import { useState, useCallback, useMemo, useEffect } from "react";

// AI 추천 이벤트 목록 (더미 데이터)
const suggestionList = [
  { id: 1, imgSrc: "/img/default_img.svg", alt: "제목-1", title: "제목-1", date: "0000-00-00 ~ 0000-00-00" },
  { id: 2, imgSrc: "/img/default_img.svg", alt: "제목-2", title: "제목-2", date: "0000-00-00 ~ 0000-00-00" },
  { id: 3, imgSrc: "/img/default_img.svg", alt: "제목-3", title: "제목-3", date: "0000-00-00 ~ 0000-00-00" },
  { id: 4, imgSrc: "/img/default_img.svg", alt: "제목-4", title: "제목-4", date: "0000-00-00 ~ 0000-00-00" },
  { id: 5, imgSrc: "/img/default_img.svg", alt: "제목-5", title: "제목-5", date: "0000-00-00 ~ 0000-00-00" },
  { id: 6, imgSrc: "/img/default_img.svg", alt: "제목-6", title: "제목-6", date: "0000-00-00 ~ 0000-00-00" },
  { id: 7, imgSrc: "/img/default_img.svg", alt: "제목-7", title: "제목-7", date: "0000-00-00 ~ 0000-00-00" },
  { id: 8, imgSrc: "/img/default_img.svg", alt: "제목-8", title: "제목-8", date: "0000-00-00 ~ 0000-00-00" },
];

// 개별 이벤트 카드 컴포넌트
function EventCard({ imgSrc, alt, title, date, isCenter, onClick }) {
  return (
    <div 
      className={`shrink-0 flex flex-col justify-center items-center transition-all duration-700 ease-out cursor-pointer ${
        isCenter 
          ? "scale-100 z-20 hover:scale-[1.02]" 
          : "scale-90 z-10 hover:scale-[0.93]"
      }`}
      onClick={onClick}
    >
      <div 
        className="relative rounded-xl overflow-hidden shadow-2xl transition-all duration-700"
        style={{ width: '172px', height: '240px' }}
      >
        <Image
          src={imgSrc}
          alt={alt}
          fill
          className="object-cover"
        />
        {!isCenter && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
        )}

      </div>

      <div className={`pt-1.5 text-center transition-all duration-700`}>
        <h3 className={`font-bold truncate transition-all duration-700 ${
          isCenter ? "" : "text-sm text-gray-700" }`}
        >
          {title}
        </h3>
        <p className={`mt-1 transition-all duration-700 ${
          isCenter 
            ? "text-sm text-gray-600" 
            : "text-xs text-gray-500"
        }`}>
          {date}
        </p>
      </div>
    </div>
  );
}

// AI 추천 이벤트 슬라이더 메인 컴포넌트
export default function AISuggestion() {
  // 현재 중앙에 위치한 카드의 인덱스
  const [currentIndex, setCurrentIndex] = useState(0);

  // 자동으로 다음 이미지로 넘어가는 기능
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % suggestionList.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 화면에 표시될 5개 카드 계산 (현재 카드 기준 앞뒤 2개씩)
  const displayItems = useMemo(() => {
    const items = [];
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + suggestionList.length) % suggestionList.length;
      items.push(suggestionList[index]);
    }
    return items;
  }, [currentIndex]);

  return (
    <div>
      {/* 배경 이미지 (현재 선택된 카드의 이미지를 흐리게 표시) */}
      <div className="absolute left-1/2 top-[112px] -translate-x-1/2 w-screen h-[370px] z-0">
        <Image
          src={suggestionList[currentIndex].imgSrc}
          alt={suggestionList[currentIndex].alt}
          fill
          className="object-cover opacity-50"
        />
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="relative z-10 h-[370px] flex flex-col items-center justify-between py-3">
        {/* AI 추천 헤더 */}
        <div className="flex gap-2 items-center justify-center">
          <Image
            src={ICONS.AI}
            alt="AI추천"
            width={24}
            height={24}
          />
          <h2 className="text-lg font-bold text-gray-800" style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)' }}>AI 추천</h2>
        </div>

        {/* 카드 슬라이더 영역 */}
        <div className="w-full flex items-center justify-center relative h-[320px]">

          {/* 5개 카드 컨테이너 */}
          <div className="flex items-center justify-center gap-x-8 px-2">
            {displayItems.map((event, index) => (
              <EventCard
                key={`${event.id}-${index}`}
                imgSrc={event.imgSrc}
                alt={event.alt}
                title={event.title}
                date={event.date}
                isCenter={index === 2}
                onClick={() => {
                  // 클릭한 카드가 중앙(index=2)이 아니면 해당 카드를 중앙으로 이동
                  if (index !== 2) {
                    const targetIndex = (currentIndex + (index - 2) + suggestionList.length) % suggestionList.length;
                    setCurrentIndex(targetIndex);
                  }
                }}
              />
            ))}
          </div>

        
          {/* 전체 진행바 배경 */}
          <div className="absolute bottom-0 w-48 h-2 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
            {/* 진행바 트랙 */}
            <div className="w-full h-full bg-white/20 rounded-full relative">
              {/* 현재 위치 표시바 */}
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-transform duration-700 ease-out"
                style={{
                  width: `${suggestionList?.length ? 100 / suggestionList.length : 100}%`,
                  transform: `translateX(${currentIndex * 100}%)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}