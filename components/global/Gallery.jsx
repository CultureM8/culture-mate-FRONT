'use client'

import { ICONS, IMAGES } from "@/constants/path";
import Image from "next/image";
import { useState } from "react";

export default function Gallery({ src, alt = "이미지", title = "제목 없음", onClick, children }) {

  const [interest, setInterest] = useState(false);

  const interestHandler = () => {
    setInterest(prev => !prev);
    if(typeof onClick == "function") onClick();
  }
  
  return (
    <div className="bg-white w-[300px] relative" title={title}>
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
      <div className="mx-[10px] py-[10px] overflow-hidden whitespace-nowrap text-ellipsis text-gray-400">
        <Image
          src={src ? src : IMAGES.GALLERY_DEFAULT_IMG}
          alt={alt}
          width={200}
          height={150}
          className="w-[280px] h-[200px] rounded-xl object-cover"
        />
        <div className="text-lg font-bold overflow-hidden whitespace-nowrap text-ellipsis text-black">
          {title}
        </div>
        {children}
      </div>
    </div>
  );
}
