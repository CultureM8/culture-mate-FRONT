"use client";

import InterestTab from "@/components/mypage/InterestTab";
import PageTitle from "@/components/global/PageTitle";
import { useState, useEffect, useContext } from "react";
import { getUserInterestEvents } from "@/lib/api/eventApi";
import { getUserInterestTogether } from "@/lib/api/togetherApi";
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

const mapInterestTogetherData = (together) => {
  const togetherId = together.id || null;
  
  console.log("매핑 중인 together 데이터:", together);
  console.log("이벤트 데이터:", together.event);
  console.log("이미지 경로:", together.event?.mainImagePath || together.event?.thumbnailImagePath);
  
  return {
    // 기본 식별자
    id: togetherId,
    togetherId: togetherId,
    
    // 제목/내용
    title: together.title || "제목 없음",
    content: together.content || "",
    
    // 이벤트 정보
    eventType: together.event?.eventType || "기타",
    eventName: together.event?.title || together.event?.eventName || "이벤트명",
    eventSnapshot: together.event,
    event: together.event,
    
    // 호스트 정보
    host: together.host,
    hostId: together.host?.id,
    hostNickname: together.host?.nickname || together.host?.displayName,
    hostLoginId: together.host?.loginId || together.host?.login_id,
    
    // 참여자 정보
    maxParticipants: together.maxParticipants,
    currentParticipants: together.currentParticipants,
    group: `${together.currentParticipants || 0}/${together.maxParticipants}`,
    
    // 날짜 및 장소
    meetingDate: together.meetingDate,
    date: together.meetingDate,
    meetingLocation: together.meetingLocation,
    region: together.region,
    address: together.meetingLocation || "",
    
    // 상태
    active: together.active,
    isClosed: !together.active,
    isInterested: true,
    
    // 이미지 
    imgSrc: together.event ? getEventMainImageUrl(together.event) : "/img/default_img.svg",
    
    // href
    href: `/together/${togetherId}`,
    
    // 기타
    _key: `together_${togetherId}`,
  };
};

export default function Interest() {
  const [eventData, setEventData] = useState([]);
  const [togetherData, setTogetherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLogined, user } = useContext(LoginContext);

  // 관심 목록 데이터 가져오기
  const fetchInterestData = async () => {
    if (!isLogined || !user) {
      console.log("로그인되지 않은 상태이므로 관심 목록을 가져오지 않습니다.");
      setEventData([]);
      setTogetherData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 관심 이벤트와 관심 동행을 병렬로 가져오기
      const [rawEvents, rawTogethers] = await Promise.all([
        getUserInterestEvents().catch(err => {
          console.error("관심 이벤트 가져오기 실패:", err);
          return [];
        }),
        getUserInterestTogether().catch(err => {
          console.error("관심 동행 가져오기 실패:", err);
          return [];
        })
      ]);

      console.log("가져온 관심 이벤트:", rawEvents);
      console.log("가져온 관심 동행:", rawTogethers);

      // 이벤트 데이터 매핑
      const mappedEvents = Array.isArray(rawEvents)
        ? rawEvents.map(mapInterestEventData)
        : [];

      // 동행 데이터 매핑
      const mappedTogethers = Array.isArray(rawTogethers)
        ? rawTogethers.map(mapInterestTogetherData)
        : [];

      console.log("매핑된 이벤트 데이터:", mappedEvents);
      console.log("매핑된 동행 데이터:", mappedTogethers);

      setEventData(mappedEvents);
      setTogetherData(mappedTogethers);
      setError(null);
    } catch (error) {
      console.error("관심 목록 가져오기 실패:", error);
      setError("관심 목록을 불러오는데 실패했습니다.");
      setEventData([]);
      setTogetherData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterestData();
  }, [isLogined, user]);

  // 관심 상태 변경 이벤트 리스너
  useEffect(() => {
    const handleInterestChanged = () => {
      console.log("관심 목록 페이지 - 관심 상태 변경 감지, 데이터 새로고침");

      // debounce로 너무 자주 호출되지 않도록 제한
      const timeoutId = setTimeout(() => {
        fetchInterestData();
      }, 300);

      return () => clearTimeout(timeoutId);
    };

    window.addEventListener("event-interest-changed", handleInterestChanged);
    return () => window.removeEventListener("event-interest-changed", handleInterestChanged);
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
      console.log("관심 목록 새로고침...");
      
      // 관심 이벤트와 관심 동행을 병렬로 가져오기
      const [rawEvents, rawTogethers] = await Promise.all([
        getUserInterestEvents().catch(err => {
          console.error("관심 이벤트 새로고침 실패:", err);
          return [];
        }),
        getUserInterestTogether().catch(err => {
          console.error("관심 동행 새로고침 실패:", err);
          return [];
        })
      ]);

      const mappedEvents = Array.isArray(rawEvents)
        ? rawEvents.map(mapInterestEventData)
        : [];
        
      const mappedTogethers = Array.isArray(rawTogethers)
        ? rawTogethers.map(mapInterestTogetherData)
        : [];

      setEventData(mappedEvents);
      setTogetherData(mappedTogethers);
    } catch (error) {
      console.error("관심 목록 새로고침 실패:", error);
    }
  };

  return (
    <>
      <PageTitle>관심 목록</PageTitle>
      <div className="mt-4 space-y-1">
        <InterestTab 
          eventData={eventData} 
          togetherData={togetherData}
          onRefreshData={handleRefreshData} 
        />
      </div>
    </>
  );
}
