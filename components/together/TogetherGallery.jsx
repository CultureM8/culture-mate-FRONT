import { ICONS } from "@/constants/path";
import Image from "next/image";
import Gallery from "../global/Gallery";

/**
 * TogetherGallery
 * - 지원 스키마(동시 호환):
 *   서버: { id, title, eventId, eventSnapshot, meetingDate(YYYY-MM-DD), currentParticipants, maxParticipants, active, createdAt, ... }
 *   더미/로컬: { togetherId, imgSrc, title, eventType, eventName, group, date, ... }
 */
export default function TogetherGallery(props) {
  const {
    // 구형/더미
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

    // 이벤트 스냅샷(이미지/이름/타입 등)
    eventSnapshot,

    // UI
    isClosed: isClosedProp = false,

    // 나머지(로컬 스키마 호환용)
    ...rest
  } = props;

  /* ========== 식별자/링크 ========== */
  const id = serverId ?? togetherId;
  const href = id ? `/together/${encodeURIComponent(id)}` : "/together";

  /* ========== 커버 이미지 ========== */
  const coverSrc =
    (typeof imgSrc === "string" && imgSrc.trim()) ||
    eventSnapshot?.eventImage ||
    eventSnapshot?.image ||
    eventSnapshot?.imgSrc ||
    "/img/default_img.svg";

  /* ========== 제목/이벤트 라벨 ========== */
  const title = titleProp || "모집글 제목";
  const eventType = eventSnapshot?.eventType || eventTypeProp || "이벤트유형";
  const eventName =
    eventSnapshot?.eventName ||
    eventSnapshot?.name ||
    eventNameProp ||
    "이벤트명";

  /* ========== 날짜 표시(서버 meetingDate 우선) ========== */
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

  /* ========== 인원 표시(current/max 우선) ========== */
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

  /* ========== 마감/비활성 표시 ========== */
  const isClosed =
    Boolean(isClosedProp) || (typeof active === "boolean" ? !active : false);

  return (
    <div className="relative">
      {isClosed && (
        <div className="absolute inset-0 w-full h-full bg-black opacity-10 z-10" />
      )}

      <Gallery
        title={title}
        src={coverSrc}
        alt={alt || eventName || title}
        href={href}>
        <div className="flex items-center gap-2">
          <div className="border border-b-2 rounded-4xl px-2">{eventType}</div>
          <div className="truncate">{eventName}</div>
        </div>

        <div className="flex gap-4">
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
