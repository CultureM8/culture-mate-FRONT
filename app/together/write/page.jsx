"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PostEventMiniCard from "@/components/global/PostEventMiniCard";
import TogetherWriteForm from "@/components/together/TogetherWriteForm";
import ConfirmModal from "@/components/global/ConfirmModal";
import useLogin from "@/hooks/useLogin";
import useTogetherWriteState from "@/hooks/useTogetherWriteState";
import { addPost } from "@/lib/storage";
import { makeTogetherV1, normalizeEventSnapshot } from "@/lib/schema";

/** 작성자(meta) 빌더: LoginProvider 구조 기준 */
const buildAuthorFromUser = (u) => {
  const id = u?.id ?? null;
  const login = u?.login_id ?? u?.loginId ?? "";
  const nick = u?.nickname ?? null;
  const display =
    u?.display_name ??
    nick ??
    (login ? String(login) : id != null ? String(id) : "사용자");
  return {
    id,
    login_id: login,
    nickname: nick,
    display_name: display,
  };
};

export default function TogetherRecruitmentPage() {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const router = useRouter();
  const { ready, isLogined, user } = useLogin();

  // 작성 훅: 이벤트 정규화 + 폼 상태
  const {
    selectedEvent,
    handleEventSelect,
    form,
    handleFormChange,
    buildPost, // (보존용) 기존 훅이 노출하는 빌더
  } = useTogetherWriteState();

  // 비로그인 접근 시 로그인으로 유도
  useEffect(() => {
    if (!ready) return;
    if (!isLogined) {
      const next = encodeURIComponent("/together/write");
      router.replace(`/login?next=${next}`);
    }
  }, [ready, isLogined, router]);

  const canSubmit = useMemo(
    () =>
      ready &&
      isLogined &&
      !!user &&
      title.trim().length > 0 &&
      content.trim().length > 0,
    [ready, isLogined, user, title, content]
  );

  const handleSubmit = () => {
    if (!title.trim()) return alert("제목을 입력해주세요.");
    if (!content.trim()) return alert("내용을 입력해주세요.");
    if (!ready || !isLogined || !user)
      return alert(
        "로그인 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요."
      );
    setShowSuccessModal(true);
  };

  const handleConfirmSave = () => {
    if (!canSubmit) {
      setShowSuccessModal(false);
      return;
    }

    // 이벤트 스냅샷 정규화
    const evSnap = normalizeEventSnapshot(
      selectedEvent ? { ...selectedEvent } : null
    );

    // 서버 스키마 생성 함수가 있으면 사용, 없으면 아래에서 보강
    let post =
      makeTogetherV1?.({
        title,
        content,
        eventId: evSnap?.eventId ?? 0,
        eventSnapshot: evSnap,
        form, // region/address/meetingDate/maxPeople 등 매핑됨
        user,
      }) ?? {};

    // ✅ "바로 적용 가능한 저장 규격" 강제 세팅
    const author = buildAuthorFromUser(user);
    post = {
      ...post,
      id: post?.id ?? crypto?.randomUUID?.() ?? String(Date.now()),
      board: "together",
      title: post?.title ?? title,
      content: post?.content ?? content,
      eventId: post?.eventId ?? evSnap?.eventId ?? 0,
      eventSnapshot: post?.eventSnapshot ?? evSnap ?? null,

      // 작성자 정보 (객체 + 호환 키)
      author: typeof post?.author === "object" ? post.author : author,
      author_login_id:
        post?.author_login_id ??
        author.login_id ??
        (typeof post?.author === "string" ? post.author : ""),

      // 호스트 식별 (상세/마이페이지 필터에서 사용)
      hostId: post?.hostId ?? post?.authorId ?? author.id ?? null,
      authorId: post?.authorId ?? author.id ?? null,

      // 생성 시각
      createdAt: post?.createdAt ?? new Date().toISOString(),

      // 좋아요/뷰 (동행은 likes만 사용)
      stats: {
        views: post?.stats?.views ?? 0,
        likes: post?.stats?.likes ?? 0,
        ...(post?.stats || {}),
      },
    };

    // 로컬 저장
    addPost(post);

    setShowSuccessModal(false);
    router.push(`/together/${post.id}`);
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black">동행 모집글 작성</h1>
        </div>

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
            제목
          </label>
          <input
            type="text"
            className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:border-blue-500"
            placeholder="동행 모집글 제목을 입력해주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="w-full mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              canSubmit
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-white cursor-not-allowed"
            }`}>
            등록
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
          description="등록 후 작성 글 페이지로 이동합니다."
          confirmText="등록"
          cancelText="아니오"
          onConfirm={handleConfirmSave}
          onClose={() => setShowSuccessModal(false)}
        />
      </div>
    </div>
  );
}
