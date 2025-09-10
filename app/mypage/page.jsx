"use client";

import ProfileBG from "@/components/mypage/ProfileBG";
import ProfileDetail from "@/components/mypage/ProfileDetail";
import RecruitTabView from "@/components/mypage/RecruitTabView";

export default function MyPage() {
  return (
    <div className="w-full min-h-screen">
      {/* 프로필 배경 및 기본 정보 */}
      <ProfileBG />
      
      {/* 프로필 상세 정보 */}
      <div className="w-full max-w-full mx-auto px-4 py-6">
        <ProfileDetail />
      </div>
      
      {/* 탭 메뉴 및 컨텐츠 (나의 모집글, 이벤트 리뷰, 동행 기록) */}
      <div className="w-full border-t border-gray-200">
        <RecruitTabView />
      </div>
    </div>
  );
}