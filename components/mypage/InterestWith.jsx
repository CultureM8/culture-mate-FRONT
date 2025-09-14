"use client";

import { useEffect, useState } from "react";

import MenuList from "../global/MenuList";
import TogetherGallery from "@/components/together/TogetherGallery";
import TogetherList from "../together/TogetherList";
import ListLayout from "../global/ListLayout";
import GalleryLayout from "@/components/global/GalleryLayout";
import EditSetting from "@/components/global/EditSetting";

import {
  getUserInterestTogether,
  toggleTogetherInterest,
} from "@/lib/api/togetherApi";

const getTid = (item) => {
  const raw = item?.id ?? item?.togetherId ?? item?.togetherID;
  return raw != null ? String(raw) : null;
};

export default function InterestWith({ togetherData }) {
  const [viewType, setViewType] = useState("gallery"); // "gallery" | "list"
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [items, setItems] = useState(() =>
    Array.isArray(togetherData) ? togetherData.filter((x) => getTid(x)) : []
  );
  const [loading, setLoading] = useState(!Array.isArray(togetherData));
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    if (Array.isArray(togetherData)) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const list = await getUserInterestTogether();
        if (!alive) return;
        setItems(Array.isArray(list) ? list.filter((x) => getTid(x)) : []);
      } catch (e) {
        console.error("관심 동행 목록 조회 실패:", e);
        setError("목록을 불러오지 못했습니다.");
        setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [togetherData]);

  // 하트 클릭으로 관심 해제되면 목록에서 제거
  useEffect(() => {
    const onInterest = (e) => {
      const { togetherId, interested } = e.detail || {};
      if (!togetherId) return;
      if (interested === false) {
        setItems((prev) =>
          prev.filter((it) => getTid(it) !== String(togetherId))
        );
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(String(togetherId));
          return next;
        });
      }
    };
    window.addEventListener("together-interest-changed", onInterest);
    return () =>
      window.removeEventListener("together-interest-changed", onInterest);
  }, []);

  const handleToggleEdit = () => {
    setEditMode((v) => !v);
    setSelectedIds(new Set());
  };

  const toggleSelect = (tid) => {
    if (!tid) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const key = String(tid);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`선택한 ${selectedIds.size}개 항목의 관심을 해제하시겠어요?`))
      return;

    const ids = [...selectedIds];
    try {
      await Promise.all(
        ids.map(async (id) => {
          try {
            const msg = await toggleTogetherInterest(id);
            if (/취소/.test(String(msg))) {
              setItems((prev) =>
                prev.filter((it) => getTid(it) !== String(id))
              );
            }
          } catch (e) {
            console.error(`관심 해제 실패(${id}):`, e);
          }
        })
      );
    } finally {
      setSelectedIds(new Set());
    }
  };

  const selectedCount = selectedIds.size;

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex gap-6">
          <MenuList selected={viewType} onChange={setViewType} />
        </div>
        <EditSetting
          editMode={editMode}
          selectedCount={selectedCount}
          onToggleEdit={handleToggleEdit}
          onDeleteSelected={handleDeleteSelected}
        />
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-500">불러오는 중…</div>
      ) : error ? (
        <div className="py-10 text-center text-red-500">{error}</div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center text-gray-500">
          관심 등록한 동행이 없습니다.
        </div>
      ) : viewType === "gallery" ? (
        <GalleryLayout
          Component={TogetherGallery}
          items={items.map((it) => {
            const tid = getTid(it);
            return {
              ...it,
              id: tid, // TogetherGallery 링크용
              togetherId: tid,
              isInterested: true, // 하트 초기상태
              editMode, // ✅ 갤러리에도 편집 프롭 전달
              selected: selectedIds.has(String(tid)),
              onToggleSelect: () => toggleSelect(String(tid)),
            };
          })}
        />
      ) : (
        <ListLayout
          Component={TogetherList}
          items={items.map((it) => {
            const tid = getTid(it);
            return {
              ...it,
              id: tid,
              togetherId: tid,
              editMode,
              selected: selectedIds.has(String(tid)),
              isInterested: true,
              onToggleSelect: () => toggleSelect(String(tid)),
            };
          })}
        />
      )}
    </>
  );
}
