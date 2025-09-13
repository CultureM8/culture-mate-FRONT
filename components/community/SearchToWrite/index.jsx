"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";
import { toCard } from "@/lib/schema";
import { searchEvents } from "@/lib/api/eventApi"; // ✅ 백엔드 연동
import EventTile from "./EventTile";

export default function SearchToWrite({ onSelect = () => {} }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [warnOpen, setWarnOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const MIN_QUERY_LEN = 1;
  const PAGE_SIZE = 6;

  // eventApi.searchEvents() 결과를 카드 호환 형태로 변환
  const transformFromApi = (events = []) =>
    events.map((e) => ({
      id: e.id, // string
      name: e.title, // 카드에서 쓰는 이름
      eventName: e.title, // 기존 호환
      eventType: e.eventType,
      type: e.eventType, // 기존 호환
      image: e.imgSrc || "/img/default_img.svg", // 기본이미지 폴백
      description: e.title,
      rating: e.score ?? 0, // (api엔 avgRating 없어서 0)
      likes: e.interestCount ?? 0,
      postsCount: 0,
      isLiked: false,
    }));

  // 바디 스크롤 잠금 유지 (기존 동작 그대로)
  useEffect(() => {
    const isModalOpen = open || warnOpen;

    if (isModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [open, warnOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < MIN_QUERY_LEN) {
      setWarnOpen(true);
      return;
    }

    try {
      // ✅ 백엔드 검색 호출
      const apiList = await searchEvents({ keyword: q });
      const transformed = transformFromApi(apiList);
      setResults(transformed.map(toCard));
      setShowAll(false);
      setOpen(true);
    } catch (err) {
      console.error("이벤트 검색 실패:", err);
      setResults([]);
      setShowAll(false);
      setOpen(true);
    }
  };

  const handlePick = (card) => {
    onSelect(card);
    setOpen(false);
  };

  const visible = showAll ? results : results.slice(0, PAGE_SIZE);

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex items-center h-8 w-[clamp(50px,30vw,300px)]
          border border-gray-300 rounded-full p-3 gap-2 ">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent focus:outline-none focus:placeholder:opacity-0 text-sm "
          placeholder="검색어를 입력해주세요"
        />
        <button type="submit" className="hover:cursor-pointer">
          <Image src={ICONS.SEARCH} alt="search" width={24} height={24} />
        </button>
      </form>

      {/* 결과 모달 */}
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-[1000px] max-h-[75vh] rounded-lg p-4 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">검색 결과</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-sm text-gray-500">
                닫기
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {results.length === 0 ? (
                <div className="text-sm text-gray-500 py-8 text-center">
                  검색 결과가 없습니다.
                </div>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {visible.map((card) => (
                    <li key={card.id || `${card.eventName}-${card.eventType}`}>
                      <EventTile card={card} onPick={handlePick} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 더보기 / 접기 */}
            {results.length > PAGE_SIZE && (
              <div className="mt-3 flex justify-center">
                {!showAll ? (
                  <button
                    className="px-4 py-2 text-sm border rounded"
                    onClick={() => setShowAll(true)}>
                    더보기
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 text-sm border rounded"
                    onClick={() => {
                      setShowAll(false);
                      const scroller = document.querySelector(
                        ".bg-white.w-full.max-w-\\[1000px\\].max-h-\\[75vh\\].rounded-lg.p-4.flex.flex-col.overflow-hidden .overflow-y-auto"
                      );
                      scroller?.scrollTo({ top: 0, behavior: "smooth" });
                    }}>
                    접기
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 검색어 부족 경고  */}
      {warnOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
          <div className="bg-white w-full max-w-[360px] rounded-lg p-5 text-center">
            <div className="text-base font-medium mb-2">
              검색어가 필요합니다
            </div>
            <div className="text-sm text-gray-600 mb-5">
              검색어를 {MIN_QUERY_LEN}자 이상 입력해 주세요.
            </div>
            <button
              className="px-4 py-2 text-sm rounded bg-gray-900 text-white"
              onClick={() => setWarnOpen(false)}>
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
