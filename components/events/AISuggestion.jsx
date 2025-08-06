"use client";

import { ICONS } from "@/constants/path";
import Image from "next/image";
import { useState } from "react";

const suggestionList = [
  { id: 1, imgSrc: "/img/default_img.svg", alt: "제목-1", title: "제목-1", date: "0000-00-00 ~ 0000-00-00" },
  { id: 2, imgSrc: "/img/default_img.svg", alt: "제목-2", title: "제목-2", date: "0000-00-00 ~ 0000-00-00" },
  { id: 3, imgSrc: "/img/default_img.svg", alt: "제목-3", title: "제목-3", date: "0000-00-00 ~ 0000-00-00" },
  { id: 4, imgSrc: "/img/default_img.svg", alt: "제목-4", title: "제목-4", date: "0000-00-00 ~ 0000-00-00" },
  { id: 5, imgSrc: "/img/default_img.svg", alt: "제목-5", title: "제목-5", date: "0000-00-00 ~ 0000-00-00" },
  { id: 6, imgSrc: "/img/default_img.svg", alt: "제목-6", title: "제목-6", date: "0000-00-00 ~ 0000-00-00" },
  { id: 7, imgSrc: "/img/default_img.svg", alt: "제목-7", title: "제목-7", date: "0000-00-00 ~ 0000-00-00" },
  { id: 8, imgSrc: "/img/default_img.svg", alt: "제목-8", title: "제목-8", date: "0000-00-00 ~ 0000-00-00" },
];

function EventCard({ imgSrc, alt, title, date, isCenter }) {
  return (
    <div className={`w-[172px] h-[300px] shrink-0 flex flex-col justify-center items-center transition-all duration-500 ${isCenter ? "scale-110" : "scale-90"}`}>
      {/* 포스터 이미지 영역 */}
      <div className="relative w-full h-[240px] shadow-xl rounded-lg overflow-clip">
        <Image
          src={imgSrc}
          alt={alt}
          fill
          className="object-cover"
        />
        {!isCenter && <div className="absolute inset-0 bg-black/40" />}
      </div>

      {/* 텍스트 영역 */}
      <div className={`pt-2 text-center transition-opacity duration-500 ${isCenter ? "opacity-100 mb-6" : "opacity-70"}`}>
        <h3 className="text-sm font-semibold truncate text-gray-800">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{date}</p>
      </div>
    </div>
  );
}

export default function AISuggestion() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? suggestionList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === suggestionList.length - 1 ? 0 : prev + 1));
  };

  const getDisplayItems = () => {
    const items = [];
    const totalItems = suggestionList.length;
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + totalItems) % totalItems;
      items.push(suggestionList[index]);
    }
    return items;
  };

  const displayItems = getDisplayItems();

  return (
    <div>
      {/* 배경 이미지 */}
      <div className="absolute left-1/2 top-[112px] -translate-x-1/2 w-screen h-[420px] z-0">
        <Image
          src={suggestionList[currentIndex].imgSrc}
          alt={suggestionList[currentIndex].alt}
          fill
          className="object-cover opacity-50 blur-md"
        />
      </div>

      {/* 컨텐츠 영역 */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center gap-6">
        <div className="flex gap-2 items-center justify-center">
          <Image
            src={ICONS.AI}
            alt="AI추천"
            width={28}
            height={28}
          />
          <h2 className="text-lg font-bold text-gray-800">AI 추천</h2>
        </div>

        <div className="w-full flex items-center justify-center relative h-[340px]">
          <button onClick={handlePrev} className="absolute left-4 md:left-24 z-20 p-3 rounded-full bg-white/70 hover:bg-white transition-colors shadow-lg">
            <Image src={ICONS.LEFT_ARROW} alt="Previous" width={24} height={24} />
          </button>

          <div className="flex items-center justify-center gap-x-8">
            {displayItems.map((event, index) => (
              <EventCard
                key={`${event.id}-${index}`}
                imgSrc={event.imgSrc}
                alt={event.alt}
                title={event.title}
                date={event.date}
                isCenter={index === 2}
              />
            ))}
          </div>

          <button onClick={handleNext} className="absolute right-4 md:right-24 z-20 p-3 rounded-full bg-white/70 hover:bg-white transition-colors shadow-lg">
            <Image src={ICONS.RIGHT_ARROW} alt="Next" width={24} height={24} />
          </button>
        
          {/* 하단 페이지네이션 바 */}
          <div className="flex flex-col items-center gap-2 absolute bottom-0">
            {/* <p className="text-sm text-gray-600">{`${currentIndex + 1} / ${suggestionList.length}`}</p> */}
            <div className="w-48 h-2 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-600 rounded-full transition-transform duration-500"
                style={{
                  width: `${100 / suggestionList.length}%`,
                  transform: `translateX(${currentIndex * 100}%)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
