import { ICONS } from "@/constants/path";
import Image from "next/image";
import ListComponent from "../global/ListComponent";
import { getEventTypeLabel } from "@/lib/api/eventApi";
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

    ...rest
  } = props;

  // ----------------- [추가] 날짜 유틸 -----------------
  // "YYYY-MM-DD"면 로컬기준 그 날의 23:59:59.999까지 유효로 본다.
  const isPastDay = (raw) => {
    if (!raw) return false;
    if (typeof raw === "string" && raw.length === 10 && raw[4] === "-") {
      const y = Number(raw.slice(0, 4));
      const m = Number(raw.slice(5, 7)) - 1;
      const d = Number(raw.slice(8, 10));
      const endOfDay = new Date(y, m, d, 23, 59, 59, 999); // local EOD
      return endOfDay.getTime() < Date.now();
    }
    const t = new Date(raw);
    return Number.isFinite(t.getTime()) ? t.getTime() < Date.now() : false;
  };

  const parseDate = (d) => {
    if (!d) return null;
    // 날짜만 있으면 로컬 자정 기준으로 파싱되도록 T00:00:00 부여
    const iso = d.length === 10 && d[4] === "-" ? `${d}T00:00:00` : d;
    const t = new Date(iso);
    return Number.isNaN(+t) ? null : t;
  };
  // ---------------------------------------------------

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

  // 기간지남(오늘은 포함 X)
  const isExpired = isPastDay(
    meetingDate ?? companionDate ?? date ?? createdAt
  );

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

  // 모집 상태
  const cur = currentParticipants ?? current ?? 0;
  const max = maxParticipants ?? maxPeople ?? 0;
  const isFull = max > 0 && cur >= max;

  // active 가 props에 없을 수도 있으니 보수적으로 true
  const isRecruiting = typeof rest.active === "boolean" ? rest.active : true;

  // 기간이 지나지 않았고(=진행 중 날짜) + 마감 또는 정원초과면 배지 표시
  const showClosedBadge = !isExpired && (!isRecruiting || isFull);

  //  관심 기능 핸들러
  const handleInterestClick = async () => {
    if (!componentId) {
      console.error("TogetherList: componentId가 없습니다.");
      return;
    }

    try {
      const result = await toggleTogetherInterest(componentId);
      console.log("관심 상태 변경:", result);

      // 관심 상태 변경 이벤트 발생
      const eventDetail = {
        togetherId: componentId,
        interested: result.includes("등록"),
      };

      window.dispatchEvent(
        new CustomEvent("together-interest-changed", { detail: eventDetail })
      );
    } catch (error) {
      console.error("관심 상태 변경 실패:", error);
    }
  };

  return (
    <div className={`relative ${isExpired ? "grayscale" : ""}`}>
      {showClosedBadge && (
        <div className="absolute top-2 left-2 z-30">
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-600 text-white text-xs font-bold">
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
        isInterested={isInterested}
        onInterestClick={handleInterestClick}>
        <div className="flex flex-col justify-around h-full">
            <div className="flex gap-2">
              <span className="border border-b-2 text-blue-600 bg-blue-50 rounded-4xl px-2 w-fit">
                {safeEventType}
              </span>
              <strong>{safeEventName}</strong>
            </div>
            <h3 className="text-lg font-bold overflow-hidden whitespace-nowrap text-ellipsis text-black">
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
