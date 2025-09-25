"use client";

import { useEffect, useState, useRef } from "react"; 
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
  const [mounted, setMounted] = useState(false);
  const [searchValue, setSearchValue] = useState(""); // 검색바 상태 관리

  const dropdownRef = useRef(null);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Hydration 안전성을 위한 마운트 확인
  useEffect(() => {
    setMounted(true);
  }, []);

  // 외부 클릭 감지하여 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  /** 현재 페이지의 전체 경로(path + query) 생성(로그인 후 기존 페이지로 이동) */
  const fullPath = useMemo(() => {
    const q = searchParams?.toString();
    return q ? `${pathname}?${q}` : pathname;
  }, [pathname, searchParams]);

  /** 로그인 상태일 때만 관리자 권한 확인 */
  useEffect(() => {
    if (!mounted) return;

    // 로그인되지 않은 상태라면 무조건 관리자 아님
    if (!ready || !isLogined) {
      setIsAdmin(false);
      return;
    }

    // 로그인 된 상태에서만 관리자 권한 확인
    const roleFromContext = user?.role;
    const roleFromStorage = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
    const role = (roleFromContext ?? roleFromStorage ?? "").toString().toUpperCase();
    const adminByRole = role === "ADMIN";
    const adminByPath = pathname === ROUTES.ADMIN; // /admin 직접 접근 시도

    setIsAdmin(Boolean(adminByRole || adminByPath));
  }, [pathname, user?.role, mounted, ready, isLogined]); // user?.role로 변경하여 안정성 확보

  /* 프로필 아이콘 클릭 핸들러 */
  const handleProfileClick = () => setIsDropdownOpen((v) => !v);

  /* 로그아웃 */
  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
  };

  /* 검색 핸들러 - 검색 후 입력값 초기화 */
  const handleSearch = (searchTerm) => {
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    setSearchValue(""); // 검색 후 초기화
  };

  const flexStyle =
    "flex items-center justify-between md:gap-[clamp(8px,3vw,48px)] sm:gap-3";

  /** 로그인 상태에 따른 메뉴 구성 - 수정된 로직 */
  const getNavMenu = () => {
    const baseMenu = [
      ["서비스 소개", ROUTES.ABOUT],
      ["이용 가이드", ROUTES.GUIDE],
      ["이벤트", ROUTES.EVENTS],
      ["동행찾기", ROUTES.TOGETHER],
      ["커뮤니티", ROUTES.COMMUNITY],
      ["고객센터", ROUTES.HELP],
    ];
    
    // 로그인 상태이면서 관리자일 때만 관리자 메뉴 추가
    return (isLogined && isAdmin) ? [...baseMenu, ["관리자", ROUTES.ADMIN]] : baseMenu;
  };
  const navMenu = getNavMenu();

  /** 현재 경로가 메뉴 링크와 일치하는지 확인 */
  const isActiveMenu = (href) => {
    if (pathname === href) return true;
    if (href !== "/" && pathname.startsWith(href + "/")) return true;
    return false;
  };

  /* Hydration 안전한 사용자 메뉴 렌더링 */
  const renderUserMenu = () => {
    if (!mounted || !ready) {
      return (
        <Link
          href={{ pathname: ROUTES.LOGIN, query: { next: fullPath } }}
          aria-label="로그인 페이지로 이동">
          <Image src={ICONS.LOGIN_BTN} alt="login-btn" width={24} height={24} />
        </Link>
      );
    }

    if (isLogined) {
      return (
        <>
          <div className="relative" ref={dropdownRef}>
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
                <MiniProfile onClose={() => setIsDropdownOpen(false)} />
              </div>
            )}
          </div>

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
        <div className={`${flexStyle} shrink-0`}>
          <a href={ROUTES.HOME} aria-label="홈으로 이동">
            <Image
              src={IMAGES.LOGO}
              alt="culture-mate-logo"
              width={120}
              height={40}
            />
          </a>

          <div className="[&_form]:border-[#C6C8CA] [&_input]:placeholder-[#C6C8CA] [&_input]:outline-none [&_input]:focus:outline-none">
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              onSearch={handleSearch}
            />
          </div>
        </div>

        <div className={`${flexStyle} shrink-0`}>
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

          {renderUserMenu()}
        </div>
      </div>

      {/* 모바일 */}
      <div className="md:hidden py-3">
        <div className="flex items-center justify-between mb-3">
          <a href={ROUTES.HOME} aria-label="홈으로 이동">
            <Image
              src={IMAGES.LOGO}
              alt="culture-mate-logo"
              width={100}
              height={33}
            />
          </a>

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
            <div className="relative" ref={dropdownRef}>
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
                  <MiniProfile onClose={() => setIsDropdownOpen(false)} />
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

        <div className="[&_form]:border-[#C6C8CA] [&_input]:placeholder-[#C6C8CA] [&_input]:outline-none [&_input]:focus:outline-none [&_form]:w-full">
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearch}
          />
        </div>
      </div>
    </nav>
  );
}
