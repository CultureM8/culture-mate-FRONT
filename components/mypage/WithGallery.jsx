import Image from "next/image";
import Gallery from "../global/Gallery";
import { ICONS } from "@/constants/path";

export default function EventGallery({
  imgSrc,
  title = "모집글 제목",
  eventType = "이벤트유형",
  eventName = "이벤트명",
  people = "모집 인원",
  date = "0000.00.00",
  alt,
}) {
  return (
    <Gallery title={title} src={imgSrc} alt={alt}>
      <div className="flex items-center gap-2">
        <div className="border border-b-2 rounded-4xl px-2">{eventType}</div>
        <div>{eventName}</div>
      </div>
      <div>
        {date} {people}
      </div>
    </Gallery>
  );
}
