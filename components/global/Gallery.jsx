"use client";

import { ICONS, IMAGES } from "@/constants/path";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function Gallery({
  src,
  alt = "이미지",
  title = "제목 없음",
  enableInterest = true,
  onClick,
  href = "",
  children,
}) {
  const [interest, setInterest] = useState(false);

  const initialSrc = useMemo(() => {
    return typeof src === "string" && src.trim().length > 0
      ? src.trim()
      : IMAGES.GALLERY_DEFAULT_IMG; // /public/default_img.svg
  }, [src]);

  const [currentSrc, setCurrentSrc] = useState(initialSrc);

  const interestHandler = () => {
    setInterest((prev) => !prev);
    if (typeof onClick === "function") onClick();
  };

  return (
    <div className="bg-white w-[300px] relative" title={title}>
      {enableInterest && (
        <button
          className={`absolute top-0 right-0 mt-4 mr-4 ${
            interest ? "" : "opacity-30"
          } hover:cursor-pointer`}
          onClick={interestHandler}>
          <Image
            src={interest ? ICONS.HEART : ICONS.HEART_EMPTY}
            alt="관심"
            width={28}
            height={28}
          />
        </button>
      )}

      <Link href={href}>
        <div className="mx-[10px] py-[10px] overflow-hidden whitespace-nowrap text-ellipsis text-gray-400">
          <Image
            src={currentSrc}
            alt={alt || title || "이미지"}
            width={200}
            height={150}
            className="w-[280px] h-[200px] rounded-xl object-cover"
            onError={() => {
              // 무한 루프 방지: 이미 기본이미지면 그대로 유지
              if (currentSrc !== IMAGES.GALLERY_DEFAULT_IMG) {
                setCurrentSrc(IMAGES.GALLERY_DEFAULT_IMG);
              }
            }}
            priority={false}
          />
          <div className="px-2">
            <div className="text-lg font-bold overflow-hidden whitespace-nowrap text-ellipsis text-black">
              {title}
            </div>
            {children}
          </div>
        </div>
      </Link>
    </div>
  );
}
