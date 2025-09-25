"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { ICONS } from "@/constants/path";
import GalleryLayout from "@/components/global/GalleryLayout";
import TogetherGallery from "@/components/together/TogetherGallery";
import TogetherList from "@/components/together/TogetherList";
import EventSelector from "@/components/global/EventSelector";
import SearchBar from "@/components/global/SearchBar";
import SearchFilterSort from "@/components/global/SearchFilterSort";
import TogetherFilterModal from "@/components/together/TogetherFilterModal";
import useLogin from "@/hooks/useLogin";
import togetherApi from "@/lib/api/togetherApi";
import { mapUiLabelToBackendTypes } from "@/constants/eventTypes";
import { togetherSortOptions } from "@/constants/sortOptions";

// Together 데이터 매핑 함수
const mapTogetherListItem = (together) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

  const location = together.region ?
    [together.region.level1, together.region.level2, together.region.level3]
      .filter(Boolean)
      .join(' ') || '미정'
    : '미정';

  // 이미지 경로 처리 (기존 로직과 동일)
  const imgSrc = together.event?.eventImage ||
    (together.event?.mainImagePath
      ? `${BASE_URL}${together.event.mainImagePath}`
      : together.event?.thumbnailImagePath
      ? `${BASE_URL}${together.event.thumbnailImagePath}`
      : "/img/default_img.svg");

  return {
    id: together.id,
    togetherId: together.id,
    title: together.title,
    region: together.region,
    location: location,
    eventType: together.eventType,
    eventTitle: together.eventTitle,
    eventName: together.event?.title || together.event?.eventName || together.eventTitle,
    meetingDate: together.meetingDate,
    currentParticipants: together.currentParticipants || 0,
    maxParticipants: together.maxParticipants || 0,
    group: `${together.currentParticipants || 0}/${together.maxParticipants}`,
    active: together.active,
    isActive: together.active,
    authorNickname: together.authorNickname,
    host: together.host,
    author: together.host?.nickname || together.host?.displayName || together.authorNickname || '-',
    imgSrc: imgSrc,
    event: together.event,
    eventSnapshot: together.event,
    _key: `together_${together.id}`,
    // 관심 관련 필드 추가
    interestCount: together.interestCount || 0,
    isInterested: together.isInterested === true,
    // 정렬을 위한 필드들
    createdAt: together.createdAt,
    companionDate: together.meetingDate,
    date: together.meetingDate,
  };
};

// Together 데이터용 타입별 검색 함수
const fetchTogetherByTypes = async (types, baseParams = {}) => {
  if (!Array.isArray(types) || types.length === 0) {
    return await togetherApi.search(baseParams);
  }
  if (types.length === 1) {
    return await togetherApi.search({ ...baseParams, eventType: types[0] });
  }

  const results = await Promise.all(
    types.map((t) => togetherApi.search({ ...baseParams, eventType: t }))
  );

  const seen = new Set();
  const merged = [];
  for (const arr of results) {
    if (!Array.isArray(arr)) continue;
    for (const item of arr) {
      const key = item?.id;
      if (key == null || seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
  }
  return merged;
};

export default function TogetherPage() {
  const [title, intro] = [
    "동행 모집",
    "혼자도 좋지만, 함께라면 더 특별한 공연과 축제의 시간",
  ];

  const router = useRouter();
  const pathname = usePathname();
  const { ready, isLogined } = useLogin();

  // 상태 관리 (기본값으로 초기화)
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState("createdAt_desc");
  const [viewType, setViewType] = useState("Gallery");
  const [hideClosed, setHideClosed] = useState(false);

  const [selectedEventType, setSelectedEventType] = useState("전체");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 필터 상태 추가
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false); // sessionStorage 확인 완료 여부

  // 직접 상태 관리 (Events와 동일)
  const [togetherData, setTogetherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // 정렬 함수 (Events와 유사)
  const sortTogethers = (togethers, option) => {
    const sorted = [...togethers];

    switch (option) {
      case "createdAt_desc":
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "createdAt_asc":
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "event_desc":
        return sorted.sort((a, b) => new Date(b.meetingDate) - new Date(a.meetingDate));
      case "event_asc":
        return sorted.sort((a, b) => new Date(a.meetingDate) - new Date(b.meetingDate));
      default:
        return sorted;
    }
  };

  // 검색 함수 (실제 검색 로직만 수행 - Events와 동일한 패턴)
  const performSearch = async (keyword, skipModeSettings = false) => {
    try {
      if (!skipModeSettings) {
        setIsSearchMode(true);
        setIsFiltered(false);
      }
      setLoading(true);
      setError(null);

      // 현재 모든 검색 조건을 포함하되 검색어 덮어쓰기
      const searchParams = getCurrentSearchParams();
      searchParams.keyword = keyword;

      const raw = await togetherApi.search(searchParams);
      const mapped = Array.isArray(raw) ? raw.map(mapTogetherListItem) : [];
      const sortedResults = sortTogethers(mapped, sortOption);
      setTogetherData(sortedResults);
    } catch (error) {
      console.error("검색 실패:", error);
      setTogetherData([]);
      setError(error.message || "모임 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 검색바 핸들러 (상태 업데이트 + 검색)
  const handleSearch = async (keyword) => {
    setQuery(keyword);
    if (keyword.trim()) {
      await performSearch(keyword);
    }
  };

  // 재시도 함수
  const refetch = () => {
    if (query && query.trim()) {
      performSearch(query);
    } else {
      // 기본 데이터 로딩 로직 실행
      loadTogetherData();
    }
  };


  // 정렬 옵션 변경 시 재정렬 (Events와 동일)
  useEffect(() => {
    if (togetherData.length > 0) {
      const sortedData = sortTogethers(togetherData, sortOption);
      setTogetherData(sortedData);
    }
  }, [sortOption]);

  // 현재 모든 검색 조건을 통합하는 중앙 집중식 함수 (Events와 동일)
  const getCurrentSearchParams = () => {
    const params = {};

    // 검색어
    if (query && query.trim()) {
      params.keyword = query.trim();
    }

    // 이벤트 타입
    if (selectedEventType !== "전체") {
      const backendTypes = mapUiLabelToBackendTypes(selectedEventType);
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

  // 기본 데이터 로딩 useEffect (sessionStorage 확인 후, 검색 모드나 필터 적용 중이 아닐 때만)
  useEffect(() => {
    // sessionStorage 확인이 완료되지 않았으면 대기
    if (!sessionChecked) return;

    if (isSearchMode || isFiltered) return;

    const fetchTogethers = async () => {
      try {
        setLoading(true);
        setError(null);
        let raw = [];

        if (selectedEventType === "전체") {
          raw = await togetherApi.getAll();
        } else {
          const backendTypes = mapUiLabelToBackendTypes(selectedEventType);
          raw = await fetchTogetherByTypes(backendTypes, {});
        }

        const mapped = Array.isArray(raw) ? raw.map(mapTogetherListItem) : [];
        const sortedTogethers = sortTogethers(mapped, sortOption);
        setTogetherData(sortedTogethers);
      } catch (error) {
        console.error("동행 데이터를 가져오는데 실패했습니다:", error);
        setTogetherData([]);
        setError(error.message || "모임 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchTogethers();
  }, [sessionChecked, selectedEventType, isSearchMode, isFiltered]);

  // 페이지 레벨 관심 상태 동기화 이벤트 리스너 (Events 패턴 적용)
  useEffect(() => {
    console.log("🔵 Together 페이지 - together-interest-changed 이벤트 리스너 등록");

    const handleInterestChanged = (event) => {
      const { togetherId: changedTogetherId, interested } = event.detail;

      console.log("🔔 Together 페이지 - 관심 상태 변경 감지:", {
        changedTogetherId,
        interested
      });

      // Together 목록에서 해당 Together의 관심 상태 업데이트
      setTogetherData(prevTogethers => {
        const updated = prevTogethers.map(togetherItem => {
          if (String(togetherItem.togetherId) === String(changedTogetherId) ||
              String(togetherItem.id) === String(changedTogetherId)) {
            console.log(`✅ Together 페이지 - ${togetherItem.title}의 관심 상태 업데이트: ${interested}`);
            return {
              ...togetherItem,
              isInterested: interested
            };
          }
          return togetherItem;
        });

        console.log(`📊 Together 페이지 - 데이터 업데이트 완료`);
        return updated;
      });
    };

    // localStorage 변경 감지 (크로스 탭 동기화)
    const handleStorageChange = (e) => {
      if (!e.key || !e.key.startsWith('together_interest_')) return;

      try {
        const storageData = JSON.parse(e.newValue || '{}');
        const storageTogetherId = storageData.togetherId;
        const interested = Boolean(storageData.interested);

        console.log("💾 Together 페이지 - localStorage 관심 상태 변경 감지:", {
          storageTogetherId,
          interested
        });

        // 기존 handleInterestChanged 로직 재사용
        handleInterestChanged({
          detail: { togetherId: storageTogetherId, interested }
        });
      } catch (error) {
        console.error("❌ localStorage 관심 상태 파싱 실패:", error);
      }
    };

    window.addEventListener("together-interest-changed", handleInterestChanged);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      console.log("🔴 Together 페이지 - 이벤트 리스너들 해제");
      window.removeEventListener("together-interest-changed", handleInterestChanged);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

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
            setLoading(true);
            setError(null);

            const searchParams = { keyword: keyword.trim() };
            if (selectedEventType !== "전체") {
              const backendTypes = mapUiLabelToBackendTypes(selectedEventType);
              if (backendTypes.length === 1) {
                searchParams.eventType = backendTypes[0];
              }
            }

            const raw = await togetherApi.search(searchParams);
            const mapped = Array.isArray(raw) ? raw.map(mapTogetherListItem) : [];
            const sortedResults = sortTogethers(mapped, sortOption);
            setTogetherData(sortedResults);

            // 사용 후 삭제
            sessionStorage.removeItem('searchData');
          }
        }
      } catch (error) {
        console.error('통합검색 데이터 처리 실패:', error);
        setTogetherData([]);
        setError(error.message || "모임 목록을 불러오는데 실패했습니다.");
        sessionStorage.removeItem('searchData');
      } finally {
        setLoading(false);
        // sessionStorage 확인 완료 상태 설정 (검색 데이터가 있든 없든)
        setSessionChecked(true);
      }
    };

    handleSessionSearch();
  }, [selectedEventType, sortOption]);

  // 이벤트 타입 변경시 현재 조건 유지하며 재검색 (Events와 동일)
  useEffect(() => {
    if (isSearchMode || isFiltered) {
      const performTypeChangeSearch = async () => {
        try {
          setLoading(true);
          setError(null);

          // 현재 모든 조건을 유지하며 재검색
          const searchParams = getCurrentSearchParams();
          const raw = await togetherApi.search(searchParams);

          const mapped = Array.isArray(raw) ? raw.map(mapTogetherListItem) : [];
          const sortedTogethers = sortTogethers(mapped, sortOption);
          setTogetherData(sortedTogethers);
        } catch (error) {
          console.error("타입 변경 재검색 실패:", error);
          setTogetherData([]);
          setError(error.message || "모임 목록을 불러오는데 실패했습니다.");
        } finally {
          setLoading(false);
        }
      };

      performTypeChangeSearch();
    }
  }, [selectedEventType]); // selectedEventType 변경시에만 실행

  // 필터링 로직 (완료된 모집 숨기기만 클라이언트에서 처리)
  const filtered = useMemo(() => {
    const result = togetherData || [];

    // 완료된 모집 숨기기만 클라이언트에서 처리
    if (hideClosed) {
      return result.filter((it) => {
        const now = new Date();

        // 날짜 판정용 우선순위: meetingDate > companionDate > date > createdAt
        const rawDate =
          it.meetingDate || it.companionDate || it.date || it.createdAt;
        const isPast =
          rawDate != null
            ? (() => {
                const d = new Date(rawDate);
                return !Number.isNaN(d.getTime()) && d < now;
              })()
            : false;

        const isInactive = typeof it.active === "boolean" ? !it.active : false;

        const cur =
          typeof it.currentParticipants === "number"
            ? it.currentParticipants
            : typeof it.current === "number"
            ? it.current
            : null;
        const max =
          typeof it.maxParticipants === "number"
            ? it.maxParticipants
            : typeof it.maxPeople === "number"
            ? it.maxPeople
            : null;
        const isFull =
          cur != null && max != null ? Number(cur) >= Number(max) : false;

        // 완료된 모집(숨김): 기간지남 || inactive || 정원초과
        return !(isPast || isInactive || isFull);
      });
    }

    return result;
  }, [togetherData, hideClosed]);

  // 필터 적용 핸들러 (누적 필터링 - Events와 동일)
  const handleApplyFilters = async (filterData) => {
    try {
      setIsFiltered(true);
      setLoading(true);
      setError(null);

      // 현재 모든 검색 조건을 포함 (검색어, 이벤트 타입 포함)
      const searchParams = getCurrentSearchParams();

      // 새로운 필터 조건 추가/덮어쓰기
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

      if (filterData.dateRange && filterData.dateRange[0] && filterData.dateRange[1]) {
        searchParams.startDate = filterData.dateRange[0];
        searchParams.endDate = filterData.dateRange[1];
      }

      const raw = await togetherApi.search(searchParams);
      const mapped = Array.isArray(raw) ? raw.map(mapTogetherListItem) : [];
      const sortedTogethers = sortTogethers(mapped, sortOption);
      setTogetherData(sortedTogethers);
      setAppliedFilters(filterData);

      console.log(`필터링 결과: ${mapped.length}개 동행모집글`);
    } catch (error) {
      console.error("필터 적용 실패:", error);
      setTogetherData([]);
      setError(error.message || "필터 적용에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 필터 초기화
  const handleClearFilters = () => {
    setIsFiltered(false);
    setAppliedFilters(null);
    // 기본 데이터 다시 로드 (기본 데이터 로딩 useEffect가 실행됨)
  };

  const handleWrite = () => {
    if (!ready) return;
    if (isLogined) return router.push("/together/write");
    // 로그인 가드: 로그인 후 글쓰기 페이지로 복귀
    router.push(`/login?next=${encodeURIComponent("/together/write")}`);
  };

  return (
    <>
      <h1 className="text-4xl font-bold py-[10px] h-16 px-6">{title}</h1>
      <p className="text-xl pt-[10px] h-12 fill-gray-600 px-6">{intro}</p>
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-8">
        <div className="relative w-full h-[370px] overflow-hidden ">
          <div className="min-w-full h-full relative flex-shrink-0">
            <img
              src={"/img/togetherbanner.jpg"}
              alt={"배너이미지"}
              className="w-full h-full object-cover block"
            />
          </div>
        </div>
      </div>
      <EventSelector
        selected={selectedEventType}
        setSelected={setSelectedEventType}
      />

      {/* 필터 적용된 상태 표시 */}
      {appliedFilters && (
        <div className="px-6 mb-4 p-3 bg-blue-50 rounded flex justify-between items-center">
          <div>
            <span className="text-sm font-medium text-blue-800">
              필터 적용됨:{" "}
            </span>
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
            className="text-sm text-red-500 hover:text-red-700">
            필터 해제
          </button>
        </div>
      )}

      <div className="px-2.5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">
            {query.trim() ? `"${query.trim()}" 검색 결과` : selectedEventType}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewType("Gallery")}
              className="p-2"
              title="갤러리 보기">
              <Image
                src={ICONS.MENU}
                alt="갤러리 보기"
                width={20}
                height={20}
                className={
                  viewType === "Gallery" ? "opacity-100" : "opacity-40"
                }
              />
            </button>
            <button
              onClick={() => setViewType("List")}
              className="p-2"
              title="리스트 보기">
              <Image
                src={ICONS.LIST}
                alt="리스트 보기"
                width={20}
                height={20}
                className={viewType === "List" ? "opacity-100" : "opacity-40"}
              />
            </button>
            {/* 완료된 모집도 표시 */}
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={!hideClosed}
                onChange={(e) => setHideClosed(!e.target.checked)}
              />
              완료된 모집글 표시
            </label>
          </div>
        </div>

        {/* 우측: 검색/필터/정렬/글쓰기  */}
        <div className="flex items-center gap-2">
          <SearchFilterSort
            filterAction={() => setIsFilterOpen(true)}
            sortAction={(newSortOption) => setSortOption(newSortOption)}
            sortOption={sortOption}
            sortOptions={togetherSortOptions}
            searchValue={query}
            onSearchChange={setQuery}
            onSearch={handleSearch}
          />

          {ready && isLogined ? (
            <button
              className="h-10 px-4 rounded bg-blue-600 text-white hover:bg-blue-500"
              onClick={handleWrite}>
              글작성
            </button>
          ) : null}
        </div>
      </div>

      {/* 검색 결과 수 */}
      <div className="px-2.5 text-sm text-gray-500">
        {loading ? (
          "불러오는 중…"
        ) : error ? (
          <div className="flex items-center gap-2">
            <span className="text-red-500">오류: {error}</span>
            <button
              onClick={refetch}
              className="text-blue-500 underline text-xs">
              재시도
            </button>
          </div>
        ) : (
          `총 ${filtered.length}건`
        )}
      </div>

      {/* 본문 */}
      {loading ? (
        <div className="p-6 text-gray-500 text-center">
          <div>불러오는 중…</div>
        </div>
      ) : error ? (
        <div className="p-6 text-center">
          <div className="text-red-500 mb-4">
            모임 목록을 불러오는데 실패했습니다.
          </div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            다시 시도
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-6 text-gray-500 text-center">
          {query.trim() || isFiltered
            ? "조건에 맞는 모임이 없습니다."
            : "등록된 모임이 없습니다."}
        </div>
      ) : viewType === "Gallery" ? (
        <GalleryLayout Component={TogetherGallery} items={filtered} />
      ) : (
        <div className="space-y-0">
          {filtered.map((it) => (
            <TogetherList key={String(it.togetherId ?? it.id)} {...it} />
          ))}
        </div>
      )}

      <TogetherFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </>
  );
}
