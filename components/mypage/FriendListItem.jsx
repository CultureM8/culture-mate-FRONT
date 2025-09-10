"use client";

import { useMemo, useState } from "react";
import { IMAGES } from "@/constants/path";
import Image from "next/image";

export default function FriendListItem({
  friend,
  onClick,
  isSelected = false,
  disabled = false, // 선택: 비활성화 상태 지원
}) {
  // 이름 정규화: 닉네임 > 표시명 > 이름 > 로그인ID > id
  const displayName = useMemo(() => {
    const f = friend || {};
    const firstNonEmpty = (...vals) =>
      vals.map((v) => (typeof v === "string" ? v.trim() : "")).find(Boolean);
    const idFallback =
      f.id ?? f.memberId ?? f.userId ?? f.participantId ?? null;

    return (
      firstNonEmpty(
        f.nickname,
        f.display_name,
        f.name,
        f.loginId,
        f.login_id
      ) || (idFallback != null ? String(idFallback) : "이용자")
    );
  }, [friend]);

  // 아바타 정규화: profileImage > profile_image > avatarUrl > avatar > photoURL > image
  const initialAvatar =
    friend?.profileImage ||
    friend?.profile_image ||
    friend?.avatarUrl ||
    friend?.avatar ||
    friend?.photoURL ||
    friend?.image ||
    IMAGES.GALLERY_DEFAULT_IMG;

  const [imgSrc, setImgSrc] = useState(initialAvatar);

  const handleClick = () => {
    if (disabled) return;
    if (typeof onClick === "function") onClick(friend);
  };

  return (
    <div
      className={`
        w-full min-w-[300px] relative
        ${disabled ? "cursor-default" : "cursor-pointer hover:bg-gray-50"}
        transition-colors duration-200
        ${isSelected ? "bg-blue-50 border-blue-200" : ""}
      `}
      onClick={handleClick}
      aria-disabled={disabled}
      role={typeof onClick === "function" ? "button" : undefined}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (
          !disabled &&
          typeof onClick === "function" &&
          (e.key === "Enter" || e.key === " ")
        ) {
          e.preventDefault();
          onClick(friend);
        }
      }}>
      <div className="mx-[10px] py-[10px] flex items-center">
        {/* 프로필 이미지 */}
        <div className="relative w-[60px] h-[60px] rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
          <Image
            src={imgSrc || IMAGES.GALLERY_DEFAULT_IMG}
            alt={displayName}
            width={60}
            height={60}
            className="w-full h-full object-cover"
            onError={() => setImgSrc(IMAGES.GALLERY_DEFAULT_IMG)}
            sizes="60px"
            priority={false}
          />
        </div>

        {/* 친구 정보 */}
        <div className="px-4 py-2 flex-1 min-w-0">
          <div className="flex flex-col gap-1">
            {/* 이름 + 뱃지 */}
            <div className="flex items-center gap-2">
              <div className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-medium text-[#26282a] text-[16px] truncate">
                {displayName}
              </div>
              {friend?.isHost && (
                <span className="bg-pink-100 text-pink-700 border-pink-200 px-2 text-xs font-medium rounded-full border">
                  호스트
                </span>
              )}
            </div>

            {/* 한줄 소개 */}
            <div className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[#76787a] text-[14px] truncate">
              {friend?.introduction ||
                "한줄 자기소개 한줄 자기소개 한줄 자기소개 한줄 자기소개"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
