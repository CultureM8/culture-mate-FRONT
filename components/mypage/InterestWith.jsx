import MenuList from "../global/MenuList";
import TogetherGallery from "@/components/together/TogetherGallery";
import TogetherList from "../together/TogetherList";
import ListLayout from "../global/ListLayout";
import GalleryLayout from "@/components/global/GalleryLayout";
import EditSetting from "@/components/global/EditSetting";
import { useState } from "react";

export default function InterestWith({ eventData }) {
  const [activeButton, setActiveButton] = useState("friend");
  const [viewType, setViewType] = useState("gallery");

  return (
    <>
      {/* 관심동행 페이지 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-6">
          {/* 리스트형, 앨범형으로 나눌 것인지 확인하는 컴포넌트 */}
          <MenuList selected={viewType} onChange={setViewType} />
          {/* 친구의 글만 보일지 완료된 모집만 보일지는 추후 개발 */}
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
        {/* 편집, 설정 버튼 */}
        <EditSetting />
      </div>
      {/* viewType에 따라 보여줄 컴포넌트 분기 */}
      {/* GalleryLayout컴포넌트와 ListLayout컴포넌트는 
          items로 데이터를 받아들이기 때문에 items={eventData}로 코딩합니다.*/}
      {viewType === "gallery" ? (
        <GalleryLayout Component={TogetherGallery} items={eventData} />
      ) : (
        <ListLayout Component={TogetherList} items={eventData} />
      )}
    </>
  );
}
