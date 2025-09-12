"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CommunityWriteOption from "@/components/community/CommunityWriteOption";
import ConfirmModal from "@/components/global/ConfirmModal";
import PostEventMiniCard from "@/components/global/PostEventMiniCard";
import useLogin from "@/hooks/useLogin";
import { normalizeEventSnapshot } from "@/lib/schema";
import { createBoard } from "@/lib/api/boardApi";

export default function CommunityWrite() {
  const router = useRouter();
  const { ready, isLogined, user } = useLogin();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [openCancel, setOpenCancel] = useState(false);
  const [openSubmit, setOpenSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const firstGuard = useRef(false);

  useEffect(() => {
    if (!ready) return;
    if (!isLogined && !firstGuard.current) {
      firstGuard.current = true;
      const next = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      router.replace(`/login?next=${next}`);
    }
  }, [ready, isLogined, router]);

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

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black">자유 게시판</h1>
        </div>

        <div className="mb-4">
          <CommunityWriteOption onPickEvent={setSelectedEvent} />
        </div>

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

        <div className="w-full mb-4">
          <input
            type="text"
            placeholder="제목을 입력해주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="w-full">
          <textarea
            placeholder="내용을 입력해주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[500px] p-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end gap-4 mb-8 mt-2">
          <button
            onClick={() => setOpenCancel(true)}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            취소
          </button>
          <button
            onClick={trySubmit}
            disabled={!ready || !isLogined || submitting}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-60">
            {submitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </div>

      <ConfirmModal
        open={openCancel}
        title="취소하겠습니까?"
        description="작성 중인 내용은 저장되지 않습니다."
        confirmText="취소"
        cancelText="계속작성"
        onConfirm={() => {
          setOpenCancel(false);
          router.push("/community");
        }}
        onClose={() => setOpenCancel(false)}
        variant="danger"
      />

      <ConfirmModal
        open={openSubmit}
        title="글을 등록하시겠습니까?"
        description="등록 후 커뮤니티 목록으로 이동합니다."
        confirmText="등록"
        cancelText="아니오"
        onConfirm={async () => {
          if (!title.trim() || !content.trim() || !isLogined) return;
          setSubmitting(true);
          try {
            const normalizedEvent = normalizeEventSnapshot(selectedEvent);

            // BoardRequestDto에 맞춘 payload
            const authorId = user?.id ?? user?.user_id;
            if (!authorId) {
              alert("로그인 정보를 찾을 수 없습니다.");
              return;
            }

            const boardPayload = {
              title: title.trim(),
              content,
              authorId,
              eventType: normalizedEvent?.eventType ?? null, // 백엔드 EventType과 이름이 같을 때만 전달
              eventId: normalizedEvent?.eventId ?? null,
            };

            const created = await createBoard(boardPayload); // POST /api/v1/board
            setOpenSubmit(false);
            // 목록으로 이동하면서 글 작성 성공 메시지 표시
            alert("글이 성공적으로 등록되었습니다.");
            router.push(`/community/${created.id}`);
          } finally {
            setSubmitting(false);
          }
        }}
        onClose={() => setOpenSubmit(false)}
      />
    </div>
  );
}
