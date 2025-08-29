"use client";

import ConfirmModal from "@/components/global/ConfirmModal";
import { deletePost } from "@/lib/storage";
import Image from "next/image";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PostEventMiniCard from '@/components/global/PostEventMiniCard';
import mockEvents from '@/components/community/mockEvents';
import { toCard } from '@/lib/schema';
import CommentsSection from '@/components/community/CommentsSection';
import { useRef } from 'react';
import { ICONS, IMAGES } from '@/constants/path';

import {
  getPost,
  bumpViews,
  isRecommended,
  toggleRecommendation,
} from "@/lib/storage";

/* 작성자 표시*/
function getAuthorId(post) {
  if (!post) return "";
  if (post.author_login_id) return post.author_login_id;
  const a = post.author;
  if (!a) return "";
  if (typeof a === "string") return a;
  return a.login_id || a.id || a.name || "";
}

export default function CommunityDonePage() {
  const { postId } = useParams();
  const router = useRouter();
  const bodyRef = useRef(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [post, setPost] = useState(null);

  const [recommended, setRecommended] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    const p = getPost("community", postId);
    setPost(p || null);

    const onceKey = `viewed:community:${postId}`;
    if (p && !sessionStorage.getItem(onceKey)) {
      bumpViews("community", postId);
      sessionStorage.setItem(onceKey, "1");
      const updated = getPost("community", postId);
      setPost(updated || p);
    }

    setRecommended(isRecommended("community", postId));

    const raw = localStorage.getItem(`comments:${postId}`);
    const list = raw ? JSON.parse(raw) : [];
    setCommentCount(Array.isArray(list) ? list.length : 0);
  }, [postId]);

  const card = useMemo(() => {
    if (!post) return null;
    if (post.eventSnapshot) return post.eventSnapshot;
    if (!post.eventId) return null;

    const raw = DUMMY_EVENTS.find(
      (e) => String(e.eventId) === String(post.eventId)
    );
    if (raw) {
      /* eventData변환*/
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

  const views = post?.stats?.views ?? 0;

  const recommendations =
    post?.stats?.recommendations ?? post?.recommendations ?? 0;
  const displayAuthor = getAuthorId(post);
  /*------------------------------------------------------------------------*/
  return (
    <>
      <div className="mx-6 my-4 max-w-[1200px] h-[108px] flex items-center">
        <h1 className="font-inter font-semibold text-[36px] leading-[44px] tracking-[-0.005em] text-[#26282A]">
          자유 게시판
        </h1>
      </div>

      <div className="w-full max-w-[1200px]  mx-auto   ">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900 break-words px-6 my-4">
            {post.title}
          </h1>
          <div className="flex mt-2 py-6 px-6 text-base text-gray-400 border-b-2 border-gray-300 justify-between">
            <div className="flex items-center gap-6">
              <span className="gap-2">작성자{displayAuthor}</span>
              <span>{new Date(post.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-6">
              <span>조회 {views}</span>
              <span>추천 {recommendations}</span>
              <span>댓글 {commentCount}</span>
            </div>
          </div>
        </header>

        {card && <PostEventMiniCard {...card} />}
        {/* 본문영역 */}
        <div ref={bodyRef} className="mt-6 min-h-[600]">
          {post.mode === "plain" ? (
            <p className="whitespace-pre-line text-gray-800">{post.content}</p>
          ) : (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}
        </div>
        <div className="flex justify-center my-6">
          <button
            className="flex flex-col items-center gap-2 px-4 py-3"
            onClick={() => {
              const ret = toggleRecommendation("community", postId);

              const nextCount =
                typeof ret === "number"
                  ? ret
                  : ret?.count ?? ret?.recommendations ?? 0;
              const nextRecommended =
                typeof ret === "number" ? !recommended : !!ret?.recommended;

              setRecommended(nextRecommended);
              setPost((prev) =>
                prev
                  ? {
                      ...prev,
                      stats: {
                        ...(prev.stats || {}),
                        recommendations: nextCount,
                      },
                    }
                  : prev
              );
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
            <span className="text-xs text-gray-400">{recommendations}</span>
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
        </div>

        {/* 댓글  */}
        <CommentsSection
          postId={postId}
          bodyRef={bodyRef}
          onCountChange={setCommentCount}
        />

        <div className="flex gap-2 mt-3 mb-10 justify-end">
          <button
            className="px-2 py-2 rounded border border-red text-red-600 hover:bg-red-400 hover:text-white"
            onClick={() => setOpenDelete(true)}>
            삭제
          </button>
          <button
            className="px-2 py-2 border rounded border-gray-700  hover:bg-gray-500 hover:text-white"
            onClick={() => router.push("/community")}>
            목록으로
          </button>
        </div>
      </div>
      <ConfirmModal
        open={openDelete}
        title="게시글을 삭제할까요?"
        description="삭제 후에는 복구할 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        onConfirm={() => {
          deletePost("community", postId, { purgeExtras: true });
          setOpenDelete(false);
          // 목록으로 이동
          router.push("/community");
        }}
        onClose={() => setOpenDelete(false)}
      />
    </>
  );
}
