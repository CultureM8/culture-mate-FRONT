"use client";

import { useState, useContext, useEffect } from "react";
import Modal from "../../../global/Modal";
import StarRating from "@/lib/StarRating";
// 이벤트 리뷰 API 사용
import { createEventReview } from "@/lib/eventReviewApi";
import { LoginContext } from "@/components/auth/LoginProvider";
import { displayNameFromTriplet } from "@/lib/displayName";

export default function EventReviewModal({
  isOpen,
  onClose,
  eventId,
  onReviewAdded,
  eventData = {},
}) {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 모달로 표시할 에러/성공 메시지 상태
  const [alertMessage, setAlertMessage] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const { user, isLogined } = useContext(LoginContext);

  // 모달이 열릴 때마다 입력 초기화 (선택적)
  useEffect(() => {
    if (isOpen) {
      setContent("");
      setRating(1);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!isLogined || !user) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 1~5 범위로 고정
    const safeRating = Math.min(5, Math.max(1, Number(rating) || 1));

    if (!content.trim()) {
      alert("후기 내용을 입력해 주세요.");
      return;
    }

    const eid = Number(eventId);
    if (!eid || Number.isNaN(eid)) {
      alert("이벤트 아이디가 없습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        eventId: eid,
        rating: safeRating,
        content: content.trim(),
      };

      await submitReview(reviewData, user.token);

      const savedReview = await createEventReview(reviewData);

      onReviewAdded?.(savedReview);

      try {
        const uid = user?.id ?? user?.user_id ?? user?.memberId;
        if (typeof window !== "undefined" && uid != null) {
          localStorage.setItem(`reviewed:${eid}:${uid}`, "1");
        }
      } catch {}

      alert("후기가 성공적으로 등록되었습니다!");
      setContent("");
      setRating(1);
      onClose();
    } catch (error) {
      console.error("리뷰 등록 중 오류:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "리뷰 등록 중 오류가 발생했습니다.";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 사용자 표시명
  const getUserDisplayName = () => {
    if (!user) return "사용자";
    return displayNameFromTriplet(
      user.nickname,
      user.loginId ?? user.login_id,
      user.id ?? user.user_id
    );
  };

  if (!isLogined) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="flex flex-col items-center p-6">
          <h1 className="font-semibold text-2xl mb-6 text-gray-800">
            로그인이 필요합니다
          </h1>
          <p className="mb-6 text-gray-600">
            후기를 작성하려면 먼저 로그인해주세요.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
            확인
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="flex flex-col items-center p-6">
          <h1 className="font-semibold text-2xl mb-6 text-gray-800">
            이벤트 후기 작성
          </h1>

          <div className="mb-4 text-sm text-gray-600">
            작성자: {getUserDisplayName()}
          </div>

          <div className="mb-4 flex gap-2 items-center">
            <span>별점 :</span>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              mode="input"
              showNumber={true}
            />
          </div>

          <div className="w-[800px] h-[500px] mb-6">
            <textarea
              placeholder="후기 내용을 입력해 주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full p-4 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 border rounded bg-gray-400 text-white hover:bg-gray-500 disabled:opacity-70">
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
    </>
  );
}
