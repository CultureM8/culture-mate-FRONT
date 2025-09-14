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
    maxParticipants: 2,
    minAge: "제한없음",
    maxAge: "제한없음",
    meetingRegion: { level1: "", level2: "", level3: "" },
    meetingLocation: "",
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

    return {
      ...base,
      /* 동행 정보*/
      meetingDate: form.companionDate || null,
      maxParticipants: form.maxParticipants || 2,
      region: form.meetingRegion,
      meetingLocation: form.meetingLocation || "",
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