"use client";

import EventGallery from "@/components/events/main/EventGallery";
import GalleryLayout from "@/components/global/GalleryLayout";
import EditSetting from "@/components/global/EditSetting";
import { useState } from "react";

export default function HistoryEvent({ eventData }) {
  const [selectedType, setSelectedType] = useState("전체");

  return (
    <>
      <EditSetting />
      <GalleryLayout Component={EventGallery} items={eventData} />
    </>
  );
}
