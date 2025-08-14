"use client";

import { useState } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";
import PostEventMiniCard from "@/components/global/PostEventMiniCard";
import { useRouter } from "next/navigation";
import HelpSideBar from "@/components/help/HelpSideBar";

export default function InquiryPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    inquiryType: "",
    detailType: "",
    userType: "",
    title: "",
    content: ""
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [isInquiryDropdownOpen, setIsInquiryDropdownOpen] = useState(false);
  const [isDetailDropdownOpen, setIsDetailDropdownOpen] = useState(false);
  const [eventSearchTerm, setEventSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  // 1차 유형 옵션
  const inquiryTypeOptions = [
    { value: "문의", label: "문의" },
    { value: "건의", label: "건의" },
    { value: "계정/회원정보", label: "계정/회원정보" },
    { value: "사이트 이용", label: "사이트 이용" },
    { value: "신고", label: "신고" },
    { value: "이벤트 관련", label: "이벤트 관련" },
    { value: "기타", label: "기타" }
  ];

  // 1차 유형에 따른 2차 유형 옵션 정의
  const detailTypeOptions = {
    "계정/회원정보": [
      { value: "login", label: "로그인문제" },
      { value: "password", label: "비밀번호 찾기/초기화" },
      { value: "nickname", label: "닉네임 변경 요청" },
      { value: "withdrawal", label: "계정 탈퇴 문의" },
      { value: "account_other", label: "기타" }
    ],
    "사이트 이용": [
      { value: "bug", label: "버그/오류 제보" },
      { value: "notification", label: "알림 문제" },
      { value: "upload", label: "업로드 오류" },
      { value: "site_other", label: "기타" }
    ],
    "신고": [
      { value: "post_report", label: "게시글 신고" },
      { value: "comment_report", label: "댓글 신고" },
      { value: "user_report", label: "사용자 신고" },
      { value: "spam", label: "스팸/광고" },
      { value: "abuse", label: "욕설/비방" },
      { value: "copyright", label: "저작권 침해" },
      { value: "report_other", label: "기타" }
    ],
    "이벤트 관련": [
      { value: "event_register", label: "이벤트 등록 요청" },
      { value: "event_modify", label: "이벤트 정보 수정 요청" },
      { value: "companion", label: "동행 모집/참여 문의" },
      { value: "event_other", label: "기타 이벤트 관련 문의" }
    ]
  };

  // 2차 유형이 필요한 1차 유형인지 확인
  const hasDetailType = (inquiryType) => {
    return detailTypeOptions[inquiryType] && detailTypeOptions[inquiryType].length > 0;
  };

  // 현재 선택된 1차 유형에 해당하는 2차 유형 옵션들
  const currentDetailOptions = detailTypeOptions[formData.inquiryType] || [];

  const handleInquiryTypeSelect = (type) => {
    setFormData(prev => ({
      ...prev,
      inquiryType: type,
      detailType: "" // 1차 유형 변경 시 2차 유형 초기화
    }));
    setIsInquiryDropdownOpen(false);
  };

  const handleDetailTypeSelect = (type) => {
    setFormData(prev => ({
      ...prev,
      detailType: type
    }));
    setIsDetailDropdownOpen(false);
  };

  const handleEventSearch = () => {
    // 임시로 이벤트 선택 처리
    if (eventSearchTerm.trim()) {
      setSelectedEvent({
        id: 1,
        title: eventSearchTerm,
        description: "이벤트 정보에 대한 내용을 두 줄 이내로 간단하게 보이도록 표현",
        participants: "000명",
        rating: "4.0",
        likes: "관심",
        eventCount: "000개"
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (selectedImages.length + files.length <= 3) {
      setSelectedImages(prev => [...prev, ...files]);
    }
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // 필수 필드 검증
    if (!formData.inquiryType) {
      alert("문의 유형을 선택해주세요.");
      return;
    }
    
    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    
    if (!formData.content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    
    if (formData.content.trim().length < 10) {
      alert("내용을 최소 10자 이상 입력해주세요.");
      return;
    }

    // 새로운 문의 데이터 생성
    const newInquiry = {
      id: Date.now(), // 임시 ID (실제로는 서버에서 생성)
      title: formData.title.trim(),
      date: new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\. /g, '.').replace(/:/g, ':'),
      content: formData.content.trim(),
      status: "답변대기",
      inquiryType: formData.inquiryType,
      detailType: formData.detailType,
      selectedEvent: selectedEvent,
      images: selectedImages
    };

    // 실제로는 API 호출로 서버에 데이터 전송
    console.log("문의 등록:", newInquiry);
    
    // 로컬 스토리지에 임시 저장 (실제 구현에서는 API 사용)
    const existingInquiries = JSON.parse(localStorage.getItem('contactHistory') || '[]');
    existingInquiries.unshift(newInquiry); // 최신 문의를 맨 앞에 추가
    localStorage.setItem('contactHistory', JSON.stringify(existingInquiries));
    
    // 성공 메시지 표시
    alert("문의가 성공적으로 등록되었습니다.");
    
    // 문의내역 페이지로 이동
    router.push('/help/contact-history');
  };

  const handleCancel = () => {
    // 모든 내용 초기화
    setFormData({
      inquiryType: "",
      detailType: "",
      userType: "",
      title: "",
      content: ""
    });
    setSelectedImages([]);
    setEventSearchTerm("");
    setSelectedEvent(null);
    setIsInquiryDropdownOpen(false);
    setIsDetailDropdownOpen(false);
  };

  return (
    <div className="w-full min-h-screen">
      {/* 1. 고객센터 큰 타이틀 - 반응형 정렬 */}
      <div className="w-full">
        <div className="w-full max-w-none lg:max-w-[1200px] mx-auto px-4 lg:px-4 md:px-6 sm:px-4">
          <h1 className="text-4xl font-bold py-[10px] h-16">
            고객센터
          </h1>
        </div>
      </div>
      
      {/* 2. 메인 컨텐츠 영역 */}
      <div className="w-full max-w-none lg:max-w-[1200px] mx-auto px-4 lg:px-4 md:px-6 sm:px-4 flex flex-col lg:flex-row gap-6 mt-8">
        {/* 왼쪽 사이드바 */}
        <div className="w-full lg:w-[200px] lg:shrink-0 mb-6 lg:mb-0">
          <div className="lg:-ml-4">
            <HelpSideBar />
          </div>
        </div>
        
        {/* 오른쪽 메인 컨텐츠 */}
        <div className="flex-1 w-full lg:max-w-[980px]">
          {/* 1:1 문의하기 소제목 */}
          <div className="relative w-full pb-6">
            <div className="flex flex-col justify-center px-5 pt-8 pb-4">
              <h2 className="font-bold text-[18px] text-[#26282a] leading-[1.55] whitespace-nowrap">
                1:1 문의하기
              </h2>
            </div>
            <div className="w-full h-px bg-[#eef0f2]"></div>
          </div>

          {/* 문의 폼 */}
          <div className="px-5">
            {/* 문의 유형 */}
            <div className="mb-6">
              <label className="block text-[16px] font-medium text-[#26282a] mb-3">
                문의 유형
              </label>
              <div className="flex gap-4">
                {/* 유형 선택 */}
                <div className="relative flex-1">
                  <button
                    onClick={() => setIsInquiryDropdownOpen(!isInquiryDropdownOpen)}
                    className="w-full h-[48px] px-4 border border-[#9EA0A2] rounded-[4px] bg-white text-[14px] cursor-pointer focus:border-[#76787A] focus:outline-none flex items-center justify-between"
                  >
                    <span className={formData.inquiryType ? "text-black" : "text-[#999]"}>
                      {formData.inquiryType || "유형을 선택해 주세요"}
                    </span>
                    <Image 
                      src={ICONS.DROP_ARROW}
                      alt="dropdown arrow"
                      width={16}
                      height={16}
                      className={`transition-transform ${isInquiryDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  
                  {/* 커스텀 드롭다운 메뉴 */}
                  {isInquiryDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-lg z-10">
                      {inquiryTypeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleInquiryTypeSelect(option.value)}
                          className="w-full px-4 py-2 text-left text-[14px] hover:bg-gray-50 border-none outline-none"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* 상세 유형 선택 */}
                <div className="relative flex-1">
                  <button
                    onClick={() => hasDetailType(formData.inquiryType) && setIsDetailDropdownOpen(!isDetailDropdownOpen)}
                    disabled={!hasDetailType(formData.inquiryType)}
                    className={`w-full h-[48px] px-4 border border-[#9EA0A2] rounded-[4px] bg-white text-[14px] cursor-pointer focus:border-[#76787A] focus:outline-none flex items-center justify-between ${
                      !hasDetailType(formData.inquiryType) ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <span className={
                      !hasDetailType(formData.inquiryType) 
                        ? "text-gray-400" 
                        : formData.detailType 
                          ? "text-black" 
                          : "text-[#999]"
                    }>
                      {formData.detailType 
                        ? currentDetailOptions.find(opt => opt.value === formData.detailType)?.label 
                        : "상세 유형을 선택해 주세요"
                      }
                    </span>
                    <Image 
                      src={ICONS.DROP_ARROW}
                      alt="dropdown arrow"
                      width={16}
                      height={16}
                      className={`transition-transform ${isDetailDropdownOpen ? "rotate-180" : ""}`}
                      style={{ 
                        filter: !hasDetailType(formData.inquiryType) 
                          ? 'brightness(0) saturate(100%) invert(83%) sepia(1%) saturate(1088%) hue-rotate(184deg) brightness(94%) contrast(93%)' 
                          : 'none' 
                      }}
                    />
                  </button>
                  
                  {/* 커스텀 드롭다운 메뉴 */}
                  {isDetailDropdownOpen && hasDetailType(formData.inquiryType) && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-lg z-10">
                      {currentDetailOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleDetailTypeSelect(option.value)}
                          className="w-full px-4 py-2 text-left text-[14px] hover:bg-gray-50 border-none outline-none"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 문의 내용 */}
            <div className="mb-6">
              <label className="block text-[16px] font-medium text-[#26282a] mb-3">
                문의 내용
              </label>
              
              {/* 제목 입력 */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="제목을 입력해 주세요"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full h-[48px] px-4 border border-[#9EA0A2] rounded-[4px] text-[14px] placeholder-[#999] focus:border-[#76787A] focus:outline-none"
                />
              </div>
              
              {/* 내용 입력 */}
              <div className="mb-4">
                <textarea
                  placeholder="내용을 입력해 주세요. (최소 10자 이상)"
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  className="w-full h-[200px] px-4 py-3 border border-[#9EA0A2] rounded-[4px] text-[14px] placeholder-[#999] resize-none focus:border-[#76787A] focus:outline-none"
                />
                <div className="text-right text-[12px] text-[#999] mt-1">
                  ({formData.content.length}/5,000자)
                </div>
              </div>
            </div>

            {/* 이미지 첨부 */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                {/* 이미지 추가 버튼 */}
                <label className="w-[80px] h-[80px] border-2 border-dashed border-[#ddd] rounded-[4px] flex items-center justify-center cursor-pointer hover:border-[#999] transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Image 
                    src={ICONS.CAMERA}
                    alt="add image"
                    width={24}
                    height={24}
                    className="opacity-60"
                  />
                </label>
                
                {/* 선택된 이미지들 */}
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative w-[80px] h-[80px] border border-[#ddd] rounded-[4px] overflow-hidden">
                    <img 
                      src={URL.createObjectURL(image)}
                      alt={`uploaded ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center"
                    >
                      <Image 
                        src={ICONS.X}
                        alt="remove"
                        width={12}
                        height={12}
                      />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* 안내 텍스트 */}
              <div className="text-[12px] text-[#C6C8CA] space-y-1">
                <div>• 업로드한 이미지 저작권 및 초상권 관련 책임은 게시자 본인에게 있습니다.</div>
                <div>• 사진은 최대 3장까지 등록 가능합니다.</div>
                <div>• 10MB 이하의 jpg, png, gif, pdf 이미지만 업로드 가능합니다.</div>
                <div>• 본 사이트와 무관한 내용이거나 음란 및 불법적인 내용은 통보 없이 삭제될 수 있습니다.</div>
              </div>
            </div>

            {/* 이벤트 정보 */}
            <div className="mb-8">
              <label className="block text-[16px] font-medium text-[#26282a] mb-3">
                이벤트 정보
              </label>
              
              {/* 부가 설명 */}
              <div className="text-[14px] text-[#999] mb-4">
                문의내용과 관련된 이벤트 정보가 있는 경우에만 선택해 주세요.
              </div>
              
              {/* 검색창 */}
              <div className="relative mb-4">
                <div className="
                  w-[300px] 
                  h-8 
                  border 
                  border-[#c6c8ca] 
                  rounded-[20px]
                  flex 
                  items-center 
                  px-2.5
                  bg-white
                ">
                  <input
                    type="text"
                    placeholder="검색"
                    value={eventSearchTerm}
                    onChange={(e) => setEventSearchTerm(e.target.value)}
                    className="
                      flex-1 
                      text-[16px] 
                      font-medium
                      text-black
                      placeholder:text-[#c6c8ca]
                      leading-[1.5]
                      tracking-[0.032px]
                      outline-none
                      bg-transparent
                    "
                  />
                  <button 
                    onClick={handleEventSearch}
                    className="shrink-0 ml-2"
                  >
                    <Image
                      src={ICONS.SEARCH}
                      alt="search"
                      width={24}
                      height={24}
                    />
                  </button>
                </div>
              </div>
              
              {/* 선택된 이벤트 카드 */}
              {selectedEvent && (
                <div className="mb-4">
                  <PostEventMiniCard />
                </div>
              )}
            </div>

            {/* 버튼 영역 */}
            <div className="flex justify-end gap-3 pb-8">
              <button 
                onClick={handleCancel}
                className="px-6 py-3 border border-[#EEF0F2] rounded-[4px] text-[14px] font-medium text-[#76787A] bg-[#EEF0F2] hover:bg-[#ddd] transition-colors"
              >
                취소
              </button>
              <button 
                onClick={handleSubmit}
                className="px-6 py-3 bg-[#C6C8CA] text-[#26282A] rounded-[4px] text-[14px] font-medium hover:bg-[#a8abae] transition-colors"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}