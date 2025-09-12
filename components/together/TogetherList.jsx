// components/together/TogetherList.jsx
import { ICONS } from "@/constants/path";
import Image from "next/image";
import ListComponent from "../global/ListComponent";

export default function TogetherList(props) {
  const {
    togetherId,
    title,
    eventType,
    eventName,
    date,
    group,
    address,
    hostNickname,
    hostLoginId,
    hostObj,
    host,
    isClosed = false,
    editMode = false,
    selected = false,
    onToggleSelect,
    onCardClick,
    ...rest
  } = props;

  // ✅ 이미지 폴백(여러 키 지원)
  const coverSrc =
    [
      rest.imgSrc,
      rest.eventImage,
      rest.image,
      rest.img,
      rest.eventSnapshot?.eventImage,
    ].find((v) => typeof v === "string" && v.trim()) || "/img/default_img.svg";

  // ✅ 제목 폴백(방이름(dm-...)이면 이벤트명/기본값 사용)
  const rawTitle =
    title ||
    rest.postTitle ||
    rest.togetherTitle ||
    rest.eventSnapshot?.name ||
    eventName ||
    "모집글 제목";

  const safeTitle = /^dm-/.test(String(rawTitle))
    ? eventName || "모집글 제목"
    : rawTitle;

  // ✅ 이벤트/날짜/인원/주소 폴백
  const safeEventType = eventType || rest.eventSnapshot?.eventType || "이벤트";
  const safeEventName =
    eventName || rest.eventSnapshot?.name || rest.eventName || "이벤트명";

  const safeDate = (() => {
    const d = rest.meetingDate || rest.companionDate || date || rest.createdAt;
    if (!d) return "0000.00.00";
    const t = new Date(d);
    return Number.isNaN(t.getTime())
      ? "0000.00.00"
      : t.toISOString().slice(0, 10).replaceAll("-", ".");
  })();

  const safeGroup = (() => {
    const cur = rest.currentParticipants ?? rest.current ?? 1;
    const max = rest.maxParticipants ?? rest.maxPeople ?? 1;
    return `${cur}/${max}`;
  })();

  const safeAddress =
    address || rest.address || rest.eventSnapshot?.location || "모임 장소 정보 없음";

  // ✅ 호스트 표시
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

  // ✅ 식별자/링크 (Gallery와 동일한 패턴)
  const id = rest.id ?? togetherId;
  const href = id ? `/together/${encodeURIComponent(id)}` : "/together";

  return (
    <div className="relative">
      {isClosed && (
        <div className="absolute inset-0 w-full h-full bg-black opacity-10 z-10" />
      )}

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
          {selected && (
            <div className="pointer-events-none absolute inset-0 rounded-lg z-10" />
          )}
        </>
      )}

      <ListComponent
        src={coverSrc && coverSrc.trim() !== "" ? coverSrc : null}
        alt={safeEventName || safeTitle}
        title={safeTitle}
        href={editMode ? "#" : href}>
        <div className="flex flex-col justify-around h-full">
          <div className="flex gap-2">
            <span className="border border-b-2 rounded-4xl px-2 w-fit">
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
