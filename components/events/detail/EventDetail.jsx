"use client";

import Image from "next/image";
import { IMAGES } from "@/constants/path";
import { useMemo, useState } from "react";

const toAbsoluteUrl = (url) => {
  if (!url || typeof url !== "string") return IMAGES.GALLERY_DEFAULT_IMG;
  const s = url.trim();
  if (s.length === 0) return IMAGES.GALLERY_DEFAULT_IMG;
  if (s.startsWith("http")) return s;
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
  return `${base}${s}`;
};

export default function EventDetail({ eventData }) {
  if (!eventData) {
    return (
      <article className="w-[800px] flex flex-col mx-auto pt-6">
        <div className="text-gray-500">
          이벤트 상세 정보를 불러올 수 없습니다.
        </div>
      </article>
    );
  }

  const title = eventData.title || "";

  const mainInitial = useMemo(() => {
    const src =
      eventData.imgSrc && eventData.imgSrc.trim() !== ""
        ? toAbsoluteUrl(eventData.imgSrc)
        : IMAGES.GALLERY_DEFAULT_IMG;
    return src;
  }, [eventData.imgSrc]);

  const [mainSrc, setMainSrc] = useState(mainInitial);

  const contentImages = useMemo(() => {
    if (!Array.isArray(eventData.contentImageUrls)) return [];
    return eventData.contentImageUrls
      .filter((u) => typeof u === "string" && u.trim().length > 0)
      .map((u) => toAbsoluteUrl(u));
  }, [eventData.contentImageUrls]);

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

      <div>
        <Image
          src={mainSrc}
          width={800}
          height={600}
          alt={mainAlt}
          className="w-full h-auto"
          onError={() => {
            if (mainSrc !== IMAGES.GALLERY_DEFAULT_IMG) {
              setMainSrc(IMAGES.GALLERY_DEFAULT_IMG);
            }
          }}
          priority={false}
        />
      </div>

      {contentImages.length > 0 && (
        <div className="mt-4">
          {contentImages.map((abs, index) => (
            <div key={index} className="mb-4">
              <Image
                src={abs}
                width={800}
                height={600}
                alt={`${title || "이벤트"} 상세 이미지 ${index + 1}`}
                className="w-full h-auto"
                onError={(e) => {
                  // 무한 루프 방지
                  const img = e.currentTarget;
                  if (img.getAttribute("data-fallback") === "1") return;
                  img.setAttribute("data-fallback", "1");
                  img.src = IMAGES.GALLERY_DEFAULT_IMG;
                }}
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
