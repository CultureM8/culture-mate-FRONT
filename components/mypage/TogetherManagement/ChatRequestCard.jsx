"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";

export default function ChatRequestCard({
  request,
  onAccept,
  onReject,
  onOpenChat,
  type = "received",
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  // 이벤트 썸네일 선택 함수
  const pickEventImg = (req) => {
    const raw =
      typeof (req?.eventImage ?? req?.eventImg ?? req?.imgSrc) === "string"
        ? req?.eventImage ?? req?.eventImg ?? req?.imgSrc
        : "";
    const trimmed = raw.trim();
    return trimmed || "/img/default_img.svg";
  };

  // 초기값 + props 변화 동기화
  const [eventImgSrc, setEventImgSrc] = useState(pickEventImg(request));
  useEffect(() => {
    setEventImgSrc(pickEventImg(request));
  }, [request?.eventImage, request?.eventImg, request?.imgSrc]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "대기중";
      case "accepted":
        return "수락됨";
      case "rejected":
        return "거절됨";
      default:
        return "알 수 없음";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    const now = new Date();
    const diffMs = now - date;
    const diffInHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}일 전`;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow duration-200">
      <div className="mb-4 grid grid-cols-[auto_auto_1fr_auto] items-start gap-x-3 gap-y-2">
        {/* 프로필 이미지 */}
        <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
          {request?.fromUserProfileImage ? (
            <Image
              src={request.fromUserProfileImage}
              alt={`${
                request.fromUserName || request.fromLoginId || "사용자"
              } 프로필`}
              width={48}
              height={48}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/img/default_img.svg";
              }}
            />
          ) : null}
        </div>

        {/* 사용자 정보 */}
        <div className="self-start mt-1">
          <h3 className="font-medium text-[#26282a]">
            {type === "received"
              ? request?.fromUserName ||
                request?.fromLoginId ||
                request?.fromUserId
              : "나"}
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
          className={`px-3 py-1 text-xs font-medium rounded-full border justify-self-end ${getStatusColor(
            request?.status
          )}`}>
          {getStatusText(request?.status)}
        </span>
      </div>

      {/* 하단: 이벤트 썸네일 + 게시글 정보 + (옵션) 액션 */}
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

        {/* 게시글 정보 */}
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

        {/*  수락/거절 or 채팅 시작 */}
        <div className="flex items-center gap-2">
          {type === "received" &&
            request?.status === "pending" &&
            (onAccept || onReject) && (
              <>
                <button
                  onClick={() => onReject?.(request.requestId)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 border bg-white border-gray-300 rounded-lg text-gray-700 text-xs font-medium hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors">
                  거절
                </button>
                <button
                  onClick={() => onAccept?.(request.requestId)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                  수락
                </button>
              </>
            )}
        </div>
      </div>
    </div>
  );
}
