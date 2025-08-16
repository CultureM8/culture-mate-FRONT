'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

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
  const [comments, setComments] = useState([]);
  const [order, setOrder] = useState('oldest');
  const [collapsed, setCollapsed] = useState(false);

  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');

  const [replies, setReplies] = useState({});

  const [editing, setEditing] = useState({});

  useEffect(() => {
    setComments(load(postId));
  }, [postId]);

  const sorted = useMemo(() => {
    const list = [...comments];
    list.sort((a, b) =>
      order === 'oldest'
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

  const persist = (next) => {
    setComments(next);
    save(postId, next);
  };

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

  const remove = (id) => {
    const next = comments.filter((c) => c.id !== id && c.parentId !== id);
    persist(next);
  };

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

  const fmt = (iso) => new Date(iso).toLocaleString();

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOrder(order === 'oldest' ? 'newest' : 'oldest')}
            className="inline-flex items-center gap-1">
            <span className="font-medium">
              {order === 'oldest' ? '등록순' : '최신순'}
            </span>
            <span className="text-gray-400">▼</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              bodyRef?.current?.scrollIntoView({ behavior: 'smooth' })
            }
            className="text-gray-700 hover:underline">
            본문 보기
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-700 hover:underline">
            {collapsed ? '댓글 펼치기' : '댓글 접기'}{' '}
            <span className="text-gray-400">▼</span>
          </button>
        </div>
      </div>

      {!collapsed && (
        <ul className="mt-4 space-y-3">
          {roots.length === 0 && (
            <li className="text-sm text-gray-500">첫 댓글을 남겨보세요.</li>
          )}

          {roots.map((c) => (
            <li key={c.id}>
              <div className="border rounded-lg p-3 bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-gray-800 text-[13px]">
                    <span className="text-gray-500">작성자명</span>
                    <div className="mt-1">
                      {editing[c.id] !== undefined ? (
                        <textarea
                          value={editing[c.id]}
                          onChange={(e) =>
                            setEditing((s) => ({
                              ...s,
                              [c.id]: e.target.value,
                            }))
                          }
                          className="w-full min-h-[60px] border rounded px-2 py-1 text-[13px]"
                        />
                      ) : (
                        <span className="text-[13px] text-gray-800">
                          {c.content}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{fmt(c.createdAt)}</span>
                    {editing[c.id] !== undefined ? (
                      <>
                        <button
                          onClick={() => saveEdit(c.id)}
                          className="underline">
                          저장
                        </button>
                        <button
                          onClick={() => cancelEdit(c.id)}
                          className="underline">
                          취소
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(c)}
                          aria-label="edit"
                          title="수정">
                          ✏️
                        </button>
                        <button
                          onClick={() => remove(c.id)}
                          aria-label="delete"
                          title="삭제">
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-2">
                  <button
                    onClick={() =>
                      setReplies((s) => ({
                        ...s,
                        [c.id]: s[c.id] ? s[c.id] : '',
                      }))
                    }
                    className="text-xs text-gray-600 hover:underline">
                    답글 쓰기
                  </button>
                </div>

                {replies[c.id] !== undefined && (
                  <div className="mt-2 pl-6 border-l">
                    <div className="flex items-start gap-2">
                      <span className="mt-2">↳</span>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">
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
                          className="w-full min-h-[60px] border rounded px-2 py-1 text-[13px]"
                        />
                        <div className="mt-1 flex justify-end">
                          <button
                            onClick={() => submitReply(c.id)}
                            disabled={!replies[c.id]?.trim()}
                            className={`px-3 py-1 rounded text-white text-xs ${
                              replies[c.id]?.trim()
                                ? 'bg-gray-800'
                                : 'bg-gray-300 cursor-not-allowed'
                            }`}>
                            등록
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {(childOf.get(c.id) || []).map((r) => (
                <div key={r.id} className="mt-2 pl-6">
                  <div className="border rounded-lg p-3 bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-gray-800 text-[13px]">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>↳</span>
                          <span>대댓 작성자명</span>
                        </div>
                        <div className="mt-1">
                          {editing[r.id] !== undefined ? (
                            <textarea
                              value={editing[r.id]}
                              onChange={(e) =>
                                setEditing((s) => ({
                                  ...s,
                                  [r.id]: e.target.value,
                                }))
                              }
                              className="w-full min-h-[60px] border rounded px-2 py-1 text-[13px]"
                            />
                          ) : (
                            <span className="text-[13px]">{r.content}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{fmt(r.createdAt)}</span>
                        {editing[r.id] !== undefined ? (
                          <>
                            <button
                              onClick={() => saveEdit(r.id)}
                              className="underline">
                              저장
                            </button>
                            <button
                              onClick={() => cancelEdit(r.id)}
                              className="underline">
                              취소
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(r)} title="수정">
                              ✏️
                            </button>
                            <button onClick={() => remove(r.id)} title="삭제">
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 border-t pt-6">
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex gap-2">
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="작성자명"
              className="w-40 border rounded px-3 py-2 text-sm"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={onKeyDownSubmit}
              placeholder="타인의 권리를 침해하거나 명예를 훼손하는 댓글은 운영원칙 및 관련법률에 제재를 받을 수 있습니다.
Shift+Enter 키를 동시에 누르면 줄바꿈이 됩니다."
              className="flex-1 min-h-[120px] border rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-2 flex justify-end">
            <button
              onClick={submitRoot}
              disabled={!content.trim()}
              className={`px-4 py-2 rounded text-white ${
                content.trim()
                  ? 'bg-gray-900'
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
