"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ICONS, ROUTES } from "@/constants/path";
import Gallery from "@/components/global/Gallery";
import EventGallery from "@/components/events/main/EventGallery";
import GalleryLayout from "@/components/global/GalleryLayout";
import TogetherGallery from "@/components/together/TogetherGallery";
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
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // 페이지 로드 시 랜덤으로 선택
    const randomIndex = Math.floor(Math.random() * 5);
    setCurrentPlaceholder(PLACEHOLDER_TEXTS[randomIndex]);
    setCurrentTags(TAG_SETS[randomIndex]);
    setCurrentVideoSrc(VIDEO_SOURCES[randomIndex]);
  }, []); // 빈 dependency array

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    if (searchValue.trim()) {
      // TODO: 검색어를 이용해 관련 페이지로 이동하는 로직 작성
      // 예시: router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      // 또는: window.location.href = `/events?search=${encodeURIComponent(searchValue.trim())}`;
      console.log("검색어:", searchValue.trim());
    }
  };

  // 엔터키 검색 핸들러
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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
        {/* 검색창 배경 (블러 효과) - 포커스 시에만 표시 */}
        {isFocused && (
          <div className="absolute bg-[rgba(255,255,255,0.2)] blur-[2px] filter h-[60px] left-1/2 rounded-xl top-1/2 translate-x-[-50%] translate-y-[-50%] w-[560px]" />
        )}

        {/* 메인 검색창 */}
        <div className="absolute bg-[#ffffff] h-[50px] left-1/2 rounded-xl top-1/2 translate-x-[-50%] translate-y-[-50%] w-[550px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
          <div className="h-[50px] overflow-hidden relative w-[550px]">
            {/* 검색 입력 필드 */}
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={currentPlaceholder}
              className="absolute box-border w-[500px] h-full left-0 px-5 py-[13px] top-0 bg-transparent border-none outline-none font-medium text-[#333333] text-[20px] placeholder:text-[#76787a] placeholder:font-medium"
            />

            {/* 검색 아이콘 */}
            <button
              onClick={handleSearch}
              className="absolute box-border flex flex-row gap-2.5 items-center justify-center p-0 right-0 size-[50px] top-1/2 translate-y-[-50%] cursor-pointer hover:bg-gray-50 rounded-r-xl transition-colors duration-200">
              <Image
                src={ICONS.SEARCH}
                alt="search"
                width={24}
                height={24}
                className="shrink-0"
                priority
              />
            </button>
          </div>
        </div>

        {/* 검색 태그들 */}
        <div className="absolute left-1/2 top-[calc(50%+50px)] translate-x-[-50%] w-[550px] flex flex-row items-center justify-between mt-4">
          {currentTags.map((tag, index) => (
            <div
              key={index}
              className="box-border flex flex-row gap-2.5 items-center justify-center px-4 py-1.5 rounded-[20px] border border-[#ffffff] cursor-pointer hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-200">
              <div className="flex flex-col font-normal justify-center leading-[0] text-[#ffffff] text-[18px] text-center text-nowrap">
                <p className="block leading-[1.55] whitespace-pre">{tag}</p>
              </div>
            </div>
          ))}
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
        console.log("🚀 TogetherCardGrid: API 호출 시작");
        setIsLoading(true);
        const allTogether = await togetherApi.getAll();
        console.log("✅ TogetherCardGrid: API 응답 받음", allTogether);

        // 활성화된 동행만 필터링
        const activeTogether = allTogether.filter((item) => {
          if (!item.active) {
            return false;
          }

          //정원 초과 체크
          if (item.currentParticipants >= item.maxParticipants) {
            return false;
          }

          // 모임 날짜 체크 (내일 이후만)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const meetingDate = new Date(item.meetingDate);
          meetingDate.setHours(0, 0, 0, 0);

          if (meetingDate <= today) {
            return false;
          }
          return true;
        });

        // 최신 4개 선택 (created_at 또는 id 기준으로 정렬)
        const recentTogether = activeTogether
          .sort((a, b) => {
            // createdAt이 있으면 그걸로, 없으면 id로 정렬
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return b.id - a.id;
          })
          .slice(0, 4);

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
        const allEvents = await getEvents();

        // 활성화된 이벤트만 필터링 (현재 진행 중이거나 미래 이벤트)
        const activeEvents = allEvents.filter((event) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const endDate = new Date(event.endDate);

          if (endDate < today) {
            return false;
          }

          return true;
        });

        // 최신 4개 선택 (created_at 또는 id 기준으로 정렬)
        const recentEvents = activeEvents
          .sort((a, b) => {
            // createdAt이 있으면 그걸로, 없으면 id로 정렬
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return b.id - a.id;
          })
          .slice(0, 4);

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
