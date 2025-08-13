"use client"

import EventDetail from "@/components/events/EventDetail";
import EventInfo from "@/components/events/EventInfo";
import HorizontalTab from "@/components/global/HorizontalTab";
import { getEventByCode } from "@/lib/eventData";
import { useState, useEffect, use } from "react";

export default function EventCode({ params }) {
  const { eventCode } = use(params);
  const [currentMenu, setCurrentMenu] = useState("상세 정보");
  const [eventData, setEventData] = useState(null);
  
  const menuList = ["상세 정보", "후기", "모집중인 동행"];
  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const event = await getEventByCode(eventCode);
        setEventData(event);
      } catch (err) {
        console.error("이벤트 데이터 로딩 실패:", err);
      }
    };
    
    if (eventCode) {
      fetchEvent();
    }
  }, [eventCode]); 
  
  if (!eventData) {
    return (
      <>  
        <h1 className="text-4xl font-bold py-[10px] h-16 px-6">이벤트</h1>
        <div className="flex justify-center items-center h-64 px-6">
          <div>이벤트를 찾을 수 없습니다.</div>
        </div>
      </>
    );
  }

  return(
    <>
      <EventInfo 
        eventData={eventData}
      />
      <HorizontalTab 
        currentMenu={currentMenu}
        menuList={menuList}
        setCurrentMenu={setCurrentMenu}
        width={800}
        align="center"
      />
      <div className="min-h-50">
        {currentMenu === menuList[0] &&
          <EventDetail />
        }
        {currentMenu === menuList[1] &&
          <div>후기</div>
        }
        {currentMenu === menuList[2] &&
          <div>모집중인 동행</div>
        }
      </div>

    </>
  )
}