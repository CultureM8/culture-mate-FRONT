"use client";

import { ICONS } from "@/constants/path";
import Image from "next/image";

export default function SearchBar() {
  const handleSubmit = (e) => {
    e.preventDefault(); // 새로고침 방지
  };

  return (
    <div className="px-2.5 h-16 flex items-center justify-end">
      <div className="flex items-center gap-6">
        <button className="flex items-cente gap-2 hover:cursor-pointer">
          편집
          <Image src={ICONS.EDIT} alt="편집" width={24} height={24} />
        </button>
        <button className="flex items-cente gap-2 hover:cursor-pointer">
          설정
          <Image src={ICONS.SETTING} alt="설정" width={24} height={24} />
        </button>
      </div>
    </div>
  );
}
