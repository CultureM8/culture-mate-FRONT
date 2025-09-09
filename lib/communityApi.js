// /lib/communityApi.js

// ===== Base URL =====
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";
const BASE = `${API_BASE}/api/v1/board`;

// ===== Helpers =====

function authHeader() {
  if (typeof window === "undefined") return {};
  const t = localStorage.getItem("accessToken");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function toLongOrNull(v) {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string") {
    const t = v.trim();
    if (/^-?\d+$/.test(t)) return parseInt(t, 10);
  }
  return null;
}

const ALLOWED_EVENT_TYPES = new Set([
  "OTHER",
  "THEATER",
  "DANCE",
  "LOCAL_EVENT",
  "FESTIVAL",
  "EXHIBITION",
  "MOVIE",
  "CONCERT",
  "MUSICAL",
  "Classical",
]);
const KOR_TO_ENUM = {
  뮤지컬: "MUSICAL",
  콘서트: "CONCERT",
  전시: "EXHIBITION",
  연극: "THEATER",
  무용: "DANCE",
  지역행사: "LOCAL_EVENT",
  영화: "MOVIE",
  클래식: "Classical",
  축제: "FESTIVAL",
  기타: "OTHER",
};
function toServerEventType(v) {
  if (!v || typeof v !== "string") return null;
  const s = v.trim();
  if (KOR_TO_ENUM[s]) return KOR_TO_ENUM[s];
  if (ALLOWED_EVENT_TYPES.has(s)) return s;
  const upper = s.toUpperCase();
  if (upper === "CLASSICAL") return "Classical";
  if (ALLOWED_EVENT_TYPES.has(upper)) return upper;
  return null;
}

function toIsoDateTimeLike(v) {
  if (!v) return new Date().toISOString();
  if (typeof v === "string") {
    if (v.includes("T")) return v;
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v}T00:00:00`;
    return v;
  }
  try {
    return new Date(v).toISOString();
  } catch {
    return String(v);
  }
}

// ===== Posts =====

/** 전체 목록 or 검색 목록 */
export async function fetchPosts(params = {}) {
  const sanitized = sanitizeSearchParams(params);
  if (sanitized) {
    try {
      return await searchPosts(sanitized);
    } catch (err) {
      console.warn("search failed, fallback to list:", err);
    }
  }
  const res = await fetch(BASE, { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
  const arr = await res.json();
  return arr.map(adaptPost);
}

/** 단일 게시글 */
export async function fetchPost(boardId) {
  const res = await fetch(`${BASE}/${boardId}`, { credentials: "include" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to fetch post: ${res.status} ${txt}`);
  }
  return adaptPost(await res.json());
}

/** 내 글 목록(작성자 기준) */
export async function fetchBoardsByAuthor(memberId) {
  const res = await fetch(`${BASE}/author/${memberId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Failed to fetch my posts: ${res.status}`);
  const arr = await res.json();
  return arr.map(adaptPost);
}

/** 검색 */
export async function searchPosts(params = {}) {
  const { q, keyword, author, authorNickname, eventType, eventId } = params;
  const url = new URL(`${BASE}/search`);

  const kv = {
    keyword: (keyword ?? q ?? "").toString().trim(),
    authorNickname: (authorNickname ?? author ?? "").toString().trim(),
    eventType: (eventType ?? "").toString().trim(),
    eventId: eventId ?? "",
  };

  if (kv.keyword) url.searchParams.set("keyword", kv.keyword);
  if (kv.authorNickname)
    url.searchParams.set("authorNickname", kv.authorNickname);
  if (kv.eventType) url.searchParams.set("eventType", kv.eventType);
  if (kv.eventId !== "" && kv.eventId != null) {
    url.searchParams.set("eventId", String(kv.eventId));
  }

  // 유효한 파라미터가 하나도 없으면 빈 배열 반환
  if (![...url.searchParams.keys()].length) {
    return [];
  }

  const res = await fetch(url, {
    credentials: "include",
    headers: { ...authHeader() },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to search posts: ${res.status} ${txt}`);
  }

  const arr = await res.json();
  return arr.map(adaptPost);
}

/** 생성 */
export async function createPost({
  title,
  content,
  authorId,
  eventType,
  eventId,
}) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      title,
      content,
      authorId: toLongOrNull(authorId),
      eventType: toServerEventType(eventType),
      eventId: toLongOrNull(eventId),
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to create post: ${res.status} ${txt}`);
  }
  return adaptPost(await res.json());
}

/** 수정 */
export async function updatePostApi(
  boardId,
  { title, content, authorId, eventType, eventId }
) {
  const res = await fetch(`${BASE}/${boardId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      title,
      content,
      authorId: toLongOrNull(authorId),
      eventType: toServerEventType(eventType),
      eventId: toLongOrNull(eventId),
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to update post: ${res.status} ${txt}`);
  }
  return adaptPost(await res.json());
}

/** 삭제 */
export async function deletePostApi(boardId) {
  const res = await fetch(`${BASE}/${boardId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to delete post: ${res.status} ${txt}`);
  }
}

/** 좋아요 토글 */
export async function togglePostLike(boardId, memberId) {
  const url = `${BASE}/${boardId}/like?memberId=${encodeURIComponent(
    memberId
  )}`;
  const res = await fetch(url, { method: "POST", credentials: "include" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to toggle like: ${res.status} ${txt}`);
  }
  return (await res.text()).includes("성공");
}

// ===== Comments =====

export async function listParentComments(boardId) {
  const res = await fetch(`${BASE}/${boardId}/comments`, {
    credentials: "include",
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to load comments: ${res.status} ${txt}`);
  }
  const arr = await res.json();
  return arr.map(adaptParentComment);
}

export async function listReplies(boardId, parentId) {
  const res = await fetch(`${BASE}/${boardId}/comments/${parentId}/replies`, {
    credentials: "include",
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to load replies: ${res.status} ${txt}`);
  }
  const arr = await res.json();
  return arr.map((c) => adaptReplyComment(c, parentId));
}

export async function addComment(
  boardId,
  { authorId, comment, parentId = null }
) {
  const res = await fetch(`${BASE}/${boardId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      boardId: toLongOrNull(boardId),
      authorId: toLongOrNull(authorId),
      parentId: toLongOrNull(parentId),
      comment: String(comment ?? ""),
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to add comment: ${res.status} ${txt}`);
  }
  const json = await res.json();
  return parentId
    ? adaptReplyComment(json, parentId)
    : adaptParentComment(json);
}

export async function updateComment(boardId, commentId, { authorId, comment }) {
  const res = await fetch(`${BASE}/${boardId}/comments/${commentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      authorId: toLongOrNull(authorId),
      comment: String(comment ?? ""),
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to update comment: ${res.status} ${txt}`);
  }
  const json = await res.json();
  return adaptParentComment(json);
}

export async function deleteComment(boardId, commentId, requesterId) {
  const url = `${BASE}/${boardId}/comments/${commentId}?requesterId=${encodeURIComponent(
    requesterId
  )}`;
  const res = await fetch(url, { method: "DELETE", credentials: "include" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to delete comment: ${res.status} ${txt}`);
  }
}

// ===== Adapters =====
function authorLabelFrom(c) {
  if (c && c.authorId != null) return `#${c.authorId}`;
  return "사용자";
}

function adaptParentComment(c) {
  return {
    id: String(c.id),
    parentId: null,
    author: authorLabelFrom(c),
    authorLoginId: undefined,
    userId: c.authorId ?? null,
    ownerKey: String(c.authorId ?? ""),
    content: c.content ?? "",
    createdAt: toIsoDateTimeLike(c.createdAt),
    editedAt: c.updatedAt ? toIsoDateTimeLike(c.updatedAt) : undefined,
    likeCount: c.likeCount ?? 0,
    replyCount: c.replyCount ?? 0,
  };
}

function adaptReplyComment(c, parentId) {
  return {
    id: String(c.id),
    parentId: toLongOrNull(parentId),
    author: authorLabelFrom(c),
    authorLoginId: undefined,
    userId: c.authorId ?? null,
    ownerKey: String(c.authorId ?? ""),
    content: c.content ?? "",
    createdAt: toIsoDateTimeLike(c.createdAt),
    editedAt: c.updatedAt ? toIsoDateTimeLike(c.updatedAt) : undefined,
    likeCount: c.likeCount ?? 0,
  };
}

function adaptPost(p) {
  if (!p) return null;
  const a = p.author || {};
  const ev = p.eventCard || {};

  return {
    id: p.id,
    title: p.title ?? "",
    content: p.content ?? "",

    author_display_name: a.nickname || undefined,
    authorLoginId: undefined,
    authorId: a.id,

    createdAt: p.createdAt,
    _views: p.viewCount ?? 0,
    recommendCount: p.likeCount ?? 0,
    commentsCount: p.commentCount ?? 0,

    eventId: ev?.id ?? 0,
    eventType: ev?.eventType ?? "ETC",
    eventSnapshot: null,

    _ownerKey: String(a.id ?? ""),
  };
}

// ===== Utils =====
function sanitizeSearchParams(params = {}) {
  if (!params || typeof params !== "object") return null;
  const { q, keyword, author, authorNickname, eventType, eventId } = params;
  const out = {};
  const kw = (keyword ?? q ?? "").toString().trim();
  if (kw) out.keyword = kw;
  const auth = (authorNickname ?? author ?? "").toString().trim();
  if (auth) out.authorNickname = auth;
  const et = (eventType ?? "").toString().trim();
  if (et) out.eventType = et;
  if (eventId !== undefined && eventId !== null && `${eventId}`.trim() !== "") {
    out.eventId = `${parseInt(eventId, 10)}`;
  }
  return Object.keys(out).length ? out : null;
}

// alias (기존 코드 호환)
export { togglePostLike as toggleBoardLike };
