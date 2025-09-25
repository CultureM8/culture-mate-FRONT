"use client";

import { ICONS } from "@/constants/path";
import Image from "next/image";
import { useState, useEffect } from "react";
import ListComponent from "../global/ListComponent";
import { getEventTypeLabel } from "@/constants/eventTypes";
import { getEventMainImageUrl } from "@/lib/utils/imageUtils";
import { toggleEventInterest } from "@/lib/api/eventApi";
import StarRating from "@/lib/StarRating";

export default function EventList(props) {
  const {
    eventId,
    id,
    title,
    eventType,
    startDate,
    endDate,
    location,
    eventLocation,
    region,
    avgRating,
    score,
    interestCount,
    reviewCount, // 리뷰수 필드 추가

    // 이미지 관련
    imgSrc,
    mainImagePath,
    thumbnailImagePath,
    mainImageUrl,
    imageUrl,
    image,

    // UI 상태
    editMode = false,
    selected = false,
    onToggleSelect,
    onCardClick,
    isInterested = false,

    ...rest
  } = props;

  // 관심 상태 관리 - TogetherList와 동일한 패턴
  const [currentInterested, setCurrentInterested] = useState(isInterested);
  const [currentInterestCount, setCurrentInterestCount] = useState(interestCount || 0);

  // props가 변경될 때 상태 동기화
  useEffect(() => {
    setCurrentInterested(isInterested);
  }, [isInterested]);

  useEffect(() => {
    setCurrentInterestCount(interestCount || 0);
  }, [interestCount]);

  // 날짜 파싱 함수
  const parseDate = (d) => {
    if (!d) return null;
    // 날짜만 있으면 로컬 자정 기준으로 파싱되도록 T00:00:00 부여
    const iso = d.length === 10 && d[4] === "-" ? `${d}T00:00:00` : d;
    const t = new Date(iso);
    return Number.isNaN(+t) ? null : t;
  };

  // 이미지 처리 - TogetherList와 동일한 방식
  const eventData = {
    mainImagePath,
    thumbnailImagePath,
    mainImageUrl,
    imgSrc,
    imageUrl,
    image
  };

  const coverSrc = getEventMainImageUrl(eventData, true) || "/img/default_img.svg";

  // 제목 처리
  const safeTitle = title || "이벤트 제목";

  // 이벤트 타입 처리
  const safeEventType = getEventTypeLabel(eventType) || "이벤트";

  // 날짜 처리 - events/page.jsx의 로직과 동일
  const safeStartDate = (() => {
    const d = parseDate(startDate);
    if (!d) return "0000.00.00";
    return d.toISOString().slice(0, 10).replaceAll("-", ".");
  })();

  const safeEndDate = (() => {
    const d = parseDate(endDate);
    if (!d) return "0000.00.00";
    return d.toISOString().slice(0, 10).replaceAll("-", ".");
  })();

  // 날짜 범위 표시 (시작일과 종료일이 같으면 하나만 표시)
  const dateRange = safeStartDate === safeEndDate
    ? safeStartDate
    : `${safeStartDate} ~ ${safeEndDate}`;

  // 위치 처리 - events/page.jsx의 toLocation과 동일한 로직
  const safeLocation = (() => {
    if (location && typeof location === "string" && location.trim()) {
      return location;
    }

    if (region) {
      // 백엔드 RegionDto.Response 구조 (level1, level2, level3)
      const level1 = typeof region.level1 === "string" ? region.level1.trim() : "";
      const level2 = typeof region.level2 === "string" ? region.level2.trim() : "";
      const level3 = typeof region.level3 === "string" ? region.level3.trim() : "";

      // 기존 구조 호환성 (city, district)
      const city = typeof region.city === "string" ? region.city.trim() : "";
      const district = typeof region.district === "string" ? region.district.trim() : "";

      // level 구조를 우선 사용, 없으면 기존 구조 사용
      const parts = level1 || level2 || level3
        ? [level1, level2, level3].filter(Boolean)
        : [city, district].filter(Boolean);

      if (parts.length > 0) return parts.join(" ");
    }

    return (eventLocation && String(eventLocation).trim()) || "미정";
  })();

  // 평점 처리
  const ratingValue = Number(avgRating || score || 0);

  // 관심수 처리
  const safeInterestCount = interestCount || 0;

  // 리뷰수 처리
  const safeReviewCount = reviewCount || 0;

  // 식별자 및 링크
  const componentId = eventId || id;
  const href = componentId ? `/events/${encodeURIComponent(componentId)}` : "/events";

  // 관심 기능 핸들러 - 실시간 상태 업데이트 포함
  const handleInterestClick = async () => {
    if (!componentId) {
      console.error("EventList: componentId가 없습니다.");
      return;
    }

    try {
      const result = await toggleEventInterest(componentId);
      console.log("이벤트 관심 상태 변경:", result);

      // 관심 상태 실시간 업데이트
      const newInterested = result.includes("등록");
      setCurrentInterested(newInterested);

      // 관심수 실시간 업데이트 (관심 등록시 +1, 취소시 -1)
      setCurrentInterestCount(prev => newInterested ? prev + 1 : prev - 1);

      // 관심 상태 변경 이벤트 발생
      const eventDetail = {
        eventId: componentId,
        interested: newInterested,
      };

      window.dispatchEvent(
        new CustomEvent("event-interest-changed", { detail: eventDetail })
      );
    } catch (error) {
      console.error("이벤트 관심 상태 변경 실패:", error);
    }
  };

  return (
    <div className="relative">
      {/* 편집 모드 오버레이 - TogetherList와 동일 */}
      {editMode && (
        <>
          <button
            type="button"
            className="absolute inset-0 z-20"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSelect?.(componentId);
            }}
            aria-label="select-card"
          />
          <div className="absolute top-2 right-2 z-30">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                selected
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white/90 text-gray-600 border-gray-300"
              }`}>
              {selected ? "✓" : ""}
            </div>
          </div>
          {selected && (
            <div className="pointer-events-none absolute inset-0 rounded-lg z-10" />
          )}
        </>
      )}

      <ListComponent
        src={coverSrc}
        alt={safeTitle}
        title={safeTitle}
        onClick={onCardClick}
        href={onCardClick ? undefined : (editMode ? "#" : href)}
        enableInterest={!editMode}
        isInterested={currentInterested}
        onInterestClick={handleInterestClick}>

        <div className="flex flex-col justify-around h-full">
          {/* 이벤트 타입 + 제목 한 줄에 표시 */}
          <div className="flex gap-2 items-center mb-2">
            <span className="border border-b-2 text-purple-600 bg-purple-50 rounded-4xl px-2 w-fit text-sm flex-shrink-0">
              {safeEventType}
            </span>
            <h3 className="text-lg font-bold overflow-hidden whitespace-nowrap text-ellipsis text-black min-w-0">
              {safeTitle}
            </h3>
          </div>

          {/* 위치 정보 */}
          <div className="flex items-center gap-2 mb-2 text-sm">
            <Image
              src={ICONS.PIN}
              alt="location"
              width={16}
              height={16}
              className="flex-shrink-0"
            />
            <span className="truncate text-gray-600" title={safeLocation}>
              {safeLocation}
            </span>
          </div>

          {/* 날짜 정보 */}
          <div className="flex items-center gap-2 mb-2 text-sm">
            <Image
              src={ICONS.CALENDAR}
              alt="calendar"
              width={16}
              height={16}
              className="flex-shrink-0"
            />
            <span className="text-gray-600">{dateRange}</span>
          </div>

          {/* 평점, 리뷰수, 관심수 정보 */}
          <div className="flex gap-4 items-center text-sm text-gray-600">
            <span className="flex items-center gap-1">
              ★{ratingValue.toFixed(1)} (리뷰수: {safeReviewCount}개)
            </span>
            <span className="flex items-center gap-1">
              ♥관심수 : {currentInterestCount.toLocaleString()}개
            </span>
          </div>
        </div>
      </ListComponent>
    </div>
  );
}