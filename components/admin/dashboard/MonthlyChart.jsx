"use client"

import { useState, useCallback } from "react";

/**
 * 월별 통계 차트를 표시하는 대시보드 컴포넌트
 * API 연동을 위해 최적화됨
 * 
 * @param {Array} data - API에서 받은 월별 통계 데이터
 * @param {Array} categories - 사용 가능한 카테고리 목록
 * @param {boolean} isLoading - 데이터 로딩 상태
 * @param {function} onCategoryChange - 카테고리 변경 시 호출되는 함수
 * @param {string} defaultCategory - 기본 선택 카테고리
 */
export default function MonthlyChart({ 
  data = [], 
  categories = ["전체", "영화", "연극", "뮤지컬", "전시", "클래식/무용", "콘서트/페스티벌", "지역 행사", "기타"],
  isLoading = false,
  onCategoryChange,
  defaultCategory = "전체" 
}) {
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);

  // 카테고리 변경 핸들러 - API 호출 트리거
  const handleCategoryChange = useCallback((newCategory) => {
    setSelectedCategory(newCategory);
    
    // 부모 컴포넌트에 카테고리 변경 알림 (API 재호출 용도)
    if (typeof onCategoryChange === "function") {
      onCategoryChange(newCategory);
    }
  }, [onCategoryChange]);

  // 고정 데이터 생성 함수 (hydration 에러 방지)
  const generateFixedData = (category) => {
    const baseValues = {
      "전체": { events: 200, together: 300 },
      "영화": { events: 100, together: 150 },
      "연극": { events: 50, together: 60 },
      "뮤지컬": { events: 65, together: 90 },
      "전시": { events: 80, together: 120 },
      "클래식/무용": { events: 35, together: 45 },
      "콘서트/페스티벌": { events: 55, together: 175 },
      "지역 행사": { events: 42, together: 70 },
      "기타": { events: 30, together: 55 }
    };

    const base = baseValues[category] || baseValues["전체"];
    
    return Array.from({ length: 12 }, (_, index) => ({
      id: `${category}-${index + 1}`,
      month: `${String(index + 1).padStart(2, '0')} 월`,
      monthNumber: index + 1,
      events: base.events + (index * 7) % 50 - 25,
      together: base.together + (index * 11) % 80 - 40
    }));
  };

  // API 데이터 또는 고정 더미 데이터 사용
  const currentData = data.length > 0 ? data : generateFixedData(selectedCategory);

  // 최대값 계산 (차트 높이 기준)
  const maxValue = Math.max(
    ...currentData.map(data => Math.max(data.events, data.together))
  );

  return (
    <div className="w-full border border-gray-300 rounded-md px-4 py-6 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <strong>컨텐츠</strong>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-400 rounded-sm"></div>
            <span>이벤트</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
            <span>동행 모집글</span>
          </div>
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex justify-center gap-2">
        {categories.map((category) => (
          <strong 
            key={category}
            className={`
              px-2 hover:cursor-pointer
              ${category === selectedCategory ? "border-b-2" : "text-gray-400"}
            `}
            onClick={() => handleCategoryChange(category)}
          >
            {category}
          </strong>
        ))}
      </div>

      {/* 차트 영역 */}
      <div className="flex items-end gap-1 h-64 px-4">
        {isLoading ? (
          // 로딩 스켈레톤
          [...Array(12)].map((_, index) => (
            <div key={`loading-${index}`} className="flex flex-col items-center gap-1 flex-1">
              <div className="flex items-end gap-1 h-48">
                <div className="bg-gray-200 w-6 rounded-t-sm animate-pulse" style={{ height: "60%" }}></div>
                <div className="bg-gray-200 w-6 rounded-t-sm animate-pulse" style={{ height: "40%" }}></div>
              </div>
              <div className="w-8 h-3 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ))
        ) : currentData.length > 0 ? (
          currentData.map((item, index) => (
            <div key={item.id || index} className="flex flex-col items-center gap-1 flex-1">
              {/* 바 차트 */}
              <div className="flex items-end gap-1 h-48 relative group">
                {/* 이벤트 바 (보라색) */}
                <div 
                  className="bg-purple-400 w-6 rounded-t-sm transition-all duration-300 hover:bg-purple-500 relative"
                  style={{ height: maxValue > 0 ? `${(item.events / maxValue) * 100}%` : "0%" }}
                  title={`이벤트: ${item.events}개`}
                >
                  {/* 툴팁 */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    이벤트: {item.events}
                  </div>
                </div>
                {/* 동행 모집글 바 (파란색) */}
                <div 
                  className="bg-blue-400 w-6 rounded-t-sm transition-all duration-300 hover:bg-blue-500 relative"
                  style={{ height: maxValue > 0 ? `${(item.together / maxValue) * 100}%` : "0%" }}
                  title={`동행: ${item.together}개`}
                >
                  {/* 툴팁 */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    동행: {item.together}
                  </div>
                </div>
              </div>
              {/* 월 라벨 */}
              <span className="text-xs text-gray-600">{item.month}</span>
            </div>
          ))
        ) : (
          // 데이터 없음 상태
          <div className="flex-1 flex flex-col items-center justify-center h-48 text-gray-500">
            <div className="text-lg mb-2">📈</div>
            <div>표시할 데이터가 없습니다.</div>
          </div>
        )}
      </div>
    </div>
  );
}