"use client";

import { useState } from "react";
import Image from "next/image";
import HelpSideBar from "@/components/help/HelpSideBar";
import HelpSearchBar from "@/components/help/HelpSearchBar";
import ContactList from "@/components/help/ContactList";

export default function ContactHistoryPage() {
  // 더미 1:1 문의 데이터 (실제로는 API에서 가져올 예정)
  const contactList = [
    {
      id: 1,
      title: "로그인 오류 관련 문의드립니다",
      date: "2025.08.13 15:30:00",
      content: "로그인을 시도할 때마다 '인증에 실패했습니다'라는 메시지가 나타납니다. 비밀번호를 여러 번 확인했는데도 같은 오류가 발생해서 문의드립니다.",
      status: "답변완료"
    },
    {
      id: 2,
      title: "이벤트 참여 후 혜택을 받지 못했습니다",
      date: "2025.08.12 14:20:00",
      content: "지난주에 진행된 문화행사 참여 이벤트에 참가했는데, 안내받은 혜택을 아직 받지 못했습니다. 언제쯤 지급될 예정인지 궁금합니다.",
      status: "답변대기"
    },
    {
      id: 3,
      title: "동행 찾기 서비스 이용 중 불편사항",
      date: "2025.08.11 16:45:00",
      content: "동행 찾기 기능을 사용하면서 매칭이 잘 되지 않는 문제가 있습니다. 설정을 어떻게 조정해야 더 좋은 결과를 얻을 수 있을까요?",
      status: "답변완료"
    },
    {
      id: 4,
      title: "프로필 사진 업로드 오류 해결 요청",
      date: "2025.08.10 11:15:00",
      content: "마이페이지에서 프로필 사진을 업로드하려고 하는데 '파일 업로드에 실패했습니다'라는 메시지가 계속 나타납니다. 해결 방법을 알려주세요.",
      status: "답변완료"
    },
    {
      id: 5,
      title: "커뮤니티 게시글 작성이 안 됩니다",
      date: "2025.08.09 13:25:00",
      content: "커뮤니티에 글을 작성하려고 하는데 작성 버튼을 눌러도 아무 반응이 없습니다. 브라우저를 바꿔봐도 같은 현상이 발생합니다.",
      status: "답변대기"
    },
    {
      id: 6,
      title: "앱 알림 설정 변경 문의",
      date: "2025.08.08 09:40:00",
      content: "푸시 알림을 끄고 싶은데 설정 메뉴를 찾을 수 없습니다. 알림 설정을 변경하는 방법을 안내해 주세요.",
      status: "답변완료"
    },
    {
      id: 7,
      title: "문화행사 예매 취소 관련 문의",
      date: "2025.08.07 17:10:00",
      content: "이번 주말 예정된 문화행사를 취소하고 싶습니다. 취소 수수료와 환불 절차에 대해 자세히 알려주세요.",
      status: "답변완료"
    },
    {
      id: 8,
      title: "개인정보 수정 요청",
      date: "2025.08.06 12:30:00",
      content: "회원가입 시 입력한 생년월일에 오타가 있어서 수정하고 싶습니다. 개인정보 수정은 어떻게 진행해야 하나요?",
      status: "답변대기"
    },
    {
      id: 9,
      title: "결제 내역 확인 요청",
      date: "2025.08.05 14:55:00",
      content: "지난달 결제한 내역을 확인하고 싶은데 마이페이지에서 찾을 수 없습니다. 결제 내역은 어디서 확인할 수 있나요?",
      status: "답변완료"
    },
    {
      id: 10,
      title: "위치 정보 제공 동의 철회 방법",
      date: "2025.08.04 10:20:00",
      content: "서비스 이용 시 제공한 위치 정보 동의를 철회하고 싶습니다. 어떤 절차를 거쳐야 하는지 안내해 주세요.",
      status: "답변완료"
    }
  ];

  return (
    <div className="w-full min-h-screen">
      {/* 1. 고객센터 큰 타이틀 - 반응형 정렬 */}
      <div className="w-full">
        <div className="w-full max-w-none lg:max-w-full mx-auto px-4 lg:px-4 md:px-6 sm:px-4">
          <h1 className="text-4xl font-bold py-[10px] h-16">
            고객센터
          </h1>
        </div>
      </div>
      
      {/* 2. 메인 컨텐츠 영역 */}
      <div className="w-full max-w-none lg:max-w-full mx-auto px-4 lg:px-4 md:px-6 sm:px-4 flex flex-col lg:flex-row gap-6 mt-8">
        {/* 왼쪽 사이드바 */}
        <div className="w-full lg:w-[200px] lg:shrink-0 mb-6 lg:mb-0">
          <div className="lg:-ml-4">
            <HelpSideBar />
          </div>
        </div>
        
        {/* 오른쪽 메인 컨텐츠 */}
        <div className="flex-1 w-full lg:max-w-[980px]">
          {/* 1:1 문의내역 소제목 */}
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
                1:1 문의내역
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
          
          {/* 1:1 문의내역 리스트 */}
          <div className="w-full">
            {contactList.map((contact) => (
              <ContactList
                key={contact.id}
                title={contact.title}
                date={contact.date}
                content={contact.content}
                status={contact.status}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}