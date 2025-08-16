// components/community/review/ReviewWriteOption.jsx
'use client';

import SearchToWrite from './SearchToWrite';
import mockEvents from '@/components/community/mockEvents';
// import AddContent from '@/components/community/AddContent'; // TODO: AddContent 컴포넌트 구현 필요
import Link from 'next/link';

export default function ReviewWriteOption({ onPickEvent }) {
  return (
    <div className="w-full max-w-[1200px] h-auto border border-gray-300 rounded-lg p-6 grid grid-rows-2 gap-y-6">
      {/* 이벤트 선택/추가 */}
      <div className="flex items-center">
        <span className="w-[150px] text-lg font-semibold text-gray-800">
          이벤트 선택/추가
        </span>
        <div className="flex-1 ml-[20px]">
          <SearchToWrite onSelect={onPickEvent} mockData={mockEvents} />
        </div>
        <p className=" text-[12px] leading-5 text-gray-400 absolute left-[520px]">
          ※ 찾는 이벤트가 없을 경우 ‘1:1’ 문의 부탁드립니다.
          <Link href="/help/guide" className=" hover:text-red-400">
            [이벤트 선택 가이드 보기]
          </Link>
        </p>
      </div>

      {/* 2) 컨텐츠 추가 */}
      <div className="flex items-center">
        <span className="w-[150px] text-lg font-semibold text-gray-800">
          컨텐츠 추가
        </span>
        <div className="flex-1 ml-[20px]">
          {/* <AddContent /> */}
          <div className="text-gray-400">컨텐츠 추가 기능 구현 예정</div>
        </div>
      </div>
    </div>
  );
}
