"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/path';
import useLogin from '@/hooks/useLogin';
import { getMemberDetail, updateMemberWithImages } from '@/lib/api/memberDetailApi';
import ProfileEditHeader from '@/components/mypage/ProfileEditHeader';
import EventTypeCheckbox from '@/components/mypage/EventTypeCheckbox';
import SimpleTagInput from '@/components/mypage/SimpleTagInput';
import PersonalInfoEdit from '@/components/mypage/PersonalInfoEdit';

export default function MyPageEdit() {
  const router = useRouter();
  const { user } = useLogin();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 편집용 상태
  const [nickname, setNickname] = useState("");
  const [intro, setIntro] = useState("");
  const [eventTypes, setEventTypes] = useState([]);
  const [tags, setTags] = useState([]);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [backgroundImageFile, setBackgroundImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // 저장 함수
  const handleSave = async () => {
    if (!user?.id) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      setSaving(true);

      // 프로필 정보만 저장 (개인정보는 별도 관리)
      const memberData = {
        nickname: nickname.trim(),
        intro: intro.trim(),
        mbti: "", // TODO: MBTI 추가 시 연결
        interestEventTypes: eventTypes,
        interestTags: tags
        // 참고: 로그인ID, 비밀번호, 이메일 등 개인정보는 PersonalInfoEdit에서 관리하지만 저장되지 않음
      };

      await updateMemberWithImages(
        user.id,
        memberData,
        profileImageFile,
        backgroundImageFile
      );

      alert("변경사항이 저장되었습니다!");
      router.push(ROUTES.MYPAGE);

    } catch (error) {
      console.error("저장 실패:", error);
      if (error.message) {
        alert(`저장에 실패했습니다: ${error.message}`);
      } else {
        alert("저장에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setSaving(false);
    }
  };

  // 권한 검증 및 초기 데이터 로드
  useEffect(() => {
    const initializePage = async () => {
      // 로그인 검증
      if (!user?.id) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      try {
        // 권한 검증 및 초기 데이터 로드
        const memberDetailData = await getMemberDetail();

        // 편집 상태 초기화
        setNickname(memberDetailData?.nickname || "");
        setIntro(memberDetailData?.intro || "");
        setEventTypes(memberDetailData?.interestEventTypes || []);
        setTags(memberDetailData?.interestTags || []);

        setLoading(false);
      } catch (error) {
        console.error('권한 검증 실패:', error);
        if (error.status === 401) {
          alert('로그인이 만료되었습니다.');
          router.push('/login');
        } else {
          setError('편집 권한이 없습니다.');
          // 3초 후 마이페이지로 이동
          setTimeout(() => {
            router.push(ROUTES.MYPAGE);
          }, 3000);
        }
      }
    };

    initializePage();
  }, [user, router]);

  // 로딩 상태
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">편집 페이지를 준비 중입니다...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-800 mb-2">{error}</p>
          <p className="text-gray-600 text-sm">잠시 후 마이페이지로 이동합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-screen">
      <div className="w-full max-w-[1200px] mx-auto">
        {/* 헤더 */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">프로필 편집</h1>
            <p className="text-sm text-gray-600 mt-1">프로필 정보를 수정하고 저장해보세요</p>
          </div>
        </div>

        {/* 프로필 편집 헤더 영역 */}
        <div className="border-b border-gray-200">
          <ProfileEditHeader
            nickname={nickname}
            setNickname={setNickname}
            intro={intro}
            setIntro={setIntro}
            profileImageFile={profileImageFile}
            setProfileImageFile={setProfileImageFile}
            backgroundImageFile={backgroundImageFile}
            setBackgroundImageFile={setBackgroundImageFile}
          />
        </div>

        {/* 편집 폼 영역 */}
        <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto p-4 sm:p-6">
          {/* 관심 이벤트 유형 편집 */}
          <EventTypeCheckbox
            eventTypes={eventTypes}
            setEventTypes={setEventTypes}
          />

          {/* 관심 태그 편집 */}
          <SimpleTagInput
            tags={tags}
            setTags={setTags}
          />

          {/* 개인정보 편집 컴포넌트 */}
          <PersonalInfoEdit />
        </div>

        {/* 임시 저장/취소 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="w-full max-w-[1200px] mx-auto flex gap-3 justify-end">
            <button
              onClick={() => router.push(ROUTES.MYPAGE)}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-3 bg-blue-500 text-white rounded-lg transition-colors ${
                saving
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-600'
              }`}
            >
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}