"use client";

import Image from "next/image";
import { ICONS } from "@/constants/path";

/** 우측 상단 툴바: 편집 / (편집중) 삭제 / 설정 */
export default function EditSetting({
  editMode = false,
  selectedCount = 0,
  onToggleEdit, // 편집 토글
  onDeleteSelected, // 선택 삭제
  onOpenSetting, // 설정(옵션)
}) {
  const canDelete = editMode && selectedCount > 0;

  return (
    <div className="px-2.5 h-16 flex items-center justify-end">
      <div className="flex items-center gap-6">
        <button
          className="flex items-center gap-2 hover:cursor-pointer"
          onClick={onToggleEdit}>
          {editMode ? "편집 종료" : "편집"}
          <Image src={ICONS.EDIT} alt="편집" width={16} height={16} />
        </button>

        {/* 편집중일 때만 노출되는 삭제 버튼 */}
        {editMode && (
          <button
            onClick={onDeleteSelected}
            disabled={!canDelete}
            className={`flex items-center gap-2 rounded px-2 py-1
              ${
                canDelete
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }
            `}
            title={
              selectedCount > 0 ? "선택 항목 삭제" : "삭제할 항목을 선택하세요"
            }>
            삭제{selectedCount > 0 ? ` (${selectedCount})` : ""}
          </button>
        )}

        {/* <button
          className="flex items-center gap-2 hover:cursor-pointer"
          onClick={onOpenSetting}>
          설정
          <Image src={ICONS.SETTING} alt="설정" width={16} height={16} />
        </button> */}
      </div>
    </div>
  );
}
