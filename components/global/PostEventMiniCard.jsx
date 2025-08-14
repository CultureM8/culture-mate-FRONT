"use client"

import { useState } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";

export default function PostEventMiniCard({
  eventImage = "/img/default_img.svg", // 기본 디폴트 이미지
  eventType = "이벤트 유형",
  eventName = "이벤트명",
  description = "이벤트 설명에 대한 내용을 둘 줄 정도로 작성 가능할 경우의 글자수 길이로 보입니다. 콘서트, 뮤지컬 등의 행사에 해당하는 설명입니다...",
  recommendations = 0, // 추천
  starScore = 0, // 별점
  initialLiked = false, // 초기 좋아요
  registeredPosts = 0, // 등록된 게시물
  alt = "event-image"
}) {
  const [isLiked, setIsLiked] = useState(initialLiked);

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    // TODO: 백엔드 API 호출로 좋아요 상태 업데이트
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden w-full">
      {/* 가로 레이아웃: 이미지 왼쪽 + 콘텐츠 오른쪽 */}
      <div className="flex">
        {/* 왼쪽 이미지 영역 - 세로 가운데 정렬 */}
          <div className="w-32 h-40 bg-white flex-shrink-0 p-2">
            <div className="relative w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element 이미지 경고제거 주석*/}
              <Image
                src={eventImage}
                alt={alt}
                fill
                className="object-cover rounded"
              />
            </div>
          </div>
        
        {/* 오른쪽 콘텐츠 영역 */}
        <div className="flex-1 p-4">
          {/* 상단: 이벤트 타입과 이름 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full border">
              {eventType}
            </span>
            <span className="text-gray-600 text-sm font-medium">
              {eventName}
            </span>
          </div>
          
          {/* 설명 */}
          <p className="text-gray-800 text-sm leading-relaxed mb-3 line-clamp-2">
            {description}
          </p>
          
          {/* 통계 정보 - 한 줄로 배치 */}
          <div className="flex items-center gap-4 mb-3">
            {/* 추천 수 */}
            <div className="flex items-center gap-1">
              <Image 
                src={ICONS.THUMBSUP_FULL} 
                alt="recommendations" 
                width={16} 
                height={16} 
              />
              <span className="text-sm text-gray-600">
                추천 · {recommendations.toLocaleString()}명
              </span>
            </div>
            
            {/* 별점 - 별 1개만 표시 */}
            <div className="flex items-center gap-1">
              <Image 
                src={ICONS.STAR_FULL} 
                alt="star" 
                width={16} 
                height={16} 
              />
              <span className="text-sm text-gray-600">
                {starScore.toFixed(1)}
              </span>
            </div>
            
            {/* 관심 버튼 */}
            <button 
              onClick={handleLikeToggle}
              className="flex items-center gap-1 p-1 hover:bg-gray-50 rounded-full transition-colors duration-200"
            >
              <Image
                src={isLiked ? ICONS.HEART : ICONS.HEART_EMPTY}
                alt="like"
                width={16}
                height={16}
                className={isLiked ? "text-red-500" : "text-gray-400"}
              />
              <span className="text-sm text-gray-600">관심</span>
            </button>
          </div>
          
          {/* 등록된 동행 수 */}
          <div className="flex items-center gap-2">
            <Image 
              src={ICONS.FILTER} 
              alt="filter" 
              width={16} 
              height={16} 
            />
            <span className="text-xs text-gray-500">
              등록된 동행 · {registeredPosts.toLocaleString()}개
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}