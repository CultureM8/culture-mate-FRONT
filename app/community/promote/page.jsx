'use client'; /**홍보게시판 목록페이지 */

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import EventSelector from '@/components/global/EventSelector';
import GalleryLayout from '@/components/global/GalleryLayout';
import SearchSort from '@/components/global/SearchSort';
import PromoteGallery from '@/components/community/promote/PromoteGallery';
import Routing from '@/components/global/Routing';
import { loadPosts } from '@/lib/storage';
import mockEvents from '@/components/community/mockEvents';
import { toCard } from '@/lib/schema';

export default function Promote() {
  const [posts, setPosts] = useState([]);
  const [selectedType, setSelectedType] = useState('전체');
  const [viewType, setViewType] = useState('list');

  const PAGE_SIZE = 20; /* 처음 노출 게시글*/

  useEffect(() => {
    const arr = loadPosts('promote');
    arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setPosts(arr);
  }, []);

  const items = useMemo(() => {
    return posts.slice(0, PAGE_SIZE).map((post) => {
      let card = post?.eventSnapshot;

      if (!card && post?.eventId) {
        const raw = mockEvents.find(
          (e) => String(e.id) === String(post.eventId)
        );
        if (raw) card = toCard(raw);
      }

      card = card || {
        eventName: post?.title || '이벤트명',
        description: (post?.content || '').slice(0, 80),
        eventImage: '/img/default_img.svg',
        starScore: 0,
      };

      return { post, card };
    });
  }, [posts]);

  const filteredItems = useMemo(() => {
    if (selectedType === '전체') return items;
    // 추후 타입별 필터링 로직 추가
    return items;
  }, [items, selectedType]);

  return (
    <>
      <div className="absolute left-1/2 top-[0px] -translate-x-1/2 w-screen h-[380px] z-0">
        <Image
          src={'/img/default_img.svg'}
          alt="배너 이미지"
          fill
          className="object-cover opacity-30"
        />
      </div>
      <div className="border w-full h-[380px]" />

      <div>
        <EventSelector selected={selectedType} setSelected={setSelectedType} />
      </div>

      <div>
        <SearchSort viewType={viewType} setViewType={setViewType} />

        <div className="mb-50">
          {filteredItems.length > 0 ? (
            <GalleryLayout Component={PromoteGallery} items={filteredItems} />
          ) : (
            <div className="text-center py-20 text-gray-500">
              등록된 홍보 게시물이 없습니다.
            </div>
          )}
        </div>
      </div>

      <Routing
        src="/img/add_write.svg"
        alt="글작성"
        className="fixed !bottom-6 !right-6 !z-50 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 !w-8 !h-8"
        to="/community/promote/write"
      />
    </>
  );
}
