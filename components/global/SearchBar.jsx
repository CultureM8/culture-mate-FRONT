"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ICONS } from "@/constants/path";

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "검색어를 입력해주세요",
  className = "",
}) {
  const router = useRouter();
  const isControlled =
    typeof value === "string" && typeof onChange === "function";
  const [inner, setInner] = useState("");

  const q = isControlled ? value : inner;
  const setQ = isControlled ? onChange : setInner;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;

    if (typeof onSearch === "function") {
      onSearch(trimmed);
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center h-8 w-[clamp(50px,30vw,300px)]
        border border-gray-300 rounded-full p-3 gap-2 ${className}`}>
      <input
        type="text"
        className="w-full bg-transparent focus:outline-none focus:placeholder:opacity-0"
        placeholder={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button type="submit" className="hover:cursor-pointer" aria-label="검색">
        <Image src={ICONS.SEARCH} alt="search" width={24} height={24} />
      </button>
    </form>
  );
}
