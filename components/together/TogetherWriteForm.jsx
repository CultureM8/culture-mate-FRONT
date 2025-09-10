"use client";

import { useState } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";
import SearchToWrite from "@/components/community/SearchToWrite";
import Calendar from "@/components/global/Calendar";

export default function TogetherWriteForm({
  onEventSelect,
  onLocationSearch,
  onFormChange,
  initialData = {},
}) {
  const [formData, setFormData] = useState({
    companionDate: initialData.companionDate || "",
    companionCount: initialData.companionCount || "00 명",
    minAge: initialData.minAge || "제한없음",
    maxAge: initialData.maxAge || "제한없음",
    locationQuery: initialData.locationQuery || "",
    ...initialData,
  });

  const [selectedDates, setSelectedDates] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);

  // 폼 데이터 변경 핸들러
  const handleInputChange = (field, value) => {
    const newFormData = {
      ...formData,
      [field]: value,
    };
    setFormData(newFormData);

    // 부모 컴포넌트에 변경사항 전달
    if (onFormChange) {
      onFormChange(newFormData);
    }
  };

  // 이벤트 선택 핸들러
  const handleEventSelect = (eventCard) => {
    if (onEventSelect) {
      onEventSelect(eventCard);
    }
  };

  // 지역 검색 핸들러
  const handleLocationSearch = () => {
    if (onLocationSearch) {
      onLocationSearch(formData.locationQuery);
    }
    console.log("지역 검색:", formData.locationQuery);
  };

  // 날짜 변경 핸들러
  const handleDatesChange = (dates) => {
    setSelectedDates(dates);
    setShowCalendar(false);
    if (dates.length > 0) {
      const dateStr = `${dates[0].getFullYear()}-${String(
        dates[0].getMonth() + 1
      ).padStart(2, "0")}-${String(dates[0].getDate()).padStart(2, "0")}`;
      handleInputChange("companionDate", dateStr);
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white relative overflow-visible">
      <div className="space-y-4">
        {/* 이벤트 선택/추가 */}
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-700 w-32 flex-shrink-0">
            이벤트 선택/추가
          </label>
          <div className="w-1/3">
            <SearchToWrite onSelect={handleEventSelect} />
          </div>
        </div>

        {/* 동행 날짜 */}
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-700 w-32 flex-shrink-0">
            동행 날짜
          </label>
          <div className="relative w-1/4">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full h-8 px-2 bg-transparent text-sm border-0 border-b border-gray-300 focus:outline-none focus:border-blue-500 text-left">
              {selectedDates.length > 0
                ? `${selectedDates[0].getFullYear()}-${String(
                    selectedDates[0].getMonth() + 1
                  ).padStart(2, "0")}-${String(
                    selectedDates[0].getDate()
                  ).padStart(2, "0")}`
                : "연도 - 월 - 일"}
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

        {/* 동행 인원 */}
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-700 w-32 flex-shrink-0">
            동행 인원
          </label>
          <div className="relative w-1/6">
            <select
              value={formData.companionCount}
              onChange={(e) =>
                handleInputChange("companionCount", e.target.value)
              }
              className="w-full h-8 px-2 bg-transparent text-sm border-0 border-b border-gray-300 appearance-none focus:outline-none focus:border-blue-500">
              <option value="00 명">00 명</option>
              <option value="1명">1명</option>
              <option value="2명">2명</option>
              <option value="3명">3명</option>
              <option value="4명">4명</option>
              <option value="5명">5명</option>
              <option value="6명">6명</option>
              <option value="7명">7명</option>
              <option value="8명">8명</option>
              <option value="9명">9명</option>
              <option value="10명+">10명+</option>
            </select>
            <Image
              src={ICONS.DOWN_ARROW}
              alt="dropdown"
              width={14}
              height={14}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
            />
          </div>
        </div>

        {/* 나이 제한 */}
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-700 w-32 flex-shrink-0">
            나이 제한
          </label>
          <div className="flex items-center gap-2">
            {/* 최소 나이 */}
            <div className="relative">
              <select
                value={formData.minAge || "제한없음"}
                onChange={(e) => handleInputChange("minAge", e.target.value)}
                className="w-24 h-8 px-2 bg-transparent text-sm border-0 border-b border-gray-300 appearance-none focus:outline-none focus:border-blue-500">
                <option value="제한없음">제한없음</option>
                <option value="7세미만">7세미만</option>
                {Array.from({ length: 52 }, (_, i) => i + 8).map((age) => (
                  <option key={age} value={age}>
                    {age}세
                  </option>
                ))}
                <option value="60세이상">60세이상</option>
              </select>
              <Image
                src={ICONS.DOWN_ARROW}
                alt="dropdown"
                width={12}
                height={12}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none"
              />
            </div>

            {/* 구분자 */}
            <span className="text-gray-500">~</span>

            {/* 최대 나이 */}
            <div className="relative">
              <select
                value={formData.maxAge || "제한없음"}
                onChange={(e) => handleInputChange("maxAge", e.target.value)}
                className="w-24 h-8 px-2 bg-transparent text-sm border-0 border-b border-gray-300 appearance-none focus:outline-none focus:border-blue-500">
                <option value="제한없음">제한없음</option>
                <option value="7세미만">7세미만</option>
                {Array.from({ length: 52 }, (_, i) => i + 8).map((age) => {
                  // 최소 나이가 설정되어 있고, 현재 나이가 최소 나이보다 작으면 비활성화
                  const isDisabled =
                    formData.minAge !== "제한없음" &&
                    formData.minAge !== "" &&
                    formData.minAge !== "7세미만" &&
                    formData.minAge !== "60세이상" &&
                    age < parseInt(formData.minAge);

                  return (
                    <option
                      key={age}
                      value={age}
                      disabled={isDisabled}
                      style={isDisabled ? { color: "#ccc" } : {}}>
                      {age}세
                    </option>
                  );
                })}
                <option value="60세이상">60세이상</option>
              </select>
              <Image
                src={ICONS.DOWN_ARROW}
                alt="dropdown"
                width={12}
                height={12}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* 이벤트 주소 */}
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-700 w-32 flex-shrink-0">
            이벤트 주소
          </label>
          <div className="relative w-1/3">
            <input
              type="text"
              value={formData.locationQuery}
              onChange={(e) =>
                handleInputChange("locationQuery", e.target.value)
              }
              className="w-full h-10 px-4 pr-12 border border-gray-300 rounded-full bg-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="검색"
            />
            <button
              onClick={handleLocationSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-gray-100 rounded-full p-1">
              <Image src={ICONS.SEARCH} alt="search" width={18} height={18} />
            </button>
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
