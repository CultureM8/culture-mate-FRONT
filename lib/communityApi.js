// /lib/communityApi.js

// ===== Base URL =====
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";
const BASE = `${API_BASE}/api/v1/board`;

// ===== Helpers =====
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
    if (v.includes("T")) return v; // already LocalDateTime-like
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v}T00:00:00`; // LocalDate -> local midnight
    return v;
  }
  try {
    return new Date(v).toISOString();
  } catch {
    return String(v);
  }
}

// ===== Posts =====

// communityApi.js에서 fetchPosts 수정
export async function fetchPosts(params = {}) {
  // 파라미터가 있으면 search 엔드포인트, 없으면 기본 엔드포인트
  if (params && Object.keys(params).length > 0) {
    return await searchPosts(params);
  }

  // 기본 목록 조회
  const res = await fetch(BASE, { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
  const arr = await res.json();
  return arr.map(adaptPost);
}

export async function fetchPost(boardId) {
  const res = await fetch(`${BASE}/${boardId}`, { credentials: "include" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to fetch post: ${res.status} ${txt}`);
  }
  return adaptPost(await res.json());
}

export async function searchPosts(params = {}) {
  const url = new URL(`${BASE}/search`);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") url.searchParams.set(k, String(v));
  });
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to search posts: ${res.status}`);
  const arr = await res.json();
  return arr.map(adaptPost);
}

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

export async function togglePostLike(boardId, memberId) {
  const url = `${BASE}/${boardId}/like?memberId=${encodeURIComponent(
    memberId
  )}`;
  const res = await fetch(url, { method: "POST", credentials: "include" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to toggle like: ${res.status} ${txt}`);
  }
  // 서버가 "좋아요 성공"/"좋아요 취소" 문자열을 반환
  return (await res.text()).includes("성공");
}

function adaptPost(p) {
  if (!p) return null;
  const a = p.author || {}; // MemberDto.ProfileResponse
  const ev = p.eventCard || {}; // EventDto.ResponseCard (nullable)

  return {
    id: p.id,
    title: p.title ?? "",
    content: p.content ?? "",

    author_display_name: a.nickname || undefined,
    authorLoginId: undefined,
    authorId: a.id,

    createdAt: p.createdAt,
    _views: 0,
    recommendCount: p.likeCount ?? 0,
    commentsCount: 0,

    eventId: ev?.id ?? 0,
    eventType: ev?.eventType ?? "ETC",
    eventSnapshot: null,

    _ownerKey: String(a.id ?? ""),
  };
}

// ===== Comments (exports expected by CommentsSection.jsx) =====
// Controller mapping:
//   POST   /api/v1/board/{boardId}/comments
//   PUT    /api/v1/board/{boardId}/comments/{commentId}
//   GET    /api/v1/board/{boardId}/comments
//   GET    /api/v1/board/{boardId}/comments/{parentId}/replies
//   DELETE /api/v1/board/{boardId}/comments/{commentId}?requesterId=...

export async function listParentComments(boardId) {
  const res = await fetch(`${BASE}/${boardId}/comments`, {
    credentials: "include",
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to load comments: ${res.status} ${txt}`);
  }
  const arr = await res.json(); // CommentResponseDto[]
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
  const arr = await res.json(); // CommentResponseDto[]
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
      // boardId는 path로 전달되므로 body에 없어도 되지만 넣어도 무방
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
  // 서버는 생성된 CommentResponseDto를 반환
  const json = await res.json();
  // parentId가 null이면 루트, 아니면 답글로 어댑트
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
  // 수정 후 서버가 돌려준 최신 값으로 변환 (parentId는 알 수 없으니 null로)
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

// ===== Comment adapters =====
function authorLabelFrom(c) {
  // 서버 응답에는 authorId만 있음 → 표시용 라벨
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

export { togglePostLike as toggleBoardLike };
