"use client"

import { useState } from "react";
import Modal from "../../../global/Modal";
import StarRating from "@/lib/StarRating";

export default function EventReviewModal({ isOpen, onClose, 
  eventType = "이벤트유형", 
  eventName = "이벤트명", 
}) {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmit = () => {
    // 별점이 0점인 경우 확인
    if (rating === 0) {
      const confirmed = confirm("별점이 0점입니다. 정말로 0점을 주시겠습니까?");
      if (!confirmed) {
        return;
      }
    }

    // 내용이 비어있는 경우 확인
    if (!content.trim()) {
      alert("후기 내용을 입력해 주세요.");
      return;
    }

    // 여기에 후기 등록 로직 추가
    console.log("후기 등록:", { content, rating });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center p-6">
        {/* 페이지 타이틀 */}
        <h1 className="font-semibold text-2xl mb-6 text-gray-800">
          이벤트 후기 작성
        </h1>
  
        {/* 별점 */}
        <div className="mb-4 flex gap-2 items-center">
          <span>
            별점 :
          </span>
          <StarRating 
            rating={rating} 
            onRatingChange={setRating} 
          />
        </div>

  
        {/* 본문 */}
        <div className="w-[800px] h-[500px] mb-6">
          <textarea
            placeholder="후기 내용을 입력해 주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-4 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
  
        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 border rounded bg-gray-400 text-white hover:bg-gray-500">
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
            등록
          </button>
        </div>
      </div>
    </Modal>
  )
}