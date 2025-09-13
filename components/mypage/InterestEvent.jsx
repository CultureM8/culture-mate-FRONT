"use client";

import EventGallery from "@/components/events/main/EventGallery";
import GalleryLayout from "@/components/global/GalleryLayout";
import EditSetting from "@/components/global/EditSetting";
import { useState, useEffect } from "react";

export default function InterestEvent({ eventData }) {
  const [selectedType, setSelectedType] = useState("전체");
  const [currentEventData, setCurrentEventData] = useState(eventData || []);

  useEffect(() => {
    setCurrentEventData(eventData || []);
  }, [eventData]);

  /* 다른 페이지에서 관심 해제 시 실시간 반영*/
  useEffect(() => {
    const handleInterestChanged = (event) => {
      const { eventId, interested } = event.detail;

      if (!interested) {
        /*관심 해제된 이벤트를 목록에서 제거*/
        setCurrentEventData((prev) =>
          prev.filter((item) => String(item.eventId) !== String(eventId))
        );
      }
    };

    window.addEventListener("interest-changed", handleInterestChanged);
    return () =>
      window.removeEventListener("interest-changed", handleInterestChanged);
  }, []);

  return (
    <>
      {currentEventData.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <div className="text-gray-500">관심 등록한 이벤트가 없습니다.</div>
        </div>
      ) : (
        <GalleryLayout Component={EventGallery} items={currentEventData} />
      )}
    </>
  );
}
