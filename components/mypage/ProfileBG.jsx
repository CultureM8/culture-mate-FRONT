"use client"

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { IMAGES, ICONS } from "@/constants/path";

// Edit 아이콘 컴포넌트
function EditIcon() {
  return (
    <svg
      className="w-full h-full"
      fill="none"
      viewBox="0 0 17 17"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.5 15.2678H16M12.25 1.51777C12.5815 1.18625 13.0312 1 13.5 1C13.7321 1 13.962 1.04572 14.1765 1.13456C14.391 1.2234 14.5858 1.35361 14.75 1.51777C14.9142 1.68192 15.0444 1.8768 15.1332 2.09127C15.222 2.30575 15.2678 2.53562 15.2678 2.76777C15.2678 2.99991 15.222 3.22979 15.1332 3.44426C15.0444 3.65874 14.9142 3.85361 14.75 4.01777L4.33333 14.4344L1 15.2678L1.83333 11.9344L12.25 1.51777Z"
      />
    </svg>
  );
}

// 수정 버튼 컴포넌트 (추후 Link 경로 추가 예정)
function EditButton() {
  return (
    <div className="bg-[#c6c8ca] rounded-lg cursor-pointer hover:bg-gray-400 transition-colors px-3 py-2 md:px-4 md:py-2">
      {/* 추후 Link 컴포넌트로 감쌀 예정 */}
      {/* <Link href="/mypage/edit"> */}
        <div className="flex flex-col font-medium justify-center text-white text-center">
          <p className="font-bold leading-[1.5] text-sm md:text-[16px] whitespace-pre">
            회원정보 수정
          </p>
        </div>
      {/* </Link> */}
    </div>
  );
}

// 메인 프로필 정보 컴포넌트
export default function ProfileInfo() {
  const [nickname, setNickname] = useState("사용자 별명");
  const [score, setScore] = useState(50);
  const [introduction, setIntroduction] = useState("한줄 자기소개 한줄 자기소개 한줄 자기소개 한줄 자기소개 한줄 자기소개 한줄 자기소개");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [isHoveringBackground, setIsHoveringBackground] = useState(false);
  const [isHoveringProfile, setIsHoveringProfile] = useState(false);

  // 파일 입력 ref
  const backgroundFileRef = useRef(null);
  const profileFileRef = useRef(null);

  // 프로필 배경 이미지 업로드 핸들러
  const handleBackgroundImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  // 프로필 이미지 업로드 핸들러
  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  // 배경 이미지 변경 클릭 핸들러
  const handleBackgroundEditClick = () => {
    backgroundFileRef.current?.click();
  };

  // 프로필 이미지 변경 클릭 핸들러
  const handleProfileEditClick = () => {
    profileFileRef.current?.click();
  };

  // 프로필 이미지 삭제 핸들러
  const handleProfileDelete = () => {
    setProfileImage(null);
  };

  return (
    <div className="w-full max-w-[1200px] h-auto min-h-[450px] mx-auto bg-white border-b border-gray-200 overflow-hidden">
      {/* 숨겨진 파일 입력들 */}
      <input
        type="file"
        ref={backgroundFileRef}
        onChange={handleBackgroundImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={profileFileRef}
        onChange={handleProfileImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* 프로필 배경 섹션 - 반응형 높이 */}
      <div 
        className="bg-gray-100 flex flex-col h-[280px] sm:h-[240px] md:h-[280px] items-end justify-end p-[10px] w-full relative"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* 프로필 배경 수정 버튼 - 독립적인 영역 */}
        <div 
          className="flex items-center gap-2 text-[#c6c8ca] text-sm md:text-base z-10 cursor-pointer"
          onMouseEnter={() => setIsHoveringBackground(true)}
          onMouseLeave={() => setIsHoveringBackground(false)}
          onClick={handleBackgroundEditClick}
          style={{
            opacity: !backgroundImage || isHoveringBackground ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out'
          }}
        >
          <span>프로필 배경 수정</span>
          <div className="w-4 h-4 md:w-5 md:h-5 cursor-pointer text-[#c6c8ca]">
            <EditIcon />
          </div>
        </div>

        {/* 프로필 이미지 영역 - 반응형 크기 및 위치 */}
        <div 
          className="absolute left-4 sm:left-6 md:left-8 top-[180px] sm:top-[160px] md:top-[212px] 
                     w-32 h-32 sm:w-40 sm:h-40 md:w-[200px] md:h-[200px] 
                     rounded-full overflow-hidden z-20"
          style={{
            backgroundColor: profileImage ? 'transparent' : '#C6C8CA',
            backgroundImage: profileImage ? `url(${profileImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          onMouseEnter={() => setIsHoveringProfile(true)}
          onMouseLeave={() => setIsHoveringProfile(false)}
        >
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            {/* 프로필 이미지가 없는 경우 버튼들 표시 */}
            {!profileImage && (
              <>
                {/* 프로필 변경 버튼 */}
                <div 
                  className="flex items-center text-[#26282a] text-sm md:text-base cursor-pointer mb-1 md:mb-2 font-normal" 
                  style={{fontFamily: 'Inter, Noto Sans KR, sans-serif', gap: '4px'}}
                  onClick={handleProfileEditClick}
                >
                  <span>프로필 변경</span>
                  <div className="w-3 h-3 md:w-[15px] md:h-[14.27px] text-[#26282a]">
                    <EditIcon />
                  </div>
                </div>
              </>
            )}

            {/* 프로필 이미지가 있는 경우 호버 시 버튼들 표시 */}
            {profileImage && isHoveringProfile && (
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                {/* 프로필 변경 버튼 */}
                <div 
                  className="flex items-center text-[#26282a] text-sm md:text-base cursor-pointer mb-1 md:mb-2 font-normal" 
                  style={{fontFamily: 'Inter, Noto Sans KR, sans-serif', gap: '4px'}}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProfileEditClick();
                  }}
                >
                  <span>프로필 변경</span>
                  <div className="w-3 h-3 md:w-[15px] md:h-[14.27px] text-[#26282a]">
                    <EditIcon />
                  </div>
                </div>
                
                {/* 프로필 삭제 버튼 */}
                <div 
                  className="flex items-center text-[#26282a] text-sm md:text-base cursor-pointer font-normal" 
                  style={{fontFamily: 'Inter, Noto Sans KR, sans-serif', gap: '4px'}}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProfileDelete();
                  }}
                >
                  <span>프로필 삭제</span>
                  <div className="w-3 h-3 md:w-[14px] md:h-[14px] text-[#26282a]">
                    <svg className="w-full h-full" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 1L1 11M1 1L11 11" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 프로필 정보 섹션 - 반응형 높이 및 패딩 */}
      <div className="flex flex-col h-auto min-h-[170px] items-center md:items-end justify-start px-4 md:px-8 py-4 w-full">
        {/* 반응형 컨테이너 - 사용자 정보와 한줄 자기소개 */}
        <div className="w-full max-w-[928px] min-h-[60px] p-2 md:p-4 flex flex-col items-start gap-6 sm:gap-8 md:gap-5">
          {/* 사용자 별명과 동행 점수 */}
          <div className="flex flex-col xl:flex-row items-end xl:items-center w-full gap-4 sm:gap-6 xl:gap-0">
            <div className="flex flex-col font-semibold justify-center text-[#26282a] text-xl sm:text-2xl xl:text-[28px] text-right xl:text-left whitespace-nowrap self-end xl:self-start">
              <p className="leading-[1.28] whitespace-nowrap">{nickname}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row xl:flex-row items-end sm:items-center xl:items-center justify-start w-full xl:ml-6 gap-4 sm:gap-6 xl:gap-0">
              <div className="flex flex-col font-normal justify-center text-[#26282a] text-sm xl:text-base text-right xl:text-left sm:mr-4 xl:mr-8 self-end xl:self-start">
                <p className="leading-[1.5]">동행 점수</p>
              </div>
              
              {/* 진행률 바 - 반응형 너비 */}
              <div className="flex flex-col items-start justify-center relative w-full sm:max-w-[300px] xl:max-w-[458px]">
                {/* 배경 바 */}
                <div className="h-2 w-full bg-[#eef0f2] rounded-[5px] relative">
                  {/* 진행률 바 */}
                  <div 
                    className="h-2 bg-[#ffc37f] rounded-[5px] absolute top-0 left-0 transition-all duration-300"
                    style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
                  />
                  
                  {/* 점수 표시 - 게이지 바의 오른쪽 위에 유동적으로 위치 */}
                  <div 
                    className="absolute -top-6 text-[#26282a] text-sm xl:text-base transform -translate-x-1/2 transition-all duration-300"
                    style={{ 
                      left: `${Math.min(Math.max(score, 0), 100)}%`,
                      minWidth: 'max-content'
                    }}
                  >
                    <p className="leading-[1.5]">{score}점</p>
                  </div>
                </div>
              </div>
              
              {/* 수정 버튼 - 반응형 여백 */}
              <div className="mt-4 sm:mt-0 sm:ml-4 xl:ml-12 self-end xl:self-center">
                <EditButton />
              </div>
            </div>
          </div>

          {/* 한줄 자기소개 - 표시 전용 */}
          <div className="flex flex-col justify-center text-[#26282a] text-lg md:text-[20px] text-left w-full" style={{fontFamily: 'Inter, Noto Sans KR, sans-serif', fontWeight: 500, lineHeight: 1.4}}>
            <p className="leading-[1.4]">{introduction}</p>
          </div>
        </div>
      </div>
    </div>
  );
}