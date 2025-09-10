"use client";

import { useState, useEffect, useMemo } from "react";
import HistoryEvent from "@/components/mypage/history/HistoryEvent";
import HistoryWith from "@/components/mypage/history/HistoryWith";
import { togetherData } from "@/lib/togetherData";
import { getAllEvents } from "@/lib/eventData";

export default function History() {
  const [activeTab, setActiveTab] = useState("event");
  const [eventData, setEventData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  // 데이터 로드
  useEffect(() => {
    if (activeTab !== "event") return;
    let mounted = true;
    (async () => {
      const list = await getAllEvents();
      // id가 없으면 eventId를 href에서 추출하는 fallback
      const normalized = (list ?? []).map((it) => ({
        id:
          it.id ??
          it.eventId ??
          (typeof it.href === "string" ? it.href.split("/").pop() : undefined),
        ...it,
      }));
      if (mounted) setEventData(normalized);
    })();
    return () => {
      mounted = false;
    };
  }, [activeTab]);

  // 편집 모드 토글
  const onToggleEdit = () => {
    setEditMode((v) => !v);
    setSelectedIds(new Set()); // 모드 전환 시 선택 초기화
  };

  // 카드 선택 토글
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 선택 삭제
  const onDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (!confirm("선택한 항목을 삭제하시겠습니까?")) return;
    setEventData((prev) => prev.filter((it) => !selectedIds.has(it.id)));
    setSelectedIds(new Set());
  };

  // ✅ 카드에 편집 관련 prop을 주입해서 내려보냄
  const itemsWithEditProps = useMemo(
    () =>
      eventData.map((it) => ({
        ...it,
        editMode,
        selected: selectedIds.has(it.id),
        onToggleSelect: toggleSelect,
        enableInterest: !editMode, // 편집 중엔 하트 숨김
      })),
    [eventData, editMode, selectedIds]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#26282a]">히스토리</h1>
        </div>

        <div>
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("event")}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "event"
                  ? "text-[#26282a] border-[#26282a]"
                  : "text-[#76787a] border-transparent hover:text-[#26282a]"
              }`}>
              이벤트 리뷰
            </button>
            <button
              onClick={() => setActiveTab("together")}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "together"
                  ? "text-[#26282a] border-[#26282a]"
                  : "text-[#76787a] border-transparent hover:text-[#26282a]"
              }`}>
              동행 기록
            </button>
          </div>
        </div>

        {activeTab === "event" ? (
          <div>
            <HistoryEvent />
            {/* <GalleryLayout
              Component={HistoryEvent}
              items={itemsWithEditProps}
            /> */}
          </div>
        ) : (
          <HistoryWith togetherData={togetherData} />
        )}
      </div>
    </div>
  );
}
