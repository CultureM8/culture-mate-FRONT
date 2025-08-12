"use client"

/*
 * TODO: 로그인 시스템 구현 후 수정 필요사항
 * 
 * 1. 현재는 테스트 버전으로 /mypage, /admin 경로에서만 '로그인 후' 상태 시뮬레이션
 * 2. 실제 로그인 시스템 구현 후 localStorage에 accessToken 저장되면 정상 동작
 * 3. 사용자가 '/mypage' 직접 입력으로 접근 시 토큰이 없으면 
 *    alert('로그인이 필요합니다.') 표시 후 로그인 페이지로 리다이렉트 필요
 * 4. /mypage 하위 경로들(/mypage/history 등)도 로그인 상태로 인식하도록 
 *    pathname.startsWith() 방식으로 조건 확장 필요
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ROUTES, IMAGES, ICONS } from "@/constants/path";
import SearchBar from "./SearchBar";
import MiniProfile from "./MiniProfile";

export default function NavigationBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();

  // 네비게이션바 렌더링할때 한번만 실행
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole'); // 사용자 역할 정보
    
    // 마이페이지나 관리자 페이지에 있다면 로그인 상태로 간주 (테스트용)
    const isInProtectedRoute = pathname === ROUTES.MYPAGE || pathname === ROUTES.ADMIN;
    
    setIsLoggedIn(!!token || isInProtectedRoute);
    setIsAdmin(userRole === 'admin' || pathname === ROUTES.ADMIN);
  }, [pathname]);

  // 프로필 아이콘 클릭 핸들러
  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const flexStyle = "flex items-center justify-between md:gap-[clamp(8px,3vw,48px)] sm:gap-3";

  // 로그인 상태에 따른 메뉴 구성
  const getNavMenu = () => {
    const baseMenu = [
      ["이벤트", ROUTES.EVENTS], 
      ["동행찾기", ROUTES.WITH], 
      ["커뮤니티", ROUTES.COMMUNITY], 
      ["고객센터", ROUTES.HELP],
    ];

    if (isAdmin) {
      return [...baseMenu, ["관리자", ROUTES.ADMIN]];
    }
    
    return baseMenu;
  };

  const navMenu = getNavMenu();

  return (
    <nav className="
      border-b border-b-[#EEF0F2] bg-white w-full
      px-[clamp(0px,6vw,120px)]
    ">
      {/* 데스크톱 버전 */}
      <div className="hidden md:flex items-center justify-between h-25">
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
          
          {/* SearchBar 스타일 오버라이드 래퍼 */}
          <div className="[&_form]:border-[#C6C8CA] [&_input]:placeholder-[#C6C8CA] [&_input]:outline-none [&_input]:focus:outline-none">
            <SearchBar/>
          </div>
        </div>

        {/* 우측 메뉴들 */}
        <div className={`${flexStyle} shrink-0`}>
          {navMenu.map((v, i) => (
            <Link key={i} href={v[1]} className="text-xl">{v[0]}</Link>
          ))}
          
          {/* 로그인 상태에 따른 아이콘 표시 */}
          {isLoggedIn ? (
            <>
              <div className="relative">
                <button onClick={handleProfileClick} className="hover:cursor-pointer">
                  <Image 
                    src={ICONS.DEFAULT_PROFILE}
                    alt="profile-image"
                    width={24}
                    height={24}
                  />
                </button>
                
                {/* 드롭다운 메뉴 */}
                {isDropdownOpen && (
                  <div className="absolute top-8 right-0 z-50">
                    <MiniProfile />
                  </div>
                )}
              </div>
              
              <Link href={"/"}>
                <Image 
                  src={ICONS.LOGOUT_BTN}
                  alt="logout-btn"
                  width={24}
                  height={24}
                />
              </Link>
            </>
          ) : (
            <Link href={"/"}>
              <Image 
                src={ICONS.LOGIN_BTN}
                alt="login-btn"
                width={24}
                height={24}
              />
            </Link>
          )}
        </div>
      </div>

      {/* 모바일 버전 */}
      <div className="md:hidden py-3">
        {/* 상단: 로고와 프로필/로그인 아이콘 */}
        <div className="flex items-center justify-between mb-3">
          <a href={ROUTES.HOME}>
            <Image
              src={IMAGES.LOGO}
              alt="culture-mate-logo"
              width={100}
              height={33}
            />
          </a>
          
          {/* 로그인 상태에 따라 다른 아이콘 표시 */}
          {isLoggedIn ? (
            <div className="relative">
              <button onClick={handleProfileClick} className="hover:cursor-pointer">
                <Image 
                  src={ICONS.DEFAULT_PROFILE}
                  alt="profile-image"
                  width={24}
                  height={24}
                />
              </button>
              
              {/* 모바일 드롭다운 메뉴 */}
              {isDropdownOpen && (
                <div className="absolute top-8 right-0 z-50">
                  <MiniProfile />
                </div>
              )}
            </div>
          ) : (
            <Link href={"/"}>
              <Image 
                src={ICONS.LOGIN_BTN}
                alt="login-btn"
                width={24}
                height={24}
              />
            </Link>
          )}
        </div>

        {/* 하단: 검색창 */}
        <div className="[&_form]:border-[#C6C8CA] [&_input]:placeholder-[#C6C8CA] [&_input]:outline-none [&_input]:focus:outline-none [&_form]:w-full">
          <SearchBar/>
        </div>
      </div>
    </nav>
  );
}