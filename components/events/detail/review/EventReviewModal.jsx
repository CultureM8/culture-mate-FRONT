"use client"

import { useState } from "react";
import Modal from "../../../global/Modal";
import StarRating from "@/lib/StarRating";
import { addEventReview } from "@/lib/eventReviewData";

export default function EventReviewModal({ isOpen, onClose, 
  eventCode,
  onReviewAdded
}) {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
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

    if (!eventCode) {
      alert("이벤트 코드가 없습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 새 리뷰 데이터 생성
      const newReview = {
        eventCode,
        userNickname: "익명", // 실제로는 로그인한 사용자 닉네임을 사용
        score: rating,
        content: content.trim()
      };

      // 더미데이터에 리뷰 추가
      const addedReview = await addEventReview(newReview);
      
      alert("후기가 성공적으로 등록되었습니다!");
      
      // 폼 초기화
      setContent("");
      setRating(0);
      
      // 부모 컴포넌트에 새 리뷰 추가를 알림
      if (onReviewAdded) {
        onReviewAdded(addedReview);
      }
      
      onClose();
    } catch (error) {
      console.error("리뷰 등록 중 오류 발생:", error);
      alert("리뷰 등록 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
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
            disabled={isSubmitting}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isSubmitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </div>
    </Modal>
  )
}