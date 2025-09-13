"use client";

import AISuggestion from "@/components/events/main/AISuggestion";
import EventFilterModal from "@/components/events/main/EventFilterModal";
import EventGallery from "@/components/events/main/EventGallery";
import EventSelector from "@/components/global/EventSelector";
import GalleryLayout from "@/components/global/GalleryLayout";
import SearchFilterSort from "@/components/global/SearchFilterSort";

import {
  getEvents as getEventsRaw,
  searchEvents,
  searchEventsByTypes,
} from "@/lib/api/eventApi";

import { useState, useEffect } from "react";

import { getEventMainImageUrl } from "@/lib/utils/imageUtils";

/** region → location 문자열(undef-safe) */
const toLocation = (obj) => {
  // 백엔드 RegionDto.Response 구조 (level1, level2, level3)
  const level1 =
    typeof obj?.region?.level1 === "string" ? obj.region.level1.trim() : "";
  const level2 =
    typeof obj?.region?.level2 === "string" ? obj.region.level2.trim() : "";
  const level3 =
    typeof obj?.region?.level3 === "string" ? obj.region.level3.trim() : "";

  // 기존 구조 호환성 (city, district)
  const city =
    typeof obj?.region?.city === "string" ? obj.region.city.trim() : "";
  const district =
    typeof obj?.region?.district === "string" ? obj.region.district.trim() : "";

  // level 구조를 우선 사용, 없으면 기존 구조 사용
  const parts =
    level1 || level2 || level3
      ? [level1, level2, level3].filter(Boolean)
      : [city, district].filter(Boolean);

  return parts.length > 0
    ? parts.join(" ")
    : (obj?.eventLocation && String(obj.eventLocation).trim()) || "미정";
};

const mapListItem = (event) => {
  // 백엔드 응답 확인 로그
  console.log("mapListItem - event data:", event);
  console.log("mapListItem - event.id:", event.id);
  console.log("mapListItem - typeof event.id:", typeof event.id);
  console.log("mapListItem - available image fields:", {
    mainImageUrl: event.mainImageUrl,
    thumbnailImagePath: event.thumbnailImagePath,
    imageUrl: event.imageUrl,
    image: event.image,
    imgSrc: event.imgSrc,
  });

  const eventId = event.id || event.eventId || null;
  console.log("mapListItem - resolved eventId:", eventId);

  return {
    title: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    location: toLocation(event),
    imgSrc: getEventMainImageUrl(event),
    alt: event.title,
    href: `/events/${eventId}`,
    isHot: false,
    eventType: event.eventType,
    id: eventId ? String(eventId) : undefined,
    viewCount: event.viewCount || 0,
    interestCount: event.interestCount || 0,
    region: event.region || null,
    score: event.avgRating ? Number(event.avgRating) : 0,
    avgRating: event.avgRating ? Number(event.avgRating) : 0,
    _key: `${eventId}_${event.eventType}`,
    isInterested: event.isInterested === true,
    eventId: eventId,
  };
};

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

const fetchEventsByTypes = async (types, baseParams = {}) => {
  if (!Array.isArray(types) || types.length === 0) {
    return await searchEvents(baseParams);
  }
  if (types.length === 1) {
    return await searchEvents({ ...baseParams, eventType: types[0] });
  }

  const results = await Promise.all(
    types.map((t) => searchEvents({ ...baseParams, eventType: t }))
  );

  const seen = new Set();
  const merged = [];
  for (const arr of results) {
    if (!Array.isArray(arr)) continue;
    for (const ev of arr) {
      const key = ev?.id;
      if (key == null || seen.has(key)) continue;
      seen.add(key);
      merged.push(ev);
    }
  }
  return merged;
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
  const [sortOption, setSortOption] = useState("latest");

  const [appliedFilters, setAppliedFilters] = useState(null);
  const [isFiltered, setIsFiltered] = useState(false);

  const openFilterModal = () => setIsFilterModalOpen(true);
  const closeFilterModal = () => setIsFilterModalOpen(false);

  const handleApplyFilters = async (filterData) => {
    console.log("적용된 필터:", filterData);
    try {
      setIsFiltered(true);
      const searchParams = {};
      // 날짜 필터
      if (
        filterData.dateRange &&
        filterData.dateRange[0] &&
        filterData.dateRange[1]
      ) {
        searchParams.startDate = filterData.dateRange[0];
        searchParams.endDate = filterData.dateRange[1];
      }
      // 지역 필터 (첫 번째 선택된 지역 사용)
      if (filterData.selectedRegions && filterData.selectedRegions.length > 0) {
        const firstRegion = filterData.selectedRegions[0];

        if (firstRegion.location1 && firstRegion.location1 !== "전체") {
          searchParams["region.level1"] = firstRegion.location1;
        }
        if (firstRegion.location2 && firstRegion.location2 !== "전체") {
          searchParams["region.level2"] = firstRegion.location2;
        }
        if (firstRegion.location3 && firstRegion.location3 !== "전체") {
          searchParams["region.level3"] = firstRegion.location3;
        }
      }
      // 이벤트 타입(복수 가능) 처리
      const backendTypes = mapUiLabelToBackendTypes(selectedType);
      console.log("백엔드 검색 파라미터(여러 타입 지원):", {
        ...searchParams,
        eventTypes: backendTypes,
      });

      const raw = await fetchEventsByTypes(backendTypes, searchParams);

      let mapped = Array.isArray(raw) ? raw.map(mapListItem) : [];
      if (
        filterData.priceRange &&
        (filterData.priceRange[0] > 0 || filterData.priceRange[1] < 1000000)
      ) {
        mapped = mapped.filter((event) => {
          const eventPrice = event.price || 0;
          return (
            eventPrice >= filterData.priceRange[0] &&
            eventPrice <= filterData.priceRange[1]
          );
        });
      }

      // 다중 지역 필터링
      if (filterData.selectedRegions && filterData.selectedRegions.length > 1) {
        mapped = mapped.filter((event) => {
          if (!event.region) return false;

          return filterData.selectedRegions.some((selectedRegion) => {
            if (selectedRegion.location2 === "전체") {
              return event.region.level1 === selectedRegion.location1;
            }
            if (selectedRegion.location3 === "전체") {
              return (
                event.region.level1 === selectedRegion.location1 &&
                event.region.level2 === selectedRegion.location2
              );
            }
            return (
              event.region.level1 === selectedRegion.location1 &&
              event.region.level2 === selectedRegion.location2 &&
              (event.region.level3 === selectedRegion.location3 ||
                !selectedRegion.location3)
            );
          });
        });
      }

      const sortedEvents = sortEvents(mapped, sortOption);
      setEventData(sortedEvents);
      setAppliedFilters(filterData);

      console.log(`필터링 결과: ${mapped.length}개 이벤트`);
    } catch (error) {
      console.error("필터 적용 실패:", error);
      setEventData([]);
    }
  };

  // 필터 초기화 함수 추가
  const handleClearFilters = () => {
    setIsFiltered(false);
    setAppliedFilters(null);
    // 기본 데이터 다시 로드
  };

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
      setIsFiltered(false);
      const searchParams = { keyword };

      const backendTypes = mapUiLabelToBackendTypes(selectedType);
      const raw = await fetchEventsByTypes(backendTypes, searchParams);

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

  useEffect(() => {
    if (isSearchMode || isFiltered) return;

    const fetchEvents = async () => {
      try {
        let raw = [];

        if (selectedType === "전체") {
          raw = await getEventsRaw();
        } else {
          const backendTypes = mapUiLabelToBackendTypes(selectedType);
          raw = await fetchEventsByTypes(backendTypes, {});
        }

        // 백엔드 응답 데이터 로깅
        console.log("fetchEvents - raw response:", raw);
        console.log("fetchEvents - raw response length:", raw?.length);
        if (raw && raw.length > 0) {
          console.log("fetchEvents - first item structure:", raw[0]);
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
  }, [selectedType, isSearchMode, isFiltered]);

  // 타입 변경 시 상태 초기화
  useEffect(() => {
    setIsSearchMode(false);
    setIsFiltered(false);
    setAppliedFilters(null);
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
    if (isFiltered) {
      return `${selectedType} (필터 적용됨)`;
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

      <EventFilterModal
        isOpen={isFilterModalOpen}
        onClose={closeFilterModal}
        onApplyFilters={handleApplyFilters}
      />
    </>
  );
}
