"use client";

import { useState } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";

export default function AdminContentsAllModal({ 
  isOpen, 
  onClose, 
  selectedPosts, 
  postData, 
  onApply 
}) {
  // 관리 옵션 상태
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [targetCategory, setTargetCategory] = useState("동행 모집");
  
  // 관리 옵션 목록
  const managementOptions = [
    { id: "hide", label: "게시글 숨김 처리", type: "status" },
    { id: "show", label: "게시글 공개 처리", type: "status" },
    { id: "move_category", label: "카테고리 이동", type: "category" },
    { id: "delete", label: "게시글 삭제", type: "delete" },
    { id: "reset_interactions", label: "상호작용 데이터 초기화 (댓글/추천/관심)", type: "reset" }
  ];

  // 카테고리 옵션
  const categoryOptions = ["동행 모집", "자유게시판"];

  // 옵션 선택/해제 처리
  const handleOptionChange = (optionId) => {
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions(selectedOptions.filter(id => id !== optionId));
    } else {
      // 게시글 상태 관리 옵션들은 상호 배타적
      if (optionId === "hide" || optionId === "show") {
        const filtered = selectedOptions.filter(id => id !== "hide" && id !== "show");
        setSelectedOptions([...filtered, optionId]);
      } else {
        setSelectedOptions([...selectedOptions, optionId]);
      }
    }
  };

  // 적용 버튼 클릭 처리
  const handleApply = () => {
    const managementData = {
      selectedPosts,
      selectedOptions,
      targetCategory: selectedOptions.includes("move_category") ? targetCategory : null
    };
    
    onApply(managementData);
    onClose();
    
    // 상태 초기화
    setSelectedOptions([]);
    setTargetCategory("동행 모집");
  };

  // 모달이 열려있지 않으면 렌더링하지 않음
  if (!isOpen) return null;

  // 선택된 게시글 정보 가져오기
  const selectedPostInfo = postData.filter(post => selectedPosts.includes(post.id));

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] max-h-[80vh] overflow-hidden flex flex-col shadow-2xl border border-gray-300">
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-black">
            선택 항목 관리
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Image
              src={ICONS.X}
              alt="close-modal"
              width={20}
              height={20}
            />
          </button>
        </div>

        {/* 모달 본문 - 스크롤 가능 영역 */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black mb-3">
                선택된 게시글 ({selectedPosts.length}개)
              </h3>
              <div className="max-h-32 overflow-y-auto bg-gray-50 p-3 border border-gray-200">
                {selectedPostInfo.length > 0 ? (
                  selectedPostInfo.map((post, index) => (
                    <div key={post.id} className="text-sm text-gray-700 mb-1">
                      {index + 1}. [{post.type}] {post.title}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">
                    선택된 게시글이 없습니다.
                  </div>
                )}
              </div>
            </div>

            {/* 관리 옵션 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black mb-3">
                관리 항목 선택
              </h3>
              <div className="space-y-3">
                {managementOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={option.id}
                      checked={selectedOptions.includes(option.id)}
                      onChange={() => handleOptionChange(option.id)}
                      className="w-4 h-4 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <label 
                      htmlFor={option.id}
                      className="text-sm font-medium text-black cursor-pointer flex-1"
                    >
                      {option.label}
                    </label>
                    
                    {/* 카테고리 이동이 선택된 경우 드롭다운 표시 */}
                    {option.id === "move_category" && selectedOptions.includes("move_category") && (
                      <select
                        value={targetCategory}
                        onChange={(e) => setTargetCategory(e.target.value)}
                        className="ml-4 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {categoryOptions.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 주의사항 */}
            {selectedOptions.includes("delete") && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-red-700">
                    주의: 게시글 삭제는 복구할 수 없습니다.
                  </span>
                </div>
              </div>
            )}

            {selectedOptions.includes("reset_interactions") && (
              <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-yellow-700">
                    주의: 상호작용 데이터 초기화는 복구할 수 없습니다.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleApply}
            disabled={selectedPosts.length === 0 || selectedOptions.length === 0}
            className="bg-[#6DADFF] text-white px-4 py-2 rounded-[8px] text-[16px] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5A9EFF] transition-colors"
          >
            선택 항목 적용
          </button>
        </div>
      </div>
    </div>
  );
}