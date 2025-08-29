"use client";

import { useState } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";
import Calendar from "@/components/global/Calendar";

export default function AdminUsersAll() {
  // 필터 상태 관리
  const [loginTypeFilter, setLoginTypeFilter] = useState("전체");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // 선택된 사용자 관리
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // 달력 표시 상태 관리
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  
  // 검색 상태 관리
  const [searchQuery, setSearchQuery] = useState("");
  
  // 페이지네이션 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // 더미 사용자 데이터
  const allUserData = [
    { 
      id: "U001", 
      loginType: "네이버", 
      joinDate: "2025-01-15",
      postCount: 25,
      commentCount: 78,
      companionCount: 12,
      status: "활동 중"
    },
    { 
      id: "U002", 
      loginType: "구글", 
      joinDate: "2025-02-20",
      postCount: 8,
      commentCount: 34,
      companionCount: 5,
      status: "활동 중"
    },
    { 
      id: "U003", 
      loginType: "카카오", 
      joinDate: "2024-12-10",
      postCount: 45,
      commentCount: 156,
      companionCount: 28,
      status: "제재 중"
    },
    { 
      id: "U004", 
      loginType: "네이버", 
      joinDate: "2025-03-05",
      postCount: 12,
      commentCount: 45,
      companionCount: 8,
      status: "활동 중"
    },
    { 
      id: "U005", 
      loginType: "구글", 
      joinDate: "2024-11-18",
      postCount: 0,
      commentCount: 2,
      companionCount: 0,
      status: "휴면"
    },
    { 
      id: "U006", 
      loginType: "카카오", 
      joinDate: "2025-01-22",
      postCount: 33,
      commentCount: 89,
      companionCount: 15,
      status: "활동 중"
    },
    { 
      id: "U007", 
      loginType: "네이버", 
      joinDate: "2024-10-30",
      postCount: 67,
      commentCount: 234,
      companionCount: 42,
      status: "제재 중"
    },
    { 
      id: "U008", 
      loginType: "구글", 
      joinDate: "2025-02-14",
      postCount: 19,
      commentCount: 67,
      companionCount: 11,
      status: "활동 중"
    },
    { 
      id: "U009", 
      loginType: "카카오", 
      joinDate: "2024-09-12",
      postCount: 2,
      commentCount: 8,
      companionCount: 1,
      status: "휴면"
    },
    { 
      id: "U010", 
      loginType: "네이버", 
      joinDate: "2025-03-10",
      postCount: 7,
      commentCount: 23,
      companionCount: 3,
      status: "활동 중"
    },
    { 
      id: "U011", 
      loginType: "구글", 
      joinDate: "2024-12-25",
      postCount: 56,
      commentCount: 145,
      companionCount: 31,
      status: "제재 중"
    },
    { 
      id: "U012", 
      loginType: "카카오", 
      joinDate: "2025-01-08",
      postCount: 14,
      commentCount: 52,
      companionCount: 9,
      status: "활동 중"
    },
    { 
      id: "U013", 
      loginType: "네이버", 
      joinDate: "2024-08-17",
      postCount: 89,
      commentCount: 312,
      companionCount: 56,
      status: "활동 중"
    },
    { 
      id: "U014", 
      loginType: "구글", 
      joinDate: "2025-02-28",
      postCount: 3,
      commentCount: 11,
      companionCount: 2,
      status: "활동 중"
    },
    { 
      id: "U015", 
      loginType: "카카오", 
      joinDate: "2024-07-03",
      postCount: 1,
      commentCount: 4,
      companionCount: 0,
      status: "휴면"
    },
  ];

  // 필터링된 사용자 데이터
  const filteredUserData = allUserData.filter(user => {
    const matchesSearch = user.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        user.loginType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.status.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLoginType = loginTypeFilter === "전체" || user.loginType === loginTypeFilter;
    const matchesStatus = statusFilter === "전체" || user.status === statusFilter;
    
    // 날짜 필터링 추가
    let matchesDateRange = true;
    if (startDate && endDate) {
      const userJoinDate = new Date(user.joinDate);
      const filterStart = new Date(startDate);
      const filterEnd = new Date(endDate);
      
      // 가입일이 필터 기간에 포함되는지 확인
      matchesDateRange = userJoinDate >= filterStart && userJoinDate <= filterEnd;
    }
    
    return matchesSearch && matchesLoginType && matchesStatus && matchesDateRange;
  }).sort((a, b) => {
    // 가입일 기준으로 정렬 (최신순)
    return new Date(b.joinDate) - new Date(a.joinDate);
  });

  // 로그인 방식 옵션
  const loginTypes = ["전체", "네이버", "구글", "카카오"];

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUserData.map(user => user.id));
    }
    setSelectAll(!selectAll);
  };

  // 개별 사용자 선택/해제
  const handleUserSelect = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
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
  const currentUserData = currentPage === 1 
    ? filteredUserData.slice(startIndex, startIndex + itemsPerPage)
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
  const handleLoginTypeFilterChange = (type) => {
    setLoginTypeFilter(type);
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
        {/* 로그인 방식 필터 */}
        <div className="flex items-center h-[30px] mb-1">
          <div className="text-[16px] font-semibold text-black w-28 flex-shrink-0">
            로그인 방식
          </div>
          <div className="flex gap-4 items-center">
            {loginTypes.map((type, index) => (
              <button 
                key={index}
                onClick={() => handleLoginTypeFilterChange(type)}
                className={`px-1 py-0 text-[16px] font-medium border-b-2 transition-colors ${
                  loginTypeFilter === type 
                    ? "text-black border-black" 
                    : "text-[#a6a6a6] border-transparent hover:text-black"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 계정 상태 필터 */}
        <div className="flex items-center h-[30px] mb-1">
          <div className="text-[16px] font-semibold text-black w-28 flex-shrink-0">
            계정 상태
          </div>
          <div className="flex gap-4 items-center">
            {["전체", "제재 중", "휴면", "활동 중"].map((status, index) => (
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

        {/* 가입 시기 필터 */}
        <div className="flex items-center h-[30px]">
          <div className="text-[16px] font-semibold text-black w-28 flex-shrink-0">
            가입 시기
          </div>
          <div className="flex gap-4 items-center relative">
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
                사용자 ID
              </div>
              <div className="text-[14px] font-semibold text-black w-24 overflow-hidden text-nowrap text-center">
                로그인 방식
              </div>
              <div className="text-[14px] font-semibold text-black w-24 overflow-hidden text-nowrap text-center">
                가입일
              </div>
            </div>
            <div className="flex items-center gap-4 text-[14px] font-semibold text-black">
              <div className="w-32 overflow-hidden text-nowrap text-center">
                게시물 수
              </div>
              <div className="w-32 overflow-hidden text-nowrap text-center">
                댓글 수
              </div>
              <div className="w-32 overflow-hidden text-nowrap text-center">
                동행 횟수
              </div>
              <div className="w-32 text-center">
                상태
              </div>
            </div>
          </div>

          {/* 테이블 바디 */}
          {currentUserData.length > 0 ? (
            currentUserData.map((user, index) => (
              <div 
                key={user.id}
                className={`border-b border-gray-200 py-2 px-4 flex items-center justify-between text-sm ${
                  user.status === "제재 중" ? "bg-[#FFC37F]" : 
                  user.status === "휴면" ? "bg-[#EEF0F2]" : "bg-white"
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserSelect(user.id)}
                    className="w-4 h-4 rounded-[2px] border border-[#828282] bg-white"
                  />
                  <div className="text-[14px] font-medium text-black w-24 overflow-hidden text-nowrap text-center">
                    {user.id}
                  </div>
                  <div className="text-[14px] font-medium text-black w-24 overflow-hidden text-nowrap text-center">
                    {user.loginType}
                  </div>
                  <div className="text-[14px] font-medium text-black w-24 overflow-hidden text-nowrap text-center">
                    {user.joinDate}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[14px] font-medium text-black">
                  <div className="w-32 overflow-hidden text-nowrap text-center">
                    {user.postCount}개
                  </div>
                  <div className="w-32 overflow-hidden text-nowrap text-center">
                    {user.commentCount}개
                  </div>
                  <div className="w-32 overflow-hidden text-nowrap text-center">
                    {user.companionCount}회
                  </div>
                  <div className="w-32 text-center">
                    {user.status}
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

      {/* 선택 항목 관리 버튼 */}
      <div className="flex justify-end">
        <button className="bg-[#6DADFF] text-white px-4 py-2 rounded-[8px] text-[16px] font-medium">
          선택 항목 관리
        </button>
      </div>
    </div>
  );
}