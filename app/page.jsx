"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ICONS, ROUTES } from "@/constants/path";
import Gallery from "@/components/global/Gallery";
import EventGallery from "@/components/events/main/EventGallery";
import GalleryLayout from "@/components/global/GalleryLayout";
import TogetherGallery from "@/components/together/TogetherGallery";
import MainSearchBar from "@/components/global/MainSearchBar";
import { togetherApi } from "@/lib/api/togetherApi";
import { getEvents } from "@/lib/api/eventApi";

// 상수 배열들을 컴포넌트 외부로 이동
const PLACEHOLDER_TEXTS = [
  "지금 가장 핫한 이벤트?",
  "오늘 밤 함께할 문화 활동은?",
  "이번 주말 어떤 공연 볼까?",
  "혼자 가기 아쉬운 전시회 찾기",
  "새로운 사람들과 즐길 이벤트?",
];

const TAG_SETS = [
  ["콘서트", "영화", "모임", "전시", "지역 행사"],
  ["전시회", "뮤지컬", "페스티벌", "동행", "아트 갤러리"],
  ["연극", "클래식", "재즈", "만남", "독립영화제"],
  ["오페라", "댄스", "힙합", "파티", "로맨틱 콘서트"],
  ["팝업스토어", "모임", "뮤지컬", "네트워킹", "크리에이티브"],
];

const VIDEO_SOURCES = [
  "/img/mainbanner1.gif",
  "/img/mainbanner2.gif",
  "/img/mainbanner3.gif",
  "/img/mainbanner4.gif",
  "/img/mainbanner5.gif",
];

export default function MainLanding() {
  return (
    <>
      {/* 1. MainBanner - 상단 검색 배너 (전체 가로폭) */}
      <MainBanner />

      {/* 메인 콘텐츠 영역 (1200px 제한) */}
      <div className="w-full min-w-full overflow-x-hidden">
        <div className="py-2.5">
          <MainSubcategoryBar
            title="최신 동행"
            subtitle="최신 동행을 확인 해 보세요"
          />
        </div>
        <TogetherCardGrid />
      </div>

      <div className="w-full min-w-full overflow-x-hidden">
        <div className="py-2.5">
          <MainSubcategoryBar2
            title="최신 이벤트"
            subtitle="최근 오픈한 이벤트를 확인 해 보세요"
          />
        </div>
        <NewEvent />
      </div>
    </>
  );
}

function MainBanner() {
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  const [currentTags, setCurrentTags] = useState([]);
  const [currentVideoSrc, setCurrentVideoSrc] = useState(VIDEO_SOURCES[0]);

  useEffect(() => {
    // 페이지 로드 시 랜덤으로 선택
    const randomIndex = Math.floor(Math.random() * 5);
    setCurrentPlaceholder(PLACEHOLDER_TEXTS[randomIndex]);
    setCurrentTags(TAG_SETS[randomIndex]);
    setCurrentVideoSrc(VIDEO_SOURCES[randomIndex]);
  }, []); // 빈 dependency array

  return (
    <section className="bg-[#C6C8CA] w-[100vw] h-[400px] relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
      {/* 배경 gif */}
      {currentVideoSrc && (
        <img
          src={currentVideoSrc}
          alt="background animation"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      <div className="relative w-full h-full flex items-center justify-center z-10">
        {/* MainSearchBar 컴포넌트 사용 */}
        <div className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[550px]">
          <MainSearchBar
            placeholder={currentPlaceholder}
            showTags={true}
            tags={currentTags}
          />
        </div>
      </div>
    </section>
  );
}

function MainSubcategoryBar({
  title,
  subtitle,
  isSimple = false,
  linkTo = ROUTES.TOGETHER,
}) {
  return (
    <div className="w-full flex justify-center py-2.5">
      <div className="w-[1200px]">
        <>
          {/* 제목 영역 */}
          <div className="h-7 mb-2">
            <h2 className="font-bold text-xl text-[#26282a] leading-[1.4]">
              {title}
            </h2>
          </div>
          {/* 설명 및 더보기 영역 */}
          <div className="h-7 flex items-center justify-between">
            <p className="text-base text-[#9ea0a2] leading-[1.5]">{subtitle}</p>

            <Link
              href={linkTo}
              className="flex items-center gap-1 cursor-pointer">
              <span className="text-base text-[#c6c8ca] leading-[1.5]">
                더보기
              </span>
              <Image
                src={ICONS.DOWN_GRAY}
                alt="더보기 화살표"
                width={16}
                height={8}
                className="rotate-270"
              />
            </Link>
          </div>
        </>
      </div>
    </div>
  );
}

function MainSubcategoryBar2({
  title,
  subtitle,
  isSimple = false,
  linkTo = ROUTES.EVENTS,
}) {
  return (
    <div className="w-full flex justify-center py-2.5">
      <div className="w-[1200px]">
        <>
          {/* 제목 영역 */}
          <div className="h-7 mb-2">
            <h2 className="font-bold text-xl text-[#26282a] leading-[1.4]">
              {title}
            </h2>
          </div>
          {/* 설명 및 더보기 영역 */}
          <div className="h-7 flex items-center justify-between">
            <p className="text-base text-[#9ea0a2] leading-[1.5]">{subtitle}</p>

            <Link
              href={linkTo}
              className="flex items-center gap-1 cursor-pointer">
              <span className="text-base text-[#c6c8ca] leading-[1.5]">
                더보기
              </span>
              <Image
                src={ICONS.DOWN_GRAY}
                alt="더보기 화살표"
                width={16}
                height={8}
                className="rotate-270"
              />
            </Link>
          </div>
        </>
      </div>
    </div>
  );
}

function TogetherCardGrid() {
  const [togetherData, setTogetherData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("🔄 TogetherCardGrid 컴포넌트 렌더링 시작");
  console.log("🔍 현재 상태:", {
    isLoading,
    error,
    dataLength: togetherData.length,
  });

  useEffect(() => {
    const fetchRecentTogether = async () => {
      try {
        console.log("🚀 TogetherCardGrid: 최신 동행 4개 조회");
        setIsLoading(true);
        // /recent 엔드포인트 사용으로 필요한 데이터만 조회
        const response = await fetch('/api/v1/together/recent?limit=4');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const recentTogether = await response.json();
        console.log("✅ TogetherCardGrid: 응답 받음", recentTogether);

        setTogetherData(recentTogether);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentTogether();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-2.5">
        <div className="w-[1200px]">
          <div className="grid grid-cols-4 gap-6 place-items-center">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="w-[290px] h-auto flex justify-center">
                <div className="w-[290px] h-[200px] bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                  <span className="text-gray-500">로딩 중...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center py-2.5">
        <div className="w-[1200px]">
          <div className="text-center py-8">
            <p className="text-red-500">
              동행 데이터를 불러오는 중 오류가 발생했습니다.
            </p>
            <p className="text-gray-500 mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-2.5">
      <div className="w-[1200px]">
        <div className="grid grid-cols-4 gap-6 place-items-center">
          {togetherData.length > 0 ? (
            togetherData.map((item) => (
              <div
                key={item.id}
                className="w-[290px] h-auto flex justify-center">
                <TogetherGallery
                  togetherId={item.id}
                  id={item.id}
                  title={item.title}
                  meetingDate={item.meetingDate}
                  currentParticipants={item.currentParticipants}
                  maxParticipants={item.maxParticipants}
                  active={item.active}
                  eventSnapshot={{
                    ...item.event,
                    eventName: item.event?.title, // title을 eventName으로 매핑
                    eventImage: item.event?.mainImagePath || item.event?.thumbnailImagePath, // mainImagePath를 eventImage로 우선 매핑
                    imgSrc: item.event?.mainImagePath || item.event?.thumbnailImagePath, // 추가 fallback
                  }}
                  isInterested={item.isInterested}
                />
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center py-8">
              <p className="text-gray-500">현재 모집 중인 동행이 없습니다.</p>
              <p className="text-gray-400 text-sm mt-2">
                새로운 동행이 곧 등록될 예정입니다!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewEvent() {
  const [eventData, setEventData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentEvents = async () => {
      try {
        setIsLoading(true);
        // /recent 엔드포인트 사용으로 필요한 데이터만 조회
        const response = await fetch('/api/v1/events/recent?limit=4');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const recentEvents = await response.json();

        setEventData(recentEvents);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentEvents();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-2.5">
        <div className="w-[1200px]">
          <div className="grid grid-cols-4 gap-6 place-items-center">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="w-[280px] h-auto flex justify-center">
                <div className="w-[280px] h-[200px] bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                  <span className="text-gray-500">로딩 중...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center py-2.5">
        <div className="w-[1200px]">
          <div className="text-center py-8">
            <p className="text-red-500">
              이벤트 데이터를 불러오는 중 오류가 발생했습니다.
            </p>
            <p className="text-gray-500 mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // 백엔드 데이터를 EventGallery 컴포넌트가 기대하는 형식으로 변환
  const formattedEventData = eventData.map((event) => ({
    id: event.id,
    eventId: event.id,
    title: event.title,
    imgSrc: event.mainImagePath || event.thumbnailImagePath || "",
    alt: event.title || "이벤트 이미지",
    href: `/events/${event.id}`,
    startDate: event.startDate
      ? new Date(event.startDate)
          .toLocaleDateString("ko-KR")
          .replace(/\. /g, ".")
          .slice(0, -1)
      : "0000.00.00",
    endDate: event.endDate
      ? new Date(event.endDate)
          .toLocaleDateString("ko-KR")
          .replace(/\. /g, ".")
          .slice(0, -1)
      : "0000.00.00",
    location: event.eventLocation || "장소 미정",
    score: event.avgRating || 0,
    avgRating: event.avgRating || 0,
    isHot: true, // 최신 이벤트는 모두 핫으로 표시
    enableInterest: true,
    isInterested: event.isInterested || false,
  }));

  return (
    <div className="w-full flex justify-center py-2.5">
      <div className="w-[1200px]">
        {formattedEventData.length > 0 ? (
          <GalleryLayout Component={EventGallery} items={formattedEventData} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">현재 진행 중인 이벤트가 없습니다.</p>
            <p className="text-gray-400 text-sm mt-2">
              새로운 이벤트가 곧 등록될 예정입니다!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
