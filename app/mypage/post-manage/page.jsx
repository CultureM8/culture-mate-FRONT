"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useLogin from "@/hooks/useLogin";
import Image from "next/image";

const fmtDate = (dt) => {
  if (!dt) return "0000-00-00 00:00:00";
  // 백엔드는 LocalDateTime을 내려줌 → 브라우저에서 그대로 출력하거나 간단 포맷
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return String(dt);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// Import the authenticated API instance
import { api, unwrap } from '@/lib/apiBase';

const fetchMyBoards = async (memberId) => {
  try {
    return await unwrap(
      api.get(`/v1/board/author/${memberId}`)
    );
  } catch (error) {
    console.error('내 게시글 조회 실패:', error);
    throw error;
  }
};

const deleteBoard = async (boardId) => {
  try {
    return await unwrap(
      api.delete(`/v1/board/${boardId}`)
    );
  } catch (error) {
    console.error('게시글 삭제 실패:', error);
    throw error;
  }
};

export default function PostManage() {
  const router = useRouter();
  const { ready, isLogined, user } = useLogin();

  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);

  const myId = useMemo(() => user?.id ?? user?.user_id ?? null, [user]);

  const refresh = async () => {
    if (!myId) {
      setMine([]);
      return;
    }
    const list = await fetchMyBoards(myId);
    setMine(Array.isArray(list) ? list : []);
  };

  useEffect(() => {
    if (!ready) return;
    if (!isLogined || !myId) {
      setMine([]);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, isLogined, myId]);

  // 응답 필드: id, title, content, author, eventCard, likeCount, createdAt, updatedAt
  // commentCount / viewCount 는 스펙에 없음 → 0으로 표시
  const rows = useMemo(
    () =>
      (mine || []).map((p) => ({
        id: p.id,
        title: p.title || "(제목 없음)",
        date: fmtDate(p.createdAt),
        comments: 0,
        recommends: p.likeCount ?? 0,
        views: 0,
      })),
    [mine]
  );

  const onDelete = async (id) => {
    if (!confirm("이 게시글을 삭제할까요? 삭제 후에는 복구할 수 없습니다."))
      return;
    try {
      await deleteBoard(id);
      await refresh();
    } catch (e) {
      console.error(e);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const onEdit = (id) => router.push(`/community/${id}/edit`);

  return (
    <>
      <h1 className="text-4xl font-bold py-[10px] h-16">게시물 관리</h1>

      {!ready || loading ? (
        <div className="mt-6 text-gray-500">불러오는 중…</div>
      ) : !isLogined ? (
        <div className="mt-6 text-gray-500">로그인 후 확인할 수 있습니다.</div>
      ) : (
        <div className="mt-6">
          <div
            className="grid border-b mb-2 text-sm py-3 px-4  bg-gray-50"
            style={{ gridTemplateColumns: "1fr 60px 60px 60px 300px 100px" }}>
            <div className="text-left">제목</div>
            <div className="text-center">댓글</div>
            <div className="text-center">추천</div>
            <div className="text-center">조회</div>
            <div className="text-center px-2">작성일</div>
            <div></div>
          </div>

          {rows.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              작성한 게시물이 없습니다.
            </div>
          ) : (
            rows.map((r) => (
              <div
                key={r.id}
                className="grid items-center py-3 px-4 border-b text-sm hover:bg-gray-50"
                style={{
                  gridTemplateColumns: "1fr 60px 60px 60px 300px 100px",
                }}>
                <div className="text-left">
                  <Link
                    href={`/community/${r.id}`}
                    className="text-gray-800 hover:underline line-clamp-1"
                    title={r.title}>
                    {r.title}
                  </Link>
                </div>

                <div className="text-center">{r.comments}</div>
                <div className="text-center">{r.recommends}</div>
                <div className="text-center">{r.views}</div>
                <div className="text-center text-gray-500 px-2 whitespace-nowrap">
                  {r.date}
                </div>

                <div className="flex items-center  justify-end gap-2">
                  <button
                    onClick={() => onEdit(r.id)}
                    className="px-3 py-1 rounded hover:bg-gray-100">
                    <Image src="/img/edit.svg" alt="" width={15} height={15} />
                  </button>
                  <button
                    onClick={() => onDelete(r.id)}
                    className="px-3 py-1 rounded hover:bg-gray-100">
                    <Image
                      src="/img/delete.svg"
                      alt=""
                      width={15}
                      height={15}
                    />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}
