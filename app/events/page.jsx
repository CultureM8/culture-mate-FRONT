"use client"

import EventFilterModal from "@/components/events/EventFilterModal";
import EventGallery from "@/components/events/EventGallery";
import EventSelector from "@/components/global/EventSelector";
import GalleryLayout from "@/components/global/GalleryLayout";
import SearchFilterSort from "@/components/global/SearchFilterSort";
import Image from "next/image";
import { useState, useMemo } from "react";

export default function Event() {

  const [title, intro] = ["이벤트", "무대 위의 감동부터 거리의 축제까지, 당신의 취향을 채울 다양한 이벤트를 만나보세요."];

  // AI 추천 이벤트 목록
  const aiSuggestionData = [
    { id: 1, imgSrc: IMAGES.GALLERY_DEFAULT_IMG, alt: "제목-1", title: "제목-1", date: "0000-00-00 ~ 0000-00-00", link: "/events/1" },
    { id: 2, imgSrc: IMAGES.GALLERY_DEFAULT_IMG, alt: "제목-2", title: "제목-2", date: "0000-00-00 ~ 0000-00-00", link: "/events/2" },
    { id: 3, imgSrc: IMAGES.GALLERY_DEFAULT_IMG, alt: "제목-3", title: "제목-3", date: "0000-00-00 ~ 0000-00-00", link: "/events/3" },
    { id: 4, imgSrc: IMAGES.GALLERY_DEFAULT_IMG, alt: "제목-4", title: "제목-4", date: "0000-00-00 ~ 0000-00-00", link: "/events/4" },
    { id: 5, imgSrc: IMAGES.GALLERY_DEFAULT_IMG, alt: "제목-5", title: "제목-5", date: "0000-00-00 ~ 0000-00-00", link: "/events/5" },
    { id: 6, imgSrc: IMAGES.GALLERY_DEFAULT_IMG, alt: "제목-6", title: "제목-6", date: "0000-00-00 ~ 0000-00-00", link: "/events/6" },
    { id: 7, imgSrc: IMAGES.GALLERY_DEFAULT_IMG, alt: "제목-7", title: "제목-7", date: "0000-00-00 ~ 0000-00-00", link: "/events/7" },
    { id: 8, imgSrc: IMAGES.GALLERY_DEFAULT_IMG, alt: "제목-8", title: "제목-8", date: "0000-00-00 ~ 0000-00-00", link: "/events/8" },
  ];

  const eventData = useMemo(() => [
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
  ], []);

  const [selectedType, setSelectedType] = useState("전체");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); // Set to true for demonstration

  const openFilterModal = () => setIsFilterModalOpen(true);
  const closeFilterModal = () => setIsFilterModalOpen(false);

  return (
    <>
      <h1 className="text-4xl font-bold py-[10px] h-16">{title}</h1>
      <p className="text-xl pt-[10px] h-12 fill-gray-600">{intro}</p>

      <AISuggestion 
        suggestionList={aiSuggestionData} 
      />

      <EventSelector 
        selected={selectedType}
        setSelected={setSelectedType}
      />

      {/* 이벤트 유형명, 검색창, 필터 */}
      <SearchFilterSort
        enableTitle
        title={selectedType}
        filterAction={openFilterModal}
      />
       {/* commonProps={{ enableInterest: false }}와 같이 공통으로 적용될 prop을 매개변수로 전달 가능 */}
      <GalleryLayout Component={EventGallery} items={eventData} />

      <EventFilterModal isOpen={isFilterModalOpen} onClose={closeFilterModal} />
    </>
  );
}
