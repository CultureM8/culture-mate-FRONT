import EventPageClient from "./EventPageClient";
import { getEventById } from "@/lib/api/eventApi";

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

const mapDetail = (data) => {
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

  const country =
    typeof data?.region?.country === "string" ? data.region.country.trim() : "";
  const city2 =
    typeof data?.region?.city === "string" ? data.region.city.trim() : "";
  const district2 =
    typeof data?.region?.district === "string"
      ? data.region.district.trim()
      : "";
  const fullAddr = [country, city2, district2].filter(Boolean).join(" ");

  return {
    eventId: data.id,
    title: data.title,
    content: data.description || data.content || "",
    location: toLocation(data),
    eventLocation: data.eventLocation || "미정",
    address: fullAddr,
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
    imgSrc: toImg(data.mainImageUrl),
    alt: data.title,
    isHot: false,
    score: data.avgRating ? Number(data.avgRating) : 0,
    avgRating: data.avgRating ? Number(data.avgRating) : 0,
    reviewCount: data.reviewCount || 0,
    likesCount: data.interestCount || 0,
    viewCount: data.viewCount || 0,
    contentImageUrls: data.contentImageUrls || [],
    ticketPrices: data.ticketPrices || [],
    region: data.region || null,
  };
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
