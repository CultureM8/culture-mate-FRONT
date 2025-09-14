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
}) {
  const [interest, setInterest] = useState(!!initialInterest);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginContext = useContext(LoginContext);
  const isLogined = loginContext?.isLogined || false;
  const user = loginContext?.user || null;

  useEffect(() => {
    setInterest(!!initialInterest);
  }, [initialInterest]);

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

        // 즉시 로컬 상태 업데이트 (빠른 반응)
        setInterest(interested);

        console.log("📡 Gallery - event-interest-changed 이벤트 발생:", {
          eventId: String(itemId),
          interested
        });

        // 이벤트는 마이크로태스크로 발생 (더 빠른 실행)
        Promise.resolve().then(() => {
          window.dispatchEvent(
            new CustomEvent("event-interest-changed", {
              detail: { eventId: String(itemId), interested },
            })
          );
          console.log("✅ Gallery - 이벤트 발생 완료");
        });

      } else if (type === "together") {
        console.log("🚀 Gallery - 동행 관심 토글 API 호출:", itemId);
        const result = await toggleTogetherInterest(itemId);
        console.log("📨 Gallery - API 응답:", result);

        setInterest(interested);

        Promise.resolve().then(() => {
          window.dispatchEvent(
            new CustomEvent("together-interest-changed", {
              detail: { togetherId: String(itemId), interested },
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
    <div className="bg-white w-[300px] relative" title={title}>
      {enableInterest && (
        <button
          className={`absolute top-0 right-0 mt-4 mr-4 ${
            interest ? "" : "opacity-30"
          } ${
            isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:cursor-pointer"
          }`}
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
          <Image
            src={currentSrc}
            alt={alt || title || "이미지"}
            width={200}
            height={150}
            className="w-[280px] h-[200px] rounded-xl object-cover"
            onError={() => {
              if (currentSrc !== IMAGES.GALLERY_DEFAULT_IMG) {
                setCurrentSrc(IMAGES.GALLERY_DEFAULT_IMG);
              }
            }}
            priority={false}
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
