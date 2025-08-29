"use client"; /**이벤트타일 */

import Image from "next/image";

import { getStarImage } from "./helpers";
import { ICONS } from "@/constants/path";

export default function EventTile({ card, onPick }) {
  const {
    eventImage,
    eventType,
    eventName,
    description,
    starScore = 0,
    recommendations = 0,
  } = card;

  return (
    <button
      onClick={() => onPick(card)}
      className="h-full w-full text-left border rounded-xl p-2 hover:shadow-md transition bg-white flex flex-col">
      <div className="w-full h-[160px] rounded-lg overflow-hidden bg-gray-100">
        <div className="relative w-full h-full">
          <Image
            src={eventImage}
            alt={eventName}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* 본문 */}
      <div className="mt-3 flex-1 min-h-0">
        <span className="inline-flex items-center px-2 py-0.5 text-[11px] rounded-full border text-blue-600 bg-blue-50">
          {eventType}
        </span>
        <div className="mt-1 font-semibold text-[15px] leading-tight line-clamp-1">
          {eventName}
        </div>
        <p className="mt-1 text-[12px] text-gray-600 leading-5 line-clamp-2">
          {description}
        </p>
      </div>

      {/* 별점 추천 */}
      <div className="mt-2 flex items-center gap-2 text-[12px] text-gray-700 whitespace-nowrap">
        <Image
          className="mb-[2px]"
          src={getStarImage(starScore)}
          alt="star"
          width={16}
          height={16}
        />
        <span>{Number(starScore).toFixed(1)}</span>
        <span className="text-gray-400">·</span>
        <span>
          <Image
            className="mb-[2px]"
            src={ICONS.THUMBSUP_FULL}
            alt="like"
            width={16}
            height={16}
          />
        </span>
        <span>{Number(recommendations).toLocaleString()}</span>
      </div>
    </button>
  );
}
