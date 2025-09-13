"use client";

import InterestTab from "@/components/mypage/InterestTab";
import PageTitle from "@/components/global/PageTitle";
import { useState, useEffect, useContext } from "react";
import { getUserInterestEvents } from "@/lib/api/eventApi";
import { LoginContext } from "@/components/auth/LoginProvider";
import { getEventMainImageUrl } from "@/lib/utils/imageUtils";

/** region → location 문자열(undef-safe) */
const toLocation = (obj) => {
  // 백엔드 RegionDto.Response 구조 (level1, level2, level3)
  const level1 =
    typeof obj?.region?.level1 === "string" ? obj.region.level1.trim() : "";
  const level2 =
    typeof obj?.region?.level2 === "string" ? obj.region.level2.trim() : "";
  const level3 =
    typeof obj?.region?.level3 === "string" ? obj.region.level3.trim() : "";

  const city =
    typeof obj?.region?.city === "string" ? obj.region.city.trim() : "";
  const district =
    typeof obj?.region?.district === "string" ? obj.region.district.trim() : "";

  const parts =
    level1 || level2 || level3
      ? [level1, level2, level3].filter(Boolean)
      : [city, district].filter(Boolean);

  return parts.length > 0
    ? parts.join(" ")
    : (obj?.eventLocation && String(obj.eventLocation).trim()) || "미정";
};

const mapInterestEventData = (event) => {
  const eventId = event.id || event.eventId || null;

  return {
    title: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    location: toLocation(event),
    imgSrc: getEventMainImageUrl(event),
    alt: event.title,
    href: `/events/${eventId}`,
    isHot: false,
    eventType: event.eventType,
    id: eventId ? String(eventId) : undefined,
    viewCount: event.viewCount || 0,
    interestCount: event.interestCount || 0,
    region: event.region || null,
    score: event.avgRating ? Number(event.avgRating) : 0,
    avgRating: event.avgRating ? Number(event.avgRating) : 0,
    _key: `${eventId}_${event.eventType}`,
    isInterested: true,
    eventId: eventId,
  };
};

export default function Interest() {
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLogined, user } = useContext(LoginContext);

  useEffect(() => {
    const fetchInterestEvents = async () => {
      if (!isLogined || !user) {
        console.log(
          "로그인되지 않은 상태이므로 관심 이벤트를 가져오지 않습니다."
        );
        setEventData([]);
        setLoading(false);
        return;
      }

      try {
        console.log("관심 이벤트 목록을 가져오는 중...");
        const rawEvents = await getUserInterestEvents();
        console.log("가져온 관심 이벤트:", rawEvents);

        const mappedEvents = Array.isArray(rawEvents)
          ? rawEvents.map(mapInterestEventData)
          : [];

        setEventData(mappedEvents);
        setError(null);
      } catch (error) {
        console.error("관심 이벤트 가져오기 실패:", error);
        setError("관심 이벤트를 불러오는데 실패했습니다.");
        setEventData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInterestEvents();
  }, [isLogined, user]);

  if (loading) {
    return (
      <>
        <PageTitle>관심 목록</PageTitle>
        <div className="mt-4 flex justify-center">
          <div>로딩 중...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageTitle>관심 목록</PageTitle>
        <div className="mt-4 flex justify-center">
          <div className="text-red-500">{error}</div>
        </div>
      </>
    );
  }

  if (!isLogined) {
    return (
      <>
        <PageTitle>관심 목록</PageTitle>
        <div className="mt-4 flex justify-center">
          <div>로그인이 필요합니다.</div>
        </div>
      </>
    );
  }

  // 데이터 새로고침 함수
  const handleRefreshData = async () => {
    if (!isLogined || !user) return;

    try {
      console.log("관심 이벤트 목록 새로고침...");
      const rawEvents = await getUserInterestEvents();
      const mappedEvents = Array.isArray(rawEvents)
        ? rawEvents.map(mapInterestEventData)
        : [];
      setEventData(mappedEvents);
    } catch (error) {
      console.error("관심 이벤트 새로고침 실패:", error);
    }
  };

  return (
    <>
      <PageTitle>관심 목록</PageTitle>
      <div className="mt-4 space-y-1">
        <InterestTab eventData={eventData} onRefreshData={handleRefreshData} />
      </div>
    </>
  );
}
