"use client"

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { IMAGES, ICONS } from "@/constants/path";
import { getMemberDetail, memberDetailUtils, updateMemberWithImages } from "@/lib/api/memberDetailApi";
import useLogin from "@/hooks/useLogin";

// 토글 버튼 컴포넌트
function EditToggleButton({ editMode, onToggleEdit, isLoading, onSave }) {
  const handleClick = () => {
    if (editMode && onSave) {
      // 편집 모드에서 저장 버튼 클릭 시
      onSave();
    } else {
      // 일반 토글
      onToggleEdit();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`rounded-lg cursor-pointer transition-colors px-3 py-2 md:px-4 md:py-2 ${
        editMode
          ? 'bg-green-500 hover:bg-green-600 text-white'
          : 'bg-[#c6c8ca] hover:bg-gray-400 text-white'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="flex flex-col font-medium justify-center text-center">
        <p className="font-bold leading-[1.5] text-sm md:text-[16px] whitespace-pre">
          {isLoading
            ? (editMode ? '저장 중...' : '확인 중...')
            : editMode ? '변경사항 저장' : '회원정보 수정'
          }
        </p>
      </div>
    </button>
  );
}

// 메인 프로필 정보 컴포넌트
export default function ProfileInfo({ editMode = false, onToggleEdit, isLoading }) {
  const { user } = useLogin();
  const [memberDetail, setMemberDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  // 편집 모드 상태
  const [editedNickname, setEditedNickname] = useState("");
  const [editedIntro, setEditedIntro] = useState("");

  // 파일 업로드 상태
  const [isHoveringProfile, setIsHoveringProfile] = useState(false);
  const [isHoveringBackground, setIsHoveringBackground] = useState(false);
  const profileFileRef = useRef(null);
  const backgroundFileRef = useRef(null);

  // 컴포넌트 마운트 시 사용자 데이터 로드
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // 자신의 회원 상세 정보 가져오기 (ID 없이 호출)
        const memberDetailData = await getMemberDetail();
        // 동행점수 임시 하드코딩
        const memberDetailWithScore = { ...memberDetailData, togetherScore: 65 };
        setMemberDetail(memberDetailWithScore);

        // 편집 상태 초기화
        setEditedNickname(memberDetailData?.nickname || "");
        setEditedIntro(memberDetailData?.intro || "");

        // 이미지 URL 설정
        if (memberDetailData?.profileImageId) {
          setProfileImage(memberDetailUtils.getProfileImageUrl(memberDetailData.profileImageId));
        }
        if (memberDetailData?.backgroundImageId) {
          setBackgroundImage(memberDetailUtils.getBackgroundImageUrl(memberDetailData.backgroundImageId));
        }

      } catch (error) {
        console.error('사용자 데이터 로드 실패:', error);
        // 에러 발생 시 기본값 유지
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.id]);

  // 편집 모드 변경 시 편집 값 초기화
  useEffect(() => {
    if (editMode && memberDetail) {
      setEditedNickname(memberDetail.nickname || "");
      setEditedIntro(memberDetail.intro || "");
    }
  }, [editMode, memberDetail]);

  // 파일 업로드 핸들러
  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };


  // ProfileEdit과 동일한 저장 로직
  const handleSave = async () => {
    if (!user?.id) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      // ProfileEdit과 동일한 memberData 구조
      const memberData = {
        nickname: editedNickname.trim(),
        intro: editedIntro.trim(),
        mbti: memberDetail?.mbti || "",
        interestEventTypes: [], // TODO: 실제 관심사 데이터 연결
        interestTags: [] // TODO: 실제 관심사 데이터 연결
      };

      // ProfileEdit과 동일한 API 호출
      await updateMemberWithImages(
        user.id,
        memberData,
        null, // profileImageFile - TODO: 이미지 파일 처리
        null  // backgroundImageFile - TODO: 이미지 파일 처리
      );

      // 로컬 상태 업데이트
      setMemberDetail(prev => ({
        ...prev,
        nickname: editedNickname,
        intro: editedIntro
      }));

      // 편집 모드 종료
      onToggleEdit();

      alert("변경사항이 저장되었습니다!");
      console.log('프로필 저장 성공');

    } catch (error) {
      console.error("저장 실패:", error);

      // ProfileEdit과 동일한 에러 처리
      if (error.message) {
        alert(`저장에 실패했습니다: ${error.message}`);
      } else {
        alert("저장에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <div className="w-full max-w-[1200px] h-auto min-h-[450px] mx-auto bg-white border-b border-gray-200 overflow-hidden">

      {/* 숨겨진 파일 입력 */}
      <input
        type="file"
        ref={profileFileRef}
        onChange={handleProfileImageUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={backgroundFileRef}
        onChange={handleBackgroundImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* 프로필 배경 섹션 - 반응형 높이 */}
      <div
        className="bg-gray-100 flex flex-col h-[280px] sm:h-[240px] md:h-[280px] items-end justify-end p-[10px] w-full relative"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        onMouseEnter={() => editMode && setIsHoveringBackground(true)}
        onMouseLeave={() => setIsHoveringBackground(false)}
      >
        {/* 배경 이미지 편집 버튼 (편집 모드에서만 표시) */}
        {editMode && (
          <div
            className={`absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center transition-opacity duration-200 ${
              isHoveringBackground ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <button
              onClick={() => backgroundFileRef.current?.click()}
              className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-3 transition-all duration-200"
            >
              <Image src={ICONS.EDIT_GRAY} alt="배경 수정" width={20} height={20} />
            </button>
          </div>
        )}

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
          onMouseEnter={() => editMode && setIsHoveringProfile(true)}
          onMouseLeave={() => setIsHoveringProfile(false)}
        >
          {/* 프로필 이미지가 없는 경우 기본 표시 */}
          {!profileImage && (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[#26282a] text-sm md:text-base font-normal">
                프로필 이미지 없음
              </span>
            </div>
          )}

          {/* 프로필 이미지 편집 버튼 (편집 모드에서만 표시) */}
          {editMode && (
            <div
              className={`absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center transition-opacity duration-200 ${
                isHoveringProfile ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <button
                onClick={() => profileFileRef.current?.click()}
                className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200"
              >
                <Image src={ICONS.EDIT} alt="프로필 수정" width={15} height={15} />
              </button>
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
            <div className={`flex items-center font-semibold text-[#26282a] text-[28px] text-left whitespace-nowrap min-w-[200px] ${editMode ? 'bg-white border border-[#c6c8ca] rounded px-3 py-2' : 'px-3 py-2'}`}>
              {editMode ? (
                <input
                  type="text"
                  value={editedNickname}
                  onChange={(e) => setEditedNickname(e.target.value)}
                  className="leading-[1.28] bg-transparent border-none outline-none w-full text-[28px] font-semibold m-0 p-0"
                  placeholder="닉네임을 입력해주세요"
                />
              ) : (
                <p className="leading-[1.28] whitespace-nowrap w-full m-0 p-0">
                  {loading ? "로딩 중..." : (memberDetail?.nickname || "사용자 별명")}
                </p>
              )}
            </div>
            
            {/* 동행점수/바/버튼 영역 */}
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
              
              {/* 수정/저장 버튼 */}
              <div className="ml-4">
                <EditToggleButton
                  editMode={editMode}
                  onToggleEdit={onToggleEdit}
                  onSave={handleSave}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>


          {/* 한줄 자기소개 */}
          <div className={`flex flex-row items-start text-[#26282a] text-lg md:text-[20px] text-left w-full min-h-[80px] ${editMode ? 'bg-white border border-[#c6c8ca] rounded px-3 py-2' : ''}`} style={{fontFamily: 'Inter, Noto Sans KR, sans-serif', fontWeight: 500, lineHeight: 1.4}}>
            {editMode ? (
              <textarea
                value={editedIntro}
                onChange={(e) => setEditedIntro(e.target.value)}
                className="leading-[1.4] bg-transparent border-none outline-none resize-none w-full min-h-[3em] text-lg md:text-[20px]"
                placeholder="한줄 자기소개를 작성해주세요."
                style={{fontFamily: 'Inter, Noto Sans KR, sans-serif', fontWeight: 500, lineHeight: 1.4}}
              />
            ) : (
              <p className="leading-[1.4] w-full min-h-[3em] flex items-start">
                {loading ? "로딩 중..." : (memberDetail?.intro || "한줄 자기소개를 작성해주세요.")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}