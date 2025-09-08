"use client";

import { useEffect, useState } from "react";
import { loadPosts } from "@/lib/storage";
import { togetherData } from "@/lib/togetherData";

/* 안전한 시간(ms) 변환 */
const toTime = (v) => {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  if (typeof v === "string") {
    const s = v.trim();
    // "YYYY.MM.DD"
    if (/^\d{4}\.\d{1,2}\.\d{1,2}$/.test(s)) {
      const [y, m, d] = s.split(".").map((n) => parseInt(n, 10));
      const t = new Date(y, m - 1, d).getTime();
      return Number.isNaN(t) ? 0 : t;
    }
    const t = Date.parse(s); // ISO 등
    return Number.isNaN(t) ? 0 : t;
  }
  return 0;
};

/* id 꼬리에 박힌 base36/10 타임스탬프 추출(없으면 0) */
const timeFromId = (id) => {
  if (!id || typeof id !== "string") return 0;
  const tail = id.split(":").pop().split("-").pop();
  const b36 = parseInt(tail, 36);
  if (Number.isFinite(b36) && b36 > 0) return b36;
  const b10 = parseInt(tail, 10);
  return Number.isFinite(b10) && b10 > 0 ? b10 : 0;
};

/* ─ 작성 시각 키(이벤트 날짜 절대 사용 X) ─ */
const getCreatedTimeFromPost = (p = {}) =>
  toTime(p.createdAt) || toTime(p.updatedAt) || timeFromId(p.id);
const getCreatedTimeFromDummy = (d = {}) =>
  toTime(d.createdAt) || timeFromId(d.togetherId);

/* ─ 이벤트 날짜 키 ─ */
const getEventTimeFromPost = (p = {}) =>
  toTime(p.companionDate) ||
  toTime(p?.eventSnapshot?.date) ||
  toTime(p?.eventSnapshot?.eventDate);
const getEventTimeFromDummy = (d = {}) => toTime(d.date);

/* 작성자 표시 규칙 */
const getAuthorDisplay = (p = {}) =>
  p?.author?.display_name ??
  p?.author?.nickname ??
  p?.author_login_id ??
  p?.author?.login_id ??
  p?.authorName ??
  p?.author?.name ??
  p?.author_id ??
  p?.authorId ??
  p?.author?.id ??
  "-";

/* 저장된 글 -> 카드 아이템 */
const fromPost = (p = {}) => ({
  togetherId: p.id,
  imgSrc:
    p?.eventSnapshot?.eventImage ??
    p?.eventSnapshot?.imgSrc ??
    p?.imgSrc ??
    "/img/default_img.svg",
  title: p.title || "제목 없음",
  eventType: p?.eventSnapshot?.eventType ?? p?.eventType ?? "기타",
  eventName:
    p?.eventSnapshot?.name ?? p?.eventName ?? p?.eventSnapshot?.title ?? "",
  group: p?.companionCount ?? p?.maxPeople ?? p?.group ?? 1,
  date:
    p?.companionDate ??
    (p?.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""),
  address: p?.eventSnapshot?.location ?? p?.address ?? "",
  author: getAuthorDisplay(p),
  views: p?.stats?.views ?? 0,
  isClosed: !!p?.isClosed,

  _createdTime: getCreatedTimeFromPost(p),
  _eventTime: getEventTimeFromPost(p),
});

/* 더미 글 -> 카드 아이템 */
const fromDummy = (d = {}) => ({
  togetherId: d.togetherId,
  imgSrc: d.imgSrc ?? "/img/default_img.svg",
  title: d.title ?? "제목 없음",
  eventType: d.eventType ?? "기타",
  eventName: d.eventName ?? d.title ?? "",
  group: d.group ?? 1,
  date: d.date ?? "",
  address: d.address ?? "",
  author: d.authorName ?? d.author ?? "-",
  views: d.views ?? d.viewCount ?? 0,
  isClosed: !!d.isClosed,

  _createdTime: getCreatedTimeFromDummy(d),
  _eventTime: getEventTimeFromDummy(d),
});

export default function useTogetherItems(
  selectedEventType = "전체",
  sortOption = "event_desc" // 기본: 최근 이벤트순
) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const posts = (loadPosts("together") || []).map(fromPost);
    const dummies = (togetherData || []).map(fromDummy);

    // ID 기준 병합 (실제 글이 있으면 덮어쓰기)
    const map = new Map();
    [...dummies, ...posts].forEach((it) => {
      if (!it?.togetherId) return;
      map.set(it.togetherId, { ...(map.get(it.togetherId) || {}), ...it });
    });

    let list = Array.from(map.values());

    // 유형 필터
    if (selectedEventType !== "전체") {
      list = list.filter(
        (it) => (it.eventType ?? "기타") === selectedEventType
      );
    }

    // 정렬
    list.sort((a, b) => {
      switch (sortOption) {
        case "createdAt_desc": // 최근 작성순
          return (b._createdTime || 0) - (a._createdTime || 0);
        case "createdAt_asc": // 작성 오래된순
          return (a._createdTime || 0) - (b._createdTime || 0);
        case "views_desc": // 조회수많은순
          return (b.views || 0) - (a.views || 0);
        case "event_asc": // 이벤트 오래된순
          return (a._eventTime || 0) - (b._eventTime || 0);
        case "event_desc": // 최근 이벤트순
        default:
          return (b._eventTime || 0) - (a._eventTime || 0);
      }
    });

    setItems(list);
    setLoading(false);
  }, [selectedEventType, sortOption]);

  return { items, loading };
}
