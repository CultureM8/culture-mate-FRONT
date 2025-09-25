"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ICONS } from "@/constants/path";

export default function MainSearchBar({
  initialValue = "",
  placeholder = "검색어를 입력해주세요",
  showTags = false,
  tags = [],
  onSearch,
  className = ""
}) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  // initialValue가 변경될 때 searchValue 업데이트
  useEffect(() => {
    setSearchValue(initialValue);
  }, [initialValue]);

  // 검색 실행 함수
  const handleSearch = () => {
    const trimmed = searchValue.trim();
    if (!trimmed) return;

    if (typeof onSearch === "function") {
      onSearch(trimmed);
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  // 엔터키 검색 핸들러
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 태그 클릭 핸들러
  const handleTagClick = (tag) => {
    setSearchValue(tag);
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  return (
    <div className={`relative ${className}`}>
      {/* 검색창 배경 (블러 효과) - 포커스 시에만 표시 */}
      {isFocused && showTags && (
        <div className="absolute bg-[rgba(255,255,255,0.2)] blur-[2px] filter h-[60px] left-1/2 rounded-xl top-1/2 translate-x-[-50%] translate-y-[-50%] w-[560px]" />
      )}

      {/* 메인 검색창 */}
      <div className="relative bg-[#ffffff] h-[50px] rounded-xl w-full max-w-[550px] mx-auto shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
        <div className="h-[50px] overflow-hidden relative w-full">
          {/* 검색 입력 필드 */}
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="absolute box-border w-[calc(100%-50px)] h-full left-0 px-5 py-[13px] top-0 bg-transparent border-none outline-none font-medium text-[#333333] text-[20px] placeholder:text-[#76787a] placeholder:font-medium"
          />

          {/* 검색 아이콘 */}
          <button
            onClick={handleSearch}
            className="absolute box-border flex flex-row gap-2.5 items-center justify-center p-0 right-0 size-[50px] top-1/2 translate-y-[-50%] cursor-pointer hover:bg-gray-50 rounded-r-xl transition-colors duration-200">
            <Image
              src={ICONS.SEARCH}
              alt="search"
              width={24}
              height={24}
              className="shrink-0"
              priority
            />
          </button>
        </div>
      </div>

      {/* 검색 태그들 (선택적) */}
      {showTags && tags.length > 0 && (
        <div className="flex flex-row items-center justify-center gap-2 mt-4 w-full max-w-[550px] mx-auto">
          {tags.map((tag, index) => (
            <button
              key={index}
              onClick={() => handleTagClick(tag)}
              className="box-border flex flex-row gap-2.5 items-center justify-center px-4 py-1.5 rounded-[20px] border border-[#ffffff] cursor-pointer hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-200">
              <div className="flex flex-col font-normal justify-center leading-[0] text-[#ffffff] text-[18px] text-center text-nowrap">
                <p className="block leading-[1.55] whitespace-pre">{tag}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}