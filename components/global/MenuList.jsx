"use client";

import { ICONS } from "@/constants/path";
import Image from "next/image";
import { useState } from "react";

export default function MenuList({ selected, onChange }) {
  return (
    <div className="px-2.5 h-16 flex items-center justify-between">
      <div className="flex items-center gap-6">
        {/* 갤러리 버튼 */}
        <button
          className={`flex items-center gap-2 hover:cursor-pointer ${
            selected === "gallery" ? "opacity-100" : "opacity-50"
          }`}
          onClick={() => onChange("gallery")}
        >
          <Image
            src={ICONS.MENU}
            alt="메뉴(갤러리형)"
            width={24}
            height={24}
          />
        </button>

        {/* 리스트 버튼 */}
        <button
          className={`flex items-center gap-2 hover:cursor-pointer ${
            selected === "list" ? "opacity-100" : "opacity-50"
          }`}
          onClick={() => onChange("list")}
        >
          <Image
            src={ICONS.LIST}
            alt="리스트"
            width={24}
            height={24}
          />
        </button>
      </div>
    </div>
  );
}
