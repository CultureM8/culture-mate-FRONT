"use client"

import EventGallery from "@/components/events/EventGallery";
import EventSelector from "@/components/global/EventSelector";
import GalleryLayout from "@/components/global/GalleryLayout";
import SearchFilterSort from "@/components/global/SearchFilterSort";
import Image from "next/image";
import { useState } from "react";

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

  const [selectedType, setSelectedType] = useState("전체");

  return (
    <>
      <h1 className="text-4xl font-bold py-[10px] h-16">{title}</h1>
      <p className="text-xl pt-[10px] h-12 fill-gray-600">{intro}</p>

      {/* ai 추천란 배경 */}
      <div className="absolute left-1/2 top-[112px] -translate-x-1/2 w-screen h-[384px] z-0">
        <Image
          src={"img/default_img.svg"}
          alt="이미지"
          fill
          className="object-cover opacity-30"
        />
      </div>
      <div className="border w-full h-[384px]">
        {/* 배경 위에 올라갈 이벤트 메인이미지들 */}
      </div>

      <EventSelector 
        selected={selectedType}
        setSelected={setSelectedType}
      />

      {/* 이벤트 유형명, 검색창, 필터 */}
      <SearchFilterSort
        enableTitle
        title={selectedType}
      />
      <GalleryLayout Component={EventGallery} items={eventData} />
    </>
  );
}
