"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useLogin from "@/hooks/useLogin";
import ConfirmModal from "@/components/global/ConfirmModal";
import CommunityWriteOption from "@/components/community/CommunityWriteOption";
import PostEventMiniCard from "@/components/global/PostEventMiniCard";
// import { getPost, updatePost } from "@/lib/storage";
import { normalizeEventSnapshot } from "@/lib/schema";
import { fetchPost, updatePostApi } from "@/lib/communityApi";

/** 소유자 판별용 키 */
const userKey = (u) => String(u?.id ?? u?.user_id ?? u?.login_id ?? "");

export default function CommunityEditPage() {
  const { postId } = useParams();
  const router = useRouter();
  const { ready, isLogined, user } = useLogin();

  const [post, setPost] = useState(null);

  // 글쓰기 페이지와 동일한 상태들
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [openCancel, setOpenCancel] = useState(false);
  const [openSubmit, setOpenSubmit] = useState(false);
  const [saving, setSaving] = useState(false);
  const firstGuard = useRef(false);

  // 1) 게시글 로드
  useEffect(() => {
    const p = getPost("community", postId);
    setPost(p || null);
    if (p) {
      setTitle(p.title || "");
      setContent(p.content || "");
      // 기존에 저장된 이벤트 스냅샷이 있으면 그대로 표시
      setSelectedEvent(p.eventSnapshot ?? null);
    }
  }, [postId]);

  // 2) 로그인/권한 가드 (write 페이지와 동일한 흐름 + 소유자 확인)
  useEffect(() => {
    if (!ready) return;
    if (!post) return;

    if (!isLogined && !firstGuard.current) {
      firstGuard.current = true;
      const next = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      router.replace(`/login?next=${next}`);
      return;
    }

    // 소유자만 수정 가능(_ownerKey 저장해둔 값 기준)
    const owner =
      post._ownerKey || String(post.authorId || post.authorLoginId || "");
    if (userKey(user) !== String(owner)) {
      alert("이 글을 수정할 권한이 없습니다.");
      router.replace(`/community/${postId}`);
    }
  }, [ready, isLogined, user, post, postId, router]);

  if (!post) {
    return (
      <div className="w-full max-w-[900px] mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-4">글을 찾을 수 없습니다</h1>
        <button
          className="px-4 py-2 border rounded"
          onClick={() => router.push("/mypage/post-manage")}>
          목록으로
        </button>
      </div>
    );
  }

  // 글쓰기 페이지와 동일한 검증/모달 트리거
  const trySubmit = () => {
    if (!title.trim()) return alert("제목을 입력해주세요.");
    if (!content.trim()) return alert("내용을 입력해주세요.");
    if (!isLogined) {
      const next = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      router.replace(`/login?next=${next}`);
      return;
    }
    setOpenSubmit(true);
  };

  // 저장 실행 프론트
  // const handleSave = async () => {
  //   if (!title.trim() || !content.trim()) return;

  //   setSaving(true);
  //   try {
  //     const ev =
  //       normalizeEventSnapshot(selectedEvent) ?? post.eventSnapshot ?? null;
  //     const patch = {
  //       title: title.trim(),
  //       content,
  //       eventId: ev?.eventId ?? post.eventId ?? 0,
  //       eventType: ev?.eventType ?? post.eventType ?? "ETC",
  //       eventSnapshot: ev,
  //     };
  //     const ok = updatePost("community", postId, patch);
  //     if (!ok) {
  //       alert("수정에 실패했습니다.");
  //       return;
  //     }
  //     setOpenSubmit(false);
  //     router.replace(`/community/${postId}`);
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  //저장 백엔드
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      const ev =
        normalizeEventSnapshot(selectedEvent) ?? post.eventSnapshot ?? null;

      // ✅ BoardRequestDto에 맞춘 payload
      const authorId = user?.id ?? user?.user_id ?? post?.authorId;
      if (!authorId) {
        alert("작성자 정보를 확인할 수 없습니다.");
        return;
      }

      const patch = {
        title: title.trim(),
        content,
        authorId,
        eventType: ev?.eventType ?? post?.eventType ?? null,
        eventId: ev?.eventId ?? post?.eventId ?? null,
      };

      const updated = await updatePostApi(postId, patch); // PUT /api/v1/board/{id}
      setOpenSubmit(false);
      router.replace(`/community/${updated.id ?? postId}`);
    } finally {
      setSaving(false);
    }
  };

  // UI (글쓰기 페이지 구성 그대로)
  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-8 py-6">
        {/* 페이지 타이틀 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black">
            자유 게시판 게시글 수정
          </h1>
        </div>

        {/* 옵션 박스 (이벤트/컨텐츠) */}
        <div className="mb-4">
          <CommunityWriteOption onPickEvent={setSelectedEvent} />
        </div>

        {/* 선택된 이벤트 카드 (선택했을 때만 표시) */}
        {selectedEvent && (
          <div className="mb-6 relative">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              선택된 이벤트
            </h3>
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-12 right-2 w-6 h-6 bg-black bg-opacity-70 hover:bg-opacity-90 rounded-full flex items-center justify-center text-white text-sm z-10 transition-all">
              ×
            </button>
            <PostEventMiniCard {...selectedEvent} />
          </div>
        )}

        {/* 제목 */}
        <div className="w-full mb-4">
          <input
            type="text"
            placeholder="제목을 입력해주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 본문 */}
        <div className="w-full">
          <textarea
            placeholder="내용을 입력해주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[500px] p-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-4 mb-8 mt-2">
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

      {/* 취소 모달 (글쓰기 페이지와 동일 UX) */}
      <ConfirmModal
        open={openCancel}
        title="수정을 취소하겠습니까?"
        description="변경된 내용은 저장되지 않습니다."
        confirmText="취소"
        cancelText="계속수정"
        onConfirm={() => {
          setOpenCancel(false);
          router.push(`/community/${postId}`);
        }}
        onClose={() => setOpenCancel(false)}
        variant="danger"
      />

      {/* 저장 모달 (글쓰기 페이지와 동일 UX) */}
      <ConfirmModal
        open={openSubmit}
        title="수정 내용을 저장할까요?"
        description="저장 후 게시글 상세 페이지로 이동합니다."
        confirmText="저장"
        cancelText="아니오"
        onConfirm={handleSave}
        onClose={() => setOpenSubmit(false)}
      />
    </div>
  );
}
