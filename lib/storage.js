// lib/storage.js

export const STORAGE_KEYS = {
  promote: 'promote_posts',
  review: 'review_posts',
  free: 'free_posts',
};

const isBrowser = () => typeof window !== 'undefined';
const safeParse = (json, fallback = []) => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

// ── load/save ─────────────────────────────────────────────
export function loadPosts(board) {
  if (!isBrowser()) return [];
  const key = STORAGE_KEYS[board] || STORAGE_KEYS.promote;
  const raw = localStorage.getItem(key);
  return raw ? safeParse(raw, []) : [];
}
export function savePosts(board, posts) {
  if (!isBrowser()) return;
  const key = STORAGE_KEYS[board] || STORAGE_KEYS.promote;
  localStorage.setItem(key, JSON.stringify(posts));
}

// ── create (작성) ─────────────────────────────────────────
export function makePost(board, data) {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now());
  const now = new Date().toISOString();

  const post = {
    id,
    board,
    title: data.title ?? '',
    content: data.content ?? '',
    mode: data.mode ?? 'plain',
    eventId: data.eventId ?? null,
    eventSnapshot: data.eventSnapshot ?? null,
    author: data.author ?? '익명',
    createdAt: now,
    stats: {
      views: 0,
      likes: 0,
      recommendations: 0,
      ...(data.stats || {}),
    },
  };

  const arr = loadPosts(board);
  arr.unshift(post); // 최신 글 앞으로
  savePosts(board, arr);
  return id;
}

// (호환용) addPost: post.board 필수
export function addPost(post) {
  if (!post?.board) throw new Error('addPost: post.board is required');
  const arr = loadPosts(post.board);
  arr.unshift(post);
  savePosts(post.board, arr);
  return post.id;
}

// ── read/update ───────────────────────────────────────────
export function getPost(board, id) {
  return loadPosts(board).find((p) => String(p.id) === String(id)) || null;
}

export function bumpViews(board, id) {
  const arr = loadPosts(board);
  const idx = arr.findIndex((p) => String(p.id) === String(id));
  if (idx === -1) return;
  const prev = arr[idx].stats?.views ?? 0;
  arr[idx] = {
    ...arr[idx],
    stats: { ...(arr[idx].stats || {}), views: prev + 1 },
  };
  savePosts(board, arr);
}

// ── likes (좋아요) ────────────────────────────────────────
const likeKey = (board, id) => `liked:${board}:${id}`;

export function isLiked(board, id) {
  if (!isBrowser()) return false;
  return localStorage.getItem(likeKey(board, id)) === '1';
}

function bumpLikesInternal(arr, idx, delta) {
  const prev = arr[idx].stats?.likes ?? 0;
  const next = Math.max(0, prev + delta);
  arr[idx] = { ...arr[idx], stats: { ...(arr[idx].stats || {}), likes: next } };
  return next;
}

export function toggleLike(board, id) {
  if (!isBrowser()) return { liked: false, count: 0 };
  const arr = loadPosts(board);
  const idx = arr.findIndex((p) => String(p.id) === String(id));
  if (idx === -1) return { liked: false, count: 0 };

  const key = likeKey(board, id);
  const already = localStorage.getItem(key) === '1';
  let count;
  if (already) {
    localStorage.removeItem(key);
    count = bumpLikesInternal(arr, idx, -1);
  } else {
    localStorage.setItem(key, '1');
    count = bumpLikesInternal(arr, idx, +1);
  }
  savePosts(board, arr);
  return { liked: !already, count };
}

// ── recommendations (추천) ────────────────────────────────
const recKey = (board, id) => `recommended:${board}:${id}`;

export function isRecommended(board, id) {
  if (!isBrowser()) return false;
  return localStorage.getItem(recKey(board, id)) === '1';
}

function bumpRecsInternal(arr, idx, delta) {
  const prev = arr[idx].stats?.recommendations ?? 0;
  const next = Math.max(0, prev + delta);
  arr[idx] = {
    ...arr[idx],
    stats: { ...(arr[idx].stats || {}), recommendations: next },
  };
  return next;
}

export function toggleRecommendation(board, id) {
  if (!isBrowser()) return { recommended: false, count: 0 };
  const arr = loadPosts(board);
  const idx = arr.findIndex((p) => String(p.id) === String(id));
  if (idx === -1) return { recommended: false, count: 0 };

  const key = recKey(board, id);
  const already = localStorage.getItem(key) === '1';
  let count;
  if (already) {
    localStorage.removeItem(key);
    count = bumpRecsInternal(arr, idx, -1);
  } else {
    localStorage.setItem(key, '1');
    count = bumpRecsInternal(arr, idx, +1);
  }
  savePosts(board, arr);
  return { recommended: !already, count };
}
// ── delete (삭제) ─────────────────────────────────────────
export function deletePost(board, id, { purgeExtras = true } = {}) {
  const list = loadPosts(board);
  const next = list.filter((p) => String(p.id) !== String(id));
  savePosts(board, next);

  // 글 삭제 시 관련 부가 데이터도 같이 정리
  if (purgeExtras && typeof window !== 'undefined') {
    localStorage.removeItem(`comments:${id}`);
    localStorage.removeItem(`liked:${board}:${id}`);
    localStorage.removeItem(`recommended:${board}:${id}`);
  }
  return true;
}
