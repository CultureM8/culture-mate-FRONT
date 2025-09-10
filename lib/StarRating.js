"use client";

import { ICONS } from "@/constants/path";
import Image from "next/image";
import { useState } from "react";

export default function StarRating({
  rating = 0,
  onRatingChange,
  readonly = false,
}) {
  const MAX = 5;
  const [hoverRating, setHoverRating] = useState(0);

  // 0~5로 클램프 + 1단위로 반올림
  const currentRating = Math.round(Math.max(0, Math.min(MAX, Number(rating))));
  const displayRating = hoverRating || currentRating;

  const full = displayRating;

  const handleStarClick = (starIndex, event) => {
    if (readonly) return;

    // 1단위로 별점 설정 (클릭한 별의 인덱스 + 1)
    const clickedValue = starIndex + 1;

    if (onRatingChange) {
      onRatingChange(Math.max(1, clickedValue)); // 최소값 1 보장
    }
  };

  const handleStarHover = (starIndex, event) => {
    if (readonly) return;

    // 1단위로 호버 표시 (마우스 올린 별의 인덱스 + 1)
    const hoverValue = starIndex + 1;
    setHoverRating(Math.max(1, hoverValue)); // 최소값 1 보장
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };

  return (
    <div
      className={`flex items-center ${readonly ? "gap-0" : "gap-1"}`}
      aria-label={`평점 ${displayRating} / ${MAX}`}
      onMouseLeave={handleMouseLeave}>
      {Array.from({ length: MAX }, (_, i) => {
        const key = `star-${i}`;
        let starType = ICONS.STAR_EMPTY;

        if (i < full) {
          starType = ICONS.STAR_FULL;
        }

        return (
          <div
            key={key}
            className={`inline-block ${readonly ? "px-0.5" : "px-2"} ${
              readonly ? "" : "cursor-pointer"
            }`}
            onClick={(e) => handleStarClick(i, e)}
            onMouseMove={(e) => handleStarHover(i, e)}>
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
      <span
        className={`text-sm text-gray-600 font-medium w-8 text-center ${
          readonly ? "ml-1" : "ml-2"
        }`}>
        {displayRating === 0 ? "0" : displayRating.toString()}
      </span>
    </div>
  );
}
