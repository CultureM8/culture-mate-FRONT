"use client"

import Modal from "../global/Modal";
import LocationSelector from "../global/LocationSelector";
import { useState } from "react";

export default function EventFilterModal({ isOpen, onClose }) {
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

  // State for filter options
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000000]);

  const handleStartDateChange = (e) => {
    setDateRange([e.target.value, dateRange[1]]);
  };

  const handleEndDateChange = (e) => {
    setDateRange([dateRange[0], e.target.value]);
  };

  const handleMinPriceChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setPriceRange([value, priceRange[1]]);
  };

  const handleMaxPriceChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setPriceRange([priceRange[0], value]);
  };

  const handleApply = () => {
    console.log("Applying filters:", {
      dateRange,
      selectedRegions,
      priceRange,
    });
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
        <div className="mb-4">
          <h3 className="font-semibold mb-2">지역 선택 (최대 5개)</h3>
          <LocationSelector
            onRegionSelect={setSelectedRegions}
            selectedRegions={selectedRegions}
            maxSelections={5}
          />
        </div>

        {/* 가격 */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">가격</h3>
          <div className="flex gap-2 items-center w-full">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">최소 금액</label>
              <div className="relative">
                <input
                  type="number"
                  className="border p-2 rounded w-full pr-8"
                  onChange={handleMinPriceChange}
                  value={priceRange[0]}
                  min="0"
                  placeholder="0"
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">원</span>
              </div>
            </div>
            <div className="pt-6">
              ~
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">최대 금액</label>
              <div className="relative">
                <input
                  type="number"
                  className="border p-2 rounded w-full pr-8"
                  onChange={handleMaxPriceChange}
                  value={priceRange[1]}
                  min={priceRange[0]}
                  placeholder="1000000"
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">원</span>
              </div>
            </div>
          </div>
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
