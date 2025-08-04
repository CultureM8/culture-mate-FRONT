import EventGallery from "@/components/events/EventGallery";
import EventTypeButton from "@/components/global/EventTypeButton";
import GalleryLayout from "@/components/global/GalleryLayout";
import SearchBar from "@/components/global/SearchBar";
import { ICONS } from "@/constants/path";
import Image from "next/image";

export default function Event() {

  const [title, intro] = ["이벤트", "무대 위의 감동부터 거리의 축제까지, 당신의 취향을 채울 다양한 이벤트를 만나보세요."];

  const eventData = [
    { imgSrc: "", alt: "", title: "제목-1", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: true },
    { imgSrc: "", alt: "", title: "제목-2", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: true },
    { imgSrc: "", alt: "", title: "제목-3", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: false },
    { imgSrc: "", alt: "", title: "제목-4", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: false },
    { imgSrc: "", alt: "", title: "제목-5", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: false },
    { imgSrc: "", alt: "", title: "제목-6", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: true },
    { imgSrc: "", alt: "", title: "제목-7", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: false },
    { imgSrc: "", alt: "", title: "제목-8", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: true },
    { imgSrc: "", alt: "", title: "제목-9", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: false },
    { imgSrc: "", alt: "", title: "제목-1", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: true },
    { imgSrc: "", alt: "", title: "제목-2", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: true },
    { imgSrc: "", alt: "", title: "제목-3", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: false },
    { imgSrc: "", alt: "", title: "제목-4", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: false },
    { imgSrc: "", alt: "", title: "제목-5", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: false },
    { imgSrc: "", alt: "", title: "제목-6", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: true },
    { imgSrc: "", alt: "", title: "제목-7", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: false },
    { imgSrc: "", alt: "", title: "제목-8", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: true },
    { imgSrc: "", alt: "", title: "제목-9", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: false },
    { imgSrc: "", alt: "", title: "제목-1", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: true },
    { imgSrc: "", alt: "", title: "제목-2", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: true },
    { imgSrc: "", alt: "", title: "제목-3", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: false },
    { imgSrc: "", alt: "", title: "제목-4", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: false },
    { imgSrc: "", alt: "", title: "제목-5", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: false },
    { imgSrc: "", alt: "", title: "제목-6", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: true },
    { imgSrc: "", alt: "", title: "제목-7", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: false },
    { imgSrc: "", alt: "", title: "제목-8", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: true },
    { imgSrc: "", alt: "", title: "제목-9", date: "0000.00.00 ~ 0000.00.00", location: "지역 및 장소명", isHot: false },
  ];

  return (
    <>
      <h1 className="text-4xl font-bold py-[10px] h-16">{title}</h1>
      <p className="text-xl pt-[10px] h-12 fill-gray-600">{intro}</p>

      {/* ai 추천란 배경 */}
      <div className="absolute left-1/2 top-[112px] -translate-x-1/2 w-screen h-[384px] z-0">
        <Image
          src={"img/default-img.svg"}
          alt="이미지"
          fill
          className="object-cover opacity-30"
        />
      </div>
      <div className="border w-full h-[384px]">
        {/* 배경 위에 올라갈 이벤트 메인이미지들 */}
      </div>

      <EventTypeButton />

      {/* 이벤트 유형명, 검색창, 필터 */}
      <div className="px-2.5 h-16 flex items-center justify-between">
        <h2 className="text-xl font-semibold">전체</h2>
        <div className="flex items-center gap-6">
          <SearchBar />
          <button className="flex items-cente gap-6 hover:cursor-pointer">
            필터
            <Image 
              src={ICONS.FILTER}
              alt=""
              width={24}
              height={24}
            />
          </button>
        </div>
      </div>
      <GalleryLayout Component={EventGallery} items={eventData} />
    </>
  );
}
