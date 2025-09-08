"use client";

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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

import useLogin from "@/hooks/useLogin";
import { ROUTES, IMAGES, ICONS } from "@/constants/path";
import SearchBar from "./SearchBar";
import MiniProfile from "./MiniProfile";

export default function NavigationBar() {
  const { ready, isLogined, user, logout, loading } = useLogin();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // Hydration 안전성을 위한 마운트 상태

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Hydration 안전성을 위한 마운트 확인
  useEffect(() => {
    setMounted(true);
  }, []);

  /** 현재 페이지의 전체 경로(path + query) 생성(로그인 후 기존 페이지로 이동) */
  const fullPath = useMemo(() => {
    const q = searchParams?.toString();
    return q ? `${pathname}?${q}` : pathname;
  }, [pathname, searchParams]);

  /** 관리자 체크: 컨텍스트 role 우선, 없으면 localStorage 폴백 */
  useEffect(() => {
    if (!mounted) return; // 마운트 후에만 실행

    const roleFromContext = user?.role; // 예: "ADMIN" | "MEMBER" | null
    const roleFromStorage =
      typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
    const role = (roleFromContext ?? roleFromStorage ?? "")
      .toString()
      .toUpperCase();
    const adminByRole = role === "ADMIN";
    const adminByPath = pathname === ROUTES.ADMIN; // /admin 직접 접근 시도
    setIsAdmin(Boolean(adminByRole || adminByPath));
  }, [pathname, user, mounted]);

  /* 프로필 아이콘 클릭 핸들러 */
  const handleProfileClick = () => setIsDropdownOpen((v) => !v);

  /* 로그아웃 */
  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
  };

  const flexStyle =
    "flex items-center justify-between md:gap-[clamp(8px,3vw,48px)] sm:gap-3";

  /** 로그인 상태에 따른 메뉴 구성 */
  const getNavMenu = () => {
    const baseMenu = [
      ["서비스 소개", ROUTES.ABOUT],
      ["이용 가이드", ROUTES.GUIDE],
      ["이벤트", ROUTES.EVENTS],
      ["동행찾기", ROUTES.TOGETHER],
      ["커뮤니티", ROUTES.COMMUNITY],
      ["고객센터", ROUTES.HELP],
    ];
    return isAdmin ? [...baseMenu, ["관리자", ROUTES.ADMIN]] : baseMenu;
  };
  const navMenu = getNavMenu();

  /** 현재 경로가 메뉴 링크와 일치하는지 확인 */
  const isActiveMenu = (href) => {
    // 정확히 일치하는 경우
    if (pathname === href) return true;

    // 하위 경로인 경우 (예: /community/posts는 /community 메뉴에서 활성화)
    if (href !== "/" && pathname.startsWith(href + "/")) return true;

    return false;
  };

  /* Hydration 안전한 사용자 메뉴 렌더링 */
  const renderUserMenu = () => {
    // 마운트 전에는 항상 로그아웃 상태로 렌더링 (서버와 동일)
    if (!mounted || !ready) {
      return (
        <Link
          href={{ pathname: ROUTES.LOGIN, query: { next: fullPath } }}
          aria-label="로그인 페이지로 이동">
          <Image src={ICONS.LOGIN_BTN} alt="login-btn" width={24} height={24} />
        </Link>
      );
    }

    // 마운트 후 실제 로그인 상태에 따라 렌더링
    if (isLogined) {
      return (
        <>
          {/* 프로필 아이콘 & 드롭다운 */}
          <div className="relative">
            <button
              onClick={handleProfileClick}
              className="hover:cursor-pointer"
              aria-label="프로필 메뉴 열기">
              <Image
                src={ICONS.DEFAULT_PROFILE}
                alt="profile-image"
                width={24}
                height={24}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-8 right-0 z-50">
                <MiniProfile />
              </div>
            )}
          </div>

          {/* 로그아웃 아이콘 → /logout 페이지로 이동 */}
          <a href="/logout" aria-label="로그아웃">
            <Image
              src={ICONS.LOGOUT_BTN}
              alt="logout-btn"
              width={24}
              height={24}
            />
          </a>
        </>
      );
    } else {
      return (
        <Link
          href={{ pathname: ROUTES.LOGIN, query: { next: fullPath } }}
          aria-label="로그인 페이지로 이동">
          <Image src={ICONS.LOGIN_BTN} alt="login-btn" width={24} height={24} />
        </Link>
      );
    }
  };

  return (
    <nav className="border-b border-b-[#EEF0F2] bg-white w-full px-[clamp(0px,6vw,120px)]">
      {/* 데스크톱 */}
      <div className="hidden md:flex items-center justify-between h-25">
        {/* 좌측: 로고 + 검색 */}
        <div className={`${flexStyle} shrink-0`}>
          {/* 로고: 전체 페이지 새로고침 → a 태그 유지 */}
          <a href={ROUTES.HOME} aria-label="홈으로 이동">
            <Image
              src={IMAGES.LOGO}
              alt="culture-mate-logo"
              width={120}
              height={40}
            />
          </a>

          {/* SearchBar 래퍼(스타일 오버라이드) */}
          <div className="[&_form]:border-[#C6C8CA] [&_input]:placeholder-[#C6C8CA] [&_input]:outline-none [&_input]:focus:outline-none">
            <SearchBar />
          </div>
        </div>

        {/* 우측: 메뉴 + 로그인/마이페이지 */}
        <div className={`${flexStyle} shrink-0`}>
          {/* 상단 메뉴 */}
          {navMenu.map(([label, href], i) => (
            <Link
              key={i}
              href={href}
              className={`text-xl transition-all duration-200 hover:font-semibold ${
                isActiveMenu(href)
                  ? "font-bold text-black"
                  : "font-normal text-gray-700 hover:text-black"
              }`}>
              {label}
            </Link>
          ))}

          {/* Hydration 안전한 사용자 메뉴 */}
          {renderUserMenu()}
        </div>
      </div>

      {/* 모바일 */}
      <div className="md:hidden py-3">
        {/* 상단: 로고 + 로그인/프로필 */}
        <div className="flex items-center justify-between mb-3">
          <a href={ROUTES.HOME} aria-label="홈으로 이동">
            <Image
              src={IMAGES.LOGO}
              alt="culture-mate-logo"
              width={100}
              height={33}
            />
          </a>

          {/* 모바일에서도 동일한 Hydration 안전 렌더링 */}
          {!mounted || !ready ? (
            <Link
              href={{ pathname: ROUTES.LOGIN, query: { next: fullPath } }}
              aria-label="로그인 페이지로 이동">
              <Image
                src={ICONS.LOGIN_BTN}
                alt="login-btn"
                width={24}
                height={24}
              />
            </Link>
          ) : isLogined ? (
            <div className="relative">
              <button
                onClick={handleProfileClick}
                className="hover:cursor-pointer"
                aria-label="프로필 메뉴 열기">
                <Image
                  src={ICONS.DEFAULT_PROFILE}
                  alt="profile-image"
                  width={24}
                  height={24}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-8 right-0 z-50">
                  <MiniProfile />
                </div>
              )}
            </div>
          ) : (
            <Link
              href={{ pathname: ROUTES.LOGIN, query: { next: fullPath } }}
              aria-label="로그인 페이지로 이동">
              <Image
                src={ICONS.LOGIN_BTN}
                alt="login-btn"
                width={24}
                height={24}
              />
            </Link>
          )}
        </div>

        {/* 하단: 검색 */}
        <div className="[&_form]:border-[#C6C8CA] [&_input]:placeholder-[#C6C8CA] [&_input]:outline-none [&_input]:focus:outline-none [&_form]:w-full">
          <SearchBar />
        </div>
      </div>
    </nav>
  );
}
