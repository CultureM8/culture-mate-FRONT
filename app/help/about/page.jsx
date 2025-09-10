"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// 통합된 이미지 경로
const IMAGES = {
  SERVICEINTRO_EVENT_IMG: "/img/ServiceIntro_eventicon.svg",
  SERVICEINTRO_TOGETHER_IMG: "/img/ServiceIntro_togethericon.svg",
  SERVICEINTRO_COMMUNITY_IMG: "/img/ServiceIntro_communityicon.svg",
  SERVICEINTRO_MOBILE_IMG: "/img/ServiceIntro_mobileicon.svg",
  SERVICEINTRO_TARGET_IMG: "/img/ServiceIntro_targeticon.svg",
  SERVICEINTRO_PROCESS_IMG: "/img/ServiceIntro_processicon.svg",
  SERVICEINTRO_SHIELD_IMG: "/img/ServiceIntro_shieldicon.svg",
  SERVICEINTRO_JOIN_IMG: "/img/ServiceIntro_joinicon.svg",
};

const ICONS = {
  STAR_SERVICEINTRO: "/img/star_serviceintro.svg",
};

export default function CompleteServiceIntro({ backgroundMedia = "/img/aboutbanner.gif" }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // 미디어 타입 확인
  const isVideo = backgroundMedia && (
    backgroundMedia.includes('.mp4') || 
    backgroundMedia.includes('.webm') || 
    backgroundMedia.includes('.mov')
  );

  // 기능 데이터
  const features = [
    {
      id: "event",
      icon: IMAGES.SERVICEINTRO_EVENT_IMG,
      title: "다양한 문화 이벤트를 한눈에",
      description: "공연, 전시, 영화 등 카테고리로 손쉽게 찾기"
    },
    {
      id: "together", 
      icon: IMAGES.SERVICEINTRO_TOGETHER_IMG,
      title: "쉽고 빠른 동행 찾기",
      description: "취향이 맞는 사람과 함께 문화생활"
    },
    {
      id: "community",
      icon: IMAGES.SERVICEINTRO_COMMUNITY_IMG,
      title: "안전하고 신뢰도 높은 커뮤니티",
      description: "사용자 후기와 평점 기반 신뢰성 확보"
    },
    {
      id: "mobile",
      icon: IMAGES.SERVICEINTRO_MOBILE_IMG,
      title: "모바일·웹 어디서나 간편하게",
      description: "실시간 모임 관리 기능 지원"
    }
  ];

  // 차이점 데이터
  const differences = [
    {
      id: "target",
      icon: IMAGES.SERVICEINTRO_TARGET_IMG,
      title: '"그냥 커뮤니티가 아니라,',
      subtitle: (
        <>
          <span className="font-bold text-[#4e5052]">'문화생활 동행'</span>
          <span className="font-bold text-[#4e5052]">에 최적화된 플랫폼</span>
          <span className="font-medium text-[#9ea0a2]">이에요."</span>
        </>
      )
    },
    {
      id: "process", 
      icon: IMAGES.SERVICEINTRO_PROCESS_IMG,
      title: (
        <>
          <span className="font-bold text-[#4e5052]">이벤트부터</span>
          <span className="font-medium text-[#9ea0a2]"> 보고 → </span>
          <span className="font-bold text-[#4e5052]">동행 참여/생성</span>
          <span className="font-bold text-[#4e5052]">으로</span>
        </>
      ),
      subtitle: "바로 이어지는 자연스러운 흐름"
    },
    {
      id: "shield",
      icon: IMAGES.SERVICEINTRO_SHIELD_IMG,
      title: "후기, 프로필, 신고/차단 등",
      subtitle: (
        <>
          <span className="font-medium text-[#9ea0a2]">기본적인 </span>
          <span className="font-bold text-[#4e5052]">안전장치 마련</span>
        </>
      )
    },
    {
      id: "join",
      icon: IMAGES.SERVICEINTRO_JOIN_IMG,
      title: "번거로운 커뮤니티 가입 과정 없이",
      subtitle: (
        <>
          <span className="font-bold text-[#4e5052]">원하는 모임만 빠르게 </span>
          <span className="font-medium text-[#9ea0a2]">참여</span>
        </>
      )
    }
  ];

  // 후기 데이터
  const reviews = [
    {
      id: "review1",
      nickname: "so**h123",
      content: `"뮤지컬 볼 사람이 없어서 포기하려다, 여기서<br />동행 구해서 다녀왔어요. 처음 만난 분들이었는데<br />취향이 잘 맞아서 다음에도 같이 보기로 했어요!"`,
      rating: 5
    },
    {
      id: "review2",
      nickname: "yu**i0k",
      content: `"페스티벌은 혼자 가기 애매했는데, 동행모집을<br />통해 4명이 함께 가서 더 신나게 즐겼습니다."`,
      rating: 5
    },
    {
      id: "review3",
      nickname: "pu**1a",
      content: `"'이벤트 → 동행모집' 흐름이 너무 자연스러워서, 들어왔다가 바로 모임 만들었어요."`,
      rating: 5
    },
    {
      id: "review4",
      nickname: "yo**ii3",
      content: `"후기/프로필 보고 참여하니 덜 불안했어요.<br />운영정책이 잘 정리되어 있어서 신뢰가 갔습니다."`,
      rating: 5
    }
  ];

  // 공통 아이템 컴포넌트
  const FeatureItem = ({ feature, index }) => (
    <div
      className={`
        flex flex-col items-center justify-start text-center
        p-2 sm:p-3 md:p-5
        transition-all duration-700 ease-out
        ${isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
        }
      `}
      style={{ 
        transitionDelay: `${index * 150}ms`
      }}
    >
      <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] lg:w-[150px] lg:h-[150px] flex items-center justify-center mb-4 sm:mb-6 md:mb-[36px]">
        <Image
          src={feature.icon}
          alt={`${feature.title} 아이콘`}
          width={150}
          height={150}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col gap-1 sm:gap-2">
        <h3 className="
          text-sm sm:text-base md:text-lg lg:text-[20px] font-bold leading-[1.4] 
          text-[#4e5052] 
          whitespace-pre-line
          mb-0
        ">
          {feature.title}
        </h3>
        <p className="
          text-xs sm:text-sm md:text-base lg:text-[16px] font-normal leading-[1.5]
          text-[#9ea0a2]
          whitespace-pre-line
          mb-0
        ">
          {feature.description}
        </p>
      </div>
    </div>
  );

  const DifferenceItem = ({ difference, index }) => (
    <div
      className={`
        flex flex-col items-center justify-start text-center
        p-2 sm:p-3 md:p-5
        transition-all duration-700 ease-out
        ${isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
        }
      `}
      style={{ 
        transitionDelay: `${index * 150}ms`
      }}
    >
      <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] lg:w-[150px] lg:h-[150px] flex items-center justify-center mb-4 sm:mb-6 md:mb-[36px]">
        <Image
          src={difference.icon}
          alt={`${difference.id} 아이콘`}
          width={150}
          height={150}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col gap-1 sm:gap-2">
        <div className="
          text-sm sm:text-base md:text-lg lg:text-[20px] font-medium leading-[1.4] 
          text-[#9ea0a2] 
          mb-0
          whitespace-normal sm:whitespace-nowrap
        ">
          {difference.title}
        </div>
        <div className="
          text-sm sm:text-base md:text-lg lg:text-[20px] font-normal leading-[1.4]
          text-[#9ea0a2]
          mb-0
          whitespace-normal sm:whitespace-nowrap
        ">
          {difference.subtitle}
        </div>
      </div>
    </div>
  );

  const ReviewCard = ({ review, index }) => (
    <div
      className={`
        bg-white rounded-[20px] sm:rounded-[25px] md:rounded-[30px] 
        px-3 py-4 sm:px-4 sm:py-5 
        shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
        border border-gray-100
        w-full max-w-[350px] sm:max-w-[400px] md:max-w-[450px] 
        h-auto min-h-[180px] sm:min-h-[210px] md:min-h-[246px]
        flex flex-col gap-2
        transition-all duration-700 ease-out
        ${isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
        }
      `}
      style={{ 
        transitionDelay: `${index * 200}ms`
      }}
    >
      {/* 별점 */}
      <div className="flex items-center gap-[3px] h-[20px] sm:h-[25px] md:h-[30px]">
        {[...Array(review.rating)].map((_, starIndex) => (
          <Image
            key={starIndex}
            src={ICONS.STAR_SERVICEINTRO}
            alt="별점"
            width={28}
            height={27}
            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9"
          />
        ))}
      </div>

      {/* 사용자 정보 */}
      <div className="h-[20px] sm:h-[25px] md:h-[30px] flex items-center justify-start">
        <p className="text-xs sm:text-sm md:text-[14px] font-normal leading-[1.43] text-[#9ea0a2] whitespace-nowrap">
          닉네임 {review.nickname}님의 후기
        </p>
      </div>

      {/* 후기 내용 */}
      <div className="flex-1 flex items-start">
        <div 
          className="text-sm sm:text-base md:text-lg lg:text-[20px] font-medium leading-[1.4] text-[#4e5052] text-left"
          dangerouslySetInnerHTML={{ __html: review.content }}
        />
      </div>
    </div>
  );

  // 공통 타이틀 컴포넌트
  const SectionTitle = ({ children, delay = 200 }) => (
    <div className="w-full py-6 sm:py-8 md:py-10">
      <div className="max-w-full mx-auto px-4">
        <h2 className={`
          text-2xl sm:text-3xl md:text-[36px] font-semibold leading-[1.22] tracking-[-0.18px]
          text-[#26282a]
          transition-all duration-800 delay-${delay}
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          {children}
        </h2>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* 1. 서비스소개 대형배너 - 전체 너비로 수정 */}
      <div className={`
        relative w-screen h-[720px] bg-black/40 
        transition-opacity duration-1000
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        overflow-hidden
        ml-[calc(50%-50vw)]
      `}>
        {/* ========== 배경 미디어 영역 (이미지/영상 넣는 곳) ========== */}
        {backgroundMedia && (
          <>
            {isVideo ? (
              <video
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src={backgroundMedia} type="video/mp4" />
              </video>
            ) : (
              <img
                src={backgroundMedia}
                alt="배경 이미지"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </>
        )}
        {/* 
          ★ 이미지/영상 넣는 방법:
          1. 비디오: backgroundMedia="your-video.mp4" 
          2. 이미지: backgroundMedia="your-image.jpg"
          3. GIF: backgroundMedia="your-animation.gif"
        */}
        
        {/* 배경 오버레이 */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* 컨텐츠 컨테이너 - 화면 전체 너비 사용 */}
        <div className="
          absolute inset-0 w-full h-full
          flex items-end justify-center
          py-8 sm:py-12 md:py-[100px]
        ">
          <div className="w-full max-w-full px-4 sm:px-8 md:px-[100px]">
            <div className={`
              text-white font-medium leading-relaxed text-left
              transition-all duration-1000 delay-300
              ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
            `}>
              <p className="text-lg sm:text-xl md:text-2xl mb-0">
                <span className="font-bold">같이 볼 사람 찾는 게 더 어려웠다면?</span>
              </p>
              <p className="text-lg sm:text-xl md:text-2xl mb-0">
                이젠 컬쳐메이트에서 동행을 구해보세요.
              </p>
              <p className="text-lg sm:text-xl md:text-2xl mb-0">&nbsp;</p>
              <p className="text-lg sm:text-xl md:text-2xl mb-0">
                전시, 공연, 뮤지컬, 페스티벌까지!
              </p>
              <p className="text-xl sm:text-2xl md:text-[28px] font-bold mt-2">
                취향이 통하는 문화 커뮤니티, 컬쳐메이트
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 왜 컬쳐메이트일까요? 타이틀 */}
      <SectionTitle>
        <span className="font-normal">왜 </span>
        <span className="font-semibold">컬쳐메이트일까요</span>
        <span>?</span>
      </SectionTitle>

      {/* 3. 기능 소개 섹션 */}
      <div className="w-full py-4 sm:py-6 md:py-[30px]">
        <div className="max-w-full mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-4">
            <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-4 mb-4 sm:mb-8">
              <FeatureItem feature={features[0]} index={0} />
              <FeatureItem feature={features[1]} index={1} />
            </div>

            <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-4">
              <FeatureItem feature={features[2]} index={2} />
              <FeatureItem feature={features[3]} index={3} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. 컬쳐메이트만 가능한 이유 있는 차이 타이틀 */}
      <SectionTitle>
        <span className="font-normal">컬쳐메이트만 가능한 </span>
        <span className="font-semibold">이유 있는 차이</span>
      </SectionTitle>

      {/* 5. 차이점 소개 섹션 */}
      <div className="w-full py-4 sm:py-6 md:py-[30px]">
        <div className="max-w-full mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-4">
            <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-4 mb-4 sm:mb-8">
              <DifferenceItem difference={differences[0]} index={0} />
              <DifferenceItem difference={differences[1]} index={1} />
            </div>

            <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-4">
              <DifferenceItem difference={differences[2]} index={2} />
              <DifferenceItem difference={differences[3]} index={3} />
            </div>
          </div>
        </div>
      </div>

      {/* 6. 컬쳐메이트를 이렇게 쓰고 있어요 타이틀 */}
      <SectionTitle>
        <span className="font-normal">컬쳐메이트를 </span>
        <span className="font-semibold">이렇게 쓰고 있어요</span>
      </SectionTitle>

      {/* 7. 사용자 후기 섹션 */}
      <div className="w-screen bg-gray-100 py-8 sm:py-12 md:py-[84px] ml-[calc(50%-50vw)] overflow-hidden">
        <div className="max-w-full mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-x-[45px] sm:gap-y-[30px] md:gap-x-[90px] md:gap-y-[60px] place-items-center">
            {reviews.map((review, index) => (
              <ReviewCard key={review.id} review={review} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
