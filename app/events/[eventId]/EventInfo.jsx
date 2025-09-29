"use client";

import { ICONS } from "@/constants/path";
import Image from "next/image";
import { useState, useContext, useEffect } from "react";
import StarRating from "@/components/ui/StarRating";
import { LoginContext } from "@/components/auth/LoginProvider";
import { getEventMainImageUrl, handleImageError } from "@/lib/utils/imageUtils";
import { toggleEventInterest } from "@/lib/api/eventApi";

export default function EventInfo({ eventData, score = 0 }) {
  const [interest, setInterest] = useState(Boolean(eventData?.isInterested));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isLogined } = useContext(LoginContext);
  const [like, setLike] = useState(false);

  // 백엔드 데이터로 관심 상태 초기화
  useEffect(() => {
    if (!eventData?.eventId) return;

    console.log("EventInfo - 초기화:", {
      eventId: eventData.eventId,
      isInterested: eventData?.isInterested,
    });

    // 초기 상태 설정
    setInterest(Boolean(eventData?.isInterested));
  }, [eventData?.eventId, eventData?.isInterested]);

  // 관심 상태 변경 이벤트 리스너
  useEffect(() => {
    if (!eventData?.eventId) return;

    const handleInterestChanged = (event) => {
      const { eventId: changedEventId, interested } = event.detail;

      console.log("EventInfo - event-interest-changed 이벤트 수신:", {
        changedEventId,
        currentEventId: eventData.eventId,
        interested,
      });

      if (String(changedEventId) === String(eventData.eventId)) {
        console.log("EventInfo - 관심 상태 업데이트:", interested);
        setInterest(Boolean(interested));
      }
    };

    window.addEventListener("event-interest-changed", handleInterestChanged);
    return () =>
      window.removeEventListener(
        "event-interest-changed",
        handleInterestChanged
      );
  }, [eventData?.eventId]);

  // 페이지 포커스 시 최신 관심 상태 동기화
  useEffect(() => {
    if (!eventData?.eventId) return;

    const handleFocus = async () => {
      try {
        const { getEventById } = await import("@/lib/api/eventApi");
        const latestData = await getEventById(eventData.eventId);
        console.log("EventInfo - 포커스 시 최신 관심 상태:", latestData?.isInterested);
        setInterest(Boolean(latestData?.isInterested));
      } catch (error) {
        console.error("관심 상태 동기화 실패:", error);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [eventData?.eventId]);

  const handleInterest = async () => {
    console.log("🔍 EventInfo handleInterest 호출됨");

    if (!isLogined || !user) {
      console.log("❌ 로그인 필요");
      alert("로그인이 필요합니다.");
      return;
    }

    if (isSubmitting) {
      console.log("⏳ 이미 처리 중...");
      return;
    }

    setIsSubmitting(true);

    // 낙관적 업데이트 (즉시 UI 반영)
    const previousInterest = interest;
    const newInterest = !previousInterest;
    setInterest(newInterest);

    try {
      const result = await toggleEventInterest(eventData.eventId);
      console.log("✅ 관심 등록/해제 성공:", result);

      // 다른 컴포넌트들에게 상태 변경 알림
      console.log("🚀 EventInfo - 이벤트 발생 시작:", {
        eventId: eventData.eventId,
        interested: newInterest
      });

      // localStorage에 상태 저장 (크로스 페이지 동기화)
      const storageKey = `event_interest_${eventData.eventId}`;
      const storageData = {
        eventId: String(eventData.eventId),
        interested: newInterest,
        timestamp: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(storageData));

      // 이벤트 발생
      window.dispatchEvent(
        new CustomEvent("event-interest-changed", {
          detail: {
            eventId: String(eventData.eventId),
            interested: newInterest,
          },
        })
      );

      // 다른 탭/창에 알리기 위한 storage 이벤트도 트리거
      window.dispatchEvent(new StorageEvent('storage', {
        key: storageKey,
        newValue: JSON.stringify(storageData),
        storageArea: localStorage
      }));

      console.log("✅ EventInfo - 이벤트 발생 완료");
    } catch (error) {
      console.error("❌ 관심 등록/해제 실패:", error);

      // 실패 시 이전 상태로 롤백
      setInterest(previousInterest);
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

  // 디버깅: 이미지 경로 확인
  console.log("EventInfo - eventData 이미지 필드들:", {
    mainImagePath: eventData.mainImagePath,
    thumbnailImagePath: eventData.thumbnailImagePath,
    imgSrc: eventData.imgSrc,
    mainImageUrl: eventData.mainImageUrl,
    imageUrl: eventData.imageUrl,
    image: eventData.image,
  });

  // 유틸에 우선순위 완전 위임 (main > thumb > fallback), false = 메인 이미지 우선
  const finalImageUrl = getEventMainImageUrl(eventData, false);
  console.log("EventInfo - 최종 사용될 이미지 URL:", finalImageUrl);

  return (
    <>
      <h1 className="text-4xl font-bold mb-4 px-6 h-16 py-[10px]">
        {eventData.eventType}
      </h1>

      <div className="flex">
        <div className="p-4">
          <div className="overflow-hidden rounded-lg">
            <Image
              src={finalImageUrl} // 메인 이미지 사용 (mainImagePath 우선)
              alt={eventData.alt || eventData.title || "이벤트 이미지"}
              width={800}
              height={1000}
              className="w-[400px] h-[500px] object-cover"
              onError={handleImageError}
              quality={100}
              priority
              unoptimized
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
              <div className="flex flex-col gap-2">
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
