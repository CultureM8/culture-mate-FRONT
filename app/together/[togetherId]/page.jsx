"use client";

import { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ICONS, ROUTES } from "@/constants/path";
import PostEventMiniCard from "@/components/global/PostEventMiniCard";
import TogetherRequestModal from "@/components/mypage/TogetherManagement/TogetherRequestModal";
import ConfirmModal from "@/components/global/ConfirmModal";
import { LoginContext } from "@/components/auth/LoginProvider";
/* API */
import togetherApi, { toggleTogetherInterest } from "@/lib/api/togetherApi";
import { transformEventCardData } from "@/lib/api/eventApi";

/* storage 유틸 */
import { bumpViews, isLiked, toggleLike, deletePost } from "@/lib/storage";

/* chatRequest 저장 */
import { addChatRequest } from "@/lib/chatRequestUtils";

/* 이벤트 조회(스냅샷 없을 때만 사용) */
import eventApi from "@/lib/api/eventApi";

/* ============= 헬퍼 ============= */

/** 호스트 표시용 메타 추출 (문자/객체/스네이크 모두 호환) */
function pickHostMeta(p) {
  const fallback = { displayName: "익명", loginId: "", uid: "" };
  if (!p) return fallback;

  // 백엔드에서 host 객체로 옴
  const a = p.host || p.author || {};

  if (typeof p.author === "string") {
    const loginId = p.author || p.author_login_id || "";
    return {
      displayName: loginId || "익명",
      loginId,
      uid: "",
    };
  }
  const displayName =
    (a.nickname && String(a.nickname).trim()) ||
    (a.display_name && String(a.display_name).trim()) ||
    (a.name && String(a.name).trim()) ||
    (p.author_login_id && String(p.author_login_id).trim()) ||
    (a.login_id && String(a.login_id).trim()) ||
    (a.id != null && String(a.id)) ||
    "익명";

  const loginId =
    (p.author_login_id && String(p.author_login_id).trim()) ||
    (a.login_id && String(a.login_id).trim()) ||
    (typeof p.author === "string" ? p.author : "") ||
    "";

  const uid =
    (a.id != null && String(a.id)) ||
    (a.user_id != null && String(a.user_id)) ||
    "";

  return { displayName, loginId, uid };
}

/** 글 작성자(호스트) 식별키 생성: id 우선, 없으면 login_id */
const buildHostKeyFromPost = (p) => {
  if (!p) return { hostUid: "", hostLogin: "" };
  const a = (typeof p.author === "object" && p.author) || {};
  const uid = p?.hostId ?? p?.authorId ?? a?.id ?? a?.user_id ?? null;
  const login = p?.author_login_id ?? a?.login_id ?? null;
  return {
    hostUid: uid != null ? String(uid) : "",
    hostLogin: login != null ? String(login) : "",
  };
};

/** 이벤트 미니 카드 변환 - transformEventCardData 사용 */
const toMiniCard = (eventData, registeredPosts = 0) => {
  // eventData를 EventDto.ResponseCard 형태로 정규화
  const normalizedEventCard = {
    id: eventData?.id,
    eventType: eventData?.eventType ?? eventData?.type,
    title: eventData?.title ?? eventData?.name ?? eventData?.eventName,
    description: eventData?.description ?? "",
    thumbnailImagePath:
      eventData?.mainImagePath ??
      eventData?.thumbnailImagePath ??
      eventData?.eventImage ??
      eventData?.image ??
      eventData?.imgSrc,
    avgRating:
      eventData?.avgRating ??
      eventData?.rating ??
      eventData?.score ??
      eventData?.starScore,
    interestCount:
      eventData?.interestCount ?? eventData?.likes ?? eventData?.liked ?? 0,
    reviewCount: registeredPosts,
    isInterested:
      eventData?.isInterested ??
      eventData?.initialLiked ??
      eventData?.isLiked ??
      false,
  };

  // transformEventCardData 사용해서 변환 (이미지 URL 처리 포함)
  return transformEventCardData(normalizedEventCard);
};

/* Hydration 안전한 날짜 포맷 함수 */
const formatDateSafe = (dateValue) => {
  if (!dateValue) return "";

  try {
    if (typeof dateValue === "string") {
      return dateValue;
    }
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  } catch {
    return "";
  }
};

/* ============= 페이지 ============= */

export default function TogetherDetailPage() {
  const router = useRouter();
  const { togetherId } = useParams();

  const { user, isLogined, ready } = useContext(LoginContext);

  const [post, setPost] = useState(null); // 로컬 저장소에서 읽은 글
  const [eventData, setEventData] = useState(null); // 이벤트 상세(스냅샷 없을 때)
  const [liked, setLiked] = useState(false);
  const [interest, setInterest] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [mounted, setMounted] = useState(false); // 하이드레이션 안전 가드

  // 관심수 상태 관리
  const [interestCount, setInterestCount] = useState(0);

  // 모집마감/재개 상태
  const [isRecruiting, setIsRecruiting] = useState(true); // 모집 중 여부 (true: 모집중, false: 마감)
  const [statusChanging, setStatusChanging] = useState(false); // 상태 변경 중
  const [openStatusModal, setOpenStatusModal] = useState(false); // 상태 변경 모달

  /* 마운트 표시 - 날짜/로그인 의존 UI 하이드레이션 안전 */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* 날짜 포맷팅 함수 - 컴포넌트 내부에 추가 */
  const formatDisplayDate = (dateValue, format = "date-only") => {
    if (!dateValue || !mounted) return "";

    try {
      const dateObj = new Date(dateValue);
      if (isNaN(dateObj.getTime())) {
        return String(dateValue);
      }

      switch (format) {
        case "date-only":
          return dateObj
            .toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            .replace(/\s/g, "");

        case "datetime":
          return dateObj.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });

        default:
          return dateObj.toLocaleDateString("ko-KR");
      }
    } catch (e) {
      console.warn("날짜 포맷팅 실패:", e);
      return String(dateValue);
    }
  };

  /* 인원수 포맷팅 함수 추가 */
  const formatGroupInfo = (post) => {
    if (!post) return "1명";

    const maxCount = post.maxParticipants || 1;
    const currentCount = post.currentParticipants || 1;

    return `${currentCount}/${maxCount}명`;
  };

  /* 글 로드 + 조회수 세션당 1회 증가 + 좋아요 초기 상태 */
  useEffect(() => {
    const loadPost = async () => {
      if (!togetherId) return; // togetherId가 없으면 API 호출하지 않음

      try {
        // 1. API를 통해 최신 데이터 가져오기
        const apiPost = await togetherApi.getById(togetherId);
        setPost(apiPost); // API 응답으로 상태 설정

        // 2. 관심 등록 상태 설정 (백엔드 데이터만 사용)
        setInterest(Boolean(apiPost?.isInterested));

        // 3. 관심수 초기값 설정
        setInterestCount(Number(apiPost?.interestCount) || 0);

        // 4. 모집 상태 설정 (백엔드 active 필드 사용)
        setIsRecruiting(Boolean(apiPost?.active));

        // 5. 좋아요 상태 설정 (기존 로직 유지)
        setLiked(isLiked("together", togetherId));

        // 3. 이벤트 데이터 설정
        if (apiPost?.event) {
          // 백엔드에서 event 객체로 옴
          setEventData(apiPost.event);
        } else if (apiPost?.eventSnapshot) {
          setEventData(apiPost.eventSnapshot);
        } else if (apiPost?.eventId) {
          try {
            const ev = await eventApi.getEventById(apiPost.eventId);
            setEventData(ev || null);
          } catch {
            setEventData(null);
          }
        } else {
          setEventData(null);
        }
      } catch (error) {
        console.error("게시글 로드 실패:", error);
        setPost(null); // 에러 발생 시 post를 null로 설정

        // API 에러 처리 (401, 403 등)
        if (error.status === 401 || error.status === 403) {
          alert("글을 볼 수 있는 권한이 없습니다. 로그인 상태를 확인해주세요.");
          router.push(`/login?next=/together/${togetherId}`);
        } else if (error.status === 404) {
          alert("요청하신 글을 찾을 수 없습니다.");
          router.push("/together"); // 목록 페이지로 이동
        } else {
          alert(
            "글을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
          );
        }
      }
    };

    loadPost();
  }, [togetherId, router]); // router를 의존성 배열에 추가

  /* 조회수 증가 - 마운트 후에만 실행 (백엔드에 조회수 속성 없음 - 주석 처리) */
  // useEffect(() => {
  //   if (!mounted || !post) return;
  //   const onceKey = `viewed:together:${togetherId}`;
  //   if (!sessionStorage.getItem(onceKey)) {
  //     bumpViews("together", togetherId);
  //     sessionStorage.setItem(onceKey, "1");
  //   }
  // }, [mounted, post, togetherId]);

  /* 로딩/존재 확인 */
  if (!post) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div>글을 찾을 수 없습니다.</div>
      </div>
    );
  }

  /* 표시 데이터 가공 */
  const hostMeta = pickHostMeta(post);
  const displayHost = hostMeta.displayName || "익명";
  // const views = post?._views ?? post?.stats?.views ?? 0; // 백엔드에 조회수 속성 없음 - 주석 처리
  const likeCount = post?.stats?.likes ?? post?.likes ?? 0;

  /* 내 글 여부 계산 */
  let isOwnPost = false;
  if (mounted && ready && post && user) {
    const myUid = user.id;
    const authorUid =
      post.host?.id || post.hostId || post.authorId || post._ownerKey;
    console.log("🔍 Own Post Check:", {
      myUid,
      authorUid,
      postHost: post.host,
      userInfo: user,
      postData: post,
    });
    isOwnPost =
      myUid != null && authorUid != null && String(myUid) === String(authorUid);
    console.log(" isOwnPost:", isOwnPost);
  }

  /* 이벤트 카드 데이터 */
  const card = post?.eventSnapshot
    ? transformEventCardData(post.eventSnapshot) // eventSnapshot도 transformEventCardData로 변환
    : eventData
    ? toMiniCard(eventData, 0)
    : null;

  /* 이벤트 카드 클릭 핸들러 */
  const handleEventCardClick = () => {
    const eventId = post?.eventId || eventData?.id;
    if (eventId) {
      router.push(`${ROUTES.EVENTS}/${eventId}`);
    }
  };

  /* 좋아요 토글 */
  const onToggleLike = () => {
    const ret = toggleLike("together", togetherId);
    const nextCount =
      typeof ret === "number" ? ret : ret?.count ?? ret?.likes ?? 0;
    const nextLiked = typeof ret === "number" ? !liked : !!ret?.liked;

    setLiked(nextLiked);
    setPost((prev) =>
      prev
        ? {
            ...prev,
            stats: {
              ...(prev.stats || {}),
              likes: nextCount,
            },
          }
        : prev
    );
  };

  /* 관심 등록/해제 핸들러 */
  const onToggleInterest = async () => {
    console.log("🔍 TogetherDetail onToggleInterest 호출됨");
    console.log("🔍 로그인 상태:", { isLogined, user, togetherId });

    if (!isLogined || !user) {
      console.log("⚠️ 로그인 필요");
      alert("로그인이 필요합니다.");
      return;
    }

    if (isSubmitting) {
      console.log("⏳ 이미 처리 중...");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await toggleTogetherInterest(togetherId);
      setInterest((prev) => {
        const next = !prev;

        // 관심수 업데이트 (등록: +1, 해제: -1)
        setInterestCount((prevCount) => {
          const newCount = Math.max(0, prevCount + (next ? 1 : -1));
          console.log(
            `🔢 관심수 변경: ${prevCount} → ${newCount} (${
              next ? "등록" : "해제"
            })`
          );
          return newCount;
        });

        // 같은 페이지 내 다른 컴포넌트들에게 브로드캐스트
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("together-interest-changed", {
              detail: { togetherId: String(togetherId), interested: next },
            })
          );
        }
        return next;
      });
      console.log("✅ 동행 관심 등록/해제 결과:", result);
    } catch (error) {
      console.error("❌ 동행 관심 등록/해제 실패:", error);
      alert("동행 관심 등록/해제에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* 신고 */
  const handleReportClick = () => {
    alert("신고가 접수되었습니다. (데모)");
  };

  /* 동행 신청 버튼 핸들러 — 본인 글 차단 + 로그인 필수 */
  const handleChatClick = () => {
    if (!isLogined) {
      alert("로그인이 필요한 서비스입니다.");
      return;
    }
    if (isOwnPost) {
      alert("본인 글에는 동행 신청을 보낼 수 없습니다.");
      return;
    }
    setIsChatModalOpen(true);
  };

  /* 날짜 포맷(하이드레이션 안전: 마운트 이후에만 표시) */
  const getFormattedDate = (dateString) => {
    if (!mounted || !dateString) return "";
    try {
      return new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Seoul",
      }).format(new Date(dateString));
    } catch {
      return "";
    }
  };

  const createdAtText = getFormattedDate(post?.createdAt);

  /* getCompanionDate 함수 수정 */
  const getCompanionDate = () => {
    const rawDate = post?.companionDate || post?.createdAt;
    return formatDisplayDate(rawDate, "date-only");
  };

  // 호스트 식별값(모달에 전달)
  const { hostUid, hostLogin } = buildHostKeyFromPost(post);

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-8 py-6">
        {/* 페이지 제목 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black">동행 모집</h1>
        </div>

        {/* 글 제목 + 메타 */}
        <div className="mb-4 pb-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-black mb-4">{post.title}</h2>

          {/* 메타 줄 */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>작성자 : {displayHost}</span>
              {mounted && <span>{createdAtText}</span>}
            </div>

            <div className="flex items-center pr-2 gap-2">
              {/* <span>조회 {views}</span> // 백엔드에 조회수 속성 없음 - 주석 처리 */}
              <span>
                <button
                  className={`flex flex-col items-center py-3 ml-2 ${
                    isSubmitting ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  onClick={onToggleInterest}
                  disabled={isSubmitting}>
                  {interest ? (
                    <Image
                      src={ICONS.HEART}
                      alt="관심"
                      width={16}
                      height={16}
                    />
                  ) : (
                    <Image
                      src={ICONS.HEART_EMPTY}
                      alt="관심"
                      width={16}
                      height={16}
                    />
                  )}
                </button>
              </span>
              <span>{interestCount}</span>
            </div>
          </div>
        </div>

        {/* 이벤트 미니 카드 */}
        {card && (
          <div className="mb-4">
            <PostEventMiniCard {...card} onClick={handleEventCardClick} />
          </div>
        )}

        {/* 동행 정보 */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-8">
              <span className="text-base text-black w-20">동행 날짜</span>
              <span className="text-base">
                {mounted ? getCompanionDate() : ""}
              </span>
            </div>

            <div className="flex items-center gap-8">
              <span className="text-base text-black w-20">동행 인원</span>
              <span className="text-base">
                {`${post.currentParticipants || 1} / ${
                  post.maxParticipants || 1
                } 명`}
              </span>
            </div>

            <div className="flex items-center gap-8">
              <span className="text-base text-black w-20">모임 지역</span>
              <span className="text-base">
                {post?.region
                  ? `${post.region.level1} ${post.region.level2} ${post.region.level3}`.trim()
                  : "지역 정보 없음"}
              </span>
            </div>

            <div className="flex items-center gap-8">
              <span className="text-base text-black w-20">모임 장소</span>
              <div className="flex items-center gap-2">
                <span className="text-base">
                  {post?.meetingLocation || "장소 정보 없음"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="mb-8 min-h-[200px]">
          <div className="text-sm text-gray-700 whitespace-pre-line">
            {post.content || "내용이 없습니다."}
          </div>
        </div>

        {/* 하단 버튼들 */}
        <div className="flex justify-end gap-4 mb-8">
          {/* 신고 버튼은 항상 표시 (본인 글 여부 무관) */}
          <button
            onClick={handleReportClick}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <Image src={ICONS.BELL} alt="신고" width={16} height={16} />
            <span>신고</span>
          </button>

          {/* 버튼 - 마운트 후에만 조건부 렌더링 */}
          {mounted &&
            isLogined &&
            (isOwnPost ? (
              <>
                <button
                  onClick={() => router.push(`/together/${togetherId}/edit`)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                  게시물 수정
                </button>

                {/* 모집 상태 토글 버튼 (마감/재개) */}
                <button
                  onClick={() => setOpenStatusModal(true)}
                  disabled={statusChanging}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors disabled:opacity-60 ${
                    isRecruiting
                      ? "border-red-500 text-red-600 hover:bg-red-50"
                      : "border-green-500 text-green-600 hover:bg-green-50"
                  }`}>
                  {statusChanging
                    ? isRecruiting
                      ? "모집마감 중…"
                      : "모집재개 중…"
                    : isRecruiting
                    ? "모집마감"
                    : "모집재개"}
                </button>
              </>
            ) : (
              <button
                onClick={handleChatClick}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                동행 신청
              </button>
            ))}
        </div>

        {/* 작성자 정보 (간단) */}
        <div className="bg-gray-100 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{displayHost}</span>
                {/* 본인 글이 아닌 경우에만 연락 추가 버튼 표시 */}
                {mounted && !isOwnPost && (
                  <button className="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                    + 연락 추가
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600">작성자의 한줄 자기소개</p>
            </div>
          </div>
        </div>

        {/* 삭제/목록 */}
        <div className="flex gap-2 mt-3 mb-10 justify-end">
          {/* 본인 글인 경우에만 삭제 버튼 표시 */}
          {mounted && isOwnPost && (
            <button
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setOpenDelete(true)}>
              삭제
            </button>
          )}
          <button
            className="px-6 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            onClick={() => router.push("/together")}>
            목록으로
          </button>
        </div>
      </div>

      {/* 동행 신청 모달 */}
      <TogetherRequestModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        postData={{
          togetherId: post.id,
          title: post.title,
          date: formatDisplayDate(
            post.companionDate || post.createdAt,
            "date-only"
          ),
          group: formatGroupInfo(post),
          maxParticipants: post.maxParticipants || 1,
          currentParticipants: post.currentParticipants ?? 0,
          eventId: post.eventId,
          imgSrc:
            post.eventSnapshot?.eventImage ||
            post.eventSnapshot?.image ||
            post.eventSnapshot?.imgSrc ||
            "/img/default_img.svg",
          eventType: post.eventSnapshot?.eventType || "기타",
          eventName:
            post.eventSnapshot?.name || post.eventSnapshot?.title || "이벤트",
          authorUid: hostUid || hostMeta.uid || "",
          authorId:
            hostUid || hostMeta.uid || hostLogin || hostMeta.loginId || "",
          authorLoginId: hostLogin || hostMeta.loginId || "",
          authorName: displayHost,
        }}
        eventData={eventData}
        onSendRequest={async (payload) => {
          console.log("현재 사용자 정보:", user);
          console.log("백엔드 API를 통한 신청 처리");
          console.log("신청 데이터:", payload);
          try {
            const enhancedPayload = {
              ...payload,
              toUserId:
                hostUid ||
                hostMeta.uid ||
                payload.authorUid ||
                payload.authorId, // 받는 사람 ID
              fromUserId: user?.id || user?.user_id, // 보내는 사람 ID
            };

            // 실제 백엔드 API 호출
            await togetherApi.applyTogether(togetherId, payload.message);

            console.log("백엔드 신청 완료");
            alert("동행 신청이 완료되었습니다!");
          } catch (error) {
            console.error("신청 처리 오류:", error);
            alert("신청 처리 중 오류가 발생했습니다: " + error.message);
            throw error;
          }
        }}
      />

      {/* 모집 상태 변경 확인 모달 */}
      <ConfirmModal
        open={openStatusModal}
        title={
          isRecruiting
            ? "이 동행을 모집마감할까요?"
            : "이 동행을 모집재개할까요?"
        }
        description={
          isRecruiting
            ? "모집마감 후에는 참여 신청을 받을 수 없습니다."
            : "모집재개 후에는 다시 참여 신청을 받을 수 있습니다."
        }
        confirmText={isRecruiting ? "마감" : "재개"}
        cancelText="취소"
        variant={isRecruiting ? "danger" : "confirm"}
        onConfirm={async () => {
          if (!togetherId) {
            setOpenStatusModal(false);
            return alert("동행 ID를 확인할 수 없습니다.");
          }
          setStatusChanging(true);
          try {
            const action = isRecruiting ? "close" : "reopen";
            console.log("🔄 모집 상태 변경 요청:", { togetherId, action });

            await togetherApi.changeRecruitingStatus(togetherId, action);

            // 상태 업데이트
            setIsRecruiting(!isRecruiting);
            setOpenStatusModal(false);

            alert(
              isRecruiting ? "모집이 마감되었습니다." : "모집이 재개되었습니다."
            );
          } catch (e) {
            console.error("❌ 모집 상태 변경 오류:", e);

            let errorMessage = "모집 상태 변경 중 오류가 발생했습니다.";

            if (e.message?.includes("Failed to fetch")) {
              errorMessage =
                "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
            } else if (e.status === 401 || e.status === 403) {
              errorMessage = "권한이 없습니다. 로그인 상태를 확인해주세요.";
            } else if (e.status === 404) {
              errorMessage = "해당 동행 모집글을 찾을 수 없습니다.";
            } else if (e.message) {
              errorMessage = `오류: ${e.message}`;
            }

            alert(errorMessage);
          } finally {
            setStatusChanging(false);
          }
        }}
        onClose={() => setOpenStatusModal(false)}
      />

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        open={openDelete}
        title="게시글을 삭제할까요?"
        description="삭제 후에는 복구할 수 없습니다. 관련된 모든 신청과 데이터가 함께 삭제됩니다."
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        onConfirm={async () => {
          try {
            console.log(`Together 게시글 삭제 시도: ID ${togetherId}`);
            console.log("현재 사용자 정보:", user);
            console.log("게시글 정보:", post);
            console.log("게시글 호스트 정보:", post?.host);
            console.log("isOwnPost:", isOwnPost);

            // 토큰 확인
            const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
            console.log("Access Token:", token ? "존재함" : "없음");

            // 먼저 다른 API 호출이 정상 동작하는지 테스트
            try {
              console.log("DELETE 전 GET 요청 테스트...");
              const testGet = await togetherApi.getById(Number(togetherId));
              console.log("GET 요청 성공:", testGet ? "데이터 있음" : "데이터 없음");
            } catch (getError) {
              console.log("GET 요청 실패:", getError);
            }

            // API를 통해 실제 삭제
            await togetherApi.delete(Number(togetherId));
            console.log("Together 게시글 API 삭제 완료");

            // 로컬스토리지에서도 제거 (레거시 데이터 정리)
            deletePost("together", togetherId, { purgeExtras: true });

            setOpenDelete(false);

            // 삭제 완료 알림
            alert("게시글이 성공적으로 삭제되었습니다.");

            // 목록 페이지로 이동
            router.push("/together");

          } catch (error) {
            console.error("Together 게시글 삭제 실패:", error);

            let errorMessage = "게시글 삭제 중 오류가 발생했습니다.";

            if (error.message?.includes("Failed to fetch")) {
              errorMessage = "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
            } else if (error.status === 401 || error.status === 403) {
              errorMessage = "삭제 권한이 없습니다. 본인이 작성한 글만 삭제할 수 있습니다.";
            } else if (error.status === 404) {
              errorMessage = "이미 삭제되었거나 존재하지 않는 게시글입니다.";
              // 404인 경우 로컬스토리지에서 제거하고 목록으로 이동
              deletePost("together", togetherId, { purgeExtras: true });
              setOpenDelete(false);
              router.push("/together");
              return;
            } else if (error.message) {
              errorMessage = `오류: ${error.message}`;
            }

            alert(errorMessage);
            setOpenDelete(false);
          }
        }}
        onClose={() => setOpenDelete(false)}
      />
    </div>
  );
}
