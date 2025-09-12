"use client";

import { useEffect, useState } from "react";
import { fetchTogetherList } from "@/lib/api/togetherApi";

/* 백엔드 응답 데이터 -> 카드 아이템 변환 */
const fromServerResponse = (item = {}) => {
  // 백엔드 응답 구조에 맞게 매핑
  return {
    togetherId: item.id || item.togetherId,
    imgSrc:
      item.eventSnapshot?.eventImage ||
      item.eventImage ||
      item.imgSrc ||
      "/img/default_img.svg",
    title: item.title || "제목 없음",
    eventType: item.eventSnapshot?.eventType || item.eventType || "기타",
    eventName:
      item.eventSnapshot?.name ||
      item.eventSnapshot?.eventName ||
      item.eventName ||
      "",
    group: item.maxParticipants
      ? `${item.currentParticipants || 0}/${item.maxParticipants}`
      : item.companionCount || 1,
    date: item.meetingDate
      ? new Date(item.meetingDate)
          .toLocaleDateString("ko-KR")
          .replace(/\./g, ".")
          .replace(/ /g, "")
      : item.companionDate
      ? new Date(item.companionDate)
          .toLocaleDateString("ko-KR")
          .replace(/\./g, ".")
          .replace(/ /g, "")
      : "",
    address: item.eventSnapshot?.location || item.address || "",
    meetingLocation: item.meetingLocation, // 추가
    region: item.region, // 추가
    author:
      item.host?.nickname || item.host?.displayName || item.authorName || "-",
    views: item.viewCount || item.views || 0,
    isClosed: !item.active || item.isClosed || false,

    // 백엔드 원본 필드들을 직접 전달 (컴포넌트에서 사용)
    maxParticipants: item.maxParticipants,
    currentParticipants: item.currentParticipants,
    meetingDate: item.meetingDate,
    eventSnapshot: item.event, // 백엔드에서 event 객체로 옴
    event: item.event,

    // 호스트 정보 (TogetherList에서 필요한 필드들)
    hostObj: item.host,
    hostNickname: item.host?.nickname,
    hostLoginId: item.host?.loginId || item.host?.login_id,
    hostId: item.host?.id,
    host: item.host, // 백엔드 호스트 객체 직접 전달

    // 정렬을 위한 원본 데이터 보존
    _createdTime: item.createdAt ? new Date(item.createdAt).getTime() : 0,
    _eventTime: item.meetingDate
      ? new Date(item.meetingDate).getTime()
      : item.companionDate
      ? new Date(item.companionDate).getTime()
      : 0,
    _views: item.viewCount || item.views || 0,

    // 원본 데이터 보존 (상세 페이지에서 필요할 수 있음)
    _original: item,
  };
};

/* 정렬 옵션을 백엔드 API 파라미터로 변환 */
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
      return "meetingDate,desc"; // 기본: 최근 이벤트순
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

        // API 파라미터 구성
        const params = {
          eventType:
            selectedEventType === "전체" ? undefined : selectedEventType,
          sort: getSortParam(sortOption),
          // 필요하다면 페이징 파라미터도 추가
          page: 0,
          size: 100, // 일단 충분히 큰 값으로
        };

        // 백엔드 API 호출
        const response = await fetchTogetherList(params);

        // 응답 데이터 구조에 따라 조정 필요
        // 만약 페이징된 응답이라면: response.content 또는 response.data
        // 단순 배열이라면: response 그대로
        const rawItems = Array.isArray(response)
          ? response
          : response.content || response.data || [];

        // 데이터 변환
        const transformedItems = rawItems.map(fromServerResponse);

        // 클라이언트 사이드에서 추가 정렬이 필요한 경우
        // (백엔드에서 정렬을 완전히 처리한다면 이 부분은 불필요)
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
          const params = {
            eventType:
              selectedEventType === "전체" ? undefined : selectedEventType,
            sort: getSortParam(sortOption),
            page: 0,
            size: 100,
          };
          const response = await fetchTogetherList(params);
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
