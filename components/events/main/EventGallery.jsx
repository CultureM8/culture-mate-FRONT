import Image from "next/image";
import Gallery from "@/components/global/Gallery";
import { ICONS, IMAGES } from "@/constants/path";
import StarRating from "@/lib/StarRating";
import { getEventMainImageUrl } from "@/lib/utils/imageUtils";

/** location fallback */
const toLocation = (data) => {
  // 백엔드 RegionDto.Response 구조 (level1, level2, level3)
  const level1 =
    typeof data?.region?.level1 === "string" ? data.region.level1.trim() : "";
  const level2 =
    typeof data?.region?.level2 === "string" ? data.region.level2.trim() : "";
  const level3 =
    typeof data?.region?.level3 === "string" ? data.region.level3.trim() : "";

  // 기존 구조 호환성 (city, district)
  const city =
    typeof data?.region?.city === "string" ? data.region.city.trim() : "";
  const district =
    typeof data?.region?.district === "string"
      ? data.region.district.trim()
      : "";

  // level 구조를 우선 사용, 없으면 기존 구조 사용
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
  };

  const ratingValue = Number(data.score || data.avgRating || 0);
  const imageSrc = getEventMainImageUrl(data, useHighQuality);
  const altText =
    (typeof data?.alt === "string" && data.alt.trim()) ||
    (typeof data?.title === "string" && data.title.trim()) ||
    "이미지";

  return (
    <Gallery
      title={data.title}
      src={imageSrc}
      alt={altText}
      href={data.href}
      enableInterest={data.enableInterest !== false}
      initialInterest={Boolean(data.isInterested)}
      eventId={String(data.id ?? data.eventId)}>
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
  );
}
