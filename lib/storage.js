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

/*목록 읽기/저장*/
export function loadPosts(board) {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(STORAGE_KEYS[board]);
  return raw ? safeParse(raw, []) : [];
}
export function savePosts(board, posts) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS[board], JSON.stringify(posts));
}

/*추가 / 단건 조회*/
export function addPost(post) {
  const arr = loadPosts(post.board);
  arr.unshift(post); // 최신 글을 앞으로
  savePosts(post.board, arr);
  return post.id;
}
export function getPost(board, id) {
  const arr = loadPosts(board);
  return arr.find((p) => String(p.id) === String(id)) || null;
}

/* 조회수 +1*/
export function bumpViews(board, id) {
  const arr = loadPosts(board);
  const idx = arr.findIndex((p) => String(p.id) === String(id));
  if (idx === -1) return;
  const prev = arr[idx].stats?.views ?? 0;
  arr[idx].stats = { ...(arr[idx].stats || {}), views: prev + 1 };
  savePosts(board, arr);
}

/* 좋아요*/
const likeKey = (board, id) => `liked:${board}:${id}`;
export function isLiked(board, id) {
  if (!isBrowser()) return false;
  return localStorage.getItem(likeKey(board, id)) === '1';
}
export function bumpLikes(board, id, amount = 1) {
  const arr = loadPosts(board);
  const idx = arr.findIndex((p) => String(p.id) === String(id));
  if (idx === -1) return 0;
  const prev = arr[idx].stats?.likes ?? 0;
  const next = Math.max(0, prev + amount);
  arr[idx].stats = { ...(arr[idx].stats || {}), likes: next };
  savePosts(board, arr);
  return next;
}
export function toggleLike(board, id) {
  if (!isBrowser()) return { liked: false, count: 0 };
  const key = likeKey(board, id);
  const already = localStorage.getItem(key) === '1';
  if (already) {
    localStorage.removeItem(key);
    const count = bumpLikes(board, id, -1);
    return { liked: false, count };
  }
  localStorage.setItem(key, '1');
  const count = bumpLikes(board, id, +1);
  return { liked: true, count };
}

/*추천*/
const recKey = (board, id) => `recommended:${board}:${id}`;
export function isRecommended(board, id) {
  if (!isBrowser()) return false;
  return localStorage.getItem(recKey(board, id)) === '1';
}
export function bumpRecommendations(board, id, amount = 1) {
  const arr = loadPosts(board);
  const idx = arr.findIndex((p) => String(p.id) === String(id));
  if (idx === -1) return 0;
  const prev = arr[idx].stats?.recommends ?? 0;
  const next = Math.max(0, prev + amount);
  arr[idx].stats = { ...(arr[idx].stats || {}), recommends: next };
  savePosts(board, arr);
  return next;
}
export function toggleRecommendation(board, id) {
  if (!isBrowser()) return { recommended: false, count: 0 };
  const key = recKey(board, id);
  const already = localStorage.getItem(key) === '1';
  if (already) {
    localStorage.removeItem(key);
    const count = bumpRecommendations(board, id, -1);
    return { recommended: false, count };
  }
  localStorage.setItem(key, '1');
  const count = bumpRecommendations(board, id, +1);
  return { recommended: true, count };
}
