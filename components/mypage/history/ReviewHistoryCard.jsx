"use client";

import Image from "next/image";
import StarRating from "@/lib/StarRating";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TYPE_LABELS = {
  MUSICAL: "뮤지컬",
  PLAY: "연극",
  MOVIE: "영화",
  EXHIBITION: "전시",
  "콘서트/페스티벌": "콘서트/페스티벌",
  "클래식/무용": "클래식/무용",
  지역행사: "지역행사",
};

// 상대경로를 절대경로로 바꿔주는 유틸 (빈 값이면 null)
const toAbs = (v) => {
  if (!v || typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return `http://localhost:8080${s.startsWith("/") ? "" : "/"}${s}`;
};

export default function ReviewHistoryCard({
  review,
  variant = "row",
  // 편집 모드 관련 props
  editMode = false,
  selected = false,
  onToggleSelect = null,
  enableInteraction = true,
}) {
  const [reviewTabExtend, setReviewTabExtend] = useState(false);
  const router = useRouter();

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

  // 1) 이벤트명/타입을 먼저 계산 (alt에서 참조하므로 가장 먼저)
  const eventName = event?.name ?? review?.eventName ?? "이벤트";
  const rawType = event?.type ?? review?.eventType ?? "이벤트";
  const eventType = TYPE_LABELS[rawType] ?? rawType;

  // 2) 이벤트 이미지 원본 경로 수집 → 절대경로화 → 초기값 세팅
  const rawEventImg =
    event?.image ||
    event?.thumbnailImagePath ||
    review?.eventImage ||
    review?.eventImg ||
    review?.imgSrc ||
    ""; // 빈 문자열이면 기본이미지로 대체됨

  const initialEventSrc = toAbs(rawEventImg) || "/img/default_img.svg";
  const [eventImgSrc, setEventImgSrc] = useState(initialEventSrc);

  // 원본 경로가 바뀌면 다시 세팅
  useEffect(() => {
    setEventImgSrc(toAbs(rawEventImg) || "/img/default_img.svg");
  }, [rawEventImg]);

  // 작성자 표시명/프로필
  let authorDisplayName = "사용자";
  let authorProfileImage = "";

  if (member) {
    authorDisplayName =
      member.nickname || member.name || member.loginId || `사용자${memberId}`;
    authorProfileImage = member.profileImage || member.avatar || "";
  } else {
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

  // 백엔드 스키마에 맞춰 rating 우선
  const finalScore = rating || score || 0;

  // 날짜 포맷
  const formatDate = (v1, v2) => {
    if (v2) return v2; // "YY.MM.DD" 형식이 이미 있으면 그대로
    if (!v1) return "";
    const d = typeof v1 === "string" ? new Date(v1) : v1;
    if (Number.isNaN(d?.getTime?.())) return "";
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}.${mm}.${dd}`;
  };

  const extendReviewTab = () => setReviewTabExtend(!reviewTabExtend);

  // 카드 클릭 핸들러 - EventPageClient 리뷰 섹션으로 이동
  const handleCardClick = (e) => {
    e.stopPropagation();
    if (editMode && onToggleSelect) {
      onToggleSelect();
    } else if (enableInteraction) {
      // 이벤트 ID가 있으면 해당 EventPageClient의 후기 탭으로 이동
      const eventId = event?.id || event?.eventId || review?.eventId;
      console.log("ReviewHistoryCard - 클릭된 리뷰 데이터:", review);
      console.log("ReviewHistoryCard - 이벤트 데이터:", event);
      console.log("ReviewHistoryCard - 추출된 eventId:", eventId);

      if (eventId) {
        // URL 파라미터를 사용한 방법도 시도
        const targetUrl = `/events/${eventId}?tab=후기`;
        console.log("ReviewHistoryCard - 이동할 URL:", targetUrl);

        router.push(targetUrl);
      } else {
        console.log(
          "ReviewHistoryCard - eventId가 없어서 탭 확장으로 fallback"
        );
        // 이벤트 ID가 없으면 기존 동작 (탭 확장)
        extendReviewTab();
      }
    }
  };

  // === 가로형 레이아웃 (UI 그대로) ===
  return (
    <div
      className={`w-full bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-sm transition-shadow duration-150 relative hover:cursor-pointer mb-2 ${
        editMode ? "cursor-pointer" : ""
      } ${selected ? "bg-blue-50 border-blue-300" : ""}`}
      onClick={handleCardClick}>
      {/* 편집 모드에서 체크표시 */}
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
        {/* 좌: 프로필 (기본이미지는 기존대로 잘 뜨므로 유지) */}
        <Image
          src={
            authorProfileImage && authorProfileImage.trim()
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
            {/* next/image 유지 + 최적화 우회(403 회피), 실패 시 기본이미지 폴백 */}
            <Image
              src={eventImgSrc}
              alt={`${eventName} 썸네일`}
              width={64}
              height={64}
              className="w-18 h-18 rounded-md object-cover flex-shrink-0"
              unoptimized
              onError={() => setEventImgSrc("/img/default_img.svg")}
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
                <StarRating
                  rating={finalScore}
                  mode="display"
                  showNumber={true}
                  showStars={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
