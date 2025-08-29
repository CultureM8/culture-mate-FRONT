"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadPosts } from "@/lib/storage";
import Image from "next/image";
import SearchBar from "@/components/global/SearchBar";
import useLogin from "@/hooks/useLogin";
import { ICONS } from "@/constants/path";
import { useRouter } from "next/navigation";
import SlidingBanner from "@/components/community/SlidingBanner";

function fmtDate(iso) {
  if (!iso) return "0000-00-00 00:00:00";
  const d = new Date(iso);
  if (Number.isNaN(+d)) return "0000-00-00 00:00:00";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function getCommentCount(id) {
  if (typeof window === "undefined") return 0;
  try {
    const arr = JSON.parse(localStorage.getItem(`comments:${id}`) || "[]");
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

export default function CommunityListTablePage() {
  const [title, intro] = ["커뮤니티", "자유게시판"];
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const { ready, isLogined } = useLogin();
  const router = useRouter();
  const handleWriteClick = () => {
    router.push("/community/write");
  };

  useEffect(() => {
    const arr = loadPosts("community");

    const mapped = arr.map((p) => ({
      id: p.id,
      title: p.title || "제목",

      author:
        p.author_login_id ??
        (typeof p.author === "string"
          ? p.author
          : p.author?.login_id ?? p.author?.id ?? p.author?.name ?? ""),

      createdAt: p.createdAt,
      views: p.stats?.views ?? 0,
      recommendations: p.stats?.recommendations ?? p.recommendations ?? 0,

      comments: getCommentCount(p.id),
    }));
    setRows(mapped);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows;
    if (q) {
      list = rows.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.author.toLowerCase().includes(q)
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sortKey === "createdAt") {
        const av = new Date(a.createdAt || 0).getTime();
        const bv = new Date(b.createdAt || 0).getTime();
        return (av - bv) * dir;
      }
      return ((a[sortKey] ?? 0) - (b[sortKey] ?? 0)) * dir;
    });
  }, [rows, query, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };
  /*ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ */
  return (
    <>
      <h1 className="text-4xl font-bold py-[10px] h-16 px-6">{title}</h1>
      <p className="text-xl pt-[10px] h-12 fill-gray-600 px-6">{intro}</p>
      {/* <div className="absolute left-1/2 top-[0px] -translate-x-1/2 w-screen h-[370px] z-0 "> */}
      {/* <Image
          src={"/img/default_img.svg"}
          alt="배너 이미지"
          fill
          className="object-cover opacity-30"
        /> */}
      <SlidingBanner />
      {/* </div> */}
      {/* <div className="border w-full h-[370px]"> */}
      {/* 배경 위에 올라갈 메인 이미지 */}
      {/* </div> */}
      <div className="w-full max-w-[1200px] mt-6 mb-2 flex items-center justify-end gap-3">
        <SearchBar />

        <span className="flex items-center gap-2">
          {/* 검색 */}

          {/* 정렬: 기준 */}
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="h-10 px-2  bg-white">
            <option value="createdAt">작성일</option>
            <option value="comments">댓글수</option>
            <option value="recommendations">추천수</option>
            <option value="views">조회수</option>
          </select>

          {/* 정렬: 방향 */}
          <select
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value)}
            className="h-10 px-2  bg-white">
            <option value="desc">내림차순</option>
            <option value="asc">오름차순</option>
          </select>
          {/* </div> */}
          {ready && isLogined ? (
            <button
              className="flex items-center gap-1 hover:cursor-pointer"
              onClick={handleWriteClick}>
              글쓰기
              <Image
                src={ICONS.ADD_WRITE}
                alt="글쓰기"
                width={24}
                height={24}
              />
            </button>
          ) : null}
        </span>
      </div>

      {/* 테이블 */}
      <div className="overflow-hidden">
        <table className="w-full table-fixed border-separate border-spacing-y-2 mb-10">
          <colgroup>
            <col className="w-[140px]" />
            <col />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[200px]" />
          </colgroup>
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm rounded-md">
              <th className="py-3 px-4 text-left">작성자명</th>
              <th className="py-3 px-4 text-left">제목</th>
              <th className="py-3 px-4 text-right">댓글수</th>
              <th className="py-3 px-4 text-right">추천수</th>
              <th className="py-3 px-4 text-right">조회수</th>
              <th className="py-3 px-4 text-center">작성일</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 shadow-md">
                <td className="py-3 px-4 text-sm text-gray-800 border-t border-b border-l border-gray-300 rounded-tl-md rounded-bl-md">
                  {r.author}
                </td>
                <td className="py-3 px-4 border-t border-b border-gray-300">
                  <Link
                    href={`/community/${r.id}`}
                    className="text-sm text-gray-900 hover:underline line-clamp-1">
                    {r.title}
                  </Link>
                </td>
                <td className="py-3 px-4 text-right text-sm border-t border-b border-gray-300">
                  {r.comments}
                </td>
                <td className="py-3 px-4 text-right text-sm border-t border-b border-gray-300">
                  {r.recommendations}
                </td>
                <td className="py-3 px-4 text-right text-sm border-t border-b border-gray-300">
                  {r.views}
                </td>
                <td className="py-3 px-4 text-center text-sm text-gray-600 border-t border-b border-r border-gray-300 rounded-tr-md rounded-br-md">
                  {fmtDate(r.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
