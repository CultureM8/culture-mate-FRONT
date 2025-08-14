"use client";

import EventGallery from "@/components/events/EventGallery";
import GalleryLayout from "@/components/global/GalleryLayout";
import EditSetting from "@/components/global/EditSetting";
import { useState } from "react";

export default function InterestEvent({ eventData }) {
  const [selectedType, setSelectedType] = useState("전체");

  return (
    <>
      {/* 관심이벤트 페이지 */}
      {/* 편집, 설정 버튼 */}
      <EditSetting />
      {/* GalleryLayout은 items로 데이터를 받아들이기 때문에 
          items={eventData}로 코딩합니다.*/}
      <GalleryLayout Component={EventGallery} items={eventData} />
    </>
  );
}
