"use client";

import { ICONS, IMAGES } from "@/constants/path";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect, useContext } from "react";
import { LoginContext } from "@/components/auth/LoginProvider";
import { toggleEventInterest } from "@/lib/api/eventApi";

export default function Gallery({
  src,
  alt = "이미지",
  title = "제목 없음",
  enableInterest = true,
  onClick,
  href = "",
  children,
  initialInterest = false,
  eventId,
}) {
  const [interest, setInterest] = useState(Boolean(initialInterest));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 로그인 컨텍스트
  const loginContext = useContext(LoginContext);
  const isLogined = loginContext?.isLogined || false;
  const user = loginContext?.user || null;

  const initialSrc = useMemo(() => {
    return typeof src === "string" && src.trim().length > 0
      ? src.trim()
      : IMAGES.GALLERY_DEFAULT_IMG; // /public/default_img.svg
  }, [src]);

  const [currentSrc, setCurrentSrc] = useState(initialSrc);

  // 초기 prop이 바뀌면 반영(리스트 재로드 등)
  useEffect(() => {
    setInterest(Boolean(initialInterest));
  }, [initialInterest]);

  // 상세 페이지에서 발생한 관심 변경(브로드캐스트)을 수신하여 즉시 반영
  useEffect(() => {
    if (!eventId) return;
    const handler = (e) => {
      const d = e?.detail;
      if (!d) return;
      if (String(d.eventId) !== String(eventId)) return;
      setInterest(Boolean(d.interested));
    };
    window.addEventListener("interest-changed", handler);
    return () => window.removeEventListener("interest-changed", handler);
  }, [eventId]);

  // 새로고침/라우팅 복귀 시 로컬 저장값이 있으면 우선 적용
  useEffect(() => {
    if (!eventId) return;
    try {
      const saved = localStorage.getItem(`interest:${eventId}`);
      if (saved === "1" || saved === "0") {
        setInterest(saved === "1");
      }
    } catch {}
  }, [eventId]);

  // src가 변경될 때 currentSrc도 업데이트
  useEffect(() => {
    console.log("Gallery - src changed:", src, "-> initialSrc:", initialSrc);
    setCurrentSrc(initialSrc);
  }, [initialSrc, src]);

  const interestHandler = async () => {
    console.log(" Gallery interestHandler 호출됨");
    console.log(" 로그인 상태:", { isLogined, user, eventId });
    console.log(" 토큰 확인:", localStorage.getItem("accessToken"));

    if (!isLogined || !user) {
      console.log(" 로그인 필요");
      alert("로그인이 필요합니다.");
      return;
    }

    if (!eventId) {
      console.warn(" eventId가 없어서 관심 등록/해제를 할 수 없습니다.");
      return;
    }

    if (isSubmitting) {
      console.log(" 이미 처리 중...");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await toggleEventInterest(eventId);
      setInterest((prev) => {
        const next = !prev;

        // localStorage에 저장
        try {
          localStorage.setItem(`interest:${eventId}`, next ? "1" : "0");
        } catch {}

        // 다른 컴포넌트들에게 브로드캐스트
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("interest-changed", {
              detail: { eventId: String(eventId), interested: next },
            })
          );
        }
        return next;
      });

      console.log("관심 등록/해제 결과:", result);

      // 기존 onClick 콜백도 실행
      if (typeof onClick === "function") onClick();
    } catch (error) {
      console.error("관심 등록/해제 실패:", error);
      alert("관심 등록/해제에 실패했습니다.");
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
            isSubmitting
              ? "opacity-60 cursor-not-allowed"
              : "hover:cursor-pointer"
          }`}
          onClick={interestHandler}
          disabled={isSubmitting}
          aria-disabled={isSubmitting}>
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
              // 무한 루프 방지: 이미 기본이미지면 그대로 유지
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
