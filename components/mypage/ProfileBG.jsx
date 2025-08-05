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
    <div className="bg-[#c6c8ca] rounded-lg cursor-pointer hover:bg-gray-400 transition-colors px-4 py-2">
      {/* 추후 Link 컴포넌트로 감쌀 예정 */}
      {/* <Link href="/mypage/edit"> */}
        <div className="flex flex-col font-medium justify-center text-white text-center">
          <p className="font-bold leading-[1.5] text-[16px] whitespace-pre">
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
  const [score, setScore] = useState(0);
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
    <div className="w-[1200px] h-[450px] mx-auto bg-white border-b border-gray-200 overflow-hidden">
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

      {/* 프로필 배경 섹션 - 1200x280 */}
      <div 
        className="bg-gray-100 flex flex-col h-[280px] items-end justify-end p-[10px] w-[1200px] relative"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* 프로필 배경 수정 버튼 - 독립적인 영역 */}
        <div 
          className="flex items-center gap-2 text-[#c6c8ca] text-[16px] z-10 cursor-pointer"
          onMouseEnter={() => setIsHoveringBackground(true)}
          onMouseLeave={() => setIsHoveringBackground(false)}
          onClick={handleBackgroundEditClick}
          style={{
            opacity: !backgroundImage || isHoveringBackground ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out'
          }}
        >
          <span>프로필 배경 수정</span>
          <div className="w-5 h-5 cursor-pointer text-[#c6c8ca]">
            <EditIcon />
          </div>
        </div>

        {/* 프로필 이미지 영역 (1200x450 기준 X:32, Y:212에 위치) - 200x200 사이즈 */}
        <div 
          className="absolute left-8 top-[212px] w-[200px] h-[200px] rounded-full overflow-hidden z-20"
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
                  className="flex items-center text-[#26282a] text-[16px] cursor-pointer mb-2 font-normal" 
                  style={{fontFamily: 'Inter, Noto Sans KR, sans-serif', gap: '7px'}}
                  onClick={handleProfileEditClick}
                >
                  <span>프로필 변경</span>
                  <div className="w-[15px] h-[14.27px] text-[#26282a]">
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
                  className="flex items-center text-[#26282a] text-[16px] cursor-pointer mb-2 font-normal" 
                  style={{fontFamily: 'Inter, Noto Sans KR, sans-serif', gap: '7px'}}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProfileEditClick();
                  }}
                >
                  <span>프로필 변경</span>
                  <div className="w-[15px] h-[14.27px] text-[#26282a]">
                    <EditIcon />
                  </div>
                </div>
                
                {/* 프로필 삭제 버튼 */}
                <div 
                  className="flex items-center text-[#26282a] text-[16px] cursor-pointer font-normal" 
                  style={{fontFamily: 'Inter, Noto Sans KR, sans-serif', gap: '7px'}}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProfileDelete();
                  }}
                >
                  <span>프로필 삭제</span>
                  <div className="w-[14px] h-[14px] text-[#26282a]">
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

      {/* 프로필 정보 섹션 - 나머지 170px 높이 */}
      <div className="flex flex-col h-[170px] items-end justify-start pr-8 py-4 w-[1200px]">
        {/* 928x60 영역 - 사용자 정보와 한줄 자기소개 - 우측에서 32px 떨어진 위치 */}
        <div className="w-[928px] h-[60px] p-4 flex flex-col items-start" style={{gap: '20px'}}>
          {/* 사용자 별명과 동행 점수 */}
          <div className="flex flex-row items-center w-full">
            <div className="flex flex-col font-semibold justify-center text-[#26282a] text-[28px] text-left">
              <p className="leading-[1.28]">{nickname}</p>
            </div>
            
            <div className="flex flex-row items-center justify-start ml-6">
              <div className="flex flex-col font-normal justify-center text-[#26282a] text-[16px] text-left mr-8">
                <p className="leading-[1.5]">동행 점수</p>
              </div>
              
              {/* 진행률 바 - 고정 너비 458px */}
              <div className="flex flex-col items-start justify-center relative" style={{width: '458px'}}>
                {/* 배경 바 */}
                <div className="h-2 w-full bg-[#eef0f2] rounded-[5px] relative">
                  {/* 진행률 바 */}
                  <div 
                    className="h-2 bg-[#ffc37f] rounded-[5px] absolute top-0 left-0 transition-all duration-300"
                    style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
                  />
                  
                  {/* 점수 표시 - 게이지 바의 오른쪽 위에 유동적으로 위치 */}
                  <div 
                    className="absolute -top-6 text-[#26282a] text-[16px] transform -translate-x-1/2 transition-all duration-300"
                    style={{ 
                      left: `${Math.min(Math.max(score, 0), 100)}%`,
                      minWidth: 'max-content'
                    }}
                  >
                    <p className="leading-[1.5]">{score}점</p>
                  </div>
                </div>
              </div>
              
              {/* 수정 버튼 - 점수표기바에서 48px 간격 */}
              <div className="ml-12">
                <EditButton />
              </div>
            </div>
          </div>

          {/* 한줄 자기소개 - 표시 전용 */}
          <div className="flex flex-col justify-center text-[#26282a] text-[20px] text-left w-full" style={{fontFamily: 'Inter, Noto Sans KR, sans-serif', fontWeight: 500, lineHeight: 1.4}}>
            <p className="leading-[1.4]">{introduction}</p>
          </div>
        </div>
      </div>
    </div>
  );
}