"use client";
import { useState } from "react";
import MyPostGrid from "./MyPostGrid";
import MyRepGrid from "./MyRepGrid";

export default function MyPostManageTab() {
  const [activeTab, setActiveTab] = useState("MyPostTab");
  return (
    <div className="mt-3">
      <div className="relative flex gap-4 border-b border-gray-300">
        <button
          onClick={() => setActiveTab("MyPostTab")}
          className={`w-1/4 px-4 py-2 text-center ${
            activeTab === "MyPostTab"
              ? "border-b-2 border-black text-black"
              : "text-gray-500"
          }`}
        >
          내 게시물
        </button>
        <button
          onClick={() => setActiveTab("MyRepTab")}
          className={`w-1/4 px-4 py-2 text-center ${
            activeTab === "MyRepTab"
              ? "border-b-2 border-black text-black"
              : "text-gray-500"
          }`}
        >
          내 댓글
        </button>
      </div>
      <div className="mt-8">
        {activeTab === "MyPostTab" && <MyPostGrid />}
        {activeTab === "MyRepTab" && <MyRepGrid />}
      </div>
    </div>
  );
}
