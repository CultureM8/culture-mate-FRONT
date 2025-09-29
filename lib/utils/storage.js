// lib/storage.js

/** 환경 체크 */
const isBrowser = () => typeof window !== "undefined";

/** 안전 파서 */
const safeParse = (json, fallback = []) => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

/** 게시판별 저장 키 (단일 규칙로 통일) */
const POSTS_KEY = (board) => `posts:${board}`;

/* ---------------------------------------
 * 기본 load / save
 * ------------------------------------- */
export function loadPosts(board) {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(POSTS_KEY(board));
  const arr = raw ? safeParse(raw, []) : [];
  return Array.isArray(arr) ? arr : [];
}

export function savePosts(board, posts) {
  if (!isBrowser()) return;
  localStorage.setItem(POSTS_KEY(board), JSON.stringify(posts || []));
}

/* ---------------------------------------
 * 레거시 글 생성기 (로컬 테스트용)
 *  - 지금 코드베이스에서 참조할 수 있어서 유지
 * ------------------------------------- */
export function makePost(board, data) {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now());
  const now = new Date().toISOString();

  const post = {
    id,
    board,
    title: data.title ?? "",
    content: data.content ?? "",
    mode: data.mode ?? "plain",
    eventId: data.eventId ?? null,
    eventSnapshot: data.eventSnapshot ?? null,
    author: data.author ?? "익명",
    createdAt: now,
    stats: {
      views: 0,
      likes: 0,
      recommendations: 0, // 레거시 호환 필드
      ...(data.stats || {}),
    },
  };

  const arr = loadPosts(board);
  arr.unshift(post); // 최신 글 앞으로
  savePosts(board, arr);
  return id;
}

/** (권장) 이미 구성된 post 객체 추가 — post.board 필수 */
export function addPost(post) {
  if (!post?.board) throw new Error("addPost: post.board is required");
  const arr = loadPosts(post.board);
  arr.unshift(post);
  savePosts(post.board, arr);
  return post.id;
}

/** 단건 조회 */
export function getPost(board, id) {
  return loadPosts(board).find((p) => String(p.id) === String(id)) || null;
}

/* ---------------------------------------
 * 조회수 (로컬 전용) — _views 사용
 * ------------------------------------- */
export function bumpViews(board, postId) {
  try {
    const posts = loadPosts(board);
    const idx = posts.findIndex((p) => String(p.id) === String(postId));
    if (idx === -1) return;
    const p = posts[idx];
    posts[idx] = { ...p, _views: Number(p?._views ?? 0) + 1 };
    savePosts(board, posts);
  } catch {}
}

/* ---------------------------------------
 * 관심(좋아요) — 다른 기능에서 쓰일 수 있어 유지
 *   저장 위치: post.stats.likes
 *   토글 여부는 localStorage 'liked:<board>:<id>'
 * ------------------------------------- */
const likeKey = (board, id) => `liked:${board}:${id}`;

export function isLiked(board, id) {
  if (!isBrowser()) return false;
  return localStorage.getItem(likeKey(board, id)) === "1";
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
  const already = localStorage.getItem(key) === "1";
  let count;
  if (already) {
    localStorage.removeItem(key);
    count = bumpLikesInternal(arr, idx, -1);
  } else {
    localStorage.setItem(key, "1");
    count = bumpLikesInternal(arr, idx, +1);
  }
  savePosts(board, arr);
  return { liked: !already, count };
}

/* ---------------------------------------
 * 추천(Recommendation) — 게시글의 '추천수' 전용
 *   저장 위치: post.recommendCount
 *   사용자별 추천 여부 기록은 상세 페이지에서 관리 (여기선 숫자만)
 *   과거 필드 호환: recommendCount > recommend > recommendations > likeCount
 * ------------------------------------- */
export function toggleRecommendation(board, postId, delta = +1) {
  try {
    const posts = loadPosts(board);
    const idx = posts.findIndex((p) => String(p.id) === String(postId));
    if (idx === -1) return 0;

    const p = posts[idx];
    const current = Number(
      p?.recommendCount ??
        p?.recommend ??
        p?.recommendations ??
        p?.likeCount ??
        0
    );

    const next = Math.max(0, current + Number(delta || 0));
    posts[idx] = {
      ...p,
      recommendCount: next,
      updatedAt: new Date().toISOString(),
    };
    savePosts(board, posts);
    return { count: next };
  } catch {
    return 0;
  }
}

/* ---------------------------------------
 * 삭제
 *  - 관련 부가 데이터도 정리 (댓글/좋아요/추천 기록)
 * ------------------------------------- */
export function deletePost(board, id, { purgeExtras = true } = {}) {
  const list = loadPosts(board);
  const next = list.filter((p) => String(p.id) !== String(id));
  savePosts(board, next);

  if (purgeExtras && isBrowser()) {
    localStorage.removeItem(`comments:${id}`);
    localStorage.removeItem(`liked:${board}:${id}`);
    // 과거 키 호환: recommended:<board>:<id> 사용했을 수 있음
    localStorage.removeItem(`recommended:${board}:${id}`);
  }
  return true;
}

export function updatePost(board, id, patch = {}) {
  try {
    const list = loadPosts(board);
    const idx = list.findIndex((p) => String(p.id) === String(id));
    if (idx === -1) return false;

    const prev = list[idx];
    const next = {
      ...prev,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    list[idx] = next;
    savePosts(board, list);
    return true;
  } catch {
    return false;
  }
}
