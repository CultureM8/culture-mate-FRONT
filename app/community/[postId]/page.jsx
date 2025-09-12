"use client";

import ConfirmModal from "@/components/global/ConfirmModal";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PostEventMiniCard from "@/components/global/PostEventMiniCard";
import CommentsSection from "@/components/community/CommentsSection";
import { ICONS } from "@/constants/path";
import useLogin from "@/hooks/useLogin";

/* 백엔드 */
import { getBoardDetail, deleteBoard, toggleBoardLike, transformBoardData } from "@/lib/api/boardApi";
import { transformEventCardData } from "@/lib/api/eventApi";

/** 권한 키 */
function userKey(u) {
  const uid = u?.id ?? u?.user_id ?? "";
  const lid = u?.login_id ?? "";
  return String(uid || lid || "");
}

/** 내 추천 기록(로컬) */
const recKey = (postId) => `recusers:community:${postId}`;
const loadRecSet = (postId) => {
  try {
    const arr = JSON.parse(localStorage.getItem(recKey(postId)) || "[]");
    return Array.isArray(arr) ? new Set(arr) : new Set();
  } catch {
    return new Set();
  }
};
const saveRecSet = (postId, set) => {
  try {
    localStorage.setItem(recKey(postId), JSON.stringify([...set]));
  } catch {}
};


export default function CommunityDetailPage() {
  const { postId } = useParams();
  const router = useRouter();
  const bodyRef = useRef(null);
  const { ready, isLogined, user } = useLogin();

  const [openDelete, setOpenDelete] = useState(false);
  const [post, setPost] = useState(null);
  const [recommended, setRecommended] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  /** 이벤트 미니카드용 데이터 (백엔드에서 eventCard 필드로 제공) */
  const [eventCard, setEventCard] = useState(null);

  /* 글 로드 */
  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const post = await getBoardDetail(postId); // GET /api/v1/board/{postId}
        if (stop) return;

        // 디버깅: 백엔드 응답 구조 확인
        console.log("Backend response:", post);
        console.log("Author data:", post?.author);

        // 데이터 변환 적용
        const transformedPost = transformBoardData(post);
        console.log("Transformed post:", transformedPost);
        setPost(transformedPost || null);
        
        // 백엔드에서 제공하는 eventCard를 변환해서 사용
        const transformedEventCard = transformEventCardData(post?.eventCard);
        setEventCard(transformedEventCard);

        // 댓글 수(루트만) – 서버 응답에 없으니 기존 로컬 계산 유지
        try {
          const raw = localStorage.getItem(`comments:${postId}`);
          const list = raw ? JSON.parse(raw) : [];
          const roots = Array.isArray(list)
            ? list.filter((c) => !c.parentId).length
            : 0;
          setCommentCount(roots);
        } catch {
          setCommentCount(0);
        }
      } catch (e) {
        console.error(e);
        setPost(null);
        setCommentCount(0);
      }
    })();
    return () => {
      stop = true;
    };
  }, [postId]);

  // 내 추천 여부(초기값: 로컬 기록 사용)
  useEffect(() => {
    if (!post) return;
    const set = loadRecSet(postId);
    setRecommended(user ? set.has(userKey(user)) : false);
  }, [post, user, postId]);


  if (!post) {
    return (
      <div className="w-full max-w-full mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-4">글을 찾을 수 없습니다</h1>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 border rounded"
            onClick={() => router.back()}>
            뒤로
          </button>
          <button
            className="px-4 py-2 border rounded"
            onClick={() => router.push("/community")}>
            목록으로
          </button>
        </div>
      </div>
    );
  }

  const currentKey = userKey(user);
  const ownerKey = String(post?.authorId || "");
  const canDelete = !!currentKey && currentKey === String(ownerKey);

  const views = post?.views ?? 0;
  const recommends = post?.recommendations ?? 0;
  const authorName = post?.author || "익명";

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-8 py-6">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black">자유 게시판</h1>
        </div>

        {/* 제목/메타 */}
        <div className=" mb-4 pb-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-black mb-4">{post.title}</h2>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>작성자 : {authorName}</span>
              <span>{new Date(post.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 pr-2">
              <span>조회 {views}</span>
              <span>추천 {recommends}</span>
              <span>댓글 {commentCount}</span>
            </div>
          </div>
        </div>

        {/* 이벤트 카드 (백엔드 연동) */}
        <div className="mb-6">
          {eventCard && <PostEventMiniCard {...eventCard} />}
        </div>

        {/* 본문 */}
        <div ref={bodyRef} className="mb-8 min-h-[600px]">
          <div className="text-sm text-gray-700 whitespace-pre-line">
            {post.content}
          </div>
        </div>

        {/* 추천/공유/신고 */}
        <div className="flex justify-center my-6">
          <button
            className="flex flex-col items-center gap-2 px-4 py-3"
            onClick={async () => {
              if (!ready) return;
              if (!isLogined) {
                const next = encodeURIComponent(
                  window.location.pathname + window.location.search
                );
                return router.replace(`/login?next=${next}`);
              }

              const memberId = user?.id ?? user?.user_id;
              if (!memberId) {
                return alert("회원 정보를 확인할 수 없습니다.");
              }

              try {
                const liked = await toggleBoardLike(postId, memberId);

                // 최신 데이터 재조회
                const latestPost = await getBoardDetail(postId);
                const transformedLatest = transformBoardData(latestPost);
                setPost(transformedLatest || null);
                
                // 이벤트 카드도 업데이트
                const updatedEventCard = transformEventCardData(latestPost?.eventCard);
                setEventCard(updatedEventCard);

                // 로컬 추천기록도 업데이트(초기상태 표시에 사용)
                const currentUserKey = userKey(user);
                const recommendationSet = loadRecSet(postId);
                if (liked) recommendationSet.add(currentUserKey);
                else recommendationSet.delete(currentUserKey);
                saveRecSet(postId, recommendationSet);

                setRecommended(!!liked);
              } catch (e) {
                console.error("추천 처리 에러:", e);
                alert("추천 처리 중 오류가 발생했습니다.");
              }
            }}>
            {recommended ? (
              <Image
                src={ICONS.THUMBSUP_FULL}
                alt="추천"
                width={24}
                height={24}
              />
            ) : (
              <Image
                src={ICONS.THUMBSUP_EMPTY}
                alt="추천"
                width={24}
                height={24}
              />
            )}
            <span className="text-xs text-gray-400">
              {post?.recommendations ?? 0}
            </span>
          </button>

          <button
            className="flex flex-col items-center gap-2 px-4 py-3"
            onClick={() => navigator.clipboard.writeText(window.location.href)}>
            <Image
              src="/img/share.svg"
              alt="링크 복사"
              width={24}
              height={24}
            />
            <span className="text-xs text-gray-400">공유</span>
          </button>

          <button
            className="flex flex-col items-center gap-2 px-4 py-3"
            onClick={() => navigator.clipboard.writeText(window.location.href)}>
            <Image src="/img/bell.svg" alt="신고" width={24} height={24} />
            <span className="text-xs text-gray-400">신고</span>
          </button>
        </div>

        {/* 댓글 */}
        <section className="mt-8">
          <CommentsSection
            postId={postId}
            bodyRef={bodyRef}
            onCountChange={setCommentCount}
          />
        </section>

        {/* 액션 */}
        <div className="flex gap-2 mt-3 mb-10 justify-end">
          {canDelete && (
            <button
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
              onClick={() => setOpenDelete(true)}
              disabled={deleting}>
              {deleting ? "삭제 중…" : "삭제"}
            </button>
          )}
          <button
            className="px-6 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            onClick={() => router.push("/community")}>
            목록으로
          </button>
        </div>
      </div>

      {/* 삭제 확인 */}
      <ConfirmModal
        open={openDelete}
        title="게시글을 삭제할까요?"
        description="삭제 후에는 복구할 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        onConfirm={async () => {
          if (!canDelete) {
            setOpenDelete(false);
            return alert("이 글을 삭제할 권한이 없습니다.");
          }
          setDeleting(true);
          try {
            await deleteBoard(postId);
            setOpenDelete(false);
            router.push("/community");
          } finally {
            setDeleting(false);
          }
        }}
        onClose={() => setOpenDelete(false)}
      />
    </div>
  );
}
