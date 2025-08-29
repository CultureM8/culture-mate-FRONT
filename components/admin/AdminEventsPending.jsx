"use client";

import { useState } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";

export default function AdminEventsPending() {
  // 상태 관리
  const [eventTypeFilter, setEventTypeFilter] = useState("전체");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  
  // 페이지네이션 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  // 이벤트 유형 목록
  const eventTypes = ["전체", "영화", "연극", "뮤지컬", "전시", "클래식/무용", "콘서트/페스티벌", "지역 행사", "기타"];
  
  // 상태 목록 (승인대기 페이지 특성상)
  const statusTypes = ["전체", "승인 대기중", "AI 승인", "AI 보류", "관리자 승인", "관리자 거절"];

  // 더미 데이터 (15개)
  const allEventData = [
    { id: 1, time: "2025-08-29 14:30:00", userId: "ksgdh12", type: "영화", eventName: "신작 블록버스터 시사회", status: "승인 대기중" },
    { id: 2, time: "2025-08-29 13:45:00", userId: "sdg1gas", type: "영화", eventName: "독립영화 상영회", status: "승인 대기중" },
    { id: 3, time: "2025-08-29 12:20:00", userId: "sdggjh", type: "연극", eventName: "클래식 연극 공연", status: "AI 승인" },
    { id: 4, time: "2025-08-29 11:10:00", userId: "lgdsk", type: "뮤지컬", eventName: "브로드웨이 뮤지컬", status: "관리자 승인" },
    { id: 5, time: "2025-08-29 10:55:00", userId: "lsdgobos122", type: "전시", eventName: "현대미술 전시회", status: "관리자 승인" },
    { id: 6, time: "2025-08-29 09:30:00", userId: "oyyuo", type: "영화", eventName: "애니메이션 상영", status: "AI 승인" },
    { id: 7, time: "2025-08-28 18:15:00", userId: "yuj456456", type: "영화", eventName: "다큐멘터리 상영회", status: "관리자 승인" },
    { id: 8, time: "2025-08-28 16:40:00", userId: "kljbh452", type: "전시", eventName: "사진 전시회", status: "AI 승인" },
    { id: 9, time: "2025-08-28 15:25:00", userId: "kbj23523", type: "영화", eventName: "고전 영화 상영", status: "AI 보류" },
    { id: 10, time: "2025-08-28 14:10:00", userId: "jhkj243", type: "콘서트/페스티벌", eventName: "재즈 콘서트", status: "AI 승인" },
    { id: 11, time: "2025-08-28 13:30:00", userId: "kjhvj433", type: "지역 행사", eventName: "지역 축제", status: "AI 승인" },
    { id: 12, time: "2025-08-28 12:45:00", userId: "jjhv95", type: "영화", eventName: "해외 영화 상영", status: "AI 보류" },
    { id: 13, time: "2025-08-28 11:20:00", userId: "zxcv987", type: "영화", eventName: "단편 영화제", status: "AI 승인" },
    { id: 14, time: "2025-08-28 10:35:00", userId: "mnbv654", type: "뮤지컬", eventName: "소규모 뮤지컬", status: "승인 대기중" },
    { id: 15, time: "2025-08-28 09:50:00", userId: "asdf123", type: "클래식/무용", eventName: "발레 공연", status: "관리자 승인" }
  ];

  // 필터링된 데이터
  const filteredData = allEventData.filter(item => {
    const matchesSearch = item.eventName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.userId.toLowerCase().includes(searchQuery.toLowerCase());
    const typeMatch = eventTypeFilter === "전체" || item.type === eventTypeFilter;
    const statusMatch = statusFilter === "전체" || item.status === statusFilter;
    return matchesSearch && typeMatch && statusMatch;
  }).sort((a, b) => {
    // 시간 기준으로 정렬 (최신순)
    return new Date(b.time) - new Date(a.time);
  });

  // 페이지네이션 계산 - 총 3페이지로 고정
  const totalPages = 3;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEventData = currentPage === 1 
    ? filteredData.slice(startIndex, startIndex + itemsPerPage)
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

        {/* 상태 필터 */}
        <div className="flex items-center h-[30px]">
          <div className="text-[16px] font-semibold text-black w-28 flex-shrink-0">
            상태
          </div>
          <div className="flex gap-4 items-center">
            {statusTypes.map((status, index) => (
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
                onChange={handleSearchChange}
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
            <Image
              src={ICONS.DOWN_ARROW}
              alt="down-arrow"
              width={24}
              height={10}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 테이블 영역 */}
      <div className="w-full bg-white rounded-[4px] border border-[#bfbfbf]">
        <div className="p-4 flex flex-col">
          {/* 테이블 헤더 */}
          <div className="bg-[#f2f2f2] rounded-[4px] border border-[#a6a6a6] h-8 px-4 py-2 flex items-center gap-4 mb-0">
            <div className="w-40 font-semibold text-[14px] text-black overflow-ellipsis overflow-hidden text-center">
              시간
            </div>
            <div className="flex gap-4 items-center grow min-w-0">
              <div className="w-24 font-semibold text-[14px] text-black overflow-ellipsis overflow-hidden text-center">
                신청자 ID
              </div>
              <div className="w-24 font-semibold text-[14px] text-black overflow-ellipsis overflow-hidden text-center">
                유형
              </div>
              <div className="w-48 min-w-32 font-semibold text-[14px] text-black overflow-ellipsis overflow-hidden text-center">
                이벤트명
              </div>
              <div className="w-40 font-semibold text-[14px] text-black overflow-ellipsis overflow-hidden text-center">
                관련 링크 / 이미지
              </div>
            </div>
            <div className="w-20 font-semibold text-[14px] text-black text-center">
              처리상태
            </div>
          </div>

          {/* 테이블 데이터 */}
          {currentEventData.length > 0 ? (
            currentEventData.map((item) => (
              <div key={item.id} className="bg-white border-b border-gray-200 py-2 px-4 flex items-center gap-4">
                <div className="w-40 font-medium text-[14px] text-black overflow-ellipsis overflow-hidden text-center">
                  {item.time}
                </div>
                <div className="flex gap-4 items-center grow min-w-0">
                  <div className="w-24 font-medium text-[14px] text-black overflow-ellipsis overflow-hidden text-center">
                    {item.userId}
                  </div>
                  <div className="w-24 font-medium text-[14px] text-black overflow-ellipsis overflow-hidden text-center">
                    {item.type}
                  </div>
                  <div className="w-48 min-w-32 font-medium text-[14px] text-black overflow-ellipsis overflow-hidden text-center">
                    {item.eventName}
                  </div>
                  <div className="w-40 font-medium text-[14px] text-black overflow-ellipsis overflow-hidden text-center">
                    <a href="#" className="text-blue-600 hover:underline">관련 링크</a>
                    {" / "}
                    <a href="#" className="text-blue-600 hover:underline">이미지</a>
                  </div>
                </div>
                <div className="w-20 font-medium text-[14px] text-black text-center">
                  {item.status}
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