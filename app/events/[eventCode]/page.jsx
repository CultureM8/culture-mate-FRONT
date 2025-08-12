"use client"

import { IMAGES } from "@/constants/path";
import { getEventByCode } from "@/lib/eventData";
import Image from "next/image";
import { useState, useEffect, use } from "react";

export default function EventCode({ params }) {

  const { eventCode } = use(params);
  const [eventData, setEventData] = useState(null);

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
        <h1 className="text-4xl font-bold py-[10px] h-16">이벤트</h1>
        <div className="flex justify-center items-center h-64">
          <div>이벤트를 찾을 수 없습니다.</div>
        </div>
      </>
    );
  }

  return(
    <>
      <h1 className="text-4xl font-bold py-[10px] h-16">이벤트</h1>
      
      <div className="flex">
        <div className="relative mx-auto w-[500px] h-[600px] max-w-[500px] overflow-hidden">
          <Image 
            src={eventData.imgSrc || IMAGES.GALLERY_DEFAULT_IMG}
            alt={eventData.alt}
            fill
            className="object-cover"
          />
        </div>

        <div className="mx-auto flex-1">
            {/* 이벤트 제목 */}
            <div className="p-6 border-b flex items-center gap-4">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{eventData.title}</h2>
              <span className="px-3 py-1 text-sm text-white bg-blue-500 rounded-full h-7">
                {eventData.eventType}
              </span>
            </div>

            {/* 이벤트 정보 */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">공연 정보</h3>
                <div className="flex flex-col gap-4 text-gray-700">
                  <div className="flex">
                    <span className="w-20 font-medium">장소:</span>
                    <span>{eventData.location}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 font-medium">기간:</span>
                    <span>{eventData.date}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 font-medium">관람시간:</span>
                    <span>{eventData.viewTime}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 font-medium">관람연령:</span>
                    <span>{eventData.ageLimit}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 font-medium">가격정보:</span>
                    <span>{eventData.price}</span>
                  </div>
                </div>
              </div>
            </div>

        </div>

      </div>
    </>
  )
}