'use client'; /**게시글(미완성) */

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PostEventMiniCard from '@/components/global/PostEventMiniCard';
import mockEvents from '@/components/community/mockEvents';
import { toCard } from '@/lib/schema';
import CommentsSection from '@/components/community/CommentsSection';
import { useRef } from 'react';

import {
  getPost,
  bumpViews,
  isLiked,
  toggleLike,
  isRecommended,
  toggleRecommendation,
} from '@/lib/storage';

export default function PromoteDonePage() {
  const { postId } = useParams();
  const router = useRouter();
  const bodyRef = useRef(null);

  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [recommended, setRecommended] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    const p = getPost('promote', postId);
    setPost(p || null);

    const onceKey = `viewed:promote:${postId}`;
    if (p && !sessionStorage.getItem(onceKey)) {
      bumpViews('promote', postId);
      sessionStorage.setItem(onceKey, '1');
      const updated = getPost('promote', postId);
      setPost(updated || p);
    }

    setLiked(isLiked('promote', postId));
    setRecommended(isRecommended('promote', postId));

    const raw = localStorage.getItem(`comments:${postId}`);
    const list = raw ? JSON.parse(raw) : [];
    setCommentCount(Array.isArray(list) ? list.length : 0);
  }, [postId]);

  const card = useMemo(() => {
    if (!post) return null;
    if (post.eventSnapshot) return post.eventSnapshot;
    if (!post.eventId) return null;
    const raw = mockEvents.find((e) => String(e.id) === String(post.eventId));
    return raw ? toCard(raw) : null;
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
            onClick={() => router.push('/community/promote')}>
            목록으로
          </button>
        </div>
      </div>
    );
  }

  const views = post?.stats?.views ?? 0;
  const likes = post?.stats?.likes ?? 0;
  const recommends = post?.stats?.recommends ?? 0;
  const displayAuthor = post?.author || '익명';

  return (
    <>
      <div className="w-full max-w-[1200px] h-[108px] flex items-center">
        <h1 className="font-inter font-semibold text-[36px] leading-[44px] tracking-[-0.005em] text-[#26282A]">
          홍보 게시판
        </h1>
      </div>

      <div className="w-full max-w-[1200px] mx-auto px-6 py-8 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900 break-words">
            {post.title}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            작성자 {displayAuthor} · {new Date(post.createdAt).toLocaleString()}{' '}
            · 조회 {views} · 추천 {recommends} · 댓글 {commentCount}
          </p>
        </header>

        {card && <PostEventMiniCard {...card} />}

        <div ref={bodyRef} className="mt-6">
          {post.mode === 'plain' ? (
            <p className="whitespace-pre-line text-gray-800">{post.content}</p>
          ) : (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}
        </div>

        <CommentsSection
          postId={postId}
          bodyRef={bodyRef}
          onCountChange={setCommentCount}
        />

        <div className="flex gap-2">
          <button
            className="px-3 py-2 border rounded"
            onClick={() => navigator.clipboard.writeText(window.location.href)}>
            링크 복사
          </button>

          <button
            className={`px-3 py-2 rounded border ${
              liked ? 'bg-gray-900 text-white' : ''
            }`}
            onClick={() => {
              const { recommended: r } = toggleRecommendation(
                'promote',
                postId
              );
              setRecommended(r);
              setPost(getPost('promote', postId));
            }}>
            추천 {recommends}
          </button>
        </div>
      </div>
    </>
  );
}
