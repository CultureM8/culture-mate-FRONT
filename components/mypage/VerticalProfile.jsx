"use client"

import { useState, useRef } from "react";
import Image from "next/image";
import { IMAGES, ICONS } from "@/constants/path";

// 개인프로필 컴포넌트
export default function PersonalProfile() {
  const [nickname, setNickname] = useState("사용자 별명");
  const [introduction, setIntroduction] = useState("한줄 자기소개 한줄 자기소개 한줄 자기소개 한줄 자기소개 한줄 자기소개 한줄 자기소개");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [age, setAge] = useState("00 세");
  const [gender, setGender] = useState("여");
  const [mbti, setMbti] = useState("MBTI");
  const [interests, setInterests] = useState(["영화", "연극", "전시", "콘서트/페스티벌"]);
  const [tags, setTags] = useState("#신촌 #맛집탐방 #전시회 #영화관람 #드라이브 #야경감상 #방탈출 #보드게임 #클래식음악 #요가 #러닝 #플리마켓");
  const [galleryImages, setGalleryImages] = useState([null, null, null, null, null, null]);

  return (
    <>
      {/* 스크롤바 스타일 */}
      <style jsx global>{`
        .profile-scroll-container {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
        }
        
        .profile-scroll-container::-webkit-scrollbar {
          width: 8px;
        }
        
        .profile-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .profile-scroll-container::-webkit-scrollbar-thumb {
          background-color: transparent;
          border-radius: 4px;
          transition: background-color 0.3s ease;
        }
        
        /* 데스크톱: 호버 시 스크롤바 손잡이 나타남 */
        @media (min-width: 768px) {
          .profile-scroll-container:hover::-webkit-scrollbar-thumb {
            background-color: #F3F4F6;
          }
          
          .profile-scroll-container::-webkit-scrollbar-thumb:hover {
            background-color: #EEF0F2;
          }
        }
        
        /* 모바일: 완전히 숨김 */
        @media (max-width: 767px) {
          .profile-scroll-container::-webkit-scrollbar {
            display: none;
          }
          
          .profile-scroll-container {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
        }
      `}</style>
      
      <div className="w-full max-w-[600px] mx-auto bg-white overflow-hidden">
        {/* 스크롤 가능한 컨테이너 */}
        <div className="h-[600px] overflow-y-auto profile-scroll-container">
          {/* 프로필 배경 섹션 */}
          <div 
            className="bg-gray-100 flex flex-col h-[240px] items-end justify-end p-[10px] w-full relative"
            style={{
              backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* CLOSE 버튼 (우측 상단) */}
            <div className="absolute top-4 right-4 z-10">
              <div className="flex items-center justify-center w-6 h-6 cursor-pointer">
                <Image 
                  src={ICONS.CLOSE}
                  alt="close-icon"
                  width={16}
                  height={16}
                  style={{ filter: 'brightness(0) saturate(100%) invert(47%) sepia(3%) saturate(374%) hue-rotate(179deg) brightness(95%) contrast(89%)' }}
                />
              </div>
            </div>

            {/* 프로필 이미지 영역 */}
            <div 
              className="absolute left-1/2 transform -translate-x-1/2 top-[160px] w-40 h-40 rounded-full overflow-hidden z-20 border-4 border-white"
              style={{
                width: '160px',
                height: '160px',
                backgroundColor: profileImage ? 'transparent' : '#C6C8CA',
                backgroundImage: profileImage ? `url(${profileImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {!profileImage && (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-sm">DIDIER DUBGF</span>
                </div>
              )}
            </div>
          </div>

          {/* 프로필 정보 섹션 */}
          <div className="flex flex-col px-8 pt-[100px] pb-4 w-full">
            {/* 사용자 별명과 한줄 자기소개 */}
            <div className="flex flex-col gap-2 items-center justify-start mb-4">
              <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[18px] text-left text-nowrap">
                <p className="block leading-[1.55] whitespace-pre">{nickname}</p>
              </div>
              <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal h-5 justify-center leading-[0] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#76787a] text-[14px] text-center text-nowrap w-full">
                <p className="block leading-[1.43] overflow-inherit">{introduction}</p>
              </div>
            </div>

            {/* 기본 정보 (나이, 성별, MBTI) */}
            <div className="flex flex-row items-start justify-between w-full mb-4">
              <div className="bg-[#ffffff] box-border flex flex-row gap-2.5 items-center justify-center px-4 py-2 relative rounded self-stretch shrink-0 w-40">
                <div aria-hidden="true" className="absolute border border-[#c6c8ca] border-solid inset-0 pointer-events-none rounded" />
                <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[16px] text-left text-nowrap">
                  <p className="block leading-[1.5] whitespace-pre">{age}</p>
                </div>
              </div>
              <div className="bg-[#ffffff] box-border flex flex-row gap-2.5 items-center justify-center px-4 py-2 relative rounded self-stretch shrink-0 w-40">
                <div aria-hidden="true" className="absolute border border-[#c6c8ca] border-solid inset-0 pointer-events-none rounded" />
                <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[16px] text-left text-nowrap">
                  <p className="block leading-[1.5] whitespace-pre">{gender}</p>
                </div>
              </div>
              <div className="bg-[#ffffff] box-border flex flex-row gap-2.5 items-center justify-center px-4 py-2 relative rounded self-stretch shrink-0 w-40">
                <div aria-hidden="true" className="absolute border border-[#c6c8ca] border-solid inset-0 pointer-events-none rounded" />
                <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[16px] text-left text-nowrap">
                  <p className="block leading-[1.5] whitespace-pre">{mbti}</p>
                </div>
              </div>
            </div>

            {/* 관심 이벤트 유형 */}
            <div className="flex flex-col gap-[9px] items-start justify-start w-full mb-4">
              <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[16px] text-left text-nowrap">
                <p className="block leading-[1.5] whitespace-pre">관심 이벤트 유형</p>
              </div>
              <div className="bg-[#ffffff] box-border flex flex-row flex-wrap gap-2.5 min-h-14 items-start justify-start p-[16px] relative rounded shrink-0 w-full">
                <div aria-hidden="true" className="absolute border border-[#c6c8ca] border-solid inset-0 pointer-events-none rounded" />
                {interests.map((interest, index) => (
                  <div key={index} className="bg-[#ffffff] box-border flex flex-row gap-1 items-center justify-center px-2 py-0 relative rounded-[15px] shrink-0 h-[30px]">
                    <div aria-hidden="true" className="absolute border border-[#76787a] border-solid inset-0 pointer-events-none rounded-[15px]" />
                    <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#9ea0a2] text-[14px] text-left text-nowrap">
                      <p className="block leading-[1.43] whitespace-pre">{interest}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 관심 태그 */}
            <div className="flex flex-col gap-[9px] items-start justify-start w-full mb-4">
              <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[16px] text-left text-nowrap">
                <p className="block leading-[1.5] whitespace-pre">관심 태그</p>
              </div>
              <div className="bg-[#ffffff] box-border flex flex-row flex-wrap gap-2.5 items-start justify-start min-h-14 p-[16px] relative rounded shrink-0 w-full border border-[#c6c8ca]">
                {tags.split(' ').map((tag, index) => (
                  <div key={index} className="bg-[#ffffff] box-border flex flex-row gap-1 items-center justify-center px-2 py-0 relative rounded-[15px] shrink-0 h-[30px]">
                    <div aria-hidden="true" className="absolute border border-[#76787a] border-solid inset-0 pointer-events-none rounded-[15px]" />
                    <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#9ea0a2] text-[14px] text-left text-nowrap">
                      <p className="block leading-[1.43] whitespace-pre">{tag}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 갤러리 */}
            <div className="flex flex-col gap-[9px] items-start justify-start w-full">
              <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[16px] text-left text-nowrap">
                <p className="block leading-[1.5] whitespace-pre">갤러리</p>
              </div>
              <div className="bg-[#ffffff] box-border flex flex-col gap-2.5 items-start justify-start min-h-14 p-[16px] relative rounded shrink-0 w-full">
                <div aria-hidden="true" className="absolute border border-[#c6c8ca] border-solid inset-0 pointer-events-none rounded" />
                
                {/* 갤러리 3열 그리드 */}
                <div className="grid grid-cols-3 gap-2.5 w-full">
                  {galleryImages.map((image, index) => (
                    <div 
                      key={index}
                      className="bg-[#eef0f2] rounded-lg aspect-square overflow-hidden"
                      style={{
                        backgroundImage: image ? `url(${image})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      {!image && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-6 h-6 bg-gray-300 rounded"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}