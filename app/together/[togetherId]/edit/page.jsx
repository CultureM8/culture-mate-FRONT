"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useLogin from "@/hooks/useLogin";
import ConfirmModal from "@/components/global/ConfirmModal";
import PostEventMiniCard from "@/components/global/PostEventMiniCard";
import TogetherWriteForm from "@/components/together/TogetherWriteForm";
import useTogetherWriteState from "@/hooks/useTogetherWriteState";
import togetherApi from "@/lib/api/togetherApi";

export default function TogetherEditPage() {
  const { togetherId } = useParams();
  const router = useRouter();
  const { ready, isLogined, user } = useLogin();

  // 본문/제목
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 폼 초기 데이터(자식에게 1회 전달용)
  const [initialFormData, setInitialFormData] = useState(null);

  // 작성 훅 (이벤트 스냅샷 + 폼 상태)
  const { selectedEvent, handleEventSelect, form, handleFormChange } =
    useTogetherWriteState();

  // 모달/진행상태
  const [openCancel, setOpenCancel] = useState(false);
  const [openSubmit, setOpenSubmit] = useState(false);
  const [saving, setSaving] = useState(false);
  const firstGuard = useRef(false);

  // 로그인 가드
  useEffect(() => {
    if (!ready) return;
    if (!isLogined && !firstGuard.current) {
      firstGuard.current = true;
      const next = encodeURIComponent(location.pathname + location.search);
      router.replace(`/login?next=${next}`);
    }
  }, [ready, isLogined, router]);

  // 기존 글 1회 불러오기
  useEffect(() => {
    if (!togetherId) return;
    let alive = true;
    (async () => {
      try {
        const post = await togetherApi.getById(togetherId);
        if (!alive) return;

        // 제목/내용
        setTitle(post?.title || "");
        setContent(post?.content || "");

        // 이벤트(변경 불가 — 선택 UI 숨김)
        if (post?.event) {
          handleEventSelect(post.event);
        } else if (post?.eventSnapshot) {
          handleEventSelect(post.eventSnapshot);
        }

        setInitialFormData({
          companionDate: post?.meetingDate || "",
          maxParticipants: post?.maxParticipants ?? 2,
          meetingRegion: post?.region || { level1: "", level2: "", level3: "" },
          meetingLocation: post?.meetingLocation || "",
        });
      } catch (e) {
        console.error("동행 글 로드 실패:", e);
        alert("글을 불러오는 중 오류가 발생했습니다.");
        router.replace(`/together/${togetherId}`);
      }
    })();
    return () => {
      alive = false;
    };
  }, [togetherId, router]);

  const trySubmit = () => {
    if (!title.trim()) return alert("제목을 입력해주세요.");
    if (!form?.companionDate) return alert("동행 날짜를 선택해주세요.");
    if (!form?.meetingLocation) return alert("모임 장소를 입력해주세요.");
    if (!selectedEvent?.id && !selectedEvent?.eventId) {
      return alert("이벤트 정보를 확인할 수 없습니다.");
    }
    setOpenSubmit(true);
  };

  // 저장 (PUT /api/v1/together/{id})
  const handleSave = async () => {
    setSaving(true);
    try {
      const authorId = user?.id ?? user?.user_id;
      if (!authorId) {
        alert("작성자 정보를 확인할 수 없습니다.");
        setSaving(false);
        return;
      }

      const payload = {
        eventId: Number(selectedEvent?.eventId ?? selectedEvent?.id),
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
      };

      const updated = await togetherApi.update(Number(togetherId), payload);
      setOpenSubmit(false);
      router.replace(
        `/together/${updated?.id ?? togetherId}?updated=${Date.now()}`
      );
    } catch (e) {
      console.error("동행 글 수정 실패:", e);
      alert(`수정에 실패했습니다.\n${e?.message ?? ""}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black">동행 모집글 수정</h1>
        </div>

        {/* 선택된 이벤트 표시 (변경 불가) */}
        {selectedEvent && (
          <div className="mb-6 relative">
            <PostEventMiniCard {...selectedEvent} />
          </div>
        )}

        {/* 폼 (이벤트 선택 UI 숨김) */}
        <div className="mb-6">
          <TogetherWriteForm
            key={`edit-${togetherId}`}
            hideEventPicker={true}
            onEventSelect={() => {}}
            onLocationSearch={(q) => console.log("지역 검색:", q)}
            onFormChange={handleFormChange}
            initialData={initialFormData || {}}
          />
        </div>

        {/* 제목/내용 입력 */}
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
          />
        </div>

        <div className="w-full mb-8">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            placeholder="동행 모집에 대한 상세 내용을 작성해주세요"
          />
        </div>

        {/* 액션 */}
        <div className="flex justify-end gap-4 mb-8">
          <button
            onClick={() => setOpenCancel(true)}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            취소
          </button>
          <button
            onClick={trySubmit}
            disabled={!ready || !isLogined || saving}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-60">
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>

      {/* 취소 모달 */}
      <ConfirmModal
        open={openCancel}
        title="수정을 취소하겠습니까?"
        description="변경된 내용은 저장되지 않습니다."
        confirmText="취소"
        cancelText="계속수정"
        onConfirm={() => {
          setOpenCancel(false);
          router.push(`/together/${togetherId}`);
        }}
        onClose={() => setOpenCancel(false)}
        variant="danger"
      />

      {/* 저장 모달 */}
      <ConfirmModal
        open={openSubmit}
        title="수정 내용을 저장할까요?"
        description="저장 후 상세 페이지로 이동합니다."
        confirmText="저장"
        cancelText="아니오"
        onConfirm={handleSave}
        onClose={() => setOpenSubmit(false)}
      />
    </div>
  );
}
