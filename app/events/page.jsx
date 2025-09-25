"use client";

import AISuggestion from "@/components/events/main/AISuggestion";
import EventFilterModal from "@/components/events/main/EventFilterModal";
import EventGallery from "@/components/events/main/EventGallery";
import EventSelector from "@/components/global/EventSelector";
import GalleryLayout from "@/components/global/GalleryLayout";
import SearchFilterSort from "@/components/global/SearchFilterSort";
import { mapUiLabelToBackendTypes } from "@/constants/eventTypes";

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
    mainImagePath: event.mainImagePath,
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
    imgSrc: getEventMainImageUrl(event, false), // 고화질 이미지 사용
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
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState("latest");

  const [appliedFilters, setAppliedFilters] = useState(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false); // sessionStorage 확인 완료 여부

  const openFilterModal = () => setIsFilterModalOpen(true);
  const closeFilterModal = () => setIsFilterModalOpen(false);

  // 현재 모든 검색 조건을 통합하는 중앙 집중식 함수
  const getCurrentSearchParams = () => {
    const params = {};

    // 검색어
    if (query && query.trim()) {
      params.keyword = query.trim();
    }

    // 이벤트 타입
    if (selectedType !== "전체") {
      const backendTypes = mapUiLabelToBackendTypes(selectedType);
      if (backendTypes.length === 1) {
        params.eventType = backendTypes[0];
      }
    }

    // 적용된 필터 (지역, 날짜)
    if (appliedFilters) {
      if (appliedFilters.selectedRegion) {
        const region = appliedFilters.selectedRegion;
        if (region.location1 && region.location1 !== "전체") {
          params["region.level1"] = region.location1;
        }
        if (region.location2 && region.location2 !== "전체") {
          params["region.level2"] = region.location2;
        }
        if (region.location3 && region.location3 !== "전체") {
          params["region.level3"] = region.location3;
        }
      }

      if (appliedFilters.dateRange && appliedFilters.dateRange[0] && appliedFilters.dateRange[1]) {
        params.startDate = appliedFilters.dateRange[0];
        params.endDate = appliedFilters.dateRange[1];
      }
    }

    return params;
  };

  // 필터 적용 핸들러 (누적 필터링)
  const handleApplyFilters = async (filterData) => {
    try {
      setIsFiltered(true);

      // 현재 모든 검색 조건을 포함 (검색어, 이벤트 타입 포함)
      const searchParams = getCurrentSearchParams();

      // 새로운 필터 조건 추가/덮어쓰기
      if (filterData.dateRange && filterData.dateRange[0] && filterData.dateRange[1]) {
        searchParams.startDate = filterData.dateRange[0];
        searchParams.endDate = filterData.dateRange[1];
      }

      if (filterData.selectedRegion) {
        const region = filterData.selectedRegion;
        if (region.location1 && region.location1 !== "전체") {
          searchParams["region.level1"] = region.location1;
        }
        if (region.location2 && region.location2 !== "전체") {
          searchParams["region.level2"] = region.location2;
        }
        if (region.location3 && region.location3 !== "전체") {
          searchParams["region.level3"] = region.location3;
        }
      }

      const backendTypes = mapUiLabelToBackendTypes(selectedType);
      const raw = await fetchEventsByTypes(backendTypes, searchParams);

      let mapped = Array.isArray(raw) ? raw.map(mapListItem) : [];
      
      // 클라이언트 사이드 지역 필터링도 단일 객체로 수정
      if (filterData.selectedRegion) {
        const selectedRegion = filterData.selectedRegion;
        mapped = mapped.filter(event => {
          if (!event.region) return false;
          
          // level1 체크
          if (selectedRegion.location1 && selectedRegion.location1 !== "전체") {
            if (event.region.level1 !== selectedRegion.location1) return false;
          }
          
          // level2 체크
          if (selectedRegion.location2 && selectedRegion.location2 !== "전체") {
            if (event.region.level2 !== selectedRegion.location2) return false;
          }
          
          // level3 체크
          if (selectedRegion.location3 && selectedRegion.location3 !== "전체") {
            if (event.region.level3 !== selectedRegion.location3) return false;
          }
          
          return true;
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

  // 검색 (실제 검색 로직만 수행)
  const performSearch = async (keyword, skipModeSettings = false) => {
    try {
      if (!skipModeSettings) {
        setIsSearchMode(true);
        setIsFiltered(false);
      }

      // 현재 모든 검색 조건을 포함하되 검색어 덮어쓰기
      const searchParams = getCurrentSearchParams();
      searchParams.keyword = keyword;

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

  // 검색바 핸들러 (상태 업데이트 + 검색)
  const handleSearch = async (keyword) => {
    setQuery(keyword);
    if (keyword.trim()) {
      await performSearch(keyword);
    }
  };

  // 정렬 옵션 변경 시 재정렬
  useEffect(() => {
    if (eventData.length > 0) {
      const sortedData = sortEvents(eventData, sortOption);
      setEventData(sortedData);
    }
  }, [sortOption]);

  // 기본 데이터 로딩 (sessionStorage 확인 후, 검색 모드나 필터 적용 중이 아닐 때만)
  useEffect(() => {
    // sessionStorage 확인이 완료되지 않았으면 대기
    if (!sessionChecked) return;

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

        const mapped = Array.isArray(raw) ? raw.map(mapListItem) : [];
        const sortedEvents = sortEvents(mapped, sortOption);
        setEventData(sortedEvents);
      } catch (error) {
        console.error("이벤트 데이터를 가져오는데 실패했습니다:", error);
        setEventData([]);
      }
    };

    fetchEvents();
  }, [sessionChecked, selectedType, isSearchMode, isFiltered]);

  // 이벤트 타입 변경시 현재 조건 유지하며 재검색
  useEffect(() => {
    if (isSearchMode || isFiltered) {
      const performTypeChangeSearch = async () => {
        try {
          // 현재 모든 조건을 유지하며 재검색
          const searchParams = getCurrentSearchParams();
          const backendTypes = mapUiLabelToBackendTypes(selectedType);

          const raw = await fetchEventsByTypes(backendTypes, searchParams);
          const mapped = Array.isArray(raw) ? raw.map(mapListItem) : [];
          const sortedEvents = sortEvents(mapped, sortOption);
          setEventData(sortedEvents);
        } catch (error) {
          console.error("타입 변경 재검색 실패:", error);
          setEventData([]);
        }
      };

      performTypeChangeSearch();
    }
  }, [selectedType]); // selectedType 변경시에만 실행

  // sessionStorage에서 검색 데이터 확인 (통합검색에서 넘어온 경우) - 최우선 처리
  useEffect(() => {
    const handleSessionSearch = async () => {
      try {
        const searchData = sessionStorage.getItem('searchData');
        if (searchData) {
          const { keyword, source } = JSON.parse(searchData);

          if (source === 'integrated-search' && keyword && keyword.trim()) {
            console.log('통합검색에서 넘어온 검색어:', keyword);

            setQuery(keyword);
            setIsSearchMode(true);
            setIsFiltered(false);

            const searchParams = { keyword: keyword.trim() };
            const backendTypes = mapUiLabelToBackendTypes(selectedType);
            const raw = await fetchEventsByTypes(backendTypes, searchParams);

            const mapped = Array.isArray(raw) ? raw.map(mapListItem) : [];
            const sortedResults = sortEvents(mapped, sortOption);
            setEventData(sortedResults);

            // 사용 후 삭제
            sessionStorage.removeItem('searchData');
          }
        }
      } catch (error) {
        console.error('통합검색 데이터 처리 실패:', error);
        sessionStorage.removeItem('searchData');
      } finally {
        // sessionStorage 확인 완료 상태 설정 (검색 데이터가 있든 없든)
        setSessionChecked(true);
      }
    };

    handleSessionSearch();
  }, [selectedType, sortOption]);


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

  // 관심 상태 변경 이벤트 리스너
  useEffect(() => {
    console.log("🔵 Events 페이지 - event-interest-changed 이벤트 리스너 등록");

    const handleInterestChanged = (event) => {
      const { eventId: changedEventId, interested } = event.detail;

      console.log("🔔 Events 페이지 - 관심 상태 변경 감지:", {
        changedEventId,
        interested
      });

      // 이벤트 목록에서 해당 이벤트의 관심 상태 업데이트
      setEventData(prevEvents => {
        const updated = prevEvents.map(eventItem => {
          if (String(eventItem.eventId) === String(changedEventId) ||
              String(eventItem.id) === String(changedEventId)) {
            console.log(`✅ Events 페이지 - 이벤트 ${eventItem.title}의 관심 상태 업데이트: ${interested}`);
            return {
              ...eventItem,
              isInterested: Boolean(interested),
              interestCount: interested
                ? (eventItem.interestCount || 0) + 1
                : Math.max((eventItem.interestCount || 0) - 1, 0)
            };
          }
          return eventItem;
        });

        console.log(`Events 페이지 - 이벤트 ${changedEventId} 상태 업데이트 완료`);
        return updated;
      });
    };

    // localStorage 변경 감지 (크로스 페이지 동기화)
    const handleStorageChange = (e) => {
      console.log("📨 Events 페이지 - storage 이벤트 수신:", {
        key: e.key,
        newValue: e.newValue
      });

      if (!e.key || !e.key.startsWith('event_interest_')) {
        return;
      }

      try {
        const storageData = JSON.parse(e.newValue || '{}');
        const storageEventId = storageData.eventId;
        const interested = storageData.interested;

        console.log("📊 Events 페이지 - localStorage에서 관심 상태 변경 감지:", {
          eventId: storageEventId,
          interested
        });

        // 기존 handleInterestChanged 로직 재사용
        handleInterestChanged({
          detail: { eventId: storageEventId, interested }
        });
      } catch (error) {
        console.error("❌ localStorage 관심 상태 파싱 실패:", error);
      }
    };

    window.addEventListener("event-interest-changed", handleInterestChanged);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      console.log("🔴 Events 페이지 - 이벤트 리스너들 해제");
      window.removeEventListener("event-interest-changed", handleInterestChanged);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const getDisplayTitle = () => {
    if (query && query.trim()) {
      return `"${query.trim()}" 검색 결과`;
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

      {/* 필터 적용된 상태 표시 */}
      {appliedFilters && (
        <div className="px-6 mb-4 p-3 bg-blue-50 rounded flex justify-between items-center">
          <div>
            <span className="text-sm font-medium text-blue-800">필터 적용됨: </span>
            {appliedFilters.selectedRegion && (
              <span className="text-sm text-blue-700">
                {appliedFilters.selectedRegion.fullAddress}
              </span>
            )}
            {appliedFilters.dateRange && (
              <span className="text-sm text-blue-700 ml-2">
                ({appliedFilters.dateRange[0]} ~ {appliedFilters.dateRange[1]})
              </span>
            )}
          </div>
          <button 
            onClick={handleClearFilters}
            className="text-sm text-red-500 hover:text-red-700"
          >
            필터 해제
          </button>
        </div>
      )}

      <SearchFilterSort
        enableTitle
        title={getDisplayTitle()}
        filterAction={openFilterModal}
        sortAction={handleSortChange}
        sortOption={sortOption}
        searchValue={query}
        onSearchChange={setQuery}
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