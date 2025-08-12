"use client"

import AISuggestion from "@/components/events/AISuggestion";
import EventFilterModal from "@/components/events/EventFilterModal";
import EventGallery from "@/components/events/EventGallery";
import EventSelector from "@/components/global/EventSelector";
import GalleryLayout from "@/components/global/GalleryLayout";
import SearchFilterSort from "@/components/global/SearchFilterSort";
import { getAllEvents, getEventsByType } from "@/lib/eventData";
import { getAISuggestionData } from "@/lib/aiSuggestionData";
import { IMAGES } from "@/constants/path";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Event() {

  const [title, intro] = ["이벤트", "무대 위의 감동부터 거리의 축제까지, 당신의 취향을 채울 다양한 이벤트를 만나보세요."];

  const [eventData, setEventData] = useState([]);
  const [aiSuggestionData, setAiSuggestionData] = useState([]);
  const [selectedType, setSelectedType] = useState("전체");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); // Set to true for demonstration

  const openFilterModal = () => setIsFilterModalOpen(true);
  const closeFilterModal = () => setIsFilterModalOpen(false);

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

  useEffect(() => {
    const fetchAISuggestions = async () => {
      try {
        const suggestions = await getAISuggestionData();
        setAiSuggestionData(suggestions);
      } catch (error) {
        console.error("AI 추천 데이터를 가져오는데 실패했습니다:", error);
      }
    };

    fetchAISuggestions();
  }, []);

  return (
    <>
      <h1 className="text-4xl font-bold py-[10px] h-16">{title}</h1>
      <p className="text-xl pt-[10px] h-12 fill-gray-600">{intro}</p>

      <AISuggestion 
        suggestionList={aiSuggestionData || []} 
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
