'use client'

import { ICONS, IMAGES } from "@/constants/path";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Gallery({ src, alt = "이미지", title = "제목 없음", enableInterest=true, onClick, href = "", children }) {

  // 추후에 매개변수로 넘겨받아서 처리
  const [interest, setInterest] = useState(false);

  // 이부분은 추후에 page에서 처리하는 방식으로 변경해야 할 듯
  const interestHandler = () => {
    setInterest(prev => !prev);
    if(typeof onClick == "function") onClick();
  }
  
  return (
    <div className="bg-white w-[300px] relative" title={title}>
      {enableInterest &&
        <button className={`absolute top-0 right-0 mt-4 mr-4 ${interest ? "" : "opacity-30"} hover:cursor-pointer`}
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
        <div className="mx-[10px] py-[10px] overflow-hidden whitespace-nowrap text-ellipsis text-gray-400">
          <Image
            src={src && src.trim() !== "" ? src : IMAGES.GALLERY_DEFAULT_IMG}
            alt={alt}
            width={200}
            height={150}
            className="w-[280px] h-[200px] rounded-xl object-cover"
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
