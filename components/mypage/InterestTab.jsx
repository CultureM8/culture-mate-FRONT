"use client";

import { useState } from "react";

export default function InterestTab() {
  const [activeTab, setActiveTab] = useState("InterEventTab");
  return (
    <div className="mt-3">
      <div className="relative flex gap-4 border-b border-gray-300">
        <button
          onClick={() => setActiveTab("InterEventTab")}
          className={`px-4 py-2 ${
            activeTab === "InterEventTab"
              ? "border-b-2 border-black text-black"
              : "text-gray-500"
          }`}
        >
          관심 이벤트
        </button>
        <button
          onClick={() => setActiveTab("InterWithTab")}
          className={`px-4 py-2 ${
            activeTab === "InterWithTab"
              ? "border-b-2 border-black text-black"
              : "text-gray-500"
          }`}
        >
          관심 동행
        </button>
      </div>
      <div className="mt-8">
        {activeTab === "InterEventTab" && <div>관심이벤트페이지</div>}
        {activeTab === "InterWithTab" && <div>관심동행페이지</div>}
      </div>
    </div>
  );
}
