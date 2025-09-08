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

  // URL 파라미터 ↔ 상태 동기화 (q, sort, view)
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [sortOption, setSortOption] = useState(
    searchParams.get("sort") ?? "createdAt_desc"
  );
  const [viewType, setViewType] = useState(
    searchParams.get("view") === "List" ? "List" : "Gallery"
  );

  const [selectedEventType, setSelectedEventType] = useState("전체");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // hook: 서버/스토리지에서 가져온 원본 목록
  const { items, loading } = useTogetherItems(selectedEventType, sortOption);

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

    const qs = params.toString();
    const nextUrl = qs ? `${pathname}?${qs}` : pathname;
    // 스크롤 유지
    router.replace(nextUrl, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sortOption, viewType]);

  // 검색어로 클라이언트 필터링 (hook이 정렬/타입 필터는 수행한다고 가정)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items || [];
    const safe = (v) => (v == null ? "" : String(v));
    return (items || []).filter((it) => {
      // 안전한 멀티 필드 매칭: title / content / 작성자명 / 이벤트명 / 설명 등
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
  }, [items, query]);

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

      <div className="border w-full h-[200px] flex items-center justify-center relative z-10">
        <div className="border w-full h-full flex items-center justify-center relative z-10 bg-white">
          <img
            src="/together-main-img/togetherBanner.png"
            alt="동행 모집 배너"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>

      <EventSelector
        selected={selectedEventType}
        setSelected={setSelectedEventType}
      />

      <div className="px-2.5 h-16 flex items-center justify-between">
        {/* 좌측: 뷰 토글 */}
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
          </div>
        </div>

        {/* 우측: 검색/필터/정렬/글쓰기 */}
        <div className="flex items-center gap-2">
          {/* ✅ SearchBar는 value/onChange/onSearch를 지원 (없어도 동작하지만, 지원하면 더 좋음) */}
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
            {/* 기타 */}
            <option value="views_desc">조회수많은순</option>
          </select>

          {ready && isLogined ? (
            <button className="flex items-center gap-2" onClick={handleWrite}>
              글쓰기
              <Image
                src={ICONS.ADD_WRITE}
                alt="글쓰기"
                width={24}
                height={24}
              />
            </button>
          ) : null}
        </div>
      </div>

      {/* 검색 결과 수 */}
      <div className="px-2.5 text-sm text-gray-500">
        {loading ? "불러오는 중…" : `총 ${filtered.length}건`}
      </div>

      {/* 본문 */}
      {loading ? (
        <div className="p-6 text-gray-500">불러오는 중…</div>
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
      />
    </>
  );
}
