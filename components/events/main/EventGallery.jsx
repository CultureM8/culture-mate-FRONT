import Image from "next/image";
import Gallery from "@/components/global/Gallery";
import { ICONS } from "@/constants/path";
import StarRating from "@/lib/StarRating";

export default function EventGallery({ eventData, ...props }) {
  // eventData가 없으면 기존 props 방식 사용
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

  return (
    <Gallery
      title={data.title}
      src={data.imgSrc}
      alt={data.alt}
      href={data.href}
      enableInterest={data.enableInterest}>
      <div className="flex gap-6 mt-1 mb-2">
        <div className="flex gap-1">
          <div>
            <Image
              src={
                (data.score || data.avgRating) > 0
                  ? ICONS.STAR_FULL
                  : ICONS.STAR_EMPTY
              }
              alt="별점"
              width={20}
              height={20}
            />
          </div>
          <div>
            <StarRating
              rating={data.score || data.avgRating || 0}
              mode="average"
              showNumber={true}
              showStars={false}
            />
          </div>
        </div>
        <div>
          {data.startDate} ~ {data.endDate}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {data.location || data.eventLocation || "지역 및 장소명"}
      </div>
    </Gallery>
  );
}
