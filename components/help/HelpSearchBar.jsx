"use client";

import { useState } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";

export default function HelpSearchBar({
  showCreateButton = false,
  onCreateClick = null,
  createButtonText = "문의하기"
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("등록순");

  const sortOptions = ["등록순", "최신순"];

  const handleSortSelect = (option) => {
    setSelectedSort(option);
    setIsDropdownOpen(false);
  };

  return (
    <div className="
      relative 
      w-full 
      flex 
      items-center 
      justify-end 
      gap-4
      px-5 
      py-2.5
    ">
      {/* 검색창 */}
      <div className="relative">
        <div className="
          w-[300px] 
          h-8 
          border 
          border-[#c6c8ca] 
          rounded-[20px]
          flex 
          items-center 
          px-2.5
          bg-white
        ">
          <input
            type="text"
            placeholder="검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              flex-1 
              text-[16px] 
              font-medium 
              text-[#c6c8ca] 
              placeholder:text-[#c6c8ca]
              leading-[1.5]
              tracking-[0.032px]
              outline-none
              bg-transparent
            "
          />
          <button className="shrink-0 ml-2">
            <Image
              src={ICONS.SEARCH}
              alt="search"
              width={24}
              height={24}
            />
          </button>
        </div>
      </div>

      {/* 정렬 드롭다운 */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="
            flex 
            items-center 
            gap-2
            text-[16px] 
            font-medium 
            text-black 
            leading-[1.5]
            whitespace-nowrap
          "
        >
          정렬
          <Image
            src={ICONS.DOWN_ARROW}
            alt="dropdown arrow"
            width={16}
            height={16}
            className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* 드롭다운 메뉴 */}
        {isDropdownOpen && (
          <div className="
            absolute 
            top-full 
            right-0 
            mt-1
            bg-white 
            shadow-lg
            z-10
            min-w-[80px]
          ">
            {sortOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleSortSelect(option)}
                className={`
                  w-full 
                  px-3 
                  py-2 
                  text-left 
                  text-[14px] 
                  hover:bg-gray-50
                  ${selectedSort === option ? "bg-gray-100 font-medium" : ""}
                `}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 조건부 버튼 렌더링 */}
      {showCreateButton && onCreateClick && (
        <button
          onClick={onCreateClick}
          className="
            px-4
            py-2
            bg-[#4E5052]
            text-white
            font-medium
            text-[14px]
            rounded-lg
            hover:bg-[#3a3c3e]
            transition-colors
            whitespace-nowrap
            shrink-0
          "
        >
          {createButtonText}
        </button>
      )}
    </div>
  );
}