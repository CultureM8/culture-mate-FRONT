import { getEvents } from "@/lib/api/eventApi";
import { getEventMainImageUrl } from "@/lib/utils/imageUtils";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const toLocation = (obj) => {
  // 백엔드 RegionDto.Response 구조 (level1, level2, level3)
  const level1 =
    typeof obj?.region?.level1 === "string" ? obj.region.level1.trim() : "";
  const level2 =
    typeof obj?.region?.level2 === "string" ? obj.region.level2.trim() : "";
  const level3 =
    typeof obj?.region?.level3 === "string" ? obj.region.level3.trim() : "";

  // 기존 구조 호환성 (city, district)
  const city =
    typeof obj?.region?.city === "string" ? obj.region.city.trim() : "";
  const district =
    typeof obj?.region?.district === "string" ? obj.region.district.trim() : "";

  // level 구조를 우선 사용, 없으면 기존 구조 사용
  const parts =
    level1 || level2 || level3
      ? [level1, level2, level3].filter(Boolean)
      : [city, district].filter(Boolean);

  return parts.length > 0
    ? parts.join(" ")
    : (obj?.eventLocation && String(obj.eventLocation).trim()) || "미정";
};

const mapSuggestionItem = (e) => {
  console.log("mapSuggestionItem - event data:", e);

  const result = {
    id: String(e.id),
    title: e.title,
    imgSrc: getEventMainImageUrl(e, true),
    href: `/events/${e.id}`,
    link: `/events/${e.id}`,
    alt: e.title,
    location: toLocation(e),
    startDate: e.startDate,
    endDate: e.endDate,
    eventType: e.eventType,
    avgRating: e.avgRating ? Number(e.avgRating) : 0,
  };

  console.log("mapSuggestionItem - mapped result:", result);
  return result;
};

export async function getAISuggestionData(limit = 8) {
  try {
    console.log("getAISuggestionData - fetching events...");
    const raw = await getEvents();
    console.log("getAISuggestionData - raw events:", raw);
    console.log("getAISuggestionData - raw events length:", raw?.length);

    const list = Array.isArray(raw) ? raw : [];
    const mapped = list.map(mapSuggestionItem);
    const result = shuffleArray(mapped).slice(0, limit);

    console.log("getAISuggestionData - final result:", result);
    console.log("getAISuggestionData - final result length:", result.length);

    return result;
  } catch (err) {
    console.error("getAISuggestionData 실패:", err);
    return [];
  }
}
