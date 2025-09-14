"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PostEventMiniCard from "@/components/global/PostEventMiniCard";
import TogetherWriteForm from "@/components/together/TogetherWriteForm";
import ConfirmModal from "@/components/global/ConfirmModal";
import useLogin from "@/hooks/useLogin";
import useTogetherWriteState from "@/hooks/useTogetherWriteState";
import {
  submitTogetherPost,
  validateTogetherForm,
} from "@/lib/togetherWriteUtils";
import togetherApi from "@/lib/api/togetherApi";
import { getEventById } from "@/lib/api/eventApi";
import { getEventMainImageUrl } from "@/lib/utils/imageUtils";

export default function TogetherRecruitmentPage() {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isLoadingEditData, setIsLoadingEditData] = useState(false);
  const [formInitialData, setFormInitialData] = useState({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const { ready, isLogined, user } = useLogin();

  // 작성 훅: 이벤트 정규화  폼 상태
  const { selectedEvent, handleEventSelect, form, handleFormChange } =
    useTogetherWriteState();

  // 쿼리의 eventId가 있으면 자동 선택 (편집모드가 아닐 때만)
  useEffect(() => {
    const eid = searchParams.get("eventId");
    if (!eid || isEditMode) return;
    let stop = false;
    (async () => {
      try {
        const raw = await getEventById(eid);
        if (stop) return;

        console.log("TogetherWrite - 백엔드에서 받은 이벤트 데이터:", raw);

        // community/write와 동일한 변환 로직 적용
        const transformed = {
          id: String(raw.id || raw.eventId || ""),
          name: raw.title || "",
          eventName: raw.title || "",
          eventType: raw.eventType || "이벤트",
          type: raw.eventType || "이벤트",
          eventImage: raw.mainImageUrl || "/img/default_img.svg",
          image: raw.mainImageUrl || "/img/default_img.svg",
          description: raw.description || raw.title || "",
          rating: raw.avgRating ? Number(raw.avgRating) : 0,
          starScore: raw.avgRating ? Number(raw.avgRating) : 0,
          likes: raw.interestCount || 0,
          recommendations: raw.interestCount || 0,
          postsCount: raw.togetherCount || 0,
          registeredPosts: raw.togetherCount || 0,
          isLiked: raw.isInterested || false,
          initialLiked: raw.isInterested || false,
          startDate: raw.startDate,
          endDate: raw.endDate,
          location: raw.location,
          eventId: raw.id || raw.eventId,
          // 추가 백엔드 필드들
          content: raw.content,
          address: raw.address,
          addressDetail: raw.addressDetail,
          viewTime: raw.durationMin ? `${raw.durationMin}분` : "미정",
          ageLimit: raw.minAge ? `${raw.minAge}세 이상` : "전체관람가",
          ticketPrices: raw.ticketPrices || [],
          region: raw.region || null,
        };

        console.log("TogetherWrite - 변환된 이벤트 데이터:", transformed);

        // useTogetherWriteState의 handleEventSelect에 전달 (내부에서 toCard 추가 적용)
        handleEventSelect(transformed);
        setLockEventFromQuery(true); // 이벤트 선택 UI 숨김
      } catch (e) {
        console.error("이벤트 자동 선택 실패:", e);
      }
    })();
    return () => {
      stop = true;
    };
  }, [searchParams, isEditMode, handleEventSelect]);
  // 편집 모드 확인 및 데이터 로드
  useEffect(() => {
    const editParam = searchParams.get("edit");
    if (editParam) {
      setIsEditMode(true);
      setEditId(editParam);

      // 기존 데이터 로드
      const loadEditData = async () => {
        try {
          const postData = await togetherApi.getById(editParam);

          setTitle(postData.title || "");
          setContent(postData.content || "");

          // 이벤트 정보 설정
          if (postData.event) {
            handleEventSelect(postData.event);
          }

          // TogetherWriteForm 컴포넌트용 초기 데이터 설정
          const formInitialData = {
            companionDate: postData.meetingDate || "",
            maxParticipants: postData.maxParticipants || 2,
            meetingLocation: postData.meetingLocation || "",
            meetingRegion: postData.region || {
              level1: "",
              level2: "",
              level3: "",
            },
          };

          setFormInitialData(formInitialData);

          // useTogetherWriteState용 데이터도 별도로 설정
          const stateFormData = {
            companionDate: postData.meetingDate || "",
            companionCount: postData.maxParticipants
              ? `${postData.maxParticipants}명`
              : "",
            minAge: "제한없음",
            maxAge: "제한없음",
            locationQuery: postData.meetingLocation || "",
            meetingRegion: postData.region || {
              level1: "",
              level2: "",
              level3: "",
            },
            meetingLocation: postData.meetingLocation || "",
          };

          // 폼 상태 업데이트 (useTogetherWriteState의 handleFormChange 사용)
          handleFormChange(stateFormData);
        } catch (error) {
          console.error("편집 데이터 로드 실패:", error);
          setSubmitError("편집할 데이터를 불러올 수 없습니다.");
        }
      };

      loadEditData();
    }
  }, [searchParams]);

  // 비로그인 접근 시 로그인으로 유도
  useEffect(() => {
    if (!ready) return;
    if (!isLogined) {
      const next = encodeURIComponent(
        window.location.pathname + window.location.search
      );
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
      alert(validation.errors[0]);
      return;
    }

    setSubmitError("");
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
      let response;

      if (isEditMode && editId) {
        const authorId = user?.id ?? user?.user_id;
        const eventId = selectedEvent?.eventId ?? selectedEvent?.id;

        response = await togetherApi.update(editId, {
          eventId,
          hostId: Number(authorId),
          title: title.trim(),
          region: {
            level1: form?.meetingRegion?.level1 || "",
            level2: form?.meetingRegion?.level2 || "",
            level3: form?.meetingRegion?.level3 || "",
          },
          meetingLocation: form?.meetingLocation || "",
          meetingDate: form?.companionDate || "",
          maxParticipants: Number(form?.maxParticipants ?? 2),
          content: content || "",
        });
      } else {
        response = await submitTogetherPost({
          title,
          content,
          selectedEvent,
          form,
          user,
        });
      }

      setShowSuccessModal(false);

      // 성공 시 상세 페이지로 이동
      const togetherID = response?.id || response?.togetherId || editId;
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
        const currentPath = encodeURIComponent(
          window.location.pathname + window.location.search
        );
        router.push(`/login?next=${currentPath}`);
        return;
      }

      setSubmitError(error.message || "모임 글 작성에 실패했습니다.");
      setShowSuccessModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  const [lockEventFromQuery, setLockEventFromQuery] = useState(false);

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black">
            {isEditMode ? "동행 모집글 수정" : "동행 모집글 작성"}
          </h1>
        </div>

        {/* 에러 메시지 표시 */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{submitError}</p>
          </div>
        )}

        {/* 선택된 이벤트 표시 */}
        {selectedEvent && (
          <div className="mb-6 relative">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              선택된 이벤트
            </h3>
            {!lockEventFromQuery && (
              <button
                onClick={() =>
                  window.confirm("이벤트 선택을 삭제하시겠습니까?") &&
                  handleEventSelect(null)
                }
                className="absolute top-12 right-2 w-6 h-6 bg-black bg-opacity-70 hover:bg-opacity-90 rounded-full flex items-center justify-center text-white text-sm z-10 transition-all"
                aria-label="이벤트 선택 해제">
                ×
              </button>
            )}
            <PostEventMiniCard {...selectedEvent} />
          </div>
        )}

        <div className="mb-6">
          <TogetherWriteForm
            key={isEditMode ? `edit-${editId}` : "create"}
            onEventSelect={handleEventSelect}
            onLocationSearch={(q) => console.log("지역 검색:", q)}
            onFormChange={handleFormChange}
            initialData={isEditMode ? formInitialData : form}
            hideEventPicker={isEditMode}
          />
        </div>

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
            {isSubmitting
              ? isEditMode
                ? "수정 중..."
                : "등록 중..."
              : isEditMode
              ? "수정"
              : "등록"}
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

        {/* 등록/수정 모달 */}
        <ConfirmModal
          open={showSuccessModal}
          title={
            isEditMode ? "글을 수정하시겠습니까?" : "글을 등록하시겠습니까?"
          }
          description={
            isSubmitting
              ? isEditMode
                ? "수정 중입니다. 잠시만 기다려주세요..."
                : "등록 중입니다. 잠시만 기다려주세요..."
              : isEditMode
              ? "수정 후 상세 페이지로 이동합니다."
              : "등록 후 작성 글 페이지로 이동합니다."
          }
          confirmText={
            isSubmitting
              ? isEditMode
                ? "수정 중..."
                : "등록 중..."
              : isEditMode
              ? "수정"
              : "등록"
          }
          cancelText="아니오"
          onConfirm={handleConfirmSave}
          onClose={() => !isSubmitting && setShowSuccessModal(false)}
          confirmDisabled={isSubmitting}
        />
      </div>
    </div>
  );
}
