"use client"

import EventGallery from "@/components/events/EventGallery";
import EventSelector from "@/components/global/EventSelector";
import GalleryLayout from "@/components/global/GalleryLayout";
import SearchFilterSort from "@/components/global/SearchFilterSort";
import { getAllEvents, getEventsByType } from "@/lib/eventData";
import { IMAGES } from "@/constants/path";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Event() {

  const [title, intro] = ["이벤트", "무대 위의 감동부터 거리의 축제까지, 당신의 취향을 채울 다양한 이벤트를 만나보세요."];

  const [eventData, setEventData] = useState([]);
  const [selectedType, setSelectedType] = useState("전체");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (selectedType === "전체") {
          const events = await getAllEvents();
          setEventData(events);
        } else {
          const events = await getEventsByType(selectedType);
          setEventData(events);
        }
      } catch (error) {
        console.error("이벤트 데이터를 가져오는데 실패했습니다:", error);
      }
    };

    fetchEvents();
  }, [selectedType]);

  return (
    <>
      <h1 className="text-4xl font-bold py-[10px] h-16">{title}</h1>
      <p className="text-xl pt-[10px] h-12 fill-gray-600">{intro}</p>

      {/* ai 추천란 배경 */}
      <div className="absolute left-1/2 top-[112px] -translate-x-1/2 w-screen h-[384px] z-0">
        <Image
          src={IMAGES.GALLERY_DEFAULT_IMG}
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
