// app/mypage/together/manage/page.jsx (TogetherManagePage)
"use client";

import { useState, useEffect, useContext } from "react";
import TogetherMessage from "@/components/mypage/TogetherManagement/TogetherMessage";
import MyTogether from "@/components/mypage/TogetherManagement/MyTogether";
import { LoginContext } from "@/components/auth/LoginProvider";
import { loadPosts } from "@/lib/storage";
import { listChatRooms, getChatRoom } from "@/lib/chatApi";

export default function TogetherManagePage() {
  const [activeTab, setActiveTab] = useState("together");
  const [roomToOpen, setRoomToOpen] = useState(null);
  const [cards, setCards] = useState([]);
  const { user } = useContext(LoginContext);
  const currentUserId =
    user?.id || user?.user_id || user?.login_id || user?.loginId || null;

  // 방 열기 브로드캐스트 수신
  useEffect(() => {
    const onOpen = (e) => {
      const rid = e?.detail?.roomId;
      if (!rid) return;
      setActiveTab("together");
      setRoomToOpen(rid);
    };
    window.addEventListener("open-group-chat", onOpen);
    return () => window.removeEventListener("open-group-chat", onOpen);
  }, []);

  // ✅ 실제 데이터로 카드 구성
  useEffect(() => {
    if (!currentUserId) return;

    const fmtDate = (d) => {
      if (!d) return "0000.00.00";
      const t = new Date(d);
      return Number.isNaN(t.getTime())
        ? "0000.00.00"
        : t.toISOString().slice(0, 10).replaceAll("-", ".");
    };

    const toCardFromPost = (p) => {
      const snap = p.eventSnapshot || {};
      const img =
        snap.eventImage || snap.imgSrc || p.imgSrc || "/img/default_img.svg";
      const evName = snap.name || snap.title || p.eventName || "이벤트명";
      const evType = snap.eventType || p.eventType || "이벤트";
      const cur = p.currentParticipants ?? p.participants?.length ?? 0;
      const max = p.maxParticipants ?? p.maxPeople ?? p.companionCount ?? 0;
      return {
        togetherId: p.id,
        imgSrc: img,
        title: p.title || evName,
        eventType: evType,
        eventName: evName,
        date: fmtDate(p.meetingDate || p.companionDate || p.createdAt),
        group: `${cur}/${max}`,
        address: p.address || snap.location || "주소 정보 없음",
        author: p.author,
        author_login_id: p.author_login_id,
      };
    };

    const toCardFromRoomDetail = (detail) => {
      const t = detail?.together || detail?.togetherInfo;
      if (!t) return null;
      const ev = t.event || {};
      return {
        togetherId: t.id,
        imgSrc: t.eventImage || ev.image || "/img/default_img.svg",
        title: t.title || ev.name || "모집글 제목",
        eventType: t.eventType || ev.type || "이벤트",
        eventName: ev.name || t.eventName || "이벤트명",
        date: fmtDate(t.meetingDate),
        group: `${t.currentParticipants ?? 0}/${t.maxParticipants ?? 0}`,
        address: t.address || ev.location || "주소 정보 없음",
        author: t.host,
        author_login_id: t.host?.loginId,
        roomId: detail.id || detail.roomId, // 우측 GroupChat에서 바로 사용 가능
      };
    };

    (async () => {
      // 1) 내가 쓴/참여한 로컬 동행 글
      const allPosts = loadPosts("together");
      const mine = allPosts.filter((p) => {
        const aid = p.author?.id ?? p.authorId ?? p.author_login_id ?? "";
        return String(aid) === String(currentUserId);
      });
      const postCards = mine.map(toCardFromPost);

      if (postCards.length) {
        setCards(postCards);
        return;
      }

      // 2) 없으면 채팅방 상세에서 together를 꺼내 카드화
      try {
        const rooms = await listChatRooms();
        const details = await Promise.all(
          (rooms || []).map((r) =>
            getChatRoom(r.id ?? r.roomId).catch(() => null)
          )
        );
        const roomCards = details.map(toCardFromRoomDetail).filter(Boolean);
        setCards(roomCards);
      } catch {
        setCards([]);
      }
    })();
  }, [currentUserId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#26282a]">내 동행관리</h1>
        </div>

        <div className="mb-2">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("together")}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "together"
                  ? "text-[#26282a] border-[#26282a]"
                  : "text-[#76787a] border-transparent hover:text-[#26282a]"
              }`}>
              나의 소속 동행
            </button>
            <button
              onClick={() => setActiveTab("message")}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "message"
                  ? "text-[#26282a] border-[#26282a]"
                  : "text-[#76787a] border-transparent hover:text-[#26282a]"
              }`}>
              동행채팅
            </button>
          </div>
        </div>

        {activeTab === "together" ? (
          <MyTogether
            togetherCard={cards}
            externalRoomId={roomToOpen}
            currentUserId={currentUserId}
          />
        ) : (
          <TogetherMessage />
        )}
      </div>
    </div>
  );
}
