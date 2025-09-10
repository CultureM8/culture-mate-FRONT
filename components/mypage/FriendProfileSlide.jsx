"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { IMAGES, ICONS } from "@/constants/path";

export default function FriendProfileSlide({
  friend,
  isVisible = false,
  onClose,
}) {
  // ---------- 정규화 유틸 ----------
  const toNonEmpty = (...vals) =>
    vals.map((v) => (typeof v === "string" ? v.trim() : "")).find(Boolean);

  const toArray = (val) => {
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val === "string") {
      // 콤마/스페이스 모두로 분리
      return val
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const normalizeFriend = (fRaw = {}) => {
    const f = { ...fRaw };

    // 이름: 닉네임 > 표시명 > 이름 > 로그인ID > id
    const idFallback =
      f.id ??
      f.memberId ??
      f.userId ??
      f.participantId ??
      f.loginId ??
      f.login_id;
    const name =
      toNonEmpty(f.nickname, f.display_name, f.name, f.loginId, f.login_id) ||
      (idFallback != null ? String(idFallback) : "사용자");

    // 프로필/배경 이미지 폴백
    const profileImage =
      f.profileImage ||
      f.profile_image ||
      f.avatarUrl ||
      f.avatar ||
      f.photoURL ||
      f.image ||
      null;

    const backgroundImage =
      f.backgroundImage || f.coverImage || f.bannerImage || null;

    // 나이/성별/MBTI
    const age =
      typeof f.age === "number"
        ? `${f.age} 세`
        : toNonEmpty(f.age, f.age_text, "00 세");
    const gender = toNonEmpty(f.gender, f.sex, "여");
    const mbti = toNonEmpty(f.mbti, f.MBTI, "MBTI");

    // 관심사/태그
    const interests =
      toArray(f.interests).length > 0
        ? toArray(f.interests)
        : ["영화", "연극", "전시", "콘서트/페스티벌"];

    // 태그는 문자열/배열 모두 지원, # 없으면 붙여줌
    const tagsArr = Array.isArray(f.tags) ? f.tags : toArray(f.tags || "");
    const tags =
      tagsArr.length > 0
        ? tagsArr.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ")
        : "#신촌 #맛집탐방 #전시회 #영화관람 #드라이브 #야경감상 #방탈출 #보드게임 #클래식음악 #요가 #러닝 #플리마켓";

    // 갤러리
    const galleryImagesRaw =
      f.galleryImages || f.gallery || f.images || f.photos || [];
    const galleryImages = toArray(galleryImagesRaw);
    while (galleryImages.length < 6) galleryImages.push(null);

    return {
      name,
      introduction:
        toNonEmpty(
          f.introduction,
          f.bio,
          "한줄 자기소개 한줄 자기소개 한줄 자기소개 한줄 자기소개 한줄 자기소개 한줄 자기소개"
        ) || "",
      profileImage,
      backgroundImage,
      age,
      gender,
      mbti,
      interests,
      tags,
      galleryImages,
    };
  };

  const currentFriend = useMemo(() => normalizeFriend(friend), [friend]);

  // 이미지 폴백 state
  const [profileSrc, setProfileSrc] = useState(
    currentFriend.profileImage || IMAGES.GALLERY_DEFAULT_IMG
  );
  useEffect(() => {
    setProfileSrc(currentFriend.profileImage || IMAGES.GALLERY_DEFAULT_IMG);
  }, [currentFriend.profileImage]);

  // ESC로 닫기
  useEffect(() => {
    if (!isVisible) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isVisible, onClose]);

  const handleClose = () => onClose?.();

  // 이니셜
  const initials = useMemo(() => {
    const parts = (currentFriend.name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return "USER";
    const a = parts[0]?.[0] || "";
    const b = parts[1]?.[0] || "";
    return (a + b).toUpperCase();
  }, [currentFriend.name]);

  return (
    <div
      className={`
        w-full h-full bg-white shadow-lg border-l border-gray-200
        transform transition-transform duration-300
        ${isVisible ? "translate-x-0" : "translate-x-full"}
      `}
      aria-hidden={!isVisible}>
      {/* 스크롤바 스타일 */}
      <style jsx global>{`
        .profile-scroll-container {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
        }
        .profile-scroll-container::-webkit-scrollbar {
          width: 8px;
        }
        .profile-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .profile-scroll-container::-webkit-scrollbar-thumb {
          background-color: transparent;
          border-radius: 4px;
          transition: background-color 0.3s ease;
        }
        @media (min-width: 768px) {
          .profile-scroll-container:hover::-webkit-scrollbar-thumb {
            background-color: #f3f4f6;
          }
          .profile-scroll-container::-webkit-scrollbar-thumb:hover {
            background-color: #eef0f2;
          }
        }
        @media (max-width: 767px) {
          .profile-scroll-container::-webkit-scrollbar {
            display: none;
          }
          .profile-scroll-container {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
        }
      `}</style>

      {/* 스크롤 가능한 컨테이너 */}
      <div className="h-full overflow-y-auto profile-scroll-container">
        {/* 프로필 배경 섹션 */}
        <div
          className="bg-gray-100 flex flex-col h-[240px] items-end justify-end p-[10px] w-full relative"
          style={{
            backgroundImage: currentFriend.backgroundImage
              ? `url(${currentFriend.backgroundImage})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}>
          {/* CLOSE */}
          <div className="absolute top-4 right-4 z-10">
            <button
              aria-label="닫기"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 hover:bg-white transition"
              onClick={handleClose}>
              <Image src={ICONS.CLOSE} alt="닫기" width={16} height={16} />
            </button>
          </div>

          {/* 신고 버튼 */}
          <div className="absolute top-4 right-16 z-10 flex gap-2">
            <button
              className="bg-gray-700 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1 hover:bg-gray-800"
              onClick={() => alert("신고가 접수되었습니다.")}>
              <Image src={ICONS.BELL} alt="신고" width={12} height={12} />
              신고
            </button>
          </div>

          {/* 프로필 이미지 */}
          <div
            className="absolute left-1/2 transform -translate-x-1/2 top-[160px] w-40 h-40 rounded-full overflow-hidden z-20 border-4 border-white bg-gray-300 flex items-center justify-center"
            style={{ width: "160px", height: "160px" }}>
            {currentFriend.profileImage ? (
              <Image
                src={profileSrc}
                alt={`${currentFriend.name} 프로필`}
                width={160}
                height={160}
                className="w-full h-full object-cover"
                onError={() => setProfileSrc(IMAGES.GALLERY_DEFAULT_IMG)}
                sizes="160px"
              />
            ) : (
              <span className="text-white text-xl tracking-wide">
                {initials}
              </span>
            )}
          </div>
        </div>

        {/* 프로필 정보 섹션 */}
        <div className="flex flex-col px-8 pt-[100px] pb-8 w-full">
          {/* 별명 & 소개 */}
          <div className="flex flex-col gap-2 items-center justify-start mb-4">
            <div className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[#26282a] text-[18px]">
              {currentFriend.name}
            </div>
            <div className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[#76787a] text-[14px] text-center w-full">
              {currentFriend.introduction}
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="flex flex-row items-start justify-between w-full mb-4 gap-3">
            {[currentFriend.age, currentFriend.gender, currentFriend.mbti].map(
              (text, i) => (
                <div
                  key={i}
                  className="bg-white box-border flex items-center justify-center px-4 py-2 relative rounded border border-[#c6c8ca] shrink-0 w-40">
                  <div className="text-[#26282a] text-[16px]">{text}</div>
                </div>
              )
            )}
          </div>

          {/* 관심 이벤트 유형 */}
          <div className="flex flex-col gap-2 w-full mb-4">
            <div className="text-[#26282a] text-[16px]">관심 이벤트 유형</div>
            <div className="bg-white box-border flex flex-row flex-wrap gap-2.5 min-h-14 items-start justify-start p-4 relative rounded border border-[#c6c8ca]">
              {currentFriend.interests.map((interest, idx) => (
                <div
                  key={`${interest}-${idx}`}
                  className="bg-white box-border flex items-center justify-center px-2 h-[30px] rounded-[15px] border border-[#76787a] text-[#9ea0a2] text-[14px]">
                  {interest}
                </div>
              ))}
            </div>
          </div>

          {/* 관심 태그 */}
          <div className="flex flex-col gap-2 w-full mb-4">
            <div className="text-[#26282a] text-[16px]">관심 태그</div>
            <div className="bg-white box-border flex flex-row flex-wrap gap-2.5 items-start justify-start min-h-14 p-4 relative rounded border border-[#c6c8ca]">
              {(currentFriend.tags || "")
                .split(/\s+/)
                .filter(Boolean)
                .map((tag, idx) => (
                  <div
                    key={`${tag}-${idx}`}
                    className="bg-white box-border flex items-center justify-center px-2 h-[30px] rounded-[15px] border border-[#76787a] text-[#9ea0a2] text-[14px]">
                    {tag}
                  </div>
                ))}
            </div>
          </div>

          {/* 갤러리 3열 */}
          <div className="flex flex-col gap-2 w-full mb-8">
            <div className="text-[#26282a] text-[16px]">갤러리</div>
            <div className="bg-white box-border p-4 rounded border border-[#c6c8ca]">
              <div className="grid grid-cols-3 gap-2.5 w-full">
                {currentFriend.galleryImages.map((image, index) => (
                  <div
                    key={index}
                    className="bg-[#eef0f2] rounded-lg aspect-square overflow-hidden flex items-center justify-center">
                    {image ? (
                      <img
                        src={image}
                        alt={`갤러리 이미지 ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = IMAGES.GALLERY_DEFAULT_IMG;
                        }}
                      />
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 rounded" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
