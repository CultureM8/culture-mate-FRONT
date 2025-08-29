"use client";

import { useState } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";

export default function AdminHelpContact() {
  // 필터 상태 관리
  const [statusFilter, setStatusFilter] = useState("전체");
  const [typeFilter, setTypeFilter] = useState("전체");
  
  // 선택된 문의 관리
  const [selectedInquiries, setSelectedInquiries] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // 검색 상태 관리
  const [searchQuery, setSearchQuery] = useState("");
  
  // 페이지네이션 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // 더미 1:1 문의 데이터
  const allInquiryData = [
    { 
      id: "INQ001", 
      inquiryNumber: "202501001",
      datetime: "2025-08-29 14:32:15",
      category: "계정/회원정보",
      userId: "user123",
      subject: "로그인이 안 되는 문제에 대해 문의드립니다",
      status: "답변 완료"
    },
    { 
      id: "INQ002", 
      inquiryNumber: "202501002",
      datetime: "2025-08-29 13:45:22",
      category: "이벤트 관련",
      userId: "event_lover",
      subject: "이벤트 예약 취소 및 환불 요청",
      status: "답변 완료"
    },
    { 
      id: "INQ003", 
      inquiryNumber: "202501003",
      datetime: "2025-08-29 12:18:43",
      category: "사이트 이용",
      userId: "techuser99",
      subject: "모바일 앱에서 이미지 업로드가 되지 않습니다",
      status: "답변 완료"
    },
    { 
      id: "INQ004", 
      inquiryNumber: "202501004",
      datetime: "2025-08-29 11:27:08",
      category: "문의",
      userId: "buyer2025",
      subject: "결제 완료 후 티켓이 발송되지 않았습니다",
      status: "답변 완료"
    },
    { 
      id: "INQ005", 
      inquiryNumber: "202501005",
      datetime: "2025-08-29 10:55:17",
      category: "문의",
      userId: "newbie_user",
      subject: "서비스 이용 방법에 대해 자세히 알고 싶습니다",
      status: "답변 완료"
    },
    { 
      id: "INQ006", 
      inquiryNumber: "202501006",
      datetime: "2025-08-29 09:12:34",
      category: "이벤트 관련",
      userId: "companion_seeker",
      subject: "동행 매칭 시스템은 어떻게 작동하나요?",
      status: "답변 완료"
    },
    { 
      id: "INQ007", 
      inquiryNumber: "202501007",
      datetime: "2025-08-29 16:41:29",
      category: "신고",
      userId: "safety_first",
      subject: "부적절한 게시글 신고합니다",
      status: "-"
    },
    { 
      id: "INQ008", 
      inquiryNumber: "202501008",
      datetime: "2025-08-29 15:23:56",
      category: "계정/회원정보",
      userId: "forgot_pw",
      subject: "비밀번호를 잊어버렸는데 재설정이 안됩니다",
      status: "-"
    },
    { 
      id: "INQ009", 
      inquiryNumber: "202501009",
      datetime: "2025-08-29 14:58:12",
      category: "이벤트 관련",
      userId: "culture_fan",
      subject: "공연 좌석 변경이 가능한지 문의드립니다",
      status: "-"
    },
    { 
      id: "INQ010", 
      inquiryNumber: "202501010",
      datetime: "2025-08-29 13:37:48",
      category: "사이트 이용",
      userId: "mobile_user",
      subject: "앱이 자주 종료되는 현상이 발생합니다",
      status: "-"
    },
    { 
      id: "INQ011", 
      inquiryNumber: "202501011",
      datetime: "2025-08-29 12:44:21",
      category: "건의",
      userId: "community_lover",
      subject: "게시글 작성 시 첨부파일 용량 제한 개선 건의",
      status: "-"
    },
    { 
      id: "INQ012", 
      inquiryNumber: "202501012",
      datetime: "2025-08-29 11:59:33",
      category: "문의",
      userId: "payment_issue",
      subject: "카드 결제 중 오류가 발생했습니다",
      status: "-"
    },
    { 
      id: "INQ013", 
      inquiryNumber: "202501013",
      datetime: "2025-08-29 10:16:07",
      category: "문의",
      userId: "curious_user",
      subject: "개인정보 처리방침에 대해 질문이 있습니다",
      status: "-"
    },
    { 
      id: "INQ014", 
      inquiryNumber: "202501014",
      datetime: "2025-08-29 09:42:54",
      category: "이벤트 관련",
      userId: "travel_buddy",
      subject: "동행 후기 작성은 어디서 할 수 있나요?",
      status: "-"
    },
    { 
      id: "INQ015", 
      inquiryNumber: "202501015",
      datetime: "2025-08-29 08:28:41",
      category: "기타",
      userId: "feedback_user",
      subject: "서비스 개선 제안사항을 전달하고 싶습니다",
      status: "-"
    },
  ];

  // 필터링된 문의 데이터
  const filteredInquiryData = allInquiryData.filter(inquiry => {
    const matchesSearch = inquiry.inquiryNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        inquiry.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        inquiry.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        inquiry.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "전체" || inquiry.status === statusFilter;
    const matchesType = typeFilter === "전체" || inquiry.category === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  }).sort((a, b) => {
    // 최신순 정렬
    return new Date(b.datetime) - new Date(a.datetime);
  });

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedInquiries([]);
    } else {
      setSelectedInquiries(currentInquiryData.map(inquiry => inquiry.id));
    }
    setSelectAll(!selectAll);
  };

  // 개별 문의 선택/해제
  const handleInquirySelect = (inquiryId) => {
    if (selectedInquiries.includes(inquiryId)) {
      setSelectedInquiries(selectedInquiries.filter(id => id !== inquiryId));
    } else {
      setSelectedInquiries([...selectedInquiries, inquiryId]);
    }
  };

  // 페이지네이션 계산 - 총 3페이지로 고정
  const totalPages = 3;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInquiryData = currentPage === 1 
    ? filteredInquiryData.slice(startIndex, startIndex + itemsPerPage)
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
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    resetToFirstPage();
  };

  const handleTypeFilterChange = (type) => {
    setTypeFilter(type);
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
        {/* 상태 필터 */}
        <div className="flex items-center h-[30px] mb-1">
          <div className="text-[16px] font-semibold text-black w-28 flex-shrink-0">
            상태
          </div>
          <div className="flex gap-4 items-center">
            {["전체", "답변 완료", "-"].map((status, index) => (
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

        {/* 문의 유형 필터 */}
        <div className="flex items-center h-[30px]">
          <div className="text-[16px] font-semibold text-black w-28 flex-shrink-0">
            문의 유형
          </div>
          <div className="flex gap-4 items-center">
            {["전체", "문의", "건의", "계정/회원정보", "사이트 이용", "신고", "이벤트 관련", "기타"].map((type, index) => (
              <button 
                key={index}
                onClick={() => handleTypeFilterChange(type)}
                className={`px-1 py-0 text-[16px] font-medium border-b-2 transition-colors ${
                  typeFilter === type 
                    ? "text-black border-black" 
                    : "text-[#a6a6a6] border-transparent hover:text-black"
                }`}
              >
                {type}
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
              <div className="text-[14px] font-semibold text-black w-20 overflow-hidden text-nowrap text-center">
                문의 번호
              </div>
              <div className="text-[14px] font-semibold text-black w-40 overflow-hidden text-nowrap text-center">
                문의 일시
              </div>
              <div className="text-[14px] font-semibold text-black w-24 overflow-hidden text-nowrap text-center">
                문의 유형
              </div>
              <div className="text-[14px] font-semibold text-black w-24 overflow-hidden text-nowrap text-center">
                사용자ID
              </div>
              <div className="text-[14px] font-semibold text-black w-64 overflow-hidden text-nowrap text-center">
                제목
              </div>
            </div>
            <div className="flex items-center text-[14px] font-semibold text-black">
              <div className="w-20 text-center">
                상태
              </div>
            </div>
          </div>

          {/* 테이블 바디 */}
          {currentInquiryData.length > 0 ? (
            currentInquiryData.map((inquiry, index) => (
              <div 
                key={inquiry.id}
                className={`bg-white border-b border-gray-200 py-2 px-4 flex items-center justify-between text-sm ${
                  inquiry.status === "답변 완료" ? "bg-gray-100" : ""
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedInquiries.includes(inquiry.id)}
                    onChange={() => handleInquirySelect(inquiry.id)}
                    className="w-4 h-4 rounded-[2px] border border-[#828282] bg-white"
                  />
                  <div className="text-[14px] font-medium text-black w-20 overflow-hidden text-nowrap text-center">
                    {inquiry.inquiryNumber}
                  </div>
                  <div className="text-[14px] font-medium text-black w-40 overflow-hidden text-nowrap text-center">
                    {inquiry.datetime}
                  </div>
                  <div className="text-[14px] font-medium text-black w-24 overflow-hidden text-nowrap text-center">
                    {inquiry.category}
                  </div>
                  <div className="text-[14px] font-medium text-black w-24 overflow-hidden text-nowrap text-center">
                    {inquiry.userId}
                  </div>
                  <div className="text-[14px] font-medium text-black w-64 text-center">
                    <span className="block truncate px-2">
                      {inquiry.subject}
                    </span>
                  </div>
                </div>
                <div className="flex items-center text-[14px] font-medium text-black">
                  <div className="w-20 text-center">
                    {inquiry.status}
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