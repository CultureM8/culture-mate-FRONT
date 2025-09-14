'use client'

import { ICONS, IMAGES } from "@/constants/path";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ListComponent({ 
  src, 
  alt = "이미지", 
  title = "", 
  enableInterest = true, 
  isInterested = false, // 외부에서 관심 상태를 받을 수 있도록 추가
  onClick, 
  onInterestClick, 
  href = "", 
  children 
}) {

  // 내부 상태와 외부 prop 중 외부 prop 우선 사용
  const [internalInterest, setInternalInterest] = useState(false);
  const interest = typeof isInterested === 'boolean' ? isInterested : internalInterest;

  // 관심 버튼 클릭 핸들러
  const interestHandler = () => {
    // 외부에서 관심 상태를 관리하지 않는 경우에만 내부 상태 업데이트
    if (typeof isInterested !== 'boolean') {
      setInternalInterest(prev => !prev);
    }
    if(typeof onInterestClick == "function") onInterestClick();
  }
  
  // 공통 컨텐츠
  const content = (
    <div className="mx-[10px] py-[10px] overflow-hidden whitespace-nowrap text-ellipsis text-gray-400 flex">
      <Image
        src={src && src.trim() !== "" ? src : IMAGES.GALLERY_DEFAULT_IMG}
        alt={alt}
        width={120}
        height={120}
        className="w-[120px] h-[120px] rounded-xl object-cover"
      />
      <div className="px-4 py-2 flex-1 min-w-0">
        {children}
      </div>
    </div>
  );

  return (
    <div className="bg-white w-full min-w-[300px] relative border-b border-gray-200" title={title}>
      {enableInterest &&
        <button className={`absolute top-0 left-0 mt-4 ml-4 ${interest ? "" : "opacity-30"} hover:cursor-pointer`}
          onClick={interestHandler}
        >
          <Image 
            src={interest ? ICONS.HEART : ICONS.HEART_EMPTY}
            alt="관심"
            width={28}
            height={28}
          />
        </button>
      }
      {onClick ? (
        <div onClick={onClick} className="cursor-pointer">
          {content}
        </div>
      ) : href ? (
        <Link href={href}>
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
