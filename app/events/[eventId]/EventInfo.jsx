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

  // 백엔드 데이터로 관심 상태 초기화 및 실시간 동기화
  useEffect(() => {
    if (!eventData?.eventId) return;

    console.log("EventInfo - 초기화:", {
      eventId: eventData.eventId,
      isInterested: eventData?.isInterested
    });

    // 초기 상태 설정
    setInterest(Boolean(eventData?.isInterested));

    const handleInterestChanged = (event) => {
      const { eventId: changedEventId, interested } = event.detail;

      console.log("EventInfo - event-interest-changed 이벤트 수신:", {
        changedEventId,
        currentEventId: eventData.eventId,
        interested
      });

      if (String(changedEventId) === String(eventData.eventId)) {
        console.log("EventInfo - 관심 상태 업데이트:", interested);

        // 즉시 상태 업데이트 (이벤트 리스너 내부이므로 안전)
        setInterest(Boolean(interested));
      }
    };

    window.addEventListener("event-interest-changed", handleInterestChanged);
    return () => window.removeEventListener("event-interest-changed", handleInterestChanged);
  }, [eventData?.eventId, eventData?.isInterested]);

  // 페이지 포커스 시 백엔드에서 최신 관심 상태 동기화
  useEffect(() => {
    if (!eventData?.eventId) return;

    const syncInterestState = async () => {
      try {
        const { getEventById } = await import("@/lib/api/eventApi");
        const latestData = await getEventById(eventData.eventId);
        console.log("EventInfo - 최신 관심 상태 동기화:", latestData?.isInterested);
        setInterest(Boolean(latestData?.isInterested));
      } catch (error) {
        console.error("관심 상태 동기화 실패:", error);
      }
    };

    const handleFocus = () => {
      console.log("페이지 포커스 - 관심 상태 동기화");
      syncInterestState();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("페이지 가시성 변경 - 관심 상태 동기화");
        syncInterestState();
      }
    };

    // localStorage 변경 감지 (크로스 페이지 동기화)
    const handleStorageChange = (e) => {
      console.log("📨 EventInfo - storage 이벤트 수신:", {
        key: e.key,
        newValue: e.newValue,
        eventId: eventData.eventId
      });

      if (!e.key || !e.key.startsWith('event_interest_')) {
        console.log("❌ EventInfo - event_interest_ 키가 아님, 무시");
        return;
      }

      try {
        const storageData = JSON.parse(e.newValue || '{}');
        const storageEventId = storageData.eventId;

        console.log("📊 EventInfo - storage 데이터 파싱:", {
          storageEventId,
          currentEventId: eventData.eventId,
          interested: storageData.interested
        });

        if (String(storageEventId) === String(eventData.eventId)) {
          console.log("✅ EventInfo - localStorage 관심 상태 변경 감지:", storageData.interested);
          setInterest(Boolean(storageData.interested));
        } else {
          console.log("❌ EventInfo - 다른 이벤트의 관심 상태 변경, 무시");
        }
      } catch (error) {
        console.error("❌ localStorage 관심 상태 파싱 실패:", error);
      }
    };

    // 페이지 포커스와 가시성 변경 이벤트 리스너
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [eventData?.eventId]);

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

        // 같은 페이지 내 다른 컴포넌트들에게 브로드캐스트 (마이크로태스크로 빠른 실행)
        if (typeof window !== "undefined") {
          Promise.resolve().then(() => {
            window.dispatchEvent(
              new CustomEvent("event-interest-changed", {
                detail: { eventId: String(eventData.eventId), interested: next },
              })
            );
          });

          // 크로스 페이지 동기화를 위한 localStorage 저장
          const storageKey = `event_interest_${eventData.eventId}`;
          const storageData = {
            eventId: String(eventData.eventId),
            interested: next,
            timestamp: Date.now()
          };
          localStorage.setItem(storageKey, JSON.stringify(storageData));

          // 다른 탭/창에 알리기 위한 storage 이벤트 트리거
          window.dispatchEvent(new StorageEvent('storage', {
            key: storageKey,
            newValue: JSON.stringify(storageData),
            storageArea: localStorage
          }));
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
