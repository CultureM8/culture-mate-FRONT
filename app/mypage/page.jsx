"use client";

import Link from "next/link";
import ProfileRead from "@/components/mypage/ProfileRead";
import ProfileDetail from "@/components/mypage/ProfileDetail";
import RecruitTabView from "@/components/mypage/RecruitTabView";
import useLogin from "@/hooks/useLogin";

export default function MyPage() {
  const { user } = useLogin();
  return (
    <div className="w-full min-h-screen">
      {/* 프로필 배경 및 기본 정보 */}
      <ProfileRead />


      {/* 프로필 상세 정보 (읽기 전용) */}
      <div className="w-full max-w-full mx-auto px-4 py-6">
        <ProfileDetail editMode={false} />
      </div>

      {/* 탭 메뉴 및 컨텐츠 */}
      <div className="w-full border-t border-gray-200">
        <RecruitTabView />
      </div>
    </div>
  );
}