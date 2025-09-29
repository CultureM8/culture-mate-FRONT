"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useLogin from "@/hooks/useLogin";
import ConfirmModal from "@/components/global/ConfirmModal";
import PostEventMiniCard from "@/components/global/PostEventMiniCard";
import { normalizeEventSnapshot } from "@/lib/logic/schema";
import { getBoardDetail, updateBoard } from "@/lib/api/boardApi";
import { transformEventCardData } from "@/lib/api/eventApi";

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
        const post = await getBoardDetail(postId);
        if (!alive) return;
        setPost(post || null);
        if (post) {
          setTitle(post.title || "");
          setContent(post.content || "");

          // 이벤트 카드 복원 (1순위: eventCard, 2순위: eventId 파편정보)
          if (post?.eventCard) {
            const card = transformEventCardData(post.eventCard); // 상세 페이지와 동일 매핑
            const id = post.eventCard.id ?? post.eventId ?? null;
            setSelectedEvent(
              normalizeEventSnapshot({
                ...card,
                id,
                eventId: id,
              })
            );
          } else if (post?.eventId && post.eventId !== 0) {
            // eventCard가 없을 때의 보완 매핑
            const fallback = {
              id: post.eventId,
              eventId: post.eventId,
              eventName: post.eventTitle || "이벤트",
              eventType: post.eventType || "이벤트",
              eventImage: post.eventImage || "/img/default_img.svg",
              description: post.eventTitle || "",
              score: 0,
              recommendations: 0,
              registeredPosts: 0,
              initialLiked: false,
            };
            setSelectedEvent(normalizeEventSnapshot(fallback));
          } else {
            setSelectedEvent(null);
          }
        }
      } catch (e) {
        console.error("edit: getBoardDetail failed", e);
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
      const updatePayload = {
        title: title.trim(),
        content,
        authorId,
        // 백엔드에서 이벤트 수정을 지원하지 않으므로 이벤트 정보는 전송하지 않음
      };

      console.log("Sending update payload:", updatePayload);

      const updated = await updateBoard(postId, updatePayload);
      console.log("Update response:", updated);
      setOpenSubmit(false);
      // 수정 완료 후 상세 페이지로 이동할 때 새로고침 파라미터 추가
      router.replace(
        `/community/${updated?.id ?? postId}?updated=${Date.now()}`
      );
    } catch (e) {
      console.error("updateBoard failed", e);
      alert(`수정에 실패했습니다.\n${e?.message ?? ""}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black">자유 게시판 수정</h1>
        </div>

        {selectedEvent && (
          <div className="mb-6 relative">
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
            placeholder="제목을 입력해주세요"
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
            placeholder="내용을 입력해주세요"
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
