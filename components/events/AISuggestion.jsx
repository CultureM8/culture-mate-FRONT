"use client"

import { ICONS } from "@/constants/path";
import Image from "next/image";
import { useState } from "react";

function EventCard({ imgSrc, title, date }) {
  return (
    <div className="w-[172px] h-[300px] shrink-0 flex flex-col justify-center items-center">
      {/* 포스터 이미지 영역 */}
      <div className="relative w-full h-[240] shadow-xl border rounded-lg overflow-clip">
        <Image
          src={imgSrc}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      {/* 텍스트 영역 */}
      <div className="pt-2 text-center">
        <h3 className="text-sm font-semibold truncate">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{date}</p>
      </div>
    </div>
  );
}

export default function AISuggestion() {

  const suggestionList = [
    { id: 1, imgSrc: "/img/default_img.svg", alt: "", title: "제목-1", date: "0000-00-00 ~ 0000-00-00", location: "지역 및 장소명", isHot: false },
    { id: 2, imgSrc: "/img/default_img.svg", alt: "", title: "제목-2", date: "0000-00-00 ~ 0000-00-00", location: "지역 및 장소명", isHot: false },
    { id: 3, imgSrc: "/img/default_img.svg", alt: "", title: "제목-3", date: "0000-00-00 ~ 0000-00-00", location: "지역 및 장소명", isHot: false },
    { id: 4, imgSrc: "/img/default_img.svg", alt: "", title: "제목-4", date: "0000-00-00 ~ 0000-00-00", location: "지역 및 장소명", isHot: true },
    { id: 5, imgSrc: "/img/default_img.svg", alt: "", title: "제목-5", date: "0000-00-00 ~ 0000-00-00", location: "지역 및 장소명", isHot: false },
    { id: 6, imgSrc: "/img/default_img.svg", alt: "", title: "제목-6", date: "0000-00-00 ~ 0000-00-00", location: "지역 및 장소명", isHot: true },
    { id: 7, imgSrc: "/img/default_img.svg", alt: "", title: "제목-7", date: "0000-00-00 ~ 0000-00-00", location: "지역 및 장소명", isHot: false },
    { id: 8, imgSrc: "/img/default_img.svg", alt: "", title: "제목-8", date: "0000-00-00 ~ 0000-00-00", location: "지역 및 장소명", isHot: true },
  ];

  const [count, setCount] = useState(0)

  return (
    <div>
      {/* 배경 이미지 */}
      <div className="absolute left-1/2 top-[112px] -translate-x-1/2 w-screen h-[420px] z-0">
        <Image
          src={suggestionList[count].imgSrc}
          alt={suggestionList[count].alt}
          fill
          className="object-cover opacity-30"
        />
      </div>
      <div className="w-full h-[420px] flex flex-col items-center justify-center gap-4">
        <div className="flex gap-2 items-center justify-center">
          <Image
            src={ICONS.AI}
            alt="AI추천"
            width={28}
            height={28}
          />
          <h2 className="text-lg font-bold">AI 추천</h2>
        </div>
        <div className="flex gap-6 items-center">
          {suggestionList.map((event, _) => (
            <EventCard
              key={event.id}
              imgSrc={event.imgSrc}
              title={event.title}
              date={event.date}
            />
          ))}
        </div>
      </div>
    </div>
  );
}