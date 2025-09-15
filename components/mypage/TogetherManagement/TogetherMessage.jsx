"use client";
import { useState, useEffect, useContext, useMemo, useRef } from "react";

import TogetherRequestChat from "@/components/mypage/TogetherManagement/TogetherRequestChat";
import ChatRequestCard from "@/components/mypage/TogetherManagement/ChatRequestCard";
import FriendProfileSlide from "@/components/mypage/FriendProfileSlide";
import { LoginContext } from "@/components/auth/LoginProvider";

import { togetherApi } from "@/lib/api/togetherApi";
import CacheManager from "@/lib/api/cacheManager";

import { listChatRooms, createChatRoom, joinRoom } from "@/lib/api/chatApi";

export default function TogetherMessage() {
  const [chatRequests, setChatRequests] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [activeTab, setActiveTab] = useState("received"); // "received" | "sent"
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "pending" | "accepted" | "rejected"

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isSlideVisible, setIsSlideVisible] = useState(false);

  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isFriendProfileVisible, setIsFriendProfileVisible] = useState(false);

  const [activeRoomId, setActiveRoomId] = useState(null);
  // ✅ roomId 간단 캐시 (postId/togetherId 기준)
  const roomCacheRef = useRef({});

  const { user } = useContext(LoginContext);
  const currentUserIdRaw = user?.id || user?.user_id || user?.login_id || null;
  const currentUserId =
    currentUserIdRaw != null ? String(currentUserIdRaw) : null;

  // 필터된 목록 (API에서 이미 필터링됨)
  const filteredRequests = useMemo(() => {
    return chatRequests;
  }, [chatRequests]);

  // 외부 이벤트로 채팅 열기
  useEffect(() => {
    const onOpen = (e) => {
      const ridNum = Number(e?.detail?.roomId);
      if (!Number.isFinite(ridNum)) return;
      setActiveRoomId(ridNum); // ✅ 숫자 보정
      setIsSlideVisible(true);
    };
    window.addEventListener("open-group-chat", onOpen);
    return () => window.removeEventListener("open-group-chat", onOpen);
  }, []);

  // 목록/카운트 로더 - 백엔드 데이터만 사용
  const loadAll = useMemo(() => {
    return async () => {
      if (!currentUserId) return;

      const cacheKey = `together_applications_${activeTab}_${filterStatus}_${currentUserId}`;

      try {
        let list = [];

        // 캐시 확인 (짧은 TTL로 성능 최적화)
        const cached = CacheManager.get(cacheKey);
        if (cached) {
          setChatRequests(cached);
          return;
        }

        if (activeTab === "received") {
          // 받은 신청: 백엔드 API 사용 (필터 상태에 따라 파라미터 전달)
          let statusParam = null;
          if (filterStatus !== "all") {
            // 프론트엔드 상태를 백엔드 상태로 매핑
            const statusMap = {
              "pending": "PENDING",
              "accepted": "APPROVED",
              "rejected": "REJECTED",
              "host": "HOST",
              "canceled": "CANCELED"
            };
            statusParam = statusMap[filterStatus] || filterStatus.toUpperCase();
          }
          const receivedApps = await togetherApi.getReceivedApplications(statusParam);
          list = receivedApps.map(app => ({
            requestId: app.requestId,
            fromUserId: app.applicantId,
            fromUserName: app.applicantName,
            fromUserProfileImage: app.applicantProfileImage,
            toUserId: app.hostId,
            toUserName: app.hostName,
            togetherId: app.togetherId,
            postId: app.togetherId,
            postTitle: app.togetherTitle,
            postDate: app.meetingDate,
            message: app.message || "동행 신청 메시지",
            status: app.status === "APPROVED" ? "accepted" :
                    app.status === "REJECTED" ? "rejected" :
                    app.status === "HOST" ? "host" :
                    app.status === "CANCELED" ? "canceled" :
                    "pending", // 백엔드 상태를 프론트엔드 형식으로 매핑
            eventName: app.eventName,
            eventType: app.eventType,
            eventImage: app.eventImage,
            createdAt: app.createdAt,
            roomId: app.applicationChatRoomId, // 1:1 신청용 채팅방 ID 매핑
            roomName: app.applicationChatRoomName, // 1:1 신청용 채팅방 이름 매핑
            isBackendData: true
          }));
        } else {
          // 보낸 신청: 백엔드 API 사용 (필터 상태에 따라 파라미터 전달)
          let statusParam = null;
          if (filterStatus !== "all") {
            // 프론트엔드 상태를 백엔드 상태로 매핑
            const statusMap = {
              "pending": "PENDING",
              "accepted": "APPROVED",
              "rejected": "REJECTED",
              "host": "HOST",
              "canceled": "CANCELED"
            };
            statusParam = statusMap[filterStatus] || filterStatus.toUpperCase();
          }
          console.log(`📤 보낸 신청 API 호출 시작 - statusParam:`, statusParam);
          const sentApps = await togetherApi.getMyApplications(statusParam);
          console.log(`📤 보낸 신청 API 응답:`, sentApps);

          // 데이터 구조 상세 확인
          if (sentApps.length > 0) {
            console.log(`📤 첫 번째 신청 데이터 상세:`, sentApps[0]);
            console.log(`📤 requestId:`, sentApps[0].requestId);
            console.log(`📤 message:`, sentApps[0].message);
            console.log(`📤 applicationChatRoomId:`, sentApps[0].applicationChatRoomId);
            console.log(`📤 applicationChatRoomName:`, sentApps[0].applicationChatRoomName);
          }
          list = sentApps.map(app => ({
            requestId: app.requestId,
            fromUserId: app.applicantId,
            fromUserName: app.applicantName,
            fromUserProfileImage: app.applicantProfileImage,
            toUserId: app.hostId,
            toUserName: app.hostName,
            togetherId: app.togetherId,
            postId: app.togetherId,
            postTitle: app.togetherTitle,
            postDate: app.meetingDate,
            message: app.message || "동행 신청 메시지",
            status: app.status === "APPROVED" ? "accepted" :
                    app.status === "REJECTED" ? "rejected" :
                    app.status === "HOST" ? "host" :
                    app.status === "CANCELED" ? "canceled" :
                    "pending", // 백엔드 상태를 프론트엔드 형식으로 매핑
            eventName: app.eventName,
            eventType: app.eventType,
            eventImage: app.eventImage,
            createdAt: app.createdAt,
            roomId: app.applicationChatRoomId, // 1:1 신청용 채팅방 ID 매핑
            roomName: app.applicationChatRoomName, // 1:1 신청용 채팅방 이름 매핑
            isBackendData: true
          }));
        }

        list.sort((a, b) => {
          const av = new Date(a.createdAt || 0).getTime();
          const bv = new Date(b.createdAt || 0).getTime();
          return bv - av;
        });

        // 캐시 저장 (짧은 TTL로 성능과 무결성 균형)
        CacheManager.set(cacheKey, list, 3000); // 3초 캐시

        setChatRequests(list);
        setUnreadCount(0); // 백엔드에서 unread count API 구현 필요
      } catch (error) {
        console.error("동행 신청 목록 로드 실패:", error);
        console.error("오류 상세:", {
          message: error.message,
          stack: error.stack,
          activeTab,
          filterStatus,
          currentUserId
        });

        // API 실패 시 빈 배열로 설정
        setChatRequests([]);
        setUnreadCount(0);

        // 에러 메시지 표시
        if (error.message?.includes('401') || error.message?.includes('403')) {
          console.log("인증이 필요합니다. 다시 로그인해주세요.");
        }
      }
    };
  }, [activeTab, currentUserId, filterStatus]);

  useEffect(() => {
    if (!currentUserId) return;
    loadAll();

    const interval = setInterval(loadAll, 10000); // 10초 간격으로 폴링
    const onSync = () => loadAll();
    const onStorage = (e) => {
      if (e.key === "chatRequests") loadAll();
    };

    window.addEventListener("chat-request:sync", onSync);
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("chat-request:sync", onSync);
      window.removeEventListener("storage", onStorage);
    };
  }, [loadAll, currentUserId]);

  // BroadcastChannel로 탭 간 동기화
  useEffect(() => {
    if (!currentUserId) return;
    const bc = new BroadcastChannel("chat-requests");
    const onMsg = () => loadAll();
    bc.addEventListener("message", onMsg);
    return () => {
      try {
        bc.removeEventListener("message", onMsg);
      } catch {}
      try {
        bc.close();
      } catch {}
    };
  }, [currentUserId, loadAll]);

  // 탭 전환 시 패널 리셋
  useEffect(() => {
    setIsSlideVisible(false);
    setIsFriendProfileVisible(false);
    setSelectedRequest(null);
    setSelectedFriend(null);
    setActiveRoomId(null);
  }, [activeTab]);

  // ------- 유틸 -------
  const nameContainsKey = (roomName, key) =>
    typeof roomName === "string" &&
    key != null &&
    String(roomName).includes(String(key));

  const getTargetKeyFromRequest = (req) =>
    req?.postId ?? req?.togetherId ?? req?.eventId ?? req?.together_id ?? null;

  const getOtherMemberId = (req) => {
    const me = currentUserId != null ? String(currentUserId) : null;
    const candidates = [
      req?.fromUserId,
      req?.toUserId,
      req?.from,
      req?.to,
      req?.hostId,
      req?.guestId,
    ].filter((v) => v != null);

    for (const c of candidates) {
      const s = String(c);
      if (me && s === me) continue;
      const n = Number(s);
      if (Number.isFinite(n)) return n;
    }
    return null;
  };

  // 방 보장 + 멤버 조인까지 (필요 최소)
  const ensureRoom = async (req) => {
    const targetKey = String(getTargetKeyFromRequest(req) ?? "");
    // ✅ 캐시 우선
    if (targetKey && roomCacheRef.current[targetKey]) {
      return roomCacheRef.current[targetKey];
    }

    // ✅ 요청에 roomId 이미 있으면 즉시 반환
    if (req?.roomId) {
      if (targetKey) roomCacheRef.current[targetKey] = req.roomId;
      // 참가 등록은 파이어-앤-포겟
      try {
        const meNum = Number(currentUserId);
        if (Number.isFinite(meNum)) joinRoom(req.roomId, meNum);
      } catch {}
      try {
        const otherNum = getOtherMemberId(req);
        if (Number.isFinite(otherNum)) joinRoom(req.roomId, otherNum);
      } catch {}
      return req.roomId;
    }

    let rid = null;

    try {
      const roomsRaw = await listChatRooms();
      const rooms = Array.isArray(roomsRaw)
        ? roomsRaw
        : roomsRaw?.data ||
          roomsRaw?.items ||
          roomsRaw?.list ||
          roomsRaw?.rooms ||
          [];
      // 1) roomName에 post/together/event 키가 포함된 방 찾기 (우선 postId)
      const postKey = targetKey;
      const me = String(req?.toUserId ?? "");
      const him = String(req?.fromUserId ?? "");
      const byName =
        rooms.find(
          (r) =>
            typeof r?.roomName === "string" &&
            r.roomName.includes(postKey) &&
            r.roomName.includes(me) &&
            r.roomName.includes(him)
        ) ||
        rooms.find(
          (r) => typeof r?.roomName === "string" && r.roomName.includes(postKey)
        ) ||
        rooms.find(
          (r) =>
            typeof r?.roomName === "string" &&
            r.roomName.includes(me) &&
            r.roomName.includes(him)
        );
      rid = byName?.id ?? byName?.roomId ?? null;

      // 2) 없으면 생성 (서버가 보유 중인 네이밍과 맞춥니다)
      if (!rid) {
        const name = postKey ? `채팅방 - ${postKey}` : `채팅방 - ${Date.now()}`;
        const created = await createChatRoom(name);
        rid = created?.id ?? created?.roomId ?? null;
      }
    } catch (e) {
      console.warn("방 목록/생성 실패:", e);
    }

    // 3) 멤버 조인 (파이어-앤-포겟, UI 블로킹 금지)
    if (rid) {
      // 캐시 저장
      if (targetKey) roomCacheRef.current[targetKey] = rid;
      // 참가는 기다리지 않음
      (async () => {
        try {
          const meNum = Number(currentUserId);
          if (Number.isFinite(meNum)) await joinRoom(rid, meNum);
        } catch (e) {
          console.warn("나 조인 실패(무시):", e);
        }
      })();
      (async () => {
        try {
          const otherNum = getOtherMemberId(req);
          if (Number.isFinite(otherNum)) await joinRoom(rid, otherNum);
        } catch (e) {
          console.warn("상대 조인 실패(무시):", e);
        }
      })();
    }

    return rid;
  };

  // ------- 액션 -------
  const handleAcceptRequest = async (requestId) => {
    try {
      const selectedReq = chatRequests.find(r => r.requestId === requestId);

      if (!selectedReq?.isBackendData) {
        console.warn("백엔드 데이터가 아닙니다. 처리할 수 없습니다.");
        return;
      }

      const togetherId = selectedReq.togetherId;
      const participantId = selectedReq.fromUserId;

      // 백엔드 API 호출 (응답이 없는 void API)
      await togetherApi.approveParticipation(togetherId, participantId);

      // 캐시 무효화: 모든 필터 상태의 캐시 제거
      CacheManager.clearPattern(`together_applications_`);
      await loadAll();

      const req =
        selectedRequest?.requestId === requestId
          ? selectedRequest
          : chatRequests.find((r) => r.requestId === requestId);

      let rid = null;

      if (req?.roomId != null) {
        rid = req.roomId;
      } else {
        const rooms = await listChatRooms();
        const rows = Array.isArray(rooms) ? rooms : [];
        const post = req?.postId ? String(req.postId) : "";
        const me = String(req?.toUserId ?? "");
        const him = String(req?.fromUserId ?? "");
        const nameHit =
          rows.find(
            (r) =>
              String(r.roomName || "").includes(post) &&
              String(r.roomName || "").includes(me) &&
              String(r.roomName || "").includes(him)
          ) ||
          rows.find((r) => String(r.roomName || "").includes(post)) ||
          rows.find(
            (r) =>
              String(r.roomName || "").includes(me) &&
              String(r.roomName || "").includes(him)
          );
        rid = nameHit?.id ?? nameHit?.roomId ?? null;

        if (!rid) {
          // 없으면 생성
          const name = post ? `채팅방 - ${post}` : `채팅방 - ${Date.now()}`;
          const created = await createChatRoom(name);
          rid = created?.id ?? created?.roomId ?? null;
        }
      }

      if (!rid) {
        alert("채팅방을 찾지 못했습니다. 다시 시도해주세요.");
        return null;
      }

      // 두 명 모두 참가
      const meIdNum = Number(currentUserId);
      if (Number.isFinite(meIdNum)) {
        try {
          await joinRoom(Number(rid), meIdNum);
        } catch (e) {
          console.warn("내 방참가 실패(무시 가능):", e);
        }
      }

      const peerIdRaw =
        req && (req.fromUserId ?? req.toUserId) != null
          ? req.status === "accepted" && activeTab === "received"
            ? req.fromUserId
            : req.toUserId
          : activeTab === "received"
          ? req?.fromUserId
          : req?.toUserId;

      const peerIdNum = Number(peerIdRaw);
      if (Number.isFinite(peerIdNum)) {
        try {
          await joinRoom(Number(rid), peerIdNum);
        } catch (e) {
          console.warn("상대 방참가 실패(무시 가능):", e);
        }
      }

      // ✅ 숫자로 세팅
      setActiveRoomId(Number(rid));
      setIsSlideVisible(true);

      // 브로드캐스트 (선택)
      try {
        window.dispatchEvent(
          new CustomEvent("open-group-chat", {
            detail: { roomId: Number(rid) },
          })
        );
      } catch {}

      alert("동행 신청을 수락했습니다!");
      return Number(rid);
    } catch (e) {
      console.error(e);
      alert("신청 처리에 실패했습니다.");
      return null;
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const selectedReq = chatRequests.find(r => r.requestId === requestId);

      if (!selectedReq?.isBackendData) {
        console.warn("백엔드 데이터가 아닙니다. 처리할 수 없습니다.");
        return;
      }

      const togetherId = selectedReq.togetherId;
      const participantId = selectedReq.fromUserId;

      // 백엔드 API 호출 (응답이 없는 void API)
      await togetherApi.rejectParticipation(togetherId, participantId);

      // 캐시 무효화: 모든 필터 상태의 캐시 제거
      CacheManager.clearPattern(`together_applications_`);
      await loadAll();

      alert("동행 신청을 거절했습니다.");
    } catch (e) {
      console.error("거절 처리 실패:", e);
      alert(`신청 처리에 실패했습니다: ${e.message}`);
    }
  };

  // 취소 처리 (본인이 보낸 신청을 취소)
  const handleCancelRequest = async (requestId) => {
    if (!requestId) {
      alert("요청 ID가 없습니다.");
      return;
    }

    const selectedReq = chatRequests.find((req) => req.requestId === requestId);
    if (!selectedReq) {
      alert("요청을 찾을 수 없습니다.");
      return;
    }

    if (!confirm("정말로 동행 신청을 취소하시겠습니까?")) {
      return;
    }

    try {
      const togetherId = selectedReq.togetherId;
      console.log('🚫 취소 요청 시작:', { requestId, togetherId, selectedReq });

      // 본인 참여 취소 API 호출
      await togetherApi.cancelParticipation(togetherId);
      console.log('✅ 취소 API 호출 성공');

      // 캐시 무효화: 모든 필터 상태의 캐시 제거
      CacheManager.clearPattern(`together_applications_`);

      // 취소된 항목을 보기 위해 전체 탭으로 이동
      setFilterStatus("all");
      await loadAll();

      alert("동행 신청을 취소했습니다.");
    } catch (e) {
      console.error("취소 처리 실패:", e);
      alert(`신청 취소에 실패했습니다: ${e.message}`);
    }
  };

  const handleOpenChat = (request) => {
    // ✅ 패널을 '즉시' 열고
    setSelectedRequest(request);
    setSelectedFriend(null);
    setIsFriendProfileVisible(false);
    setIsSlideVisible(true);
    setActiveRoomId(null); // roomId 없어도 패널은 렌더 (자식이 '연결중'만 표시)

    // ✅ 방 찾기/생성은 백그라운드로 (UI 블로킹 X)
    (async () => {
      try {
        const roomId = request?.roomId ?? (await ensureRoom(request));
        if (roomId) setActiveRoomId(roomId);
      } catch (e) {
        console.warn("[채팅방 매칭 실패]", {
          from: String(request?.from ?? request?.fromUserId ?? ""),
          to: String(request?.to ?? request?.toUserId ?? ""),
          postId: request?.postId,
          togetherId_raw: request?.togetherId,
          eventId: request?.eventId,
        });
        // 패널은 열린 상태 유지, 토스트만 띄우거나 무시
      }
    })();
  };

  const handleOpenChatRoom = handleOpenChat;

  const handleSlideClose = () => {
    setIsSlideVisible(false);
    setIsFriendProfileVisible(false);
    setSelectedFriend(null);
  };

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
    setIsFriendProfileVisible(true);
  };

  const handleBackToChat = () => {
    setIsFriendProfileVisible(false);
    setSelectedFriend(null);
  };

  if (!currentUserId) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        로그인 정보를 확인 중입니다…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="flex justify-between mb-2">
        <span className="flex gap-2">
          {["received", "sent"].map((k) => (
            <button
              key={k}
              onClick={() => setActiveTab(k)}
              className={`px-3 py-2 rounded-lg text-xs transition-colors min-w-[80px] ${
                activeTab === k
                  ? "bg-blue-500 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}>
              {k === "received"
                ? `받은 신청${unreadCount > 0 ? ` (${unreadCount})` : ""}`
                : "보낸 신청"
              }
            </button>
          ))}
        </span>

        <span className="w-fit">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs px-2 py-2 border border-gray-300 rounded-lg bg-white text-[#26282a] focus:outline-none focus:border-[#26282a] focus:ring focus:ring-blue-500 min-w-[80px]">
            <option value="all">전체</option>
            <option value="pending">대기중</option>
            <option value="accepted">수락됨</option>
            <option value="rejected">거절됨</option>
          </select>
        </span>
      </div>

      {/* 본문 */}
      <div className="flex gap-0 flex-1 max-h-[800px] min-h-[600px]">
        {/* 목록 */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isSlideVisible ? "w-1/2" : "w-full"
          }`}>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full">
            {filteredRequests.length > 0 ? (
              <div className="space-y-0 overflow-y-auto h-full">
                {filteredRequests.map((request, index) => (
                  <div
                    key={request.requestId || `request-${index}`}
                    onClick={() => handleOpenChat(request)}
                    className={`cursor-pointer transition-colors duration-200 ${
                      selectedRequest?.requestId === request.requestId
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : "hover:bg-gray-50"
                    }`}>
                    {/* 카드 or 간단 미리보기 컴포넌트 */}
                    <ChatRequestCard
                      request={request}
                      onAccept={handleAcceptRequest}
                      onReject={handleRejectRequest}
                      onCancel={handleCancelRequest}
                      onOpenChat={handleOpenChatRoom}
                      type={activeTab}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <div className="text-[#76787a]">
                  {activeTab === "received" ? (
                    <>
                      <p className="text-lg mb-2">받은 채팅 신청이 없습니다</p>
                      <p className="text-sm">
                        동행 모집글을 작성하여 신청을 받아보세요!
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg mb-2">보낸 채팅 신청이 없습니다</p>
                      <p className="text-sm">
                        관심있는 동행에 채팅을 신청해보세요!
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽 슬라이드 (채팅/프로필) */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isSlideVisible ? "w-1/2" : "w-0"
          }`}>
          <div className="w-full h-full bg-white rounded-lg shadow-sm ml-2 flex flex-col">
            {isFriendProfileVisible ? (
              <div className="relative w/full h/full">
                <div className="absolute top-4 left-4 z-10">
                  <button
                    onClick={handleFriendClick}
                    className="p-2 bg-white hover:bg-gray-100 rounded-full shadow-md transition-colors duration-200">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                </div>
                <FriendProfileSlide
                  friend={selectedFriend}
                  isVisible={isFriendProfileVisible}
                  onClose={handleSlideClose}
                />
              </div>
            ) : (
              selectedRequest && (
                <div className="flex-1 flex flex-col min-h-0">
                  <TogetherRequestChat
                    chatRequestData={selectedRequest}
                    roomId={activeRoomId}
                    onClose={handleSlideClose}
                    onFriendClick={setSelectedFriend}
                    onAccept={handleAcceptRequest}
                    onReject={handleRejectRequest}
                    isFromSentBox={activeTab === "sent"}
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
