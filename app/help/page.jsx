"use client";

import { useState } from "react";
import Image from "next/image";
import HelpSideBar from "@/components/help/HelpSideBar";
import HelpSearchBar from "@/components/help/HelpSearchBar";
import FaqList from "@/components/help/FaqList";

export default function FaqPage() {
  // 더미 FAQ 데이터 (실제로는 API에서 가져올 예정)
  const faqList = [
    {
      id: 1,
      title: "FAQ제목 작성 공간 (공백포함 40자 이후 말줄임...괄호까지 40자)...",
      date: "2025.08.13 15:30:00",
      content: "자주 묻는 질문에 대한 답변입니다. 더 자세한 내용이 필요하시면 고객센터로 문의해주세요."
    },
    {
      id: 2,
      title: "계정 생성 및 로그인 문제 해결 방법",
      date: "2025.08.12 14:20:00",
      content: "계정 생성 시 이메일 인증이 필요하며, 로그인 문제는 대부분 비밀번호 재설정으로 해결됩니다."
    },
    {
      id: 3,
      title: "서비스 이용 요금 및 결제 관련 안내",
      date: "2025.08.11 16:45:00",
      content: "서비스 요금은 월 단위로 결제되며, 다양한 결제 수단을 지원합니다."
    },
    {
      id: 4,
      title: "개인정보 처리방침 및 데이터 보안 정책",
      date: "2025.08.10 11:15:00",
      content: "개인정보는 관련 법령에 따라 안전하게 보관되며, 제3자에게 제공되지 않습니다."
    },
    {
      id: 5,
      title: "모바일 앱 다운로드 및 설치 가이드",
      date: "2025.08.09 13:25:00",
      content: "모바일 앱은 구글 플레이스토어와 앱스토어에서 다운로드 가능합니다."
    },
    {
      id: 6,
      title: "서비스 중단 및 장애 발생 시 대응 방법",
      date: "2025.08.08 09:40:00",
      content: "서비스 장애 발생 시 공지사항을 통해 안내드리며, 빠른 복구를 위해 노력합니다."
    },
    {
      id: 7,
      title: "이벤트 참여 및 혜택 수령 방법 안내",
      date: "2025.08.07 17:10:00",
      content: "진행 중인 이벤트는 이벤트 페이지에서 확인하실 수 있으며, 참여 방법이 상세히 안내되어 있습니다."
    },
    {
      id: 8,
      title: "동행 찾기 서비스 이용 시 주의사항",
      date: "2025.08.06 12:30:00",
      content: "동행 찾기 이용 시 안전을 위해 공개된 장소에서 만나시기를 권장합니다."
    },
    {
      id: 9,
      title: "커뮤니티 게시판 이용 규칙 및 신고 방법",
      date: "2025.08.05 14:55:00",
      content: "커뮤니티 이용 시 타인을 존중하는 댓글을 작성해주시고, 부적절한 내용은 신고해주세요."
    },
    {
      id: 10,
      title: "프로필 정보 수정 및 계정 설정 변경",
      date: "2025.08.04 10:20:00",
      content: "마이페이지에서 프로필 정보와 계정 설정을 언제든지 변경할 수 있습니다."
    },
    {
      id: 11,
      title: "알림 설정 및 푸시 메시지 관리 방법",
      date: "2025.08.03 16:05:00",
      content: "설정 메뉴에서 원하는 알림만 선택적으로 받아보실 수 있습니다."
    },
    {
      id: 12,
      title: "문화 행사 예매 및 취소 정책 안내",
      date: "2025.08.02 11:40:00",
      content: "예매 취소는 행사 시작 24시간 전까지 가능하며, 취소 수수료가 발생할 수 있습니다."
    },
    {
      id: 13,
      title: "친구 추가 및 소셜 기능 이용 가이드",
      date: "2025.08.01 15:15:00",
      content: "친구 기능을 통해 관심사가 비슷한 사용자들과 소통할 수 있습니다."
    },
    {
      id: 14,
      title: "위치 정보 제공 동의 및 개인정보 보호",
      date: "2025.07.31 13:50:00",
      content: "위치 정보는 더 나은 서비스 제공을 위해서만 사용되며, 언제든지 동의를 철회할 수 있습니다."
    },
    {
      id: 15,
      title: "문의 사항 접수 및 답변 소요 시간",
      date: "2025.07.30 09:25:00",
      content: "고객문의는 평일 기준 24시간 이내에 답변드리며, 긴급한 사항은 전화로 문의해주세요."
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