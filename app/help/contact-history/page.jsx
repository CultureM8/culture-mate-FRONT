"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import HelpSideBar from "@/components/help/HelpSideBar";
import HelpSearchBar from "@/components/help/HelpSearchBar";
import ContactList from "@/components/help/ContactList";
import { api, unwrap } from "@/lib/apiBase"; // Axios 인스턴스와 unwrap 가져오기
import useLogin from "@/hooks/useLogin";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/path";

export default function ContactHistoryPage() {
  const [contactList, setContactList] = useState([]); // 상태 초기값 빈 배열
  const { user } = useLogin(); // user.role: "ADMIN" | "MEMBER"
  const router = useRouter();
  useEffect(() => {
    async function fetchInquiries() {
      try {
        // api.get만 사용하면 인터셉터가 알아서 토큰 붙여줌
        const data = await unwrap(api.get("/v1/inquiries/my"));
        setContactList(data);
      } catch (err) {
        console.error("문의 내역 불러오기 실패:", err);
        alert("문의 내역 불러오기에 실패했습니다.");
      }
    }

    fetchInquiries();
  }, []);

  return (
    <div className="w-full min-h-screen">
      {/* 1. 고객센터 큰 타이틀 - 반응형 정렬 */}
      <div className="w-full">
        <div className="w-full max-w-none lg:max-w-full mx-auto px-4 lg:px-4 md:px-6 sm:px-4">
          <h1 className="text-4xl font-bold py-[10px] h-16">고객센터</h1>
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
          <div
            className="
            relative
            w-full
            pb-6
          "
          >
            {/* 소제목 텍스트 */}
            <div
              className="
              flex
              flex-col
              justify-center
              px-5
              pt-2.5
              pb-2.5
            "
            >
              <h2
                className="
                font-bold
                text-[24px]
                text-[#26282a]
                leading-[1.55]
                whitespace-nowrap
              "
              >
                1:1 문의내역
              </h2>
            </div>

            {/* 하단 구분선 */}
            <div
              className="
              w-[980px] 
              h-px 
              bg-[#eef0f2]
            "
            ></div>
          </div>

          {/* 내부 검색 + 필터 + 문의하기 버튼 */}
          <HelpSearchBar
            showCreateButton={true}
            onCreateClick={() => router.push(ROUTES.CONTACT)}
            createButtonText="문의하기"
          />

          {/* 1:1 문의내역 리스트 */}
          <div className="w-full">
            {contactList.map((contact) => (
              <ContactList
                key={contact.inquiryId}
                title={contact.title}
                date={contact.createdAt}
                content={contact.content}
                status={contact.status}
                images={contact.imageUrls}
                answer={contact.answer}
                role={user.role}
                inquiryId={contact.inquiryId}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
