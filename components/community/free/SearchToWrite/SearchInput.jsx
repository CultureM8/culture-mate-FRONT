/*검색창*/
'use client';

import Image from 'next/image';
import { ICONS } from '@/constants/path';

export default function SearchInput({
  value /**현재 입력값 */,
  onChange /**입력값 변경함수 */,
  onSubmit /**폼 제출함수(엔터나 버튼틀릭시) */,
  placeholder,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center h-8 w-[clamp(50px,30vw,300px)] border border-gray-300 rounded-full px-3 py-1 gap-2 bg-white">
      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        } /**입력값 변경시 부모에게 새 값 전달 */
        className="w-full bg-transparent focus:outline-none focus:placeholder:opacity-0"
        placeholder={placeholder}
      />
      <button type="submit" className="hover:cursor-pointer" aria-label="검색">
        <Image src={ICONS.SEARCH} alt="search" width={24} height={24} />
      </button>
    </form>
  );
}
