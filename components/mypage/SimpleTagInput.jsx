"use client"

import { useState } from "react";

export default function SimpleTagInput({ tags, setTags }) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      // 데이터는 순수 텍스트로 저장 (# 제거)
      const newTag = inputValue.trim().replace(/^#/, '');

      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue("");
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <div className="w-full">
      <h3 className="text-base font-medium text-gray-900 mb-3">관심 태그</h3>

      <div className="border border-gray-300 rounded-lg p-4 bg-white min-h-[80px]">
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              #{tag}
              <button
                onClick={() => removeTag(tag)}
                className="text-green-600 hover:text-red-500 ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={addTag}
          placeholder="태그 입력 후 Enter (예: 영화, 음악)"
          className="w-full border-none outline-none text-gray-700 placeholder-gray-400"
        />
      </div>
    </div>
  );
}