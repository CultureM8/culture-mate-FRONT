"use client";

/** 자유게시판 글 작성 옵션박스 */

import SearchToWrite from "./SearchToWrite";
// import AddContent from "./AddContent";
import Link from "next/link";

export default function CommunityWriteOption({ onPickEvent = () => {} }) {
  return (
    <div className="border border-gray-300 rounded-lg bg-white px-6 py-7 space-y-6">
      {/* 이벤트 선택/추가 */}
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-700 w-32 flex-shrink-0">
          이벤트 선택/추가
        </p>
        <div className="relative w-1/4">
          <SearchToWrite onSelect={onPickEvent} />
        </div>
        <div className="ml-8">
          <p className="text-[12px] text-gray-400">
            ※ 찾는 이벤트가 없을 경우 '1:1' 문의 부탁드립니다.
            <Link href="/help/guide" className="hover:text-red-400">
              [이벤트 선택 가이드 보기]
            </Link>
          </p>
        </div>
      </div>

      {/* 컨텐츠 추가 */}
      {/* <div className="flex items-center">
        <span className="text-sm text-gray-700 w-32 flex-shrink-0">
          컨텐츠 추가
        </span>
        <div className="flex-1 ml-[20px]">
          <AddContent />
        </div>
      </div> */}
    </div>
  );
}
