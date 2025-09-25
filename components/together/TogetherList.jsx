import { ICONS } from "@/constants/path";
import Image from "next/image";
import { useState, useEffect } from "react";
import ListComponent from "../global/ListComponent";
import { getEventTypeLabel } from "@/constants/eventTypes";
import { toggleTogetherInterest } from "@/lib/api/togetherApi";

export default function TogetherList(props) {
  const {
    togetherId,
    title,
    eventType,
    eventName,
    date,
    group,
    address,

    // 호스트 정보
    hostNickname,
    hostLoginId,
    hostObj,
    host,

    // 역할 정보
    isHost = false,

    // UI 상태
    editMode = false,
    selected = false,
    onToggleSelect,
    onCardClick,
    isInterested = false,
    interestCount = 0,

    id,
    imgSrc,
    eventImage,
    image,
    img,
    eventSnapshot,
    postTitle,
    togetherTitle,
    meetingDate,
    companionDate,
    createdAt,
    currentParticipants,
    current,
    maxParticipants,
    maxPeople,
    meetingLocation,
    region,

    // 마감 상태 (명시적으로 전달되면 우선 사용)
    isClosed: explicitIsClosed,

    ...rest
  } = props;

  // 관심 상태 관리 - EventList와 동일한 패턴
  const [currentInterested, setCurrentInterested] = useState(isInterested);
  const [currentInterestCount, setCurrentInterestCount] = useState(interestCount || 0);

  // props가 변경될 때 상태 동기화
  useEffect(() => {
    setCurrentInterested(isInterested);
  }, [isInterested]);

  useEffect(() => {
    setCurrentInterestCount(interestCount || 0);
  }, [interestCount]);

  const parseDate = (d) => {
    if (!d) return null;
    // 날짜만 있으면 로컬 자정 기준으로 파싱되도록 T00:00:00 부여
    const iso = d.length === 10 && d[4] === "-" ? `${d}T00:00:00` : d;
    const t = new Date(iso);
    return Number.isNaN(+t) ? null : t;
  };

  //  이미지 폴백
  const coverSrc =
    [imgSrc, eventImage, image, img, eventSnapshot?.eventImage].find(
      (v) => typeof v === "string" && v.trim()
    ) || "/img/default_img.svg";

  const rawTitle =
    title ||
    postTitle ||
    togetherTitle ||
    eventSnapshot?.name ||
    eventName ||
    "모집글 제목";

  const safeTitle = /^dm-/.test(String(rawTitle))
    ? eventName || "모집글 제목"
    : rawTitle;

  //  이벤트/날짜/인원/주소
  const safeEventType =
    getEventTypeLabel(eventType || eventSnapshot?.eventType) || "이벤트";
  const safeEventName =
    eventName || eventSnapshot?.name || eventName || "이벤트명";

  const safeDate = (() => {
    const d = meetingDate || companionDate || date || createdAt;
    const t = parseDate(d);
    if (!t) return "0000.00.00";
    return t.toISOString().slice(0, 10).replaceAll("-", ".");
  })();

  const safeGroup = (() => {
    const cur = currentParticipants ?? current ?? 1;
    const max = maxParticipants ?? maxPeople ?? 1;
    return `${cur}/${max}`;
  })();

  const safeAddress = (() => {
    const regionString = region
      ? `${region.level1 || ""} ${region.level2 || ""} ${
          region.level3 || ""
        }`.trim()
      : null;

    const parts = [];
    if (regionString) parts.push(regionString);
    if (meetingLocation) parts.push(meetingLocation);

    if (parts.length > 0) return parts.join(" | ");
    return address || eventSnapshot?.location || "모임 장소 정보 없음";
  })();

  //  호스트 표시
  const hostAsObj = typeof host === "object" && host ? host : hostObj;
  const hostAsStr = typeof host === "string" ? host : "";
  const displayHost =
    [
      hostNickname,
      hostAsObj?.display_name,
      hostAsObj?.nickname,
      hostLoginId,
      hostAsObj?.login_id,
      hostAsStr,
    ]
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .find(Boolean) || "-";

  //  식별자/링크
  const componentId = id ?? togetherId;
  const href = componentId
    ? `/together/${encodeURIComponent(componentId)}`
    : "/together";

  // Events와 동일한 단순 패턴 - 페이지 레벨에서 동기화 처리

  // 백엔드에서 계산된 active 상태를 그대로 사용
  const isClosed = typeof explicitIsClosed === "boolean" ? explicitIsClosed : !rest.active;


  //  관심 기능 핸들러 - 실시간 상태 업데이트 포함
  const handleInterestClick = async () => {
    if (!componentId) {
      console.error("TogetherList: componentId가 없습니다.");
      return;
    }

    try {
      const result = await toggleTogetherInterest(componentId);
      console.log("동행모집 관심 상태 변경:", result);

      // 관심 상태 실시간 업데이트
      const newInterested = result.includes("등록");
      setCurrentInterested(newInterested);

      // 관심수 실시간 업데이트 (관심 등록시 +1, 취소시 -1)
      setCurrentInterestCount(prev => newInterested ? prev + 1 : prev - 1);

      // 관심 상태 변경 이벤트 발생
      const eventDetail = {
        togetherId: String(componentId),
        interested: newInterested,
      };

      window.dispatchEvent(
        new CustomEvent("together-interest-changed", { detail: eventDetail })
      );
    } catch (error) {
      console.error("동행모집 관심 상태 변경 실패:", error);
    }
  };

  return (
    <div className="relative">
      {isClosed && (
        <div className="absolute top-2 right-2 z-30">
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-600 text-white text-xs font-bold grayscale-0">
            모집마감
          </span>
        </div>
      )}

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
        src={coverSrc && coverSrc.trim() !== "" ? coverSrc : null}
        alt={safeEventName || safeTitle}
        title={safeTitle}
        onClick={onCardClick}
        href={onCardClick ? undefined : (editMode ? "#" : href)}
        enableInterest={!editMode}
        isInterested={currentInterested}
        onInterestClick={handleInterestClick}
        isClosed={isClosed}>
        <div className="flex flex-col justify-around h-full">
            <div className="flex gap-2">
              <span className="border border-b-2 text-blue-600 bg-blue-50 rounded-4xl px-2 w-fit">
                {safeEventType}
              </span>
              <strong>{safeEventName}</strong>
            </div>
            <h3 className={`text-lg font-bold overflow-hidden whitespace-nowrap text-ellipsis ${isClosed ? "text-gray-400" : "text-black"}`}>
              {safeTitle}
            </h3>
            <div className="flex gap-4 shrink-0 w-full">
              <span className="flex items-center gap-2 flex-shrink-0">
                <Image
                  src={ICONS.CALENDAR}
                  alt="calendar"
                  width={16}
                  height={16}
                />
                {safeDate}
              </span>
              <span className="flex items-center gap-2 flex-shrink-0">
                <Image src={ICONS.GROUP} alt="group" width={20} height={20} />
                {safeGroup}
              </span>
              <span className="flex items-center gap-2 flex-shrink-0">
                <Image src={ICONS.PIN} alt="pin" width={16} height={16} />
                {safeAddress}
              </span>
            </div>
            <div>작성자 : {displayHost}</div>
        </div>
      </ListComponent>
    </div>
  );
}
