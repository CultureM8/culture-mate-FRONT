"use client";

import { useState } from "react";
import Image from "next/image";
import { ICONS, IMAGES } from "@/constants/path";

export default function PopularCompanionCards({ cardData = [] }) {
  // 각 카드의 좋아요 상태 관리
  const [likedCards, setLikedCards] = useState({});

  // 하트 클릭 토글 함수
  const toggleHeart = (cardIndex) => {
    setLikedCards(prev => ({
      ...prev,
      [cardIndex]: !prev[cardIndex]
    }));
  };

  // 기본 빈 카드 데이터 (4개)
  const defaultCards = Array(4).fill(null).map((_, index) => ({
    id: index + 1,
    title: "",
    eventType: "",
    eventCategory: "",
    date: "",
    status: "",
    image: null // 이미지 필드 추가
  }));

  // cardData가 있으면 사용, 없으면 기본 빈 카드 사용
  const displayCards = cardData.length > 0 ? cardData : defaultCards;

  return (
    <div className="w-full flex justify-center">
      <div className="w-[1200px] py-8">
        <div className="flex justify-center gap-4">
        {displayCards.map((card, index) => (
          <div key={card.id} className="w-[290px]">
            <div className="w-[290px] h-[336px] p-2 relative">
              <div className="relative bg-white">
                {/* 이미지 영역 */}
                <div className="relative h-[206px] w-[274px] bg-[#eef0f2] rounded-xl flex items-center justify-center overflow-hidden">
                  {/* 실제 이미지가 있으면 표시, 없으면 로고 */}
                  {card.image ? (
                    <Image
                      src={card.image}
                      alt={card.title || "카드 이미지"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src={IMAGES.LOGO}
                      alt="culture-mate logo"
                      width={120}
                      height={40}
                      className="opacity-50"
                    />
                  )}
                  
                  {/* 하트 아이콘 - 우상단 */}
                  <div className="absolute top-2.5 right-2.5 z-20">
                    <button 
                      onClick={() => toggleHeart(index)}
                      className="w-6 h-6 flex items-center justify-center border-none outline-none transition-all duration-200"
                      style={{ 
                        background: 'none',
                        padding: 0,
                        margin: 0
                      }}
                    >
                      <Image
                        src={likedCards[index] ? ICONS.HEART : ICONS.HEART_EMPTY}
                        alt="heart"
                        width={30}
                        height={27}
                        style={{
                          filter: likedCards[index] 
                            ? 'none' 
                            : 'brightness(0) saturate(100%) invert(64%) sepia(8%) saturate(631%) hue-rotate(169deg) brightness(95%) contrast(88%)'
                        }}
                      />
                    </button>
                  </div>
                </div>

                {/* 컨텐츠 영역 */}
                <div className="w-[274px] px-2.5 py-0 flex flex-col gap-2 mt-2">
                  {/* 제목 */}
                  <div className="py-[3px]">
                    <h3 className="font-bold text-[18px] leading-[1.55] text-[#26282a]">
                      {card.title || "제목"}
                    </h3>
                  </div>
                  
                  {/* 이벤트 타입과 카테고리 */}
                  <div className="flex items-center gap-2 w-[254px]">
                    <span className="px-2 py-0 rounded-[15px] text-[16px] border border-[#76787a] text-[#9ea0a2]">
                      {card.eventType || "타입"}
                    </span>
                    <span className="text-[16px] w-32 overflow-hidden text-ellipsis whitespace-nowrap text-[#9ea0a2]">
                      {card.eventCategory || "카테고리"}
                    </span>
                  </div>
                  
                  {/* 날짜와 상태 */}
                  <div className="flex items-center gap-2 text-[16px] text-[#9ea0a2] w-[254px]">
                    <span className="w-24">{card.date || "0000-00-00"}</span>
                    <span className="w-16 overflow-hidden text-ellipsis whitespace-nowrap">{card.status || "0/0명"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
              </div>
      </div>
    </div>
  );
}