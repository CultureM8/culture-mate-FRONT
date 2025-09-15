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

  // 관심 상태 변경 이벤트 리스너 (Gallery 하트 클릭도 감지)
  useEffect(() => {
    const handleInterestChanged = (event) => {
      const { eventId: changedEventId, interested } = event.detail;

      console.log("InterestEvent - 관심 상태 변경 감지:", {
        changedEventId,
        interested
      });

      if (!interested) {
        // 관심 해제된 경우 목록에서 제거
        setItems(prevItems => {
          const filtered = prevItems.filter(item =>
            String(item.id ?? item.eventId) !== String(changedEventId)
          );
          console.log(`InterestEvent - 이벤트 ${changedEventId} 목록에서 제거`);
          return filtered;
        });

        // 선택된 항목에서도 제거
        setSelectedIds(prevSelected => {
          const next = new Set(prevSelected);
          next.delete(String(changedEventId));
          return next;
        });
      } else {
        // 관심 등록된 경우는 새로고침으로 처리하거나 무시
        // (이미 관심 목록에 있을 확률이 높으므로)
        console.log(`InterestEvent - 이벤트 ${changedEventId} 관심 등록`);
      }
    };

    window.addEventListener("event-interest-changed", handleInterestChanged);
    return () => window.removeEventListener("event-interest-changed", handleInterestChanged);
  }, []);

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
      // 선택된 이벤트들의 관심 해제
      await Promise.all([...selectedIds].map((id) => toggleEventInterest(id)));

      // 다른 컴포넌트들에게 관심 해제 알림 (즉시 실행 + localStorage)
      console.log("🚀 InterestEvent - 대량 삭제 이벤트 발생 시작");

      selectedIds.forEach(eventId => {
        // localStorage에 상태 저장 (크로스 페이지 동기화)
        const storageKey = `event_interest_${eventId}`;
        const storageData = {
          eventId: String(eventId),
          interested: false,
          timestamp: Date.now()
        };
        localStorage.setItem(storageKey, JSON.stringify(storageData));

        // 이벤트 발생
        window.dispatchEvent(
          new CustomEvent("event-interest-changed", {
            detail: { eventId: String(eventId), interested: false },
          })
        );

        // storage 이벤트도 트리거 (크로스 페이지 동기화)
        window.dispatchEvent(new StorageEvent('storage', {
          key: storageKey,
          newValue: JSON.stringify(storageData),
          storageArea: localStorage
        }));
      });

      console.log("✅ InterestEvent - 대량 삭제 이벤트 발생 완료");

      // 로컬 목록에서 제거
      setItems((prev) => prev.filter((it) => !selectedIds.has(getId(it))));
      setSelectedIds(new Set()); // 편집모드 유지

      console.log(`InterestEvent - ${selectedIds.size}개 이벤트 관심 해제 완료`);
    } catch (e) {
      console.error(e);
      alert("일부 항목 해제에 실패했습니다.");
    }
  }, [selectedIds, getId]);

  const galleryItems = useMemo(
    () =>
      items.map((it) => {
        const id = getId(it);
        console.log("InterestEvent - Gallery 아이템 생성:", {
          id,
          title: it.title,
          originalIsInterested: it.isInterested,
          settingIsInterested: true
        });
        return {
          ...it,
          editMode,
          selected: selectedIds.has(id),
          onToggleSelect: () => toggleSelect(id),
          isInterested: true, // 관심 목록의 모든 아이템은 관심 등록 상태
          initialInterest: true, // Gallery 컴포넌트의 초기값도 true로 설정
          enableInterest: true, // 하트 버튼 활성화
          disableEventSync: true, // InterestEvent 컨텍스트에서는 이벤트 동기화 비활성화
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
