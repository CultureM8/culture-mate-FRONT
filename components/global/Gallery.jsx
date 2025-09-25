"use client";

import { ICONS, IMAGES } from "@/constants/path";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect, useContext } from "react";
import { LoginContext } from "@/components/auth/LoginProvider";
import { toggleEventInterest } from "@/lib/api/eventApi";
import { toggleTogetherInterest } from "@/lib/api/togetherApi";

export default function Gallery({
  src,
  alt = "이미지",
  title = "제목 없음",
  enableInterest = true,
  onClick, // 하트 클릭 콜백
  href = "",
  children,
  initialInterest = false, // 초기 관심 상태
  eventId, // 이벤트 ID
  togetherId, // 동행 ID
  type = "event", // "event" | "together"
  disableEventSync = false, // 이벤트 동기화 비활성화 여부
  isClosed = false, // 마감 상태
}) {
  const [interest, setInterest] = useState(!!initialInterest);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginContext = useContext(LoginContext);
  const isLogined = loginContext?.isLogined || false;
  const user = loginContext?.user || null;

  useEffect(() => {
    setInterest(!!initialInterest);
  }, [initialInterest]);

  // 관심 상태 변경 이벤트 리스너 (Gallery 컴포넌트 간 동기화)
  useEffect(() => {
    if (!eventId || type !== "event" || disableEventSync) return;

    const handleInterestChanged = (event) => {
      const { eventId: changedEventId, interested } = event.detail;

      if (String(changedEventId) === String(eventId)) {
        console.log(`Gallery - 이벤트 ${eventId} 관심 상태 동기화:`, interested);
        setInterest(Boolean(interested));
      }
    };

    window.addEventListener("event-interest-changed", handleInterestChanged);
    return () => window.removeEventListener("event-interest-changed", handleInterestChanged);
  }, [eventId, type, disableEventSync]);

  // localStorage에서 관심사 상태 동기화 (새로고침 시에도 유지)
  useEffect(() => {
    if (!eventId || type !== "event" || disableEventSync) return;

    // 백엔드 데이터(initialInterest)가 명시적으로 전달된 경우 localStorage보다 우선시
    // initialInterest가 undefined가 아니면 백엔드에서 데이터를 가져온 것으로 간주
    if (initialInterest !== undefined) {
      // 백엔드 데이터로 localStorage 업데이트
      const storageKey = `event_interest_${eventId}`;
      const storageData = {
        eventId: String(eventId),
        interested: Boolean(initialInterest),
        timestamp: Date.now(),
        source: 'backend'
      };
      localStorage.setItem(storageKey, JSON.stringify(storageData));
      return; // localStorage 체크 건너뛰기
    }

    // initialInterest가 undefined인 경우만 localStorage 확인
    const storageKey = `event_interest_${eventId}`;
    const savedData = localStorage.getItem(storageKey);

    if (savedData) {
      try {
        const { interested } = JSON.parse(savedData);
        setInterest(Boolean(interested));
      } catch (error) {
        console.error("localStorage에서 관심사 상태 읽기 실패:", error);
      }
    }

    // storage 이벤트 리스너 (크로스 페이지 동기화)
    const handleStorageChange = (e) => {
      if (!e.key || !e.key.startsWith('event_interest_')) return;

      try {
        const storageData = JSON.parse(e.newValue || '{}');
        const storageEventId = storageData.eventId;

        if (String(storageEventId) === String(eventId)) {
          setInterest(Boolean(storageData.interested));
        }
      } catch (error) {
        console.error("storage 이벤트 처리 실패:", error);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [eventId, type, initialInterest]);

  const initialSrc = useMemo(() => {
    return typeof src === "string" && src.trim().length > 0
      ? src.trim()
      : IMAGES.GALLERY_DEFAULT_IMG;
  }, [src]);

  const [currentSrc, setCurrentSrc] = useState(initialSrc);
  useEffect(() => setCurrentSrc(initialSrc), [initialSrc, src]);

  const interestHandler = async () => {
    console.log("🎯 Gallery interestHandler 호출됨!", {
      type,
      eventId,
      togetherId,
      interest,
      isLogined,
      user: !!user
    });

    // 로그인 확인
    if (!isLogined || !user) {
      console.log("❌ Gallery - 로그인 필요");
      alert("로그인이 필요합니다.");
      return;
    }

    if (isSubmitting) {
      console.log("⏳ Gallery - 이미 처리 중...");
      return;
    }

    // 외부 onClick이 있으면 그것만 실행 (기존 동작 유지)
    if (typeof onClick === "function" && !eventId && !togetherId) {
      console.log("🔄 Gallery - 외부 onClick 콜백만 실행");
      setInterest((prev) => !prev);
      onClick();
      return;
    }

    setIsSubmitting(true);
    try {
      const itemId = type === "together" ? togetherId : eventId;

      if (!itemId) {
        console.log("❌ Gallery - ID가 없음:", { type, eventId, togetherId });
        setInterest((prev) => !prev);
        if (typeof onClick === "function") onClick();
        return;
      }

      let interested = !interest;

      if (type === "event") {
        console.log("🚀 Gallery - 이벤트 관심 토글 API 호출:", itemId);
        const result = await toggleEventInterest(itemId);
        console.log("📨 Gallery - API 응답:", result);

        // 관심 상태 실시간 업데이트 (서버 응답 기준)
        const newInterested = result.includes("등록");
        setInterest(newInterested);

        console.log("📡 Gallery - event-interest-changed 이벤트 발생:", {
          eventId: String(itemId),
          interested: newInterested
        });

        // localStorage에 상태 저장 (새로고침 시에도 유지되도록)
        const storageKey = `event_interest_${itemId}`;
        const storageData = {
          eventId: String(itemId),
          interested: newInterested,
          timestamp: Date.now()
        };
        localStorage.setItem(storageKey, JSON.stringify(storageData));

        // 이벤트 발생을 다음 틱으로 지연 (React 배치 업데이트 이후)
        setTimeout(() => {
          console.log("🚀 Gallery - 지연 이벤트 발생 시작");

          window.dispatchEvent(
            new CustomEvent("event-interest-changed", {
              detail: { eventId: String(itemId), interested: newInterested },
            })
          );

          // 다른 탭/창에 알리기 위한 storage 이벤트 트리거
          window.dispatchEvent(new StorageEvent('storage', {
            key: storageKey,
            newValue: JSON.stringify(storageData),
            storageArea: localStorage
          }));

          console.log("✅ Gallery - 지연 이벤트 발생 완료");
        }, 50); // 50ms 지연으로 React 상태 업데이트 완료 후 실행

      } else if (type === "together") {
        console.log("🚀 Gallery - 동행 관심 토글 API 호출:", itemId);
        const result = await toggleTogetherInterest(itemId);
        console.log("📨 Gallery - API 응답:", result);

        // 관심 상태 실시간 업데이트 (서버 응답 기준)
        const newInterested = result.includes("등록");
        setInterest(newInterested);

        // Together 관심 상태도 localStorage에 저장 (리스트 뷰 동기화용)
        const togetherStorageKey = `together_interest_${itemId}`;
        const togetherStorageData = {
          togetherId: String(itemId),
          interested: newInterested,
          timestamp: Date.now()
        };
        localStorage.setItem(togetherStorageKey, JSON.stringify(togetherStorageData));

        Promise.resolve().then(() => {
          const eventDetail = { togetherId: String(itemId), interested: newInterested };
          window.dispatchEvent(
            new CustomEvent("together-interest-changed", {
              detail: eventDetail,
            })
          );
        });
      }

      // 외부 onClick 콜백도 실행
      if (typeof onClick === "function") onClick();

    } catch (error) {
      console.error("❌ Gallery - 관심 처리 실패:", error);
      alert("관심 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${isClosed ? "bg-gray-100" : "bg-white"} w-[300px] relative`} title={title}>
      {enableInterest && (
        <button
          className={`absolute top-0 left-0 mt-4 ml-4 ${
            interest ? "" : "opacity-30"
          } ${
            isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:cursor-pointer"
          } grayscale-0 z-10`}
          onClick={interestHandler}
          disabled={isSubmitting}
          aria-label="toggle-interest">
          <Image
            src={interest ? ICONS.HEART : ICONS.HEART_EMPTY}
            alt="관심"
            width={28}
            height={28}
          />
        </button>
      )}

      <Link href={href}>
        <div className="mx-[10px] py-[10px] overflow-hidden whitespace-nowrap text-ellipsis text-gray-400">
          <div className="relative">
            <Image
              src={currentSrc}
              alt={alt || title || "이미지"}
              width={200}
              height={150}
              className={`w-[280px] h-[200px] rounded-xl object-cover ${isClosed ? "grayscale" : ""}`}
              onError={() => {
                if (currentSrc !== IMAGES.GALLERY_DEFAULT_IMG) {
                  setCurrentSrc(IMAGES.GALLERY_DEFAULT_IMG);
                }
              }}
              priority={false}
            />
            {isClosed && (
              <div className="absolute inset-0 bg-white/50 rounded-xl pointer-events-none" />
            )}
          </div>
          <div className="px-2">
            <div className={`text-lg font-bold overflow-hidden whitespace-nowrap text-ellipsis ${isClosed ? "text-gray-400" : "text-black"}`}>
              {title}
            </div>
            {children}
          </div>
        </div>
      </Link>
    </div>
  );
}
