"use client"

import { useState } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";
import PostEventMiniCard from "@/components/global/PostEventMiniCard";
import TogetherWriteForm from "@/components/together/TogetherWriteForm";

export default function TogetherRecruitmentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCount, setSelectedCount] = useState("00 명");
  const [locationQuery, setLocationQuery] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 테스트용 더미 데이터
  const mockEventData = {
    eventImage: "/img/default_img.svg",
    eventType: "페스티벌", // 아무렇게나 쳐도 보이긴 하는데 일단은 냅둠
    eventName: "이벤트명",
    description: "이벤트 설명 최대 2줄 넘어가면 나머지는 ...으로 표기",
    recommendations: 500,
    starScore: 4.5,
    initialLiked: false,
    registeredPosts: 25
  };

  const handleSearch = () => {
    console.log("검색:", searchQuery);
  };

  const handleLocationSearch = () => {
    console.log("지역 검색:", locationQuery);
  };

  const handleCancel = () => {
  setShowCancelModal(true);
  };

  const handleSubmit = () => {
    console.log("등록하기");
    setShowSuccessModal(true);
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    // 이전 페이지로 이동 또는 폼 초기화
    window.history.back();
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-8 py-6">
        
        {/* 페이지 제목 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black">동행 모집글 작성</h1>
        </div>
        
        {/* TogetherWriteForm 컴포넌트 사용 */}
        <div className="mb-8">
          <TogetherWriteForm
            onEventSearch={handleSearch}
            onLocationSearch={handleLocationSearch}
            onFormChange={(formData) => console.log("Form changed:", formData)}
          />
        </div>

        {/* PostEventMiniCard - 수정된 가로 리스트형으로 표시 */}
        <div className="mb-8">
          <PostEventMiniCard {...mockEventData} />
        </div>

        {/* 모집글 작성 영역 */}
        <div className="space-y-6 mb-8">
          {/* 제목 입력 */}
          <div className="w-full">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              제목
            </label>
            <input
              type="text"
              className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="동행 모집글 제목을 입력해주세요"
            />
          </div>
          
          {/* 내용 입력 */}
          <div className="w-full">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              내용
            </label>
            <textarea
              className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:border-blue-500 resize-none"
              placeholder="동행 모집에 대한 상세 내용을 작성해주세요&#10;&#10;예시:&#10;- 함께 관람할 공연/행사 소개&#10;- 만날 장소 및 시간&#10;- 연락 방법&#10;- 기타 주의사항"
            />
          </div>
        </div>

        {/* 취소/등록 버튼 */}
        <div className="flex justify-end gap-4 mb-8">
          <button
            onClick={handleCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            등록
          </button>
        </div>

        {/* 취소 확인 팝업 */}
        {showCancelModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="bg-white p-6 rounded-lg shadow-lg relative z-10 max-w-sm mx-4">
              <h3 className="text-lg font-medium mb-4 text-center">
                작성을 취소하시겠습니까?
              </h3>
              <p className="text-sm text-gray-600 mb-6 text-center">
                작성 중인 내용이 모두 삭제됩니다.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  계속작성
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  취소하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 등록 완료 팝업 */}
        {showSuccessModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="bg-white p-6 rounded-lg shadow-lg relative z-10 max-w-sm mx-4">
              <h3 className="text-lg font-medium mb-4 text-center">
                등록되었습니다!
              </h3>
              <p className="text-sm text-gray-600 mb-6 text-center">
                동행 모집글이 성공적으로 등록되었습니다.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                확인
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}