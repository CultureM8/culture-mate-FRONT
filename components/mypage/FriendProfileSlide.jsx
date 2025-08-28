"use client"

import { useState } from "react";
import Image from "next/image";
import { IMAGES, ICONS } from "@/constants/path";

export default function FriendProfileSlide({ 
  friend, 
  isVisible = false, 
  onClose 
}) {
  // 기본값 설정
  const defaultFriend = {
    name: "사용자 별명",
    introduction: "한줄 자기소개 한줄 자기소개 한줄 자기소개 한줄 자기소개 한줄 자기소개 한줄 자기소개",
    profileImage: null,
    backgroundImage: null,
    age: "00 세",
    gender: "여",
    mbti: "MBTI",
    interests: ["영화", "연극", "전시", "콘서트/페스티벌"],
    tags: "#신촌 #맛집탐방 #전시회 #영화관람 #드라이브 #야경감상 #방탈출 #보드게임 #클래식음악 #요가 #러닝 #플리마켓",
    galleryImages: [null, null, null, null, null, null]
  };

  // friend 데이터와 기본값 병합
  const currentFriend = { ...defaultFriend, ...friend };

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <div className="w-full h-full bg-white shadow-lg border-l border-gray-200">
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
        
        @media (min-width: 768px) {
          .profile-scroll-container:hover::-webkit-scrollbar-thumb {
            background-color: #F3F4F6;
          }
          
          .profile-scroll-container::-webkit-scrollbar-thumb:hover {
            background-color: #EEF0F2;
          }
        }
        
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
      
      {/* 스크롤 가능한 컨테이너 */}
      <div className="h-full overflow-y-auto profile-scroll-container">
        {/* 프로필 배경 섹션 */}
        <div 
          className="bg-gray-100 flex flex-col h-[240px] items-end justify-end p-[10px] w-full relative"
          style={{
            backgroundImage: currentFriend.backgroundImage ? `url(${currentFriend.backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* CLOSE 버튼 (우측 상단) */}
          <div className="absolute top-4 right-4 z-10">
            <div 
              className="flex items-center justify-center w-6 h-6 cursor-pointer"
              onClick={handleClose}
            >
              <Image 
                src={ICONS.CLOSE}
                alt="close-icon"
                width={16}
                height={16}
                style={{ filter: 'brightness(0) saturate(100%) invert(47%) sepia(3%) saturate(374%) hue-rotate(179deg) brightness(95%) contrast(89%)' }}
              />
            </div>
          </div>

          {/* 내 친구, 신고 버튼들 */}
          <div className="absolute top-4 right-16 z-10 flex gap-2">
            <button className="bg-orange-400 text-white px-3 py-1 rounded-md text-sm font-medium">
              내 친구
            </button>
            <button className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1">
              <Image 
                src={ICONS.BELL}
                alt="신고"
                width={12}
                height={12}
              />
              신고
            </button>
          </div>

          {/* 프로필 이미지 영역 */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 top-[160px] w-40 h-40 rounded-full overflow-hidden z-20 border-4 border-white"
            style={{
              width: '160px',
              height: '160px',
              backgroundColor: currentFriend.profileImage ? 'transparent' : '#C6C8CA',
              backgroundImage: currentFriend.profileImage ? `url(${currentFriend.profileImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {!currentFriend.profileImage && (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-sm">DIDIER DUBGF</span>
              </div>
            )}
          </div>
        </div>

        {/* 프로필 정보 섹션 */}
        <div className="flex flex-col px-8 pt-[100px] pb-8 w-full">
          {/* 사용자 별명과 한줄 자기소개 */}
          <div className="flex flex-col gap-2 items-center justify-start mb-4">
            <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[18px] text-left text-nowrap">
              <p className="block leading-[1.55] whitespace-pre">{currentFriend.name}</p>
            </div>
            <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal h-5 justify-center leading-[0] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#76787a] text-[14px] text-center text-nowrap w-full">
              <p className="block leading-[1.43] overflow-inherit">{currentFriend.introduction}</p>
            </div>
          </div>

          {/* 기본 정보 (나이, 성별, MBTI) */}
          <div className="flex flex-row items-start justify-between w-full mb-4">
            <div className="bg-[#ffffff] box-border flex flex-row gap-2.5 items-center justify-center px-4 py-2 relative rounded self-stretch shrink-0 w-40">
              <div aria-hidden="true" className="absolute border border-[#c6c8ca] border-solid inset-0 pointer-events-none rounded" />
              <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[16px] text-left text-nowrap">
                <p className="block leading-[1.5] whitespace-pre">{currentFriend.age}</p>
              </div>
            </div>
            <div className="bg-[#ffffff] box-border flex flex-row gap-2.5 items-center justify-center px-4 py-2 relative rounded self-stretch shrink-0 w-40">
              <div aria-hidden="true" className="absolute border border-[#c6c8ca] border-solid inset-0 pointer-events-none rounded" />
              <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[16px] text-left text-nowrap">
                <p className="block leading-[1.5] whitespace-pre">{currentFriend.gender}</p>
              </div>
            </div>
            <div className="bg-[#ffffff] box-border flex flex-row gap-2.5 items-center justify-center px-4 py-2 relative rounded self-stretch shrink-0 w-40">
              <div aria-hidden="true" className="absolute border border-[#c6c8ca] border-solid inset-0 pointer-events-none rounded" />
              <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[16px] text-left text-nowrap">
                <p className="block leading-[1.5] whitespace-pre">{currentFriend.mbti}</p>
              </div>
            </div>
          </div>

          {/* 관심 이벤트 유형 */}
          <div className="flex flex-col gap-[9px] items-start justify-start w-full mb-4">
            <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[16px] text-left text-nowrap">
              <p className="block leading-[1.5] whitespace-pre">관심 이벤트 유형</p>
            </div>
            <div className="bg-[#ffffff] box-border flex flex-row flex-wrap gap-2.5 min-h-14 items-start justify-start p-[16px] relative rounded shrink-0 w-full">
              <div aria-hidden="true" className="absolute border border-[#c6c8ca] border-solid inset-0 pointer-events-none rounded" />
              {currentFriend.interests.map((interest, index) => (
                <div key={index} className="bg-[#ffffff] box-border flex flex-row gap-1 items-center justify-center px-2 py-0 relative rounded-[15px] shrink-0 h-[30px]">
                  <div aria-hidden="true" className="absolute border border-[#76787a] border-solid inset-0 pointer-events-none rounded-[15px]" />
                  <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#9ea0a2] text-[14px] text-left text-nowrap">
                    <p className="block leading-[1.43] whitespace-pre">{interest}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 관심 태그 */}
          <div className="flex flex-col gap-[9px] items-start justify-start w-full mb-4">
            <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[16px] text-left text-nowrap">
              <p className="block leading-[1.5] whitespace-pre">관심 태그</p>
            </div>
            <div className="bg-[#ffffff] box-border flex flex-row flex-wrap gap-2.5 items-start justify-start min-h-14 p-[16px] relative rounded shrink-0 w-full border border-[#c6c8ca]">
              {currentFriend.tags.split(' ').map((tag, index) => (
                <div key={index} className="bg-[#ffffff] box-border flex flex-row gap-1 items-center justify-center px-2 py-0 relative rounded-[15px] shrink-0 h-[30px]">
                  <div aria-hidden="true" className="absolute border border-[#76787a] border-solid inset-0 pointer-events-none rounded-[15px]" />
                  <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#9ea0a2] text-[14px] text-left text-nowrap">
                    <p className="block leading-[1.43] whitespace-pre">{tag}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 갤러리 */}
          <div className="flex flex-col gap-[9px] items-start justify-start w-full mb-8">
            <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[16px] text-left text-nowrap">
              <p className="block leading-[1.5] whitespace-pre">갤러리</p>
            </div>
            <div className="bg-[#ffffff] box-border flex flex-col gap-2.5 items-start justify-start min-h-14 p-[16px] relative rounded shrink-0 w-full">
              <div aria-hidden="true" className="absolute border border-[#c6c8ca] border-solid inset-0 pointer-events-none rounded" />
              
              {/* 갤러리 3열 그리드 */}
              <div className="grid grid-cols-3 gap-2.5 w-full">
                {currentFriend.galleryImages.map((image, index) => (
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
  );
}
