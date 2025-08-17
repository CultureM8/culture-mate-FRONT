'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

/** 로컬스토리지 키 유틸 */
const KEY = (postId) => `comments:${postId}`;
const load = (postId) => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY(postId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const save = (postId, list) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY(postId), JSON.stringify(list));
};

export default function CommentsSection({ postId, bodyRef }) {
  /** 상태: 목록/정렬/접기 */
  const [comments, setComments] = useState([]);
  const [order, setOrder] = useState('oldest');
  const [collapsed, setCollapsed] = useState(false);

  /** 상태: 작성 */
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');

  /** 상태: 대댓글 입력값 (parentId => text) */
  const [replies, setReplies] = useState({});

  /** 상태: 수정 모드 (commentId => text) */
  const [editing, setEditing] = useState({});

  /** 초기 로드 */
  useEffect(() => {
    setComments(load(postId));
  }, [postId]);

  /** 정렬된 목록 */
  const sorted = useMemo(() => {
    const list = [...comments];
    list.sort((a, b) =>
      order === 'oldest'
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt)
    );
    return list;
  }, [comments, order]);

  /** 루트/자식 매핑 */
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

  /** 저장 헬퍼 */
  const persist = (next) => {
    setComments(next);
    save(postId, next);
  };

  /** 루트 댓글 등록 */
  const submitRoot = () => {
    if (!content.trim()) return;
    const entry = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      parentId: null,
      author: author.trim() || '작성자명',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    persist([entry, ...comments]);
    setContent('');
  };

  /** 대댓글 등록 */
  const submitReply = (parentId) => {
    const text = (replies[parentId] || '').trim();
    if (!text) return;
    const entry = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      parentId,
      author: '대댓 작성자명',
      content: text,
      createdAt: new Date().toISOString(),
    };
    persist([entry, ...comments]);
    setReplies((s) => ({ ...s, [parentId]: '' }));
  };

  /** 수정 모드 on/off + 저장 */
  const startEdit = (c) => setEditing((s) => ({ ...s, [c.id]: c.content }));
  const cancelEdit = (id) =>
    setEditing((s) => {
      const x = { ...s };
      delete x[id];
      return x;
    });
  const saveEdit = (id) => {
    const text = (editing[id] || '').trim();
    if (!text) return cancelEdit(id);
    const next = comments.map((c) =>
      c.id === id
        ? { ...c, content: text, editedAt: new Date().toISOString() }
        : c
    );
    persist(next);
    cancelEdit(id);
  };

  /** 삭제(자식까지) */
  const remove = (id) => {
    const next = comments.filter((c) => c.id !== id && c.parentId !== id);
    persist(next);
  };

  /** 단축키: 등록 */
  const onKeyDownSubmit = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitRoot();
    }
  };
  const onKeyDownReply = (parentId) => (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitReply(parentId);
    }
  };

  /** 날짜 포맷 */
  const fmt = (iso) => new Date(iso).toLocaleString();

  return (
    <section className="mt-8">
      {/* ------------------------------------------------
          상단 컨트롤 바: 정렬/본문보기/접기
         ------------------------------------------------ */}
      <div className="flex items-center justify-between text-[13px] text-gray-700">
        <button
          onClick={() => setOrder(order === 'oldest' ? 'newest' : 'oldest')}
          className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100">
          <span className="font-medium">
            {order === 'oldest' ? '등록순' : '최신순'}
          </span>
          <span className="text-gray-400">▼</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              bodyRef?.current?.scrollIntoView({ behavior: 'smooth' })
            }
            className="px-2 py-1 rounded hover:bg-gray-100">
            본문 보기
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100">
            {collapsed ? '댓글 펼치기' : '댓글 접기'}{' '}
            <span className="text-gray-400">▼</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------
          댓글 목록
         ------------------------------------------------ */}
      {!collapsed && (
        <ul className="mt-3 space-y-2.5">
          {roots.length === 0 && (
            <li className="text-sm text-gray-500">첫 댓글을 남겨보세요.</li>
          )}

          {roots.map((c) => (
            <li key={c.id}>
              {/* --------------------------------------------
                  댓글 카드 (부모 + 그 아래 대댓글들까지 한 프레임)
                 -------------------------------------------- */}
              <div className="rounded-md border border-gray-300 bg-white p-4">
                {/* 댓글 1행: 작성자 + 내용 / 우측 액션 */}
                <div className="flex items-start justify-between gap-4">
                  {/* 좌: 작성자명 + 내용 한 행 */}
                  <div className="min-w-0 flex-1">
                    {editing[c.id] !== undefined ? (
                      <>
                        {/* 수정모드: 작성자 표시 */}
                        <div className="mb-1 text-[12px] text-gray-500">
                          {c.author || '작성자명'}
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
                      /**댓글 표시되는 란 */
                      <div className="flex items-baseline gap-4 flex-wrap">
                        <span className="shrink-0 text-[14px] text-gray-500">
                          {c.author || '작성자명'}
                        </span>
                        <p className="break-words text-[14px] leading-relaxed text-gray-900">
                          {c.content}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 우: 날짜/수정/삭제 */}
                  <div className="flex shrink-0 items-center gap-3 text-[12px] text-gray-500">
                    <span className="whitespace-nowrap">
                      {fmt(c.createdAt)}
                    </span>
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
                    )}
                  </div>
                </div>

                {/* 댓글 하단: 답글 쓰기 토글 버튼 */}
                <div className="mt-2">
                  <button
                    onClick={() =>
                      setReplies((s) => ({
                        ...s,
                        [c.id]: s[c.id] === undefined ? '' : undefined, // undefined면 숨김, ''면 표시
                      }))
                    }
                    className="text-[12px] text-gray-600 underline-offset-2 hover:underline mt-2">
                    {replies[c.id] === undefined ? '답글 쓰기' : '답글 닫기'}
                  </button>
                </div>

                {/* (토글) 대댓글 작성 영역: 클릭 시에만 렌더 */}
                {replies[c.id] !== undefined && (
                  <div className="mt-3 pl-5 border-l border-gray-200">
                    <div className="flex items-start gap-4">
                      <span className="mt-2 text-gray-400">↳</span>
                      <div className="flex-1">
                        <div className="mb-1 text-[12px] text-gray-500">
                          대댓 작성자명
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
                          placeholder="대댓글 작성란"
                          className="w-full min-h-[72px] rounded border border-gray-300 px-2 py-1 text-[13px] focus:outline-none focus:ring-1 focus:ring-gray-400"
                        />
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={() => submitReply(c.id)}
                            disabled={!replies[c.id]?.trim()}
                            className={`h-8 rounded px-3 text-xs text-white ${
                              replies[c.id]?.trim()
                                ? 'bg-gray-900 hover:bg-gray-800'
                                : 'bg-gray-300 cursor-not-allowed'
                            }`}>
                            등록
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 대댓글 리스트(같은 프레임 안에 노출) */}
                {(childOf.get(c.id) || []).length > 0 && (
                  <div className="mt-3 space-y-2 pl-5">
                    {(childOf.get(c.id) || []).map((r) => (
                      <div
                        key={r.id}
                        className="rounded-md border border-gray-200 bg-gray-50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          {/* 좌: 작성자 + 내용 한 행 */}
                          <div className="min-w-0 flex-1">
                            {editing[r.id] !== undefined ? (
                              <>
                                <div className="mb-1 text-[12px] text-gray-500">
                                  ↳ {r.author || '대댓 작성자명'}
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
                                  ↳ {r.author || '대댓 작성자명'}
                                </span>
                                <p className="break-words text-[13px] leading-relaxed text-gray-900">
                                  {r.content}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* 우: 날짜/수정/삭제 */}
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
                              <>
                                <button
                                  onClick={() => startEdit(r)}
                                  title="수정"
                                  className=" px-1 py-1 hover:bg-gray-50">
                                  <button
                                    className=""
                                    onClick={() =>
                                      navigator.clipboard.writeText(
                                        window.location.href
                                      )
                                    }>
                                    <Image
                                      src="/img/edit.svg"
                                      alt=""
                                      width={15}
                                      height={15}
                                    />
                                  </button>
                                </button>
                                <button
                                  onClick={() => remove(r.id)}
                                  title="삭제"
                                  className=" px-1 py-1 hover:bg-gray-50">
                                  <Image
                                    src="/img/delete.svg"
                                    alt=""
                                    width={15}
                                    height={15}
                                  />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ------------------------------------------------
          하단: 새 댓글 작성 영역
         ------------------------------------------------ */}
      <div className="mt-8 border-t border-gray-200 pt-6 mb-5">
        <div className="rounded-md border border-gray-300 bg-white p-4">
          <div className="flex gap-3 min-h-[100px]">
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="작성자명"
              className="w-44 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={onKeyDownSubmit}
              placeholder={`타인의 권리를 침해하거나 명예를 훼손하는 댓글은 운영원칙 및 관련법률에 제재를 받을 수 있습니다.
Shift+Enter 키를 동시에 누르면 줄바꿈이 됩니다.`}
              className=" flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={submitRoot}
              disabled={!content.trim()}
              className={`h-7 rounded px-4 text-sm text-white ${
                content.trim()
                  ? 'bg-gray-900 hover:bg-gray-800'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}>
              등록
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
