import MenuList from "../global/MenuList";
import TogetherGallery from "@/components/together/TogetherGallery";
import TogetherList from "../together/TogetherList";
import ListLayout from "../global/ListLayout";
import GalleryLayout from "@/components/global/GalleryLayout";
import EditSetting from "@/components/global/EditSetting";
import { useState } from "react";

export default function HistoryWith({ eventData }) {
  const [activeButton, setActiveButton] = useState("friend");
  const [viewType, setViewType] = useState("gallery");

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
        <ListLayout Component={TogetherList} items={eventData} />
      )}
    </>
  );
}
