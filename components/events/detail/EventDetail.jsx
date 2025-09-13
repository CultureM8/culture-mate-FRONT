"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  getEventMainImageUrl,
  getEventContentImageUrls,
  handleImageError,
} from "@/lib/utils/imageUtils";

export default function EventDetail({ eventData }) {
  console.log("EventDetail - received eventData:", eventData);

  if (!eventData) {
    console.log("EventDetail - no eventData provided");
    return (
      <article className="w-[800px] flex flex-col mx-auto pt-6">
        <div className="text-gray-500">
          이벤트 상세 정보를 불러올 수 없습니다.
        </div>
      </article>
    );
  }

  const title = eventData.title || "";
  const mainImageUrl = getEventMainImageUrl(eventData);
  const contentImages = getEventContentImageUrls(eventData);
  const [mainSrc, setMainSrc] = useState(mainImageUrl);

  /* eventData가 변경될 때 이미지 URL도 업데이트*/
  useEffect(() => {
    console.log("EventDetail - mainImageUrl updated:", mainImageUrl);
    setMainSrc(mainImageUrl);
  }, [mainImageUrl]);

  const mainAlt =
    (typeof eventData.alt === "string" && eventData.alt.trim()) ||
    (title && `${title} 메인 이미지`) ||
    "이벤트 이미지";

  return (
    <article className="w-[800px] flex flex-col mx-auto pt-6">
      {/* 제목 */}
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}

      {/* 본문 content */}
      {eventData.content && (
        <div className="mt-4 mb-4">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {eventData.content}
          </div>
        </div>
      )}

      {contentImages.length > 0 && (
        <div className="mt-4">
          {contentImages.map((imageUrl, index) => (
            <div key={index} className="mb-4">
              <Image
                src={imageUrl}
                width={800}
                height={600}
                alt={`${title || "이벤트"} 상세 이미지 ${index + 1}`}
                className="w-full h-auto"
                onError={handleImageError}
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
