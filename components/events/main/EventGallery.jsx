import Image from "next/image";
import Gallery from "@/components/global/Gallery";
import { ICONS, IMAGES } from "@/constants/path";
import StarRating from "@/lib/StarRating";

/** 절대 URL */
const toAbsoluteUrl = (url) => {
  if (!url) return IMAGES.GALLERY_DEFAULT_IMG;
  if (typeof url === "string" && url.startsWith("http")) return url;
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
  return `${base}${url}`;
};

/** location fallback */
const toLocation = (data) => {
  const city =
    typeof data?.region?.city === "string" ? data.region.city.trim() : "";
  const district =
    typeof data?.region?.district === "string"
      ? data.region.district.trim()
      : "";
  if (city || district) return `${city} ${district}`.trim();
  if (data?.eventLocation && data.eventLocation.trim() !== "")
    return data.eventLocation;
  return "미정";
};

export default function EventGallery({ eventData, ...props }) {
  const data = eventData || {
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
  const imageSrc = data?.imgSrc
    ? toAbsoluteUrl(data.imgSrc)
    : IMAGES.GALLERY_DEFAULT_IMG;
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
      enableInterest={data.enableInterest}>
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
  );
}

