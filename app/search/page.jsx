"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MainSearchBar from "@/components/global/MainSearchBar";
import EventList from "@/components/events/EventList";
import TogetherList from "@/components/together/TogetherList";
import { getEvents } from "@/lib/api/eventApi";
import togetherApi from "@/lib/api/togetherApi";

export default function TotalSearch() {

  const searchParams = useSearchParams();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [eventData, setEventData] = useState([]);
  const [togetherData, setTogetherData] = useState([]);
  const [eventCount, setEventCount] = useState(0);
  const [togetherCount, setTogetherCount] = useState(0);

  // 이벤트 데이터 매핑 함수 (events/page.jsx의 mapListItem과 동일)
  const mapEventListItem = (event) => {
    console.log("mapEventListItem - event data:", event);

    const eventId = event.id || event.eventId || null;

    // 위치 처리
    const toLocation = (obj) => {
      const level1 = typeof obj?.region?.level1 === "string" ? obj.region.level1.trim() : "";
      const level2 = typeof obj?.region?.level2 === "string" ? obj.region.level2.trim() : "";
      const level3 = typeof obj?.region?.level3 === "string" ? obj.region.level3.trim() : "";
      const city = typeof obj?.region?.city === "string" ? obj.region.city.trim() : "";
      const district = typeof obj?.region?.district === "string" ? obj.region.district.trim() : "";

      const parts = level1 || level2 || level3
        ? [level1, level2, level3].filter(Boolean)
        : [city, district].filter(Boolean);

      return parts.length > 0
        ? parts.join(" ")
        : (obj?.eventLocation && String(obj.eventLocation).trim()) || "미정";
    };

    return {
      eventId: eventId,
      id: eventId,
      title: event.title,
      eventType: event.eventType,
      startDate: event.startDate,
      endDate: event.endDate,
      location: toLocation(event),
      region: event.region || null,
      avgRating: event.avgRating ? Number(event.avgRating) : 0,
      score: event.avgRating ? Number(event.avgRating) : 0,
      viewCount: event.viewCount || 0,
      interestCount: event.interestCount || 0,
      mainImagePath: event.mainImagePath,
      thumbnailImagePath: event.thumbnailImagePath,
      mainImageUrl: event.mainImageUrl,
      imgSrc: event.imgSrc,
      imageUrl: event.imageUrl,
      image: event.image,
      isInterested: event.isInterested === true,
      eventLocation: event.eventLocation,
      _key: `${eventId}_${event.eventType}`,
    };
  };

  useEffect(() => {
    // URL 쿼리 파라미터에서 검색어 가져오기
    const query = searchParams.get("q") || "";
    setKeyword(query);

    // 검색어가 있을 때만 검색 실행
    if (query.trim()) {
      fetchSearchData(query);
    } else {
      // 검색어가 없으면 초기화
      setEventData([]);
      setEventCount(0);
      setTogetherData([]);
      setTogetherCount(0);
    }
  }, [searchParams]);

  // 동행모집글 데이터 매핑 함수
  const mapTogetherListItem = (together) => {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

    const location = together.region ?
      [together.region.level1, together.region.level2, together.region.level3]
        .filter(Boolean)
        .join(' ') || '미정'
      : '미정';

    // 이미지 경로 처리 (동행 페이지와 동일한 로직)
    const imgSrc = together.event?.eventImage ||
      (together.event?.mainImagePath
        ? `${BASE_URL}${together.event.mainImagePath}`
        : together.event?.thumbnailImagePath
        ? `${BASE_URL}${together.event.thumbnailImagePath}`
        : "/img/default_img.svg");

    return {
      id: together.id,
      togetherId: together.id,
      title: together.title,
      region: together.region,
      location: location,
      eventType: together.eventType,
      eventTitle: together.eventTitle,
      eventName: together.event?.title || together.event?.eventName || together.eventTitle,
      meetingDate: together.meetingDate,
      currentParticipants: together.currentParticipants || 0,
      maxParticipants: together.maxParticipants || 0,
      group: `${together.currentParticipants || 0}/${together.maxParticipants}`,
      isActive: together.isActive,
      active: together.isActive,
      authorNickname: together.authorNickname,
      host: together.host,
      author: together.host?.nickname || together.host?.displayName || together.authorNickname || '-',
      // 이미지 관련 필드들
      imgSrc: imgSrc,
      event: together.event,
      eventSnapshot: together.event,
      _key: `together_${together.id}`
    };
  };

  // 검색 데이터 가져오기 함수
  const fetchSearchData = async (searchQuery) => {
    // 로딩 상태 표시를 위해 카운트 초기화
    setEventCount(0);
    setTogetherCount(0);

    try {
      // 이벤트 검색
      const fetchEventData = async () => {
        try {
          const response = await getEvents({
            keyword: searchQuery,
            limit: 3
          });
          console.log("검색 페이지 - events response:", response);
          console.log("검색 페이지 - response type:", typeof response);
          console.log("검색 페이지 - response.data:", response?.data);
          console.log("검색 페이지 - response.totalCount:", response?.totalCount);

          // 응답 구조에 따라 처리
          let rawEvents = [];
          let totalCount = 0;

          if (response && typeof response === 'object' && response.data) {
            // 헤더 정보가 포함된 경우 (limit이 있는 경우)
            rawEvents = response.data;
            totalCount = response.totalCount || 0;
            console.log(">>> 헤더 정보 사용: totalCount =", totalCount);
          } else {
            // 기존 방식 (배열이 직접 반환된 경우)
            rawEvents = Array.isArray(response) ? response : [];
            totalCount = rawEvents.length;
            console.log(">>> 배열 길이 사용: totalCount =", totalCount);
          }

          const mappedEvents = Array.isArray(rawEvents) ? rawEvents.map(mapEventListItem) : [];
          setEventData(mappedEvents);
          setEventCount(totalCount);

          console.log("=== 이벤트 검색 결과 ===");
          console.log("검색 페이지 - mapped events:", mappedEvents);
          console.log("검색 페이지 - event total count:", totalCount);
          console.log("검색 페이지 - event data count:", mappedEvents.length);
        } catch (error) {
          console.error("이벤트 데이터 로드 실패:", error);
          setEventData([]);
          setEventCount(0);
        }
      };

      // 동행모집글 검색
      const fetchTogetherData = async () => {
        try {
          const response = await togetherApi.search({
            keyword: searchQuery,
            limit: 3
          });
          console.log("검색 페이지 - together response:", response);
          console.log("검색 페이지 - response type:", typeof response);
          console.log("검색 페이지 - response.data:", response?.data);
          console.log("검색 페이지 - response.totalCount:", response?.totalCount);

          // 응답 구조에 따라 처리
          let rawTogethers = [];
          let totalCount = 0;

          if (response && typeof response === 'object' && response.data) {
            // 헤더 정보가 포함된 경우 (limit이 있는 경우)
            rawTogethers = response.data;
            totalCount = response.totalCount || 0;
            console.log(">>> 헤더 정보 사용: totalCount =", totalCount);
          } else {
            // 기존 방식 (배열이 직접 반환된 경우)
            rawTogethers = Array.isArray(response) ? response : [];
            totalCount = rawTogethers.length;
            console.log(">>> 배열 길이 사용: totalCount =", totalCount);
          }

          const mappedTogethers = Array.isArray(rawTogethers) ? rawTogethers.map(mapTogetherListItem) : [];
          setTogetherData(mappedTogethers);
          setTogetherCount(totalCount);

          console.log("=== 동행모집글 검색 결과 ===");
          console.log("검색 페이지 - mapped togethers:", mappedTogethers);
          console.log("검색 페이지 - together total count:", totalCount);
          console.log("검색 페이지 - together data count:", mappedTogethers.length);
        } catch (error) {
          console.error("동행모집글 데이터 로드 실패:", error);
          setTogetherData([]);
          setTogetherCount(0);
        }
      };

      // 병렬로 두 검색 실행
      await Promise.all([fetchEventData(), fetchTogetherData()]);

    } catch (error) {
      console.error("검색 데이터 로드 실패:", error);
      setEventData([]);
      setEventCount(0);
      setTogetherData([]);
      setTogetherCount(0);
    }
  };

  // 검색 실행 핸들러
  const handleSearch = (newKeyword) => {
    router.push(`/search?q=${encodeURIComponent(newKeyword)}`);
  };

  function Title({ site, keyword, count, moreLink }) {
    const title = `${site}의 "${keyword}" 검색 결과`;
    return (
      <div className="h-7 mb-2 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-xl text-[#26282a] leading-[1.4]">
            {title}
          </h2>
          <div className="text-gray-500">
            총 {count}건
          </div>
        </div>
        {moreLink && (
          <button
            onClick={() => router.push(`${moreLink}?q=${encodeURIComponent(keyword)}`)}
            className="text-sm text-gray-600 hover:text-black transition-colors"
          >
            더보기 →
          </button>
        )}
      </div>
    );
  }

  /**ui렌더링*/
  return (
    <div className="my-10">
      {/* 검색바 추가 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-center mb-6">통합검색</h1>
        <MainSearchBar
          initialValue={keyword}
          placeholder="검색어를 입력해주세요"
          onSearch={handleSearch}
          showTags={false}
        />
      </div>

      {/* 검색 결과가 있을 때만 표시 */}
      {keyword && (
        <>
          <div className="mb-10">
            <Title site="[이벤트] " keyword={keyword} count={eventCount} moreLink="/events" />
            <div className="space-y-0">
              {eventData.length > 0 ? (
                eventData.map((event) => (
                  <EventList
                    key={event._key || `event_${event.id}`}
                    {...event}
                  />
                ))
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                  "{keyword}"와(과) 관련된 이벤트를 찾을 수 없습니다
                </div>
              )}
            </div>
            {eventData.length > 0 && (
              <div className="text-center mt-4">
                <button
                  onClick={() => router.push(`/events?q=${encodeURIComponent(keyword)}`)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                >
                  더보기
                </button>
              </div>
            )}
          </div>
          <div className="mb-10">
            <Title site="[동행모집글] " keyword={keyword} count={togetherCount} moreLink="/with" />
            <div className="space-y-0">
              {togetherData.length > 0 ? (
                togetherData.map((together) => (
                  <TogetherList
                    key={together._key || `together_${together.id}`}
                    {...together}
                  />
                ))
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                  "{keyword}"와(과) 관련된 동행모집글을 찾을 수 없습니다
                </div>
              )}
            </div>
            {togetherData.length > 0 && (
              <div className="text-center mt-4">
                <button
                  onClick={() => router.push(`/with?q=${encodeURIComponent(keyword)}`)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                >
                  더보기
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* 검색어가 없을 때 */}
      {!keyword && (
        <div className="text-center py-20 text-gray-500">
          검색어를 입력해주세요
        </div>
      )}
    </div>
  );
}
