"use client"

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ROUTES, IMAGES, ICONS } from "@/constants/path";
import SearchBar from "./SearchBar";

export default function NavigationBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 네비게이션바 렌더링할때 한번만 실행
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  const flexStyle = "flex items-center justify-between md:gap-[clamp(8px,3vw,48px)] sm:gap-3";

  const navMenu = [
    ["이벤트", ROUTES.EVENTS], 
    ["동행찾기", ROUTES.WITH], 
    ["커뮤니티", ROUTES.COMMUNITY], 
    ["고객센터", ROUTES.HELP],
  ];

  return (
    <nav className="
      border-b bg-white h-25 w-full flex items-center justify-between
      px-[clamp(0px,6vw,120px)]
    ">
      {/* 좌측 로고와 검색창 */}
      <div className={`${flexStyle} shrink-0`}>
        {/* 로고이미지는 전체 페이지를 새로고침하도록 a태그 사용 */}
        <a href={ROUTES.HOME}>
          <Image
            src={IMAGES.LOGO}
            alt="culture-mate-logo"
            width={120}
            height={40}
          />
        </a>
        <SearchBar/>
      </div>

      {/* 우측 메뉴들 */}
      <div className={`${flexStyle} shrink-0`}>
        {navMenu.map((v, i) => (
          <Link key={i} href={v[1]} className="text-xl">{v[0]}</Link>
        ))}
        <Link href={ROUTES.MYPAGE}>
          <Image 
            src={ICONS.DEFAULT_PROFILE}
            alt="profile-image"
            width={24}
            height={24}
          />
        </Link>
        <Link href={"/"}>
          <Image 
            src={ICONS.LOGOUT_BTN}
            alt="logout-btn"
            width={24}
            height={24}
          />
        </Link>
      </div>
    </nav>
  );
}