"use client";

import AISuggestion from "@/components/events/main/AISuggestion";
import EventFilterModal from "@/components/events/main/EventFilterModal";
import EventGallery from "@/components/events/main/EventGallery";
import EventSelector from "@/components/global/EventSelector";
import GalleryLayout from "@/components/global/GalleryLayout";
import SearchFilterSort from "@/components/global/SearchFilterSort";
import { getAllEvents, getEventsByType } from "@/lib/eventData";
import { searchEvents } from "@/lib/eventApi";
import { getAISuggestionData } from "@/lib/aiSuggestionData";
import { useState, useEffect } from "react";

export default function Event() {
  const [title, intro] = [
    "이벤트",
    "무대 위의 감동부터 거리의 축제까지, 당신의 취향을 채울 다양한 이벤트를 만나보세요.",
  ];

  const [eventData, setEventData] = useState([]);
  const [aiSuggestionData, setAiSuggestionData] = useState([]);
  const [selectedType, setSelectedType] = useState("전체");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [currentSearchKeyword, setCurrentSearchKeyword] = useState("");
  const [sortOption, setSortOption] = useState("latest"); // 정렬 상태 추가

  const openFilterModal = () => setIsFilterModalOpen(true);
  const closeFilterModal = () => setIsFilterModalOpen(false);

  // 정렬 함수
  const sortEvents = (events, option) => {
    const sorted = [...events];

    switch (option) {
      case "latest":
        return sorted.sort(
          (a, b) => new Date(b.startDate) - new Date(a.startDate)
        );
      case "oldest":
        return sorted.sort(
          (a, b) => new Date(a.startDate) - new Date(b.startDate)
        );
      case "views":
        return sorted.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      case "likes":
        return sorted.sort(
          (a, b) => (b.interestCount || 0) - (a.interestCount || 0)
        );
      case "title":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  };

  // 정렬 옵션 변경 핸들러
  const handleSortChange = (newSortOption) => {
    setSortOption(newSortOption);
  };

  // 검색 함수
  const handleSearch = async (keyword) => {
    try {
      setIsSearchMode(true);
      setCurrentSearchKeyword(keyword);

      const searchParams = { keyword };

      // selectedType이 "전체"가 아니면 eventType도 추가
      if (selectedType !== "전체") {
        const typeMapping = {
          뮤지컬: "MUSICAL",
          영화: "MOVIE",
          연극: "THEATER",
          전시: "EXHIBITION",
          "클래식/무용": "CLASSIC",
          "콘서트/페스티벌": "CONCERT",
          지역행사: "LOCAL_EVENT",
          기타: "OTHER",
        };

        const backendType = typeMapping[selectedType];
        if (backendType) {
          searchParams.eventType = backendType;
        }
      }

      const searchResults = await searchEvents(searchParams);
      const sortedResults = sortEvents(searchResults, sortOption);
      setEventData(sortedResults);
    } catch (error) {
      console.error("검색 실패:", error);
      setEventData([]);
    }
  };

  // 정렬 옵션이 변경될 때마다 현재 데이터 재정렬
  useEffect(() => {
    if (eventData.length > 0) {
      const sortedData = sortEvents(eventData, sortOption);
      setEventData(sortedData);
    }
  }, [sortOption]);

  // 일반 이벤트 로드 (검색 모드가 아닐 때)
  useEffect(() => {
    if (isSearchMode) return; // 검색 모드일 때는 실행하지 않음

    const fetchEvents = async () => {
      try {
        let events = [];
        if (selectedType === "전체") {
          events = await getAllEvents();
        } else {
          events = await getEventsByType(selectedType);
        }

        const sortedEvents = sortEvents(events, sortOption);
        setEventData(sortedEvents);
      } catch (error) {
        console.error("이벤트 데이터를 가져오는데 실패했습니다:", error);
      }
    };

    fetchEvents();
  }, [selectedType, isSearchMode]); // sortOption 의존성 제거

  // 타입이 변경되면 검색 모드 해제
  useEffect(() => {
    setIsSearchMode(false);
    setCurrentSearchKeyword("");
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

  // 표시할 제목 결정
  const getDisplayTitle = () => {
    if (isSearchMode && currentSearchKeyword) {
      return `"${currentSearchKeyword}" 검색 결과`;
    }
    return selectedType;
  };

  return (
    <>
      <h1 className="text-4xl font-bold py-[10px] h-16 px-6">{title}</h1>
      <p className="text-xl pt-[10px] h-12 fill-gray-600 px-6">{intro}</p>

      <AISuggestion suggestionList={aiSuggestionData || []} />

      <EventSelector selected={selectedType} setSelected={setSelectedType} />

      <SearchFilterSort
        enableTitle
        title={getDisplayTitle()}
        filterAction={openFilterModal}
        sortAction={handleSortChange}
        sortOption={sortOption}
        onSearch={handleSearch}
      />

      <GalleryLayout Component={EventGallery} items={eventData} />

      <EventFilterModal isOpen={isFilterModalOpen} onClose={closeFilterModal} />
    </>
  );
}
