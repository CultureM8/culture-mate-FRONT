import { ICONS } from "@/constants/path";
import Image from "next/image";
import ListComponent from "../global/ListComponent";

export default function TogetherList({
  imgSrc,
  alt = "",
  title = "모집글 제목",
  eventType = "이벤트유형",
  eventName = "이벤트명",
  group = "00/00",
  date = "0000.00.00",
  address = "00시 00구 00동",
  author = "-",
  isClosed = false,
}) {
  return (
    <div className="relative">
      {isClosed && <div className="absolute inset-0 w-full h-full bg-black opacity-10 z-10" />}
      <ListComponent src={imgSrc} alt={alt} title={title}>
        <div className="flex flex-col justify-around h-full">
          <div className="flex gap-2">
            <span className="border border-b-2 rounded-4xl px-2 w-fit">{eventType}</span>
            <strong>{eventName}</strong>
          </div>
          <h3 className="text-lg font-bold overflow-hidden whitespace-nowrap text-ellipsis text-black">
            {title}
          </h3>
          <div className="flex gap-4 shrink-0 w-full">
            <span className="flex items-center gap-2 flex-shrink-0">
              <Image src={ICONS.CALENDAR} alt="calendar" width={16} height={16} />
              {date}
            </span>
            <span className="flex items-center gap-2 flex-shrink-0">
              <Image src={ICONS.GROUP} alt="group" width={20} height={20} />
              {group}
            </span>
            <span className="flex items-center gap-2 flex-shrink-0">
              <Image src={ICONS.PIN} alt="group" width={16} height={16} />
              {address}
            </span>
          </div>
          <div className="">
            작성자 : {author}
          </div>
        </div>
      </ListComponent>
    </div>
  );
}
