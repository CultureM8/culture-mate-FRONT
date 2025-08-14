'use client'

import { ICONS, IMAGES } from "@/constants/path";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ListComponent({ src, alt = "이미지", enableInterest=true, onClick, href = "", children }) {

  // 추후에 매개변수로 넘겨받아서 처리
  const [interest, setInterest] = useState(false);

  // 이부분은 추후에 page에서 처리하는 방식으로 변경해야 할 듯
  const interestHandler = () => {
    setInterest(prev => !prev);
    if(typeof onClick == "function") onClick();
  }
  
  return (
    <div className="bg-white w-full min-w-[300px] relative border-b border-gray-200">
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
      <Link
        href={href}
      >
        <div 
          className="
            mx-[10px] py-[10px] 
            overflow-hidden whitespace-nowrap text-ellipsis text-gray-400
            flex
            "
        >
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
      </Link>
    </div>
  );
}
