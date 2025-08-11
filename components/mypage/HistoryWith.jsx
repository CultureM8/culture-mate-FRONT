import MenuList from "../global/MenuList";
import TogetherGallery from "@/components/together/TogetherGallery";
import TogetherList from "../together/TogetherList";
import TogetherGalleryLayout from "../global/ListGalleryLayout";
import GalleryLayout from "@/components/global/GalleryLayout";
import EditSetting from "@/components/global/EditSetting";
import { useState } from "react";

export default function HistoryWith() {
  const [activeButton, setActiveButton] = useState("friend");
  const [viewType, setViewType] = useState("gallery");

  const eventData = [
    {
      imgSrc: "",
      alt: "",
      title: "제목-1",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-2",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-3",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-4",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-5",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-6",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-7",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-8",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-9",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-1",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-2",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-3",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-4",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-5",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-6",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-7",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-8",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-9",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-1",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-2",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-3",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-4",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-5",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-6",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-7",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-8",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-9",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex gap-6">
          <MenuList selected={viewType} onChange={setViewType} />
          <div className="flex gap-6">
            <button
              onClick={() => setActiveButton("friend")}
              className={`text-sm hover:text-black hover:underline ${
                activeButton === "friend" ? "underline" : "text-gray-500"
              }`}
            >
              친구의 글만
            </button>
            <button
              onClick={() => setActiveButton("completed")}
              className={`text-sm hover:text-black hover:underline ${
                activeButton === "completed" ? "underline" : "text-gray-500"
              }`}
            >
              완료된 모집 표시
            </button>
          </div>
        </div>
        <EditSetting />
      </div>
      {/* viewType에 따라 보여줄 컴포넌트 분기 */}
      {viewType === "gallery" ? (
        <GalleryLayout Component={TogetherGallery} items={eventData} />
      ) : (
        <TogetherGalleryLayout Component={TogetherList} items={eventData} />
      )}
    </>
  );
}
