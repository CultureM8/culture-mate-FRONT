"use client"

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ROUTES, ICONS } from "@/constants/path";

export default function MiniProfile() {
  const [userProfile, setUserProfile] = useState({
    nickname: "사용자 별명",
    profileImage: null // ProfileBG에서 설정한 이미지
  });

  // ProfileBG와 연동된 프로필 정보 로드
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserProfile({
        nickname: profile.nickname || "사용자 별명",
        profileImage: profile.profileImage || null
      });
    }
  }, []);

  const menuItems = [
    { label: "프로필", path: ROUTES.MYPAGE },
n   { label: "내 동행관리", path: ROUTES.FRIENDLIST },
    { label: "관심목록", path: ROUTES.INTEREST },
    { label: "히스토리", path: ROUTES.HISTORY },
    { label: "게시물 관리", path: ROUTES.POST_MANAGE },
    { label: "환경설정", path: ROUTES.SETTINGS },
  ];

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userProfile');
    window.location.href = ROUTES.HOME;
  };

  return (
    <div className="
      bg-white border border-gray-100 rounded shadow-lg
      p-4 flex flex-col gap-4 items-end justify-start
      w-[200px]
    ">
      {/* 사용자 정보 섹션 */}
      <div className="flex flex-row gap-2 items-center justify-end w-full">
        <span className="text-[#26282a] text-base font-normal">
          {userProfile.nickname}
        </span>
        {/* ProfileBG와 연동될 대형 원형 프로필 이미지 공간 */}
        <div className="relative w-12 h-12 bg-[#C6C8CA] rounded-full overflow-hidden">
          {userProfile.profileImage ? (
            <Image
              src={userProfile.profileImage}
              alt="profile-image"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>
      </div>

      {/* 메뉴 아이템들 */}
      {menuItems.map((item, index) => (
        <Link
          key={index}
          href={item.path}
          className="
            px-1 py-0 flex items-center justify-end h-6 w-full
            text-[#a6a6a6] text-base font-normal
            hover:text-[#26282a] transition-colors
          "
        >
          {item.label}
        </Link>
      ))}

      {/* 로그아웃 섹션 */}
      <div className="flex flex-row gap-4 items-center justify-end w-full">
        <button
          onClick={handleLogout}
          className="
            px-1 py-0 flex items-center justify-start h-6
            text-[#a6a6a6] text-base font-normal
            hover:text-[#26282a] transition-colors
          "
        >
          로그아웃
        </button>
        <Image
          src={ICONS.LOGOUT_BTN}
          alt="logout-icon"
          width={24}
          height={24}
          className="cursor-pointer"
          onClick={handleLogout}
        />
      </div>
    </div>
  );
}