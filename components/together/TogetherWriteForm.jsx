"use client";

import { useState, useEffect } from "react";
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
}) {
  const [formData, setFormData] = useState({
    companionDate: initialData.companionDate || "",
    maxParticipants: initialData.maxParticipants || 2,
    // minAge: initialData.minAge || "제한없음", // 백엔드 미지원으로 주석처리
    // maxAge: initialData.maxAge || "제한없음", // 백엔드 미지원으로 주석처리
    // 모임장소 관련 필드
    meetingRegion: initialData.meetingRegion || { level1: "", level2: "", level3: "" },
    meetingLocation: initialData.meetingLocation || "", // 간단한 모임장소 (카페명, 지하철역 등)
    ...initialData,
  });

  const [selectedDates, setSelectedDates] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);

  // initialData가 변경될 때 formData와 selectedDates 업데이트
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // formData 업데이트
      setFormData(prevFormData => ({
        ...prevFormData,
        ...initialData,
      }));

      // 캘린더 날짜 초기화 (companionDate가 있는 경우)
      if (initialData.companionDate) {
        try {
          const dateObj = new Date(initialData.companionDate + 'T00:00:00');
          if (!isNaN(dateObj.getTime())) {
            setSelectedDates([dateObj]);
          }
        } catch (error) {
          console.error("날짜 파싱 실패:", error);
        }
      }
    }
  }, [initialData]);

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

  // 모임장소 지역 선택 핸들러
  const handleRegionChange = (region) => {
    const newFormData = {
      ...formData,
      meetingRegion: region,
    };
    setFormData(newFormData);

    // 부모 컴포넌트에 변경사항 전달
    if (onFormChange) {
      onFormChange(newFormData);
    }
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
                handleInputChange("maxParticipants", parseInt(e.target.value, 10) || 2)
              }
              min="2"
              max="100"
              className="w-full h-8 px-2 bg-transparent text-sm border-0 border-b border-gray-300 focus:outline-none focus:border-blue-500"
              placeholder="2~100명"
            />
          </div>
        </div>

        {/* 나이 제한 - 백엔드 미지원으로 임시 주석처리 */}
        {/* <div className="flex items-center gap-4">
          <label className="text-sm text-gray-700 w-32 flex-shrink-0">
            나이 제한
          </label>
          <div className="flex items-center gap-2">
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
            <span className="text-gray-500">~</span>
            <div className="relative">
              <select
                value={formData.maxAge || "제한없음"}
                onChange={(e) => handleInputChange("maxAge", e.target.value)}
                className="w-24 h-8 px-2 bg-transparent text-sm border-0 border-b border-gray-300 appearance-none focus:outline-none focus:border-blue-500">
                <option value="제한없음">제한없음</option>
                <option value="7세미만">7세미만</option>
                {Array.from({ length: 52 }, (_, i) => i + 8).map((age) => {
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
        </div> */}

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

          {/* 모임장소 */}
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
