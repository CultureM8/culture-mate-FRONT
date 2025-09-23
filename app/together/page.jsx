"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ICONS } from "@/constants/path";
import GalleryLayout from "@/components/global/GalleryLayout";
import TogetherGallery from "@/components/together/TogetherGallery";
import TogetherList from "@/components/together/TogetherList";
import EventSelector from "@/components/global/EventSelector";
import SearchBar from "@/components/global/SearchBar";
import TogetherFilterModal from "@/components/together/TogetherFilterModal";
import useLogin from "@/hooks/useLogin";
import useTogetherItems from "@/hooks/useTogetherItems";

export default function TogetherPage() {
  const [title, intro] = [
    "동행 모집",
    "혼자도 좋지만, 함께라면 더 특별한 공연과 축제의 시간",
  ];

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { ready, isLogined } = useLogin();

  // URL 파라미터 ↔ 상태 동기화 (q, sort, view, hideClosed)
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [sortOption, setSortOption] = useState(
    searchParams.get("sort") ?? "createdAt_desc"
  );
  const [viewType, setViewType] = useState(
    searchParams.get("view") === "List" ? "List" : "Gallery"
  );

  // 완료된 모집 숨기기 체크박스 (쿼리로부터 초기화)
  const [hideClosed, setHideClosed] = useState(
    searchParams.get("hideClosed") ? (searchParams.get("hideClosed") === "1") : true
  );

  const [selectedEventType, setSelectedEventType] = useState("전체");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 필터 상태 추가
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const { items, loading, error, refetch } = useTogetherItems(
    selectedEventType,
    sortOption
  );

  // URL 업데이트
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    // q
    if (query?.trim()) params.set("q", query.trim());
    else params.delete("q");
    // sort
    if (sortOption && sortOption !== "createdAt_desc")
      params.set("sort", sortOption);
    else params.delete("sort");
    // view
    if (viewType !== "Gallery") params.set("view", viewType);
    else params.delete("view");
    // hideClosed
    if (hideClosed) params.set("hideClosed", "1");
    else params.delete("hideClosed");

    const qs = params.toString();
    const nextUrl = qs ? `${pathname}?${qs}` : pathname;
    // 스크롤 유지
    router.replace(nextUrl, { scroll: false });
  }, [query, sortOption, viewType, hideClosed]);

  // 검색어 + 이벤트타입 + 지역 + 완료 숨기기 필터링
  const filtered = useMemo(() => {
    let result = items || [];

    // 1) 이벤트 타입
    if (selectedEventType !== "전체") {
      result = result.filter((item) => {
        const itemEventType = item.eventType;

        // 복합 타입 처리
        if (selectedEventType === "클래식/무용") {
          return itemEventType === "클래식" || itemEventType === "무용";
        }
        if (selectedEventType === "콘서트/페스티벌") {
          return itemEventType === "콘서트" || itemEventType === "페스티벌";
        }
        // 단일 타입 매칭 (전시/전시회 교차 허용)
        if (selectedEventType === "전시") {
          return itemEventType === "전시" || itemEventType === "전시회";
        }
        return itemEventType === selectedEventType;
      });
    }

    // 2) 검색어
    const q = query.trim().toLowerCase();
    if (q) {
      const safe = (v) => (v == null ? "" : String(v));
      result = result.filter((it) => {
        const hay = [
          safe(it.title),
          safe(it.content),
          safe(it.authorName),
          safe(it.authorNickname),
          safe(it.nickname),
          safe(it.loginId),
          safe(it.eventName),
          safe(it.name),
          safe(it.description),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    // 3) 지역 필터
    if (isFiltered && appliedFilters?.selectedRegion) {
      const selectedRegion = appliedFilters.selectedRegion;

      result = result.filter((item) => {
        const itemRegion = item.region || item.location;
        if (!itemRegion) return false;

        if (selectedRegion.location1 && selectedRegion.location1 !== "전체") {
          if (
            itemRegion.level1 !== selectedRegion.location1 &&
            itemRegion.city !== selectedRegion.location1 &&
            itemRegion.location1 !== selectedRegion.location1
          ) {
            return false;
          }
        }

        if (selectedRegion.location2 && selectedRegion.location2 !== "전체") {
          if (
            itemRegion.level2 !== selectedRegion.location2 &&
            itemRegion.district !== selectedRegion.location2 &&
            itemRegion.location2 !== selectedRegion.location2
          ) {
            return false;
          }
        }

        if (selectedRegion.location3 && selectedRegion.location3 !== "전체") {
          if (
            itemRegion.level3 !== selectedRegion.location3 &&
            itemRegion.dong !== selectedRegion.location3 &&
            itemRegion.location3 !== selectedRegion.location3
          ) {
            return false;
          }
        }

        return true;
      });
    }

    // 완료된 모집 숨기기 (기간 지남 OR inactive OR 정원 초과)
    if (hideClosed) {
      result = result.filter((it) => {
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
  }, [items, query, selectedEventType, isFiltered, appliedFilters, hideClosed]);

  // 필터 적용 핸들러
  const handleApplyFilters = (filterData) => {
    setIsFiltered(true);
    setAppliedFilters(filterData);
  };

  // 필터 초기화
  const handleClearFilters = () => {
    setIsFiltered(false);
    setAppliedFilters(null);
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
          <h2 className="text-xl font-semibold">{selectedEventType}</h2>
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
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={(q) => setQuery(q)}
          />

          <button
            className="flex items-center gap-3"
            onClick={() => setIsFilterOpen(true)}>
            필터
            <Image src={ICONS.FILTER} alt="필터" width={24} height={24} />
          </button>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="h-10 px-2 bg-white">
            {/* 작성일 기준 */}
            <option value="createdAt_desc">최근 작성순</option>
            <option value="createdAt_asc">작성 오래된순</option>
            {/* 이벤트 날짜 기준 */}
            <option value="event_desc">최근 이벤트순</option>
            <option value="event_asc">오래된 이벤트순</option>
          </select>

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
