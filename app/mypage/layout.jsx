import MypageSideBar from "@/components/mypage/MypageSidebar";

export default function MypageLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1">
        {/* 사이드바 + 컨텐츠 영역 */}
        <div className="flex justify-center">
          <div className="flex">
            {/* 사이드바 */}
            <div className="w-64 mt-32">
              <MypageSideBar />
            </div>
            
            {/* 페이지 컨텐츠 */}
            <div className="w-[1200px]">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
