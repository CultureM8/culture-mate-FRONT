"use client";

import { useState } from "react";
import HistoryEvent from "./HistoryEvent";
import HistoryWith from "./HistoryWith";

export default function HistoryTab() {
  const [activeTab, setActiveTab] = useState("HistoryEventTab");

  return (
    <div className="mt-1">
      <div className="relative flex gap-4 border-b border-gray-300">
        <button
          onClick={() => setActiveTab("HistoryEventTab")}
          className={`w-1/4 px-4 py-2 ${
            activeTab === "HistoryEventTab"
              ? "border-b-2 border-black text-black"
              : "text-gray-500"
          }`}
        >
          이벤트 리뷰
        </button>
        <button
          onClick={() => setActiveTab("HistoryWithTab")}
          className={`w-1/4 px-4 py-2 ${
            activeTab === "HistoryWithTab"
              ? "border-b-2 border-black text-black"
              : "text-gray-500"
          }`}
        >
          동행 기록
        </button>
      </div>
      <div className="mt-8">
        {activeTab === "HistoryEventTab" && <HistoryEvent />}
        {activeTab === "HistoryWithTab" && <HistoryWith />}
      </div>
    </div>
  );
}
