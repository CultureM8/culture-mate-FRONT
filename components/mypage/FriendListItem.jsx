"use client"

import { IMAGES } from "@/constants/path";
import Image from "next/image";

export default function FriendListItem({ 
  friend, 
  onClick, 
  isSelected = false 
}) {
  const handleClick = () => {
    if (typeof onClick === "function") {
      onClick(friend);
    }
  };

  return (
    <div 
      className={`
        bg-white w-full min-w-[300px] relative border-b border-gray-200 
        cursor-pointer hover:bg-gray-50 transition-colors duration-200
        ${isSelected ? 'bg-blue-50 border-blue-200' : ''}
      `}
      onClick={handleClick}
    >
      <div className="mx-[10px] py-[10px] flex items-center">
        {/* 프로필 이미지 */}
        <div className="relative w-[60px] h-[60px] rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={friend?.profileImage || IMAGES.GALLERY_DEFAULT_IMG}
            alt={friend?.name || "친구"}
            width={60}
            height={60}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* 친구 정보 */}
        <div className="px-4 py-2 flex-1 min-w-0">
          <div className="flex flex-col gap-1">
            {/* 이름 */}
            <div className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-medium text-[#26282a] text-[16px] truncate">
              {friend?.name || "이용자1"}
            </div>
            
            {/* 한줄 소개 */}
            <div className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[#76787a] text-[14px] truncate">
              {friend?.introduction || "한줄 자기소개 한줄 자기소개 한줄 자기소개 한줄 자기소개"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
