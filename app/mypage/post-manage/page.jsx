"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useLogin from "@/hooks/useLogin";
import { loadPosts, deletePost } from "@/lib/storage";
import Image from "next/image";

const fmtDate = (iso) => {
  if (!iso) return "0000-00-00 00:00:00";
  const d = new Date(iso);
  if (Number.isNaN(+d)) return "0000-00-00 00:00:00";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const rootComments = (postId) => {
  if (typeof window === "undefined") return 0;
  try {
    const arr = JSON.parse(localStorage.getItem(`comments:${postId}`) || "[]");
    return Array.isArray(arr) ? arr.filter((c) => !c.parentId).length : 0;
  } catch {
    return 0;
  }
};

const userKey = (u) => String(u?.id ?? u?.user_id ?? u?.login_id ?? "");

export default function PostManage() {
  const router = useRouter();
  const { ready, isLogined, user } = useLogin();
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    const all = loadPosts("community");
    const key = userKey(user);
    const filtered = (all || []).filter(
      (p) => String(p._ownerKey || "") === key
    );
    setMine(filtered);
  };

  useEffect(() => {
    if (!ready) return;
    if (!isLogined) {
      setMine([]);
      setLoading(false);
      return;
    }
    refresh();
    setLoading(false);

    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [ready, isLogined, user]);

  const rows = useMemo(() => {
    return (mine || []).map((p) => ({
      id: p.id,
      title: p.title || "(제목 없음)",
      date: fmtDate(p.createdAt),
      recommends: p.recommendCount ?? p.recommend ?? p.recommendations ?? 0,
      views: p._views ?? 0,
      comments: rootComments(p.id),
    }));
  }, [mine]);

  const onDelete = async (id) => {
    if (!confirm("이 게시글을 삭제할까요? 삭제 후에는 복구할 수 없습니다."))
      return;
    deletePost("community", id, { purgeExtras: true });
    refresh();
  };

  const onEdit = (id) => router.push(`/community/${id}/edit`);

  return (
    <>
      <h1 className="text-4xl font-bold py-[10px] h-16">게시물 관리</h1>

      {!ready || loading ? (
        <div className="mt-6 text-gray-500">불러오는 중…</div>
      ) : !isLogined ? (
        <div className="mt-6 text-gray-500">로그인 후 확인할 수 있습니다.</div>
      ) : rows.length === 0 ? (
        <div className="mt-6 text-gray-500">작성한 게시물이 없습니다.</div>
      ) : (
        <div className="mt-6">
          <div
            className="grid border-b mb-2 text-sm py-3 px-4 text-center bg-gray-50"
            style={{ gridTemplateColumns: "1fr 120px 90px 90px 90px 170px" }}>
            <div className="text-left">제목</div>
            <div>작성일</div>
            <div>댓글</div>
            <div>추천</div>
            <div>조회</div>
            <div></div>
          </div>

          {rows.map((r) => (
            <div
              key={r.id}
              className="grid items-center py-3 px-4 border-b text-sm hover:bg-gray-50"
              style={{ gridTemplateColumns: "1fr 120px 90px 90px 90px 170px" }}>
              {/* 제목: 클릭 시 상세 이동 */}
              <div className="text-left">
                <Link
                  href={`/community/${r.id}`}
                  className="text-gray-800 hover:underline line-clamp-1"
                  title={r.title}>
                  {r.title}
                </Link>
              </div>

              <div className="text-center text-gray-500">{r.date}</div>
              <div className="text-center">{r.comments}</div>
              <div className="text-center">{r.recommends}</div>
              <div className="text-center">{r.views}</div>

              <div className="flex items-center  justify-center gap-2">
                <button
                  onClick={() => onEdit(r.id)}
                  className="px-3 py-1  rounded hover:bg-gray-100">
                  <Image src="/img/edit.svg" alt="" width={15} height={15} />
                </button>
                <button
                  onClick={() => onDelete(r.id)}
                  className="px-3 py-1  rounded  hover:bg-gray-100">
                  <Image src="/img/delete.svg" alt="" width={15} height={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
