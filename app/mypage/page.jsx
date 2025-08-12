"use client"

import ProfileBG from "@/components/mypage/ProfileBG";
import ProfileDetail from "@/components/mypage/ProfileDetail";
import RecruitTabView from "@/components/mypage/RecruitTabView";

export default function MyPage() {
  return (
    <div className="w-full min-h-screen">
      {/* 1. 프로필 배경 및 기본 정보 섹션 */}
      <ProfileBG />
      
      {/* 2. 프로필 상세 정보 섹션 */}
      <div className="w-full max-w-[1200px] mx-auto px-4 py-6">
        <ProfileDetail />
      </div>
      
      {/* 3. 모집글/리뷰/기록 탭 섹션 */}
      <div className="w-full border-t border-gray-200 py-6">
        <RecruitTabView />
      </div>
      
      {/* 4. 카드형/리스트형 이미지 섹션 */}
      <div className="w-full max-w-[1200px] mx-auto px-4 py-6">
        {/* TODO: 카드형 이미지/리스트형 이미지 컴포넌트가 들어갈 공간 */}
      </div>
    </div>
  );
}