"use client";

import EventGallery from "@/components/events/main/EventGallery";
import GalleryLayout from "@/components/global/GalleryLayout";
import EditSetting from "@/components/global/EditSetting";
import { useEffect, useMemo, useState, useCallback } from "react";
import { toggleEventInterest } from "@/lib/api/eventApi";

export default function InterestEvent({ eventData = [] }) {
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [items, setItems] = useState(eventData);

  useEffect(() => setItems(eventData), [eventData]);

  const getId = useCallback((it) => String(it.id ?? it.eventId ?? ""), []);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onToggleEdit = useCallback(() => {
    setEditMode((v) => {
      const next = !v;
      if (!next) setSelectedIds(new Set());
      return next;
    });
  }, []);

  const onDeleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`선택한 ${selectedIds.size}개를 관심 해제할까요?`)) return;

    try {
      await Promise.all([...selectedIds].map((id) => toggleEventInterest(id)));
      // 로컬 목록에서 제거
      setItems((prev) => prev.filter((it) => !selectedIds.has(getId(it))));
      setSelectedIds(new Set()); // 편집모드 유지
    } catch (e) {
      console.error(e);
      alert("일부 항목 해제에 실패했습니다.");
    }
  }, [selectedIds, getId]);

  const galleryItems = useMemo(
    () =>
      items.map((it) => {
        const id = getId(it);
        return {
          ...it,
          editMode,
          selected: selectedIds.has(id),
          onToggleSelect: () => toggleSelect(id),
        };
      }),
    [items, editMode, selectedIds, toggleSelect, getId]
  );

  return (
    <>
      <EditSetting
        editMode={editMode}
        selectedCount={selectedIds.size}
        onToggleEdit={onToggleEdit}
        onDeleteSelected={onDeleteSelected}
      />

      {galleryItems.length === 0 ? (
        <div className="flex justify-center items-center h-40 text-gray-500">
          관심 등록한 이벤트가 없습니다.
        </div>
      ) : (
        <GalleryLayout Component={EventGallery} items={galleryItems} />
      )}
    </>
  );
}
