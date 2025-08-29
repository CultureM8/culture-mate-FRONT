"use client";

/**이벤트타일 */

import Image from "next/image";

import StarRating from "@/lib/StarRating";
import { ICONS } from "@/constants/path";

export default function EventTile({ card, onPick }) {
  const { eventImage, eventType, eventName, description, starScore = 0 } = card;

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
      <div className="mt-2 flex items-center gap-1 text-[12px] text-gray-700 whitespace-nowrap">
        <div className="scale-70 origin-left">
          <StarRating rating={starScore} readonly={true} />
        </div>
        <span className="text-gray-400">·</span>
      </div>
    </button>
  );
}
