"use client"

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ICONS } from '@/constants/path';
import { getMemberGalleryImages, uploadMemberGalleryImages, deleteMemberGalleryImage, getMemberDetail, updateInterestEventTypes, updateInterestTags } from '@/lib/api/memberDetailApi';
import { EVENT_TYPE_OPTIONS } from '@/constants/eventTypes';
import useLogin from '@/hooks/useLogin';
import PersonalInfoEdit from './PersonalInfoEdit';

// ProfileSection 컴포넌트
function ProfileSection({ editMode = false }) {
  const [ageDropdown, setAgeDropdown] = useState(false);
  const [genderDropdown, setGenderDropdown] = useState(false);
  const [mbtiDropdown, setMbtiDropdown] = useState(false);

  const [ageVisibility, setAgeVisibility] = useState('비공개');
  const [genderVisibility, setGenderVisibility] = useState('비공개');
  const [mbtiVisibility, setMbtiVisibility] = useState('비공개');

  const toggleAgeDropdown = () => setAgeDropdown(!ageDropdown);
  const toggleGenderDropdown = () => setGenderDropdown(!genderDropdown);
  const toggleMbtiDropdown = () => setMbtiDropdown(!mbtiDropdown);

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start justify-start w-full" data-name="Profile section">
      {/* 편집 모드에서는 나이/성별 섹션 숨김 (백엔드 미관리) */}
      {!editMode && (
        <>
      {/* 나이 섹션 */}
      <div className="flex flex-col gap-2 w-full lg:w-40 shrink-0">
        <div className="flex flex-row gap-2 items-center relative">
          <div className="text-gray-800 text-base font-normal">
            <p>나이</p>
          </div>
          <div className="flex flex-row gap-2 items-center cursor-pointer" onClick={toggleAgeDropdown}>
            <div className="text-[#C6C8CA] text-base font-normal">
              <p>{ageVisibility}</p>
            </div>
            <div className="flex items-center justify-center w-[17px] h-[16px]">
              <div className={`transition-transform duration-200 ${ageDropdown ? 'rotate-180' : ''}`}>
                <Image
                  src={ICONS.DOWN_GRAY}
                  alt="드롭다운 화살표"
                  width={17}
                  height={8}
                  style={{ filter: 'brightness(0) saturate(100%) invert(79%) sepia(2%) saturate(389%) hue-rotate(179deg) brightness(95%) contrast(89%)' }}
                />
              </div>
            </div>
            
            {ageDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-[100px]">
                <div className="py-1">
                  <button
                    className="block w-full px-4 py-2 text-left text-base text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAgeVisibility('공개');
                      setAgeDropdown(false);
                    }}
                  >
                    공개
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left text-base text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAgeVisibility('비공개');
                      setAgeDropdown(false);
                    }}
                  >
                    비공개
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white border border-gray-300 rounded h-14 flex items-center justify-center px-4">
          <div className="text-gray-800 text-base font-normal">
            <p>00 세</p>
          </div>
        </div>
        
        {/* 스크롤바 스타일 */}
        <style jsx global>{`
          .gallery-scroll-container {
            scrollbar-width: thin;
            scrollbar-color: transparent transparent;
          }
          
          .gallery-scroll-container::-webkit-scrollbar {
            height: 8px;
          }
          
          .gallery-scroll-container::-webkit-scrollbar-track {
            background: transparent;
          }
          
          .gallery-scroll-container::-webkit-scrollbar-thumb {
            background-color: transparent;
            border-radius: 4px;
            transition: background-color 0.3s ease;
          }
          
          /* 데스크톱: 호버 시 스크롤바 손잡이 나타남 */
          @media (min-width: 768px) {
            .gallery-scroll-container:hover::-webkit-scrollbar-thumb {
              background-color: #F3F4F6;
            }
            
            .gallery-scroll-container::-webkit-scrollbar-thumb:hover {
              background-color: #EEF0F2;
            }
          }
          
          /* 모바일: 완전히 숨김 */
          @media (max-width: 767px) {
            .gallery-scroll-container::-webkit-scrollbar {
              display: none;
            }
            
            .gallery-scroll-container {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
          }
        `}</style>
      </div>

      {/* 성별 섹션 */}
      <div className="flex flex-col gap-2 w-full lg:w-40 shrink-0">
        <div className="flex flex-row gap-2 items-center relative">
          <div className="text-gray-800 text-base font-normal">
            <p>성별</p>
          </div>
          <div className="flex flex-row gap-2 items-center cursor-pointer" onClick={toggleGenderDropdown}>
            <div className="text-[#C6C8CA] text-base font-normal">
              <p>{genderVisibility}</p>
            </div>
            <div className="flex items-center justify-center w-[17px] h-[16px]">
              <div className={`transition-transform duration-200 ${genderDropdown ? 'rotate-180' : ''}`}>
                <Image
                  src={ICONS.DOWN_GRAY}
                  alt="드롭다운 화살표"
                  width={17}
                  height={8}
                  style={{ filter: 'brightness(0) saturate(100%) invert(79%) sepia(2%) saturate(389%) hue-rotate(179deg) brightness(95%) contrast(89%)' }}
                />
              </div>
            </div>
            
            {genderDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-[100px]">
                <div className="py-1">
                  <button
                    className="block w-full px-4 py-2 text-left text-base text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGenderVisibility('공개');
                      setGenderDropdown(false);
                    }}
                  >
                    공개
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left text-base text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGenderVisibility('비공개');
                      setGenderDropdown(false);
                    }}
                  >
                    비공개
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white border border-gray-300 rounded h-14 flex items-center justify-center px-4">
          <div className="text-gray-800 text-base font-normal">
            <p>여</p>
          </div>
        </div>
      </div>

      {/* MBTI 섹션 */}
      <div className="flex flex-col gap-2 w-full lg:w-40 shrink-0">
        <div className="flex flex-row gap-2 items-center relative">
          <div className="text-gray-800 text-base font-normal">
            <p>MBTI</p>
          </div>
          <div className="flex flex-row gap-2 items-center cursor-pointer" onClick={toggleMbtiDropdown}>
            <div className="text-[#C6C8CA] text-base font-normal">
              <p>{mbtiVisibility}</p>
            </div>
            <div className="flex items-center justify-center w-[17px] h-[16px]">
              <div className={`transition-transform duration-200 ${mbtiDropdown ? 'rotate-180' : ''}`}>
                <Image
                  src={ICONS.DOWN_GRAY}
                  alt="드롭다운 화살표"
                  width={17}
                  height={8}
                  style={{ filter: 'brightness(0) saturate(100%) invert(79%) sepia(2%) saturate(389%) hue-rotate(179deg) brightness(95%) contrast(89%)' }}
                />
              </div>
            </div>
            
            {mbtiDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-[100px]">
                <div className="py-1">
                  <button
                    className="block w-full px-4 py-2 text-left text-base text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMbtiVisibility('공개');
                      setMbtiDropdown(false);
                    }}
                  >
                    공개
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left text-base text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMbtiVisibility('비공개');
                      setMbtiDropdown(false);
                    }}
                  >
                    비공개
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white border border-gray-300 rounded h-14 flex items-center justify-center px-4">
          <div className="text-gray-800 text-base font-normal">
            <p>MBTI</p>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

// EventTypeContainer 컴포넌트
function EventTypeContainer({ editMode = false }) {
  const { user } = useLogin();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visibility, setVisibility] = useState('공개');
  const [selectedEventTypes, setSelectedEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 컴포넌트 마운트 시 사용자의 관심 이벤트 타입 로드
  useEffect(() => {
    const loadUserInterestEventTypes = async () => {
      if (!user?.id || user.id === undefined) {
        console.log('User ID not available for interest event types:', user?.id);
        return;
      }

      try {
        setLoading(true);
        const memberDetailData = await getMemberDetail();

        // 백엔드에서 받은 관심 이벤트 타입을 상태에 설정
        if (memberDetailData?.interestEventTypes) {
          setSelectedEventTypes(memberDetailData.interestEventTypes);
        }
      } catch (error) {
        console.error('관심 이벤트 타입 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserInterestEventTypes();
  }, [user?.id]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="box-border content-stretch flex flex-col gap-[9px] items-start justify-start p-0 relative w-full" data-name="Event type container">
      <div className="box-border content-stretch flex flex-row gap-[9px] items-start justify-start p-0 relative shrink-0" data-name="Event type label">
        <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[16px] text-left text-nowrap">
          <p className="block leading-[1.5] whitespace-pre">관심 이벤트 유형</p>
        </div>
        <div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0 cursor-pointer" data-name="Event type value container" onClick={toggleDropdown}>
          <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#c6c8ca] text-[16px] text-left text-nowrap">
            <p className="block leading-[1.5] whitespace-pre">{visibility}</p>
          </div>
          <div className="flex items-center justify-center relative shrink-0 w-[17px] h-[16px]">
            <div className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
              <Image
                src={ICONS.DOWN_GRAY}
                alt="드롭다운 화살표"
                width={17}
                height={8}
              />
            </div>
          </div>
          
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-[#c6c8ca] rounded shadow-lg z-10 min-w-[100px]">
              <div className="py-1">
                <button
                  className="block w-full px-4 py-2 text-left text-[16px] text-[#26282a] hover:bg-[#eef0f2] transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVisibility('공개');
                    setIsDropdownOpen(false);
                  }}
                >
                  공개
                </button>
                <button
                  className="block w-full px-4 py-2 text-left text-[16px] text-[#26282a] hover:bg-[#eef0f2] transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVisibility('비공개');
                    setIsDropdownOpen(false);
                  }}
                >
                  비공개
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-[#ffffff] box-border content-stretch flex flex-row flex-wrap gap-2.5 h-auto min-h-14 items-start justify-start p-[16px] relative rounded shrink-0 w-full" data-name="Event type value">
        <div aria-hidden="true" className="absolute border border-[#c6c8ca] border-solid inset-0 pointer-events-none rounded" />

        {loading ? (
          <div className="text-gray-500 text-sm">로딩 중...</div>
        ) : selectedEventTypes.length === 0 ? (
          <div className="text-gray-400 text-sm">선택된 관심 이벤트 유형이 없습니다.</div>
        ) : (
          selectedEventTypes.map((eventType, index) => {
            // EventType enum에서 해당하는 라벨 찾기
            const eventTypeOption = EVENT_TYPE_OPTIONS.find(option => option.value === eventType);
            const displayLabel = eventTypeOption ? eventTypeOption.label : eventType;

            return (
              <div key={index} className="bg-[#ffffff] box-border content-stretch flex flex-row gap-1 items-center justify-center px-2 py-0 relative rounded-[15px] shrink-0 h-[30px]" data-name="Event type value">
                <div aria-hidden="true" className="absolute border border-[#76787a] border-solid inset-0 pointer-events-none rounded-[15px]" />
                <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#9ea0a2] text-[14px] text-left text-nowrap">
                  <p className="block leading-[1.43] whitespace-pre">{displayLabel}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// TagContainer 컴포넌트
function TagContainer({
  editMode = false,
  label = "관심 태그"
}) {
  const { user } = useLogin();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visibility, setVisibility] = useState('공개');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // 컴포넌트 마운트 시 사용자의 관심 태그 로드
  useEffect(() => {
    const loadUserInterestTags = async () => {
      if (!user?.id || user.id === undefined) {
        console.log('User ID not available for interest tags:', user?.id);
        return;
      }

      try {
        setLoading(true);
        const memberDetailData = await getMemberDetail();

        // 백엔드에서 받은 관심 태그를 상태에 설정
        if (memberDetailData?.interestTags) {
          setSelectedTags(memberDetailData.interestTags);
        }
      } catch (error) {
        console.error('관심 태그 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserInterestTags();
  }, [user?.id]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="box-border content-stretch flex flex-col gap-[9px] items-start justify-start p-0 relative w-full">
      <div className="box-border content-stretch flex flex-row gap-[9px] items-start justify-start p-0 relative shrink-0">
        <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[16px] text-left text-nowrap">
          <p className="block leading-[1.5] whitespace-pre">{label}</p>
        </div>
        
        <div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0 cursor-pointer" onClick={toggleDropdown}>
          <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#c6c8ca] text-[16px] text-left text-nowrap">
            <p className="block leading-[1.5] whitespace-pre">{visibility}</p>
          </div>
          
          <div className="flex items-center justify-center relative shrink-0 w-[17px] h-[16px]">
            <div className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
              <Image
                src={ICONS.DOWN_GRAY}
                alt="드롭다운 화살표"
                width={17}
                height={8}
              />
            </div>
          </div>
          
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-[#c6c8ca] rounded shadow-lg z-10 min-w-[100px]">
              <div className="py-1">
                <button
                  className="block w-full px-4 py-2 text-left text-[16px] text-[#26282a] hover:bg-[#eef0f2] transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVisibility('공개');
                    setIsDropdownOpen(false);
                  }}
                >
                  공개
                </button>
                <button
                  className="block w-full px-4 py-2 text-left text-[16px] text-[#26282a] hover:bg-[#eef0f2] transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVisibility('비공개');
                    setIsDropdownOpen(false);
                  }}
                >
                  비공개
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-[#ffffff] box-border content-stretch flex flex-row flex-wrap gap-2.5 h-auto min-h-14 items-start justify-start p-[16px] relative rounded shrink-0 w-full border border-[#c6c8ca]">
        {loading ? (
          <div className="text-gray-500 text-sm">로딩 중...</div>
        ) : selectedTags.length === 0 ? (
          <div className="text-gray-400 text-sm">선택된 관심 태그가 없습니다.</div>
        ) : (
          selectedTags.map((tag, index) => (
            <div
              key={index}
              className="bg-[#ffffff] box-border content-stretch flex flex-row gap-1 items-center justify-center px-2 py-0 relative rounded-[15px] shrink-0 h-[30px]"
            >
              <div aria-hidden="true" className="absolute border border-[#76787a] border-solid inset-0 pointer-events-none rounded-[15px]" />
              <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#9ea0a2] text-[14px] text-left text-nowrap">
                <p className="block leading-[1.43] whitespace-pre">#{tag}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// GalleryContainer 컴포넌트
function GalleryContainer({ editMode = false }) {
  const [images, setImages] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visibility, setVisibility] = useState('공개');
  const [loading, setLoading] = useState(false);
  
  // 현재 로그인한 사용자 ID (실제로는 Context나 localStorage에서 가져와야 함)
  const currentUserId = 1; // 임시로 하드코딩

  // 컴포넌트 마운트 시 갤러리 이미지 로드
  useEffect(() => {
    const loadGalleryImages = async () => {
      try {
        setLoading(true);
        const galleryImages = await getMemberGalleryImages(currentUserId);
        
        // API 응답을 컴포넌트에서 사용할 형태로 변환
        const formattedImages = galleryImages.map((imagePath, index) => ({
          id: Date.now() + index, // 고유 ID 생성
          src: imagePath,
          name: `gallery-image-${index}`
        }));
        
        setImages(formattedImages);
      } catch (error) {
        console.error('갤러리 이미지 로드 실패:', error);
        // 에러 시 빈 배열 유지
      } finally {
        setLoading(false);
      }
    };

    loadGalleryImages();
  }, [currentUserId]);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    try {
      setLoading(true);
      
      // 백엔드에 이미지 업로드
      await uploadMemberGalleryImages(currentUserId, files);
      
      // 업로드 성공 시 갤러리 이미지 목록을 다시 로드
      const updatedImages = await getMemberGalleryImages(currentUserId);
      const formattedImages = updatedImages.map((imagePath, index) => ({
        id: Date.now() + index,
        src: imagePath,
        name: `gallery-image-${index}`
      }));
      
      setImages(formattedImages);
      
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
    
    // 파일 입력 초기화 (같은 파일을 다시 선택할 수 있도록)
    event.target.value = '';
  };

  const addImage = () => {
    // 숨겨진 파일 입력 요소 클릭
    document.getElementById('gallery-file-input').click();
  };

  const removeImage = async (imageToRemove) => {
    try {
      setLoading(true);
      
      // 백엔드에서 이미지 삭제 (이미지 경로를 사용)
      await deleteMemberGalleryImage(currentUserId, imageToRemove.src);
      
      // 로컬 상태에서도 제거
      setImages(images.filter(img => img.id !== imageToRemove.id));
      
    } catch (error) {
      console.error('이미지 삭제 실패:', error);
      alert('이미지 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="box-border content-stretch flex flex-col gap-[9px] items-start justify-start p-0 relative w-full">
      {/* 숨겨진 파일 입력 요소 */}
      <input
        id="gallery-file-input"
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
      
      <div className="box-border content-stretch flex flex-row gap-[9px] items-start justify-start p-0 relative shrink-0">
        <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[16px] text-left text-nowrap">
          <p className="block leading-[1.5] whitespace-pre">갤러리</p>
        </div>
        <div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0 cursor-pointer" onClick={toggleDropdown}>
          <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#c6c8ca] text-[16px] text-left text-nowrap">
            <p className="block leading-[1.5] whitespace-pre">{visibility}</p>
          </div>
          <div className="flex items-center justify-center relative shrink-0 w-[17px] h-[16px]">
            <div className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
              <Image
                src={ICONS.DOWN_GRAY}
                alt="드롭다운 화살표"
                width={17}
                height={8}
              />
            </div>
          </div>
          
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-[#c6c8ca] rounded shadow-lg z-10 min-w-[100px]">
              <div className="py-1">
                <button
                  className="block w-full px-4 py-2 text-left text-[16px] text-[#26282a] hover:bg-[#eef0f2] transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVisibility('공개');
                    setIsDropdownOpen(false);
                  }}
                >
                  공개
                </button>
                <button
                  className="block w-full px-4 py-2 text-left text-[16px] text-[#26282a] hover:bg-[#eef0f2] transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVisibility('비공개');
                    setIsDropdownOpen(false);
                  }}
                >
                  비공개
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#ffffff] box-border content-stretch flex flex-col gap-2.5 items-start justify-center p-[16px] relative rounded shrink-0 w-full min-h-[200px] sm:min-h-[232px] overflow-hidden">
        <div className="absolute border border-[#c6c8ca] border-solid inset-0 pointer-events-none rounded" />
        
        <div 
          className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full h-full overflow-x-auto overflow-y-hidden gallery-scroll-container" 
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'transparent transparent'
          }}
          onMouseEnter={(e) => {
            if (window.innerWidth >= 768) {
              e.target.style.scrollbarColor = '#F3F4F6 transparent';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.scrollbarColor = 'transparent transparent';
          }}
        >
          {images.length === 0 && !loading && (
            <button
              onClick={addImage}
              className="box-border content-stretch flex flex-col gap-2.5 items-center justify-center p-[16px] hover:bg-[#f5f7f9] rounded-lg transition-colors duration-200"
              title="이미지 추가"
            >
              <div className="w-12 h-12">
                <Image
                  src={ICONS.ADD_GRAY}
                  alt="이미지 추가"
                  width={48}
                  height={48}
                />
              </div>
            </button>
          )}

          {loading && (
            <div className="box-border content-stretch flex flex-col gap-2.5 items-center justify-center p-[16px] text-gray-500">
              로딩 중...
            </div>
          )}

          {images.map((image) => (
            <div
              key={image.id}
              className="bg-[#eef0f2] box-border content-stretch flex flex-col gap-2.5 items-center justify-center p-0 relative rounded-lg shrink-0 w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] hover:bg-[#e0e2e4] transition-colors duration-200 overflow-hidden"
            >
              {/* 업로드된 이미지 표시 */}
              {image.src && (
                <img
                  src={image.src}
                  alt={image.name || "업로드된 이미지"}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
              
              {/* 삭제 버튼 */}
              <div
                className="absolute top-2 right-2 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity duration-200 bg-black bg-opacity-50 rounded-full w-6 h-6"
                onClick={() => removeImage(image)}
                title="이미지 삭제"
              >
                <div className="w-[12px] h-[12px]">
                  <Image
                    src={ICONS.X}
                    alt="삭제"
                    width={12}
                    height={12}
                    style={{ filter: 'brightness(0) saturate(100%) invert(100%)' }}
                  />
                </div>
              </div>
            </div>
          ))}
          
          {images.length > 0 && !loading && (
            <button
              onClick={addImage}
              className="box-border content-stretch flex flex-col gap-2.5 items-center justify-center p-[16px] hover:bg-[#f5f7f9] rounded-lg transition-colors duration-200 shrink-0"
              title="이미지 추가"
            >
              <div className="w-12 h-12">
                <Image
                  src={ICONS.ADD_GRAY}
                  alt="이미지 추가"
                  width={48}
                  height={48}
                />
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// 메인 ProfilePage 컴포넌트
export default function ProfilePage({ editMode = false }) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto p-4 sm:p-6">
      {/* 1. 나이/성별/MBTI 칸 (백엔드 미지원으로 임시 숨김) */}
      {/* <ProfileSection editMode={editMode} /> */}

      {/* 2. 관심 이벤트 유형 칸 (view 모드에서도 표시, 편집 모드에서만 수정 가능) */}
      <EventTypeContainer editMode={editMode} />

      {/* 3. 관심 태그 칸 (view 모드에서도 표시, 편집 모드에서만 수정 가능) */}
      <TagContainer editMode={editMode} />
      
      {/* 4. 갤러리 칸 (항상 표시) */}
      <GalleryContainer editMode={editMode} />

      {/* 5. 편집 모드에서만 표시되는 개인정보 수정 영역 */}
      {editMode && <PersonalInfoEdit />}
    </div>
  );
}