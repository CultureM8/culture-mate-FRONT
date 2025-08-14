"use client";

import { useState } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";
import TogetherGallery from "../together/TogetherGallery";
import TogetherList from "../together/TogetherList";

export default function MyTogether() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" 또는 "list"
  const [visibilityStates, setVisibilityStates] = useState({}); // 각 아이템의 공개/비공개 상태
  const [galleryData, setGalleryData] = useState(
    Array.from({ length: 15 }, (_, index) => ({
      id: index + 1,
      imgSrc: undefined,
      title: "모집글 제목",
      eventType: "이벤트유형",
      eventName: "이벤트명",
      people: "모집 인원",
      date: "0000.00.00",
      alt: `갤러리 이미지 ${index + 1}`,
      // 리스트용 추가 데이터
      group: "00/00",
      pin: "00시 00구 00동",
      nickName: "사용자 별명"
    }))
  );

  const handleButtonClick = () => {
    if (isEditMode) {
      // 저장 로직 실행
      handleSave();
    } else {
      // 편집 모드로 전환
      setIsEditMode(true);
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleSave = () => {
    // 여기에 실제 저장 로직을 구현
    console.log("변경사항이 저장되었습니다.");
    
    // 저장 완료 후 편집 모드 해제
    setIsEditMode(false);
    
    // 실제 프로젝트에서는 API 호출 등의 비동기 작업을 수행
    // try {
    //   await saveChanges();
    //   setIsEditMode(false);
    // } catch (error) {
    //   console.error("저장 중 오류가 발생했습니다:", error);
    // }
  };

  // 공개/비공개 토글 함수
  const handleVisibilityToggle = (itemId) => {
    setVisibilityStates(prev => ({
      ...prev,
      [itemId]: !prev[itemId] // true(공개) / false(비공개), 기본값은 true
    }));
  };

  // 편집 함수
  const handleEdit = (itemId) => {
    console.log(`아이템 ${itemId} 편집`);
    // 편집 로직 구현
  };

  // 삭제 함수
  const handleDelete = (itemId) => {
    // 확인 창 표시
    if (window.confirm("정말로 이 모집글을 삭제하시겠습니까?")) {
      // 갤러리 데이터에서 해당 아이템 제거
      setGalleryData(prev => prev.filter(item => item.id !== itemId));
      
      // 공개/비공개 상태에서도 해당 아이템 제거
      setVisibilityStates(prev => {
        const newStates = { ...prev };
        delete newStates[itemId];
        return newStates;
      });
      
      console.log(`아이템 ${itemId} 삭제됨`);
      
      // 실제 프로젝트에서는 API 호출로 서버에서도 삭제
      // try {
      //   await deleteItem(itemId);
      //   setGalleryData(prev => prev.filter(item => item.id !== itemId));
      // } catch (error) {
      //   console.error("삭제 중 오류가 발생했습니다:", error);
      //   alert("삭제에 실패했습니다. 다시 시도해주세요.");
      // }
    }
  };

  // 임시 데이터는 상태로 이동했으므로 삭제

  return (
    <div className="w-full">
      {/* 메뉴 및 버튼 영역 */}
      <div className="
        flex items-center justify-between
        px-0 py-2 w-full
      ">
        {/* 좌측 아이콘 영역 */}
        <div className="
          flex items-center gap-2.5
          px-1.5 py-0.5
        ">
          {/* 그리드 아이콘 (MENU 버튼) */}
          <button 
            onClick={() => handleViewModeChange("grid")}
            className="w-6 h-6 flex items-center justify-center"
          >
            <Image
              src={ICONS.MENU}
              alt="grid-view"
              width={24}
              height={24}
              className={viewMode === "grid" ? "opacity-100" : "opacity-40"}
            />
          </button>
          
          {/* 리스트 아이콘 (LIST 버튼) */}
          <button 
            onClick={() => handleViewModeChange("list")}
            className="w-6 h-6 flex items-center justify-center"
          >
            <Image
              src={ICONS.LIST}
              alt="list-view"
              width={24}
              height={24}
              className={viewMode === "list" ? "opacity-100" : "opacity-40"}
            />
          </button>
        </div>

        {/* 우측 편집/저장 버튼 */}
        <button 
          onClick={handleButtonClick}
          className={`
            px-4 py-2 rounded-lg
            font-medium text-base text-white
            flex items-center justify-center
            transition-colors
            ${isEditMode 
              ? "bg-[#76787a] hover:bg-[#6a6c6e]" 
              : "bg-[#c6c8ca] hover:bg-[#b5b7b9]"
            }
          `}
        >
          {isEditMode ? "저장" : "편집"}
        </button>
      </div>

      {/* 갤러리 그리드 영역 */}
      {viewMode === "grid" && (
        <div className="
          grid grid-cols-4 gap-6
          w-full max-w-[1200px] mx-auto
          mt-4 mb-[50vh]
        ">
          {galleryData.map((item) => (
            <div key={item.id} className="relative">
              {/* TogetherGallery 컴포넌트 */}
              <TogetherGallery
                imgSrc={item.imgSrc}
                title={item.title}
                eventType={item.eventType}
                eventName={item.eventName}
                people={item.people}
                date={item.date}
                alt={item.alt}
              />
              
              {/* 편집 모드일 때만 표시되는 아이콘들 */}
              {isEditMode && (
                <div className="absolute top-0 left-0 mt-5 ml-5 flex gap-2">
                  {/* 눈 아이콘 (공개/비공개) */}
                  <button
                    onClick={() => handleVisibilityToggle(item.id)}
                    className={`hover:cursor-pointer ${visibilityStates[item.id] === false ? "opacity-30" : ""}`}
                    style={{ filter: 'brightness(0) saturate(100%) invert(49%) sepia(7%) saturate(241%) hue-rotate(166deg) brightness(93%) contrast(90%)' }}
                  >
                    <Image
                      src={visibilityStates[item.id] === false ? ICONS.INVISIBLE : ICONS.VISIBLE}
                      alt={visibilityStates[item.id] === false ? "비공개" : "공개"}
                      width={22}
                      height={16}
                    />
                  </button>
                  
                  {/* 연필 아이콘 (편집) */}
                  <button
                    onClick={() => handleEdit(item.id)}
                    className="hover:cursor-pointer"
                    style={{ filter: 'brightness(0) saturate(100%) invert(49%) sepia(7%) saturate(241%) hue-rotate(166deg) brightness(93%) contrast(90%)' }}
                  >
                    <Image
                      src={ICONS.EDIT}
                      alt="편집"
                      width={18}
                      height={17.12}
                    />
                  </button>
                  
                  {/* X 아이콘 (삭제) */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="hover:cursor-pointer"
                    style={{ filter: 'brightness(0) saturate(100%) invert(49%) sepia(7%) saturate(241%) hue-rotate(166deg) brightness(93%) contrast(90%)' }}
                  >
                    <Image
                      src={ICONS.X}
                      alt="삭제"
                      width={12}
                      height={12}
                    />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 리스트 영역 */}
      {viewMode === "list" && (
        <div className="
          w-full max-w-[1200px] mx-auto
          mt-4 mb-[50vh] space-y-4
        ">
          {galleryData.map((item) => (
            <TogetherList
              key={item.id}
              imgSrc={item.imgSrc}
              title={item.title}
              eventType={item.eventType}
              eventName={item.eventName}
              group={item.group}
              date={item.date}
              pin={item.pin}
              nickName={item.nickName}
              alt={item.alt}
            />
          ))}
        </div>
      )}
    </div>
  );
}