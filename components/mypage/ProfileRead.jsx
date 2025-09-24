"use client"

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { getMemberDetail, memberDetailUtils } from "@/lib/api/memberDetailApi";
import useLogin from "@/hooks/useLogin";

// 편집 버튼 컴포넌트
function EditButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/mypage/edit');
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-lg cursor-pointer transition-colors px-3 py-2 md:px-4 md:py-2 bg-[#c6c8ca] hover:bg-gray-400 text-white"
    >
      <div className="flex flex-col font-medium justify-center text-center">
        <p className="font-bold leading-[1.5] text-sm md:text-[16px] whitespace-pre">
          회원정보 수정
        </p>
      </div>
    </button>
  );
}

// 순수 읽기전용 프로필 컴포넌트
export default function ProfileRead({ showEditButton = true }) {
  const { user } = useLogin();
  const [memberDetail, setMemberDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

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

        // 이미지 URL 설정
        if (memberDetailData?.profileImageId) {
          setProfileImage(memberDetailUtils.getProfileImageUrl(memberDetailData.profileImageId));
        }
        if (memberDetailData?.backgroundImageId) {
          setBackgroundImage(memberDetailUtils.getBackgroundImageUrl(memberDetailData.backgroundImageId));
        }

      } catch (error) {
        console.error('사용자 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.id]);

  return (
    <div className="w-full max-w-[1200px] h-auto min-h-[450px] mx-auto bg-white border-b border-gray-200 overflow-hidden">
      {/* 프로필 배경 섹션 - 반응형 높이 */}
      <div
        className="bg-gray-100 flex flex-col h-[280px] sm:h-[240px] md:h-[280px] items-end justify-end p-[10px] w-full relative"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* 프로필 이미지 영역 */}
        <div
          className="absolute left-4 sm:left-6 md:left-8 -bottom-16 sm:-bottom-20 md:-bottom-24
                     w-32 h-32 sm:w-40 sm:h-40 md:w-[200px] md:h-[200px]
                     rounded-full overflow-hidden z-20"
          style={{
            backgroundColor: profileImage ? 'transparent' : '#C6C8CA',
            backgroundImage: profileImage ? `url(${profileImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* 프로필 이미지가 없는 경우 기본 표시 */}
          {!profileImage && (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[#26282a] text-sm md:text-base font-normal">
                프로필 이미지 없음
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 프로필 정보 섹션 - 새로운 반응형 레이아웃 */}
      <div className="flex flex-col h-auto min-h-[170px] items-center md:items-end justify-start px-4 md:px-8 py-4 w-full">
        {/* 반응형 컨테이너 */}
        <div className="w-full max-w-[928px] min-h-[60px] p-2 md:p-4 flex flex-col items-start gap-6 sm:gap-8 md:gap-5">

          <div className="flex flex-row items-center w-full gap-0">
            {/* 사용자 별명 */}
            <div className="flex items-center font-semibold text-[#26282a] text-[28px] text-left whitespace-nowrap min-w-[200px] px-3 py-2">
              <p className="leading-[1.28] whitespace-nowrap w-full m-0 p-0">
                {loading ? "로딩 중..." : (memberDetail?.nickname || "사용자 별명")}
              </p>
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

              {/* 편집 버튼 (조건부 렌더링) */}
              {showEditButton && (
                <div className="ml-4">
                  <EditButton />
                </div>
              )}
            </div>
          </div>

          {/* 한줄 자기소개 */}
          <div className="flex flex-row items-start text-[#26282a] text-lg md:text-[20px] text-left w-full min-h-[80px]" style={{fontFamily: 'Inter, Noto Sans KR, sans-serif', fontWeight: 500, lineHeight: 1.4}}>
            <p className="leading-[1.4] w-full min-h-[3em] flex items-start">
              {loading ? "로딩 중..." : (memberDetail?.intro || "한줄 자기소개를 작성해주세요.")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}