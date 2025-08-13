"use client"

import EventDetail from "@/components/events/EventDetail";
import GalleryLayout from "@/components/global/GalleryLayout";
import HorizontalTab from "@/components/global/HorizontalTab";
import TogetherGallery from "@/components/together/TogetherGallery";
import { useState } from "react";
import { togetherData } from "@/lib/togetherData";
import SearchFilterSort from "@/components/global/SearchFilterSort";
import EventFilterModal from "@/components/events/EventFilterModal";

export default function EventPageClient({ eventData }) {
  const [currentMenu, setCurrentMenu] = useState("상세 정보");
  const menuList = ["상세 정보", "후기", "모집중인 동행"];
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [viewType, setViewType] = useState("Gallery")

  const openFilterModal = () => setIsFilterModalOpen(true);
  const closeFilterModal = () => setIsFilterModalOpen(false);

  return (
    <>
      <HorizontalTab 
        currentMenu={currentMenu}
        menuList={menuList}
        setCurrentMenu={setCurrentMenu}
        width={800}
        align="center"
      />
      <div className="min-h-50">
        {currentMenu === menuList[0] &&
          <EventDetail eventData={eventData} />
        }
        {currentMenu === menuList[1] &&
          <>후기</>
        }
        {currentMenu === menuList[2] &&
          <>
            <SearchFilterSort 
              enableViewType
              viewType={viewType}
              setViewType={setViewType}
              filterAction={openFilterModal}
            />
            {viewType === "Gallery" ? 
              <GalleryLayout 
                Component={TogetherGallery}
                items={togetherData.filter(item => item.eventCode === eventData.eventCode)}
              /> :
              ""
            }
            {/* 필터 모달창 => 동행용 필터로 추후에 교체해야함. */}
            <EventFilterModal isOpen={isFilterModalOpen} onClose={closeFilterModal} />
          </>
        }
      </div>
    </>
  );
}
