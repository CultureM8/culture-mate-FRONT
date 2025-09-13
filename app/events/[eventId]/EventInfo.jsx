"use client";

import { ICONS, IMAGES } from "@/constants/path";
import Image from "next/image";
import { useState, useContext, useEffect } from "react";
import StarRating from "@/lib/StarRating";
import { LoginContext } from "@/components/auth/LoginProvider";
import { getEventMainImageUrl, handleImageError } from "@/lib/utils/imageUtils";
import { toggleEventInterest } from "@/lib/api/eventApi";

export default function EventInfo({ eventData, score = 0 }) {
  const [interest, setInterest] = useState(Boolean(eventData?.isInterested));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isLogined } = useContext(LoginContext);
  const [like, setLike] = useState(false);

  // 이벤트 진입 시 localStorage 값이 있으면 우선 적용(상세↔목록 일관성)
  useEffect(() => {
    const id = eventData?.eventId;
    if (!id) return;
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem(`interest:${id}`)
        : null;
    if (saved === "1" || saved === "0") {
      setInterest(saved === "1");
    } else {
      setInterest(Boolean(eventData?.isInterested));
    }
  }, [eventData?.eventId, eventData?.isInterested]);

  const handleInterest = async () => {
    console.log("🔍 EventInfo handleInterest 호출됨");
    console.log("🔍 로그인 상태:", {
      isLogined,
      user,
      eventId: eventData?.eventId,
    });
    console.log("🔍 토큰 확인:", localStorage.getItem("accessToken"));

    if (!isLogined || !user) {
      console.log(" 로그인 필요");
      alert("로그인이 필요합니다.");
      return;
    }

    if (isSubmitting) {
      console.log("⏳ 이미 처리 중...");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await toggleEventInterest(eventData.eventId);
      setInterest((prev) => {
        const next = !prev;

        try {
          localStorage.setItem(
            `interest:${eventData.eventId}`,
            next ? "1" : "0"
          );
        } catch {}

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("interest-changed", {
              detail: { eventId: String(eventData.eventId), interested: next },
            })
          );
        }
        return next;
      });
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
              src={getEventMainImageUrl(eventData, true)} // 고화질 이미지 사용
              alt={eventData.alt || eventData.title || "이벤트 이미지"}
              fill
              className="object-cover"
              onError={handleImageError}
            />
          </div>
          <div className="px-2 py-6 flex justify-between">
            <div className="flex gap-6">
              <div className="flex gap-2 items-center">
                <StarRating
                  rating={eventData.avgRating || eventData.score || score || 0}
                  mode="average"
                  showNumber={true}
                  showStars={true}
                />
              </div>
            </div>
            <div className="flex gap-6">
              <button
                onClick={handleInterest}
                className={`hover:cursor-pointer ${
                  isSubmitting ? "opacity-60 cursor-not-allowed" : ""
                }`}
                disabled={isSubmitting}
                aria-disabled={isSubmitting}>
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
              <button onClick={handleLike}>
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
              <div className="flex flex-col">
                {eventData.priceList?.length > 0 ? (
                  eventData.priceList.map((priceItem, index) => (
                    <span key={index} className="mb-1">
                      {priceItem.type} {priceItem.price}원
                    </span>
                  ))
                ) : (
                  <span>미정</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
