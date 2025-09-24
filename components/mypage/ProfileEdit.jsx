"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IMAGES, ICONS, ROUTES } from "@/constants/path";
import useLogin from "@/hooks/useLogin";
import { getMemberDetail, updateMemberWithImages } from "@/lib/api";

// 저장 버튼 컴포넌트
function SaveButton({ onClick, isLoading = false }) {
  return (
    <div
      className={`rounded-lg transition-colors px-3 py-2 md:px-4 md:py-2 ${
        isLoading
          ? 'bg-gray-300 cursor-not-allowed'
          : 'bg-[#c6c8ca] cursor-pointer hover:bg-gray-400'
      }`}
      onClick={isLoading ? undefined : onClick}>
      <div className="flex flex-col font-medium justify-center text-white text-center">
        <p className="font-bold leading-[1.5] text-sm md:text-[16px] whitespace-pre">
          {isLoading ? '저장 중...' : '변경사항 저장'}
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
    if (e.key === "Enter") {
      setIsEditing(false);
    }
  };

  return (
    <div
      className="flex flex-col justify-center text-[#26282a] text-lg md:text-[20px] text-left w-full"
      style={{
        fontFamily: "Inter, Noto Sans KR, sans-serif",
        fontWeight: 500,
        lineHeight: 1.4,
      }}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={introduction}
          onChange={(e) => setIntroduction(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none leading-[1.4] text-lg md:text-[20px] text-[#26282a] w-full p-0 m-0"
          style={{
            fontFamily: "Inter, Noto Sans KR, sans-serif",
            fontWeight: 500,
          }}
          placeholder="한줄 자기소개를 입력해주세요"
        />
      ) : (
        <p
          className="leading-[1.4] cursor-text hover:bg-gray-50 rounded transition-colors p-0 m-0"
          onClick={handleClick}
          style={{
            fontFamily: "Inter, Noto Sans KR, sans-serif",
            fontWeight: 500,
          }}>
          {introduction || "한줄 자기소개를 입력해주세요"}
        </p>
      )}
    </div>
  );
}

// MBTI 드롭다운 컴포넌트
function MbtiDropdown({ mbti, setMbti, mbtiVisibility, setMbtiVisibility }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isVisibilityDropdownOpen, setIsVisibilityDropdownOpen] =
    useState(false);

  const mbtiTypes = [
    "ISTJ",
    "ISFJ",
    "INFJ",
    "INTJ",
    "ISTP",
    "ISFP",
    "INFP",
    "INTP",
    "ESTP",
    "ESFP",
    "ENFP",
    "ENTP",
    "ESTJ",
    "ESFJ",
    "ENFJ",
    "ENTJ",
  ];

  return (
    <div className="flex flex-col gap-2 w-full lg:w-40 shrink-0">
      <div className="flex flex-row gap-2 items-center relative">
        <div className="text-gray-800 text-base font-normal">
          <p>MBTI</p>
        </div>
        <div
          className="flex flex-row gap-2 items-center cursor-pointer"
          onClick={() =>
            setIsVisibilityDropdownOpen(!isVisibilityDropdownOpen)
          }>
          <div className="text-[#C6C8CA] text-base font-normal">
            <p>{mbtiVisibility}</p>
          </div>
          <div className="flex items-center justify-center w-[17px] h-[16px]">
            <div
              className={`transition-transform duration-200 ${
                isVisibilityDropdownOpen ? "rotate-180" : ""
              }`}>
              <Image
                src={ICONS.DOWN_GRAY}
                alt="드롭다운 화살표"
                width={17}
                height={8}
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
                    setMbtiVisibility("공개");
                    setIsVisibilityDropdownOpen(false);
                  }}>
                  공개
                </button>
                <button
                  className="block w-full px-4 py-2 text-left text-base text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMbtiVisibility("비공개");
                    setIsVisibilityDropdownOpen(false);
                  }}>
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
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
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
                  }}>
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
function EventTypeContainer({
  eventTypes,
  setEventTypes,
  eventTypesVisibility,
  setEventTypesVisibility,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isVisibilityDropdownOpen, setIsVisibilityDropdownOpen] =
    useState(false);

  const availableEventTypes = [
    "뮤지컬",
    "영화",
    "연극",
    "전시",
    "클래식 / 무용",
    "콘서트 / 페스티벌",
    "지역 행사",
    "기타",
  ];

  const addEventType = (type) => {
    if (!eventTypes.includes(type)) {
      setEventTypes([...eventTypes, type]);
    }
    setIsDropdownOpen(false);
  };

  const removeEventType = (typeToRemove) => {
    setEventTypes(eventTypes.filter((type) => type !== typeToRemove));
  };

  return (
    <div className="box-border content-stretch flex flex-col gap-[9px] items-start justify-start p-0 relative w-full">
      <div className="box-border content-stretch flex flex-row gap-[9px] items-start justify-start p-0 relative shrink-0">
        <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[16px] text-left text-nowrap">
          <p className="block leading-[1.5] whitespace-pre">관심 이벤트 유형</p>
        </div>
        <div
          className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0 cursor-pointer"
          onClick={() =>
            setIsVisibilityDropdownOpen(!isVisibilityDropdownOpen)
          }>
          <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#c6c8ca] text-[16px] text-left text-nowrap">
            <p className="block leading-[1.5] whitespace-pre">
              {eventTypesVisibility}
            </p>
          </div>
          <div className="flex items-center justify-center relative shrink-0 w-[17px] h-[16px]">
            <div
              className={`transition-transform duration-200 ${
                isVisibilityDropdownOpen ? "rotate-180" : ""
              }`}>
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
                    setEventTypesVisibility("공개");
                    setIsVisibilityDropdownOpen(false);
                  }}>
                  공개
                </button>
                <button
                  className="block w-full px-4 py-2 text-left text-[16px] text-[#26282a] hover:bg-[#eef0f2] transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEventTypesVisibility("비공개");
                    setIsVisibilityDropdownOpen(false);
                  }}>
                  비공개
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#ffffff] box-border content-stretch flex flex-col gap-2.5 h-auto min-h-14 items-start justify-start p-[16px] relative rounded shrink-0 w-full">
        <div
          aria-hidden="true"
          className="absolute border border-[#c6c8ca] border-solid inset-0 pointer-events-none rounded"
        />

        <div className="flex flex-row flex-wrap gap-2.5 w-full">
          {eventTypes.map((type, index) => (
            <div
              key={index}
              className="bg-[#ffffff] box-border content-stretch flex flex-row gap-1 items-center justify-center px-2 py-0 relative rounded-[15px] shrink-0 h-[30px]">
              <div
                aria-hidden="true"
                className="absolute border border-[#76787a] border-solid inset-0 pointer-events-none rounded-[15px]"
              />
              <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#9ea0a2] text-[14px] text-left text-nowrap">
                <p className="block leading-[1.43] whitespace-pre">{type}</p>
              </div>
              <button
                onClick={() => removeEventType(type)}
                className="ml-1 text-[#9ea0a2] hover:text-red-500 transition-colors">
                ×
              </button>
            </div>
          ))}

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-[#f0f0f0] box-border content-stretch flex flex-row gap-1 items-center justify-center px-2 py-0 relative rounded-[15px] shrink-0 h-[30px] border border-dashed border-[#76787a] hover:bg-[#e0e0e0] transition-colors">
              <span className="text-[#76787a] text-[14px]">+ 추가</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-[#c6c8ca] rounded shadow-lg z-20 min-w-[150px]">
                <div className="py-1">
                  {availableEventTypes
                    .filter((type) => !eventTypes.includes(type))
                    .map((type) => (
                      <button
                        key={type}
                        className="block w-full px-4 py-2 text-left text-[14px] text-[#26282a] hover:bg-[#eef0f2] transition-colors duration-200"
                        onClick={() => addEventType(type)}>
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
  const [inputValue, setInputValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  const handleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmedValue = inputValue.trim();
      if (trimmedValue) {
        const formattedTag = trimmedValue.startsWith("#")
          ? trimmedValue
          : `#${trimmedValue}`;
        if (!tags.includes(formattedTag)) {
          setTags([...tags, formattedTag]);
        }
        setInputValue("");
      }
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="box-border content-stretch flex flex-col gap-[9px] items-start justify-start p-0 relative w-full">
      <div className="box-border content-stretch flex flex-row gap-[9px] items-start justify-start p-0 relative shrink-0">
        <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[16px] text-left text-nowrap">
          <p className="block leading-[1.5] whitespace-pre">관심 태그</p>
        </div>

        <div
          className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0 cursor-pointer"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#c6c8ca] text-[16px] text-left text-nowrap">
            <p className="block leading-[1.5] whitespace-pre">
              {tagsVisibility}
            </p>
          </div>

          <div className="flex items-center justify-center relative shrink-0 w-[17px] h-[16px]">
            <div
              className={`transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}>
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
                    setTagsVisibility("공개");
                    setIsDropdownOpen(false);
                  }}>
                  공개
                </button>
                <button
                  className="block w-full px-4 py-2 text-left text-[16px] text-[#26282a] hover:bg-[#eef0f2] transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTagsVisibility("비공개");
                    setIsDropdownOpen(false);
                  }}>
                  비공개
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className="bg-[#ffffff] box-border content-stretch flex flex-col gap-2.5 items-start justify-start p-[16px] relative rounded shrink-0 w-full border border-[#c6c8ca] min-h-[100px] cursor-text"
        onClick={handleClick}>
        {isEditing ? (
          <div className="w-full">
            <div className="flex flex-wrap gap-2.5 mb-2">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="bg-[#ffffff] box-border content-stretch flex flex-row gap-1 items-center justify-center px-2 py-0 relative rounded-[15px] shrink-0 h-[30px]">
                  <div
                    aria-hidden="true"
                    className="absolute border border-[#76787a] border-solid inset-0 pointer-events-none rounded-[15px]"
                  />
                  <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#9ea0a2] text-[14px] text-left text-nowrap">
                    <p className="block leading-[1.43] whitespace-pre">{tag}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(tag);
                    }}
                    className="ml-1 text-[#9ea0a2] hover:text-red-500 transition-colors">
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
                setInputValue("");
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
                  <div
                    key={index}
                    className="bg-[#ffffff] box-border content-stretch flex flex-row gap-1 items-center justify-center px-2 py-0 relative rounded-[15px] shrink-0 h-[30px]">
                    <div
                      aria-hidden="true"
                      className="absolute border border-[#76787a] border-solid inset-0 pointer-events-none rounded-[15px]"
                    />
                    <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#9ea0a2] text-[14px] text-left text-nowrap">
                      <p className="block leading-[1.43] whitespace-pre">
                        {tag}
                      </p>
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
function GalleryContainer({
  images,
  setImages,
  galleryVisibility,
  setGalleryVisibility,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newId = `${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          setImages((prevImages) => [
            ...prevImages,
            {
              id: newId,
              src: e.target.result,
              name: file.name,
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });

    event.target.value = "";
  };

  const addImage = () => {
    document.getElementById("gallery-file-input").click();
  };

  const removeImage = (idToRemove) => {
    setImages(images.filter((img) => img.id !== idToRemove));
  };

  return (
    <div className="box-border content-stretch flex flex-col gap-[9px] items-start justify-start p-0 relative w-full">
      <input
        id="gallery-file-input"
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />

      <div className="box-border content-stretch flex flex-row gap-[9px] items-start justify-start p-0 relative shrink-0">
        <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#26282a] text-[16px] text-left text-nowrap">
          <p className="block leading-[1.5] whitespace-pre">갤러리</p>
        </div>
        <div
          className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0 cursor-pointer"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#c6c8ca] text-[16px] text-left text-nowrap">
            <p className="block leading-[1.5] whitespace-pre">
              {galleryVisibility}
            </p>
          </div>
          <div className="flex items-center justify-center relative shrink-0 w-[17px] h-[16px]">
            <div
              className={`transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}>
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
                    setGalleryVisibility("공개");
                    setIsDropdownOpen(false);
                  }}>
                  공개
                </button>
                <button
                  className="block w-full px-4 py-2 text-left text-[16px] text-[#26282a] hover:bg-[#eef0f2] transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setGalleryVisibility("비공개");
                    setIsDropdownOpen(false);
                  }}>
                  비공개
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#ffffff] box-border content-stretch flex flex-col gap-2.5 items-start justify-center p-[16px] relative rounded shrink-0 w-full min-h-[200px] sm:min-h-[232px]">
        <div className="absolute border border-[#c6c8ca] border-solid inset-0 pointer-events-none rounded" />

        <div
          className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full h-full overflow-x-auto overflow-y-hidden gallery-scroll-container"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "transparent transparent",
          }}
          onMouseEnter={(e) => {
            if (window.innerWidth >= 768) {
              e.target.style.scrollbarColor = "#F3F4F6 transparent";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.scrollbarColor = "transparent transparent";
          }}>
          {images.length === 0 && (
            <button
              onClick={addImage}
              className="box-border content-stretch flex flex-col gap-2.5 items-center justify-center p-[16px] hover:bg-[#f5f7f9] rounded-lg transition-colors duration-200"
              title="이미지 추가">
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
              className="bg-[#eef0f2] box-border content-stretch flex flex-col gap-2.5 items-center justify-center p-0 relative rounded-lg shrink-0 w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] hover:bg-[#e0e2e4] transition-colors duration-200 overflow-hidden">
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
                title="이미지 삭제">
                <div className="w-[16px] h-[16px]">
                  <Image src={ICONS.X} alt="삭제" width={16} height={16} />
                </div>
              </div>
            </div>
          ))}

          {images.length > 0 && (
            <button
              onClick={addImage}
              className="box-border content-stretch flex flex-col gap-2.5 items-center justify-center p-[16px] hover:bg-[#f5f7f9] rounded-lg transition-colors duration-200 shrink-0"
              title="이미지 추가">
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

        {/* 갤러리 스크롤바 스타일 */}
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
              background-color: #f3f4f6;
            }

            .gallery-scroll-container::-webkit-scrollbar-thumb:hover {
              background-color: #eef0f2;
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
    </div>
  );
}

// 메인 컴포넌트 - 본인 프로필 편집만 가능 (JWT 인증 기반)
export default function MyPageEdit() {
  const router = useRouter();
  const { user } = useLogin();

  // 프로필 배경 및 이미지 상태
  const [nickname, setNickname] = useState("사용자 별명");
  const [score, setScore] = useState(50);
  const [introduction, setIntroduction] =
    useState("한줄 자기소개를 입력해주세요");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [isHoveringBackground, setIsHoveringBackground] = useState(false);
  const [isHoveringProfile, setIsHoveringProfile] = useState(false);

  // 실제 파일 객체 상태 (API 전송용)
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [backgroundImageFile, setBackgroundImageFile] = useState(null);

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  // 파일 입력 ref
  const profileFileRef = useRef(null);
  const backgroundFileRef = useRef(null);

  // 사용자 정보 상태
  // const [age] = useState(25); // 고정값 - 백엔드에서 관리하지 않음 (추후 구현 예정)
  // const [gender] = useState("여"); // 고정값 - 백엔드에서 관리하지 않음 (추후 구현 예정)
  const [mbti, setMbti] = useState("ENFP");

  useEffect(() => {
    if (user?.id) {
      // 자신의 정보 조회 (ID 없이 호출)
      getMemberDetail()
        .then((data) => {
          setNickname(data.nickname || "");
          setIntroduction(data.intro || "");
          setMbti(data.mbti || "");
        })
        .catch((error) => {
          console.error("Failed to fetch member details:", error);
        });
    }
  }, [user]);

  // 공개/비공개 설정
  // const [ageVisibility, setAgeVisibility] = useState("비공개"); // 백엔드 미관리
  // const [genderVisibility, setGenderVisibility] = useState("비공개"); // 백엔드 미관리
  const [mbtiVisibility, setMbtiVisibility] = useState("공개");
  const [eventTypesVisibility, setEventTypesVisibility] = useState("공개");
  const [tagsVisibility, setTagsVisibility] = useState("공개");
  const [galleryVisibility, setGalleryVisibility] = useState("공개");

  // 드롭다운 상태
  // const [ageDropdown, setAgeDropdown] = useState(false); // 백엔드 미관리
  // const [genderDropdown, setGenderDropdown] = useState(false); // 백엔드 미관리

  // 관심 이벤트 및 태그 상태
  const [eventTypes, setEventTypes] = useState([
    "영화",
    "연극",
    "전시",
    "콘서트 / 페스티벌",
  ]);
  const [tags, setTags] = useState([
    "#산책",
    "#맛집탐방",
    "#전시회",
    "#영화관람",
  ]);
  const [images, setImages] = useState([]);

  // 하단 개인정보 편집 상태
  const [formData, setFormData] = useState({
    userId: "UserID", // DB에서 불러올 값
    newPassword: "",
    confirmPassword: "",
    email: "something@somewhere.com",
    verificationCode: "",
    address: "무슨로 00길 00 (000아파트)",
    detailAddress: "무슨아파트 몇동 몇호",
  });

  const [validationState, setValidationState] = useState({
    isNicknameChecked: false,
    isEmailVerificationSent: false,
    isEmailVerified: false,
    nicknameError: "",
    passwordValidation: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    },
  });

  const [showAddressModal, setShowAddressModal] = useState(false);

  // 파일 입력 ref
  const backgroundFileRef = useRef(null);
  const profileFileRef = useRef(null);

  // 비밀번호 정규식
  const passwordRegex = {
    length: /.{8,}/,
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /\d/,
    special: /[!@#$^&*()+-[]{}:|,.?]/,
  };

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
    event.target.value = "";
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
    event.target.value = "";
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

  // 개인정보 편집 핸들러들
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 비밀번호 실시간 유효성 검사
    if (field === "newPassword") {
      setValidationState((prev) => ({
        ...prev,
        passwordValidation: {
          length: passwordRegex.length.test(value),
          uppercase: passwordRegex.uppercase.test(value),
          lowercase: passwordRegex.lowercase.test(value),
          number: passwordRegex.number.test(value),
          special: passwordRegex.special.test(value),
        },
      }));
    }
  };

  // 비밀번호 유효성 검사 메시지
  const getPasswordValidationMessage = () => {
    const password = formData.newPassword;
    const validation = validationState.passwordValidation;

    if (!password) return "비밀번호를 입력해주세요.";
    if (!validation.length) return "비밀번호는 최소 8자 이상이어야 합니다.";
    if (!validation.uppercase)
      return "비밀번호에 최소 하나의 대문자를 포함해야 합니다.";
    if (!validation.lowercase)
      return "비밀번호에 최소 하나의 소문자를 포함해야 합니다.";
    if (!validation.number)
      return "비밀번호에 최소 하나의 숫자를 포함해야 합니다.";
    if (!validation.special)
      return "비밀번호에 최소 하나의 특수문자를 포함해야 합니다.";
    return "사용 가능한 비밀번호입니다.";
  };

  // 비밀번호가 모든 조건을 만족하는지 확인
  const isPasswordValid = () => {
    const validation = validationState.passwordValidation;
    return (
      validation.length &&
      validation.uppercase &&
      validation.lowercase &&
      validation.number &&
      validation.special
    );
  };

  // 별명 중복확인
  const handleNicknameCheck = async () => {
    if (!nickname.trim()) {
      alert("별명을 입력해주세요.");
      return;
    }

    if (nickname.length < 1 || nickname.length > 8) {
      alert("별명은 1글자 이상 8글자 이하로 입력해주세요.");
      return;
    }

    try {
      // TODO: DB 연동 시 실제 중복 확인 로직 구현
      const isDuplicate = Math.random() > 0.5; // 임시 로직

      if (isDuplicate) {
        alert("이미 사용 중인 별명입니다. 다른 별명을 사용해주세요.");
        setValidationState((prev) => ({ ...prev, isNicknameChecked: false }));
      } else {
        alert("사용 가능한 별명입니다.");
        setValidationState((prev) => ({ ...prev, isNicknameChecked: true }));
      }
    } catch (error) {
      alert("중복확인 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 비밀번호 변경
  const handlePasswordChange = () => {
    if (!formData.newPassword) {
      alert("변경할 비밀번호를 입력해주세요.");
      return;
    }

    if (!isPasswordValid()) {
      alert("비밀번호가 조건을 충족하지 않습니다. 다시 확인해주세요.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      // TODO: DB 연동 시 비밀번호 변경 로직 구현
      alert("비밀번호가 변경되었습니다.");

      // 비밀번호 마스킹 처리
      setFormData((prev) => ({
        ...prev,
        newPassword: "********",
        confirmPassword: "********",
      }));
    } catch (error) {
      alert("비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 인증번호 받기
  const handleEmailVerification = async () => {
    if (!formData.email.trim()) {
      alert("이메일 주소를 입력해주세요.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    try {
      // TODO: 실제 이메일 발송 로직 구현
      alert("인증번호가 발송되었습니다. 이메일을 확인해주세요.");
      setValidationState((prev) => ({
        ...prev,
        isEmailVerificationSent: true,
        isEmailVerified: false,
      }));
    } catch (error) {
      alert("인증번호 발송 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 인증번호 확인
  const handleVerificationCheck = async () => {
    if (!formData.verificationCode.trim()) {
      alert("인증번호를 입력해주세요.");
      return;
    }

    try {
      // TODO: 실제 인증번호 확인 로직 구현
      const isValid = formData.verificationCode === "123456"; // 임시 로직

      if (isValid) {
        alert("이메일 인증이 완료되었습니다.");
        setValidationState((prev) => ({ ...prev, isEmailVerified: true }));
      } else {
        alert("인증번호를 재확인해주세요.");
      }
    } catch (error) {
      alert("인증 확인 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 주소 검색
  const handleAddressSearch = () => {
    setShowAddressModal(true);
  };

  // 주소 선택 완료 (임시 모달 로직)
  const handleAddressSelect = (selectedAddress) => {
    setFormData((prev) => ({
      ...prev,
      address: selectedAddress,
    }));
    setShowAddressModal(false);
  };

  // 이미지 업로드 핸들러들
  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 파일 객체 저장 (API 전송용)
      setProfileImageFile(file);

      // 미리보기용 URL 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  const handleBackgroundImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 파일 객체 저장 (API 전송용)
      setBackgroundImageFile(file);

      // 미리보기용 URL 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  // 이미지 편집 클릭 핸들러들
  const handleProfileEditClick = () => {
    profileFileRef.current?.click();
  };

  const handleBackgroundEditClick = () => {
    backgroundFileRef.current?.click();
  };

  // 전체 저장 핸들러
  const handleSave = async () => {
    if (!user?.id) {
      alert("로그인이 필요합니다.");
      return;
    }

    setIsLoading(true);

    try {
      // 텍스트 데이터 구성
      const memberData = {
        nickname: nickname.trim(),
        intro: introduction.trim(),
        mbti: mbti.trim(),
        interestEventTypes: eventTypes,
        interestTags: tags
      };

      // API 호출 - 현재 인증된 사용자의 ID만 사용
      await updateMemberWithImages(
        user.id, // 인증된 사용자의 ID만 사용, 백엔드에서 JWT로 검증
        memberData,
        profileImageFile,
        backgroundImageFile
      );

      alert("변경사항이 저장되었습니다!");
      router.push(ROUTES.MYPAGE);

    } catch (error) {
      console.error("저장 실패:", error);

      // 구체적인 에러 메시지
      if (error.message) {
        alert(`저장에 실패했습니다: ${error.message}`);
      } else {
        alert("저장에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white">
      {/* 숨겨진 파일 입력들 */}
      <input
        type="file"
        ref={backgroundFileRef}
        onChange={handleBackgroundImageUpload}
        accept="image/*"
        style={{ display: "none" }}
      />
      <input
        type="file"
        ref={profileFileRef}
        onChange={handleProfileImageUpload}
        accept="image/*"
        style={{ display: "none" }}
      />

      {/* MyPageBG 부분 */}
      <div className="w-full max-w-[1200px] h-auto min-h-[450px] mx-auto bg-white border-b border-gray-200 overflow-hidden">
        {/* 프로필 배경 섹션 */}
        <div
          className="bg-gray-100 flex flex-col h-[280px] sm:h-[240px] md:h-[280px] items-end justify-end p-[10px] w-full relative"
          style={{
            backgroundImage: backgroundImage
              ? `url(${backgroundImage})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}>
          {/* 프로필 배경 수정 버튼 */}
          <div
            className="flex items-center gap-2 text-[#c6c8ca] text-sm md:text-base z-10 cursor-pointer"
            onMouseEnter={() => setIsHoveringBackground(true)}
            onMouseLeave={() => setIsHoveringBackground(false)}
            onClick={handleBackgroundEditClick}
            style={{
              opacity: !backgroundImage || isHoveringBackground ? 1 : 0,
              transition: "opacity 0.2s ease-in-out",
            }}>
            <span>프로필 배경 수정</span>
            <div className="w-4 h-4 md:w-5 md:h-5 cursor-pointer text-[#c6c8ca]">
              <Image src={ICONS.EDIT_GRAY} alt="수정" width={20} height={20} />
            </div>
          </div>

          {/* 프로필 이미지 영역 */}
          <div
            className="absolute left-4 sm:left-6 md:left-8 -bottom-16 sm:-bottom-20 md:-bottom-24
             w-32 h-32 sm:w-40 sm:h-40 md:w-[200px] md:h-[200px]
             rounded-full overflow-hidden z-20"
            style={{
              backgroundColor: profileImage ? "transparent" : "#C6C8CA",
              backgroundImage: profileImage ? `url(${profileImage})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
            onMouseEnter={() => setIsHoveringProfile(true)}
            onMouseLeave={() => setIsHoveringProfile(false)}>
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              {!profileImage && (
                <div
                  className="flex items-center text-[#26282a] text-sm md:text-base cursor-pointer mb-1 md:mb-2 font-normal"
                  style={{
                    fontFamily: "Inter, Noto Sans KR, sans-serif",
                    gap: "4px",
                  }}
                  onClick={handleProfileEditClick}>
                  <span>프로필 변경</span>
                  <div className="w-3 h-3 md:w-[15px] md:h-[14.27px] text-[#26282a]">
                    <Image src={ICONS.EDIT} alt="수정" width={15} height={15} />
                  </div>
                </div>
              )}

              {profileImage && isHoveringProfile && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
                  <div
                    className="flex items-center text-[#26282a] text-sm md:text-base cursor-pointer mb-1 md:mb-2 font-normal"
                    style={{
                      fontFamily: "Inter, Noto Sans KR, sans-serif",
                      gap: "4px",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProfileEditClick();
                    }}>
                    <span>프로필 변경</span>
                    <div className="w-3 h-3 md:w-[15px] md:h-[14.27px] text-[#26282a]">
                      <Image
                        src={ICONS.EDIT}
                        alt="수정"
                        width={15}
                        height={15}
                      />
                    </div>
                  </div>

                  <div
                    className="flex items-center text-[#26282a] text-sm md:text-base cursor-pointer font-normal"
                    style={{
                      fontFamily: "Inter, Noto Sans KR, sans-serif",
                      gap: "4px",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProfileDelete();
                    }}>
                    <span>프로필 삭제</span>
                    <div className="w-3 h-3 md:w-[14px] md:h-[14px] text-[#26282a]">
                      <svg
                        className="w-full h-full"
                        fill="none"
                        viewBox="0 0 12 12"
                        stroke="currentColor"
                        strokeWidth="2">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11 1L1 11M1 1L11 11"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 프로필 정보 섹션 */}
        <div
          className="flex flex-col h-auto min-h-[170px] items-center md:items-end justify-start px-4 md:px-8 py-4 w-full
                pt-20 sm:pt-24 md:pt-[120px]">
          <div className="w-full max-w-[928px] min-h-[60px] p-2 md:p-4 flex flex-col items-start gap-6 sm:gap-8 md:gap-5">
            {/* 데스크톱 레이아웃 (xl 이상) */}
            <div className="hidden xl:flex xl:flex-row xl:items-center w-full xl:gap-0">
              {/* 사용자 별명 - 데스크톱에서 왼쪽 정렬 */}
              <div className="flex flex-col font-semibold justify-center text-[#26282a] text-[28px] xl:text-left whitespace-nowrap">
                <p className="leading-[1.28] whitespace-nowrap">{nickname}</p>
              </div>

              {/* 동행점수/바/버튼 영역 - 데스크톱에서 가로 배치, 가운데 정렬, 우측 고정 */}
              <div className="flex xl:flex-row xl:items-center justify-end w-full xl:ml-6 xl:gap-4">
                <div className="flex flex-col font-normal justify-center text-[#26282a] text-base xl:text-left whitespace-nowrap">
                  <p className="leading-[1.5]">동행 점수</p>
                </div>

                {/* 진행률 바 - 데스크톱 400px */}
                <div className="flex flex-col items-start justify-center relative w-full max-w-[400px]">
                  <div className="h-2 w-full bg-[#eef0f2] rounded-[5px] relative">
                    <div
                      className="h-2 bg-[#ffc37f] rounded-[5px] absolute top-0 left-0 transition-all duration-300"
                      style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
                    />

                    <div
                      className="absolute -top-6 text-[#26282a] text-base transform -translate-x-1/2 transition-all duration-300"
                      style={{
                        left: `${Math.min(Math.max(score, 0), 100)}%`,
                        minWidth: "max-content",
                      }}>
                      <p className="leading-[1.5]">{score}점</p>
                    </div>
                  </div>
                </div>

                {/* 저장 버튼 */}
                <div className="xl:ml-4">
                  <SaveButton onClick={handleSave} isLoading={isLoading} />
                </div>
              </div>
            </div>

            {/* 모바일/태블릿 레이아웃 (xl 미만) */}
            <div className="flex xl:hidden flex-col w-full gap-4">
              {/* 사용자 별명 - 모바일에서 오른쪽 정렬 */}
              <div
                className="flex flex-col font-semibold justify-center text-[#26282a] text-[28px] xl:text-left whitespace-nowrap
                max-w-[220px] 2xl:max-w-[320px]">
                <p className="leading-[1.28] whitespace-nowrap truncate">
                  {nickname}
                </p>
              </div>

              {/* 동행 점수 텍스트 - 모바일에서 오른쪽 정렬 */}
              <div className="flex flex-col font-normal justify-center text-[#26282a] text-sm text-right self-end">
                <p className="leading-[1.5]">동행 점수</p>
              </div>

              {/* 동행 점수바 - 모바일에서 전체 너비, 300px 제한 */}
              <div className="flex flex-col items-start justify-center relative w-full max-w-[300px] self-end">
                <div className="h-2 w-full bg-[#eef0f2] rounded-[5px] relative">
                  <div
                    className="h-2 bg-[#ffc37f] rounded-[5px] absolute top-0 left-0 transition-all duration-300"
                    style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
                  />

                  <div
                    className="absolute -top-6 text-[#26282a] text-sm transform -translate-x-1/2 transition-all duration-300"
                    style={{
                      left: `${Math.min(Math.max(score, 0), 100)}%`,
                      minWidth: "max-content",
                    }}>
                    <p className="leading-[1.5]">{score}점</p>
                  </div>
                </div>
              </div>

              {/* 변경사항 저장 버튼 - 모바일에서 오른쪽 정렬 */}
              <div className="self-end">
                <SaveButton onClick={handleSave} isLoading={isLoading} />
              </div>
            </div>

            {/* 한줄 자기소개 - 모든 화면에서 동일하게 왼쪽 정렬 */}
            <div
              className="flex flex-col justify-center text-[#26282a] text-lg md:text-[20px] text-left w-full break-words"
              style={{
                fontFamily: "Inter, Noto Sans KR, sans-serif",
                fontWeight: 500,
                lineHeight: 1.4,
              }}>
              <IntroductionInput
                introduction={introduction}
                setIntroduction={setIntroduction}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MyPageDetail 부분 */}
      <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto p-4 sm:p-6">
        {/* 나이/성별/MBTI 섹션 */}
        <div className="flex flex-col lg:flex-row gap-4 items-start justify-start w-full">
          {/* 나이 섹션 (고정값) - 백엔드에서 관리하지 않음 (추후 구현 예정) */}
          {/*
          <div className="flex flex-col gap-2 w-full lg:w-40 shrink-0">
            <div className="flex flex-row gap-2 items-center relative">
              <div className="text-gray-800 text-base font-normal">
                <p>나이</p>
              </div>
              <div
                className="flex flex-row gap-2 items-center cursor-pointer"
                onClick={() => setAgeDropdown(!ageDropdown)}>
                <div className="text-[#C6C8CA] text-base font-normal">
                  <p>{ageVisibility}</p>
                </div>
                <div className="flex items-center justify-center w-[17px] h-[16px]">
                  <div
                    className={`transition-transform duration-200 ${
                      ageDropdown ? "rotate-180" : ""
                    }`}>
                    <Image
                      src={ICONS.DOWN_GRAY}
                      alt="드롭다운 화살표"
                      width={17}
                      height={8}
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
                          setAgeVisibility("공개");
                          setAgeDropdown(false);
                        }}>
                        공개
                      </button>
                      <button
                        className="block w-full px-4 py-2 text-left text-base text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAgeVisibility("비공개");
                          setAgeDropdown(false);
                        }}>
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
          */}

          {/* 성별 섹션 (고정값) - 백엔드에서 관리하지 않음 (추후 구현 예정) */}
          {/*
          <div className="flex flex-col gap-2 w-full lg:w-40 shrink-0">
            <div className="flex flex-row gap-2 items-center relative">
              <div className="text-gray-800 text-base font-normal">
                <p>성별</p>
              </div>
              <div
                className="flex flex-row gap-2 items-center cursor-pointer"
                onClick={() => setGenderDropdown(!genderDropdown)}>
                <div className="text-[#C6C8CA] text-base font-normal">
                  <p>{genderVisibility}</p>
                </div>
                <div className="flex items-center justify-center w-[17px] h-[16px]">
                  <div
                    className={`transition-transform duration-200 ${
                      genderDropdown ? "rotate-180" : ""
                    }`}>
                    <Image
                      src={ICONS.DOWN_GRAY}
                      alt="드롭다운 화살표"
                      width={17}
                      height={8}
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
                          setGenderVisibility("공개");
                          setGenderDropdown(false);
                        }}>
                        공개
                      </button>
                      <button
                        className="block w-full px-4 py-2 text-left text-base text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setGenderVisibility("비공개");
                          setGenderDropdown(false);
                        }}>
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
          */}

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

      {/* 개인 정보 편집 부분 */}
      <div className="w-full max-w-[1200px] mx-auto bg-white p-4 md:p-8 mt-8 border-t border-gray-200">
        {/* 개인 정보 탭 */}
        <div className="flex items-end border-b border-[#eef0f2] mb-6">
          <div className="relative w-full max-w-[400px] py-1 border-b-4 border-[#26282a] -mb-px flex justify-center">
            <span className="text-[#26282a] text-lg font-normal leading-[1.55]">
              개인 정보
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* 로그인 아이디 */}
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="w-full md:w-80">
              <label className="block text-[#26282a] text-base font-normal mb-2">
                로그인 아이디
              </label>
              <div className="bg-gray-100 h-14 flex items-center px-4 rounded border border-[#c6c8ca] w-full">
                <span className="text-[#26282a] text-base">
                  {formData.userId}
                </span>
              </div>
            </div>
          </div>

          {/* 별명 */}
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="w-full md:w-[420px]">
              <label className="block text-[#26282a] text-base font-normal mb-2">
                별명
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => {
                    const value = e.target.value;

                    // 8글자 제한
                    if (value.length > 8) {
                      setValidationState((prev) => ({
                        ...prev,
                        nicknameError:
                          "사용자 별명은 최대 8글자까지 입력 가능합니다.",
                        isNicknameChecked: false,
                      }));
                      return;
                    }

                    // 별명 업데이트
                    setNickname(value);

                    // 에러 메시지 초기화 및 중복확인 상태 초기화
                    setValidationState((prev) => ({
                      ...prev,
                      nicknameError: "",
                      isNicknameChecked: false,
                    }));
                  }}
                  className="flex-1 bg-white h-14 px-4 rounded border border-[#c6c8ca] text-[#26282a] text-base focus:outline-none focus:border-[#4F8FFF]"
                  maxLength={8}
                />
                <button
                  onClick={handleNicknameCheck}
                  className="bg-[#c6c8ca] text-white px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium whitespace-nowrap w-[80px] md:w-[90px] justify-center flex items-center">
                  중복확인
                </button>
              </div>
              {validationState.nicknameError && (
                <p className="text-red-500 text-sm mt-1">
                  {validationState.nicknameError}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                최소 1글자 ~ 최대 8글자 (공백 포함)
              </p>
            </div>
          </div>

          {/* 비밀번호 변경 */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-4">
            <div className="w-full lg:w-80">
              <label className="block text-[#26282a] text-base font-normal mb-2">
                변경할 비밀번호
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                placeholder="-"
                className="w-full bg-gray-100 h-14 px-4 rounded border border-[#c6c8ca] text-[#26282a] text-base focus:outline-none focus:border-[#4F8FFF]"
              />
              {formData.newPassword && (
                <p
                  className={`text-sm mt-1 ${
                    isPasswordValid() ? "text-green-600" : "text-red-600"
                  }`}>
                  {getPasswordValidationMessage()}
                </p>
              )}
            </div>
            <div className="w-full lg:w-[455px]">
              <label className="block text-[#26282a] text-base font-normal mb-2">
                비밀번호 확인
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  placeholder="-"
                  className="flex-1 bg-gray-100 h-14 px-4 rounded border border-[#c6c8ca] text-[#26282a] text-base focus:outline-none focus:border-[#4F8FFF]"
                />
                <button
                  onClick={handlePasswordChange}
                  className="bg-[#c6c8ca] text-white px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium whitespace-nowrap">
                  비밀번호 변경
                </button>
              </div>
            </div>
          </div>

          {/* 이메일 인증 */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-4">
            <div className="w-full lg:w-[695px]">
              <label className="block text-[#26282a] text-base font-normal mb-2">
                이메일
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="flex-1 bg-white h-14 px-4 rounded border border-[#c6c8ca] text-[#26282a] text-base focus:outline-none focus:border-[#4F8FFF]"
                />
                <button
                  onClick={handleEmailVerification}
                  className="bg-[#c6c8ca] text-white px-2 md:px-4 py-2 rounded-lg text-xs md:text-base font-medium whitespace-nowrap">
                  인증번호 받기
                </button>
              </div>
            </div>
            <div className="w-full lg:flex-1">
              <label className="block text-[#26282a] text-base font-medium mb-2">
                인증번호
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.verificationCode}
                  onChange={(e) =>
                    handleInputChange("verificationCode", e.target.value)
                  }
                  placeholder="●●●●●●"
                  className="flex-1 bg-white h-14 px-4 rounded border border-[#c6c8ca] text-[#26282a] text-base focus:outline-none focus:border-[#4F8FFF]"
                  disabled={!validationState.isEmailVerificationSent}
                />
                <button
                  onClick={handleVerificationCheck}
                  disabled={!validationState.isEmailVerificationSent}
                  className="bg-[#c6c8ca] text-white px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium whitespace-nowrap disabled:opacity-50">
                  인증확인
                </button>
              </div>
            </div>
          </div>

          {/* 주소 */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-4">
            <div className="w-full lg:w-[695px]">
              <label className="block text-[#26282a] text-base font-normal mb-2">
                주소
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.address}
                  readOnly
                  className="flex-1 bg-gray-100 h-14 px-4 rounded border border-[#c6c8ca] text-[#26282a] text-base cursor-pointer"
                  onClick={handleAddressSearch}
                />
                <button
                  onClick={handleAddressSearch}
                  className="bg-[#c6c8ca] text-white px-2 md:px-4 py-2 rounded-lg text-xs md:text-base font-medium flex items-center gap-1 md:gap-2 whitespace-nowrap w-[100px] md:w-[125px] justify-center">
                  <Image
                    src={ICONS.SEARCH}
                    alt="search-icon"
                    width={16}
                    height={16}
                    className="md:w-5 md:h-5"
                    style={{ filter: "brightness(0) invert(1)" }}
                  />
                  주소 검색
                </button>
              </div>
            </div>
            <div className="w-full lg:flex-1">
              <label className="block text-[#26282a] text-base font-medium mb-2">
                상세 주소
              </label>
              <input
                type="text"
                value={formData.detailAddress}
                onChange={(e) =>
                  handleInputChange("detailAddress", e.target.value)
                }
                className="w-full bg-white h-14 px-4 rounded border border-[#c6c8ca] text-[#26282a] text-base focus:outline-none focus:border-[#4F8FFF]"
              />
            </div>
          </div>
        </div>

        {/* 주소 검색 모달 (임시) */}
        {showAddressModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">주소 검색</h3>
              <p className="text-gray-600 mb-4">
                실제 구현 시에는 주소 API가 연동될 예정입니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() =>
                    handleAddressSelect("서울특별시 강남구 테헤란로 123")
                  }
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded">
                  샘플 주소 선택
                </button>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded">
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
