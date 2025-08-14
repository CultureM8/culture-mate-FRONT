"use client";

import { ICONS, IMAGES } from "@/constants/path";
import Image from "next/image";
import { useState } from "react";

export default function ListGallery({
  src,
  eventType,
  eventName,
  alt,
  title,
  onClick,
}) {
  const [interest, setInterest] = useState(false);

  const interestHandler = () => {
    setInterest((prev) => !prev);
    if (typeof onClick == "function") onClick();
  };

  return (
    <>
      <div className="relative flex items-center gap-1 p-0 mt-5">
        <button
          className={`absolute top-1 left-1 hover:cursor-pointer ${
            interest ? "" : "opacity-30"
          }`}
          onClick={interestHandler}
        >
          <Image
            src={interest ? ICONS.HEART : ICONS.HEART_EMPTY}
            alt="관심"
            width={28}
            height={28}
            className="object-cover"
          />
        </button>
        <div className="flex items-center gap-4">
          <Image
            src={src ? src : IMAGES.GALLERY_DEFAULT_IMG}
            alt={alt}
            width={100}
            height={100}
            className="object-cover"
          />
          <div className="flex flex-col justify-center gap-1 w-full max-w-xs">
            <div className="text-lg font-bold text-black">
              {eventType} {eventName}
            </div>

            <div className="text-base truncate">{title}</div>
          </div>
        </div>
      </div>
    </>
  );
}
