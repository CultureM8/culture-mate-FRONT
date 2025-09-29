"use client";

import Image from "next/image";
import Gallery from "@/components/global/Gallery";
import { ICONS } from "@/constants/path";
import StarRating from "@/components/ui/StarRating";
import { getEventMainImageUrl } from "@/lib/utils/imageUtils";

/** location fallback */
const toLocation = (data) => {
  const level1 =
    typeof data?.region?.level1 === "string" ? data.region.level1.trim() : "";
  const level2 =
    typeof data?.region?.level2 === "string" ? data.region.level2.trim() : "";
  const level3 =
    typeof data?.region?.level3 === "string" ? data.region.level3.trim() : "";

  const city =
    typeof data?.region?.city === "string" ? data.region.city.trim() : "";
  const district =
    typeof data?.region?.district === "string"
      ? data.region.district.trim()
      : "";

  const parts =
    level1 || level2 || level3
      ? [level1, level2, level3].filter(Boolean)
      : [city, district].filter(Boolean);

  if (parts.length > 0) return parts.join(" ");
  if (data?.eventLocation && data.eventLocation.trim() !== "")
    return data.eventLocation;
  return "미정";
};

export default function EventGallery({
  eventData,
  useHighQuality = false,
  ...props
}) {
  const data = eventData || {
    id: props.id ?? props.eventId,
    eventId: props.eventId ?? props.id,
    isInterested: props.isInterested,
    title: props.title || "제목",
    imgSrc: props.imgSrc,
    alt: props.alt,
    href: props.href || "",
    startDate: props.startDate || "0000.00.00",
    endDate: props.endDate || "0000.00.00",
    location: props.location || "지역 및 장소명",
    score: props.score || 0,
    avgRating: props.avgRating || 0,
    enableInterest: props.enableInterest !== false,
    disableEventSync: props.disableEventSync || false,
  };

  const ratingValue = Number(data.score || data.avgRating || 0);
  const imageSrc = getEventMainImageUrl(data, useHighQuality);
  const altText =
    (typeof data?.alt === "string" && data.alt.trim()) ||
    (typeof data?.title === "string" && data.title.trim()) ||
    "이미지";

  const eventIdStr = String(data.id ?? data.eventId ?? "");

  return (
    <div className="relative">
      {/*  편집 모드일 때 카드 전체 선택 오버레이 */}
      {props.editMode && (
        <>
          <button
            type="button"
            className="absolute inset-0 z-40"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              props.onToggleSelect?.();
            }}
            aria-label="select-card"
          />
          <div className="absolute top-2 right-2 z-50">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                props.selected
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white/90 text-gray-600 border-gray-300"
              }`}>
              {props.selected ? "✓" : ""}
            </div>
          </div>
        </>
      )}

      <Gallery
        title={data.title}
        src={imageSrc}
        alt={altText}
        href={data.href}
        enableInterest={data.enableInterest !== false}
        initialInterest={Boolean(data.isInterested)}
        eventId={eventIdStr}
        type="event"
        disableEventSync={Boolean(data.disableEventSync)}>
        <div className="flex gap-5 my-1">
          <div className="flex gap-1 items-center">
            <Image
              src={ratingValue > 0 ? ICONS.STAR_FULL : ICONS.STAR_EMPTY}
              alt="별점"
              width={20}
              height={20}
            />
            <StarRating
              rating={ratingValue}
              mode="average"
              showNumber={true}
              showStars={false}
            />
          </div>
          <div>
            {data.startDate} ~ {data.endDate}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {data.location || toLocation(data)}
        </div>
      </Gallery>
    </div>
  );
}
