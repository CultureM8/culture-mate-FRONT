"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";
import GalleryLayout from "@/components/global/GalleryLayout";
import TogetherGallery from "@/components/together/TogetherGallery";
import TogetherList from "@/components/together/TogetherList";
import EventSelector from "@/components/global/EventSelector";
import SearchBar from "@/components/global/SearchBar";
import TogetherFilterModal from "@/components/together/TogetherFilterModal";
import { getAllTogetherPosts, getTogetherPostsByType } from "@/lib/togetherData";

export default function TogetherPage() {
  // 페이지 제목과 소개 문구 설정
  const [title, intro] = ["동행 모집", "혼자도 좋지만, 함께라면 더 특별한 공연과 축제의 시간"];
  
  // 뷰 모드를 관리하는 상태 (Gallery: 갤러리형 기본값, List: 리스트형)
  const [viewType, setViewType] = useState("Gallery");
  
  // 선택된 이벤트 타입을 관리하는 상태
  const [selectedEventType, setSelectedEventType] = useState("전체");
  
  // 필터 모달 열림/닫힘 상태
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 동행 모집 게시글 데이터 상태 (togetherData.js에서 가져옴)
  const [togetherData, setTogetherData] = useState([]);

  // 선택된 이벤트 타입에 따라 데이터 가져오기
  useEffect(() => {
    const fetchTogetherPosts = async () => {
      try {
        if (selectedEventType === "전체") {
          const posts = await getAllTogetherPosts();
          setTogetherData(posts);
        } else {
          const posts = await getTogetherPostsByType(selectedEventType);
          setTogetherData(posts);
        }
      } catch (error) {
        console.error("동행 데이터를 가져오는데 실패했습니다:", error);
      }
    };

    fetchTogetherPosts();
  }, [selectedEventType]);

  // 필터 버튼 클릭 핸들러
  const handleFilterClick = () => {
    setIsFilterOpen(true);
  };

  // 정렬 버튼 클릭 핸들러  
  const handleSortClick = () => {
    alert("정렬 기능이 클릭됨");
    // 추후 정렬 드롭다운 등 기능 추가
  };

  // 필터 모달 닫기
  const closeFilterModal = () => {
    setIsFilterOpen(false);
  };

  return (
    <>
      {/* 페이지 제목 */}
      <h1 className="text-4xl font-bold py-[10px] h-16 px-6">{title}</h1>
      
      {/* 페이지 소개 문구 */}
      <p className="text-xl pt-[10px] h-12 fill-gray-600 px-6">{intro}</p>

      {/* 안내 메시지 배경 이미지 : 현재는 따로 필요없음 */}
      {/* <div className="absolute left-1/2 top-[112px] -translate-x-1/2 w-screen h-[100px] z-0">
        <Image
          src={"/img/default-img.svg"}
          alt="이미지"
          fill
          className="object-cover opacity-30"
        />
      </div> */}
      
      {/* 안내 메시지 박스 */}
      <div className="border w-full h-[100px] flex items-center justify-center relative z-10">
        <p className="text-sm text-gray-700 text-center px-4">
          동행 관련 공고/일정을 인리어 배너(혹시 광고 or 동행 관련 소식 등등) /동행 콘텐츠가 없는 배너도 OK
        </p>
      </div>

      {/* 이벤트 타입 선택 버튼들 (가운데 정렬) */}
      <EventSelector 
        selected={selectedEventType} 
        setSelected={setSelectedEventType} 
      />

      {/* 검색, 필터, 정렬, 뷰 타입 전환 컨트롤 */}
      <div className="px-2.5 h-16 flex items-center justify-between">
        {/* 왼쪽: 뷰 모드 전환 버튼과 제목 */}
        <div className="flex items-center gap-2">
          {/* 섹션 제목 - 선택된 이벤트 타입 표시 */}
          <h2 className="text-xl font-semibold">{selectedEventType}</h2>
          {/* 그리드/리스트 뷰 전환 버튼 */}
          <div className="flex items-center gap-1">
            {/* 갤러리 뷰 버튼 */}
            <button
              onClick={() => setViewType("Gallery")}
              className={`p-2 rounded transition-colors ${
                viewType === "Gallery" ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
              title="갤러리 보기"
            >
              <Image 
                src={ICONS.MENU}
                alt="갤러리 보기"
                width={20}
                height={20}
              />
            </button>
            
            {/* 리스트 뷰 버튼 */}
            <button
              onClick={() => setViewType("List")}
              className={`p-2 rounded transition-colors ${
                viewType === "List" ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
              title="리스트 보기"
            >
              <Image 
                src={ICONS.LIST}
                alt="리스트 보기"
                width={20}
                height={20}
              />
            </button>
          </div>
        </div>
        
        {/* 오른쪽: 검색창, 필터, 정렬 */}
        <div className="flex items-center gap-6">
          {/* 검색창 컴포넌트 */}
          <SearchBar />
          
          {/* 필터 버튼 */}
          <button 
            className="flex items-center gap-2 hover:cursor-pointer"
            onClick={handleFilterClick}
          >
            필터
            <Image 
              src={ICONS.FILTER}
              alt="필터"
              width={24}
              height={24}
            />
          </button>
          
          {/* 정렬 버튼 */}
          <button 
            className="flex items-center gap-2 hover:cursor-pointer"
            onClick={handleSortClick}
          >
            정렬
            <Image 
              src={ICONS.DOWN_ARROW}
              alt="정렬"
              width={24}
              height={24}
            />
          </button>
        </div>
      </div>

      {/* 뷰 모드에 따른 조건부 렌더링 */}
      {viewType === "Gallery" ? (
        // 갤러리 뷰: 기존 GalleryLayout과 TogetherGallery 컴포넌트 활용
        <GalleryLayout Component={TogetherGallery} items={togetherData} />
      ) : (
        // 리스트 뷰: TogetherList 컴포넌트들을 세로로 나열
        <div className="space-y-0">
          {togetherData.map((item, idx) => (
            <TogetherList key={idx} {...item} />
          ))}
        </div>
      )}

      {/* 동행 필터 모달 - 이벤트 필터 모달 참고함 */}
      <TogetherFilterModal 
        isOpen={isFilterOpen} 
        onClose={closeFilterModal} 
      />
    </>
  );
}
