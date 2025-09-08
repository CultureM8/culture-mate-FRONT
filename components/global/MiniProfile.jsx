"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES, ICONS } from "@/constants/path";
import useLogin from "@/hooks/useLogin";

export default function MiniProfile() {
  // LoginProvider 컨텍스트에서 바로 가져오기
  const { logout, loading, displayName, user } = useLogin();
  const router = useRouter();

  // 프로필 배경(로컬 설정)에서 저장한 아바타만 로컬스토리지에서 읽어옴
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("userProfile");
      if (saved) {
        const p = JSON.parse(saved);
        setProfileImage(p?.profileImage || null);
      }
    } catch {}
  }, []);

  // 표시 이름: LoginProvider가 이미 "닉네임 > 로그인아이디 > id > 사용자" 규칙 적용
  const nameToShow = displayName;

  // 로그아웃: 컨텍스트 로그아웃 → (있으면) fakeLogin 정리 → 홈으로
  const onLogout = async () => {
    try {
      await logout();
      try {
        const mod = await import("@/lib/fakeLogin");
        if (mod?.fakeLogout) mod.fakeLogout();
      } catch {}
    } finally {
      router.replace(ROUTES.HOME || "/");
    }
  };

  const menuItems = [
    { label: "프로필", path: ROUTES.MYPAGE },
    { label: "내 동행관리", path: ROUTES.TOGETHER_MANAGE },
    { label: "관심목록", path: ROUTES.INTEREST },
    { label: "히스토리", path: ROUTES.HISTORY },
    { label: "게시물 관리", path: ROUTES.POST_MANAGE },
    { label: "환경설정", path: ROUTES.SETTINGS },
  ];

  return (
    <div
      className="
        bg-white border border-gray-100 rounded shadow-lg
        p-4 flex flex-col gap-4 items-end justify-start
        w-[200px]
      ">
      {/* 사용자 정보 */}
      <div className="flex flex-row gap-2 items-center justify-end w-full">
        <span className="text-[#26282a] text-base font-normal">
          {nameToShow || "사용자"}
        </span>
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#C6C8CA]">
          <Image
            src={profileImage || ICONS.DEFAULT_PROFILE}
            alt="profile-image"
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 메뉴 */}
      {menuItems.map((item, idx) => (
        <Link
          key={idx}
          href={item.path}
          className="
            px-1 py-0 flex items-center justify-end h-6 w-full
            text-[#a6a6a6] text-base font-normal
            hover:text-[#26282a] transition-colors
          ">
          {item.label}
        </Link>
      ))}

      {/* 로그아웃 */}
      <div className="flex flex-row gap-4 items-center justify-end w-full">
        <button
          onClick={onLogout}
          disabled={loading}
          className="
            px-1 py-0 flex items-center justify-start h-6
            text-[#a6a6a6] text-base font-normal
            hover:text-[#26282a] transition-colors
            disabled:opacity-60
          ">
          {loading ? "로그아웃 중…" : "로그아웃"}
        </button>
        {/* 아이콘도 버튼으로 감싸 접근성/비활성 처리 */}
        <button
          onClick={onLogout}
          disabled={loading}
          aria-label="로그아웃"
          className="disabled:opacity-60">
          <Image
            src={ICONS.LOGOUT_BTN}
            alt="logout-icon"
            width={24}
            height={24}
          />
        </button>
      </div>
    </div>
  );
}
