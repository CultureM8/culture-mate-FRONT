import EventPageClient from "./EventPageClient";
import { getEventById } from "@/lib/api/eventApi";
import {
  getEventMainImageUrl,
  getEventContentImageUrls,
} from "@/lib/utils/imageUtils";

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

const mapDetail = (data) => {
  console.log("page.jsx mapDetail - input data:", data);

  const priceList = Array.isArray(data?.ticketPrices)
    ? data.ticketPrices.map((p) => ({
        type: p.ticketType,
        price: Number(p.price).toLocaleString(),
      }))
    : [];

  const ticketTypes =
    Array.isArray(data?.ticketPrices) && data.ticketPrices.length > 0
      ? data.ticketPrices.map((p) => p.ticketType).join(", ")
      : "미정";

  // 백엔드 RegionDto.Response 구조에 맞게 수정
  const regionLevel1 = data?.region?.level1 || "";
  const regionLevel2 = data?.region?.level2 || "";
  const regionLevel3 = data?.region?.level3 || "";
  const fullAddr = [regionLevel1, regionLevel2, regionLevel3]
    .filter(Boolean)
    .join(" ");

  const result = {
    eventId: data.id,
    title: data.title,
    content: data.description || data.content || "",
    location: toLocation(data),
    eventLocation: data.eventLocation || "미정",
    address: data.address || fullAddr,
    addressDetail: data.addressDetail || "",
    startDate: data.startDate,
    endDate: data.endDate,
    viewTime: data.durationMin ? `${data.durationMin}분` : "미정",
    ageLimit: data.minAge ? `${data.minAge}세 이상` : "전체관람가",
    ticketType: ticketTypes,
    price:
      priceList.length > 0
        ? priceList.map((p) => `${p.type} ${p.price}원`).join(", ")
        : "미정",
    priceList,
    eventType: data.eventType,
    imgSrc: getEventMainImageUrl(data, true),
    alt: data.title,
    isHot: false,
    score: data.avgRating ? Number(data.avgRating) : 0,
    avgRating: data.avgRating ? Number(data.avgRating) : 0,
    reviewCount: data.reviewCount || 0,
    likesCount: data.interestCount || 0,
    viewCount: data.viewCount || 0,
    contentImageUrls: getEventContentImageUrls(data),
    ticketPrices: data.ticketPrices || [],
    region: data.region || null,
  };

  console.log("page.jsx mapDetail - output result:", result);
  return result;
};

export default async function EventId({ params }) {
  const { eventId } = await params;

  let eventData = null;
  try {
    const raw = await getEventById(eventId);
    eventData = mapDetail(raw);
  } catch (err) {
    console.error("이벤트 데이터 로딩 실패:", err);
  }

  if (!eventData) {
    return (
      <>
        <h1 className="text-4xl font-bold py-[10px] h-16 px-6">이벤트</h1>
        <div className="flex justify-center items-center h-64 px-6">
          <div>이벤트를 찾을 수 없습니다.</div>
        </div>
      </>
    );
  }

  return <EventPageClient eventData={eventData} />;
}
