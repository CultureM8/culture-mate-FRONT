"use client";

import StarRating from "@/components/ui/StarRating";
import { useState, useCallback } from "react";
import Image from "next/image";
import { IMAGES, ICONS } from "@/constants/path";
import { displayNameFromTriplet } from "@/lib/utils/displayName";

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
    currentUserId, // 현재 사용자 ID
    onEditReview, // 편집 콜백
    onDeleteReview, // ⬅️ 삭제 콜백 (추가)
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
      (author?.mainImagePath && author.mainImagePath.trim()) ||
      (author?.profileImagePath && author.profileImagePath.trim()) ||
      (author?.thumbnailImagePath && author.thumbnailImagePath.trim()) ||
      "";
    return raw ? toAbsoluteUrl(raw) : IMAGES.GALLERY_DEFAULT_IMG;
  };

  // 내 리뷰인지 판별
  const isMyReview = () => {
    if (!currentUserId) return false;
    const candidateIds = [
      memberId,
      author?.id,
      author?.memberId,
      author?.userId,
    ].filter((id) => id !== undefined && id !== null);

    return candidateIds.some((id) => String(id) === String(currentUserId));
  };

  const isMyReviewFlag = isMyReview();

  return (
    <div
      className={`
        flex justify-between w-full min-w-[300px] relative 
        border rounded-2xl p-4
        hover:cursor-pointer
        mb-2
        ${
          isMyReviewFlag
            ? "bg-gray-50 border-blue-200"
            : "bg-white border-gray-200"
        }
      `}
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
            <div className="flex items-center gap-2">
              {isMyReviewFlag && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  내 리뷰
                </span>
              )}
              <div className="text-gray-700">{getUserDisplayName()}</div>
            </div>
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

      {/* 내 리뷰인 경우: 편집 + 삭제 버튼 */}
      <div className="flex items-center gap-2 mb-1 flex-shrink-0">
        {isMyReviewFlag && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation(); // 펼치기 방지
                onEditReview?.(props);
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="리뷰 수정"
              aria-label="리뷰 수정">
              <Image src={ICONS.EDIT} alt="수정" width={16} height={16} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation(); // 펼치기 방지
                onDeleteReview?.(props);
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="리뷰 삭제"
              aria-label="리뷰 삭제">
              <Image src={ICONS.DELETE} alt="삭제" width={16} height={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
