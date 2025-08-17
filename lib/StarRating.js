"use client"

import { ICONS } from "@/constants/path";
import Image from "next/image";
import { useState } from "react";

export default function StarRating({ rating = 0, onRatingChange, readonly = false }) {
  const MAX = 5;
  const [hoverRating, setHoverRating] = useState(0);

  // 0~5로 클램프 + 0.5단위로 반올림
  const currentRating = Math.round(Math.max(0, Math.min(MAX, Number(rating))) * 2) / 2;
  const displayRating = hoverRating || currentRating;

  const full = Math.floor(displayRating);
  const hasHalf = displayRating - full === 0.5;

  const handleStarClick = (starIndex, event) => {
    if (readonly) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const starWidth = rect.width;
    const leftPadding = 8; // 좌측 여백 8px
    
    // 좌측 여백 클릭 시 0점
    if (x < leftPadding) {
      if (onRatingChange) {
        onRatingChange(0);
      }
      return;
    }
    
    // 별 영역에서의 실제 클릭 위치 계산 (여백 제외)
    const adjustedX = x - leftPadding;
    const adjustedStarWidth = starWidth - (leftPadding * 2); // 좌우 여백 제외
    
    // 클릭한 위치가 별의 왼쪽 절반이면 0.5점, 오른쪽 절반이면 1점
    const clickedValue = starIndex + (adjustedX > adjustedStarWidth / 2 ? 1 : 0.5);
    
    if (onRatingChange) {
      onRatingChange(clickedValue);
    }
  };

  const handleStarHover = (starIndex, event) => {
    if (readonly) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const starWidth = rect.width;
    const leftPadding = 8;
    
    // 좌측 여백 호버 시 0점 표시
    if (x < leftPadding) {
      setHoverRating(0);
      return;
    }
    
    const adjustedX = x - leftPadding;
    const adjustedStarWidth = starWidth - (leftPadding * 2);
    
    const hoverValue = starIndex + (adjustedX > adjustedStarWidth / 2 ? 1 : 0.5);
    setHoverRating(hoverValue);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };

  return (
    <div 
      className="flex items-center gap-1" 
      aria-label={`평점 ${displayRating} / ${MAX}`}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: MAX }, (_, i) => {
        const key = `star-${i}`;
        let starType = ICONS.STAR_EMPTY;
        
        if (i < full) {
          starType = ICONS.STAR_FULL;
        } else if (i === full && hasHalf) {
          starType = ICONS.STAR_HALF;
        }

        return (
          <div
            key={key}
            className={`inline-block px-2 ${readonly ? "" : "cursor-pointer"}`}
            onClick={(e) => handleStarClick(i, e)}
            onMouseMove={(e) => handleStarHover(i, e)}
          >
            <Image 
              src={starType} 
              alt={`별 ${i + 1}`} 
              width={24} 
              height={24}
              className="select-none"
            />
          </div>
        );
      })}
      <span className="ml-2 text-sm text-gray-600 font-medium w-8 text-center">
        {displayRating === 0 ? "0.0" : displayRating.toFixed(1)}
      </span>
    </div>
  );
}