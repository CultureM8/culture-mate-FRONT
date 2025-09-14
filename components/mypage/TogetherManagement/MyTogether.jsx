"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import TogetherList from "@/components/together/TogetherList";
import GroupChat from "@/components/mypage/TogetherManagement/GroupChat";
import useLogin from "@/hooks/useLogin";
import { togetherApi } from "@/lib/api/togetherApi";
import { pickReadableName } from "@/lib/nameUtils";

export default function MyTogether({
  togetherCard = [],
  externalRoomId = null,
  currentUserId = null,
  currentUserName = null,
}) {
  const { ready, isLogined, user } = useLogin();

  // 사용자 ID 추출 (useLogin 훅 사용)
  const effectiveUserId = currentUserId ?? user?.id ?? user?.user_id ?? user?.memberId ?? null;
  const effectiveUserName = currentUserName ?? user?.display_name ?? user?.nickname ?? user?.login_id ?? (effectiveUserId != null ? String(effectiveUserId) : "사용자");

  // 상태 관리
  const [roleFilter, setRoleFilter] = useState("all"); // all | host | guest
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 좌측 리스트/슬라이드
  const [selectedTogether, setSelectedTogether] = useState(null);
  const [isSlideVisible, setIsSlideVisible] = useState(false);
  const [forcedRoomId, setForcedRoomId] = useState(null);
  const [chatError, setChatError] = useState(null); // 채팅방 관련 에러
  const [chatRoomData, setChatRoomData] = useState(null); // 백엔드에서 받은 채팅방 데이터

  // 호스트/게스트 데이터
  const [hostItems, setHostItems] = useState([]);
  const [guestItems, setGuestItems] = useState([]);
  const [allItems, setAllItems] = useState([]);

  // 카드 클릭
  const handleTogetherListClick = (item) => {
    console.log('🎯 Together 선택됨:', item);
    setSelectedTogether(item);
    setIsSlideVisible(true);
    setChatError(null); // 새 동행 선택시 에러 초기화
    setChatRoomData(null); // 채팅방 데이터 초기화
    setForcedRoomId(null); // 강제 roomId 초기화
  };

  const handleSlideClose = () => {
    setIsSlideVisible(false);
    setChatError(null); // 슬라이드 닫을 때도 에러 초기화
    setChatRoomData(null); // 채팅방 데이터 초기화
  };

  // 미래 날짜만 필터링하는 헬퍼 함수
  const filterUpcoming = (items) => {
    return items.filter(item => {
      const meetingDate = new Date(item.meetingDate);
      return meetingDate > new Date(); // 모임날짜가 현재보다 미래
    });
  };

  // 동행 데이터 로드 (History 패턴 적용)
  const loadTogetherData = useCallback(async () => {
    if (!isLogined || !effectiveUserId) {
      setHostItems([]);
      setGuestItems([]);
      setAllItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 호스트 동행과 게스트 동행 병렬 로드 (History와 동일한 패턴)
      const [hostData, guestData] = await Promise.all([
        togetherApi.getByHost(effectiveUserId),
        togetherApi.getMyApplications('APPROVED').catch(() => []) // 실패 시 빈 배열
      ]);

      // 미래 날짜만 필터링
      const upcomingHostData = filterUpcoming(Array.isArray(hostData) ? hostData : []);
      const upcomingGuestData = filterUpcoming(Array.isArray(guestData) ? guestData : []);

      // 데이터 구조 디버깅
      console.log('🔵 호스트 원본 데이터:', upcomingHostData);
      console.log('🟢 게스트 원본 데이터:', upcomingGuestData);

      // 호스트 데이터 분석 및 매핑
      const markedHostData = upcomingHostData.map(item => {
        console.log('🔵 호스트 원본 아이템:', item);

        // 호스트 데이터에 이벤트 정보 매핑
        const mapped = {
          ...item,
          source: 'host',
          isHost: true,
          // TogetherList가 찾는 필드들 직접 매핑
          eventName: item.event?.title || item.eventName,
          eventType: item.event?.eventType || item.eventType,
          eventImage: item.event?.thumbnailImagePath || item.eventImage,
          imgSrc: item.event?.thumbnailImagePath || item.imgSrc,
          // eventSnapshot도 매핑
          eventSnapshot: item.event ? {
            name: item.event.title,
            eventType: item.event.eventType,
            eventImage: item.event.thumbnailImagePath,
            location: item.event.location
          } : item.eventSnapshot
        };

        console.log('🔵 호스트 매핑 결과:', mapped);
        return mapped;
      });

      const markedGuestData = upcomingGuestData.map(item => {
        console.log('🟢 게스트 원본 아이템:', item);

        // 게스트 데이터 매핑 - 이제 TogetherDto.Response와 동일한 구조
        const mapped = {
          ...item,
          source: 'guest',
          isHost: false,
          // 이벤트 정보 매핑 (호스트 매핑과 동일)
          eventName: item.event?.title || item.eventName,
          eventType: item.event?.eventType || item.eventType,
          eventImage: item.event?.thumbnailImagePath || item.eventImage,
          imgSrc: item.event?.thumbnailImagePath || item.imgSrc,
          eventSnapshot: item.event ? {
            name: item.event.title,
            eventType: item.event.eventType,
            eventImage: item.event.thumbnailImagePath,
            location: item.event.location
          } : item.eventSnapshot
        };

        console.log('🟢 게스트 매핑 결과:', mapped);
        return mapped;
      });

      // 전체 데이터 합치기
      const combinedData = [...markedHostData, ...markedGuestData];

      // 생성일 기준 내림차순 정렬
      combinedData.sort((a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

      setHostItems(markedHostData);
      setGuestItems(markedGuestData);
      setAllItems(combinedData);
    } catch (err) {
      console.error("동행 데이터 로드 실패:", err);
      setError("동행 목록을 불러오는데 실패했습니다.");
      setHostItems([]);
      setGuestItems([]);
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  }, [isLogined, effectiveUserId]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadTogetherData();
  }, [loadTogetherData]);

  // 외부에서 roomId 직접 열기
  useEffect(() => {
    if (!externalRoomId) return;
    setForcedRoomId(externalRoomId);
    if (!selectedTogether) {
      setSelectedTogether({
        title: "그룹 채팅",
        togetherId: `room-${externalRoomId}`,
      });
    }
    setIsSlideVisible(true);
  }, [externalRoomId]);

  // ✅ RequestChat → "open-group-chat" 이벤트 수신해서 GroupChat 패널 열기
  useEffect(() => {
    const onOpenGroupChat = (e) => {
      const rid = e?.detail?.roomId;
      if (!rid) return;
      setForcedRoomId(rid);
      setIsSlideVisible(true);

      // 좌측 카드 미선택 상태라면 임시 선택값 세팅(레이아웃 변화 없음)
      if (!selectedTogether) {
        setSelectedTogether({
          title: "그룹 채팅",
          togetherId: `room-${rid}`,
        });
      }
    };
    window.addEventListener("open-group-chat", onOpenGroupChat);
    return () => window.removeEventListener("open-group-chat", onOpenGroupChat);
  }, [selectedTogether]);

  // 카드 클릭 시 동행 전용 채팅방 조회
  useEffect(() => {
    console.log('🚪 채팅방 로딩 useEffect 실행:', selectedTogether);
    if (!selectedTogether) return;
    if (forcedRoomId) return;
    const tgtId = selectedTogether.togetherId ?? selectedTogether.id;
    console.log('🚪 채팅방 로딩 시도 - tgtId:', tgtId);
    if (!tgtId) return;

    let stop = false;
    (async () => {
      try {
        // 새로운 Together 전용 채팅방 API 사용
        console.log('🚪 getTogetherChatRoom 호출:', tgtId);
        const chatRoomData = await togetherApi.getTogetherChatRoom(tgtId);
        console.log('🚪 getTogetherChatRoom 응답:', chatRoomData);

        if (chatRoomData) {
          // 백엔드에서 host 정보가 포함된 채팅방 데이터 저장
          const actualRoomId = chatRoomData.id ?? chatRoomData.roomId;
          console.log('🚪 실제 roomId 설정:', actualRoomId);

          if (!stop) {
            setChatRoomData(chatRoomData);
            setForcedRoomId(actualRoomId);
            console.log('✅ 채팅방 데이터 및 roomId 설정 완료:', actualRoomId);
          }
          return;
        }

        // 채팅방이 없는 경우
        console.warn(`동행 ${tgtId}의 채팅방을 찾을 수 없습니다. 참여 상태: ${selectedTogether.isHost ? '호스트' : '게스트'}`);
        if (!stop) {
          setChatError("해당 동행의 채팅방에 접근할 수 없습니다. 동행 참여가 승인되었는지 확인해주세요.");
        }
      } catch (error) {
        console.error("채팅방 조회 실패:", error);
        if (!stop) {
          if (error.message?.includes('403')) {
            setChatError("채팅방에 접근할 권한이 없습니다.");
          } else if (error.message?.includes('404')) {
            setChatError("채팅방을 찾을 수 없습니다.");
          } else {
            setChatError("채팅방 정보를 불러오는데 실패했습니다. 새로고침 후 다시 시도해주세요.");
          }
        }
      }
    })();

    return () => {
      stop = true;
    };
  }, [selectedTogether, forcedRoomId]);

  // 카드 클릭 시 roomId 탐색/생성 (현재 비활성화 - getTogetherChatRoom API 사용)
  useEffect(() => {
    // TODO: listChatRooms 함수가 정의되지 않아 임시 비활성화
    return;

    if (!selectedTogether) return;
    if (forcedRoomId) return;
    const tgtId = selectedTogether.togetherId ?? selectedTogether.id;
    if (!tgtId) return;

    let stop = false;
    (async () => {
      try {
        const roomsRaw = await listChatRooms();
        const rooms = Array.isArray(roomsRaw)
          ? roomsRaw
          : roomsRaw?.data ||
            roomsRaw?.items ||
            roomsRaw?.list ||
            roomsRaw?.rooms ||
            [];

        // 1) 리스트에서 together 매칭
        for (const r of rooms) {
          if (r?.together?.id && String(r.together.id) === String(tgtId)) {
            if (!stop) setForcedRoomId(r.id ?? r.roomId);
            return;
          }
        }

        // 2) 상세 스캔
        for (const r of rooms) {
          const rid = r?.id ?? r?.roomId;
          if (!rid) continue;
          const detail = await getChatRoom(rid);
          const tid = detail?.together?.id ?? detail?.togetherId;
          if (String(tid) === String(tgtId)) {
            if (!stop) setForcedRoomId(rid);
            return;
          }
        }

        // 3) 없으면(선택) 생성 시도 — 모듈 없으면 그냥 패스
        try {
          const mod = await import("@/lib/chatApi");
          if (typeof mod.createChatRoom === "function") {
            const newRoom = await mod.createChatRoom(
              `${selectedTogether.title || "단체 채팅"} - ${tgtId}`
            );
            if (!stop && newRoom?.id) setForcedRoomId(newRoom.id);
          }
        } catch {
          /* 생성 API 미제공 환경이면 무시 */
        }
      } catch (error) {
        console.warn("채팅방 생성/탐색 실패:", error);
        if (!stop) {
          setForcedRoomId(tgtId); // 임시 폴백
        }
      }
    })();

    return () => {
      stop = true;
    };
  }, [selectedTogether, forcedRoomId]);

  // GroupChat에 넘길 데이터
  const groupData = useMemo(() => {
    const rid =
      forcedRoomId ??
      selectedTogether?.roomId ??
      selectedTogether?.chatRoomId ??
      selectedTogether?.groupRoomId ??
      selectedTogether?.togetherRoomId ??
      null;

    console.log('🎯 groupData 생성 - rid 계산:', {
      forcedRoomId,
      selectedTogetherId: selectedTogether?.togetherId ?? selectedTogether?.id,
      calculatedRid: rid,
      roomIdSources: {
        selectedTogetherRoomId: selectedTogether?.roomId,
        chatRoomId: selectedTogether?.chatRoomId,
        groupRoomId: selectedTogether?.groupRoomId,
        togetherRoomId: selectedTogether?.togetherRoomId
      }
    });

    // 백엔드에서 받은 host 정보 우선 사용
    const hostFromBackend = chatRoomData?.host;

    // 작성자(호스트) ID/이름 - 백엔드 데이터 우선
    const hostIdRaw =
      hostFromBackend?.id ??
      selectedTogether?.author?.id ??
      selectedTogether?.authorId ??
      selectedTogether?.author?.user_id ??
      selectedTogether?.author_login_id ??
      selectedTogether?.author?.login_id ??
      null;

    const hostName = hostFromBackend?.name ??
      pickReadableName(
        selectedTogether?.author?.memberDetail?.nickname,
        selectedTogether?.author?.nickname,
        selectedTogether?.author?.login_id,
        selectedTogether?.author_login_id
      );

    const meName = pickReadableName(effectiveUserName);

    const participantsSeed = [
      effectiveUserId && {
        id: String(effectiveUserId),
        name: meName,
        avatar: "/img/default_img.svg",
        isHost: false,
      },
      hostIdRaw && {
        id: String(hostIdRaw),
        name: hostName || "작성자",
        avatar: "/img/default_img.svg",
        isHost: true,
      },
    ].filter(Boolean);

    if (!rid) {
      const togetherId = selectedTogether?.togetherId ?? selectedTogether?.id;
      return {
        roomId: null, // 실제 채팅방 ID가 없으면 null로 설정
        togetherId: togetherId, // togetherId를 별도로 전달
        groupName: selectedTogether?.title ?? "단체 채팅",
        participants: participantsSeed,
        authorId: hostIdRaw,
        host: hostFromBackend, // 백엔드 host 정보 추가
        // 백엔드 ChatRoomDto.ResponseDetail 전체 정보 추가
        ...(chatRoomData && {
          chatMemberCount: chatRoomData.chatMemberCount,
          backendParticipants: chatRoomData.participants,
          createdAt: chatRoomData.createdAt
        })
      };
    }
    const togetherId = selectedTogether?.togetherId ?? selectedTogether?.id;
    return {
      roomId: rid,
      togetherId: togetherId, // togetherId를 별도로 전달
      groupName: selectedTogether?.title ?? "단체 채팅",
      participants: participantsSeed,
      authorId: hostIdRaw,
      host: hostFromBackend, // 백엔드 host 정보 추가
      // 백엔드 ChatRoomDto.ResponseDetail 전체 정보 추가
      ...(chatRoomData && {
        chatMemberCount: chatRoomData.chatMemberCount,
        backendParticipants: chatRoomData.participants,
        createdAt: chatRoomData.createdAt
      })
    };
  }, [forcedRoomId, selectedTogether, effectiveUserId, effectiveUserName, chatRoomData]);

  // 현재 필터에 맞는 리스트 (3가지 옵션 지원)
  const listToRender = useMemo(() => {
    switch(roleFilter) {
      case "host":
        return hostItems;
      case "guest":
        return guestItems;
      case "all":
      default:
        return allItems;
    }
  }, [roleFilter, hostItems, guestItems, allItems]);

  // 로그인 가드
  if (ready && !isLogined) {
    return (
      <div className="p-6 bg-white rounded-lg text-center text-gray-600">
        동행 목록을 보려면 로그인해주세요.
      </div>
    );
  }

  return (
    <>
      {/* 상단: 전체/호스트/게스트 필터 */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-[#76787a]">
          {roleFilter === "all"
            ? "전체 동행 목록"
            : roleFilter === "host"
            ? "내가 작성한 동행"
            : "내가 게스트로 참여한 동행"}
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs px-2 py-2 border border-gray-300 rounded-lg bg-white text-[#26282a] focus:outline-none focus:border-[#26282a] min-w-[140px]">
          <option value="all">전체 동행</option>
          <option value="host">호스트 동행</option>
          <option value="guest">게스트 동행</option>
        </select>
      </div>

      <div className="flex gap-2 flex-1" style={{ height: 'calc(100vh - 200px)' }}>
        {/* 좌측: 동행 카드 리스트 */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isSlideVisible ? "w-1/2" : "w-full"
          }`}>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full">
            {Array.isArray(listToRender) && listToRender.length > 0 ? (
              <div className="space-y-0 overflow-y-auto h-full scrollbar-visible">
                {listToRender.map((item) => {
                  // togetherId나 id 중 하나는 반드시 존재해야 함
                  const itemId = item.togetherId ?? item.id;
                  const selectedId = selectedTogether?.togetherId ?? selectedTogether?.id;

                  const isActive =
                    selectedTogether &&
                    itemId &&
                    selectedId &&
                    selectedId === itemId &&
                    selectedTogether?.isHost === item.isHost;
                  return (
                    <div
                      key={`${item.togetherId ?? item.id}-${item.isHost ? 'host' : 'guest'}`}
                      className={`transition-colors duration-200 ${
                        isActive
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : "hover:bg-gray-50"
                      }`}>
                      <TogetherList
                        {...item}
                        onCardClick={() => handleTogetherListClick(item)}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-[#76787a]">
                  {roleFilter === "all"
                    ? "아직 참여한 동행이 없습니다."
                    : roleFilter === "host"
                    ? "아직 내가 작성한 동행이 없습니다."
                    : "아직 수락된 게스트 동행이 없습니다."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 우측: GroupChat */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isSlideVisible ? "w-1/2" : "w-0"
          }`}>
          <div className="w-full h-full bg-white rounded-lg shadow-sm flex flex-col">
            {isSlideVisible && (
              <GroupChat
                key={
                  groupData.roomId || selectedTogether?.togetherId || "gc-empty"
                }
                groupData={groupData}
                currentUserId={effectiveUserId}
                onClose={handleSlideClose}
                currentUserName={effectiveUserName}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
