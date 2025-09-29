"use client";

import { ICONS } from "@/constants/path";
import Image from "next/image";
import { useState } from "react";

export default function StarRating({
  rating = 0,
  onRatingChange = null,
  mode = "display", // "display" | "input" | "average"
  size = 24,
  showNumber = true,
  showStars = true, // 별 아이콘 표시 여부
}) {
  const MAX = 5;
  const [hoverRating, setHoverRating] = useState(0);
  
  // mode별 동작 정의
  const isInputMode = mode === "input" && onRatingChange;
  const isAverageMode = mode === "average";
  const isDisplayMode = mode === "display";

  // 입력값 처리
  const inputValue = Number(rating) || 0;
  const clampedRating = Math.max(0, Math.min(MAX, inputValue));

  // 별 표시용 rating (정수)
  let starCount;
  if (isInputMode) {
    // 입력 모드: 호버 또는 현재 선택된 값 (정수)
    starCount = hoverRating || Math.round(clampedRating);
  } else if (isAverageMode) {
    // 평균 모드: 평균값을 반올림해서 별 표시 (정수)
    starCount = Math.round(clampedRating);
  } else {
    // 표시 모드: 그대로 표시 (정수)
    starCount = Math.round(clampedRating);
  }

  // 숫자 표시용 rating
  let displayNumber;
  if (isInputMode) {
    // 입력 모드: 호버 중이면 호버값, 아니면 현재값 (정수)
    displayNumber = hoverRating || Math.round(clampedRating);
  } else if (isAverageMode) {
    // 평균 모드: 0.1단위로 표시
    displayNumber = clampedRating;
  } else {
    // 표시 모드: 정수로 표시
    displayNumber = Math.round(clampedRating);
  }

  // 이벤트 핸들러들
  const handleStarClick = (starIndex) => {
    if (!isInputMode) return;
    
    const clickedValue = starIndex + 1;
    if (onRatingChange) {
      onRatingChange(clickedValue);
    }
  };

  const handleStarHover = (starIndex) => {
    if (!isInputMode) return;
    
    const hoverValue = starIndex + 1;
    setHoverRating(hoverValue);
  };

  const handleMouseLeave = () => {
    if (!isInputMode) return;
    setHoverRating(0);
  };

  // 스타일 클래스
  const containerClass = `flex items-center ${isInputMode ? "gap-1" : "gap-0"}`;
  const starClass = `inline-block ${isInputMode ? "px-2 cursor-pointer" : "px-0.5"}`;

  return (
    <div
      className={containerClass}
      aria-label={`평점 ${displayNumber} / ${MAX}`}
      onMouseLeave={handleMouseLeave}>
      
      {/* 별 아이콘들 */}
      {showStars && Array.from({ length: MAX }, (_, i) => {
        const isFilled = i < starCount;
        const starIcon = isFilled ? ICONS.STAR_FULL : ICONS.STAR_EMPTY;
        
        return (
          <div
            key={`star-${i}`}
            className={starClass}
            onClick={() => handleStarClick(i)}
            onMouseMove={() => handleStarHover(i)}>
            <Image
              src={starIcon}
              alt={`별 ${i + 1}`}
              width={size}
              height={size}
              className="select-none"
            />
          </div>
        );
      })}
      
      {/* 숫자 표시 */}
      {showNumber && (
        <span className={`text-sm text-gray-600 font-medium ${
          showStars ? (isInputMode ? "ml-2" : "ml-1") : ""
        } ${showStars ? "w-8" : ""} text-center`}>
          {displayNumber === 0 
            ? "0" 
            : isAverageMode 
              ? displayNumber.toFixed(1)
              : displayNumber.toString()
          }
        </span>
      )}
    </div>
  );
}
