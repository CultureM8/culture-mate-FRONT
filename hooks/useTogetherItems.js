"use client";

import { useEffect, useState } from "react";
import togetherApi from "@/lib/api/togetherApi";
import { getEventTypeLabel } from "@/lib/api/eventApi";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

/* 백엔드 TogetherDto.Response -> 카드 아이템 변환 */
const fromServerResponse = (item = {}) => {
  return {
    // 기본 필드
    togetherId: item.id,
    title: item.title || "제목 없음",
    content: item.content || "",

    // 이벤트 정보 (한글 변환)
    eventType: getEventTypeLabel(item.event?.eventType) || "기타",
    eventName: item.event?.eventName || item.event?.title || "",
    imgSrc:
      item.event?.eventImage ||
      (item.event?.mainImagePath
        ? `${BASE_URL}${item.event.mainImagePath}`
        : item.event?.thumbnailImagePath
        ? `${BASE_URL}${item.event.thumbnailImagePath}`
        : "/img/default_img.svg"),
    event: item.event,
    eventSnapshot: item.event,

    // 호스트 정보
    host: item.host,
    hostId: item.host?.id,
    hostNickname: item.host?.nickname || item.host?.displayName,
    hostLoginId: item.host?.loginId || item.host?.login_id,
    author: item.host?.nickname || item.host?.displayName || "-",

    // 참여자 정보
    maxParticipants: item.maxParticipants,
    currentParticipants: item.currentParticipants,
    group: `${item.currentParticipants || 0}/${item.maxParticipants}`,

    // 날짜 및 장소
    meetingDate: item.meetingDate,
    date: item.meetingDate
      ? new Date(item.meetingDate)
          .toLocaleDateString("ko-KR")
          .replace(/\./g, ".")
          .replace(/ /g, "")
      : "",
    meetingLocation: item.meetingLocation,
    region: item.region,
    address: item.meetingLocation || "",

    // 상태
    active: item.active,
    isClosed: !item.active,
    isInterested: Boolean(item.isInterested), // 관심 등록 상태

    // 기타
    // views: 0,

    // 정렬을 위한 시간 데이터
    _createdTime: item.createdAt ? new Date(item.createdAt).getTime() : 0,
    _eventTime: item.meetingDate ? new Date(item.meetingDate).getTime() : 0,
    _views: 0,

    // 원본 데이터 보존
    _original: item,
  };
};

// UI 라벨을 백엔드 이벤트 타입으로 변환 (events/page와 동일)
const mapUiLabelToBackendTypes = (label) => {
  switch (label) {
    case "뮤지컬":
      return ["MUSICAL"];
    case "영화":
      return ["MOVIE"];
    case "연극":
      return ["THEATER"];
    case "전시":
      return ["EXHIBITION"];
    case "클래식":
      return ["CLASSICAL"];
    case "무용":
      return ["DANCE"];
    case "클래식/무용":
      return ["CLASSICAL", "DANCE"];
    case "콘서트":
      return ["CONCERT"];
    case "페스티벌":
      return ["FESTIVAL"];
    case "콘서트/페스티벌":
      return ["CONCERT", "FESTIVAL"];
    case "지역행사":
      return ["LOCAL_EVENT"];
    case "기타":
      return ["OTHER"];
    default:
      return [];
  }
};

const getSortParam = (sortOption) => {
  switch (sortOption) {
    case "createdAt_desc":
      return "createdAt,desc";
    case "createdAt_asc":
      return "createdAt,asc";
    case "event_desc":
      return "meetingDate,desc";
    case "event_asc":
      return "meetingDate,asc";
    case "views_desc":
      // 조회수 필드가 없으므로 생성일 기준으로 대체
      return "createdAt,desc";
    default:
      return "meetingDate,desc";
  }
};

export default function useTogetherItems(
  selectedEventType = "전체",
  sortOption = "event_desc"
) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        setError(null);

        // 백엔드 API 호출 - 이벤트 타입 매핑 적용
        let response;
        if (selectedEventType === "전체") {
          // 전체 목록 조회
          response = await togetherApi.getAll();
        } else {
          // UI 라벨을 백엔드 타입으로 변환
          const backendTypes = mapUiLabelToBackendTypes(selectedEventType);

          if (backendTypes.length === 0) {
            // 매핑되지 않은 타입인 경우 전체 조회
            response = await togetherApi.getAll();
          } else if (backendTypes.length === 1) {
            // 단일 타입 검색
            response = await togetherApi.search({
              eventType: backendTypes[0],
            });
          } else {
            // 복수 타입 검색 (Promise.all로 병렬 처리)
            const results = await Promise.all(
              backendTypes.map((type) => togetherApi.search({ eventType: type }))
            );

            // 중복 제거하며 결과 병합
            const seen = new Set();
            const merged = [];
            for (const arr of results) {
              if (!Array.isArray(arr)) continue;
              for (const item of arr) {
                const key = item?.id;
                if (key == null || seen.has(key)) continue;
                seen.add(key);
                merged.push(item);
              }
            }
            response = merged;
          }
        }

        // 만약 페이징된 응답이라면: response.content 또는 response.data
        // 단순 배열이라면: response 그대로
        const rawItems = Array.isArray(response)
          ? response
          : response.content || response.data || [];

        // 데이터 변환
        const transformedItems = rawItems.map(fromServerResponse);

        // 클라이언트 사이드에서 추가 정렬이 필요한 경우
        const sortedItems = [...transformedItems].sort((a, b) => {
          switch (sortOption) {
            case "createdAt_desc":
              return b._createdTime - a._createdTime;
            case "createdAt_asc":
              return a._createdTime - b._createdTime;
            case "views_desc":
              return b._views - a._views;
            case "event_asc":
              return a._eventTime - b._eventTime;
            case "event_desc":
            default:
              return b._eventTime - a._eventTime;
          }
        });

        setItems(sortedItems);
      } catch (err) {
        console.error("모임 목록 조회 실패:", err);
        setError(err.message || "모임 목록을 불러오는데 실패했습니다.");

        // 에러 발생 시 빈 배열로 설정
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [selectedEventType, sortOption]);

  return {
    items,
    loading,
    error,
    // 에러 재시도 함수
    refetch: () => {
      const loadItems = async () => {
        try {
          setLoading(true);
          setError(null);
          // refetch도 동일한 로직 적용
          let response;
          if (selectedEventType === "전체") {
            response = await togetherApi.getAll();
          } else {
            const backendTypes = mapUiLabelToBackendTypes(selectedEventType);
            if (backendTypes.length === 0) {
              response = await togetherApi.getAll();
            } else if (backendTypes.length === 1) {
              response = await togetherApi.search({
                eventType: backendTypes[0],
              });
            } else {
              const results = await Promise.all(
                backendTypes.map((type) => togetherApi.search({ eventType: type }))
              );
              const seen = new Set();
              const merged = [];
              for (const arr of results) {
                if (!Array.isArray(arr)) continue;
                for (const item of arr) {
                  const key = item?.id;
                  if (key == null || seen.has(key)) continue;
                  seen.add(key);
                  merged.push(item);
                }
              }
              response = merged;
            }
          }
          const rawItems = Array.isArray(response)
            ? response
            : response.content || response.data || [];
          const transformedItems = rawItems.map(fromServerResponse);
          setItems(transformedItems);
        } catch (err) {
          setError(err.message || "모임 목록을 불러오는데 실패했습니다.");
          setItems([]);
        } finally {
          setLoading(false);
        }
      };
      loadItems();
    },
  };
}
