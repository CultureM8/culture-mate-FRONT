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
import togetherApi from "@/lib/api/togetherApi";

/* storage 유틸 */
import {
  // getPost, // 더 이상 주 데이터 소스로 사용 안 함
  bumpViews,
  isLiked,
  toggleLike,
  deletePost,
} from "@/lib/storage";

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

/** 이벤트 미니 카드 변환 */
const toMiniCard = (ev = {}, registeredPosts = 0) => ({
  eventImage: ev.eventImage ?? ev.image ?? ev.imgSrc ?? "/img/default_img.svg",
  eventType: ev.eventType ?? ev.type ?? "기타",
  eventName: ev.eventName ?? ev.name ?? ev.title ?? "이벤트",
  description: ev.description ?? "",
  likes: ev.likes ?? ev.liked ?? 0,
  starScore: ev.starScore ?? ev.rating ?? ev.score ?? 0,
  initialLiked: ev.initialLiked ?? ev.isLiked ?? false,
  registeredPosts,
});

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
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [mounted, setMounted] = useState(false); // 하이드레이션 안전 가드

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

        // 2. 좋아요 상태 설정
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
          alert("글을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
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
  //     // 최신값 재반영
  //     // const updated = getPost("together", togetherId); // getPost is not defined
  //     // setPost(updated || post);
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
    const authorUid = post.hostId || post.authorId || post._ownerKey;
    isOwnPost =
      myUid != null && authorUid != null && String(myUid) === String(authorUid);
  }

  /* 이벤트 카드 데이터 */
  const card = post?.eventSnapshot
    ? post.eventSnapshot
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

          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>작성자 : {displayHost}</span>
              {mounted && <span>{createdAtText}</span>}
            </div>

            <div className="flex items-center pr-2 gap-2">
              {/* <span>조회 {views}</span> // 백엔드에 조회수 속성 없음 - 주석 처리 */}
              <span>
                <button
                  className="flex flex-col items-center py-3 ml-2"
                  onClick={onToggleLike}>
                  {liked ? (
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
              <span>{likeCount}</span>
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
                {`${post.currentParticipants || 1} / ${post.maxParticipants || 1} 명`}
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
                {/* <Image src={ICONS.PIN} alt="위치" width={16} height={16} /> */}
                {/* <button className="text-base text-blue-500">지도 보기</button> */}
                {/* <Image src={ICONS.COPY} alt="복사" width={16} height={16} /> */}
                {/* <button
                  className="text-base text-gray-500"
                  onClick={() => {
                    const addr = post?.meetingLocation || "";
                    if (!addr) return;
                    navigator.clipboard
                      .writeText(addr)
                      .then(() => alert("주소를 복사했습니다."))
                      .catch(() => alert("복사에 실패했습니다."));
                  }}>
                  주소 복사
                </button> */}
              </div>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="mb-8 min-h-[600px]">
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

          {/* 동행 신청 버튼 - 마운트 후에만 조건부 렌더링 */}
          {mounted && isLogined && !isOwnPost && (
            <button
              onClick={handleChatClick}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
              동행 신청
            </button>
          )}
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
          group: formatGroupInfo(post), // "1/2명" 형식
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
          // 수신자(호스트) 식별값을 확실히 채움
          authorUid: hostUid || hostMeta.uid || "",
          authorId:
            hostUid || hostMeta.uid || hostLogin || hostMeta.loginId || "",
          authorLoginId: hostLogin || hostMeta.loginId || "",
          authorName: displayHost,
        }}
        eventData={eventData}
        onSendRequest={async (payload) => {
          console.log("현재 사용자 정보:", user);
          console.log("로컬 저장소 방식으로 신청 처리");
          console.log("신청 데이터:", payload);
          try {
            // toUserId 필드 추가
            const enhancedPayload = {
              ...payload,
              toUserId:
                hostUid ||
                hostMeta.uid ||
                payload.authorUid ||
                payload.authorId, // 받는 사람 ID
              fromUserId: user?.id || user?.user_id, // 보내는 사람 ID
            };

            console.log("수정된 신청 데이터:", enhancedPayload);

            const created = addChatRequest(enhancedPayload);
            window.dispatchEvent(
              new CustomEvent("chat-request:sync", {
                detail: { type: "created", payload: created },
              })
            );

            console.log("로컬 신청 완료:", created);
          } catch (error) {
            console.error("신청 처리 오류:", error);
            throw error;
          }
        }}
      />

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        open={openDelete}
        title="게시글을 삭제할까요?"
        description="삭제 후에는 복구할 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        onConfirm={() => {
          deletePost("together", togetherId, { purgeExtras: true });
          setOpenDelete(false);
          router.push("/together");
        }}
        onClose={() => setOpenDelete(false)}
      />
    </div>
  );
}