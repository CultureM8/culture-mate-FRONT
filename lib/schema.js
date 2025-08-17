export const toCard = (ev = {}) => ({
  id: String(ev.id ?? ''),
  eventImage: ev.eventImage ?? ev.image ?? '/img/default_img.svg',
  eventType: ev.eventType ?? ev.type ?? '이벤트',
  eventName: ev.eventName ?? ev.name ?? '',
  description: ev.description ?? '',
  recommendations: ev.recommendations ?? ev.recommend ?? ev.likes ?? 0,
  starScore: ev.starScore ?? ev.rating ?? 0,
  initialLiked: ev.initialLiked ?? ev.isLiked ?? false,
  registeredPosts: ev.registeredPosts ?? ev.postsCount ?? 0,
});

const rid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * 게시글 생성
 * @param {{board:'free', title:string, content:string, mode?:'plain'|'editor', eventId?:string|null, eventSnapshot?:any}} input
 */
export const makePost = (input) => ({
  id: rid(),
  board: input.board,
  title: input.title,
  content: input.content,
  mode: input.mode ?? 'plain',
  eventId: input.eventId ?? null,
  eventSnapshot: input.eventSnapshot ?? null,
  createdAt: new Date().toISOString(),
  stats: { views: 0, likes: 0, recommends: 0, comments: 0 },
  schemaVersion: 1,
});
