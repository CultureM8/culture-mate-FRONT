"use client"

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { IMAGES, ICONS } from "@/constants/path";

// Edit 아이콘 컴포넌트
function EditIcon() {
  return (
    <svg
      className="w-full h-full"
      fill="none"
      viewBox="0 0 17 17"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.5 15.2678H16M12.25 1.51777C12.5815 1.18625 13.0312 1 13.5 1C13.7321 1 13.962 1.04572 14.1765 1.13456C14.391 1.2234 14.5858 1.35361 14.75 1.51777C14.9142 1.68192 15.0444 1.8768 15.1332 2.09127C15.222 2.30575 15.2678 2.53562 15.2678 2.76777C15.2678 2.99991 15.222 3.22979 15.1332 3.44426C15.0444 3.65874 14.9142 3.85361 14.75 4.01777L4.33333 14.4344L1 15.2678L1.83333 11.9344L12.25 1.51777Z"
      />
    </svg>
  );
}

// 저장 버튼 컴포넌트
function SaveButton({ onClick }) {
  return (
    <div 
      className="bg-[#c6c8ca] rounded-lg cursor-pointer hover:bg-gray-400 transition-colors px-3 py-2 md:px-4 md:py-2"
      onClick={onClick}
    >
      <div className="flex flex-col font-medium justify-center text-white text-center">
        <p className="font-bold leading-[1.5] text-sm md:text-[16px] whitespace-pre">
          변경사항 저장
        </p>
      </div>
    </div>
  );
}

// 한줄 자기소개 입력 컴포넌트
function IntroductionInput({ introduction, setIntroduction }) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  const handleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-col justify-center text-[#26282a] text-lg md:text-[20px] text-left w-full" style={{fontFamily: 'Inter, Noto Sans KR, sans-serif', fontWeight: 500, lineHeight: 1.4}}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={introduction}
          onChange={(e) => setIntroduction(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none leading-[1.4] text-lg md:text-[20px] text-[#26282a] w-full"
          style={{fontFamily: 'Inter, Noto Sans KR, sans-serif', fontWeight: 500}}
          placeholder="한줄 자기소개를 입력해주세요"
        />
      ) : (
        <p 
          className="leading-[1.4] cursor-text hover:bg-gray-50 px-1 py-1 rounded transition-colors"
          onClick={handleClick}
        >
          {introduction || "한줄 자기소개를 입력해주세요"}
        </p>
      )}
    </div>
  );
}

// MBTI 드롭다운 컴포넌트
function MbtiDropdown({ mbti, setMbti, mbtiVisibility, setMbtiVisibility }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isVisibilityDropdownOpen, setIsVisibilityDropdownOpen] = useState(false);

  const mbtiTypes = [
    'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
    'ISTP', 'ISFP', 'INFP', 'INTP',
    'ESTP', 'ESFP', 'ENFP', 'ENTP',
    'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
  ];

  return (
    <div className="flex flex-col gap-2 w-full lg:w-40 shrink-0">
      <div className="flex flex-row gap-2 items-center relative">
        <div className="text-gray-800 text-base font-normal">
          <p>MBTI</p>
        </div>
        <div className="flex flex-row gap-2 items-center cursor-pointer" onClick={() => setIsVisibilityDropdownOpen(!isVisibilityDropdownOpen)}>
          <div className="text-[#C6C8CA] text-base font-normal">
            <p>{mbtiVisibility}</p>
          </div>
          <div className="flex items-center justify-center w-[17px] h-[16px]">
            <div className={`transition-transform duration-200 ${isVisibilityDropdownOpen ? 'rotate-180' : ''}`}>
              <Image
                src={ICONS.DOWN_GRAY}
                alt="드롭다운 화살표"
                width={17}
                height={8}
                style={{ filter: 'brightness(0) saturate(100%) invert(79%) sepia(2%) saturate(389%) hue-rotate(179deg) brightness(95%) contrast(89%)' }}
              />
            </div>
          </div>
          
          {isVisibilityDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-[100px]">
              <div className="py-1">
                <button
                  className="block w-full px-4 py-2 text-left text-base text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMbtiVisibility('공개');
                    setIsVisibilityDropdownOpen(false);
                  }}
                >
                  공개
                </button>
                <button
                  className="block w-full px-4 py-2 text-left text-base text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMbtiVisibility('비공개');
                    setIsVisibilityDropdownOpen(false);
                  }}
                >
                  비공개
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white border border-gray-300 rounded h-14 flex items-center justify-center px-4 relative">
        <div 
          className="text-gray-800 text-base font-normal cursor-pointer w-full text-center"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <p>{mbti || "MBTI 선택"}</p>
        </div>
        
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-20 max-h-48 overflow-y-auto">
            <div className="py-1">
              {mbtiTypes.map((type) => (
                <button
                  key={type}
                  className="block w-full px-4 py-2 text-left text-base text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => {
                    setMbti(type);
                    setIsDropdownOpen(false);
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 관심 이벤트 유형 컴포넌트
function EventTypeContainer({ eventTypes, setEventTypes, eventTypesVisibility, setEventTypesVisibility }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isVisibilityDropdownOpen, setIsVisibilityDropdownOpen] = useState(false);

  const availableEventTypes = [
    '뮤지컬', '영화', '연극', '전시', '클래식 / 무용', 
    '콘서트 / 페스티벌', '지역 행사', '기타'
  ];

  const addEventType = (type) => {
    if (!eventTypes.includes(type)) {
      setEventTypes([...eventTypes, type]);
    }
    setIsDropdownOpen(false);
  };

  const removeEventType = (typeToRemove) => {
    setEventTypes(eventTypes.filter(type => type !== typeToRemove));
  };

  return (
    <div className="box-border content-stretch flex flex-col gap-[9px] items-start justify-start p-0 relative w-full">
      <div className="box-border content-stretch flex flex-row gap-[9px] items-start justify-start p-0 relative shrink-0">
        <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[16px] text-left text-nowrap">
          <p className="block leading-[1.5] whitespace-pre">관심 이벤트 유형</p>
        </div>
        <div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0 cursor-pointer" onClick={() => setIsVisibilityDropdownOpen(!isVisibilityDropdownOpen)}>
          <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#c6c8ca] text-[16px] text-left text-nowrap">
            <p className="block leading-[1.5] whitespace-pre">{eventTypesVisibility}</p>
          </div>
          <div className="flex items-center justify-center relative shrink-0 w-[17px] h-[16px]">
            <div className={`transition-transform duration-200 ${isVisibilityDropdownOpen ? 'rotate-180' : ''}`}>
              <Image
                src={ICONS.DOWN_GRAY}
                alt="드롭다운 화살표"
                width={17}
                height={8}
              />
            </div>
          </div>
          
          {isVisibilityDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-[#c6c8ca] rounded shadow-lg z-10 min-w-[100px]">
              <div className="py-1">
                <button
                  className="block w-full px-4 py-2 text-left text-[16px] text-[#26282a] hover:bg-[#eef0f2] transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEventTypesVisibility('공개');
                    setIsVisibilityDropdownOpen(false);
                  }}
                >
                  공개
                </button>
                <button
                  className="block w-full px-4 py-2 text-left text-[16px] text-[#26282a] hover:bg-[#eef0f2] transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEventTypesVisibility('비공개');
                    setIsVisibilityDropdownOpen(false);
                  }}
                >
                  비공개
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-[#ffffff] box-border content-stretch flex flex-col gap-2.5 h-auto min-h-14 items-start justify-start p-[16px] relative rounded shrink-0 w-full">
        <div aria-hidden="true" className="absolute border border-[#c6c8ca] border-solid inset-0 pointer-events-none rounded" />
        
        <div className="flex flex-row flex-wrap gap-2.5 w-full">
          {eventTypes.map((type, index) => (
            <div key={index} className="bg-[#ffffff] box-border content-stretch flex flex-row gap-1 items-center justify-center px-2 py-0 relative rounded-[15px] shrink-0 h-[30px]">
              <div aria-hidden="true" className="absolute border border-[#76787a] border-solid inset-0 pointer-events-none rounded-[15px]" />
              <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#9ea0a2] text-[14px] text-left text-nowrap">
                <p className="block leading-[1.43] whitespace-pre">{type}</p>
              </div>
              <button 
                onClick={() => removeEventType(type)}
                className="ml-1 text-[#9ea0a2] hover:text-red-500 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
          
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-[#f0f0f0] box-border content-stretch flex flex-row gap-1 items-center justify-center px-2 py-0 relative rounded-[15px] shrink-0 h-[30px] border border-dashed border-[#76787a] hover:bg-[#e0e0e0] transition-colors"
            >
              <span className="text-[#76787a] text-[14px]">+ 추가</span>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-[#c6c8ca] rounded shadow-lg z-20 min-w-[150px]">
                <div className="py-1">
                  {availableEventTypes.filter(type => !eventTypes.includes(type)).map((type) => (
                    <button
                      key={type}
                      className="block w-full px-4 py-2 text-left text-[14px] text-[#26282a] hover:bg-[#eef0f2] transition-colors duration-200"
                      onClick={() => addEventType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 관심 태그 입력 컴포넌트
function TagInput({ tags, setTags, tagsVisibility, setTagsVisibility }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  const handleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedValue = inputValue.trim();
      if (trimmedValue) {
        const formattedTag = trimmedValue.startsWith('#') ? trimmedValue : `#${trimmedValue}`;
        if (!tags.includes(formattedTag)) {
          setTags([...tags, formattedTag]);
        }
        setInputValue('');
      }
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const displayText = tags.length > 0 ? tags.join(' ') : '관심 태그를 입력해주세요 (예: #영화 #음악)';

  return (
    <div className="box-border content-stretch flex flex-col gap-[9px] items-start justify-start p-0 relative w-full">
      <div className="box-border content-stretch flex flex-row gap-[9px] items-start justify-start p-0 relative shrink-0">
        <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[16px] text-left text-nowrap">
          <p className="block leading-[1.5] whitespace-pre">관심 태그</p>
        </div>
        
        <div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0 cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#c6c8ca] text-[16px] text-left text-nowrap">
            <p className="block leading-[1.5] whitespace-pre">{tagsVisibility}</p>
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
                    setTagsVisibility('공개');
                    setIsDropdownOpen(false);
                  }}
                >
                  공개
                </button>
                <button
                  className="block w-full px-4 py-2 text-left text-[16px] text-[#26282a] hover:bg-[#eef0f2] transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTagsVisibility('비공개');
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
      
      <div 
        className="bg-[#ffffff] box-border content-stretch flex flex-col gap-2.5 items-start justify-start p-[16px] relative rounded shrink-0 w-full border border-[#c6c8ca] min-h-[100px] cursor-text"
        onClick={handleClick}
      >
        {isEditing ? (
          <div className="w-full">
            <div className="flex flex-wrap gap-2.5 mb-2">
              {tags.map((tag, index) => (
                <div key={index} className="bg-[#ffffff] box-border content-stretch flex flex-row gap-1 items-center justify-center px-2 py-0 relative rounded-[15px] shrink-0 h-[30px]">
                  <div aria-hidden="true" className="absolute border border-[#76787a] border-solid inset-0 pointer-events-none rounded-[15px]" />
                  <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#9ea0a2] text-[14px] text-left text-nowrap">
                    <p className="block leading-[1.43] whitespace-pre">{tag}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(tag);
                    }}
                    className="ml-1 text-[#9ea0a2] hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                setIsEditing(false);
                setInputValue('');
              }}
              className="w-full border-none outline-none text-[#76787a] text-[16px] bg-transparent"
              placeholder="태그를 입력하고 Enter를 누르세요"
            />
          </div>
        ) : (
          <div className="w-full">
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {tags.map((tag, index) => (
                  <div key={index} className="bg-[#ffffff] box-border content-stretch flex flex-row gap-1 items-center justify-center px-2 py-0 relative rounded-[15px] shrink-0 h-[30px]">
                    <div aria-hidden="true" className="absolute border border-[#76787a] border-solid inset-0 pointer-events-none rounded-[15px]" />
                    <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#9ea0a2] text-[14px] text-left text-nowrap">
                      <p className="block leading-[1.43] whitespace-pre">{tag}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#76787a] text-[16px] leading-[1.5]">
                관심 태그를 입력해주세요 (예: #영화 #음악)
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 갤러리 컴포넌트
function GalleryContainer({ images, setImages, galleryVisibility, setGalleryVisibility }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    
    event.target.value = '';
  };

  const addImage = () => {
    document.getElementById('gallery-file-input').click();
  };

  const removeImage = (idToRemove) => {
    setImages(images.filter(img => img.id !== idToRemove));
  };

  return (
    <div className="box-border content-stretch flex flex-col gap-[9px] items-start justify-start p-0 relative w-full">
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
        <div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0 cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#c6c8ca] text-[16px] text-left text-nowrap">
            <p className="block leading-[1.5] whitespace-pre">{galleryVisibility}</p>
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
                    setGalleryVisibility('공개');
                    setIsDropdownOpen(false);
                  }}
                >
                  공개
                </button>
                <button
                  className="block w-full px-4 py-2 text-left text-[16px] text-[#26282a] hover:bg-[#eef0f2] transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setGalleryVisibility('비공개');
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

      <div className="bg-[#ffffff] box-border content-stretch flex flex-col gap-2.5 items-start justify-center p-[16px] relative rounded shrink-0 w-full min-h-[200px] sm:min-h-[232px]">
        <div className="absolute border border-[#c6c8ca] border-solid inset-0 pointer-events-none rounded" />
        
        <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start overflow-x-auto p-0 relative shrink-0 w-full h-full scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
              {image.src && (
                <img
                  src={image.src}
                  alt={image.name || "업로드된 이미지"}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
              
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

// 메인 컴포넌트
export default function MyPageEdit() {
  // 프로필 배경 및 이미지 상태
  const [nickname, setNickname] = useState("사용자 별명");
  const [score, setScore] = useState(50);
  const [introduction, setIntroduction] = useState("한줄 자기소개를 입력해주세요");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [isHoveringBackground, setIsHoveringBackground] = useState(false);
  const [isHoveringProfile, setIsHoveringProfile] = useState(false);

  // 사용자 정보 상태
  const [age] = useState(25); // 고정값
  const [gender] = useState("여"); // 고정값
  const [mbti, setMbti] = useState("ENFP");
  
  // 공개/비공개 설정
  const [ageVisibility, setAgeVisibility] = useState('비공개');
  const [genderVisibility, setGenderVisibility] = useState('비공개');
  const [mbtiVisibility, setMbtiVisibility] = useState('공개');
  const [eventTypesVisibility, setEventTypesVisibility] = useState('공개');
  const [tagsVisibility, setTagsVisibility] = useState('공개');
  const [galleryVisibility, setGalleryVisibility] = useState('공개');

  // 드롭다운 상태
  const [ageDropdown, setAgeDropdown] = useState(false);
  const [genderDropdown, setGenderDropdown] = useState(false);

  // 관심 이벤트 및 태그 상태
  const [eventTypes, setEventTypes] = useState(['영화', '연극', '전시', '콘서트 / 페스티벌']);
  const [tags, setTags] = useState(['#산책', '#맛집탐방', '#전시회', '#영화관람']);
  const [images, setImages] = useState([]);

  // 파일 입력 ref
  const backgroundFileRef = useRef(null);
  const profileFileRef = useRef(null);

  // 이미지 업로드 핸들러
  const handleBackgroundImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  const handleBackgroundEditClick = () => {
    backgroundFileRef.current?.click();
  };

  const handleProfileEditClick = () => {
    profileFileRef.current?.click();
  };

  const handleProfileDelete = () => {
    setProfileImage(null);
  };

  // 저장 핸들러
  const handleSave = () => {
    const userData = {
      nickname,
      score,
      introduction,
      backgroundImage,
      profileImage,
      age,
      gender,
      mbti,
      ageVisibility,
      genderVisibility,
      mbtiVisibility,
      eventTypes,
      eventTypesVisibility,
      tags,
      tagsVisibility,
      images,
      galleryVisibility,
      updatedAt: new Date().toISOString()
    };

    // 로컬 스토리지에 저장 (실제로는 API 호출)
    localStorage.setItem('userProfile', JSON.stringify(userData));
    
    alert('변경사항이 저장되었습니다!');
    console.log('저장된 데이터:', userData);
  };

  return (
    <div className="w-full bg-white">
      {/* 숨겨진 파일 입력들 */}
      <input
        type="file"
        ref={backgroundFileRef}
        onChange={handleBackgroundImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={profileFileRef}
        onChange={handleProfileImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* MyPageBG 부분 */}
      <div className="w-full max-w-[1200px] h-auto min-h-[450px] mx-auto bg-white border-b border-gray-200 overflow-hidden">
        {/* 프로필 배경 섹션 */}
        <div 
          className="bg-gray-100 flex flex-col h-[280px] sm:h-[240px] md:h-[280px] items-end justify-end p-[10px] w-full relative"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* 프로필 배경 수정 버튼 */}
          <div 
            className="flex items-center gap-2 text-[#c6c8ca] text-sm md:text-base z-10 cursor-pointer"
            onMouseEnter={() => setIsHoveringBackground(true)}
            onMouseLeave={() => setIsHoveringBackground(false)}
            onClick={handleBackgroundEditClick}
            style={{
              opacity: !backgroundImage || isHoveringBackground ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out'
            }}
          >
            <span>프로필 배경 수정</span>
            <div className="w-4 h-4 md:w-5 md:h-5 cursor-pointer text-[#c6c8ca]">
              <EditIcon />
            </div>
          </div>

          {/* 프로필 이미지 영역 */}
          <div 
            className="absolute left-4 sm:left-6 md:left-8 top-[180px] sm:top-[160px] md:top-[212px] 
                       w-32 h-32 sm:w-40 sm:h-40 md:w-[200px] md:h-[200px] 
                       rounded-full overflow-hidden z-20"
            style={{
              backgroundColor: profileImage ? 'transparent' : '#C6C8CA',
              backgroundImage: profileImage ? `url(${profileImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            onMouseEnter={() => setIsHoveringProfile(true)}
            onMouseLeave={() => setIsHoveringProfile(false)}
          >
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              {!profileImage && (
                <div 
                  className="flex items-center text-[#26282a] text-sm md:text-base cursor-pointer mb-1 md:mb-2 font-normal" 
                  style={{fontFamily: 'Inter, Noto Sans KR, sans-serif', gap: '4px'}}
                  onClick={handleProfileEditClick}
                >
                  <span>프로필 변경</span>
                  <div className="w-3 h-3 md:w-[15px] md:h-[14.27px] text-[#26282a]">
                    <EditIcon />
                  </div>
                </div>
              )}

              {profileImage && isHoveringProfile && (
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <div 
                    className="flex items-center text-[#26282a] text-sm md:text-base cursor-pointer mb-1 md:mb-2 font-normal" 
                    style={{fontFamily: 'Inter, Noto Sans KR, sans-serif', gap: '4px'}}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProfileEditClick();
                    }}
                  >
                    <span>프로필 변경</span>
                    <div className="w-3 h-3 md:w-[15px] md:h-[14.27px] text-[#26282a]">
                      <EditIcon />
                    </div>
                  </div>
                  
                  <div 
                    className="flex items-center text-[#26282a] text-sm md:text-base cursor-pointer font-normal" 
                    style={{fontFamily: 'Inter, Noto Sans KR, sans-serif', gap: '4px'}}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProfileDelete();
                    }}
                  >
                    <span>프로필 삭제</span>
                    <div className="w-3 h-3 md:w-[14px] md:h-[14px] text-[#26282a]">
                      <svg className="w-full h-full" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 1L1 11M1 1L11 11" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 프로필 정보 섹션 */}
        <div className="flex flex-col h-auto min-h-[170px] items-center md:items-end justify-start px-4 md:px-8 py-4 w-full">
          <div className="w-full max-w-[928px] min-h-[60px] p-2 md:p-4 flex flex-col items-start gap-6 sm:gap-8 md:gap-5">
            {/* 사용자 별명과 동행 점수 */}
            <div className="flex flex-col xl:flex-row items-end xl:items-center w-full gap-4 sm:gap-6 xl:gap-0">
              <div className="flex flex-col font-semibold justify-center text-[#26282a] text-xl sm:text-2xl xl:text-[28px] text-right xl:text-left whitespace-nowrap self-end xl:self-start">
                <p className="leading-[1.28] whitespace-nowrap">{nickname}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row xl:flex-row items-end sm:items-center xl:items-center justify-start w-full xl:ml-6 gap-4 sm:gap-6 xl:gap-0">
                <div className="flex flex-col font-normal justify-center text-[#26282a] text-sm xl:text-base text-right xl:text-left sm:mr-4 xl:mr-8 self-end xl:self-start">
                  <p className="leading-[1.5]">동행 점수</p>
                </div>
                
                <div className="flex flex-col items-start justify-center relative w-full sm:max-w-[300px] xl:max-w-[458px]">
                  <div className="h-2 w-full bg-[#eef0f2] rounded-[5px] relative">
                    <div 
                      className="h-2 bg-[#ffc37f] rounded-[5px] absolute top-0 left-0 transition-all duration-300"
                      style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
                    />
                    
                    <div 
                      className="absolute -top-6 text-[#26282a] text-sm xl:text-base transform -translate-x-1/2 transition-all duration-300"
                      style={{ 
                        left: `${Math.min(Math.max(score, 0), 100)}%`,
                        minWidth: 'max-content'
                      }}
                    >
                      <p className="leading-[1.5]">{score}점</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-0 sm:ml-4 xl:ml-12 self-end xl:self-center">
                  <SaveButton onClick={handleSave} />
                </div>
              </div>
            </div>

            {/* 한줄 자기소개 */}
            <IntroductionInput 
              introduction={introduction} 
              setIntroduction={setIntroduction} 
            />
          </div>
        </div>
      </div>

      {/* MyPageDetail 부분 */}
      <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto p-4 sm:p-6">
        {/* 나이/성별/MBTI 섹션 */}
        <div className="flex flex-col lg:flex-row gap-4 items-start justify-start w-full">
          {/* 나이 섹션 (고정값) */}
          <div className="flex flex-col gap-2 w-full lg:w-40 shrink-0">
            <div className="flex flex-row gap-2 items-center relative">
              <div className="text-gray-800 text-base font-normal">
                <p>나이</p>
              </div>
              <div className="flex flex-row gap-2 items-center cursor-pointer" onClick={() => setAgeDropdown(!ageDropdown)}>
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
            <div className="bg-gray-100 border border-gray-300 rounded h-14 flex items-center justify-center px-4">
              <div className="text-gray-600 text-base font-normal">
                <p>{age} 세</p>
              </div>
            </div>
          </div>

          {/* 성별 섹션 (고정값) */}
          <div className="flex flex-col gap-2 w-full lg:w-40 shrink-0">
            <div className="flex flex-row gap-2 items-center relative">
              <div className="text-gray-800 text-base font-normal">
                <p>성별</p>
              </div>
              <div className="flex flex-row gap-2 items-center cursor-pointer" onClick={() => setGenderDropdown(!genderDropdown)}>
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
            <div className="bg-gray-100 border border-gray-300 rounded h-14 flex items-center justify-center px-4">
              <div className="text-gray-600 text-base font-normal">
                <p>{gender}</p>
              </div>
            </div>
          </div>

          {/* MBTI 섹션 (수정 가능) */}
          <MbtiDropdown 
            mbti={mbti} 
            setMbti={setMbti}
            mbtiVisibility={mbtiVisibility}
            setMbtiVisibility={setMbtiVisibility}
          />
        </div>
        
        {/* 관심 이벤트 유형 */}
        <EventTypeContainer 
          eventTypes={eventTypes}
          setEventTypes={setEventTypes}
          eventTypesVisibility={eventTypesVisibility}
          setEventTypesVisibility={setEventTypesVisibility}
        />
        
        {/* 관심 태그 */}
        <TagInput 
          tags={tags}
          setTags={setTags}
          tagsVisibility={tagsVisibility}
          setTagsVisibility={setTagsVisibility}
        />
        
        {/* 갤러리 */}
        <GalleryContainer 
          images={images}
          setImages={setImages}
          galleryVisibility={galleryVisibility}
          setGalleryVisibility={setGalleryVisibility}
        />
      </div>
    </div>
  );
}