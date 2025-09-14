"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";
import SearchToWrite from "@/components/community/SearchToWrite";
import Calendar from "@/components/global/Calendar";
import RegionSelector from "@/components/global/RegionSelector";

export default function TogetherWriteForm({
  onEventSelect,
  onLocationSearch,
  onFormChange,
  initialData = {},
  hideEventPicker = false,
}) {
  // 내부 폼 상태
  const [formData, setFormData] = useState({
    companionDate: "",
    maxParticipants: 2,
    meetingRegion: { level1: "", level2: "", level3: "" },
    meetingLocation: "",
  });

  const [selectedDates, setSelectedDates] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);

  // 초기 데이터 1회만 주입
  const appliedInitialRef = useRef(false);
  useEffect(() => {
    if (appliedInitialRef.current) return;
    if (!initialData) return;

    const safeRegion =
      initialData?.meetingRegion &&
      typeof initialData.meetingRegion === "object"
        ? {
            level1: initialData.meetingRegion.level1 || "",
            level2: initialData.meetingRegion.level2 || "",
            level3: initialData.meetingRegion.level3 || "",
          }
        : { level1: "", level2: "", level3: "" };

    const hasAny =
      !!initialData.companionDate ||
      !!initialData.meetingLocation ||
      !!safeRegion.level1 ||
      !!safeRegion.level2 ||
      !!safeRegion.level3 ||
      initialData.maxParticipants !== undefined;

    if (!hasAny) return;

    const next = {
      companionDate: initialData.companionDate || "",
      maxParticipants: Number.isFinite(Number(initialData.maxParticipants))
        ? Number(initialData.maxParticipants)
        : 2,
      meetingRegion: safeRegion,
      meetingLocation: initialData.meetingLocation || "",
      ...initialData,
    };

    setFormData(next);

    if (next.companionDate) {
      const d = new Date(`${next.companionDate}T00:00:00`);
      if (!Number.isNaN(d.getTime())) setSelectedDates([d]);
    }

    onFormChange?.(next);
    appliedInitialRef.current = true;
  }, [initialData, onFormChange]);

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  // 입력 변경
  const handleInputChange = (field, value) => {
    let v = value;
    if (field === "maxParticipants") {
      const num = Number.isFinite(Number(v)) ? Number(v) : 2;
      v = clamp(num, 2, 100);
    }
    const next = { ...formData, [field]: v };
    setFormData(next);
    onFormChange?.(next);
  };

  // 이벤트 선택(작성 전용)
  const handleEventSelect = (eventCard) => {
    onEventSelect?.(eventCard);
  };

  // 지역 변경
  const handleRegionChange = (region) => {
    const safe = {
      level1: region?.level1 || "",
      level2: region?.level2 || "",
      level3: region?.level3 || "",
    };
    const next = { ...formData, meetingRegion: safe };
    setFormData(next);
    onFormChange?.(next);
  };

  // 날짜 변경
  const handleDatesChange = (dates) => {
    setSelectedDates(dates);
    setShowCalendar(false);
    if (dates.length > 0) {
      const y = dates[0].getFullYear();
      const m = String(dates[0].getMonth() + 1).padStart(2, "0");
      const d = String(dates[0].getDate()).padStart(2, "0");
      handleInputChange("companionDate", `${y}-${m}-${d}`);
    }
  };

  // 표시용 날짜
  const displayDate = (() => {
    if (selectedDates.length > 0) {
      const y = selectedDates[0].getFullYear();
      const m = String(selectedDates[0].getMonth() + 1).padStart(2, "0");
      const d = String(selectedDates[0].getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
    return formData.companionDate || "";
  })();

  const openCalendar = () => {
    if (selectedDates.length === 0 && formData.companionDate) {
      const d = new Date(`${formData.companionDate}T00:00:00`);
      if (!Number.isNaN(d.getTime())) setSelectedDates([d]);
    }
    setShowCalendar((prev) => !prev);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white relative overflow-visible">
      <div className="space-y-4">
        {/* 이벤트 선택/추가 (필요 시 숨김) */}
        {!hideEventPicker && (
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-700 w-32 flex-shrink-0">
              이벤트 선택/추가
            </label>
            <div className="w-1/3">
              <SearchToWrite onSelect={handleEventSelect} />
            </div>
          </div>
        )}

        {/* 동행 날짜 */}
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-700 w-32 flex-shrink-0">
            동행 날짜
          </label>
          <div className="relative w-1/4">
            <button
              onClick={openCalendar}
              className="w-full h-8 px-2 bg-transparent text-sm border-0 border-b border-gray-300 focus:outline-none focus:border-blue-500 text-left">
              {displayDate || "연도 - 월 - 일"}
            </button>
            <Image
              src={ICONS.CALENDAR}
              alt="calendar"
              width={16}
              height={16}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
            />
          </div>
        </div>

        {/* 최대 참여자 수 */}
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-700 w-32 flex-shrink-0">
            최대 참여자 수
          </label>
          <div className="relative w-1/6">
            <input
              type="number"
              value={formData.maxParticipants}
              onChange={(e) =>
                handleInputChange("maxParticipants", e.target.value)
              }
              min="2"
              max="100"
              className="w-full h-8 px-2 bg-transparent text-sm border-0 border-b border-gray-300 focus:outline-none focus:border-blue-500"
              placeholder="2~100명"
            />
          </div>
        </div>

        {/* 모임장소 */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="mb-4">
            <label className="text-sm text-gray-700 font-medium">
              모임장소 <span className="text-red-500">*</span>
            </label>
          </div>

          {/* 지역 선택 */}
          <div className="flex items-center gap-4 mb-3">
            <label className="text-sm text-gray-700 w-32 flex-shrink-0">
              지역
            </label>
            <RegionSelector
              value={formData.meetingRegion}
              onChange={handleRegionChange}
            />
          </div>

          {/* 상세 장소 */}
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-700 w-32 flex-shrink-0">
              모임장소
            </label>
            <input
              type="text"
              value={formData.meetingLocation}
              onChange={(e) =>
                handleInputChange("meetingLocation", e.target.value)
              }
              className="w-1/2 h-8 px-2 bg-transparent text-sm border-0 border-b border-gray-300 focus:outline-none focus:border-blue-500"
              placeholder="예: 스타벅스 역삼점, 2호선 강남역 3번출구"
            />
          </div>
        </div>
      </div>

      {/* 캘린더 (필터창 밖으로 나오도록) */}
      {showCalendar && (
        <div className="absolute top-20 left-44 z-30">
          <Calendar
            onDatesChange={handleDatesChange}
            selectedDates={selectedDates}
            mode="single"
            className="max-w-xs w-80 shadow-xl"
          />
        </div>
      )}
    </div>
  );
}
