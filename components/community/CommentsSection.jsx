// /components/CommentsSection.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import useLogin from "@/hooks/useLogin";
import { ROUTES } from "@/constants/path";
import { api, unwrap } from "@/lib/apiBase";
import { displayNameFromTriplet } from "@/lib/utils/displayName";

/** -------- 표시/권한 유틸 -------- */

/** 로그인 사용자 라벨(작성 폼 표기용): 닉네임 > login_id > #id */
const labelFromUser = (u) => {
  if (!u) return "사용자";
  const nick = u.nickname && String(u.nickname).trim();
  const lid = u.login_id && String(u.login_id).trim();
  const id = u.id ?? u.user_id;
  return nick || lid || (id != null ? `#${id}` : "사용자");
};

/** 수정/삭제 권한: 로그인 사용자 id == 댓글 authorId */
const isOwner = (user, comment) => {
  const uid = user?.id ?? user?.user_id;
  const aid = comment?.author?.id;
  return uid != null && aid != null && String(uid) === String(aid);
};

/** 날짜 포맷(백엔드: yyyy-MM-dd 형태여도 안전 처리) */
const fmt = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso; // 잘못된 날짜 형식일 경우 원본 반환

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");

    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
  } catch (e) {
    return iso; // 오류 발생 시 원본 문자열 반환
  }
};

/** -------- API 클라이언트 -------- */

// 목록
const fetchRootComments = (boardId) =>
  unwrap(api.get(`/v1/board/${boardId}/comments`));

// parent의 대댓글 목록
const fetchReplies = (boardId, parentId) =>
  unwrap(api.get(`/v1/board/${boardId}/comments/${parentId}/replies`));

// 생성(루트/대댓글 공통)
const createComment = (boardId, { authorId, comment, parentId = null }) =>
  unwrap(
    api.post(`/v1/board/${boardId}/comments`, {
      authorId,
      comment,
      parentId,
    })
  );

// 수정
const updateComment = (boardId, commentId, { comment }) =>
  unwrap(
    api.put(`/v1/board/${boardId}/comments/${commentId}`, {
      comment,
    })
  );

// 삭제
const deleteComment = (boardId, commentId) =>
  unwrap(api.delete(`/v1/board/${boardId}/comments/${commentId}`));

// 회원 상세 정보 (닉네임)
const fetchMemberDetail = (memberId) =>
  unwrap(api.get(`/v1/member-detail/${memberId}`));

// 회원 기본 정보 (로그인 ID)
const fetchMemberInfo = (memberId) => unwrap(api.get(`/v1/member/${memberId}`));

/** -------- 컴포넌트 -------- */

export default function CommentsSection({
  postId: boardId,
  bodyRef,
  onCountChange,
}) {
  const { ready, isLogined, user } = useLogin();

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fullPath = useMemo(() => {
    const q = searchParams?.toString();
    return q ? `${pathname}?${q}` : pathname;
  }, [pathname, searchParams]);

  const loginUrl =
    (ROUTES?.LOGIN || "/login") + `?next=${encodeURIComponent(fullPath)}`;

  // 목록 상태
  const [comments, setComments] = useState([]); // 루트 댓글들
  const [repliesMap, setRepliesMap] = useState(new Map()); // parentId -> replies[]
  const [loadingMap, setLoadingMap] = useState(new Map()); // parentId -> boolean

  // 작성자 정보 캐시
  const [authorCache, setAuthorCache] = useState(new Map()); // authorId -> {nickname, loginId}

  // UI 상태
  const [order, setOrder] = useState("oldest"); /* 'oldest' | 'newest'*/
  const [collapsed, setCollapsed] = useState(false);
  const [content, setContent] = useState(""); // 루트 입력창
  const [repliesInput, setRepliesInput] = useState({}); /* parentId => text*/
  const [editing, setEditing] = useState({}); /*commentId => text*/

  /** 작성자 정보 가져오기 (캐시 사용) */
  const fetchAuthorInfo = async (authorId) => {
    if (!authorId || authorCache.has(authorId)) {
      return authorCache.get(authorId) || null;
    }

    try {
      // 닉네임과 로그인 ID를 병렬로 가져오기
      const [memberDetailResult, memberInfoResult] = await Promise.allSettled([
        fetchMemberDetail(authorId),
        fetchMemberInfo(authorId),
      ]);

      const nickname =
        memberDetailResult.status === "fulfilled"
          ? memberDetailResult.value?.nickname?.trim() || null
          : null;

      const loginId =
        memberInfoResult.status === "fulfilled"
          ? memberInfoResult.value?.loginId?.trim() || null
          : null;

      const info = { nickname, loginId };
      setAuthorCache((cache) => new Map(cache).set(authorId, info));
      return info;
    } catch (e) {
      console.error(`Failed to fetch author info for ${authorId}:`, e);
      // 실패한 경우 기본값으로 캐시
      const fallback = { nickname: null, loginId: null };
      setAuthorCache((cache) => new Map(cache).set(authorId, fallback));
      return fallback;
    }
  };

  /** 댓글 작성자 표시 라벨 */
  const getAuthorLabel = (comment) => {
    const author = comment?.author;
    if (!author?.id) {
      return "#unknown";
    }

    // 댓글의 author 객체에 이름 정보가 있으면 바로 사용
    if (author.nickname || author.loginId) {
      return displayNameFromTriplet(author.nickname, author.loginId, author.id);
    }

    // 없으면 캐시에서 찾기
    const authorInfo = authorCache.get(author.id);
    if (!authorInfo) {
      return `#${author.id}`; // 캐시에도 없으면 ID 표시
    }

    return displayNameFromTriplet(
      authorInfo.nickname,
      authorInfo.loginId,
      author.id
    );
  };

  /** 댓글 목록에서 작성자 정보 미리 로드 */
  const preloadAuthorInfo = async (commentsList) => {
    const authorIds = new Set();

    // 모든 댓글에서 authorId 수집
    const collectAuthorIds = (comments) => {
      comments.forEach((comment) => {
        if (comment.authorId && !authorCache.has(comment.authorId)) {
          authorIds.add(comment.authorId);
        }
      });
    };

    collectAuthorIds(commentsList);

    // 대댓글에서도 수집
    repliesMap.forEach((replies) => {
      collectAuthorIds(replies);
    });

    // 병렬로 작성자 정보 로드
    const promises = Array.from(authorIds).map((authorId) =>
      fetchAuthorInfo(authorId)
    );

    await Promise.allSettled(promises);
  };

  /** 초기 로드 */
  useEffect(() => {
    if (!boardId) return;
    (async () => {
      try {
        const list = await fetchRootComments(boardId);
        const comments = Array.isArray(list) ? list : [];
        setComments(comments);
        onCountChange?.(comments.length);

        // 작성자 정보 미리 로드
        await preloadAuthorInfo(comments);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [boardId, onCountChange]);

  /** 정렬된 목록 */
  const sorted = useMemo(() => {
    const list = [...comments];
    list.sort((a, b) =>
      order === "oldest"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt)
    );
    return list;
  }, [comments, order]);

  /** 대댓글 불러오기(캐시) */
  const ensureReplies = async (parentId) => {
    if (!boardId || parentId == null) return;
    if (repliesMap.has(parentId)) return; // 이미 있음
    setLoadingMap((m) => new Map(m).set(parentId, true));
    try {
      const list = await fetchReplies(boardId, parentId);
      const replies = Array.isArray(list) ? list : [];
      setRepliesMap((m) => {
        const next = new Map(m);
        next.set(parentId, replies);
        return next;
      });

      // 대댓글 작성자 정보 미리 로드
      await preloadAuthorInfo(replies);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMap((m) => new Map(m).set(parentId, false));
    }
  };

  /** 루트 댓글 등록 */
  const submitRoot = async () => {
    const text = content.trim();
    if (!text || !isLogined) return;
    const authorId = user?.id ?? user?.user_id;
    if (authorId == null) {
      alert("로그인 정보가 없어 댓글을 작성할 수 없습니다.");
      return;
    }
    try {
      await createComment(boardId, { authorId, comment: text, parentId: null });
      // 새 목록 갱신
      const list = await fetchRootComments(boardId);
      const comments = Array.isArray(list) ? list : [];
      setComments(comments);
      onCountChange?.(comments.length);
      setContent("");

      // 새 댓글의 작성자 정보 로드
      await preloadAuthorInfo(comments);
    } catch (e) {
      console.error(e);
      alert("댓글 작성 중 오류가 발생했습니다.");
    }
  };

  /** 대댓글 등록 */
  const submitReply = async (parentId) => {
    const text = (repliesInput[parentId] || "").trim();
    if (!text || !isLogined) return;
    const authorId = user?.id ?? user?.user_id;
    if (authorId == null) {
      alert("로그인 정보가 없어 대댓글을 작성할 수 없습니다.");
      return;
    }
    try {
      await createComment(boardId, { authorId, comment: text, parentId });
      // 부모의 대댓글 다시 조회(캐시 갱신)
      const list = await fetchReplies(boardId, parentId);
      const replies = Array.isArray(list) ? list : [];
      setRepliesMap((m) => {
        const next = new Map(m);
        next.set(parentId, replies);
        return next;
      });
      setRepliesInput((s) => ({ ...s, [parentId]: "" }));

      // 새 대댓글의 작성자 정보 로드
      await preloadAuthorInfo(replies);
    } catch (e) {
      console.error(e);
      alert("대댓글 작성 중 오류가 발생했습니다.");
    }
  };

  /** 수정 모드 on */
  const startEdit = (c) => {
    if (!isOwner(user, c)) {
      alert("이 댓글을 수정할 권한이 없습니다.");
      return;
    }
    setEditing((s) => ({ ...s, [c.id]: c.content || "" }));
  };

  /** 수정 취소 */
  const cancelEdit = (id) =>
    setEditing((s) => {
      const x = { ...s };
      delete x[id];
      return x;
    });

  /** 저장 */
  const saveEdit = async (c, isReply = false, parentId = null) => {
    const id = c.id;
    const text = (editing[id] || "").trim();
    if (!text) return cancelEdit(id);
    if (!isOwner(user, c)) {
      cancelEdit(id);
      alert("이 댓글을 수정할 권한이 없습니다.");
      return;
    }
    try {
      await updateComment(boardId, id, { comment: text });
      if (isReply && parentId != null) {
        const list = await fetchReplies(boardId, parentId);
        const replies = Array.isArray(list) ? list : [];
        setRepliesMap((m) => {
          const next = new Map(m);
          next.set(parentId, replies);
          return next;
        });
        await preloadAuthorInfo(replies);
      } else {
        const list = await fetchRootComments(boardId);
        const comments = Array.isArray(list) ? list : [];
        setComments(comments);
        onCountChange?.(comments.length);
        await preloadAuthorInfo(comments);
      }
      cancelEdit(id);
    } catch (e) {
      console.error(e);
      alert("댓글 수정 중 오류가 발생했습니다.");
    }
  };

  /** 삭제(자식 포함 여부는 백엔드 정책 따름) */
  const remove = async (c, isReply = false, parentId = null) => {
    if (!isOwner(user, c)) {
      alert("이 댓글을 삭제할 권한이 없습니다.");
      return;
    }
    if (!confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      return;
    }
    try {
      await deleteComment(boardId, c.id);
      if (isReply && parentId != null) {
        const list = await fetchReplies(boardId, parentId);
        const replies = Array.isArray(list) ? list : [];
        setRepliesMap((m) => {
          const next = new Map(m);
          next.set(parentId, replies);
          return next;
        });
        await preloadAuthorInfo(replies);
      } else {
        const list = await fetchRootComments(boardId);
        const comments = Array.isArray(list) ? list : [];
        setComments(comments);
        onCountChange?.(comments.length);
        await preloadAuthorInfo(comments);
      }
    } catch (e) {
      console.error(e);
      alert("댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  /** 단축키 */
  const onKeyDownSubmit = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isLogined) submitRoot();
    }
  };
  const onKeyDownReply = (parentId) => (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isLogined) submitReply(parentId);
    }
  };

  return (
    <section className="mt-8">
      {/* 상단 컨트롤 바 */}
      <div className="flex items-center justify-between text-[13px] text-gray-700">
        <button
          onClick={() => setOrder(order === "oldest" ? "newest" : "oldest")}
          className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100">
          <span className="font-medium">
            {order === "oldest" ? "등록순" : "최신순"}
          </span>
          <span className="text-gray-400">▼</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              bodyRef?.current?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-2 py-1 rounded hover:bg-gray-100">
            본문 보기
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100">
            {collapsed ? "댓글 펼치기" : "댓글 접기"}{" "}
            <span className="text-gray-400">▼</span>
          </button>
        </div>
      </div>

      {/* 댓글 목록 */}
      {!collapsed && (
        <ul className="mt-3 space-y-2.5">
          {sorted.length === 0 && (
            <li className="text-sm text-gray-500">첫 댓글을 남겨보세요.</li>
          )}

          {sorted.map((c) => {
            const canEdit = isOwner(user, c);

            return (
              <li key={c.id}>
                <div className="rounded-md border border-gray-300 bg-white p-4">
                  {/* 댓글 1행 */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {editing[c.id] !== undefined ? (
                        <>
                          <div className="mb-1 text-[12px] text-gray-500">
                            {getAuthorLabel(c)}
                          </div>
                          <textarea
                            value={editing[c.id]}
                            onChange={(e) =>
                              setEditing((s) => ({
                                ...s,
                                [c.id]: e.target.value,
                              }))
                            }
                            className="w-full min-h-[72px] rounded border border-gray-300 px-2 py-1 text-[13px] focus:outline-none focus:ring-1 focus:ring-gray-400"
                          />
                        </>
                      ) : (
                        <div className="flex items-baseline gap-4 flex-wrap">
                          <span className="shrink-0 text-[14px] text-gray-500">
                            {getAuthorLabel(c)}
                          </span>
                          <p className="break-words text-[14px] leading-relaxed text-gray-900">
                            {c.content}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-3 text-[12px] text-gray-500">
                      <span className="whitespace-nowrap">
                        {fmt(c.createdAt)}
                      </span>
                      {/* 수정/삭제: 작성자만 표시 */}
                      {editing[c.id] !== undefined ? (
                        <>
                          <button
                            onClick={() => saveEdit(c)}
                            className="underline underline-offset-2 hover:text-gray-700">
                            저장
                          </button>
                          <button
                            onClick={() => cancelEdit(c.id)}
                            className="underline underline-offset-2 hover:text-gray-700">
                            취소
                          </button>
                        </>
                      ) : (
                        canEdit && (
                          <>
                            <button
                              onClick={() => startEdit(c)}
                              aria-label="edit"
                              title="수정"
                              className="px-1 py-1 hover:bg-gray-50">
                              <Image
                                src="/img/edit.svg"
                                alt=""
                                width={15}
                                height={15}
                              />
                            </button>
                            <button
                              onClick={() => remove(c)}
                              aria-label="delete"
                              title="삭제"
                              className="px-1 py-1 hover:bg-gray-50">
                              <Image
                                src="/img/delete.svg"
                                alt=""
                                width={15}
                                height={15}
                              />
                            </button>
                          </>
                        )
                      )}
                    </div>
                  </div>

                  {/* 답글 토글 / 입력 */}
                  {isLogined && (
                    <div className="mt-2 flex items-center gap-4">
                      <button
                        onClick={async () => {
                          // 대댓글 목록을 한 번도 안 불렀으면 로드
                          await ensureReplies(c.id);
                          // 입력창 토글
                          setRepliesInput((s) => ({
                            ...s,
                            [c.id]: s[c.id] === undefined ? "" : undefined,
                          }));
                        }}
                        className="text-[12px] text-gray-600 underline-offset-2 hover:underline mt-2">
                        {repliesInput[c.id] === undefined
                          ? "답글 쓰기"
                          : "답글 닫기"}
                      </button>

                      {typeof c.replyCount === "number" && c.replyCount > 0 && (
                        <button
                          onClick={() => ensureReplies(c.id)}
                          className="text-[12px] text-gray-600 underline-offset-2 hover:underline mt-2"
                          title="대댓글 보기">
                          대댓글 {c.replyCount}개 보기
                        </button>
                      )}
                    </div>
                  )}

                  {/* 답글 작성 */}
                  {isLogined && repliesInput[c.id] !== undefined && (
                    <div className="mt-3 pl-5 border-l border-gray-200">
                      <div className="flex items-start gap-4">
                        <span className="mt-2 text-gray-400">↳</span>
                        <div className="flex-1">
                          <div className="mb-1 text-[12px] text-gray-500">
                            <span className="mr-1">작성자</span>
                            <span>{labelFromUser(user)}</span>
                          </div>
                          <textarea
                            value={repliesInput[c.id]}
                            onChange={(e) =>
                              setRepliesInput((s) => ({
                                ...s,
                                [c.id]: e.target.value,
                              }))
                            }
                            onKeyDown={onKeyDownReply(c.id)}
                            placeholder="답글 작성란"
                            className="w-full min-h-[72px] rounded border border-gray-300 px-2 py-1 text-[13px] focus:outline-none focus:ring-1 focus:ring-gray-400"
                          />
                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={() => submitReply(c.id)}
                              disabled={!repliesInput[c.id]?.trim()}
                              className={`h-8 rounded px-3 text-xs text-white ${
                                repliesInput[c.id]?.trim()
                                  ? "bg-gray-900 hover:bg-gray-800"
                                  : "bg-gray-300 cursor-not-allowed"
                              }`}>
                              등록
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 대댓글 리스트 */}
                  {(repliesMap.get(c.id) || []).length > 0 && (
                    <div className="mt-3 space-y-2 pl-5">
                      {loadingMap.get(c.id) && (
                        <div className="text-[12px] text-gray-500">
                          대댓글 불러오는 중…
                        </div>
                      )}
                      {(repliesMap.get(c.id) || []).map((r) => {
                        const rCanEdit = isOwner(user, r);
                        return (
                          <div
                            key={r.id}
                            className="rounded-md border border-gray-200 bg-gray-50 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                {editing[r.id] !== undefined ? (
                                  <>
                                    <div className="mb-1 text-[12px] text-gray-500">
                                      ↳ {getAuthorLabel(r)}
                                    </div>
                                    <textarea
                                      value={editing[r.id]}
                                      onChange={(e) =>
                                        setEditing((s) => ({
                                          ...s,
                                          [r.id]: e.target.value,
                                        }))
                                      }
                                      className="w-full min-h-[60px] rounded border border-gray-300 px-2 py-1 text-[13px] focus:outline-none focus:ring-1 focus:ring-gray-400"
                                    />
                                  </>
                                ) : (
                                  <div className="flex items-baseline gap-2 flex-wrap">
                                    <span className="shrink-0 text-[12px] text-gray-500">
                                      ↳ {getAuthorLabel(r)}
                                    </span>
                                    <p className="break-words text-[13px] leading-relaxed text-gray-900">
                                      {r.content}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="flex shrink-0 items-center gap-3 text-[12px] text-gray-500">
                                <span className="whitespace-nowrap">
                                  {fmt(r.createdAt)}
                                </span>
                                {editing[r.id] !== undefined ? (
                                  <>
                                    <button
                                      onClick={() => saveEdit(r, true, c.id)}
                                      className="underline underline-offset-2 hover:text-gray-700">
                                      저장
                                    </button>
                                    <button
                                      onClick={() => cancelEdit(r.id)}
                                      className="underline underline-offset-2 hover:text-gray-700">
                                      취소
                                    </button>
                                  </>
                                ) : (
                                  rCanEdit && (
                                    <>
                                      <button
                                        onClick={() => startEdit(r)}
                                        title="수정"
                                        className="px-1 py-1 hover:bg-gray-50">
                                        <Image
                                          src="/img/edit.svg"
                                          alt=""
                                          width={15}
                                          height={15}
                                        />
                                      </button>
                                      <button
                                        onClick={() => remove(r, true, c.id)}
                                        title="삭제"
                                        className="px-1 py-1 hover:bg-gray-50">
                                        <Image
                                          src="/img/delete.svg"
                                          alt=""
                                          width={15}
                                          height={15}
                                        />
                                      </button>
                                    </>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* 새 댓글 작성 영역 */}
      <div className="mt-8 border-t border-gray-200 pt-6 mb-5">
        <div className="rounded-md border border-gray-300 bg-white p-4">
          {ready && !isLogined ? (
            /* 비로그인: 작성 불가 + 로그인 유도 */
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-600">
                로그인 후 댓글을 작성할 수 있습니다.
              </p>
              <Link
                href={loginUrl}
                className="px-3 py-2 text-sm rounded bg-black text-white hover:bg-gray-800">
                로그인하기
              </Link>
            </div>
          ) : (
            /* 로그인: 작성 가능 */
            <div>
              <div className="flex gap-3 min-h-[100px]">
                <div className="w-44 px-3 py-2 text-sm text-gray-600">
                  <span className="text-gray-400 mr-1">작성자</span>
                  <span className="font-medium">{labelFromUser(user)}</span>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={onKeyDownSubmit}
                  placeholder={`타인의 권리를 침해하거나 명예를 훼손하는 댓글은 제재를 받을 수 있습니다.
+Shift+Enter 키를 동시에 누르면 줄바꿈이 됩니다.`}
                  className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={submitRoot}
                  disabled={!content.trim()}
                  className={`h-7 rounded px-4 text-sm text-white ${
                    content.trim()
                      ? "bg-gray-900 hover:bg-gray-800"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}>
                  등록
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
