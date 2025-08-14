"use client";

import Image from "next/image";
import Link from "next/link";
import { IMAGES, ROUTES } from "@/constants/path";

export default function UsageGuidePage() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* 1. 이용 가이드 큰 타이틀 - 반응형 정렬 */}
      <div className="w-full">
        <div className="w-full max-w-none lg:max-w-[1200px] mx-auto px-4 lg:px-4 md:px-6 sm:px-4">
          <h1 className="text-4xl font-bold py-[10px] h-16">
            이용 가이드
          </h1>
        </div>
      </div>

      {/* 콘텐츠 영역 - 1200px 제한 */}
      <div className="w-full max-w-none lg:max-w-[1200px] mx-auto px-4 lg:px-4 md:px-6 sm:px-4">
        {/* 모바일 전용 세로 레이아웃 */}
        <div className="block lg:hidden">
          {/* 1. findevent 이미지 */}
          <section className="w-full px-4 py-8 flex justify-center">
            <Image
              src={IMAGES.GUIDE_FINDEVENT_IMG}
              alt="이벤트 탐색 이미지"
              width={400}
              height={400}
              className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
            />
          </section>

          {/* 2. 이벤트 탐색 문구 */}
          <section className="w-full py-6">
            <div className="text-center space-y-4">
              <h3 className="text-[24px] font-bold text-[#26282a] font-['Inter'] leading-[1.33] text-center">
                이벤트 탐색
              </h3>
              <div className="text-sm text-[#76787a] leading-relaxed space-y-2 max-w-lg mx-auto">
                <p>
                  <span className="font-bold">'이벤트'</span>
                  {` 탭에서 '공연', '연극', '뮤지컬' 등 9개 이상의 다양한 카테고리별로 문화 이벤트를 둘러보고,`}
                </p>
                <p>
                  {`필터 기능으로 날짜, 지역, 가격 등 조건을 맞춰 `}
                  <span className="font-bold">내 취향에 꼭 맞는 이벤트를 쉽게 찾을 수 있어요.</span>
                </p>
              </div>
            </div>
          </section>

          {/* 3. together 이미지 */}
          <section className="w-full px-4 py-8 flex justify-center">
            <Image
              src={IMAGES.GUIDE_TOGETHER_IMG}
              alt="동행 참여 이미지"
              width={400}
              height={400}
              className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
            />
          </section>

          {/* 4. 동행 참여 문구 */}
          <section className="w-full px-4 py-6">
            <div className="text-center space-y-4">
              <h3 className="text-[24px] font-bold text-[#26282a] font-['Inter'] leading-[1.33] text-center">
                동행 참여
              </h3>
              <div className="text-sm text-[#76787a] leading-relaxed space-y-2">
                <p>{`마음에 드는 이벤트를 찾았나요?`}</p>
                <p>
                  <span className="font-bold">'동행찾기'</span>
                  {` 탭에서 해당 이벤트에 열려 있는`}
                </p>
                <p>
                  <span className="font-bold">'모집 중인 동행'</span>
                  {`을 찾아 함께할 사람을 구해보세요.`}
                </p>
              </div>
            </div>
          </section>

          {/* 5. recruit 이미지 */}
          <section className="w-full px-4 py-8 flex justify-center border-t border-[#eef0f2]">
            <Image
              src={IMAGES.GUIDE_RECRUIT_IMG}
              alt="동행 모집 이미지"
              width={400}
              height={400}
              className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
            />
          </section>

          {/* 6. 동행 모집 문구 */}
          <section className="w-full px-4 py-6 border-b border-[#eef0f2]">
            <div className="text-center space-y-4">
              <h3 className="text-[24px] font-bold text-[#26282a] font-['Inter'] leading-[1.33] text-center">
                동행 모집
              </h3>
              <div className="text-sm text-[#76787a] leading-relaxed space-y-2">
                <p>{`혹시 원하는 동행 모집이 없나요?`}</p>
                <p>
                  {`직접 `}
                  <span className="font-bold">'동행 모집글 작성'</span>
                  {`을 통해`}
                </p>
                <p>{`나만의 동행을 모집할 수 있어요!`}</p>
              </div>
            </div>
          </section>

          {/* 7. fireworks 이미지 */}
          <section className="w-full px-4 py-8 flex justify-center">
            <Image
              src={IMAGES.GUIDE_FIREWORKS_IMG}
              alt="불꽃놀이 이미지"
              width={400}
              height={400}
              className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
            />
          </section>

          {/* 8. 버튼들 */}
          <section className="w-full px-4 py-8">
            <div className="text-center space-y-6">
              <h3 className="text-[24px] font-bold text-[#26282a] font-['Inter'] leading-[1.33] text-center">
                지금 바로 컬쳐메이트에서 나만의 동행을 찾아보세요!
              </h3>
              <div className="flex flex-col gap-4 max-w-sm mx-auto">
                <Link
                  href={ROUTES.EVENTS}
                  className="
                    bg-[#ffc37f] rounded-[10px] px-4 py-3
                    w-full h-[50px] flex items-center justify-center
                    text-white font-bold text-base leading-[1.5]
                    hover:opacity-80 transition-opacity
                  "
                >
                  이벤트 둘러보기
                </Link>
                
                <Link
                  href={ROUTES.TOGETHER}
                  className="
                    bg-[#ffc37f] rounded-[10px] px-4 py-3
                    w-full h-[50px] flex items-center justify-center
                    text-white font-bold text-base leading-[1.5]
                    hover:opacity-80 transition-opacity
                  "
                >
                  동행 시작하기
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* 데스크톱 전용 기존 레이아웃 */}
        <div className="hidden lg:block">
          {/* 이벤트 탐색 섹션 */}
          <section className="w-full py-8 sm:py-12 md:py-16 lg:py-20">
            <div className="
              flex flex-col items-center space-y-8 sm:space-y-10 md:space-y-12
              w-full max-w-4xl mx-auto
            ">
              <div className="w-full flex justify-center">
                <Image
                  src={IMAGES.GUIDE_FINDEVENT_IMG}
                  alt="이벤트 탐색 이미지"
                  width={400}
                  height={400}
                  className="
                    w-32 h-32 xs:w-36 xs:h-36 sm:w-48 sm:h-48 md:w-60 md:h-60 lg:w-80 lg:h-80 xl:w-96 xl:h-96
                    object-contain
                  "
                />
              </div>

              <h3 className="
                text-[24px] font-bold text-[#26282a] font-['Inter'] leading-[1.33] text-center w-full
              ">
                이벤트 탐색
              </h3>

              <div className="
                text-sm md:text-base lg:text-lg xl:text-xl
                text-[#76787a] text-center leading-relaxed
                w-full max-w-4xl px-3 sm:px-6 md:px-8
              ">
                <p className="mb-3 break-keep">
                  <span className="font-bold">'이벤트'</span>
                  {` 탭에서 '공연', '연극', '뮤지컬' 등 9개 이상의 다양한 카테고리별로 문화 이벤트를 둘러보고,`}
                </p>
                <p className="mb-0 break-keep">
                  {`필터 기능으로 날짜, 지역, 가격 등 조건을 맞춰 `}
                  <span className="font-bold">내 취향에 꼭 맞는 이벤트를 쉽게 찾을 수 있어요.</span>
                </p>
              </div>
            </div>
          </section>

          {/* 동행 참여 섹션 */}
          <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24">
            <div className="
              flex flex-col lg:grid lg:grid-cols-2 
              gap-12 sm:gap-16 md:gap-20 lg:gap-24
              items-center max-w-6xl mx-auto
            ">
              <div className="w-full flex justify-center order-2 lg:order-1">
                <Image
                  src={IMAGES.GUIDE_TOGETHER_IMG}
                  alt="동행 참여 이미지"
                  width={400}
                  height={400}
                  className="
                    w-32 h-32 xs:w-36 xs:h-36 sm:w-48 sm:h-48 md:w-60 md:h-60 lg:w-80 lg:h-80 xl:w-96 xl:h-96
                    object-contain
                  "
                />
              </div>

              <div className="w-full flex flex-col items-center space-y-6 order-1 lg:order-2">
                <h3 className="
                  text-[24px] font-bold text-[#26282a] font-['Inter'] leading-[1.33] text-center
                ">
                  동행 참여
                </h3>

                <div className="
                  text-sm md:text-base lg:text-lg xl:text-xl
                  text-[#76787a] text-center leading-relaxed
                  max-w-xl px-4
                ">
                  <p className="mb-2">{`마음에 드는 이벤트를 찾았나요?`}</p>
                  <p className="mb-2">
                    <span className="font-bold">'동행찾기'</span>
                    {` 탭에서 해당 이벤트에 열려 있는`}
                  </p>
                  <p className="mb-0">
                    <span className="font-bold">'모집 중인 동행'</span>
                    {`을 찾아 함께할 사람을 구해보세요.`}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 동행 모집 섹션 */}
          <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24">
            <div className="
              flex flex-col lg:grid lg:grid-cols-2 
              gap-12 sm:gap-16 md:gap-20 lg:gap-24
              items-center max-w-6xl mx-auto
            ">
              <div className="w-full flex flex-col items-center space-y-6">
                <h3 className="
                  text-[24px] font-bold text-[#26282a] font-['Inter'] leading-[1.33] text-center
                ">
                  동행 모집
                </h3>

                <div className="
                  text-sm md:text-base lg:text-lg xl:text-xl
                  text-[#76787a] text-center leading-relaxed
                  max-w-md px-4
                ">
                  <p className="mb-2">{`혹시 원하는 동행 모집이 없나요?`}</p>
                  <p className="mb-2">
                    {`직접 `}
                    <span className="font-bold">'동행 모집글 작성'</span>
                    {`을 통해`}
                  </p>
                  <p className="mb-0">{`나만의 동행을 모집할 수 있어요!`}</p>
                </div>
              </div>

              <div className="w-full flex justify-center">
                <Image
                  src={IMAGES.GUIDE_RECRUIT_IMG}
                  alt="동행 모집 이미지"
                  width={400}
                  height={400}
                  className="
                    w-32 h-32 xs:w-36 xs:h-36 sm:w-48 sm:h-48 md:w-60 md:h-60 lg:w-80 lg:h-80 xl:w-96 xl:h-96
                    object-contain
                  "
                />
              </div>
            </div>
          </section>

          {/* 불꽃놀이 마무리 섹션 */}
          <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24">
            <div className="
              flex flex-col items-center space-y-8 sm:space-y-10 md:space-y-12
              max-w-4xl mx-auto
            ">
              <div className="w-full flex justify-center">
                <Image
                  src={IMAGES.GUIDE_FIREWORKS_IMG}
                  alt="불꽃놀이 이미지"
                  width={400}
                  height={400}
                  className="
                    w-32 h-32 xs:w-36 xs:h-36 sm:w-48 sm:h-48 md:w-60 md:h-60 lg:w-80 lg:h-80 xl:w-96 xl:h-96
                    object-contain
                  "
                />
              </div>

              <h3 className="
                text-[24px] font-bold text-[#26282a] font-['Inter'] leading-[1.33] text-center
                max-w-3xl px-4
              ">
                지금 바로 컬쳐메이트에서 나만의 동행을 찾아보세요!
              </h3>

              <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md">
                <Link
                  href={ROUTES.EVENTS}
                  className="
                    bg-[#ffc37f] rounded-[10px] px-4 py-3
                    w-full sm:w-auto min-w-[140px] h-[50px] flex items-center justify-center
                    text-white font-bold text-sm md:text-base leading-[1.5]
                    hover:opacity-80 transition-opacity
                  "
                >
                  이벤트 둘러보기
                </Link>
                
                <Link
                  href={ROUTES.TOGETHER}
                  className="
                    bg-[#ffc37f] rounded-[10px] px-4 py-3
                    w-full sm:w-auto min-w-[140px] h-[50px] flex items-center justify-center
                    text-white font-bold text-sm md:text-base leading-[1.5]
                    hover:opacity-80 transition-opacity
                  "
                >
                  동행 시작하기
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}