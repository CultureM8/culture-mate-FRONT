"use client"

import { useState, useCallback } from "react";

/**
 * 기간별 분석 데이터를 표시하는 대시보드 컴포넌트
 * API 연동을 위해 최적화됨
 * 
 * @param {Array} data - API에서 받은 통계 데이터 배열
 * @param {boolean} isLoading - 데이터 로딩 상태
 * @param {function} onPeriodChange - 기간 변경 시 호출되는 함수
 * @param {string} defaultPeriod - 기본 선택 기간
 */
export default function AnalysisByPeriod({ 
  data = [], 
  isLoading = false, 
  onPeriodChange,
  defaultPeriod = "일" 
}) {
  
  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const periodList = ["일", "주", "월", "분기", "연도"];
  const [period, setPeriod] = useState(defaultPeriod);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // API 데이터가 없을 때 표시할 기본 더미 데이터 (고정값으로 hydration 에러 방지)
  const generateDefaultData = () => [
    ...Array(30).fill(null).map((_, index) => ({
      id: index + 1,
      date: `2024-01-${String(31 - index).padStart(2, '0')}`,
      visitors: 500 + (index * 23) % 400,
      signups: 20 + (index * 7) % 30,
      posts: 45 + (index * 11) % 40,
      events: 3 + (index * 3) % 8
    }))
  ];

  const defaultData = data.length > 0 ? data : generateDefaultData();

  const allTableData = defaultData;

  // 페이지네이션 계산
  const totalPages = Math.ceil(allTableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = allTableData.slice(startIndex, startIndex + itemsPerPage);

  // 기간 변경 핸들러 - API 호출 트리거
  const handlePeriodChange = useCallback((newPeriod) => {
    setPeriod(newPeriod);
    setCurrentPage(1); // 기간 변경 시 첫 페이지로 리셋
    
    // 부모 컴포넌트에 기간 변경 알림 (API 재호출 용도)
    if (typeof onPeriodChange === "function") {
      onPeriodChange(newPeriod);
    }
  }, [onPeriodChange]);

  // 페이지 변경 함수
  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  // 간단한 페이지 번호 배열
  const pageNumbers = Array.from({length: totalPages}, (_, i) => i + 1);

  return (
    <div className="w-full border border-gray-300 rounded-md px-4 py-6 flex flex-col gap-4">
      <div className="flex justify-between items-baseline">
        <strong>기간별 분석</strong>
        <div className="flex gap-2">
          {periodList.map((data, idx) => (
            <strong 
              key={idx}
              className={`
                px-2 hover:cursor-pointer
                ${data === period ? "border-b-2" : "text-gray-400"}
              `}
              onClick={() => handlePeriodChange(data)}
            >{data}별</strong>
          ))}
        </div>
      </div>
      <div>
        {/* 헤더 */}
        <div className="grid grid-cols-5 gap-2 py-2 text-sm border-b-2 border-gray-300">
          <strong className="text-center text-gray-700">날짜 ({period}별)</strong>
          <strong className="text-center text-gray-700">방문자 수 (명)</strong>
          <strong className="text-center text-gray-700">가입자 수 (명)</strong>
          <strong className="text-center text-gray-700">새 게시물 (개)</strong>
          <strong className="text-center text-gray-700">새 이벤트 (개)</strong>
        </div>
        
        {/* 데이터 행들 */}
        {isLoading ? (
          // 로딩 스켈레톤
          [...Array(itemsPerPage)].map((_, index) => (
            <div key={`loading-${index}`} className="grid grid-cols-5 gap-2 py-2 text-sm border-b border-gray-200">
              <div className="text-center"><div className="h-4 bg-gray-200 animate-pulse rounded"></div></div>
              <div className="text-center"><div className="h-4 bg-gray-200 animate-pulse rounded"></div></div>
              <div className="text-center"><div className="h-4 bg-gray-200 animate-pulse rounded"></div></div>
              <div className="text-center"><div className="h-4 bg-gray-200 animate-pulse rounded"></div></div>
              <div className="text-center"><div className="h-4 bg-gray-200 animate-pulse rounded"></div></div>
            </div>
          ))
        ) : currentData.length > 0 ? (
          currentData.map((row, index) => (
            <div key={row.id || index} className="grid grid-cols-5 gap-2 py-2 text-sm border-b border-gray-200">
              <div className="text-center">{row.date}</div>
              <div className="text-center">{formatNumber(row.visitors || row.dailyVisitors || 0)}</div>
              <div className="text-center">{formatNumber(row.signups || row.dailySignups || 0)}</div>
              <div className="text-center">{formatNumber(row.posts || row.dailyPosts || 0)}</div>
              <div className="text-center">{formatNumber(row.events || row.completedEvents || 0)}</div>
            </div>
          ))
        ) : (
          // 데이터 없음 상태
          <div className="col-span-5 text-center py-8 text-gray-500">
            <div className="text-lg mb-2">📊</div>
            <div>표시할 데이터가 없습니다.</div>
          </div>
        )}
      </div>

      {/* 페이지네이션 - 데이터가 있을 때만 표시 */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center gap-1 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className={`px-3 py-1 rounded transition-colors ${
              currentPage === 1 || isLoading 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            이전
          </button>

          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              disabled={isLoading}
              className={`px-3 py-1 rounded transition-colors ${
                currentPage === pageNum 
                  ? 'text-blue-600 bg-blue-50 font-semibold' 
                  : isLoading
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className={`px-3 py-1 rounded transition-colors ${
              currentPage === totalPages || isLoading
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}