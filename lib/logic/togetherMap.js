// lib/togetherMap.js
export const fmtDateDot = (iso) => {
  if (!iso) return "0000.00.00";
  const d = new Date(iso);
  if (Number.isNaN(+d)) return "0000.00.00";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
};

// "00 명", "10명+" → 0/10 같은 숫자
export const parseCount = (v) => {
  const m = String(v ?? "").match(/\d+/);
  return m ? Number(m[0]) : 0;
};

// 로컬 저장된 동행 글 → 카드/리스트 공용 스키마
export const postToUI = (p = {}) => {
  const s = p.eventSnapshot || {};
  const img = s.eventImage ?? s.image ?? s.imgSrc ?? "/img/default_img.svg";
  const type = s.eventType ?? s.type ?? "이벤트유형";
  const name = s.eventName ?? s.name ?? "이벤트명";
  const max = p.companionCount ?? p.maxPeople ?? 0;
  const cur = p.currentPeople ?? 0;
  const group = max ? `${cur}/${max}` : "00/00";

  return {
    togetherId: String(p.id ?? ""),
    imgSrc: img,
    title: p.title || "모집글 제목",
    eventType: type,
    eventName: name,
    group,
    date: fmtDateDot(p.companionDate ?? p.createdAt),
    isClosed: false,
  };
};

// 원격/더미 데이터 → 공용 스키마 (이미 맞으면 그대로 통과)
export const dataToUI = (x = {}) => ({
  togetherId: String(x.togetherId ?? x.id ?? ""),
  imgSrc: x.imgSrc ?? x.eventImage ?? x.image ?? "/img/default_img.svg",
  title: x.title ?? x.eventName ?? "모집글 제목",
  eventType: x.eventType ?? x.type ?? "이벤트유형",
  eventName: x.eventName ?? x.name ?? "이벤트명",
  group:
    x.group ??
    (x.currentPeople && x.maxPeople
      ? `${x.currentPeople}/${x.maxPeople}`
      : x.maxPeople
      ? `0/${x.maxPeople}`
      : "00/00"),
  date: x.date ? x.date : fmtDateDot(x.createdAt),
  isClosed: !!x.isClosed,
});
