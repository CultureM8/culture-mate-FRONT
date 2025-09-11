"use client";

import AISuggestion from "@/components/events/main/AISuggestion";
import EventFilterModal from "@/components/events/main/EventFilterModal";
import EventGallery from "@/components/events/main/EventGallery";
import EventSelector from "@/components/global/EventSelector";
import GalleryLayout from "@/components/global/GalleryLayout";
import SearchFilterSort from "@/components/global/SearchFilterSort";

import { getEvents as getEventsRaw } from "@/lib/eventApi";

import { useState, useEffect } from "react";

const toImg = (url) => {
  if (!url) return "/img/default_img.svg";
  if (url.startsWith("http")) return url;
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
  return `${base}${url}`;
};

/** region → location 문자열(undef-safe) */
const toLocation = (obj) => {
  const city =
    typeof obj?.region?.city === "string" ? obj.region.city.trim() : "";
  const district =
    typeof obj?.region?.district === "string" ? obj.region.district.trim() : "";
  const parts = [city, district].filter(Boolean);
  return parts.length > 0
    ? parts.join(" ")
    : (obj?.eventLocation && String(obj.eventLocation).trim()) || "미정";
};

const mapListItem = (event) => ({
  title: event.title,
  startDate: event.startDate,
  endDate: event.endDate,
  location: toLocation(event),
  imgSrc: toImg(event.mainImageUrl),
  alt: event.title,
  href: `/events/${event.id}`,
  isHot: false,
  eventType: event.eventType,
  id: String(event.id),
  viewCount: event.viewCount || 0,
  interestCount: event.interestCount || 0,
  region: event.region || null,
  score: event.avgRating ? Number(event.avgRating) : 0,
  avgRating: event.avgRating ? Number(event.avgRating) : 0,
  // 중복 제거를 위한 고유 키 추가
  _key: `${event.id}_${event.eventType}`,
});

const mapUiLabelToBackendTypes = (label) => {
  switch (label) {
    case "뮤지컬":
      return ["MUSICAL"];
    case "영화":
      return ["MOVIE"];
    case "연극":
      return ["THEATER"];
    case "전시":
      return ["EXHIBITION"];
    case "클래식":
      return ["CLASSICAL"];
    case "무용":
      return ["DANCE"];
    case "클래식/무용":
      return ["CLASSICAL", "DANCE"];
    case "콘서트":
      return ["CONCERT"];
    case "페스티벌":
      return ["FESTIVAL"];
    case "콘서트/페스티벌":
      return ["CONCERT", "FESTIVAL"];
    case "지역행사":
      return ["LOCAL_EVENT"];
    case "기타":
      return ["OTHER"];
    default:
      return [];
  }
};

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
  const [sortOption, setSortOption] = useState("latest"); // 정렬 상태

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

  // 정렬 옵션 변경
  const handleSortChange = (newSortOption) => {
    setSortOption(newSortOption);
  };

  // 검색
  const handleSearch = async (keyword) => {
    try {
      setIsSearchMode(true);
      setCurrentSearchKeyword(keyword);

      const backendTypes = mapUiLabelToBackendTypes(selectedType);

      let raw = [];
      if (backendTypes.length === 0 && selectedType !== "전체") {
        // 매핑되지 않는 라벨이면 전체로 처리
        raw = await getEventsRaw({ keyword });
      } else if (backendTypes.length <= 1) {
        // 단일 타입 검색
        const params = { keyword };
        if (backendTypes[0]) params.eventType = backendTypes[0];
        raw = await getEventsRaw(params);
      } else {
        // 다중 타입(클래식/무용, 콘서트/페스티벌) → 병렬 호출 후 합치기
        const results = await Promise.all(
          backendTypes.map((t) => getEventsRaw({ keyword, eventType: t }))
        );
        raw = results.flat();
        // 중복 제거 (id 기준)
        const uniqueEvents = [];
        const seenIds = new Set();
        raw.forEach((event) => {
          if (!seenIds.has(event.id)) {
            seenIds.add(event.id);
            uniqueEvents.push(event);
          }
        });
        raw = uniqueEvents;
      }

      const mapped = Array.isArray(raw) ? raw.map(mapListItem) : [];
      const sortedResults = sortEvents(mapped, sortOption);
      setEventData(sortedResults);
    } catch (error) {
      console.error("검색 실패:", error);
      setEventData([]);
    }
  };

  // 정렬 옵션 변경 시 재정렬
  useEffect(() => {
    if (eventData.length > 0) {
      const sortedData = sortEvents(eventData, sortOption);
      setEventData(sortedData);
    }
  }, [sortOption]);

  // 일반 이벤트 로드 (검색 모드 아닐 때만)
  useEffect(() => {
    if (isSearchMode) return;

    const fetchEvents = async () => {
      try {
        let raw = [];

        if (selectedType === "전체") {
          raw = await getEventsRaw();
        } else {
          const backendTypes = mapUiLabelToBackendTypes(selectedType);
          if (backendTypes.length <= 1) {
            const params = {};
            if (backendTypes[0]) params.eventType = backendTypes[0];
            raw = await getEventsRaw(params);
          } else {
            const results = await Promise.all(
              backendTypes.map((t) => getEventsRaw({ eventType: t }))
            );
            raw = results.flat();
            const uniqueEvents = [];
            const seenIds = new Set();
            raw.forEach((event) => {
              if (!seenIds.has(event.id)) {
                seenIds.add(event.id);
                uniqueEvents.push(event);
              }
            });
            raw = uniqueEvents;
          }
        }

        const mapped = Array.isArray(raw) ? raw.map(mapListItem) : [];
        const sortedEvents = sortEvents(mapped, sortOption);
        setEventData(sortedEvents);
      } catch (error) {
        console.error("이벤트 데이터를 가져오는데 실패했습니다:", error);
        setEventData([]);
      }
    };

    fetchEvents();
  }, [selectedType, isSearchMode]);

  useEffect(() => {
    setIsSearchMode(false);
    setCurrentSearchKeyword("");
  }, [selectedType]);

  // AI 추천 로드
  useEffect(() => {
    const fetchAISuggestions = async () => {
      try {
        const { getAISuggestionData } = await import("@/lib/aiSuggestionData");
        const suggestions = await getAISuggestionData();
        setAiSuggestionData(suggestions);
      } catch (error) {
        console.error("AI 추천 데이터를 가져오는데 실패했습니다:", error);
      }
    };

    fetchAISuggestions();
  }, []);

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
