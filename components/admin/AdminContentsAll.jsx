"use client";

import { useState } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";
import Calendar from "@/components/global/Calendar";

export default function AdminContentsAll() {
  // 필터 상태 관리
  const [postTypeFilter, setPostTypeFilter] = useState("전체");
  const [createdStartDate, setCreatedStartDate] = useState("");
  const [createdEndDate, setCreatedEndDate] = useState("");
  const [modifiedStartDate, setModifiedStartDate] = useState("");
  const [modifiedEndDate, setModifiedEndDate] = useState("");
  
  // 선택된 게시글 관리
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // 달력 표시 상태 관리
  const [showCreatedStartCalendar, setShowCreatedStartCalendar] = useState(false);
  const [showCreatedEndCalendar, setShowCreatedEndCalendar] = useState(false);
  const [showModifiedStartCalendar, setShowModifiedStartCalendar] = useState(false);
  const [showModifiedEndCalendar, setShowModifiedEndCalendar] = useState(false);
  
  // 검색 상태 관리
  const [searchQuery, setSearchQuery] = useState("");
  
  // 페이지네이션 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // 더미 게시글 데이터
  const allPostData = [
    { 
      id: "P001", 
      type: "동행 모집", 
      title: "서울 근교 단풍구경 같이 하실분 모집합니다", 
      author: "문화메이트123",
      comments: 15,
      likes: 23,
      bookmarks: 8,
      createdAt: "2025-08-30 14:30:00",
      modifiedAt: "2025-08-30 14:30:00"
    },
    { 
      id: "P002", 
      type: "이벤트 리뷰", 
      title: "겨울왕국 3 특별상영회 후기", 
      author: "영화마니아",
      comments: 8,
      likes: 45,
      bookmarks: 12,
      createdAt: "2025-08-29 20:15:00",
      modifiedAt: "2025-08-29 21:30:00"
    },
    { 
      id: "P003", 
      type: "자유게시판", 
      title: "문화생활 추천 좀 해주세요!", 
      author: "신입회원",
      comments: 22,
      likes: 18,
      bookmarks: 5,
      createdAt: "2025-08-29 16:45:00",
      modifiedAt: "2025-08-29 16:45:00"
    },
    { 
      id: "P004", 
      type: "동행 모집", 
      title: "이번 주말 국립현대미술관 전시 관람", 
      author: "아트러버",
      comments: 6,
      likes: 12,
      bookmarks: 15,
      createdAt: "2025-08-28 11:20:00",
      modifiedAt: "2025-08-28 11:20:00"
    },
    { 
      id: "P005", 
      type: "이벤트 리뷰", 
      title: "모네의 정원 특별전 관람 후기", 
      author: "전시회마니아",
      comments: 12,
      likes: 67,
      bookmarks: 28,
      createdAt: "2025-08-27 19:10:00",
      modifiedAt: "2025-08-27 19:10:00"
    },
    { 
      id: "P006", 
      type: "자유게시판", 
      title: "혼자 문화생활 즐기는 팁 공유", 
      author: "솔로문화인",
      comments: 35,
      likes: 89,
      bookmarks: 42,
      createdAt: "2025-08-26 15:30:00",
      modifiedAt: "2025-08-27 09:15:00"
    },
    { 
      id: "P007", 
      type: "동행 모집", 
      title: "서울 재즈 페스티벌 함께 가실분", 
      author: "재즈애호가",
      comments: 9,
      likes: 31,
      bookmarks: 18,
      createdAt: "2025-08-25 13:45:00",
      modifiedAt: "2025-08-25 13:45:00"
    },
    { 
      id: "P008", 
      type: "이벤트 리뷰", 
      title: "로미오와 줄리엣 연극 후기 - 강력추천", 
      author: "연극팬",
      comments: 18,
      likes: 52,
      bookmarks: 21,
      createdAt: "2025-08-24 21:00:00",
      modifiedAt: "2025-08-24 21:00:00"
    },
    { 
      id: "P009", 
      type: "자유게시판", 
      title: "요즘 핫한 전시회 정보 모음", 
      author: "정보제공자",
      comments: 28,
      likes: 73,
      bookmarks: 35,
      createdAt: "2025-08-23 10:30:00",
      modifiedAt: "2025-08-24 14:20:00"
    },
    { 
      id: "P010", 
      type: "동행 모집", 
      title: "부산 국제 록 페스티벌 동행구함", 
      author: "록음악마니아",
      comments: 4,
      likes: 16,
      bookmarks: 9,
      createdAt: "2025-08-22 17:15:00",
      modifiedAt: "2025-08-22 17:15:00"
    },
    { 
      id: "P011", 
      type: "이벤트 리뷰", 
      title: "백조의 호수 발레공연 감상후기", 
      author: "발레러버",
      comments: 11,
      likes: 38,
      bookmarks: 14,
      createdAt: "2025-08-21 20:45:00",
      modifiedAt: "2025-08-21 20:45:00"
    },
    { 
      id: "P012", 
      type: "자유게시판", 
      title: "문화메이트 서비스 정말 좋네요!", 
      author: "만족한유저",
      comments: 42,
      likes: 156,
      bookmarks: 67,
      createdAt: "2025-08-20 14:00:00",
      modifiedAt: "2025-08-21 08:30:00"
    },
    { 
      id: "P013", 
      type: "동행 모집", 
      title: "제주 문화축제 같이 갈 사람 구합니다", 
      author: "제주도민",
      comments: 7,
      likes: 25,
      bookmarks: 11,
      createdAt: "2025-08-19 12:20:00",
      modifiedAt: "2025-08-19 12:20:00"
    },
    { 
      id: "P014", 
      type: "이벤트 리뷰", 
      title: "디지털 아트 체험전 방문 후기", 
      author: "테크아티스트",
      comments: 13,
      likes: 44,
      bookmarks: 19,
      createdAt: "2025-08-18 16:50:00",
      modifiedAt: "2025-08-18 16:50:00"
    },
    { 
      id: "P015", 
      type: "자유게시판", 
      title: "가을 문화생활 계획 세우기", 
      author: "계획왕",
      comments: 26,
      likes: 81,
      bookmarks: 33,
      createdAt: "2025-08-17 09:40:00",
      modifiedAt: "2025-08-17 15:25:00"
    },
  ];

  // 필터링된 게시글 데이터
  const filteredPostData = allPostData.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        post.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        post.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = postTypeFilter === "전체" || post.type === postTypeFilter;
    
    // 날짜 필터링 - 최초 작성 일시
    let matchesCreatedDateRange = true;
    if (createdStartDate && createdEndDate) {
      const postCreated = new Date(post.createdAt);
      const filterStart = new Date(createdStartDate + " 00:00:00");
      const filterEnd = new Date(createdEndDate + " 23:59:59");
      
      matchesCreatedDateRange = postCreated >= filterStart && postCreated <= filterEnd;
    }
    
    // 날짜 필터링 - 최종 수정 일시
    let matchesModifiedDateRange = true;
    if (modifiedStartDate && modifiedEndDate) {
      const postModified = new Date(post.modifiedAt);
      const filterStart = new Date(modifiedStartDate + " 00:00:00");
      const filterEnd = new Date(modifiedEndDate + " 23:59:59");
      
      matchesModifiedDateRange = postModified >= filterStart && postModified <= filterEnd;
    }
    
    return matchesSearch && matchesType && matchesCreatedDateRange && matchesModifiedDateRange;
  }).sort((a, b) => {
    // 최초 작성일시 기준으로 정렬 (최신순)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // 게시글 타입 옵션
  const postTypes = ["전체", "동행 모집", "이벤트 리뷰", "자유게시판"];

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(currentPostData.map(post => post.id));
    }
    setSelectAll(!selectAll);
  };

  // 개별 게시글 선택/해제
  const handlePostSelect = (postId) => {
    if (selectedPosts.includes(postId)) {
      setSelectedPosts(selectedPosts.filter(id => id !== postId));
    } else {
      setSelectedPosts([...selectedPosts, postId]);
    }
  };

  // 달력에서 날짜 선택 시 처리
  const handleCreatedStartDateSelect = (selectedDatesArray) => {
    if (selectedDatesArray.length > 0) {
      const selectedDate = selectedDatesArray[0];
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setCreatedStartDate(formattedDate);
      setShowCreatedStartCalendar(false);
    }
  };

  const handleCreatedEndDateSelect = (selectedDatesArray) => {
    if (selectedDatesArray.length > 0) {
      const selectedDate = selectedDatesArray[0];
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setCreatedEndDate(formattedDate);
      setShowCreatedEndCalendar(false);
    }
  };

  const handleModifiedStartDateSelect = (selectedDatesArray) => {
    if (selectedDatesArray.length > 0) {
      const selectedDate = selectedDatesArray[0];
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setModifiedStartDate(formattedDate);
      setShowModifiedStartCalendar(false);
    }
  };

  const handleModifiedEndDateSelect = (selectedDatesArray) => {
    if (selectedDatesArray.length > 0) {
      const selectedDate = selectedDatesArray[0];
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setModifiedEndDate(formattedDate);
      setShowModifiedEndCalendar(false);
    }
  };

  // 페이지네이션 계산 - 총 3페이지로 고정
  const totalPages = 3;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPostData = currentPage === 1 
    ? filteredPostData.slice(startIndex, startIndex + itemsPerPage)
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
  const handlePostTypeFilterChange = (type) => {
    setPostTypeFilter(type);
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
        {/* 게시물 분류 필터 */}
        <div className="flex items-center h-[30px] mb-1">
          <div className="text-[16px] font-semibold text-black w-28 flex-shrink-0">
            게시물 분류
          </div>
          <div className="flex gap-4 items-center">
            {postTypes.map((type, index) => (
              <button 
                key={index}
                onClick={() => handlePostTypeFilterChange(type)}
                className={`px-1 py-0 text-[16px] font-medium border-b-2 transition-colors ${
                  postTypeFilter === type 
                    ? "text-black border-black" 
                    : "text-[#a6a6a6] border-transparent hover:text-black"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 최초 작성 일시 필터 */}
        <div className="flex items-center h-[30px] mb-1">
          <div className="text-[16px] font-semibold text-black w-28 flex-shrink-0">
            최초 작성 일시
          </div>
          <div className="flex gap-4 items-center relative">
            <button 
              onClick={() => {setCreatedStartDate(""); setCreatedEndDate("");}}
              className={`px-1 py-0 text-[16px] font-medium border-b-2 transition-colors ${
                !createdStartDate && !createdEndDate 
                  ? "text-black border-black" 
                  : "text-[#a6a6a6] border-transparent hover:text-black"
              }`}
            >
              전체
            </button>
            <span className="text-[16px] text-[#a6a6a6]">
              {createdStartDate || "0000-00-00"}
            </span>
            <div className="relative">
              <Image
                src={ICONS.CALENDAR}
                alt="created-start-calendar-icon"
                width={20}
                height={20}
                className="cursor-pointer"
                onClick={() => {
                  setShowCreatedStartCalendar(!showCreatedStartCalendar);
                  setShowCreatedEndCalendar(false);
                  setShowModifiedStartCalendar(false);
                  setShowModifiedEndCalendar(false);
                }}
              />
              {showCreatedStartCalendar && (
                <div className="absolute top-8 left-0 z-10 w-96">
                  <Calendar 
                    onDatesChange={handleCreatedStartDateSelect}
                    selectedDates={createdStartDate ? [new Date(createdStartDate)] : []}
                    mode="single"
                  />
                </div>
              )}
            </div>
            <span className="text-[16px] text-black">~</span>
            <span className="text-[16px] text-[#a6a6a6]">
              {createdEndDate || "0000-00-00"}
            </span>
            <div className="relative">
              <Image
                src={ICONS.CALENDAR}
                alt="created-end-calendar-icon"
                width={20}
                height={20}
                className="cursor-pointer"
                onClick={() => {
                  setShowCreatedEndCalendar(!showCreatedEndCalendar);
                  setShowCreatedStartCalendar(false);
                  setShowModifiedStartCalendar(false);
                  setShowModifiedEndCalendar(false);
                }}
              />
              {showCreatedEndCalendar && (
                <div className="absolute top-8 left-0 z-10 w-96">
                  <Calendar 
                    onDatesChange={handleCreatedEndDateSelect}
                    selectedDates={createdEndDate ? [new Date(createdEndDate)] : []}
                    mode="single"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 최종 수정 일시 필터 */}
        <div className="flex items-center h-[30px]">
          <div className="text-[16px] font-semibold text-black w-28 flex-shrink-0">
            최종 수정 일시
          </div>
          <div className="flex gap-4 items-center relative">
            <button 
              onClick={() => {setModifiedStartDate(""); setModifiedEndDate("");}}
              className={`px-1 py-0 text-[16px] font-medium border-b-2 transition-colors ${
                !modifiedStartDate && !modifiedEndDate 
                  ? "text-black border-black" 
                  : "text-[#a6a6a6] border-transparent hover:text-black"
              }`}
            >
              전체
            </button>
            <span className="text-[16px] text-[#a6a6a6]">
              {modifiedStartDate || "0000-00-00"}
            </span>
            <div className="relative">
              <Image
                src={ICONS.CALENDAR}
                alt="modified-start-calendar-icon"
                width={20}
                height={20}
                className="cursor-pointer"
                onClick={() => {
                  setShowModifiedStartCalendar(!showModifiedStartCalendar);
                  setShowCreatedStartCalendar(false);
                  setShowCreatedEndCalendar(false);
                  setShowModifiedEndCalendar(false);
                }}
              />
              {showModifiedStartCalendar && (
                <div className="absolute top-8 left-0 z-10 w-96">
                  <Calendar 
                    onDatesChange={handleModifiedStartDateSelect}
                    selectedDates={modifiedStartDate ? [new Date(modifiedStartDate)] : []}
                    mode="single"
                  />
                </div>
              )}
            </div>
            <span className="text-[16px] text-black">~</span>
            <span className="text-[16px] text-[#a6a6a6]">
              {modifiedEndDate || "0000-00-00"}
            </span>
            <div className="relative">
              <Image
                src={ICONS.CALENDAR}
                alt="modified-end-calendar-icon"
                width={20}
                height={20}
                className="cursor-pointer"
                onClick={() => {
                  setShowModifiedEndCalendar(!showModifiedEndCalendar);
                  setShowCreatedStartCalendar(false);
                  setShowCreatedEndCalendar(false);
                  setShowModifiedStartCalendar(false);
                }}
              />
              {showModifiedEndCalendar && (
                <div className="absolute top-8 left-0 z-10 w-96">
                  <Calendar 
                    onDatesChange={handleModifiedEndDateSelect}
                    selectedDates={modifiedEndDate ? [new Date(modifiedEndDate)] : []}
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
          <div className="bg-[#f2f2f2] rounded-[4px] border border-[#a6a6a6] h-8 px-4 py-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded-[2px] border border-[#828282] bg-white flex-shrink-0"
            />
            <div className="text-[14px] font-semibold text-black w-16 overflow-hidden text-nowrap text-center flex-shrink-0">
              번호
            </div>
            <div className="text-[14px] font-semibold text-black w-20 overflow-hidden text-nowrap text-center flex-shrink-0">
              분류
            </div>
            <div className="text-[14px] font-semibold text-black flex-1 overflow-hidden text-nowrap text-center min-w-0">
              제목
            </div>
            <div className="text-[14px] font-semibold text-black w-20 overflow-hidden text-nowrap text-center flex-shrink-0">
              작성자
            </div>
            <div className="text-[14px] font-semibold text-black w-12 text-center flex-shrink-0">
              댓글
            </div>
            <div className="text-[14px] font-semibold text-black w-12 text-center flex-shrink-0">
              추천
            </div>
            <div className="text-[14px] font-semibold text-black w-12 text-center flex-shrink-0">
              관심
            </div>
            <div className="text-[14px] font-semibold text-black w-24 text-center flex-shrink-0">
              최초 작성
            </div>
            <div className="text-[14px] font-semibold text-black w-24 text-center flex-shrink-0">
              최종 수정
            </div>
          </div>

          {/* 테이블 바디 */}
          {currentPostData.length > 0 ? (
            currentPostData.map((post, index) => (
              <div 
                key={post.id}
                className="bg-white border-b border-gray-200 py-2 px-4 h-8 flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedPosts.includes(post.id)}
                  onChange={() => handlePostSelect(post.id)}
                  className="w-4 h-4 rounded-[2px] border border-[#828282] bg-white flex-shrink-0"
                />
                <div className="text-[14px] font-medium text-black w-16 overflow-hidden text-nowrap text-center flex-shrink-0">
                  {post.id}
                </div>
                <div className="text-[14px] font-medium text-black w-20 overflow-hidden text-nowrap text-center flex-shrink-0">
                  {post.type}
                </div>
                <div className="text-[14px] font-medium text-black flex-1 overflow-hidden text-ellipsis text-nowrap text-center px-1 min-w-0">
                  {post.title}
                </div>
                <div className="text-[14px] font-medium text-black w-20 overflow-hidden text-nowrap text-center flex-shrink-0">
                  {post.author}
                </div>
                <div className="text-[14px] font-medium text-black w-12 text-center flex-shrink-0">
                  {post.comments}
                </div>
                <div className="text-[14px] font-medium text-black w-12 text-center flex-shrink-0">
                  {post.likes}
                </div>
                <div className="text-[14px] font-medium text-black w-12 text-center flex-shrink-0">
                  {post.bookmarks}
                </div>
                <div className="text-[14px] font-medium text-black w-24 text-center flex-shrink-0">
                  <div className="flex flex-col justify-center text-xs">
                    <div>{post.createdAt.split(' ')[0]}</div>
                    <div>{post.createdAt.split(' ')[1]}</div>
                  </div>
                </div>
                <div className="text-[14px] font-medium text-black w-24 text-center flex-shrink-0">
                  <div className="flex flex-col justify-center text-xs">
                    <div>{post.modifiedAt.split(' ')[0]}</div>
                    <div>{post.modifiedAt.split(' ')[1]}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // 2, 3페이지는 빈 상태 표시
            <div className="text-center py-8 text-gray-500">
              <div>이 페이지에는 아직 데이터가 없습니다.</div>
            </div>
          )}

          {/* 페이지네이션 - 테이블 내부 */}
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

      {/* 하단 관리 버튼 */}
      <div className="flex justify-end">
        <button className="bg-[#6DADFF] text-white px-4 py-2 rounded-[8px] text-[16px] font-medium">
          선택 항목 관리
        </button>
      </div>
    </div>
  );
}