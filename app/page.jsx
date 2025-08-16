"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ICONS, ROUTES } from "@/constants/path";
import Gallery from "@/components/global/Gallery";
import EventGallery from "@/components/events/EventGallery";
import GalleryLayout from "@/components/global/GalleryLayout";
import TogetherGallery from "@/components/together/TogetherGallery";

export default function MainLanding() {
  return (
    <>
      {/* 1. MainBanner - 상단 검색 배너 (전체 가로폭) */}
      <MainBanner />
      
      {/* 메인 콘텐츠 영역 (1200px 제한) */}
      <div className="w-full min-w-full overflow-x-hidden">
        {/* 2. MainSubcategoryBar - 인기 동행 */}
        <div className="py-2.5">
          <MainSubcategoryBar title="인기 동행" subtitle="지금 가장 인기있는 모임" />
        </div>
        
        {/* 3. TogetherCardGrid - 4개의 동행 카드 그리드 */}
        <TogetherCardGrid />
        
        {/* 4. MainSubcategoryBar2 - 추천동행 */}
        <div className="py-2.5">
          <MainSubcategoryBar title="추천동행" subtitle="내 관심사를 기반으로 추천" />
        </div>
        
        {/* 5. TogetherCardGrid - 4개의 동행 카드 그리드 */}
        <TogetherCardGrid />
        
        {/* 6. MainSubcategoryBar3 - 이벤트 후기 */}
        <div className="py-2.5">
          <MainSubcategoryBar title="이벤트 후기" subtitle="내가 찾는 이벤트의 후기가 궁금하다면" linkTo={ROUTES.COMMUNITY} />
        </div>
      </div>

      {/* 7. ReviewCardsSection - 4개의 후기 카드 (전체 가로폭) */}
      <ReviewCardsSection />
      
      {/* 메인 콘텐츠 영역 계속 (1200px 제한) */}
      <div className="w-full min-w-full overflow-x-hidden">
        {/* 8. MainSubcategoryBar4 - 지금 핫한 카테고리 */}
        <div className="py-2.5">
          <MainSubcategoryBar title="지금 핫한 카테고리" subtitle="지금 가장 인기있는 이벤트 카테고리" linkTo={ROUTES.EVENTS} />
        </div>
        
        {/* 9. InterestEvent - 4개의 이벤트 갤러리 */}
        <InterestEvent />
        
        {/* 10. MainSubcategoryBar5 - 신규 동행 */}
        <div className="py-2.5">
          <MainSubcategoryBar title="신규 동행" subtitle="새로 열린 동행 모임" />
        </div>
        
        {/* 11. TogetherCardGrid - 4개의 동행 카드 그리드 */}
        <TogetherCardGrid />
        
        {/* 12. MainSubcategoryBar6 - 추천 (컨텐츠/SNS/화제글) top */}
        <div className="py-2.5">
          <MainSubcategoryBar title="추천 (컨텐츠/SNS/화제글) top" isSimple={true} linkTo={ROUTES.COMMUNITY} />
        </div>
        
        {/* 13. RecommendedCardsGroup - 3개의 추천글 카드 */}
        <RecommendedCardsGroup />
      </div>
    </>
  );
}

function MainBanner() {
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  const [currentTags, setCurrentTags] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // 검색창 문구 5개 세트
  const placeholderTexts = [
    "지금 가장 핫한 이벤트?",
    "오늘 밤 함께할 문화 활동은?",
    "이번 주말 어떤 공연 볼까?",
    "혼자 가기 아쉬운 전시회 찾기",
    "새로운 사람들과 즐길 이벤트?"
  ];

  // 태그 5개 세트 (각 세트마다 5개씩)
  const tagSets = [
    ["콘서트", "영화", "모임", "전시", "지역 행사"],
    ["전시회", "뮤지컬", "페스티벌", "동행", "아트 갤러리"],
    ["연극", "클래식", "재즈", "만남", "독립영화제"],
    ["오페라", "댄스", "힙합", "파티", "로맨틱 콘서트"],
    ["팝업스토어", "모임", "뮤지컬", "네트워킹", "크리에이티브"]
  ];

  useEffect(() => {
    // 페이지 로드 시 랜덤으로 선택
    const randomIndex = Math.floor(Math.random() * 5);
    setCurrentPlaceholder(placeholderTexts[randomIndex]);
    setCurrentTags(tagSets[randomIndex]);
  }, []);

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
    <section className="bg-[#C6C8CA] w-[100vw] h-[400px] relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      <div className="relative w-full h-full flex items-center justify-center">
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
              className="absolute box-border flex flex-row gap-2.5 items-center justify-center p-0 right-0 size-[50px] top-1/2 translate-y-[-50%] cursor-pointer hover:bg-gray-50 rounded-r-xl transition-colors duration-200"
            >
              <Image
                src={ICONS.SEARCH}
                alt="search"
                width={24}
                height={24}
                className="shrink-0"
              />
            </button>
          </div>
        </div>

        {/* 검색 태그들 */}
        <div className="absolute left-1/2 top-[calc(50%+50px)] translate-x-[-50%] w-[550px] flex flex-row items-center justify-between mt-4">
          {currentTags.map((tag, index) => (
            <div
              key={index}
              className="box-border flex flex-row gap-2.5 items-center justify-center px-4 py-1.5 rounded-[20px] border border-[#ffffff] cursor-pointer hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-200"
            >
              <div className="flex flex-col font-normal justify-center leading-[0] text-[#ffffff] text-[18px] text-center text-nowrap">
                <p className="block leading-[1.55] whitespace-pre">
                  {tag}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MainSubcategoryBar({ title, subtitle, isSimple = false, linkTo = ROUTES.TOGETHER }) {
  return (
    <div className="w-full flex justify-center py-2.5">
      <div className="w-[1200px]">
        {isSimple ? (
          /* 제목과 더보기를 한 줄에 가운데 정렬 */
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xl text-[#26282a] leading-[1.4]">
              {title}
            </h2>
            
            <Link href={linkTo} className="flex items-center gap-1 cursor-pointer">
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
        ) : (
          <>
            {/* 제목 영역 */}
            <div className="h-7 mb-2">
              <h2 className="font-bold text-xl text-[#26282a] leading-[1.4]">
                {title}
              </h2>
            </div>
            {/* 설명 및 더보기 영역 */}
            <div className="h-7 flex items-center justify-between">
              <p className="text-base text-[#9ea0a2] leading-[1.5]">
                {subtitle}
              </p>
              
              <Link href={linkTo} className="flex items-center gap-1 cursor-pointer">
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
        )}
      </div>
    </div>
  );
}

function TogetherCardGrid() {
  const togetherData = [
    {
      imgSrc: "",
      alt: "",
      title: "모집글 제목",
      eventType: "이벤트유형",
      eventName: "이벤트명",
      group: "00/00",
      date: "0000.00.00",
      isClosed: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "모집글 제목",
      eventType: "이벤트유형",
      eventName: "이벤트명",
      group: "00/00",
      date: "0000.00.00",
      isClosed: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "모집글 제목",
      eventType: "이벤트유형",
      eventName: "이벤트명",
      group: "00/00",
      date: "0000.00.00",
      isClosed: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "모집글 제목",
      eventType: "이벤트유형",
      eventName: "이벤트명",
      group: "00/00",
      date: "0000.00.00",
      isClosed: false,
    },
  ];

  return (
    <div className="w-full flex justify-center py-2.5">
      <div className="w-[1200px]">
        <div className="grid grid-cols-4 gap-6 place-items-center">
          {togetherData.map((item, index) => (
            <div key={index} className="w-[290px] h-auto flex justify-center">
              <TogetherGallery 
                imgSrc={item.imgSrc}
                alt={item.alt}
                title={item.title}
                eventType={item.eventType}
                eventName={item.eventName}
                group={item.group}
                date={item.date}
                isClosed={item.isClosed}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 개별 ReviewCard 컴포넌트
function ReviewCard({ 
  nickname = "닉네임", 
  rating = 4.5, 
  date = "25.08.01", 
  content = "후기내용(공백포함 30자이후 ...말줄임 + 더보기추가", 
  profileImage = null 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    const stars = [];
    
    // 꽉 찬 별
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Image 
          key={`full-${i}`}
          src={ICONS.STAR_FULL} 
          alt="full star" 
          width={20} 
          height={19} 
        />
      );
    }
    
    // 반 별
    if (hasHalfStar) {
      stars.push(
        <Image 
          key="half"
          src={ICONS.STAR_HALF} 
          alt="half star" 
          width={20} 
          height={19} 
        />
      );
    }
    
    return stars;
  };

  const shouldTruncate = content.length > 30;
  const displayContent = isExpanded || !shouldTruncate 
    ? content 
    : content.slice(0, 30) + "...";

  return (
    // TODO: 카드 클릭 시 '/커뮤니티/이벤트후기' 경로로 이동 기능 추가 필요
    <div className="bg-white rounded-xl border border-gray-100 p-0 w-[282px] h-[180px] flex flex-col" style={{ boxShadow: '0px 4px 4px 0px rgba(0,0,0,0.1)' }}>
      {/* 헤더 영역 */}
      <div className="flex items-center p-5 h-[90px]">
        {/* 프로필 이미지 */}
        <div className="mr-2.5">
          {profileImage ? (
            <Image 
              src={profileImage} 
              alt="profile" 
              width={50} 
              height={50} 
              className="rounded-full"
            />
          ) : (
            <div className="w-[50px] h-[50px] bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-xs text-gray-700">image</span>
            </div>
          )}
        </div>
        
        {/* 닉네임과 별점 */}
        <div className="flex-1">
          <div className="mb-1">
            <p className="text-base font-normal text-gray-700">{nickname}</p>
          </div>
          
          <div className="flex items-center gap-1">
            {renderStars(rating)}
            <span className="text-xs text-gray-300 ml-1">{date}</span>
          </div>
        </div>
      </div>
      
      {/* 후기 내용 */}
      <div className="px-5 pb-5 flex-1">
        <p className="text-sm text-gray-700 leading-relaxed">
          {displayContent}
          {shouldTruncate && !isExpanded && (
            <button 
              onClick={() => setIsExpanded(true)}
              className="text-blue-500 ml-1 hover:underline"
            >
              더보기
            </button>
          )}
          {isExpanded && shouldTruncate && (
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 ml-1 hover:underline"
            >
              접기
            </button>
          )}
        </p>
      </div>
    </div>
  );
}

// 메인 ReviewCardsSection 컴포넌트
function ReviewCardsSection({ reviews = [] }) {
  // 기본 데이터가 없을 경우 샘플 데이터 사용
  const defaultReviews = [
    {
      id: 1,
      nickname: "닉네임",
      rating: 4.5,
      date: "25.08.01",
      content: "후기내용(공백포함 30자이후 ...말줄임 + 더보기추가",
      profileImage: null
    },
    {
      id: 2,
      nickname: "닉네임",
      rating: 4.5,
      date: "25.08.01",
      content: "후기내용(공백포함 30자이후 ...말줄임 + 더보기추가",
      profileImage: null
    },
    {
      id: 3,
      nickname: "닉네임",
      rating: 4.5,
      date: "25.08.01",
      content: "후기내용(공백포함 30자이후 ...말줄임 + 더보기추가",
      profileImage: null
    },
    {
      id: 4,
      nickname: "닉네임",
      rating: 4.5,
      date: "25.08.01",
      content: "후기내용(공백포함 30자이후 ...말줄임 + 더보기추가",
      profileImage: null
    }
  ];

  const reviewData = reviews.length > 0 ? reviews : defaultReviews;

  return (
    <section className="bg-gray-100 w-[100vw] py-5 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      <div className="w-full flex justify-center">
        <div className="w-[1200px]">
          <div className="grid grid-cols-4 gap-6">
            {reviewData.map((review) => (
              <ReviewCard
                key={review.id}
                nickname={review.nickname}
                rating={review.rating}
                date={review.date}
                content={review.content}
                profileImage={review.profileImage}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InterestEvent() {
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
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-4",
      date: "0000.00.00 ~ 0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
  ];
  const [selectedType, setSelectedType] = useState("전체");
  
  return (
    <div className="w-full flex justify-center py-2.5">
      <div className="w-[1200px]">
        <GalleryLayout Component={EventGallery} items={eventData} />
      </div>
    </div>
  );
}

// 개별 추천글 카드 컴포넌트
function RecommendedCard({ title, nickname, content }) {
  return (
    <div className="flex-1 max-w-[354px]">
      <div className="
        flex flex-col border border-gray-300 rounded-xl 
        bg-white h-[270px] overflow-hidden
      ">
        {/* 카드 헤더 */}
        <div className="
          flex items-center justify-start 
          px-5 py-[21px] h-[70px]
        ">
          <h3 className="
            text-lg font-bold text-gray-900
            font-['Inter']
          ">
            {title}
          </h3>
        </div>
        {/* 카드 본문 */}
        <div className="
          grid grid-cols-[50px_1fr] gap-4 
          px-5 py-2.5 h-[146px]
        ">
          {/* 프로필 이미지 */}
          <div className="flex items-start justify-center pt-1">
            <div className="
              w-[50px] h-[50px] 
              bg-gray-100 rounded-full
              flex items-center justify-center
              shrink-0
            ">
              <span className="
                text-xs text-gray-700 
                font-['Inter'] tracking-wide
              ">
                image
              </span>
            </div>
          </div>
          {/* 닉네임 및 리뷰 */}
          <div className="
            flex flex-col gap-2.5 
            self-start pt-1
          ">
            {/* 닉네임 */}
            <div className="flex items-center">
              <span className="
                text-base text-gray-900
                font-['Inter'] font-normal
                leading-6
              ">
                {nickname}
              </span>
            </div>
            {/* 리뷰 내용 */}
            <div className="flex items-start">
              <p className="
                text-base text-gray-500 
                font-['Inter'] font-normal 
                leading-6
              ">
                {content}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 메인 추천글 카드 그룹 컴포넌트
function RecommendedCardsGroup() {
  const [cardsData] = useState([
    {
      title: "관심 수 TOP",
      nickname: "닉네임",
      content: "이벤트 → 동행모집 흐름이 너무 자연스러워서, 들어왔다가 바로 모임 만들었어요...(공백포함 50자 이후 말줄임)"
    },
    {
      title: "추천 수 TOP", 
      nickname: "닉네임",
      content: "후기/프로필 보고 참여하니 덜 불안했어요. 운영정책이 잘 정리되어 있어서 신뢰가 갔습니다."
    },
    {
      title: "리뷰 점수 TOP",
      nickname: "닉네임", 
      content: "페스티벌은 혼자 가기 애매했는데, 동행모집을 통해 4명이 함께 가서 더 신나게 즐겼습니다."
    }
  ]);
  
  return (
    <div className="w-full flex justify-center py-2.5">
      <div className="w-[1200px]">
        <div className="flex flex-row justify-between">
          {cardsData.map((card, index) => (
            <RecommendedCard
              key={index}
              title={card.title}
              nickname={card.nickname}
              content={card.content}
            />
          ))}
        </div>
      </div>
    </div>
  );
}