"use client";

import StarScore from "@/lib/StarScore";
import { useState } from "react";
import Image from "next/image";
import { IMAGES } from "@/constants/path";
import { displayNameFromTriplet } from "@/lib/displayName";

// 날짜 포맷 함수
const formatDate = (dateString) => {
  if (!dateString) return "00.00.00";
  try {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("ko-KR", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\. /g, ".")
      .replace(/\.$/, "");
  } catch (e) {
    return "00.00.00";
  }
};

// 백엔드 author 정보를 포함한 이벤트 후기 목록 항목 컴포넌트
export default function EventReviewList(props) {
  console.log("EventReviewList received props:", props);

  const {
    id,
    eventId,
    memberId,
    rating = 0,
    content = "이벤트 후기 내용",
    createdAt,
    updatedAt,
    author, // 백엔드에서 제공하는 author 정보
  } = props || {};

  const [reviewTabExtend, setReviewTabExtend] = useState(false);

  const extendReviewTab = () => {
    setReviewTabExtend(!reviewTabExtend);
  };

  // 사용자 표시명 생성 (author 정보 활용)
  const getUserDisplayName = () => {
    if (!author) return `#${memberId || "unknown"}`;

    return displayNameFromTriplet(
      author.nickname,
      author.loginId,
      author.id || memberId
    );
  };

  // 프로필 이미지 URL (author 정보 활용)
  const getProfileImageUrl = () => {
    if (author?.profileImagePath && author.profileImagePath.trim() !== "") {
      return author.profileImagePath;
    }
    return IMAGES.GALLERY_DEFAULT_IMG;
  };

  return (
    <div
      className="
        flex justify-between bg-white w-full min-w-[300px] relative 
        border border-gray-200 rounded-2xl p-4
        hover:cursor-pointer
        mb-2"
      onClick={extendReviewTab}>
      <div className="flex flex-col h-full min-w-0 gap-4">
        <div className="flex gap-4">
          <Image
            src={getProfileImageUrl()}
            alt={getUserDisplayName()}
            width={80}
            height={80}
            className="w-[50px] h-[50px] rounded-full object-cover"
          />
          <div className="flex flex-col flex-1 gap-2">
            <div className="text-gray-700">{getUserDisplayName()}</div>
            <div className="flex gap-2">
              {/* 별점 */}
              <StarScore score={rating} />
              <span className="text-gray-300">{formatDate(createdAt)}</span>
            </div>
          </div>
        </div>
        {/* 후기 내용 */}
        <div
          className={`
            text-gray-700 mt-2 leading-relaxed px-2
            ${
              !reviewTabExtend &&
              "overflow-hidden whitespace-nowrap text-ellipsis"
            }
          `}>
          {content}
        </div>
      </div>
      <div className="flex items-center gap-6 mb-1 flex-shrink-0"></div>
    </div>
  );
}
