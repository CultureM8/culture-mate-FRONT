"use client"

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { getMemberDetail, memberDetailUtils } from "@/lib/api/memberDetailApi";
import useLogin from "@/hooks/useLogin";

// 이미지 편집 버튼 컴포넌트
function ImageEditButton({ type, onClick, title }) {
  const iconSrc = type === 'edit' ? '/img/edit.svg' : '/img/delete.svg';
  const ariaLabel = type === 'edit' ? 'edit' : 'delete';

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      className="p-2 bg-white/90 hover:bg-white rounded-full transition-all duration-200 shadow-md border border-gray-400 hover:cursor-pointer"
    >
      <Image
        src={iconSrc}
        alt=""
        width={15}
        height={15}
      />
    </button>
  );
}

// 편집용 프로필 헤더 컴포넌트 (nickname, intro가 처음부터 input)
export default function ProfileEditHeader({
  nickname, setNickname, intro, setIntro,
  profileImageFile, setProfileImageFile,
  backgroundImageFile, setBackgroundImageFile
}) {
  const { user } = useLogin();
  const [memberDetail, setMemberDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  // 파일 입력 refs
  const backgroundFileRef = useRef(null);
  const profileFileRef = useRef(null);


  // 이미지 미리보기 URL 메모이제이션
  const backgroundImageUrl = useMemo(() => {
    if (backgroundImageFile) {
      return URL.createObjectURL(backgroundImageFile);
    }
    if (memberDetail?.backgroundImageId) {
      return memberDetailUtils.getBackgroundImageUrl(memberDetail.backgroundImageId);
    }
    return null;
  }, [backgroundImageFile, memberDetail?.backgroundImageId]);

  const profileImageUrl = useMemo(() => {
    if (profileImageFile) {
      return URL.createObjectURL(profileImageFile);
    }
    if (memberDetail?.profileImageId) {
      return memberDetailUtils.getProfileImageUrl(memberDetail.profileImageId);
    }
    return null;
  }, [profileImageFile, memberDetail?.profileImageId]);

  // 컴포넌트 마운트 시 사용자 데이터 로드
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // 자신의 회원 상세 정보 가져오기
        const memberDetailData = await getMemberDetail();
        // 동행점수 임시 하드코딩
        const memberDetailWithScore = { ...memberDetailData, togetherScore: 65 };
        setMemberDetail(memberDetailWithScore);

      } catch (error) {
        console.error('사용자 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.id]);

  // 배경 이미지 파일 선택 핸들러
  const handleBackgroundFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 파일 타입 및 크기 검증
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB 제한
        alert('파일 크기는 10MB 이하여야 합니다.');
        return;
      }
      setBackgroundImageFile(file);
    }
  };

  // 프로필 이미지 파일 선택 핸들러
  const handleProfileFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 파일 타입 및 크기 검증
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB 제한
        alert('파일 크기는 10MB 이하여야 합니다.');
        return;
      }
      setProfileImageFile(file);
    }
  };

  // 배경 이미지 변경 버튼 클릭
  const handleBackgroundChangeClick = () => {
    backgroundFileRef.current?.click();
  };

  // 배경 이미지 삭제 버튼 클릭
  const handleBackgroundDeleteClick = () => {
    setBackgroundImageFile(null);
  };

  // 프로필 이미지 변경 버튼 클릭
  const handleProfileChangeClick = () => {
    profileFileRef.current?.click();
  };

  // 프로필 이미지 삭제 버튼 클릭
  const handleProfileDeleteClick = () => {
    setProfileImageFile(null);
  };

  // 컴포넌트 언마운트 시 임시 URL 정리
  useEffect(() => {
    return () => {
      if (backgroundImageFile) {
        URL.revokeObjectURL(URL.createObjectURL(backgroundImageFile));
      }
      if (profileImageFile) {
        URL.revokeObjectURL(URL.createObjectURL(profileImageFile));
      }
    };
  }, [backgroundImageFile, profileImageFile]);


  return (
    <div className="w-full max-w-[1200px] h-auto min-h-[450px] mx-auto bg-white border-b border-gray-200 overflow-hidden">
      {/* 프로필 배경 섹션 - 반응형 높이 */}
      <div
        className="bg-gray-100 flex flex-col h-[280px] sm:h-[240px] md:h-[280px] items-end justify-end p-[10px] w-full relative"
        style={{
          backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* 배경 이미지 버튼 */}
        <div className="absolute bottom-4 right-4 flex gap-2 z-30">
          <ImageEditButton
            type="edit"
            onClick={handleBackgroundChangeClick}
            title="배경 이미지 변경"
          />
          <ImageEditButton
            type="delete"
            onClick={handleBackgroundDeleteClick}
            title="배경 이미지 삭제"
          />
        </div>

        {/* 프로필 이미지 영역 */}
        <div className="absolute left-4 sm:left-6 md:left-8 -bottom-16 sm:-bottom-20 md:-bottom-24 z-20">
          <div
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-[200px] md:h-[200px] rounded-full overflow-hidden relative"
            style={{
              backgroundColor: profileImageUrl ? 'transparent' : '#C6C8CA',
              backgroundImage: profileImageUrl ? `url(${profileImageUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* 프로필 이미지가 없는 경우 기본 표시 */}
            {!profileImageUrl && (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[#26282a] text-sm md:text-base font-normal">
                  프로필 이미지 없음
                </span>
              </div>
            )}

            {/* 프로필 이미지 중앙 버튼 */}
            <div className="absolute inset-0 flex items-center justify-center gap-3 z-30">
              <ImageEditButton
                type="edit"
                onClick={handleProfileChangeClick}
                title="프로필 이미지 변경"
              />
              <ImageEditButton
                type="delete"
                onClick={handleProfileDeleteClick}
                title="프로필 이미지 삭제"
              />
            </div>
          </div>

        </div>

        {/* 숨겨진 파일 입력 요소들 */}
        <input
          ref={backgroundFileRef}
          type="file"
          accept="image/*"
          onChange={handleBackgroundFileSelect}
          className="hidden"
        />
        <input
          ref={profileFileRef}
          type="file"
          accept="image/*"
          onChange={handleProfileFileSelect}
          className="hidden"
        />
      </div>

      {/* 프로필 정보 섹션 - 새로운 반응형 레이아웃 */}
      <div className="flex flex-col h-auto min-h-[170px] items-center md:items-end justify-start px-4 md:px-8 py-4 w-full">
        {/* 반응형 컨테이너 */}
        <div className="w-full max-w-[928px] min-h-[60px] p-2 md:p-4 flex flex-col items-start gap-6 sm:gap-8 md:gap-5">

          <div className="flex flex-row items-center w-full gap-0">
            {/* 사용자 별명 - 편집용 input */}
            <div className="flex items-center font-semibold text-[#26282a] text-[28px] text-left whitespace-nowrap min-w-[200px] bg-white border border-[#c6c8ca] rounded px-3 py-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="leading-[1.28] bg-transparent border-none outline-none w-full text-[28px] font-semibold m-0 p-0"
                placeholder="닉네임을 입력해주세요"
              />
            </div>

            {/* 동행점수/바 영역 */}
            <div className="flex flex-row items-center justify-end w-full ml-6 gap-4">
              <div className="flex flex-col font-medium justify-center text-[#26282a] text-lg text-left whitespace-nowrap">
                <p className="leading-[1.5]">동행 점수</p>
              </div>

              {/* 진행률 바 */}
              <div className="flex flex-col items-start justify-center relative max-w-[300px] w-[300px]">
                {/* 배경 바 */}
                <div className="h-2 w-full bg-[#eef0f2] rounded-[5px] relative">
                  {/* 진행률 바 */}
                  <div
                    className="h-2 bg-[#ffc37f] rounded-[5px] absolute top-0 left-0 transition-all duration-300"
                    style={{ width: `${Math.min(Math.max(memberDetail?.togetherScore || 0, 0), 100)}%` }}
                  />

                  {/* 점수 표시 */}
                  <div
                    className="absolute -top-6 text-[#26282a] text-base transform -translate-x-1/2 transition-all duration-300"
                    style={{
                      left: `${Math.min(Math.max(memberDetail?.togetherScore || 0, 0), 100)}%`,
                      minWidth: 'max-content'
                    }}
                  >
                    <p className="leading-[1.5]">{memberDetail?.togetherScore || 0}점</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 한줄 자기소개 - 편집용 textarea */}
          <div className="flex flex-row items-start text-[#26282a] text-lg md:text-[20px] text-left w-full min-h-[80px] bg-white border border-[#c6c8ca] rounded px-3 py-2" style={{fontFamily: 'Inter, Noto Sans KR, sans-serif', fontWeight: 500, lineHeight: 1.4}}>
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              className="leading-[1.4] bg-transparent border-none outline-none resize-none w-full min-h-[3em] text-lg md:text-[20px]"
              placeholder="한줄 자기소개를 작성해주세요."
              style={{fontFamily: 'Inter, Noto Sans KR, sans-serif', fontWeight: 500, lineHeight: 1.4}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}