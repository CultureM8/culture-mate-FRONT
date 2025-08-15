import { ICONS } from "@/constants/path";
import Image from "next/image";
import Gallery from "../global/Gallery";

export default function TogetherGallery({
  imgSrc,
  alt = "",
  title = "모집글 제목",
  eventType = "이벤트유형",
  eventName = "이벤트명",
  group = "00/00",
  date = "0000.00.00",
  isClosed = false,
}) {
  return (
    <div className="relative">
      {isClosed && <div className="absolute inset-0 w-full h-full bg-black opacity-10 z-10" />}
      <Gallery title={title} src={imgSrc} alt={alt}>
        <div className="flex items-center gap-2">
          <div className="border border-b-2 rounded-4xl px-2">{eventType}</div>
          <div>{eventName}</div>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-2">
            <Image src={ICONS.CALENDAR} alt="calendar" width={16} height={16} />
            {date}
          </span>
          <span className="flex items-center gap-2">
            <Image src={ICONS.GROUP} alt="group" width={20} height={20} />
            {group}
          </span>
        </div>
      </Gallery>
    </div>
  );
}
