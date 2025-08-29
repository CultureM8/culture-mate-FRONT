"use client";

import { useState } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";
import Calendar from "@/components/global/Calendar";

export default function AdminAlarmsContents() {
  // 필터 상태 관리
  const [reportTypeFilter, setReportTypeFilter] = useState("전체");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // 선택된 신고 관리
  const [selectedReports, setSelectedReports] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // 달력 표시 상태 관리
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  
  // 검색 상태 관리
  const [searchQuery, setSearchQuery] = useState("");
  
  // 페이지네이션 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // 더미 신고 데이터
  const allReportData = [
    { 
      id: "R001", 
      reportDate: "2025-08-29 14:30:25",
      reportType: "스팸/광고", 
      reporter: "user123",
      reportTitle: "불법 광고 게시물 신고합니다",
      postTitle: "쉽게 돈버는 방법 알려드립니다",
      postLink: "https://example.com/post1",
      status: "게시물 삭제 / 경고 1회"
    },
    { 
      id: "R002", 
      reportDate: "2025-08-29 11:15:33",
      reportType: "부적절한 내용", 
      reporter: "user456",
      reportTitle: "욕설이 포함된 게시물입니다",
      postTitle: "오늘 정말 화가 나는 일이...",
      postLink: "https://example.com/post2",
      status: "게시물 삭제 / 경고 1회"
    },
    { 
      id: "R003", 
      reportDate: "2025-08-28 16:45:12",
      reportType: "허위정보", 
      reporter: "user789",
      reportTitle: "잘못된 정보가 담긴 게시물",
      postTitle: "코로나 백신의 숨겨진 진실",
      postLink: "https://example.com/post3",
      status: "게시물 삭제"
    },
    { 
      id: "R004", 
      reportDate: "2025-08-28 09:22:44",
      reportType: "저작권 침해", 
      reporter: "user101",
      reportTitle: "무단으로 사진을 도용했습니다",
      postTitle: "우리 가족 여행 사진들",
      postLink: "https://example.com/post4",
      status: "게시물 삭제 / 사용자 제재"
    },
    { 
      id: "R005", 
      reportDate: "2025-08-27 20:33:17",
      reportType: "개인정보 노출", 
      reporter: "user202",
      reportTitle: "개인 연락처가 공개되어 있음",
      postTitle: "중고거래 - 아이폰 판매합니다",
      postLink: "https://example.com/post5",
      status: "검토중"
    },
    { 
      id: "R006", 
      reportDate: "2025-08-27 13:55:28",
      reportType: "스팸/광고", 
      reporter: "user303",
      reportTitle: "반복적인 홍보 게시물",
      postTitle: "최고의 다이어트 제품!",
      postLink: "https://example.com/post6",
      status: "게시물 삭제"
    },
    { 
      id: "R007", 
      reportDate: "2025-08-26 18:12:55",
      reportType: "부적절한 내용", 
      reporter: "user404",
      reportTitle: "성적 내용이 포함됨",
      postTitle: "오늘 만난 사람 이야기",
      postLink: "https://example.com/post7",
      status: "게시물 삭제 / 사용자 제재"
    },
    { 
      id: "R008", 
      reportDate: "2025-08-26 10:44:33",
      reportType: "혐오 표현", 
      reporter: "user505",
      reportTitle: "특정 지역에 대한 혐오 발언",
      postTitle: "그 지역 사람들은 정말...",
      postLink: "https://example.com/post8",
      status: "게시물 삭제 / 경고 2회"
    },
    { 
      id: "R009", 
      reportDate: "2025-08-25 15:27:18",
      reportType: "사기/사칭", 
      reporter: "user606",
      reportTitle: "가짜 프로필로 사기 시도",
      postTitle: "투자 기회를 제공합니다",
      postLink: "https://example.com/post9",
      status: "게시물 삭제 / 계정 정지"
    },
    { 
      id: "R010", 
      reportDate: "2025-08-25 07:38:42",
      reportType: "중복 게시", 
      reporter: "user707",
      reportTitle: "같은 내용을 반복 게시함",
      postTitle: "긴급!! 도움이 필요합니다",
      postLink: "https://example.com/post10",
      status: "중복 게시물 정리"
    },
    { 
      id: "R011", 
      reportDate: "2025-08-24 21:19:03",
      reportType: "기타", 
      reporter: "user808",
      reportTitle: "부적절한 카테고리 사용",
      postTitle: "맛있는 치킨집 추천",
      postLink: "https://example.com/post11",
      status: "카테고리 이동"
    },
    { 
      id: "R012", 
      reportDate: "2025-08-24 12:51:37",
      reportType: "스팸/광고", 
      reporter: "user909",
      reportTitle: "다단계 홍보 게시물",
      postTitle: "쉬운 부업으로 월 300만원",
      postLink: "https://example.com/post12",
      status: "게시물 삭제 / 경고 1회"
    },
    { 
      id: "R013", 
      reportDate: "2025-08-23 19:26:14",
      reportType: "부적절한 내용", 
      reporter: "user010",
      reportTitle: "폭력적인 내용 포함",
      postTitle: "오늘 길에서 본 사고",
      postLink: "https://example.com/post13",
      status: "게시물 삭제"
    },
    { 
      id: "R014", 
      reportDate: "2025-08-23 08:17:29",
      reportType: "허위정보", 
      reporter: "user111",
      reportTitle: "과장된 의료정보 유포",
      postTitle: "이 방법으로 암을 완치했어요",
      postLink: "https://example.com/post14",
      status: "게시물 삭제 / 사용자 제재"
    },
    { 
      id: "R015", 
      reportDate: "2025-08-22 16:42:55",
      reportType: "저작권 침해", 
      reporter: "user212",
      reportTitle: "뉴스 기사 전문 무단 복제",
      postTitle: "오늘의 주요 뉴스 모음",
      postLink: "https://example.com/post15",
      status: "게시물 삭제"
    },
  ];

  // 신고 분류 옵션
  const reportTypes = ["전체", "스팸/광고", "부적절한 내용", "허위정보", "저작권 침해", "혐오 표현", "사기/사칭", "중복 게시", "기타"];

  // 조치 상태 옵션
  const statusTypes = ["전체", "검토중", "게시물 삭제", "경고 처리", "사용자 제재", "계정 정지", "기타"];

  // 필터링된 신고 데이터
  const filteredReportData = allReportData.filter(report => {
    const matchesSearch = report.reportTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        report.postTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        report.reporter.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        report.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = reportTypeFilter === "전체" || report.reportType === reportTypeFilter;
    const matchesStatus = statusFilter === "전체" || report.status.includes(statusFilter);
    
    // 날짜 필터링 추가
    let matchesDateRange = true;
    if (startDate && endDate) {
      const reportDate = new Date(report.reportDate.split(' ')[0]);
      const filterStart = new Date(startDate);
      const filterEnd = new Date(endDate);
      
      matchesDateRange = reportDate >= filterStart && reportDate <= filterEnd;
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDateRange;
  }).sort((a, b) => {
    // 신고 일시 기준으로 정렬 (최신순)
    return new Date(b.reportDate) - new Date(a.reportDate);
  });

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedReports([]);
    } else {
      setSelectedReports(currentReportData.map(report => report.id));
    }
    setSelectAll(!selectAll);
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

  // 개별 신고 선택/해제
  const handleReportSelect = (reportId) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter(id => id !== reportId));
    } else {
      setSelectedReports([...selectedReports, reportId]);
    }
  };
  const totalPages = 3;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReportData = currentPage === 1 
    ? filteredReportData.slice(startIndex, startIndex + itemsPerPage)
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
  const handleReportTypeFilterChange = (type) => {
    setReportTypeFilter(type);
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
        {/* 신고 분류 필터 */}
        <div className="flex items-center h-[30px] mb-1">
          <div className="text-[16px] font-semibold text-black w-28 flex-shrink-0">
            신고 분류
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            {reportTypes.map((type, index) => (
              <button 
                key={index}
                onClick={() => handleReportTypeFilterChange(type)}
                className={`px-1 py-0 text-[16px] font-medium border-b-2 transition-colors ${
                  reportTypeFilter === type 
                    ? "text-black border-black" 
                    : "text-[#a6a6a6] border-transparent hover:text-black"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 신고 일시 필터 */}
        <div className="flex items-center h-[30px] mb-1">
          <div className="text-[16px] font-semibold text-black w-28 flex-shrink-0">
            신고 일시
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

        {/* 조치 상태 필터 */}
        <div className="flex items-center h-[30px]">
          <div className="text-[16px] font-semibold text-black w-28 flex-shrink-0">
            조치 상태
          </div>
          <div className="flex gap-4 items-center flex-wrap">
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
          <div className="bg-[#f2f2f2] rounded-[4px] border border-[#a6a6a6] h-8 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded-[2px] border border-[#828282] bg-white"
              />
              <div className="text-[14px] font-semibold text-black w-24 overflow-hidden text-nowrap text-center">
                신고 번호
              </div>
              <div className="text-[14px] font-semibold text-black w-40 overflow-hidden text-nowrap text-center">
                신고 일시
              </div>
              <div className="text-[14px] font-semibold text-black w-24 overflow-hidden text-nowrap text-center">
                신고 분류
              </div>
              <div className="text-[14px] font-semibold text-black w-24 overflow-hidden text-nowrap text-center">
                신고자
              </div>
              <div className="text-[14px] font-semibold text-black flex-1 overflow-hidden text-nowrap text-center">
                게시물 제목(링크)
              </div>
            </div>
            <div className="text-[14px] font-semibold text-black w-48 overflow-hidden text-nowrap text-center">
              조치 상태
            </div>
          </div>

          {/* 테이블 바디 */}
          {currentReportData.length > 0 ? (
            currentReportData.map((report, index) => (
              <div 
                key={report.id}
                className="bg-white border-b border-gray-200 py-2 px-4 flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-4 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedReports.includes(report.id)}
                    onChange={() => handleReportSelect(report.id)}
                    className="w-4 h-4 rounded-[2px] border border-[#828282] bg-white"
                  />
                  <div className="text-[14px] font-medium text-black w-24 overflow-hidden text-nowrap text-center">
                    {report.id}
                  </div>
                  <div className="text-[14px] font-medium text-black w-40 overflow-hidden text-nowrap text-center">
                    {report.reportDate}
                  </div>
                  <div className="text-[14px] font-medium text-black w-24 overflow-hidden text-nowrap text-center">
                    {report.reportType}
                  </div>
                  <div className="text-[14px] font-medium text-black w-24 overflow-hidden text-nowrap text-center">
                    {report.reporter}
                  </div>
                  <div className="text-[14px] font-medium text-black flex-1 overflow-hidden text-nowrap text-center">
                    <a href={report.postLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {report.postTitle}
                    </a>
                  </div>
                </div>
                <div className="text-[14px] font-medium text-black w-48 overflow-hidden text-nowrap text-center">
                  {report.status}
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