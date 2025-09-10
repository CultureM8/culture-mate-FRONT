"use client";

import HelpSideBar from "@/components/help/HelpSideBar";
import HelpSearchBar from "@/components/help/HelpSearchBar";
import NoticeList from "@/components/help/NoticeList";

export default function NoticePage() {
  const noticeList = [
  {
    id: 1,
    title: "서비스 정식 오픈 안내",
    date: "2025.08.20 09:00:00",
    content: "많은 분들의 관심 속에 서비스를 정식으로 오픈하게 되었습니다. 앞으로 다양한 기능과 편리한 서비스를 제공할 예정입니다."
  },
  {
    id: 2,
    title: "회원가입 및 로그인 기능 정상화",
    date: "2025.08.18 15:30:00",
    content: "일부 사용자에게 발생했던 로그인 오류가 수정되었으며, 현재 정상적으로 이용 가능합니다."
  },
  {
    id: 3,
    title: "동행 모집 게시판 신규 카테고리 추가",
    date: "2025.08.16 11:00:00",
    content: "취미, 여행, 전시 관람 등 다양한 주제별 카테고리가 추가되어 모집글 작성 시 선택할 수 있습니다."
  },
  {
    id: 4,
    title: "프로필 설정 기능 업데이트",
    date: "2025.08.15 14:20:00",
    content: "프로필 사진 업로드와 자기소개 작성 기능이 추가되었습니다. 마이페이지에서 확인해보세요."
  },
  {
    id: 5,
    title: "1:1 문의 기능 오픈 안내",
    date: "2025.08.13 10:45:00",
    content: "궁금한 점이나 건의사항은 마이페이지 > 1:1 문의 메뉴에서 접수할 수 있습니다."
  },
  {
    id: 6,
    title: "공지사항 페이지 개편",
    date: "2025.08.12 09:00:00",
    content: "공지사항 UI가 개선되어 이전보다 보기 편리하게 변경되었습니다."
  },
  {
    id: 7,
    title: "커뮤니티 게시판 신고 기능 추가",
    date: "2025.08.10 13:10:00",
    content: "부적절한 게시글이나 댓글을 신고할 수 있는 기능이 추가되었습니다. 건전한 커뮤니티 문화를 위해 많은 참여 부탁드립니다."
  },
  {
    id: 8,
    title: "알림 기능 개선 안내",
    date: "2025.08.09 17:30:00",
    content: "브라우저 알림 및 웹앱 알림 기능이 개선되어 댓글 및 메시지 알림을 더욱 빠르게 받을 수 있습니다."
  },
  {
    id: 9,
    title: "동행 신청 취소 기능 업데이트",
    date: "2025.08.08 11:50:00",
    content: "동행 신청 후 일정이 맞지 않는 경우, 마이페이지에서 손쉽게 취소할 수 있는 기능이 추가되었습니다."
  },
  {
    id: 10,
    title: "서비스 이용 약관 개정 안내",
    date: "2025.08.06 09:20:00",
    content: "이용자 권리 보호 강화를 위해 서비스 이용 약관이 일부 개정되었습니다. 자세한 내용은 약관 페이지에서 확인 가능합니다."
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