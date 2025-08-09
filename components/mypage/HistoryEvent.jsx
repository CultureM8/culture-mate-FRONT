"use client";

import EventGallery from "@/components/events/EventGallery";
import GalleryLayout from "@/components/global/GalleryLayout";
import EditSetting from "@/components/global/EditSetting";
import { useState } from "react";

export default function HistoryEvent() {
  const eventData = [
    {
      imgSrc: "",
      alt: "",
      title: "제목-1",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-2",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-3",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-4",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-5",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-6",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-7",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-8",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-9",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-1",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-2",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-3",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-4",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-5",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-6",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-7",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-8",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-9",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-1",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-2",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-3",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-4",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-5",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-6",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-7",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-8",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-9",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
  ];

  const [selectedType, setSelectedType] = useState("전체");

  return (
    <>
      <EditSetting />
      <GalleryLayout Component={EventGallery} items={eventData} />
    </>
  );
}
