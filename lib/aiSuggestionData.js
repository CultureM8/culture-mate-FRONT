// lib/aiSuggestionData.js
import { getEvents } from "@/lib/eventApi";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const toImg = (url) => {
  if (!url) return "/img/default_img.svg";
  if (url.startsWith("http")) return url;
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
  return `${base}${url}`;
};

const toLocation = (obj) => {
  const city =
    typeof obj?.region?.city === "string" ? obj.region.city.trim() : "";
  const district =
    typeof obj?.region?.district === "string" ? obj.region.district.trim() : "";
  const parts = [city, district].filter(Boolean);
  return parts.length > 0
    ? parts.join(" ")
    : (obj?.eventLocation && String(obj.eventLocation).trim()) || "미정";
};

const mapSuggestionItem = (e) => ({
  id: String(e.id),
  title: e.title,
  imgSrc: toImg(e.mainImageUrl),
  href: `/events/${e.id}`,
  link: `/events/${e.id}`,
  alt: e.title,
  location: toLocation(e),
  startDate: e.startDate,
  endDate: e.endDate,
  eventType: e.eventType,
  avgRating: e.avgRating ? Number(e.avgRating) : 0,
});

export async function getAISuggestionData(limit = 8) {
  try {
    const raw = await getEvents();
    const list = Array.isArray(raw) ? raw : [];
    const mapped = list.map(mapSuggestionItem);
    return shuffleArray(mapped).slice(0, limit);
  } catch (err) {
    console.error("getAISuggestionData 실패:", err);
    return [];
  }
}
