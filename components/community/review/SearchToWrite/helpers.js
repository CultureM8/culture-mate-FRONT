/* 별 이미지 선택*/
export const getStarImage = (rating) => {
  const r = Number(rating) || 0;
  if (r <= 1) return '/img/star_empty.svg';
  if (r >= 2 && r <= 3) return '/img/star_half.svg';
  if (r >= 4 && r <= 5) return '/img/star_full.svg';
  return '/img/star_empty.svg';
};
/* 별점 숫자를 문자열로 변환*/
export const fmtStar = (v) =>
  typeof v === 'number' && Number.isFinite(v)
    ? v.toFixed(1)
    : String(v ?? '0.0');

export const toCard = (ev = {}) => ({
  id: ev.id,

  eventImage: ev.eventImage ?? ev.image ?? '/img/default_img.svg',

  eventType: ev.eventType ?? ev.type ?? '이벤트',
  eventName: ev.eventName ?? ev.name ?? '',
  description: ev.description ?? '',
  recommendations: ev.recommendations ?? ev.recommend ?? ev.likes ?? 0,
  starScore: ev.starScore ?? ev.rating ?? 0,
  initialLiked: ev.initialLiked ?? ev.isLiked ?? false,
  registeredPosts: ev.registeredPosts ?? ev.postsCount ?? 0,
});

/* 관련도 점수*/
export const scoreOf = (ev, ql) => {
  const L = (v) => (typeof v === 'string' ? v.toLowerCase() : '');
  const name = L(ev.name ?? ev.eventName);
  let s = 0;

  if (name === ql) s += 100;

  if (name?.startsWith(ql)) s += 50;

  const hay = `${name} ${L(ev.type ?? ev.eventType)} ${L(ev.description)}`;

  if (hay.includes(ql)) s += 10;

  s += (ev.rating ?? ev.starScore ?? 0) * 2;
  /*s +=
    Math.min(ev.recommendations ?? ev.recommend ?? ev.likes ?? 0, 1000) / 100;
    추천수만큼 추가는 일단 보류*/
  return s;
};

/*로컬 mockData 검색*/
export const searchLocal = (data = [], q = '', maxResults = 30) => {
  const ql = String(q).toLowerCase().trim();

  if (!ql) return [];
  const L = (v) => (typeof v === 'string' ? v.toLowerCase() : '');

  const filtered = data.filter((ev) => {
    const hay = `${L(ev.name ?? ev.eventName)} ${L(
      ev.type ?? ev.eventType
    )} ${L(ev.description)}`;

    return hay.includes(ql);
  });

  const sorted = filtered.sort((a, b) => scoreOf(b, ql) - scoreOf(a, ql));

  return sorted.slice(0, maxResults).map(toCard);
};
