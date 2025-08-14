"use client";

import { useState } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";

export default function ContactList({ 
  title = "문의글 제목 작성 공간 (공백포함 40자 이후 말줄임...괄호까지 40자)...", 
  date = "2025.07.30 00:00:00",
  content = "문의 내용",
  status = "답변대기" // "답변대기", "답변완료"
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-[980px] relative">
      {/* 문의글 제목 영역 (클릭 가능) */}
      <button
        onClick={toggleExpanded}
        className="
          w-full 
          grid 
          grid-cols-[1fr_auto_auto] 
          items-center 
          h-10 
          px-5 
          pt-2.5 
          pb-1
          hover:bg-gray-50
          transition-colors
        "
      >
        {/* 제목 텍스트 */}
        <div className="
          flex 
          flex-col 
          justify-center 
          text-left
        ">
          <p className="
            text-[16px] 
            font-normal 
            text-[#26282a] 
            leading-[1.5]
            whitespace-nowrap
            overflow-hidden
            text-ellipsis
          ">
            {title}
          </p>
        </div>

        {/* 답변 상태 */}
        <div className="flex items-center justify-end mr-4">
          <span className={`
            px-3 
            py-1 
            text-[12px] 
            font-medium 
            rounded-full
            text-[#FFFFFF]
            ${status === "답변완료" 
              ? "bg-[#81C1FF]" 
              : "bg-[#FFC37F]"
            }
          `}>
            {status}
          </span>
        </div>

        {/* 화살표 아이콘 */}
        <div className="flex items-center justify-end">
          <Image
            src={ICONS.DOWN_GRAY}
            alt="toggle arrow"
            width={16}
            height={16}
            className={`
              transition-transform 
              ${isExpanded ? "rotate-180" : ""}
            `}
          />
        </div>
      </button>

      {/* 드롭다운 펼쳐지는 내용 */}
      {isExpanded && (
        <div className="
          w-full 
          px-5 
          py-4
          bg-gray-50
          border-t 
          border-gray-200
        ">
          <div className="mb-4">
            <h4 className="
              text-[14px] 
              font-medium 
              text-[#26282a] 
              mb-2
            ">
              문의 내용
            </h4>
            <p className="
              text-[14px] 
              font-normal 
              text-[#26282a] 
              leading-[1.43]
              whitespace-pre-wrap
            ">
              {content}
            </p>
          </div>
          
          {status === "답변완료" && (
            <div className="
              border-t 
              border-gray-200 
              pt-4
            ">
              <h4 className="
                text-[14px] 
                font-medium 
                text-[#26282a] 
                mb-2
              ">
                답변 내용
              </h4>
              <p className="
                text-[14px] 
                font-normal 
                text-[#26282a] 
                leading-[1.43]
                whitespace-pre-wrap
              ">
                문의해 주신 내용에 대한 답변입니다. 추가 궁금한 사항이 있으시면 언제든지 문의해 주세요.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 작성 시간 */}
      <div className="
        flex 
        items-center 
        h-10 
        px-5 
        pt-1 
        pb-2.5
      ">
        <p className="
          text-[14px] 
          font-normal 
          text-[#c6c8ca] 
          leading-[1.43]
          whitespace-nowrap
        ">
          {date}
        </p>
      </div>

      {/* 하단 구분선 */}
      <div className="
        w-[940px] 
        h-px 
        bg-[#eef0f2] 
        mx-auto
      "></div>
    </div>
  );
}