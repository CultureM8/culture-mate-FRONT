import ListGallery from "../global/ListView";
import { ICONS } from "@/constants/path";
import Image from "next/image";

export default function TogetherList({
  imgSrc, // 이미지 경로
  title = "모집글 제목", // 동행 모집 게시글 제목
  eventType = "이벤트유형", // 이벤트 유형 (태그)
  eventName = "이벤트명", // 동행 모집 게시글 제목
  group = "00/00", // 모집 현황 (현재인원/총인원)
  date = "0000.00.00", // 이벤트 날짜
  pin = "00시 00구 00동", // 장소 정보
  nickName = "사용자 별명", // 작성자명
  alt, // 이미지 대체텍스트 (접근성용)
}) {
  return (
    <>
      <div className="flex flex-wrap w-full">
        <ListGallery src={imgSrc} alt={alt} />
        <div className="mt-6">
          <div className="flex items-center space-x-2 text-gray-400 opacity-70">
            <div className="border border-b-2 rounded-4xl px-2">
              {eventType}
            </div>
            <div>{eventName}</div>
          </div>
          <div className="text-base font-bold">{title}</div>
          <div className="flex items-center space-x-2 text-gray-400 opacity-70">
            <Image src={ICONS.CALENDAR} alt="calendar" width={24} height={24} />
            <div>{date}</div>
            <Image src={ICONS.GROUP} alt="group" width={24} height={24} />
            <div>{group}</div>
            <Image src={ICONS.PIN} alt="pin" width={24} height={24} />
            <div>{pin}</div>
          </div>
          <div className="space-x-2 text-gray-400 opacity-70">
            작성자 : {nickName}
          </div>
        </div>
      </div>
    </>
  );
}
