"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";
import MyTogether from "./TogetherManagement/MyTogether";
import MyTogetherHistory from "./MyTogetherHistory";
import MyEventReview from "./MyEventReview";

const RecruitTabView = () => {
  const [activeTab, setActiveTab] = useState("나의 동행");
  const [dropdownStates, setDropdownStates] = useState({
    "나의 동행": false,
    "나의 리뷰": false,
  });
  const [selectedStatuses, setSelectedStatuses] = useState({
    "나의 동행": "공개",
    "나의 리뷰": "공개",
  });

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const handleDropdownToggle = (tabName) => {
    setDropdownStates(prev => ({
      ...prev,
      [tabName]: !prev[tabName]
    }));
  };

  const handleStatusSelect = (tabName, status) => {
    setSelectedStatuses(prev => ({
      ...prev,
      [tabName]: status
    }));
    setDropdownStates(prev => ({
      ...prev,
      [tabName]: false
    }));
  };

  const renderDropdown = (tabName) => {
    if (activeTab !== tabName) return null;

    return (
      <div
        className="box-border content-stretch flex flex-row gap-2 items-center justify-start pl-4 pr-0 py-0 relative shrink-0"
        data-name="Recruitment value container"
      >
        <div
          className="flex flex-col font-['Inter'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#76787a] text-[16px] text-left text-nowrap"
        >
          <p className="block leading-[1.5] whitespace-pre">{selectedStatuses[tabName]}</p>
        </div>
        <button 
          className="relative shrink-0 w-[17px] h-[17px] cursor-pointer flex items-center justify-center"
          onClick={() => handleDropdownToggle(tabName)}
          aria-label="공개 상태 선택"
        >
          <Image
            src={ICONS.DOWN_GRAY}
            alt="드롭다운 아이콘"
            width={17}
            height={17}
            className="object-contain"
          />
        </button>
        
        {/* 드롭다운 메뉴 */}
        {dropdownStates[tabName] && (
          <div className="absolute top-full left-4 mt-1 bg-white border border-[#eef0f2] rounded-md shadow-lg z-10 min-w-[80px]">
            <button
              className="block w-full px-4 py-2 text-left text-[16px] text-[#76787a] hover:bg-gray-50 transition-colors"
              onClick={() => handleStatusSelect(tabName, "공개")}
            >
              공개
            </button>
            <button
              className="block w-full px-4 py-2 text-left text-[16px] text-[#76787a] hover:bg-gray-50 transition-colors"
              onClick={() => handleStatusSelect(tabName, "비공개")}
            >
              비공개
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderTab = (tabName, dataName) => {
    const isActive = activeTab === tabName;
    
    return (
      <div
        className="basis-0 box-border content-stretch flex flex-row gap-2.5 grow items-center justify-center min-h-px min-w-px px-2 py-1 relative shrink-0 cursor-pointer"
        data-name={dataName}
        onClick={() => handleTabClick(tabName)}
      >
        <div
          aria-hidden="true"
          className={`absolute border-solid inset-0 pointer-events-none ${
            isActive 
              ? "border-[#26282a] border-[0px_0px_3px] bottom-[-1.5px] left-0 right-0 top-0"
              : "border-[#eef0f2] border-[0px_0px_1px]"
          }`}
        />
        <div
          className={`flex flex-col font-['Inter'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-left text-nowrap ${
            isActive ? "text-[#26282a]" : "text-[#c6c8ca]"
          }`}
        >
          <p className="block leading-[1.55] whitespace-pre">{tabName}</p>
        </div>
        {renderDropdown(tabName)}
      </div>
    );
  };

  // 탭별 컨텐츠 렌더링 함수
  const renderTabContent = () => {
    const currentStatus = selectedStatuses[activeTab];

    switch (activeTab) {
      case "나의 동행":
        return <MyTogether status={currentStatus} enableChat={false} />;
      case "나의 리뷰":
        return <MyEventReview status={currentStatus} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* 탭 헤더 */}
      <div className="w-full flex justify-center">
        <div
          className="box-border content-stretch flex flex-row items-end justify-start p-0 relative"
          style={{ width: "1200px", height: "48px" }}
          data-name="Recruitment container"
        >
          <div
            aria-hidden="true"
            className="absolute border-[#eef0f2] border-[0px_0px_1px] border-solid inset-0 pointer-events-none"
          />
          
          {/* 나의 동행 탭 */}
          {renderTab("나의 동행", "Component 4")}

          {/* 나의 리뷰 탭 */}
          {renderTab("나의 리뷰", "Component 5")}
        </div>
      </div>

      {/* 탭별 컨텐츠 */}
      <div className="w-full">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default RecruitTabView;