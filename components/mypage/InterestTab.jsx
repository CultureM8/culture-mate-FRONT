"use client";

import { useState } from "react";
import InterestEvent from "./InterestEvent";
import InterestWith from "./InterestWith";

export default function InterestTab({ eventData }) {
  const [activeTab, setActiveTab] = useState("InterEventTab");

  return (
    <div className="mt-1">
      <div className="relative flex gap-4 border-b border-gray-300">
        <button
          onClick={() => setActiveTab("InterEventTab")}
          className={`w-1/4 px-4 py-2 ${
            activeTab === "InterEventTab"
              ? "border-b-2 border-black text-black"
              : "text-gray-500"
          }`}
        >
          관심 이벤트
        </button>
        <button
          onClick={() => setActiveTab("InterWithTab")}
          className={`w-1/4 px-4 py-2 ${
            activeTab === "InterWithTab"
              ? "border-b-2 border-black text-black"
              : "text-gray-500"
          }`}
        >
          관심 동행
        </button>
      </div>
      <div className="mt-8">
        {/* 이전페이지(interest/page.jsx)쪽에서 끌고 온 이벤트데이터를 관심목록의 관심이벤트로 끌고갑니다 */}
        {activeTab === "InterEventTab" && (
          <InterestEvent eventData={eventData} />
        )}
        {/* 이전페이지(interest/page.jsx)쪽에서 끌고 온 이벤트데이터를 관심목록의 관심동행으로 끌고갑니다 */}
        {activeTab === "InterWithTab" && <InterestWith eventData={eventData} />}
      </div>
    </div>
  );
}
