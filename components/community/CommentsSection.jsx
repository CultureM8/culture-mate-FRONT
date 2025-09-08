"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import useLogin from "@/hooks/useLogin";
import { ROUTES } from "@/constants/path";

// ✅ 백엔드 댓글 API
import {
  listParentComments,
  listReplies,
  addComment,
  updateComment,
  deleteComment,
} from "@/lib/communityApi";

/** 표시명 규칙(로그인 사용자용) */
const getDisplayName = (u) => {
  if (!u) return "사용자";
  const dn = u.display_name && String(u.display_name).trim();
  const nn = u.nickname && String(u.nickname).trim();
  const rn = u.name && String(u.name).trim();
  const lid = u.login_id && String(u.login_id).trim();
  const uid = u.id || u.user_id;
  return dn || nn || rn || lid || uid || "사용자";
};

/** 로그인 사용자 키(권한 판별용) */
const getUserKey = (u) => {
  const uid = u?.id ?? u?.user_id ?? "";
  const lid = u?.login_id ?? "";
  return String(uid || lid || "");
};

/** 댓글 소유자 키(레거시 호환) */
const getOwnerKeyFromComment = (c) =>
  String(c?.ownerKey ?? c?.userId ?? c?.authorLoginId ?? "");

/** 서버 응답(CommentResponseDto) → 컴포넌트 내 표준 형태로 변환 */
function adaptParent(c) {
  return {
    id: c.id,
    parentId: null,
    author: `#${c.authorId}`, // 서버에 표시명이 없으므로 authorId를 표시
    authorLoginId: "", // 서버 미제공
    userId: c.authorId,
    ownerKey: String(c.authorId),
    content: c.content,
    createdAt: c.createdAt, // LocalDate 문자열 ("YYYY-MM-DD")
    editedAt: c.updatedAt ?? null, // LocalDate 또는 null
    likeCount: c.likeCount ?? 0,
    replyCount: c.replyCount ?? 0,
  };
}
function adaptReply(parentId, c) {
  return {
    id: c.id,
    parentId,
    author: `#${c.authorId}`,
    authorLoginId: "",
    userId: c.authorId,
    ownerKey: String(c.authorId),
    content: c.content,
    createdAt: c.createdAt,
    editedAt: c.updatedAt ?? null,
    likeCount: c.likeCount ?? 0,
    replyCount: 0,
  };
}

export default function CommentsSection({ postId, bodyRef, onCountChange }) {
  const { ready, isLogined, user } = useLogin();
  const currentKey = getUserKey(user);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fullPath = useMemo(() => {
    const q = searchParams?.toString();
    return q ? `${pathname}?${q}` : pathname;
  }, [pathname, searchParams]);
  const loginUrl =
    (ROUTES?.LOGIN || "/login") + `?next=${encodeURIComponent(fullPath)}`;

  const [comments, setComments] = useState([]);
  const [order, setOrder] = useState("oldest"); /* 'oldest' | 'newest'*/
  const [collapsed, setCollapsed] = useState(false);

  const [content, setContent] = useState("");
  const [replies, setReplies] = useState({}); /* parentId => text*/
  const [editing, setEditing] = useState({}); /* commentId => text*/

  /** 서버에서 부모/대댓글 모두 불러와 합치는 함수 */
  const refresh = async () => {
    try {
      const parents = await listParentComments(postId); // CommentResponseDto[]
      const parentRows = (parents || []).map(adaptParent);

      // 부모 각각의 대댓글 불러오기
      const allReplies = await Promise.all(
        parentRows.map(async (p) => {
          const items = await listReplies(postId, p.id);
          return (items || []).map((r) => adaptReply(p.id, r));
        })
      ).then((arr) => arr.flat());

      const merged = [...parentRows, ...allReplies];
      setComments(merged);
      onCountChange?.(parentRows.length);
    } catch (e) {
      console.error(e);
      setComments([]);
      onCountChange?.(0);
    }
  };

  /* 초기 로드 */
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  /* 정렬 */
  const sorted = useMemo(() => {
    const list = [...comments];
    list.sort((a, b) =>
      order === "oldest"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt)
    );
    return list;
  }, [comments, order]);

  const roots = useMemo(() => sorted.filter((c) => !c.parentId), [sorted]);

  const childOf = useMemo(() => {
    const map = new Map();
    sorted.forEach((c) => {
      if (!c.parentId) return;
      if (!map.has(c.parentId)) map.set(c.parentId, []);
      map.get(c.parentId).push(c);
    });
    return map;
  }, [sorted]);

  /* 댓글 등록 */
  const submitRoot = async () => {
    if (!content.trim()) return;
    if (!isLogined) return;

    const authorId = user?.id ?? user?.user_id;
    if (!authorId) return;

    try {
      await addComment(postId, {
        authorId,
        parentId: null,
        comment: content.trim(),
      });
      setContent("");
      await refresh();
    } catch (e) {
      console.error(e);
    }
  };

  /* 대댓글 등록 */
  const submitReply = async (parentId) => {
    const text = (replies[parentId] || "").trim();
    if (!text) return;
    if (!isLogined) return;

    const authorId = user?.id ?? user?.user_id;
    if (!authorId) return;

    try {
      await addComment(postId, { authorId, parentId, comment: text });
      setReplies((s) => ({ ...s, [parentId]: "" }));
      await refresh();
    } catch (e) {
      console.error(e);
    }
  };

  /* 수정 모드 on/off + 저장(권한 체크 포함) */
  const startEdit = (c) => {
    const ownerKey = getOwnerKeyFromComment(c);
    if (!currentKey || currentKey !== ownerKey) {
      return alert("이 댓글을 수정할 권한이 없습니다.");
    }
    setEditing((s) => ({ ...s, [c.id]: c.content }));
  };

  const cancelEdit = (id) =>
    setEditing((s) => {
      const x = { ...s };
      delete x[id];
      return x;
    });

  const saveEdit = async (id) => {
    const text = (editing[id] || "").trim();
    if (!text) return cancelEdit(id);

    const target = comments.find((c) => c.id === id);
    const ownerKey = getOwnerKeyFromComment(target);
    if (!currentKey || currentKey !== ownerKey) {
      cancelEdit(id);
      return alert("이 댓글을 수정할 권한이 없습니다.");
    }

    const authorId = user?.id ?? user?.user_id;
    if (!authorId) return cancelEdit(id);

    try {
      await updateComment(postId, id, { authorId, comment: text });
      cancelEdit(id);
      await refresh();
    } catch (e) {
      console.error(e);
    }
  };

  /* 삭제(자식까지, 권한 체크 포함) */
  const remove = async (id) => {
    const target = comments.find((c) => c.id === id);
    const ownerKey = getOwnerKeyFromComment(target);
    if (!currentKey || currentKey !== ownerKey) {
      return alert("이 댓글을 삭제할 권한이 없습니다.");
    }

    const requesterId = user?.id ?? user?.user_id;
    if (!requesterId) return;

    try {
      await deleteComment(postId, id, requesterId);
      await refresh();
    } catch (e) {
      console.error(e);
    }
  };

  /* 단축키 */
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

  /* 날짜 포맷 (LocalDate 문자열/ISO 모두 허용) */
  const fmt = (v) => {
    if (!v) return "";
    const s = typeof v === "string" ? v : String(v);
    const d = new Date(s);
    return isNaN(+d) ? s : d.toLocaleString();
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
          {roots.length === 0 && (
            <li className="text-sm text-gray-500">첫 댓글을 남겨보세요.</li>
          )}

          {roots.map((c) => {
            const ownerKey = getOwnerKeyFromComment(c);
            const canEdit = !!currentKey && currentKey === ownerKey;

            return (
              <li key={c.id}>
                <div className="rounded-md border border-gray-300 bg-white p-4">
                  {/* 댓글 1행 */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {editing[c.id] !== undefined ? (
                        <>
                          <div className="mb-1 text-[12px] text-gray-500">
                            {c.author}
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
                            {c.author}
                          </span>
                          <p className="break-words text-[14px] leading-relaxed text-gray-900">
                            {c.content}
                            {c.editedAt && (
                              <span className="ml-2 text-[11px] text-gray-400">
                                (수정됨)
                              </span>
                            )}
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
                            onClick={() => saveEdit(c.id)}
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
                              onClick={() => remove(c.id)}
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

                  {/* 답글 토글 */}
                  {isLogined && (
                    <div className="mt-2">
                      <button
                        onClick={() =>
                          setReplies((s) => ({
                            ...s,
                            [c.id]: s[c.id] === undefined ? "" : undefined,
                          }))
                        }
                        className="text-[12px] text-gray-600 underline-offset-2 hover:underline mt-2">
                        {replies[c.id] === undefined
                          ? "답글 쓰기"
                          : "답글 닫기"}
                      </button>
                    </div>
                  )}

                  {/* 답글 작성 */}
                  {isLogined && replies[c.id] !== undefined && (
                    <div className="mt-3 pl-5 border-l border-gray-200">
                      <div className="flex items-start gap-4">
                        <span className="mt-2 text-gray-400">↳</span>
                        <div className="flex-1">
                          <div className="mb-1 text-[12px] text-gray-500">
                            <span className="mr-1">작성자</span>
                            <span>{getDisplayName(user)}</span>
                          </div>
                          <textarea
                            value={replies[c.id]}
                            onChange={(e) =>
                              setReplies((s) => ({
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
                              disabled={!replies[c.id]?.trim()}
                              className={`h-8 rounded px-3 text-xs text-white ${
                                replies[c.id]?.trim()
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

                  {/* 답글 리스트 */}
                  {(childOf.get(c.id) || []).length > 0 && (
                    <div className="mt-3 space-y-2 pl-5">
                      {(childOf.get(c.id) || []).map((r) => {
                        const rOwnerKey = getOwnerKeyFromComment(r);
                        const rCanEdit =
                          !!currentKey && currentKey === rOwnerKey;
                        return (
                          <div
                            key={r.id}
                            className="rounded-md border border-gray-200 bg-gray-50 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                {editing[r.id] !== undefined ? (
                                  <>
                                    <div className="mb-1 text-[12px] text-gray-500">
                                      ↳ {r.author}
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
                                      ↳ {r.author}
                                    </span>
                                    <p className="break-words text-[13px] leading-relaxed text-gray-900">
                                      {r.content}
                                      {r.editedAt && (
                                        <span className="ml-2 text-[11px] text-gray-400">
                                          (수정됨)
                                        </span>
                                      )}
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
                                      onClick={() => saveEdit(r.id)}
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
                                        onClick={() => remove(r.id)}
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
                className="px-3 py-2 text-sm rounded bg黑 text-white hover:bg-gray-800"
                style={{ backgroundColor: "black" }}>
                로그인하기
              </Link>
            </div>
          ) : (
            /* 로그인: 작성 가능 */
            <div>
              <div className="flex gap-3 min-h-[100px]">
                <div className="w-44 px-3 py-2 text-sm text-gray-600">
                  <span className="text-gray-400 mr-1">작성자</span>
                  <span className="font-medium">{getDisplayName(user)}</span>
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
