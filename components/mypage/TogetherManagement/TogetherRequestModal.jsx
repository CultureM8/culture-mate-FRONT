"use client";

import { useState, useContext, useEffect, useMemo } from "react";
import Image from "next/image";
import { LoginContext } from "@/components/auth/LoginProvider";
import FriendListItem from "@/components/mypage/FriendListItem";
import { createTogetherRequest } from "@/lib/api/togetherRequestApi";

const s = (v, d = "") => (typeof v === "string" ? v : d);
const ownerKeyOf = (u) =>
  String(u?.id ?? u?.user_id ?? u?.login_id ?? u?.loginId ?? "");

export default function TogetherRequestModal(props) {
  // 신규 prop 우선, 없으면 기존 이름 사용 (하위호환)
  const isOpen = props.isOpen;
  const onClose = props.onClose;
  const togetherPost = props.togetherPost ?? props.postData;
  const eventData = props.eventData;
  const onLocalSync = props.onLocalSync ?? props.onSendRequest;

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(LoginContext);

  const hostFriend = useMemo(() => {
    const id =
      s(togetherPost?.authorUid) ||
      s(togetherPost?.authorId) ||
      s(togetherPost?.authorLoginId) ||
      "unknown";
    const loginId = s(togetherPost?.authorLoginId) || s(togetherPost?.authorId);
    const name =
      s(togetherPost?.authorName) ||
      s(togetherPost?.authorLoginId) ||
      id ||
      "게시글 작성자";
    const avatar =
      s(togetherPost?.authorProfileImage) || "/img/default_img.svg";
    return {
      id,
      loginId,
      name,
      profileImage: avatar,
      avatarUrl: avatar,
      introduction:
        s(togetherPost?.authorIntro) ||
        "한줄 자기소개 한줄 자기소개 한줄 자기소개 한줄 자기소개",
    };
  }, [togetherPost]);

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  const handleClose = () => {
    setMessage("");
    onClose?.();
  };

  const eventImage =
    s(togetherPost?.imgSrc) ||
    s(togetherPost?.eventImage) ||
    s(eventData?.eventImage) ||
    s(eventData?.image) ||
    "/img/default_img.svg";

  const metaText = useMemo(() => {
    // 인원수 처리
    const currentCount = togetherPost?.currentParticipants ?? 0;
    const maxCount = togetherPost?.maxParticipants ?? 0;
    let groupText = togetherPost?.group || "";

    if (!groupText && maxCount > 0) {
      groupText = `${currentCount}/${maxCount}명`;
    } else if (!groupText) {
      groupText = "인원 미정";
    }

    // 날짜 처리
    const rawDate = togetherPost?.date ?? togetherPost?.meetingDate ?? "";
    let formattedDate = "날짜 미정";

    if (rawDate) {
      try {
        const dateObj = new Date(rawDate);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj
            .toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            .replace(/\s/g, "");
        } else {
          formattedDate = rawDate; // ISO 형식이 아닌 경우 원본 사용
        }
      } catch (e) {
        formattedDate = rawDate;
      }
    }

    return { group: groupText, date: formattedDate };
  }, [togetherPost]);
  const handleSendRequest = async () => {
    const trimmed = message.trim();
    if (!trimmed) return alert("메시지를 입력해주세요.");
    if (!user) return alert("로그인 후 이용해주세요.");

    const me = ownerKeyOf(user);
    const target =
      s(togetherPost?.authorUid) ||
      s(togetherPost?.authorId) ||
      s(togetherPost?.authorLoginId) ||
      "";
    if (target && me && target === me)
      return alert("자신의 게시글에는 신청을 보낼 수 없습니다.");
    if (!target)
      return alert(
        "작성자 식별에 실패했습니다. 새로고침 후 다시 시도해주세요."
      );

    setIsLoading(true);
    try {
      // 수정된 API 호출 (이제 로컬스토리지 사용)
      const payload = {
        togetherId: togetherPost?.togetherId || togetherPost?.id,
        applicantId: user.id,
        message: trimmed,
      };

      const res = await createTogetherRequest(payload);

      if (res?.success) {
        alert("동행 신청이 전송되었습니다!");
        setMessage("");
        onClose?.();

        // 기존 로컬 동기화도 유지 (호환성)
        if (onLocalSync) {
          const local = {
            requestId: res.requestId,
            fromUserId: String(user.id),
            fromUserName: user?.nickname || user?.login_id || "사용자",
            fromLoginId: user?.login_id,
            fromUserProfileImage: user?.profileImage || "/img/default_img.svg",
            toUserId: target,
            createdAt: new Date().toISOString(),
            postId: String(togetherPost?.togetherId ?? togetherPost?.id ?? ""),
            message: trimmed,
            status: "PENDING",
            postTitle: s(togetherPost?.title),
            postDate: s(togetherPost?.date ?? togetherPost?.meetingDate),
            eventName: s(togetherPost?.eventName),
            eventType: s(togetherPost?.eventType),
            eventImage,
            isBackendSynced: false,
          };
          try {
            await onLocalSync(local);
          } catch (e) {
            console.warn("로컬 동기화 실패:", e);
          }
        }
      } else {
        throw new Error(res?.error || "신청 처리에 실패했습니다.");
      }
    } catch (e) {
      alert(e?.message || "동행 신청 전송에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#26282a]">동행 신청</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="close">
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="px-6 pt-4 pb-6 flex-1 overflow-y-auto">
          {/* 동행글 정보 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg drop-shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                <Image
                  src={eventImage}
                  alt="이벤트 이미지"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 px-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                    {s(togetherPost?.eventType, "이벤트")}
                  </span>
                </div>
                <h3 className="font-medium py-1 text-[#26282a] mb-1 line-clamp-2">
                  {s(togetherPost?.title, "모집글 제목")}
                </h3>
                <p className="text-sm text-[#76787a]">
                  {s(metaText.date, "0000.00.00")} · {s(metaText.group, "명")}
                </p>
              </div>
            </div>
          </div>

          {/* 작성자(호스트) */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[#26282a] mb-3">
              동행 호스트
            </h3>
            <div className="w-full bg-gray-50 rounded-lg drop-shadow-sm">
              <FriendListItem
                friend={hostFriend}
                onClick={() => {}}
                isSelected={false}
              />
            </div>
          </div>

          {/* 메시지 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#26282a] mb-2">
              신청 메시지
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="동행에 대한 간단한 소개나 참여 이유를 작성해주세요."
              className="w-full h-32 p-3 text-sm border border-gray-300 rounded-lg resize-none focus:ring focus:ring-blue-500 outline-none"
              maxLength={200}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  if (!isLoading && message.trim()) handleSendRequest();
                }
              }}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {message.length}/200
            </div>
          </div>

          {/* 주의사항 */}
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  신청 전 확인사항
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  • 정중하고 성의있는 메시지를 작성해주세요
                  <br />• 개인정보는 포함하지 마세요
                  <br />• 상대방이 거절할 수 있음을 이해해주세요
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            disabled={isLoading}>
            취소
          </button>
          <button
            onClick={handleSendRequest}
            disabled={!message.trim() || isLoading}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 transition-colors">
            {isLoading ? "전송 중..." : "동행 신청"}
          </button>
        </div>
      </div>
    </div>
  );
}
