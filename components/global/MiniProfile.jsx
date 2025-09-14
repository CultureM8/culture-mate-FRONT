"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES, ICONS } from "@/constants/path";
import useLogin from "@/hooks/useLogin";
import { api, unwrap } from "@/lib/apiBase";

export default function MiniProfile({ onClose }) {
  const { logout, loading, displayName, user } = useLogin();
  const router = useRouter();

  const [profileImage, setProfileImage] = useState(null);
  const [nameFromBackend, setNameFromBackend] = useState(null);

  const normalizeImg = (p) => {
    if (!p) return null;
    if (p.startsWith("http")) return p;
    return `http://localhost:8080${p}`;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.id) return;
      try {
        const detail = await unwrap(api.get(`/v1/member-detail/${user.id}`));
        if (!mounted) return;

        const avatar = normalizeImg(
          detail?.thumbnailImagePath || detail?.profileImageUrl
        );
        if (avatar) setProfileImage(avatar);

        const nick =
          detail?.nickname || detail?.displayName || detail?.loginId || null;
        if (nick) setNameFromBackend(nick);
      } catch {
        // 실패 시 조용히 무시
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const nameToShow = nameFromBackend || displayName || "사용자";

  // NavigationBar의 handleLogout과 동일한 방식으로 변경
  const onLogout = async () => {
    await logout();
    if (onClose) onClose();
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
    <div className="bg-white border border-gray-100 rounded shadow-lg p-4 flex flex-col gap-4 items-end justify-start w-[200px]">
      <div className="flex flex-row gap-2 items-center justify-end w-full">
        <span className="text-[#26282a] text-base font-normal">
          {nameToShow}
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

      {menuItems.map((item, idx) => (
        <div
          key={idx}
          onMouseDown={(e) => {
            e.preventDefault(); // 기본 동작 방지
            e.stopPropagation(); // 이벤트 전파 방지
            
            setTimeout(() => {
              router.push(item.path);
              if (onClose) onClose();
            }, 0);
          }}
          className="px-1 py-0 flex items-center justify-end h-6 w-full text-[#a6a6a6] text-base font-normal hover:text-[#26282a] transition-colors cursor-pointer">
          {item.label}
        </div>
      ))}

      <div className="flex flex-row gap-4 items-center justify-end w-full">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setTimeout(() => {
              window.location.href = "/logout";
              if (onClose) onClose();
            }, 0);
          }}
          disabled={loading}
          className="px-1 py-0 flex items-center justify-start h-6 text-[#a6a6a6] text-base font-normal hover:text-[#26282a] transition-colors disabled:opacity-60">
          {loading ? "로그아웃 중…" : "로그아웃"}
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setTimeout(() => {
              window.location.href = "/logout";
              if (onClose) onClose();
            }, 0);
          }}
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
