import AdminSideBar from "@/components/admin/AdminSideBar";
import PageTitle from "@/components/global/PageTitle";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1">
        {/* 사이드바 + 컨텐츠 영역 */}
        <div className="flex justify-center">
          <div className="flex">
            {/* 사이드바 */}
            <div className="w-64 mt-32">
              <AdminSideBar />
            </div>
            
            {/* 페이지 컨텐츠 */}
            <div className="w-[1200px]">
              <PageTitle>관리자 메뉴</PageTitle>
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}