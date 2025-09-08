"use client";

import ConfirmModal from "@/components/global/ConfirmModal";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PostEventMiniCard from "@/components/global/PostEventMiniCard";
import { DUMMY_EVENTS } from "@/lib/eventData";
import { toCard } from "@/lib/schema";
import CommentsSection from "@/components/community/CommentsSection";
import { ICONS } from "@/constants/path";
import useLogin from "@/hooks/useLogin";
//프론트용
// import {
//   getPost,
//   bumpViews,
//   deletePost,
//   toggleRecommendation,
// } from "@/lib/storage";

/*백엔드*/
import { fetchPost, deletePostApi, toggleBoardLike } from "@/lib/communityApi";

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

/** 작성자 표시명 */
function displayAuthorOf(post) {
  return (
    post?.author_display_name ||
    post?.authorLoginId ||
    String(post?.authorId || "") ||
    "익명"
  );
}

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

  // // 로드 + 조회수 프론트용
  // useEffect(() => {
  //   const p = getPost("community", postId);
  //   setPost(p || null);

  //   if (p) {
  //     const onceKey = `viewed:community:${postId}`;
  //     if (!sessionStorage.getItem(onceKey)) {
  //       bumpViews("community", postId); // _views +1
  //       sessionStorage.setItem(onceKey, "1");
  //       setPost(getPost("community", postId) || p);
  //     }
  //   }

  //   // 댓글수(루트만)
  //   try {
  //     const raw = localStorage.getItem(`comments:${postId}`);
  //     const list = raw ? JSON.parse(raw) : [];
  //     const roots = Array.isArray(list)
  //       ? list.filter((c) => !c.parentId).length
  //       : 0;
  //     setCommentCount(roots);
  //   } catch {
  //     setCommentCount(0);
  //   }
  // }, [postId]);

  /*백엔드 로드+조회수*/
  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        // 서버 단건 조회: GET /api/v1/board/{postId}
        const p = await fetchPost(postId);
        if (stop) return;

        setPost(p || null);

        // 댓글 수는 서버 응답에 없으므로 일단 기존 로컬 계산 유지
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

  // 내 추천 여부
  useEffect(() => {
    if (!post) return;
    const set = loadRecSet(postId);
    setRecommended(user ? set.has(userKey(user)) : false);
  }, [post, user, postId]);

  // 이벤트 카드
  const card = useMemo(() => {
    if (!post) return null;
    if (post.eventSnapshot) return post.eventSnapshot;
    if (!post.eventId) return null;

    const raw = DUMMY_EVENTS.find(
      (e) => String(e.eventId) === String(post.eventId)
    );
    if (raw) {
      const transformedEvent = {
        id: raw.eventId,
        name: raw.title,
        eventName: raw.title,
        eventType: raw.eventType,
        type: raw.eventType,
        image: raw.imgSrc,
        description: raw.title,
        rating: raw.score,
        likes: raw.likesCount,
        postsCount: 0,
        isLiked: false,
      };
      return toCard(transformedEvent);
    }
    return null;
  }, [post]);

  if (!post) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-6 py-10">
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
  const ownerKey =
    post._ownerKey || String(post.authorId || post.authorLoginId || "");
  const canDelete = !!currentKey && currentKey === String(ownerKey);

  const views = post?._views ?? 0;
  const recommends = post?.recommendCount ?? 0;
  const authorName = displayAuthorOf(post);

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

        {/* 이벤트 카드 */}
        <div className="mb-6">{card && <PostEventMiniCard {...card} />}</div>

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
            //프론트용
            // onClick={() => {
            //   if (!ready) return;
            //   if (!isLogined) {
            //     const next = encodeURIComponent(
            //       window.location.pathname + window.location.search
            //     );
            //     return router.replace(`/login?next=${next}`);
            //   }
            //   const k = currentKey;
            //   if (!k) return;

            //   const set = loadRecSet(postId);
            //   const had = set.has(k);

            //   // 저장소 카운트 갱신( recommendCount)
            //   const ret = toggleRecommendation(
            //     "community",
            //     postId,
            //     had ? -1 : +1
            //   );
            //   const nextCount = typeof ret === "number" ? ret : ret?.count ?? 0;

            //   // 내 기록 토글
            //   if (had) set.delete(k);
            //   else set.add(k);
            //   saveRecSet(postId, set);

            //   setRecommended(!had);
            //   setPost((prev) =>
            //     prev ? { ...prev, recommendCount: nextCount } : prev
            //   );
            // }}

            //백엔드용
            // 상세 페이지 추천 버튼 onClick 수정
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
                // 서버에 좋아요 토글
                const liked = await toggleBoardLike(postId, memberId);

                // 최신 데이터 재조회
                const latest = await fetchPost(postId);
                setPost(latest || null);

                // 추천 상태 업데이트
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
              {post?.recommendCount ?? 0}
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
        //프론트용
        // onConfirm={async () => {
        //   if (!canDelete) {
        //     setOpenDelete(false);
        //     return alert("이 글을 삭제할 권한이 없습니다.");
        //   }
        //   setDeleting(true);
        //   try {
        //     deletePost("community", postId, { purgeExtras: true });
        //     setOpenDelete(false);
        //     router.push("/community");
        //   } finally {
        //     setDeleting(false);
        //   }
        // }}

        //백엔드
        onConfirm={async () => {
          if (!canDelete) {
            setOpenDelete(false);
            return alert("이 글을 삭제할 권한이 없습니다.");
          }
          setDeleting(true);
          try {
            await deletePostApi(postId);
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
