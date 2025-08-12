"use client"

import EventDetail from "@/components/events/EventDetail";
import HorizontalTab from "@/components/global/HorizontalTab";
import { ICONS, IMAGES } from "@/constants/path";
import { getEventByCode } from "@/lib/eventData";
import Image from "next/image";
import { useState, useEffect, use } from "react";

export default function EventCode({ params }) {

  
  const { eventCode } = use(params);
  const [eventData, setEventData] = useState(null);
  const [interest, setInterest] = useState(false);
  const [like, setLike] = useState(false);
  const [currentMenu, setCurrentMenu] = useState("상세 정보");

  const menuList = ["상세 정보", "후기", "모집중인 동행"];
  
  const handleInterest = () => {
    setInterest(!interest);
  }
  const handleLike = () => {
    setLike(!like);
  }
  
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

  // useEffect(() => {

  // }, [currentMenu])

  function EventInfo() {
    return(
      <>
        <h1 className="text-4xl font-bold mb-4 px-6 h-16 py-[10px]">{eventData.eventType}</h1>
        
        <div className="flex">
          <div className="p-4">
            <div className="relative w-[400px] h-[500px] overflow-hidden rounded-lg">
              <Image 
                src={eventData.imgSrc && eventData.imgSrc.trim() !== "" ? eventData.imgSrc : IMAGES.GALLERY_DEFAULT_IMG}
                alt={eventData.alt}
                fill
                className="object-cover"
              />
            </div>
            <div className="px-2 py-6 flex justify-between">
              <div className="flex gap-6">
                {/* <button
                  onClick={handleInterest}
                  className="hover:cursor-pointer"
                >
                  {interest ? 
                    <Image 
                      src={ICONS.HEART}
                      alt="관심"
                      width={28}
                      height={28}
                    /> : 
                    <Image 
                      src={ICONS.HEART_EMPTY}
                      alt="관심"
                      width={28}
                      height={28}
                    />
                  }
                </button> */}
                <div className="flex gap-2 items-center">
                  <Image 
                    src={ICONS.STAR_FULL}
                    alt="별점"
                    width={24}
                    height={24}
                  />
                  {eventData.score}
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={handleLike}
                    className="hover:cursor-pointer"
                  >
                    {like ? 
                      <Image 
                        src={ICONS.THUMBSUP_FULL}
                        alt="추천"
                        width={24}
                        height={24}
                      /> : 
                      <Image 
                      src={ICONS.THUMBSUP_EMPTY}
                      alt="추천"
                      width={24}
                      height={24}
                    />
                    }
                  </button>
                  {eventData.likesCount}
                </div>
              </div>
              <div className="flex gap-6">
                <button
                  onClick={handleInterest}
                  className="hover:cursor-pointer"
                >
                  {interest ? 
                    <Image 
                      src={ICONS.HEART}
                      alt="관심"
                      width={28}
                      height={28}
                    /> : 
                    <Image 
                      src={ICONS.HEART_EMPTY}
                      alt="관심"
                      width={28}
                      height={28}
                    />
                  }
                </button>
                <button>
                  <Image 
                    src={ICONS.SHARE}
                    alt="공유"
                    width={24}
                    height={24}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="mx-auto flex-1 px-8">
            {/* 이벤트 제목 */}
            <div className="py-4 flex items-center gap-4">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{eventData.title}</h2>
            </div>

            {/* 이벤트 정보 */}
            <div className="mt-8 flex flex-col gap-8 text-gray-700">
              <div className="flex">
                <span className="w-25 font-medium">장소</span>
                <span>{eventData.location}</span>
              </div>
              <div className="flex">
                <span className="w-25 font-medium">기간</span>
                <span>{eventData.startDate} ~ {eventData.endDate}</span>
              </div>
              <div className="flex">
                <span className="w-25 font-medium">관람시간</span>
                <span>{eventData.viewTime}</span>
              </div>
              <div className="flex">
                <span className="w-25 font-medium">관람연령</span>
                <span>{eventData.ageLimit}</span>
              </div>
              <div className="flex">
                <span className="w-25 font-medium">가격</span>
                <span>{eventData.price}</span>
              </div>
            </div>

          </div>

        </div>
      </>
    )
  } 
  
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
      <EventInfo />
      <HorizontalTab 
        currentMenu={currentMenu}
        menuList={menuList}
        setCurrentMenu={setCurrentMenu}
        width={1000}
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