"use client";

import { useState } from "react";
import Image from "next/image";
import HelpSideBar from "@/components/help/HelpSideBar";
import HelpSearchBar from "@/components/help/HelpSearchBar";
import FaqList from "@/components/help/FaqList";

export default function FaqPage() {
  const faqList = [
  {
    id: 1,
    title: "회원가입 시 필요한 정보와 절차 안내",
    date: "2025.08.20 10:15:00",
    content: "회원가입 시 이메일, 비밀번호, 닉네임이 필요하며, 가입 즉시 계정이 활성화됩니다. 인증 메일은 별도로 발송되지 않습니다."
  },
  {
    id: 2,
    title: "비밀번호 분실 시 재설정 방법",
    date: "2025.08.19 14:45:00",
    content: "로그인 화면에서 '비밀번호 찾기'를 통해 재설정 메일을 받을 수 있으며, 보안 강화를 위해 정기적인 변경을 권장합니다."
  },
  {
    id: 3,
    title: "동행 모집 게시글 작성 가이드",
    date: "2025.08.18 09:30:00",
    content: "동행 모집 시 모임 목적, 날짜, 장소를 구체적으로 작성하면 참여자가 쉽게 이해할 수 있습니다. 연락처나 개인 정보는 공개하지 않는 것을 권장합니다."
  },
  {
    id: 4,
    title: "동행 모집 글 삭제 및 수정 방법",
    date: "2025.08.17 11:05:00",
    content: "작성한 모집 글은 마이페이지 > 내가 쓴 글 메뉴에서 수정 또는 삭제할 수 있습니다. 삭제 시 복구가 불가능하니 신중히 선택해주세요."
  },
  {
    id: 5,
    title: "닉네임 변경 가능 여부와 규칙",
    date: "2025.08.16 13:50:00",
    content: "닉네임은 회원가입 후 최초 1회 변경할 수 있으며, 부적절하거나 타인에게 불쾌감을 줄 수 있는 닉네임은 사용이 제한됩니다."
  },
  {
    id: 6,
    title: "데스크탑 및 웹앱 이용 환경 안내",
    date: "2025.08.15 17:20:00",
    content: "해당 서비스는 데스크탑 웹과 웹앱 환경에서 최적화되어 있으며, 모바일 전용 앱은 제공되지 않습니다."
  },
  {
    id: 7,
    title: "웹 알림 기능 이용 방법",
    date: "2025.08.14 16:10:00",
    content: "브라우저 알림을 허용하면 댓글, 메시지, 공지사항 업데이트를 실시간으로 받아볼 수 있습니다. 알림 설정은 브라우저 환경설정에서 변경 가능합니다."
  },
  {
    id: 8,
    title: "개인정보 보호와 보안 관리 안내",
    date: "2025.08.13 15:00:00",
    content: "개인정보는 암호화하여 안전하게 저장되며, 불법적인 접근을 방지하기 위해 보안 시스템을 지속적으로 강화하고 있습니다. 2단계 인증은 제공하지 않습니다."
  },
  {
    id: 9,
    title: "커뮤니티 게시판 작성 시 유의사항",
    date: "2025.08.12 12:40:00",
    content: "비방, 욕설, 불법 광고성 게시물은 제재 대상이며, 신고 시 운영팀이 즉시 검토합니다."
  },
  {
    id: 10,
    title: "1:1 문의하기 이용 방법",
    date: "2025.08.11 10:25:00",
    content: "궁금한 점이나 건의사항은 마이페이지의 '1:1 문의하기' 메뉴를 통해 접수할 수 있으며, 접수된 문의는 FAQ에서 확인 가능한 공통 질문으로 반영되기도 합니다."
  },
  {
    id: 11,
    title: "프로필 사진 변경 및 공개 범위 설정",
    date: "2025.08.10 09:15:00",
    content: "마이페이지에서 사진을 업로드할 수 있으며, 공개 여부를 설정해 원하는 사용자에게만 노출할 수 있습니다."
  },
  {
    id: 12,
    title: "친구 추가 및 차단 기능 안내",
    date: "2025.08.09 18:05:00",
    content: "친구 요청은 상대방이 승인해야 추가되며, 원치 않는 사용자는 차단하여 메시지를 제한할 수 있습니다."
  },
  {
    id: 13,
    title: "동행 참여 신청 및 취소 방법",
    date: "2025.08.08 14:30:00",
    content: "동행 모집 글에서 '참여 신청' 버튼을 눌러 신청할 수 있으며, 신청 내역은 마이페이지에서 확인 및 취소할 수 있습니다."
  },
  {
    id: 14,
    title: "게시판 글 신고 및 처리 절차",
    date: "2025.08.07 11:20:00",
    content: "부적절한 글이나 댓글은 '신고하기' 기능을 통해 접수할 수 있으며, 운영팀 검토 후 필요 시 해당 글이 삭제되거나 작성자가 제재됩니다."
  },
  {
    id: 15,
    title: "문의 처리 방식 안내",
    date: "2025.08.06 09:00:00",
    content: "별도의 고객센터 운영은 없으며, FAQ와 1:1 문의를 통해 접수된 내용을 운영팀이 순차적으로 검토하여 답변드립니다."
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
          {/* FAQ 소제목 */}
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
                FAQ
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
          
          {/* FAQ 리스트 */}
          <div className="w-full">
            {faqList.map((faq) => (
              <FaqList
                key={faq.id}
                title={faq.title}
                date={faq.date}
                content={faq.content}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
