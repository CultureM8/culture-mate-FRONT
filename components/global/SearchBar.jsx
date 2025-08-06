"use client"

import { ICONS } from "@/constants/path";
import Image from "next/image";
import { useState } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); // 새로고침 방지

    if (!query.trim()) return;

    // 1️⃣ 검색어로 페이지 이동 (예: /search?q=키워드)
    window.location.href = `/search?q=${encodeURIComponent(query)}`;

    // 또는
    // 2️⃣ 검색 함수 실행
    // searchFunction(query);
  };

  return (
    <form 
      action="" 
      className="flex items-center h-8 w-[clamp(50px,30vw,300px)]
        border border-gray-300 rounded-full p-3 gap-2"
    >
      <input type="text" className="w-full bg-transparent focus:outline-none focus:placeholder:opacity-0" 
        placeholder="검색어를 입력해주세요" 
      />
      <button type="submit" className="hover:cursor-pointer">
        <Image 
          src={ICONS.SEARCH} 
          alt="search"
          width={24}
          height={24}
        />
      </button>
    </form>
  );
}