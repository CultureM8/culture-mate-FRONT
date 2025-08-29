"use client";

import AdminMainTitle from "@/components/admin/AdminMainTitle";
import AdminSubTitle from "@/components/admin/AdminSubTitle";
import AdminSideBar from "@/components/admin/AdminSideBar";
import AdminEventsAll from "@/components/admin/AdminEventsAll";

export default function AdminEventsAllPage() {
  return (
    <div className="w-full min-h-screen">
      {/* 1. 관리자 페이지 큰 타이틀 - 반응형 정렬 */}
      <AdminMainTitle />
      
      {/* 2. 메인 컨텐츠 영역 */}
      <div className="w-full max-w-none lg:max-w-[1200px] mx-auto px-4 lg:px-4 md:px-6 sm:px-4 flex flex-col lg:flex-row gap-6 mt-8">
        {/* 왼쪽 사이드바 */}
        <div className="w-full lg:w-[200px] lg:shrink-0 mb-6 lg:mb-0">
          <div className="lg:-ml-4">
            <AdminSideBar />
          </div>
        </div>
        
        {/* 오른쪽 메인 컨텐츠 */}
        <div className="flex-1 w-full lg:max-w-[980px]">
          {/* 관리자 소제목 */}
          <AdminSubTitle title="전체 이벤트" />

          {/* 관리자 컨텐츠 - AdminEventsAll 컴포넌트 */}
          <AdminEventsAll />
        </div>
      </div>
    </div>
  );
}