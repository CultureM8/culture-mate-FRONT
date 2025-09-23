"use client";

import { useState } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";
import { api } from "@/lib/apiBase";

// 상태 라벨 매핑
const statusLabels = {
  'PENDING': '답변대기',
  'ANSWERED': '답변완료'
};

const getStatusLabel = (status) => statusLabels[status] || status;

export default function ContactList({
  title = "...",
  date = "...",
  content = "...",
  status = "...", // PENDING, ANSWERED
  images = [],
  answer = null,
  role = "MEMBER",
  inquiryId, // 답변 저장 시 필요
  onUpdate,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false); // 답변 작성 상태
  const [currentAnswer, setCurrentAnswer] = useState(answer);

  const saveAnswer = async () => {
    try {
      if (!replyContent.trim()) return alert("답변 내용을 입력해주세요.");

      // POST 요청 결과를 res에 저장
      const res = await api.post(`/v1/admin/inquiries/${inquiryId}/answer`, {
        content: replyContent,
      });

      setIsReplying(false);
      setReplyContent("");

      // 실제로 받아온 답변 데이터로 상태 갱신
      setCurrentAnswer(res.data);

      if (onUpdate) onUpdate(); // 리스트 갱신
      alert("답변이 저장되었습니다.");
    } catch (err) {
      console.error("답변 저장 실패:", err);
      alert("답변 저장에 실패했습니다.");
    }
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
        <div
          className="
          flex 
          flex-col 
          justify-center 
          text-left
        "
        >
          <p
            className="
            text-[16px] 
            font-normal 
            text-[#26282a] 
            leading-[1.5]
            whitespace-nowrap
            overflow-hidden
            text-ellipsis
          "
          >
            {title}
          </p>
        </div>

        {/* 답변 상태 */}
        <div className="flex items-center justify-end mr-4">
          <span
            className={`
            px-3
            py-1
            text-[12px]
            font-medium
            rounded-full
            text-[#FFFFFF]
            ${status === "ANSWERED" ? "bg-[#81C1FF]" : "bg-[#FFC37F]"}
          `}
          >
            {getStatusLabel(status)}
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
        <div
          className="
          w-full 
          px-5 
          py-4
          bg-gray-50
          border-t 
          border-gray-200
        "
        >
          <div className="mb-4">
            <h4
              className="
              text-[14px] 
              font-medium 
              text-[#26282a] 
              mb-2
            "
            >
              문의 내용
            </h4>
            <p
              className="
              text-[14px] 
              font-normal 
              text-[#26282a] 
              leading-[1.43]
              whitespace-pre-wrap
            "
            >
              {content}
            </p>
            {images?.length > 0 && (
              <div className="flex gap-2 mt-2">
                {images.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`문의 이미지 ${idx + 1}`}
                    className="w-16 h-16 object-cover rounded"
                  />
                ))}
              </div>
            )}
          </div>
          {/* 이미 답변 완료된 경우 */}
          {status === "ANSWERED" && answer && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-[14px] font-medium text-[#26282a] mb-2">
                답변 내용
              </h4>
              <p className="text-[14px] font-normal text-[#26282a] leading-[1.43] whitespace-pre-wrap">
                {currentAnswer.content}
              </p>
            </div>
          )}

          {/* 관리자용 답변 달기 */}
          {role === "ADMIN" && status !== "ANSWERED" && !isReplying && (
            <button
              onClick={() => setIsReplying(true)}
              className="ml-2 px-2 py-1 text-sm bg-blue-500 text-white rounded"
            >
              답변 달기
            </button>
          )}

          {/* 답변 작성 폼 */}
          {isReplying && (
            <div className="mt-3">
              <textarea
                className="w-full border border-gray-300 rounded p-2 text-sm"
                rows={4}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="답변 내용을 입력해주세요."
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={saveAnswer}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent("");
                  }}
                  className="px-3 py-1 bg-gray-300 text-black rounded text-sm"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 작성 시간 */}
      <div
        className="
        flex 
        items-center 
        h-10 
        px-5 
        pt-1 
        pb-2.5
      "
      >
        <p
          className="
          text-[14px] 
          font-normal 
          text-[#c6c8ca] 
          leading-[1.43]
          whitespace-nowrap
        "
        >
          {date}
        </p>
      </div>

      {/* 하단 구분선 */}
      <div
        className="
        w-[940px] 
        h-px 
        bg-[#eef0f2] 
        mx-auto
      "
      ></div>
    </div>
  );
}
