"use client"; /**동행신청모달 */
import { useState, useContext, useEffect } from "react";
import Image from "next/image";
import { LoginContext } from "@/components/auth/LoginProvider";
import FriendListItem from "@/components/mypage/FriendListItem";

export default function ChatRequestModal({
  isOpen,
  onClose,
  postData,
  eventData,
  onSendRequest,
}) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(LoginContext);

  /* FriendListItem에 넘길 호스트(게시글 작성자)*/
  const hostFriend = {
    id: postData?.authorId ?? postData?.author_id ?? "unknown",
    loginId: postData?.authorLoginId ?? postData?.authorId ?? "",
    name:
      postData?.authorName ??
      postData?.authorLoginId ??
      postData?.authorId ??
      "게시글 작성자",
    profileImage: postData?.authorProfileImage || "/img/default_img.svg",
    avatarUrl:
      postData?.authorProfileImage ||
      "/img/default_img.svg" /* 안전빵으로 둘 다*/,
    introduction:
      postData?.authorIntro ??
      "한줄 자기소개 한줄 자기소개 한줄 자기소개 한줄 자기소개",
  };

  /* 모달 열릴 때 배경 스크롤 방지 */
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const handleClose = () => {
    setMessage("");
    onClose();
  };

  const handleSendRequest = async () => {
    if (!message.trim()) {
      alert("메시지를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    /*로그인 사용자에서 아이디/이름 추출*/
    const currentUserId =
      user?.id ??
      user?.user_id ??
      user?.login_id ??
      user?.loginId ??
      user?.email ??
      "unknown_user";

    const currentUserLogin = user?.login_id ?? user?.loginId ?? null;
    const currentUserName =
      user?.nickname ?? user?.name ?? currentUserLogin ?? currentUserId;

    /* 받는 사람: 작성자 ID 우선, 없으면 자기 자신(프론트 테스트용)*/
    const targetUserId =
      postData?.authorId ?? postData?.author_id ?? currentUserId;

    /*카드 썸네일용 이벤트 이미지*/
    const eventImage =
      postData?.imgSrc ??
      postData?.eventImage ??
      eventData?.eventImage ??
      eventData?.image ??
      "/img/default_img.svg";

    /*전송 payload*/
    const chatRequestData = {
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromUserId: currentUserId,
      fromUserName: currentUserName,
      fromLoginId: currentUserLogin ?? "",
      fromUserProfileImage:
        user?.profileImage ?? user?.profile_image ?? "/img/default_img.svg",
      toUserId: targetUserId,
      createdAt: new Date().toISOString(),

      postId: postData?.togetherId,
      message: message.trim(),
      status: "pending",

      postTitle: postData?.title,
      postDate: postData?.date,
      eventName: postData?.eventName,
      eventType: postData?.eventType,

      introduction: "한줄 자기소개 한줄 자기소개 한줄 자기소개 한줄 자기소개",
      eventImage, // ChatRequestCard에서 썸네일로 사용
    };

    console.log("[REQ] user:", user);
    console.log("[REQ] toUserId:", chatRequestData.toUserId);
    console.log("[REQ] payload:", chatRequestData);

    try {
      await onSendRequest(chatRequestData);
      setMessage("");
      onClose();
      alert("동행 신청이 전송되었습니다!");
    } catch (error) {
      console.error("동행 신청 전송 실패:", error);
      alert("동행 신청 전송에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#26282a]">동행 신청</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
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
                {postData?.imgSrc && (
                  <Image
                    src={postData?.imgSrc}
                    alt="이벤트 이미지"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 px-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                    {postData?.eventType}
                  </span>
                </div>
                <h3 className="font-medium py-1 text-[#26282a] mb-1 line-clamp-2">
                  {postData?.title}
                </h3>
                <p className="text-sm text-[#76787a]">
                  {postData?.date} · {postData?.group}명
                </p>
              </div>
            </div>
          </div>

          {/* 작성자 정보 */}
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

          {/* 메시지 입력 */}
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
                  <br />
                  • 개인정보는 포함하지 마세요
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
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
            {isLoading ? "전송 중..." : "동행 신청"}
          </button>
        </div>
      </div>
    </div>
  );
}
