"use client";

import { ICONS } from "@/constants/path";
import Image from "next/image";
import Gallery from "../global/Gallery";
import { getEventTypeLabel } from "@/lib/api/eventApi";
import { toggleTogetherInterest } from "@/lib/api/togetherApi";

export default function TogetherGallery(props) {
  const {
    togetherId,
    imgSrc,
    alt = "",
    title: titleProp = "모집글 제목",
    eventType: eventTypeProp = "이벤트유형",
    eventName: eventNameProp = "이벤트명",
    group: groupProp,
    date: dateProp,

    // 서버 스키마
    id: serverId,
    meetingDate,
    currentParticipants,
    maxParticipants,
    active,

    // 이벤트 스냅샷
    eventSnapshot,

    // 편집/선택 관련 (InterestWith에서 내려줌)
    editMode = false,
    selected = false,
    onToggleSelect,

    // 관심 초기값
    isInterested = false,

    ...rest
  } = props;

  /* 식별자/링크 */
  const id = serverId ?? togetherId;
  const href = id ? `/together/${encodeURIComponent(id)}` : "/together";

  /* 커버 이미지 */
  const coverSrc =
    (typeof imgSrc === "string" && imgSrc.trim()) ||
    eventSnapshot?.eventImage ||
    eventSnapshot?.image ||
    eventSnapshot?.imgSrc ||
    "/img/default_img.svg";

  /* 타이틀/라벨 */
  const title = titleProp || "모집글 제목";
  const eventType =
    getEventTypeLabel(eventSnapshot?.eventType || eventTypeProp) ||
    "이벤트유형";
  const eventName =
    eventSnapshot?.eventName ||
    eventSnapshot?.name ||
    eventNameProp ||
    "이벤트명";

  /* 날짜 */
  const fmtDate = (d) => {
    if (!d) return "0000.00.00";
    const date =
      d.length === 10 && d[4] === "-" ? new Date(d + "T00:00:00") : new Date(d);
    if (Number.isNaN(+date)) return "0000.00.00";
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(
      date.getDate()
    )}`;
  };

  const dateStr = meetingDate
    ? fmtDate(meetingDate)
    : dateProp
    ? fmtDate(dateProp)
    : rest.createdAt
    ? fmtDate(rest.createdAt)
    : "0000.00.00";

  /* 인원 */
  const groupStr = (() => {
    if (currentParticipants != null && maxParticipants != null) {
      return `${currentParticipants}/${maxParticipants}`;
    }
    if (typeof groupProp === "number") return String(groupProp);
    if (typeof groupProp === "string" && groupProp.trim())
      return groupProp.trim();
    const cc = rest.companionCount ?? rest.maxPeople;
    if (cc != null) return String(cc);
    return "명";
  })();

  /* 마감 표시 */
  const isClosed = typeof active === "boolean" ? !active : false;

  /* 하트(관심) 클릭 → API 토글 + 브로드캐스트 */
  const handleInterestClick = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!id) return;

    try {
      const msg = await toggleTogetherInterest(id);
      const interested = /등록/.test(String(msg));
      window.dispatchEvent(
        new CustomEvent("together-interest-changed", {
          detail: { togetherId: String(id), interested },
        })
      );
    } catch (error) {
      console.error("관심 상태 변경 실패:", error);
    }
  };

  return (
    <div className="relative">
      {isClosed && (
        <div className="absolute inset-0 w-full h-full bg-black opacity-10 z-10" />
      )}

      {/* 편집/선택 오버레이 */}
      {editMode && (
        <>
          <button
            type="button"
            className="absolute inset-0 z-20"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSelect?.();
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
        </>
      )}

      <Gallery
        title={title}
        src={coverSrc && coverSrc.trim() !== "" ? coverSrc : null}
        alt={alt || eventName || title}
        href={editMode ? "#" : href}
        enableInterest={!editMode} // 편집 중에는 하트 비활성
        initialInterest={!!isInterested} // 초기 관심 상태 반영
        onClick={handleInterestClick} // 하트 눌렀을 때 API 호출
      >
        <div className="flex items-center gap-2 my-1">
          <div className="border border-b-2 text-blue-600 bg-blue-50 rounded-4xl px-2">
            {eventType}
          </div>
          <div className="truncate">{eventName}</div>
        </div>

        <div className="flex gap-4 mt-2">
          <span className="flex items-center gap-2">
            <Image src={ICONS.CALENDAR} alt="calendar" width={16} height={16} />
            {dateStr}
          </span>
          <span className="flex items-center gap-2">
            <Image src={ICONS.GROUP} alt="group" width={20} height={20} />
            {groupStr}
          </span>
        </div>
      </Gallery>
    </div>
  );
}
