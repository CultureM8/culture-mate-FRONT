'use client'; /**홍보 글 작성 옵션박스 */

import SearchToWrite from './SearchToWrite';
import AddContent from './AddContent';
import mockEvents from '@/components/community/mockEvents';
import Link from 'next/link';

export default function FreeWriteOption({
  mode = 'plain',
  onModeChange = () => {},
  onPickEvent = () => {},
}) {
  return (
    <div className="w-full max-w-[1200px] border border-gray-300 rounded-lg bg-white px-6 py-7 space-y-6">
      {/*  이벤트 선택/추가 */}
      <div className="flex items-center">
        <span className="w-[150px] text-lg font-semibold text-gray-800">
          이벤트 선택/추가
        </span>
        <div className="flex-1 ml-[20px]">
          {/* ✅ SearchToWrite 에 콜백과 목업 주입 */}
          <SearchToWrite onSelect={onPickEvent} mockData={mockEvents} />
        </div>
        <p className="ml-6 text-[12px] leading-5 text-gray-400">
          ※ 찾는 이벤트가 없을 경우 ‘1:1’ 문의 부탁드립니다.
          <Link href="/help/guide" className=" hover:text-red-400">
            [이벤트 선택 가이드 보기]
          </Link>
        </p>
      </div>

      {/* 컨텐츠 추가 */}
      <div className="flex items-center">
        <span className="w-[150px] text-lg font-semibold text-gray-800">
          컨텐츠 추가
        </span>
        <div className="flex-1 ml-[20px]">
          <AddContent />
        </div>
      </div>

      {/* 글쓰기 방식 */}
    </div>
  );
}
