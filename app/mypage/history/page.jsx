"use client";

import { useState, useEffect, useMemo } from "react";
import HistoryEvent from "@/components/mypage/history/HistoryEvent";
import HistoryWith from "@/components/mypage/history/HistoryWith";
import { togetherApi } from "@/lib/api/togetherApi";
import { getEvents } from "@/lib/api/eventApi";

export default function History() {
  const [activeTab, setActiveTab] = useState("event");
  const [eventData, setEventData] = useState([]);
  const [guestApps, setGuestApps] = useState([]); // ✅ 내 신청 내역(게스트)

  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  // 이벤트 탭 데이터 로드 (기존 유지)
  useEffect(() => {
    if (activeTab !== "event") return;
    let mounted = true;
    (async () => {
      try {
        const list = await getEvents();
        const normalized = (list ?? []).map((it) => ({
          id:
            it.id ??
            it.eventId ??
            (typeof it.href === "string"
              ? it.href.split("/").pop()
              : undefined),
          ...it,
        }));
        if (mounted) setEventData(normalized);
      } catch {
        if (mounted) setEventData([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [activeTab]);

  // ✅ 동행 탭: 내 신청(게스트, 승인됨) 로드
  useEffect(() => {
    if (activeTab !== "together") return;
    let mounted = true;
    (async () => {
      try {
        const apps = await togetherApi.getMyApplications("APPROVED");
        if (mounted) setGuestApps(Array.isArray(apps) ? apps : []);
      } catch (e) {
        if (mounted) setGuestApps([]);
        console.warn("동행 게스트(내 신청) 로드 실패:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [activeTab]);

  // 편집 모드 토글 (이벤트 탭에서만 사용 — 기존 그대로)
  const onToggleEdit = () => {
    setEditMode((v) => !v);
    setSelectedIds(new Set()); // 모드 전환 시 선택 초기화
  };

  // 카드 선택 토글 (이벤트 탭 — 기존 그대로)
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 선택 삭제 (이벤트 탭 — 기존 그대로)
  const onDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (!confirm("선택한 항목을 삭제하시겠습니까?")) return;
    setEventData((prev) => prev.filter((it) => !selectedIds.has(it.id)));
    setSelectedIds(new Set());
  };

  // 이벤트 카드에 편집 prop 주입 (기존 그대로)
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
            {/* 이벤트 탭에서 itemsWithEditProps 사용 시 아래 주석 해제 */}
            {/* <GalleryLayout Component={HistoryEvent} items={itemsWithEditProps} /> */}
          </div>
        ) : (
          //  게스트(내 신청) 목록을 HistoryWith로 전달
          <HistoryWith togetherData={guestApps} />
        )}
      </div>
    </div>
  );
}
