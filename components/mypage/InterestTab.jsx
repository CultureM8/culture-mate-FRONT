"use client";

import { useState, useEffect } from "react";
import InterestEvent from "./InterestEvent";
import InterestWith from "./InterestWith";

export default function InterestTab({ eventData, onRefreshData }) {
  const [activeTab, setActiveTab] = useState("InterEventTab");

  // 관심 상태 변경 시 데이터 새로고침
  useEffect(() => {
    const handleInterestChanged = (event) => {
      const { eventId, interested } = event.detail;

      // 관심 해제 시에만 데이터 새로고침 (추가는 이미 다른 페이지에서 처리)
      if (!interested && typeof onRefreshData === "function") {
        onRefreshData();
      }
    };

    window.addEventListener("interest-changed", handleInterestChanged);
    return () =>
      window.removeEventListener("interest-changed", handleInterestChanged);
  }, [onRefreshData]);

  return (
    <div className="mt-1">
      <div className="relative flex gap-4 border-b border-gray-300">
        <button
          onClick={() => setActiveTab("InterEventTab")}
          className={`w-1/4 px-4 py-2 ${
            activeTab === "InterEventTab"
              ? "border-b-2 border-black text-black"
              : "text-gray-500"
          }`}>
          관심 이벤트
        </button>
        <button
          onClick={() => setActiveTab("InterWithTab")}
          className={`w-1/4 px-4 py-2 ${
            activeTab === "InterWithTab"
              ? "border-b-2 border-black text-black"
              : "text-gray-500"
          }`}>
          관심 동행
        </button>
      </div>
      <div className="mt-8">
        {activeTab === "InterEventTab" && (
          <InterestEvent eventData={eventData} />
        )}
        {/* 관심 동행은 아직 구현되지 않음 */}
        {activeTab === "InterWithTab" && <InterestWith eventData={eventData} />}
      </div>
    </div>
  );
}
