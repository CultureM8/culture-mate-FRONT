// lib/schema.js

/** 이벤트 카드를 UI용으로 변환 */
export const toCard = (ev = {}) => ({
  id: String(ev.id ?? ""),
  eventImage: ev.eventImage ?? ev.image ?? "/img/default_img.svg",
  eventType: ev.eventType ?? ev.type ?? "이벤트",
  eventName: ev.eventName ?? ev.name ?? "",
  description: ev.description ?? "",
  recommendations: ev.recommendations ?? ev.recommend ?? ev.likes ?? 0,
  starScore: ev.starScore ?? ev.rating ?? 0,
  initialLiked: ev.initialLiked ?? ev.isLiked ?? false,
  registeredPosts: ev.registeredPosts ?? ev.postsCount ?? 0,
});

// 레거시용 임시 ID
const rid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * ✅ 레거시 버전: 기존에 쓰이던 makePost (stats/likes/recommends 등 포함)
 *  - 기존 코드 호환을 위해 '이름 그대로'도 export 합니다: export { makePostLegacy as makePost }
 */
export const makePostLegacy = (input) => ({
  id: rid(),
  board: input.board,
  title: input.title,
  content: input.content,
  mode: input.mode ?? "plain",
  eventId: input.eventId ?? null,
  eventSnapshot: input.eventSnapshot ?? null,
  createdAt: new Date().toISOString(),
  stats: { views: 0, likes: 0, recommends: 0, comments: 0 },
  schemaVersion: 1,
});

/** 사용자 표시명 규칙: 닉네임 > 실명 > 로그인아이디 > id > '사용자' */
export function getDisplayName(user) {
  if (!user) return "사용자";
  const dn = user.display_name && String(user.display_name).trim();
  const nn = user.nickname && String(user.nickname).trim();
  const rn = user.name && String(user.name).trim();
  const lid = user.login_id && String(user.login_id).trim();
  const uid = user.id ?? user.user_id;
  return dn || nn || rn || lid || uid || "사용자";
}

/** 글쓰기용 이벤트 스냅샷 정규화(카드/상세에서 공통 사용) */
export function normalizeEventSnapshot(selectedEvent) {
  if (!selectedEvent) return null;
  return {
    ...selectedEvent,
    eventId:
      selectedEvent.eventId ?? selectedEvent.id ?? selectedEvent.slug ?? 0,
    eventType: selectedEvent.eventType ?? selectedEvent.type ?? "ETC",
    eventImage:
      selectedEvent.eventImage ??
      selectedEvent.image ??
      selectedEvent.imgSrc ??
      "/img/default_img.svg",
    imgSrc:
      selectedEvent.imgSrc ??
      selectedEvent.image ??
      selectedEvent.eventImage ??
      "/img/default_img.svg",
    name:
      selectedEvent.eventName ??
      selectedEvent.name ??
      selectedEvent.title ??
      "",
  };
}

/**
 * ✅ 서버 스키마 버전(V1): recommendCount 사용 (like 아님)
 *   - 게시글: { id, title, content, authorId, authorLoginId, eventId, eventType, recommendCount, createdAt, updatedAt }
 *   - 프론트 전용: { board, author_display_name, _ownerKey, _views, eventSnapshot }
 */
export function makePostV1({
  board = "community",
  title = "",
  content = "",
  eventId = 0,
  eventType = "ETC",
  eventSnapshot = null,
  user = null,
}) {
  const nowIso = new Date().toISOString();

  const authorId = Number(user?.id ?? user?.user_id ?? 0);
  const authorLoginId = String(user?.login_id ?? "");
  const ownerKey = String(user?.id ?? user?.user_id ?? user?.login_id ?? "");
  const authorDisplayName = getDisplayName(user);

  // ⬇ 서버 스키마(추천만 사용)
  const post = {
    id: Date.now(), // 로컬 임시 id (숫자)
    title: String(title || ""),
    content: String(content || ""),
    authorId,
    authorLoginId,
    eventId: Number(eventId ?? 0),
    eventType: String(eventType ?? "ETC"),
    recommendCount: 0, // ✅ 여기!
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // ⬇ 프론트 전용(UI/권한/통계)
  return {
    ...post,
    board,
    author_display_name: authorDisplayName,
    _ownerKey: ownerKey,
    _views: 0,
    eventSnapshot: eventSnapshot ?? null,
  };
}

/** 호환을 위해 레거시 함수를 기본 이름으로도 export */
export { makePostLegacy as makePost };

/** 내부 유틸: YYYY-MM-DD로 포맷 */
function toYMD(d) {
  try {
    const x =
      typeof d === "string"
        ? new Date(d)
        : d instanceof Date
        ? d
        : new Date(String(d));
    if (Number.isNaN(+x)) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
  } catch {
    return "";
  }
}

/**
 * 동행모집(서버 스키마) 생성기
 * 백엔드 스키마:
 * {
 *   id, eventId, hostId, title, regionDto{level1,level2,level3},
 *   address, addressDetail, meetingDate(YYYY-MM-DD),
 *   maxParticipants, currentParticipants, content, active, createdAt, updatedAt
 * }
 * 프론트 전용 필드:
 *   board: 'together', _ownerKey, author_display_name, eventSnapshot, _views
 */
export function makeTogetherV1({
  title = "",
  content = "",
  eventId = 0,
  eventSnapshot = null,
  form = {},
  user = null,
}) {
  const nowIso = new Date().toISOString();

  // 작성자
  const hostId = Number(user?.id ?? user?.user_id ?? 0);
  const ownerKey = String(user?.id ?? user?.user_id ?? user?.login_id ?? "");
  const author_display_name = getDisplayName?.(user) ?? "";

  // 이벤트
  const snap =
    normalizeEventSnapshot?.(eventSnapshot) ?? (eventSnapshot || null);

  const finalEventId = Number(eventId ?? snap?.eventId ?? snap?.id ?? 0) || 0;

  // 지역 / 주소 / 인원 / 날짜 — 다양한 폼 키를 유연하게 매핑
  const regionDto = {
    level1: form?.region?.level1 ?? form?.regionLevel1 ?? form?.level1 ?? "",
    level2: form?.region?.level2 ?? form?.regionLevel2 ?? form?.level2 ?? "",
    level3: form?.region?.level3 ?? form?.regionLevel3 ?? form?.level3 ?? "",
  };

  const address = form?.address ?? form?.location?.address ?? "";

  const addressDetail =
    form?.addressDetail ?? form?.location?.addressDetail ?? "";

  const meetingDate = toYMD(form?.meetingDate ?? form?.companionDate ?? "");

  const maxParticipants =
    Number(
      form?.maxParticipants ?? form?.maxPeople ?? form?.companionCount ?? 0
    ) || 0;

  // 호스트 포함으로 1로 시작할지 0으로 시작할지 정책 차이.
  // 기본 1로 시작. 필요하면 0으로 바꾸세요.
  const currentParticipants = Number(form?.currentParticipants ?? 1) || 1;

  // 서버 스키마 본체
  const base = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now()),
    eventId: finalEventId,
    hostId,
    title: String(title || ""),
    regionDto,
    address: String(address || ""),
    addressDetail: String(addressDetail || ""),
    meetingDate, // YYYY-MM-DD
    maxParticipants,
    currentParticipants,
    content: String(content || ""),
    active: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // 프론트 전용 필드 추가
  return {
    ...base,
    board: "together",
    author_display_name,
    _ownerKey: ownerKey,
    eventSnapshot: snap,
    _views: 0,
  };
}
