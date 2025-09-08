"use client";

import { useState } from "react";
import { makePost, toCard } from "@/lib/schema";
import { parseCount } from "@/lib/togetherMap";

export default function useTogetherWriteState() {
  /*PostEventMiniCard 스키마(toCard)로 정규화된 이벤트 스냅샷*/
  const [selectedEvent, setSelectedEvent] = useState(null);

  /*작성 폼 상태*/
  const [form, setForm] = useState({
    companionDate: "" /* YYYY-MM-DD 등*/,
    companionCount: "" /*"2명" 등 문자열 -> 저장 시 숫자로 변환*/,
    minAge: "제한없음",
    maxAge: "제한없음",
    locationQuery: "",
  });

  /*폼 변경 콜백*/
  const handleFormChange = (fd) => setForm(fd);

  /* 이벤트 선택 시 단 한번 toCard로 정규화*/
  const handleEventSelect = (raw) => setSelectedEvent(raw ? toCard(raw) : null);

  const buildPost = ({ title, content }) => {
    const base = makePost({
      board: "together",
      title,
      content,
      mode: "plain",
      eventId: selectedEvent?.id ?? null,
      eventSnapshot: selectedEvent ?? null,
    });

    const count = parseCount(form.companionCount);

    return {
      ...base,
      /* 동행 정보*/
      companionDate: form.companionDate || null,
      companionCount: Number.isFinite(count) ? count : null,
      /*레거시 호환(일부 뷰에서 maxPeople를 참조할 수 있어 같이 채워줌)*/
      maxPeople: Number.isFinite(count) ? count : null,
      minAge: form.minAge,
      maxAge: form.maxAge,
      locationQuery: form.locationQuery || "",
    };
  };

  return {
    selectedEvent,
    handleEventSelect,
    form,
    handleFormChange,
    buildPost,
  };
}
