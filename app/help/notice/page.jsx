"use client";

import HelpSideBar from "@/components/help/HelpSideBar";
import HelpSearchBar from "@/components/help/HelpSearchBar";
import NoticeList from "@/components/help/NoticeList";

export default function NoticePage() {
  // 더미 공지사항 데이터 (실제로는 API에서 가져올 예정)
  const noticeList = [
    {
      id: 1,
      title: "공지 내용 작성 공간 (공백포함 40자 이후 말줄임...괄호까지 40자)...",
      date: "2025.07.30 00:00:00",
      content: "공지내용"
    },
    {
      id: 2,
      title: "시스템 점검 안내",
      date: "2025.07.29 14:30:00",
      content: "시스템 점검으로 인해 일시적으로 서비스 이용이 제한됩니다."
    },
    {
      id: 3,
      title: "새로운 기능 업데이트 안내",
      date: "2025.07.28 10:00:00", 
      content: "새로운 기능이 추가되었습니다. 자세한 내용을 확인해보세요."
    }
  ];

  return (
    <div className="w-full min-h-screen">
      {/* 1. 고객센터 큰 타이틀 - 반응형 정렬 */}
      <div className="w-full">
        <div className="w-full max-w-none lg:max-w-[1200px] mx-auto px-4 lg:px-4 md:px-6 sm:px-4">
          <h1 className="text-4xl font-bold py-[10px] h-16">
            고객센터
          </h1>
        </div>
      </div>
      
      {/* 2. 메인 컨텐츠 영역 */}
      <div className="w-full max-w-none lg:max-w-[1200px] mx-auto px-4 lg:px-4 md:px-6 sm:px-4 flex flex-col lg:flex-row gap-6 mt-8">
        {/* 왼쪽 사이드바 */}
        <div className="w-full lg:w-[200px] lg:shrink-0 mb-6 lg:mb-0">
          <div className="lg:-ml-4">
            <HelpSideBar />
          </div>
        </div>
        
        {/* 오른쪽 메인 컨텐츠 */}
        <div className="flex-1 w-full lg:max-w-[980px]">
          {/* 공지사항 소제목 */}
          <div className="
            relative 
            w-full 
            pb-6
          ">
            {/* 소제목 텍스트 */}
            <div className="
              flex 
              flex-col 
              justify-center 
              px-5
              pt-2.5
              pb-2.5
            ">
              <h2 className="
                font-bold 
                text-[24px] 
                text-[#26282a] 
                leading-[1.55]
                whitespace-nowrap
              ">
                공지사항
              </h2>
            </div>

            {/* 하단 구분선 */}
            <div className="
              w-[980px] 
              h-px 
              bg-[#eef0f2]
            "></div>
          </div>

          {/* 내부 검색 + 필터 */}
          <HelpSearchBar />
          
          {/* 공지사항 리스트 */}
          <div className="w-full">
            {noticeList.map((notice) => (
              <NoticeList 
                key={notice.id}
                title={notice.title}
                date={notice.date}
                content={notice.content}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}