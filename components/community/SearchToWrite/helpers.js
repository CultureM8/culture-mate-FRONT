export const toCard = (ev = {}) => ({
  id: ev.id,
  eventImage: ev.eventImage ?? ev.image ?? "/img/default_img.svg",
  eventType: ev.eventType ?? ev.type ?? "이벤트",
  eventName: ev.eventName ?? ev.name ?? "",
  description: ev.description ?? "",
  recommendations: ev.recommendations ?? ev.recommend ?? ev.likes ?? 0,
  starScore: ev.starScore ?? ev.rating ?? 0,
  initialLiked: ev.initialLiked ?? ev.isLiked ?? false,
  registeredPosts: ev.registeredPosts ?? ev.postsCount ?? 0,
});

/* 관련도 점수*/
export const scoreOf = (ev, q) => {
  const L = (v) => (typeof v === "string" ? v.toLowerCase() : "");
  const ql = L(q).trim();
  if (!ql) return 0;

  const title = L(ev.eventName ?? ev.name);
  const type = L(ev.eventType ?? ev.type);
  const desc = L(ev.description);

  let s = 0;

  /*제목 매치 점수 */
  if (title === ql) s += 200; /* 완전 일치*/
  if (title.startsWith(ql)) s += 100; /* 접두 일치*/
  if (title.includes(ql)) s += 60; /* 포함*/

  /*점수 가중치(제목 > 타입 > 설명)*/
  const words = ql.split(/\s+/).filter(Boolean);
  for (const w of words) {
    const re = new RegExp(`\\b${escapeRegExp(w)}`, "g");
    s += (title.match(re) || []).length * 20;
    s += (type.match(re) || []).length * 5;
    s +=
      Math.min((desc.match(re) || []).length, 3) * 3; /*설명은 과도 보정 방지*/
  }

  /*아주 작은 전체 포함 보너스(미세 정렬용)*/
  const hay = `${title} ${type} ${desc}`;
  if (hay.includes(ql)) s += 5;

  return s;
};

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
