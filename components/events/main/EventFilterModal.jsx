"use client"

import Modal from "../../global/Modal";
import LocationSelector from "../../global/LocationSelector";
import { useState } from "react";

// 이벤트 필터 모달 컴포넌트
export default function EventFilterModal({ isOpen, onClose, onApplyFilters }) {
  // 기본 날짜 설정: 오늘부터 다음주까지
  const getDefaultDateRange = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return [
      today.toISOString().split('T')[0],
      nextWeek.toISOString().split('T')[0]
    ];
  };

  // 필터 옵션 상태 관리
  const [dateRange, setDateRange] = useState(getDefaultDateRange()); // 날짜 범위
  const [selectedRegions, setSelectedRegions] = useState([]); // 선택된 지역

  // 시작 날짜 변경 핸들러
  const handleStartDateChange = (e) => {
    setDateRange([e.target.value, dateRange[1]]);
  };

  // 종료 날짜 변경 핸들러
  const handleEndDateChange = (e) => {
    setDateRange([dateRange[0], e.target.value]);
  };

  // 필터 적용 핸들러
  const handleApply = () => {
    const filterData = {
      dateRange,
      selectedRegions,
    };
    
    console.log("Applying filters:", filterData);
    
    // 부모 컴포넌트로 필터 데이터 전달
    if (typeof onApplyFilters === "function") {
      onApplyFilters(filterData);
    }
    
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 w-[520px] max-w-[90vw] max-h-[85vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-center">이벤트 필터</h2>

        {/* 날짜 */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">날짜</h3>
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">시작일</label>
              <input
                type="date"
                className="border p-2 rounded w-full cursor-pointer"
                onChange={handleStartDateChange}
                value={dateRange[0]}
              />
            </div>
            <div className="pt-6">
              ~
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">종료일</label>
              <input
                type="date"
                className="border p-2 rounded w-full cursor-pointer"
                onChange={handleEndDateChange}
                value={dateRange[1]}
                min={dateRange[0]}
              />
            </div>
          </div>
        </div>

        {/* 지역 */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">지역 선택 (최대 5개)</h3>
          <LocationSelector
            onRegionSelect={setSelectedRegions}
            selectedRegions={selectedRegions}
            maxSelections={5}
          />
        </div>

        {/* 적용하기 버튼 */}
        <button
          onClick={handleApply}
          className="w-full bg-blue-500 text-white p-3 rounded-lg font-bold"
        >
          적용하기
        </button>
      </div>
    </Modal>
  );
}