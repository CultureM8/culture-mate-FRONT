"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { ICONS } from '@/constants/path';

// ProfileSection 컴포넌트
function ProfileSection() {
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
    </div>
  );
}

// EventTypeContainer 컴포넌트
function EventTypeContainer() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visibility, setVisibility] = useState('공개');

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
        <div className="bg-[#ffffff] box-border content-stretch flex flex-row gap-1 items-center justify-center px-2 py-0 relative rounded-[15px] shrink-0 h-[30px]" data-name="Event type value">
          <div aria-hidden="true" className="absolute border border-[#76787a] border-solid inset-0 pointer-events-none rounded-[15px]" />
          <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#9ea0a2] text-[14px] text-left text-nowrap">
            <p className="block leading-[1.43] whitespace-pre">영화</p>
          </div>
        </div>
        <div className="bg-[#ffffff] box-border content-stretch flex flex-row gap-1 items-center justify-center px-2 py-0 relative rounded-[15px] shrink-0 h-[30px]" data-name="Event type value">
          <div aria-hidden="true" className="absolute border border-[#76787a] border-solid inset-0 pointer-events-none rounded-[15px]" />
          <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#9ea0a2] text-[14px] text-left text-nowrap">
            <p className="block leading-[1.43] whitespace-pre">연극</p>
          </div>
        </div>
        <div className="bg-[#ffffff] box-border content-stretch flex flex-row gap-1 items-center justify-center px-2 py-0 relative rounded-[15px] shrink-0 h-[30px]" data-name="Event type value">
          <div aria-hidden="true" className="absolute border border-[#76787a] border-solid inset-0 pointer-events-none rounded-[15px]" />
          <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#9ea0a2] text-[14px] text-left text-nowrap">
            <p className="block leading-[1.43] whitespace-pre">전시</p>
          </div>
        </div>
        <div className="bg-[#ffffff] box-border content-stretch flex flex-row gap-1 items-center justify-center px-2 py-0 relative rounded-[15px] shrink-0 h-[30px]" data-name="Event type value">
          <div aria-hidden="true" className="absolute border border-[#76787a] border-solid inset-0 pointer-events-none rounded-[15px]" />
          <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#9ea0a2] text-[14px] text-left text-nowrap">
            <p className="block leading-[1.43] whitespace-pre">콘서트/페스티벌</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// TagContainer 컴포넌트
function TagContainer({ 
  label = "관심 태그",
  tags = ["산책", "맛집탐방", "전시회", "영화관람", "혼자여행", "사진찍기", "등산", "카페투어", "드라이브", "야경감상", "음악감상", "플리공유", "방탈출", "보드게임", "재즈공연", "클래식음악", "요가", "러닝", "자전거타기", "동물사랑", "플리마켓", "디저트투어", "서점데이트", "도서모임", "책읽기", "소극장연극", "글쓰기", "게임파티", "인디밴드", "수공예"]
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visibility, setVisibility] = useState('공개');

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
        {tags.map((tag, index) => (
          <div
            key={index}
            className="bg-[#ffffff] box-border content-stretch flex flex-row gap-1 items-center justify-center px-2 py-0 relative rounded-[15px] shrink-0 h-[30px]"
          >
            <div aria-hidden="true" className="absolute border border-[#76787a] border-solid inset-0 pointer-events-none rounded-[15px]" />
            <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#9ea0a2] text-[14px] text-left text-nowrap">
              <p className="block leading-[1.43] whitespace-pre">#{tag}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// GalleryContainer 컴포넌트
function GalleryContainer() {
  const [images, setImages] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visibility, setVisibility] = useState('공개');

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newId = Math.max(...images.map(img => img.id), 0) + Date.now();
          setImages(prevImages => [...prevImages, { 
            id: newId, 
            src: e.target.result,
            name: file.name 
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    // 파일 입력 초기화 (같은 파일을 다시 선택할 수 있도록)
    event.target.value = '';
  };

  const addImage = () => {
    // 숨겨진 파일 입력 요소 클릭
    document.getElementById('gallery-file-input').click();
  };

  const removeImage = (idToRemove) => {
    setImages(images.filter(img => img.id !== idToRemove));
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
        
        <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full h-full overflow-x-auto overflow-y-hidden scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
          {images.length === 0 && (
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
                className="absolute top-2 right-2 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity duration-200" 
                onClick={() => removeImage(image.id)}
                title="이미지 삭제"
              >
                <div className="w-[16px] h-[16px]">
                  <Image
                    src={ICONS.X}
                    alt="삭제"
                    width={16}
                    height={16}
                    style={{ filter: 'brightness(0) saturate(100%) invert(100%)' }}
                  />
                </div>
              </div>
            </div>
          ))}
          
          {images.length > 0 && (
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
export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto p-4 sm:p-6">
      {/* 1. 나이/성별/MBTI 칸 */}
      <ProfileSection />
      
      {/* 2. 관심 이벤트 유형 칸 */}
      <EventTypeContainer />
      
      {/* 3. 관심 태그 칸 */}
      <TagContainer />
      
      {/* 4. 갤러리 칸 */}
      <GalleryContainer />
    </div>
  );
}