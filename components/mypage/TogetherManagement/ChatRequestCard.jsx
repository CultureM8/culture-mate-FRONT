"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";
import { getProfileImageUrl, getEventImageUrl } from "@/lib/imageUtils";

/**
 * Props
 * - request: {
 *    requestId, fromUserId, fromUserName, fromLoginId, fromUserProfileImage,
 *    toUserId, postId, message, status, createdAt,
 *    postTitle, postDate, eventName, eventType, eventImage|imgSrc|eventImg
 *   }
 * - type: 'received' | 'sent'
 * - onAccept(requestId), onReject(requestId), onOpenChat(request)
 */
export default function ChatRequestCard({
  request,
  onAccept,
  onReject,
  onCancel,
  onOpenChat,
  type = "received",
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  // --- 상태 정규화(대문자) ---
  const statusNorm = String(request?.status || "").toUpperCase();

  // --- 이벤트 썸네일 ---
  const [eventImgSrc, setEventImgSrc] = useState(getEventImageUrl(request));
  useEffect(() => {
    setEventImgSrc(getEventImageUrl(request));
  }, [request]);

  // --- 프로필 이미지 fallback ---
  const [profileImgSrc, setProfileImgSrc] = useState(getProfileImageUrl(request?.fromUserProfileImage));
  useEffect(() => {
    setProfileImgSrc(getProfileImageUrl(request?.fromUserProfileImage));
  }, [request]);

  // --- 상태 뱃지 ---
  const getStatusColor = (statusUpper) => {
    switch (statusUpper) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "ACCEPTED":
        return "bg-green-100 text-green-700 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200";
      case "CANCELED":
        return "bg-gray-100 text-gray-500 border-gray-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };
  const getStatusText = (statusUpper) => {
    switch (statusUpper) {
      case "PENDING":
        return "대기중";
      case "ACCEPTED":
        return "수락됨";
      case "REJECTED":
        return "거절됨";
      case "CANCELED":
        return "취소됨";
      default:
        return "알 수 없음";
    }
  };

  // --- 시간 포맷 ---
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    const now = new Date();
    const diffMs = now - date;
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffH < 1) {
      const diffM = Math.floor(diffMs / (1000 * 60));
      return `${diffM}분 전`;
    } else if (diffH < 24) {
      return `${diffH}시간 전`;
    }
    const diffD = Math.floor(diffH / 24);
    return `${diffD}일 전`;
  };

  // --- 공통 호출 안전화 ---
  const safeCall = async (fn, id) => {
    if (typeof fn !== "function") return;
    setIsProcessing(true);
    try {
      await fn(id);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 카드 클릭 시 채팅 열기 (전체 클릭) ---
  const handleOpenChat = useCallback(() => {
    if (typeof onOpenChat === "function") onOpenChat(request);
  }, [onOpenChat, request]);

  const handleKeyOpen = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpenChat();
    }
  };

  const displayFromName = useMemo(() => {
    return (
      request?.fromUserName ||
      request?.fromLoginId ||
      request?.fromUserId ||
      "사용자"
    );
  }, [request]);

  const statusClass = getStatusColor(statusNorm);
  const statusText = getStatusText(statusNorm);

  const showAcceptReject =
    type === "received" && statusNorm === "PENDING" && (onAccept || onReject);
  const showCancel =
    type === "sent" &&
    statusNorm === "PENDING" &&
    typeof onCancel === "function";

  return (
    <div
      className={`rounded-lg p-3 transition-shadow duration-200 cursor-pointer ${
        statusNorm === "CANCELED"
          ? "bg-gray-50 border border-gray-300 opacity-75"
          : "bg-white border border-gray-200 hover:shadow-md"
      }`}
      onClick={handleOpenChat}
      onKeyDown={handleKeyOpen}
      role="button"
      tabIndex={0}
      aria-label="채팅 신청 상세 열기">
      {/* 상단: 프로필/작성자/메시지/상태 */}
      <div className="mb-4 grid grid-cols-[auto_auto_1fr_auto] items-start gap-x-3 gap-y-2">
        {/* 프로필 이미지 */}
        <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
          <Image
            src={profileImgSrc}
            alt={`${displayFromName} 프로필`}
            width={48}
            height={48}
            className="w-full h-full object-cover"
            onError={() => setProfileImgSrc("/img/default_img.svg")}
            sizes="48px"
          />
        </div>

        {/* 사용자 정보 */}
        <div className="self-start mt-1">
          <h3 className="font-medium text-[#26282a]">
            {type === "received" ? displayFromName : "나"}
          </h3>
          <p className="text-xs text-[#76787a] pl-1 mt-1">
            {formatDate(request?.createdAt)}
          </p>
        </div>

        {/* 신청 메시지 */}
        <div className="min-w-0">
          <div className="p-3 rounded-lg">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
              {request?.message}
            </p>
          </div>
        </div>

        {/* 상태 뱃지 */}
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full border justify-self-end ${statusClass}`}>
          {statusText}
        </span>
      </div>

      {/* 하단: 이벤트/게시글/액션 */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-3 bg-gray-50 rounded-lg">
        {/* 이벤트 썸네일 */}
        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
          <Image
            src={eventImgSrc}
            alt={`${request?.eventName ?? "이벤트"} 썸네일`}
            width={64}
            height={64}
            className="w-full h-full object-cover"
            sizes="64px"
            onError={() => setEventImgSrc("/img/default_img.svg")}
          />
        </div>

        {/* 게시글 간략 정보 */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
              {request?.eventType || "이벤트"}
            </span>
            <span className="text-sm font-medium text-[#26282a]">
              {request?.eventName || ""}
            </span>
          </div>
          <h4 className="font-medium text-[#26282a] mb-1">
            {request?.postTitle || ""}
          </h4>
          <p className="text-sm text-[#76787a]">{request?.postDate || ""}</p>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center gap-2">
          {/* 받은 신청: 대기중일 때 수락/거절 */}
          {showAcceptReject && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  safeCall(onReject, request.requestId);
                }}
                disabled={isProcessing}
                className="px-3 py-1.5 border bg-white border-gray-300 rounded-lg text-gray-700 text-xs font-medium hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors">
                거절
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  safeCall(onAccept, request.requestId);
                }}
                disabled={isProcessing}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                수락
              </button>
            </>
          )}

          {/* 보낸 신청: 대기중일 때 취소 */}
          {showCancel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                safeCall(onCancel, request.requestId); // 취소 전용 핸들러 사용
              }}
              disabled={isProcessing}
              className="px-3 py-1.5 border bg-white border-gray-300 rounded-lg text-gray-700 text-xs font-medium hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors">
              취소
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
