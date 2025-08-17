import StarScore from "@/lib/StarScore";
import ListComponent from "../../../global/ListComponent";
import { useState } from "react";
import EventReviewModal from "./EventReviewModal";
import Image from "next/image";
import { IMAGES } from "@/constants/path";

// 이벤트 후기 목록 항목 컴포넌트
export default function EventReviewList({
  userNickname = "사용자별명",
  userProfileImg = "",
  userProfileImgAlt = "",
  content = "이벤트 후기 내용",
  score = 0,
  createdDate = "00.00.00",
}) {

  const [reviewTabExtend, setReviewTabExtend] = useState(false);

  const extendReviewTab = () => { setReviewTabExtend(!reviewTabExtend) };
  
  return (
    <div 
      className="
        flex justify-between bg-white w-full min-w-[300px] relative 
        border border-gray-200 rounded-2xl p-4
        hover:cursor-pointer
        mb-2"
      onClick={extendReviewTab}
    >

      <div className="flex flex-col h-full min-w-0 gap-4">
        <div className="flex gap-4">
          <Image 
            src={
              userProfileImg && userProfileImg.trim() !== "" ? 
              userProfileImg : 
              IMAGES.GALLERY_DEFAULT_IMG
            }
            alt={userProfileImgAlt}
            width={80}
            height={80}
            className="w-[50px] h-[50px] rounded-full"
          />
          <div className="flex flex-col flex-1 gap-2">
            <div className="text-gray-700">{userNickname}</div>
            <div className="flex gap-2">
              {/* 별점 */}
              <StarScore score={score} />
              <span className="text-gray-300">
                {createdDate}
              </span>
            </div>
          </div>
        </div>
        {/* 후기 내용 */}
        <div 
          className={`
            text-gray-700 mt-2 leading-relaxed px-2
            ${!reviewTabExtend && "overflow-hidden whitespace-nowrap text-ellipsis"}
          `}
        >
          {content}
        </div>
      </div>
      <div className="flex items-center gap-6 mb-1 flex-shrink-0">
      </div>

    </div>
  );
}
