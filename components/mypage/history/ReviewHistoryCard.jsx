"use client";

import Image from "next/image";
import StarScore from "@/lib/StarScore";
import { useState } from "react";

const TYPE_LABELS = {
  MUSICAL: "뮤지컬",
  PLAY: "연극",
  MOVIE: "영화",
  EXHIBITION: "전시",
  "콘서트/페스티벌": "콘서트/페스티벌",
  "클래식/무용": "클래식/무용",
  지역행사: "지역행사",
};

export default function ReviewHistoryCard({
  review,
  variant = "row",
  // 편집 모드 관련 props 추가
  editMode = false,
  selected = false,
  onToggleSelect = null,
  enableInteraction = true,
}) {
  const [reviewTabExtend, setReviewTabExtend] = useState(false);

  const {
    userNickname,
    userProfileImg = "",
    userProfileImgAlt = "프로필 이미지",
    content = "",
    rating = 0,
    score = 0,
    createdAt,
    createdDate,
    event = {},
    memberId,
    member,
    author,
    authorName,
    authorNickname,
    reviewer,
    reviewerName,
    reviewerNickname,
  } = review || {};

  const eventImage =
    event?.image ||
    review?.eventImage ||
    review?.eventImg ||
    review?.imgSrc ||
    "/img/default_img.svg";
  const eventName = event?.name ?? review?.eventName ?? "이벤트";
  const rawType = event?.type ?? review?.eventType ?? "이벤트";
  const eventType = TYPE_LABELS[rawType] ?? rawType;

  // 작성자 정보 처리
  let authorDisplayName = "사용자";
  let authorProfileImage = "";

  // memberId가 있고 member 정보가 있는 경우
  if (member) {
    authorDisplayName =
      member.nickname || member.name || member.loginId || `사용자${memberId}`;
    authorProfileImage = member.profileImage || member.avatar || "";
  } else {
    // 기존 로직
    authorDisplayName =
      userNickname ||
      authorNickname ||
      reviewerNickname ||
      authorName ||
      reviewerName ||
      author?.nickname ||
      author?.name ||
      author?.displayName ||
      author?.login_id ||
      author?.loginId ||
      reviewer?.nickname ||
      reviewer?.name ||
      reviewer?.displayName ||
      (typeof author === "string" ? author : null) ||
      (memberId ? `사용자${memberId}` : "사용자");

    authorProfileImage =
      userProfileImg ||
      author?.profileImage ||
      author?.avatar ||
      reviewer?.profileImage ||
      reviewer?.avatar ||
      "";
  }

  // 백엔드 스키마에 맞춰 rating 우선 사용
  const finalScore = rating || score || 0;

  const formatDate = (v1, v2) => {
    if (v2) return v2; // "YY.MM.DD"가 이미 있으면 그대로
    if (!v1) return "";
    const d = typeof v1 === "string" ? new Date(v1) : v1;
    if (Number.isNaN(d?.getTime?.())) return "";
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}.${mm}.${dd}`;
  };

  const extendReviewTab = () => {
    setReviewTabExtend(!reviewTabExtend);
  };

  // 카드 클릭 핸들러
  const handleCardClick = (e) => {
    e.stopPropagation();
    if (editMode && onToggleSelect) {
      onToggleSelect();
    } else if (enableInteraction) {
      extendReviewTab();
    }
  };

  // === 가로형 레이아웃 ===
  return (
    <div
      className={`w-full bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-sm transition-shadow duration-150 relative hover:cursor-pointer mb-2 ${
        editMode ? "cursor-pointer" : ""
      } ${selected ? "bg-blue-50 border-blue-300" : ""}`}
      onClick={handleCardClick}>
      {/* 편집 모드에서 체크박스 표시 */}
      {editMode && (
        <div className="absolute top-2 right-2 z-30">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border cursor-pointer ${
              selected
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white/90 text-gray-600 border-gray-300"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleSelect) onToggleSelect();
            }}>
            {selected ? "✓" : ""}
          </div>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* 좌: 프로필 */}
        <Image
          src={
            authorProfileImage?.trim()
              ? authorProfileImage
              : "/img/default_img.svg"
          }
          alt={userProfileImgAlt}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          {/* 작성자/날짜 */}
          <div className="flex items-center gap-3">
            <h3 className="font-medium text-[#26282a]">{authorDisplayName}</h3>
            <span className="text-xs text-[#76787a]">
              {formatDate(createdAt, createdDate)}
            </span>
          </div>

          {/* 리뷰 내용 */}
          <div className="mt-1 text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">
            {content}
          </div>

          {/* 이벤트 미니카드: 썸네일/타입/이름 + 별점 */}
          <div className="mt-3 flex items-center gap-4 bg-gray-50 rounded-lg p-3">
            <Image
              src={eventImage}
              alt={`${eventName} 썸네일`}
              width={64}
              height={64}
              className="w-18 h-18 rounded-md object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full flex-shrink-0">
                  {eventType}
                </span>
                <span className="text-sm font-medium text-[#26282a] truncate">
                  {eventName}
                </span>
              </div>
              <div className="mt-4 ml-1">
                <StarScore score={finalScore} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
