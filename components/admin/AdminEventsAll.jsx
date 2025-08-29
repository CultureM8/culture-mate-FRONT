"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";
import Calendar from "@/components/global/Calendar";
import { DUMMY_EVENTS } from "@/lib/eventData";

export default function AdminEventsAll() {
  // 필터 상태 관리
  const [eventTypeFilter, setEventTypeFilter] = useState("전체");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // 선택된 이벤트 관리
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // 달력 표시 상태 관리
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  
  // 검색 상태 관리
  const [searchQuery, setSearchQuery] = useState("");
  
  // 페이지네이션 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // 데이터 변환 함수: DUMMY_EVENTS -> 관리자 페이지 형식
  const convertEventData = (eventData) => {
    return eventData.map(event => ({
      id: event.eventCode,
      type: event.eventType,
      name: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      status: calculateEventStatus(event.startDate, event.endDate)
    }));
  };

  // 이벤트 상태 계산 함수
  const calculateEventStatus = (startDate, endDate) => {
    const today = new Date().toISOString().split('T')[0]; // 오늘 날짜 (YYYY-MM-DD)
    
    if (endDate === "오픈런") return "진행중";
    if (today > endDate) return "종료";
    if (today >= startDate && today <= endDate) return "진행중";
    if (today < startDate) return "진행중"; // 시작 전이지만 "진행중"으로 표시
    
    return "진행중";
  };

  // 실제 이벤트 데이터 로드
  useEffect(() => {
    const loadEventData = () => {
      try {
        const convertedData = convertEventData(DUMMY_EVENTS);
        setAllEventData(convertedData);
      } catch (error) {
        console.error("이벤트 데이터를 불러오는데 실패했습니다:", error);
      }
    };
    
    loadEventData();
  }, []);

  // 더미 이벤트 데이터 -> 실제 데이터로 교체
  const [allEventData, setAllEventData] = useState([]);

  // 필터링된 이벤트 데이터
  const filteredEventData = allEventData.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         event.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = eventTypeFilter === "전체" || event.type === eventTypeFilter;
    const matchesStatus = statusFilter === "전체" || event.status === statusFilter;
    
    // 날짜 필터링 추가
    let matchesDateRange = true;
    if (startDate && endDate) {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const filterStart = new Date(startDate);
      const filterEnd = new Date(endDate);
      
      // 이벤트 기간이 필터 기간과 겹치는지 확인
      matchesDateRange = eventStart <= filterEnd && eventEnd >= filterStart;
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDateRange;
  }).sort((a, b) => {
    // 시작날짜 기준으로 정렬 (최신순)
    return new Date(b.startDate) - new Date(a.startDate);
  });

  // 이벤트 타입 옵션 - EventSelector와 동일하게 맞춤
  const eventTypes = ["전체", "뮤지컬", "영화", "연극", "전시", "클래식/무용", "콘서트/페스티벌", "지역행사", "기타"];

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(currentEventData.map(event => event.id));
    }
    setSelectAll(!selectAll);
  };

  // 개별 이벤트 선택/해제
  const handleEventSelect = (eventId) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter(id => id !== eventId));
    } else {
      setSelectedEvents([...selectedEvents, eventId]);
    }
  };

  // 달력에서 날짜 선택 시 처리
  const handleStartDateSelect = (selectedDatesArray) => {
    if (selectedDatesArray.length > 0) {
      const selectedDate = selectedDatesArray[0];
      const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
      setStartDate(formattedDate);
      setShowStartCalendar(false);
    }
  };

  const handleEndDateSelect = (selectedDatesArray) => {
    if (selectedDatesArray.length > 0) {
      const selectedDate = selectedDatesArray[0];
      const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
      setEndDate(formattedDate);
      setShowEndCalendar(false);
    }
  };

  // 페이지네이션 계산 - 총 3페이지로 고정
  const totalPages = 3;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEventData = currentPage === 1 
    ? filteredEventData.slice(startIndex, startIndex + itemsPerPage)
    : []; // 2, 3페이지는 빈 데이터

  // 페이지 변경 함수
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 필터 변경 시 첫 페이지로 리셋
  const resetToFirstPage = () => {
    setCurrentPage(1);
  };

  // 필터 변경 시 첫 페이지로 리셋되도록 핸들러 수정
  const handleEventTypeFilterChange = (type) => {
    setEventTypeFilter(type);
    resetToFirstPage();
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    resetToFirstPage();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    resetToFirstPage();
  };

  // 페이지네이션 - 항상 3페이지 표시
  const pageNumbers = [1, 2, 3];

  return (
    <div className="py-6 min-h-[200px] flex flex-col gap-6">
      {/* 필터 영역 */}
      <div className="w-full border border-[#bfbfbf] rounded-[4px] p-4 bg-white">
        {/* 이벤트 유형 필터 */}
        <div className="flex items-center h-[30px] mb-1">
          <div className="text-[16px] font-semibold text-black w-28 flex-shrink-0">
            이벤트 유형
          </div>
          <div className="flex gap-4 items-center">
            {eventTypes.map((type, index) => (
              <button 
                key={index}
                onClick={() => handleEventTypeFilterChange(type)}
                className={`px-1 py-0 text-[16px] font-medium border-b-2 transition-colors ${
                  eventTypeFilter === type 
                    ? "text-black border-black" 
                    : "text-[#a6a6a6] border-transparent hover:text-black"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 이벤트 기간 필터 */}
        <div className="flex items-center h-[30px] mb-1">
          <div className="text-[16px] font-semibold text-black w-28 flex-shrink-0">
            이벤트 기간
          </div>
          <div className="flex gap-4 items-center relative">
            <button 
              onClick={() => {setStartDate(""); setEndDate("");}}
              className={`px-1 py-0 text-[16px] font-medium border-b-2 transition-colors ${
                !startDate && !endDate 
                  ? "text-black border-black" 
                  : "text-[#a6a6a6] border-transparent hover:text-black"
              }`}
            >
              전체
            </button>
            <span className="text-[16px] text-[#a6a6a6]">
              {startDate || "0000-00-00"}
            </span>
            <div className="relative">
              <Image
                src={ICONS.CALENDAR}
                alt="start-calendar-icon"
                width={20}
                height={20}
                className="cursor-pointer"
                onClick={() => {
                  setShowStartCalendar(!showStartCalendar);
                  setShowEndCalendar(false);
                }}
              />
              {showStartCalendar && (
                <div className="absolute top-8 left-0 z-10 w-96">
                  <Calendar 
                    onDatesChange={handleStartDateSelect}
                    selectedDates={startDate ? [new Date(startDate)] : []}
                    mode="single"
                  />
                </div>
              )}
            </div>
            <span className="text-[16px] text-black">~</span>
            <span className="text-[16px] text-[#a6a6a6]">
              {endDate || "0000-00-00"}
            </span>
            <div className="relative">
              <Image
                src={ICONS.CALENDAR}
                alt="end-calendar-icon"
                width={20}
                height={20}
                className="cursor-pointer"
                onClick={() => {
                  setShowEndCalendar(!showEndCalendar);
                  setShowStartCalendar(false);
                }}
              />
              {showEndCalendar && (
                <div className="absolute top-8 left-0 z-10 w-96">
                  <Calendar 
                    onDatesChange={handleEndDateSelect}
                    selectedDates={endDate ? [new Date(endDate)] : []}
                    mode="single"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 상태 필터 */}
        <div className="flex items-center h-[30px]">
          <div className="text-[16px] font-semibold text-black w-28 flex-shrink-0">
            상태
          </div>
          <div className="flex gap-4 items-center">
            {["전체", "진행중", "종료"].map((status, index) => (
              <button 
                key={index}
                onClick={() => handleStatusFilterChange(status)}
                className={`px-1 py-0 text-[16px] font-medium border-b-2 transition-colors ${
                  statusFilter === status 
                    ? "text-black border-black" 
                    : "text-[#a6a6a6] border-transparent hover:text-black"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 검색창과 정렬 영역 */}
      <div className="flex justify-end items-center px-4">
        <div className="flex items-center gap-5">
          {/* 검색창 */}
          <div className="relative w-[300px]">
            <div className="bg-white border border-[#bfbfbf] rounded-[20px] px-[15px] py-[5px] flex items-center justify-between">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색"
                className="flex-1 text-[16px] font-medium text-black placeholder-[#bfbfbf] bg-transparent border-none outline-none"
              />
              <Image
                src={ICONS.SEARCH}
                alt="search-icon"
                width={25}
                height={25}
                className="shrink-0"
              />
            </div>
          </div>

          {/* 정렬 */}
          <div className="flex items-center gap-4">
            <span className="text-[16px] font-medium text-black">정렬</span>
            <div className="w-[17px] h-2 cursor-pointer">
              <svg width="19" height="10" viewBox="0 0 19 10" fill="none">
                <path 
                  d="M1 1L9.5 9L18 1" 
                  stroke="#454545" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 테이블 영역 */}
      <div className="w-full bg-white rounded-[4px] border border-[#bfbfbf]">
        <div className="p-4 flex flex-col">
          {/* 테이블 헤더 */}
          <div className="bg-[#f2f2f2] rounded-[4px] border border-[#a6a6a6] h-8 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded-[2px] border border-[#828282] bg-white"
              />
              <div className="text-[14px] font-semibold text-black w-24 overflow-hidden text-nowrap text-center">
                이벤트 번호
              </div>
              <div className="text-[14px] font-semibold text-black w-28 overflow-hidden text-nowrap text-center">
                유형
              </div>
              <div className="text-[14px] font-semibold text-black w-80 overflow-hidden text-nowrap text-center">
                이벤트명
              </div>
            </div>
            <div className="flex items-center gap-4 text-[14px] font-semibold text-black">
              <div className="w-48 overflow-hidden text-nowrap text-center">
                이벤트 기간
              </div>
              <div className="w-20 text-center">
                상태
              </div>
            </div>
          </div>

          {/* 테이블 바디 */}
          {currentEventData.length > 0 ? (
            currentEventData.map((event, index) => (
              <div 
                key={event.id}
                className="bg-white border-b border-gray-200 py-2 px-4 flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-4 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event.id)}
                    onChange={() => handleEventSelect(event.id)}
                    className="w-4 h-4 rounded-[2px] border border-[#828282] bg-white"
                  />
                  <div className="text-[14px] font-medium text-black w-24 overflow-hidden text-nowrap text-center">
                    {event.id}
                  </div>
                  <div className="text-[14px] font-medium text-black w-28 overflow-hidden text-nowrap text-center">
                    {event.type}
                  </div>
                  <div className="text-[14px] font-medium text-black w-80 overflow-hidden text-nowrap text-center">
                    {event.name}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[14px] font-medium text-black">
                  <div className="w-48 overflow-hidden text-nowrap text-center">
                    {event.startDate} ~ {event.endDate}
                  </div>
                  <div className="w-20 text-center">
                    {event.status}
                  </div>
                </div>
              </div>
            ))
          ) : (
            // 2, 3페이지는 빈 상태 표시
            <div className="col-span-full text-center py-8 text-gray-500">
              <div>이 페이지에는 아직 데이터가 없습니다.</div>
            </div>
          )}

          {/* 페이지네이션 - 테이블 내부로 이동 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1 mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded transition-colors ${
                  currentPage === 1 
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
                  className={`px-3 py-1 rounded transition-colors ${
                    currentPage === pageNum 
                      ? 'text-blue-600 bg-blue-50 font-semibold' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded transition-colors ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}