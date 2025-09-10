"use client";

import { ICONS, IMAGES } from "@/constants/path";
import Image from "next/image";
import { useState } from "react";
import StarScore from "@/lib/StarScore";
import { useContext } from "react";
import { LoginContext } from "@/components/auth/LoginProvider";

export default function EventInfo({ eventData, score = 0 }) {
  const [interest, setInterest] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 로그인 컨텍스트
  const { user, isLogined } = useContext(LoginContext);
  const [like, setLike] = useState(false);

  const handleInterest = async () => {
    if (!isLogined || !user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { toggleEventInterest } = await import("@/lib/eventApi");
      const result = await toggleEventInterest(eventData.eventId, user.id);

      setInterest(!interest);
      console.log("관심 등록/해제 결과:", result);
    } catch (error) {
      console.error("관심 등록/해제 실패:", error);
      alert("관심 등록/해제에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = () => {
    setLike(!like);
  };

  if (!eventData) {
    return (
      <div className="flex justify-center items-center h-64 px-6">
        <div>이벤트 데이터를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-4xl font-bold mb-4 px-6 h-16 py-[10px]">
        {eventData.eventType}
      </h1>

      <div className="flex">
        <div className="p-4">
          <div className="relative w-[400px] h-[500px] overflow-hidden rounded-lg">
            <Image
              src={
                eventData.imgSrc && eventData.imgSrc.trim() !== ""
                  ? eventData.imgSrc
                  : IMAGES.GALLERY_DEFAULT_IMG
              }
              alt={eventData.alt}
              fill
              className="object-cover"
            />
          </div>
          <div className="px-2 py-6 flex justify-between">
            <div className="flex gap-6">
              <div className="flex gap-2 items-center">
                {/* <Image 
                  src={ICONS.STAR_FULL}
                  alt="별점"
                  width={24}
                  height={24}
                />
                {eventData.score} */}
                {/* 백엔드에서 제공하는 평균 별점 표시 */}
                <StarScore score={eventData.avgRating || eventData.score || 0} />
              </div>
              {/* <div className="flex gap-2 items-center">
                <button onClick={handleLike} className="hover:cursor-pointer">
                  {like ? (
                    <Image
                      src={ICONS.THUMBSUP_FULL}
                      alt="추천"
                      width={24}
                      height={24}
                    />
                  ) : (
                    <Image
                      src={ICONS.THUMBSUP_EMPTY}
                      alt="추천"
                      width={24}
                      height={24}
                    />
                  )}
                </button>
                {eventData.likesCount}
              </div> */}
            </div>
            <div className="flex gap-6">
              <button onClick={handleInterest} className="hover:cursor-pointer">
                {interest ? (
                  <Image src={ICONS.HEART} alt="관심" width={28} height={28} />
                ) : (
                  <Image
                    src={ICONS.HEART_EMPTY}
                    alt="관심"
                    width={28}
                    height={28}
                  />
                )}
              </button>
              <button>
                <Image src={ICONS.SHARE} alt="공유" width={24} height={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto flex-1 px-8">
          <div className="py-4 flex items-center gap-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {eventData.title}
            </h2>
          </div>

          <div className="mt-8 flex flex-col gap-8 text-gray-700">
            <div className="flex">
              <span className="w-25 font-medium">장소</span>
              <span>{eventData.location}</span>
            </div>
            <div className="flex">
              <span className="w-25 font-medium">기간</span>
              <span>
                {eventData.startDate} ~ {eventData.endDate}
              </span>
            </div>
            <div className="flex">
              <span className="w-25 font-medium">관람시간</span>
              <span>{eventData.viewTime}</span>
            </div>
            <div className="flex">
              <span className="w-25 font-medium">관람연령</span>
              <span>{eventData.ageLimit}</span>
            </div>
            <div className="flex">
              <span className="w-25 font-medium">가격</span>
              <span>{eventData.price}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
