"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PostEventMiniCard from "@/components/global/PostEventMiniCard";
import TogetherWriteForm from "@/components/together/TogetherWriteForm";
import ConfirmModal from "@/components/global/ConfirmModal";
import useLogin from "@/hooks/useLogin";
import useTogetherWriteState from "@/hooks/useTogetherWriteState";
import {
  submitTogetherPost,
  validateTogetherForm,
} from "@/lib/togetherWriteUtils";

export default function TogetherRecruitmentPage() {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const router = useRouter();
  const { ready, isLogined, user } = useLogin();

  // 작성 훅: 이벤트 정규화 + 폼 상태
  const { selectedEvent, handleEventSelect, form, handleFormChange } =
    useTogetherWriteState();

  // 비로그인 접근 시 로그인으로 유도
  useEffect(() => {
    if (!ready) return;
    if (!isLogined) {
      const next = encodeURIComponent("/together/write");
      router.replace(`/login?next=${next}`);
    }
  }, [ready, isLogined, router]);

  // 폼 유효성 검사
  const validation = useMemo(() => {
    return validateTogetherForm({
      title,
      content,
      selectedEvent,
      form,
      user,
    });
  }, [title, content, selectedEvent, form, user]);

  const canSubmit = ready && isLogined && user && validation.isValid;

  const handleSubmit = () => {
    if (!validation.isValid) {
      alert(validation.errors[0]); // 첫 번째 오류 메시지 표시
      return;
    }

    setSubmitError(""); // 이전 에러 클리어
    setShowSuccessModal(true);
  };

  const handleConfirmSave = async () => {
    if (!canSubmit) {
      setShowSuccessModal(false);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // 백엔드 API 호출
      const response = await submitTogetherPost({
        title,
        content,
        selectedEvent,
        form,
        user,
      });

      setShowSuccessModal(false);

      // 작성 성공 시 상세 페이지로 이동
      const togetherID = response?.id || response?.togetherId;
      if (togetherID) {
        router.push(`/together/${togetherID}`);
      } else {
        // ID를 받지 못한 경우 목록으로
        router.push("/together");
      }
    } catch (error) {
      console.error("모임 작성 실패:", error);
      
      // 인증 에러 처리
      if (error?.status === 401 || error?.status === 403) {
        console.log("인증 만료 - 로그인 페이지로 이동");
        const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
        router.push(`/login?next=${currentPath}`);
        return;
      }
      
      setSubmitError(error.message || "모임 글 작성에 실패했습니다.");
      setShowSuccessModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black">동행 모집글 작성</h1>
        </div>

        {/* 에러 메시지 표시 */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{submitError}</p>
          </div>
        )}

        {/* 유효성 검사 에러 표시 */}
        {!validation.isValid && validation.errors.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-sm font-medium mb-2">
              입력 확인 필요:
            </p>
            <ul className="text-yellow-700 text-sm list-disc list-inside space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-6">
          <TogetherWriteForm
            onEventSelect={handleEventSelect}
            onLocationSearch={(q) => console.log("지역 검색:", q)}
            onFormChange={handleFormChange}
            initialData={form}
          />
        </div>

        {selectedEvent && (
          <div className="mb-6 relative">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              선택된 이벤트
            </h3>
            <button
              onClick={() =>
                window.confirm("이벤트 선택을 삭제하시겠습니까?") &&
                handleEventSelect(null)
              }
              className="absolute top-12 right-2 w-6 h-6 bg-black bg-opacity-70 hover:bg-opacity-90 rounded-full flex items-center justify-center text-white text-sm z-10 transition-all"
              aria-label="이벤트 선택 해제">
              ×
            </button>
            <PostEventMiniCard {...selectedEvent} />
          </div>
        )}

        <div className="w-full mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:border-blue-500"
            placeholder="동행 모집글 제목을 입력해주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="w-full mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            placeholder={`동행 모집에 대한 상세 내용을 작성해주세요

예시:
- 함께 관람할 공연/행사 소개
- 만날 장소 및 시간
- 연락 방법
- 기타 주의사항`}
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              canSubmit && !isSubmitting
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-white cursor-not-allowed"
            }`}>
            {isSubmitting ? "등록 중..." : "등록"}
          </button>
        </div>

        {/* 취소 모달 */}
        <ConfirmModal
          open={showCancelModal}
          title="취소하겠습니까?"
          description="작성 중인 내용은 저장되지 않습니다."
          confirmText="취소"
          cancelText="계속작성"
          onConfirm={() => {
            setShowCancelModal(false);
            router.push("/together");
          }}
          onClose={() => setShowCancelModal(false)}
          variant="danger"
        />

        {/* 등록 모달 */}
        <ConfirmModal
          open={showSuccessModal}
          title="글을 등록하시겠습니까?"
          description={
            isSubmitting
              ? "등록 중입니다. 잠시만 기다려주세요..."
              : "등록 후 작성 글 페이지로 이동합니다."
          }
          confirmText={isSubmitting ? "등록 중..." : "등록"}
          cancelText="아니오"
          onConfirm={handleConfirmSave}
          onClose={() => !isSubmitting && setShowSuccessModal(false)}
          confirmDisabled={isSubmitting}
        />
      </div>
    </div>
  );
}

