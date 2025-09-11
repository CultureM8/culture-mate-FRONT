"use client";

import StarRating from "@/lib/StarRating";
import { useState, useCallback } from "react";
import Image from "next/image";
import { IMAGES } from "@/constants/path";
import { displayNameFromTriplet } from "@/lib/displayName";

/** 날짜 포맷: YYYY.MM.DD */
const formatDate = (dateString) => {
  if (!dateString) return "00.00.00";
  try {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("ko-KR", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\. /g, ".")
      .replace(/\.$/, "");
  } catch {
    return "00.00.00";
  }
};

/** 상대 경로 → 절대 URL 보정 */
const toAbsoluteUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
  return `${base}${url}`;
};

/** 별점 숫자 안전화 (0~5) */
const toSafeRating = (val) => {
  const n = Number(val);
  if (Number.isNaN(n)) return 0;
  return Math.min(5, Math.max(0, n));
};

export default function EventReviewList(props) {
  const {
    id,
    eventId,
    memberId,
    rating = 0,
    content = "이벤트 후기 내용",
    createdAt,
    updatedAt,
    author,
  } = props || {};

  const [reviewTabExtend, setReviewTabExtend] = useState(false);

  const extendReviewTab = useCallback(() => {
    setReviewTabExtend((v) => !v);
  }, []);

  const onKeyToggle = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        extendReviewTab();
      }
    },
    [extendReviewTab]
  );

  const getUserDisplayName = () => {
    if (!author) return `#${memberId || "unknown"}`;
    return displayNameFromTriplet(
      author.nickname,
      author.loginId,
      author.id || memberId
    );
  };

  const getProfileImageUrl = () => {
    const raw =
      (author?.profileImagePath && author.profileImagePath.trim()) ||
      (author?.thumbnailImagePath && author.thumbnailImagePath.trim()) ||
      "";
    return raw ? toAbsoluteUrl(raw) : IMAGES.GALLERY_DEFAULT_IMG;
  };

  return (
    <div
      className="
        flex justify-between bg-white w-full min-w-[300px] relative 
        border border-gray-200 rounded-2xl p-4
        hover:cursor-pointer
        mb-2
      "
      role="button"
      tabIndex={0}
      onClick={extendReviewTab}
      onKeyDown={onKeyToggle}
      aria-expanded={reviewTabExtend}
      aria-label="후기 펼치기/접기">
      <div className="flex flex-col h-full min-w-0 gap-4">
        <div className="flex gap-4">
          <Image
            src={getProfileImageUrl()}
            alt={getUserDisplayName()}
            width={80}
            height={80}
            className="w-[60px] h-[60px] rounded-full object-cover"
          />
          <div className="flex flex-col flex-1 gap-2">
            <div className="text-gray-700">{getUserDisplayName()}</div>
            <div className="flex gap-2 items-center">
              {/* 별점 */}
              <StarRating
                rating={toSafeRating(rating)}
                mode="display"
                showNumber={true}
                showStars={true}
              />
              <span className="text-gray-300">{formatDate(createdAt)}</span>
            </div>
          </div>
        </div>

        {/* 후기 내용 */}
        <div
          className={`
            text-gray-700 mt-2 leading-relaxed px-2 break-words
            ${!reviewTabExtend ? "overflow-hidden" : "whitespace-pre-line"}
          `}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: reviewTabExtend ? "none" : 1,
            WebkitBoxOrient: "vertical",
            overflow: reviewTabExtend ? "visible" : "hidden",
          }}>
          {content}
        </div>
      </div>

      <div className="flex items-center gap-6 mb-1 flex-shrink-0" />
    </div>
  );
}
