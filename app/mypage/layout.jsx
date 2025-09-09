"use client";

import RequireLogin from "@/components/auth/RequireLogin";
import MypageSidebar from "@/components/mypage/MypageSidebar";

export default function MyPageLayout({ children }) {
  return (
    <RequireLogin>
      {/* 뷰포트 기준 높이 확보 (모바일 주소창 이슈 대응) */}
      <div className="min-h-svh bg-white">
        {/* 전체 래퍼 폭 제한 (원래 페이지들이 기대하던 중앙 정렬 복원) */}
        <div className="mx-auto max-w-screen-2xl">
          {/* 사이드바(240px) + 본문(자동) 그리드 */}
          <div className="grid grid-cols-[240px_minmax(0,1fr)]">
            {/* 사이드바: 데스크탑에서 고정, 자체 스크롤 */}
            <aside className="hidden md:block border-r border-gray-200 sticky top-0 h-svh overflow-auto">
              <MypageSidebar />
            </aside>

            {/* 본문: 줄바꿈 허용(min-w-0), 내부에 다시 컨테이너 폭/패딩 부여 */}
            <main className="min-w-0">
              {/* 기존 페이지들이 가정하던 컨텐츠 폭/여백을 여기서 일괄 복원 */}
              <div className="mx-auto max-w-[1200px] px-4 py-6">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </RequireLogin>
  );
}
