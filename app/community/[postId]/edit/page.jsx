"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useLogin from "@/hooks/useLogin";
import ConfirmModal from "@/components/global/ConfirmModal";
import CommunityWriteOption from "@/components/community/CommunityWriteOption";
import PostEventMiniCard from "@/components/global/PostEventMiniCard";
import { normalizeEventSnapshot } from "@/lib/schema";
import { fetchPost, updatePostApi } from "@/lib/communityApi";

export default function CommunityEditPage() {
  const params = useParams();
  const postId = params.postId ?? params.boardId;
  const router = useRouter();
  const { ready, isLogined, user } = useLogin();

  const [post, setPost] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [openCancel, setOpenCancel] = useState(false);
  const [openSubmit, setOpenSubmit] = useState(false);
  const [saving, setSaving] = useState(false);
  const firstGuard = useRef(false);

  // 게시글 로드 (GET /api/v1/board/{boardId})
  useEffect(() => {
    if (!postId) return;
    let alive = true;
    (async () => {
      try {
        const data = await fetchPost(postId);
        if (!alive) return;
        setPost(data || null);
        if (data) {
          setTitle(data.title || "");
          setContent(data.content || "");
          // 이벤트 스펙이 응답에 어떻게 오는지 명확치 않으므로, 선택 시에만 보냄
          setSelectedEvent(null);
        }
      } catch (e) {
        console.error("edit: fetchPost failed", e);
        setPost(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [postId]);

  //  로그인 가드

  useEffect(() => {
    if (!ready) return;
    if (!isLogined && !firstGuard.current) {
      firstGuard.current = true;
      const next = encodeURIComponent(location.pathname + location.search);
      router.replace(`/login?next=${next}`);
    }
    // 아래 deps는 실제로 안 쓰더라도, 개발 중 배열 길이 변화로 인한 에러 방지용으로 유지
  }, [ready, isLogined, user, post, postId, router]);

  const trySubmit = () => {
    if (!title.trim()) return alert("제목을 입력해주세요.");
    if (!content.trim()) return alert("내용을 입력해주세요.");
    if (!isLogined) {
      const next = encodeURIComponent(location.pathname + location.search);
      router.replace(`/login?next=${next}`);
      return;
    }
    setOpenSubmit(true);
  };

  // 저장 (PUT /api/v1/board/{boardId}) – Request: title, content, authorId, eventType?, eventId?
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      // BoardDto.Request 스펙에 맞게 전송
      const authorId = user?.id ?? user?.user_id ?? post?.author?.id;
      if (!authorId) {
        alert("작성자 정보를 확인할 수 없습니다.");
        return;
      }
      const updated = await updatePostApi(postId, {
        title: title.trim(),
        content,
        authorId,
        // 선택 값(백엔드가 쓰지 않으면 null로 보내도 무해)
        eventType: null,
        eventId: null,
      });
      setOpenSubmit(false);
      router.replace(`/community/${updated?.id ?? postId}`);
    } catch (e) {
      console.error("updatePostApi failed", e);
      alert(`수정에 실패했습니다.\n${e?.message ?? ""}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black">
            자유 게시판 게시글 수정
          </h1>
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
            disabled={!ready || !isLogined || saving}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-60">
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>

      <ConfirmModal
        open={openCancel}
        title="수정을 취소하겠습니까?"
        description="변경된 내용은 저장되지 않습니다."
        confirmText="취소"
        cancelText="계속수정"
        onConfirm={() => {
          setOpenCancel(false);
          router.push(`/mypage/post-manage`);
        }}
        onClose={() => setOpenCancel(false)}
        variant="danger"
      />

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
