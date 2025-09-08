"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

import useLogin from "@/hooks/useLogin";
import { ICONS } from "@/constants/path";
import SlidingBanner from "@/components/community/SlidingBanner";
// import { loadPosts } from "@/lib/storage";
import { fetchPosts } from "@/lib/communityApi";
import SearchBar from "@/components/global/SearchBar";

const PAGE_SIZE = 30;

function fmtDate(iso) {
  if (!iso) return "0000-00-00 00:00:00";
  const d = new Date(iso);
  if (Number.isNaN(+d)) return "0000-00-00 00:00:00";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function getRootCommentCount(id) {
  if (typeof window === "undefined") return 0;
  try {
    const arr = JSON.parse(localStorage.getItem(`comments:${id}`) || "[]");
    return Array.isArray(arr) ? arr.filter((c) => !c.parentId).length : 0;
  } catch {
    return 0;
  }
}

function authorText(p) {
  return (
    p.author_display_name ||
    p.authorLoginId ||
    String(p.authorId || "") ||
    "익명"
  );
}

export default function CommunityListTablePage() {
  const [title, intro] = ["커뮤니티", "자유게시판"];

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const didInitRef = useRef(false);

  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState("createdAt_desc");
  const [page, setPage] = useState(1);

  const { ready, isLogined } = useLogin();

  const handleWriteClick = () => router.push("/community/write");
  //프론트용
  // useEffect(() => {
  //   const arr = loadPosts("community");
  //   const mapped = (arr || []).map((p) => ({
  //     id: p.id,
  //     title: p.title || "제목",
  //     author: authorText(p),
  //     createdAt: p.createdAt,
  //     views: p._views ?? 0,
  //     recommendations:
  //       p.recommendCount ?? p.recommend ?? p.recommendations ?? 0, // ✅ 추천
  //     comments: getRootCommentCount(p.id),
  //   }));
  //   setRows(mapped);
  // }, []);

  //백엔드용
  // 목록 페이지 useEffect 수정
  useEffect(() => {
    let stop = false;
    const loadData = async () => {
      try {
        let posts;

        // 검색어가 있으면 searchPosts, 없으면 fetchPosts 호출
        if (query.trim()) {
          posts = await searchPosts({ q: query.trim() });
        } else {
          posts = await fetchPosts();
        }

        if (stop) return;

        // posts가 배열인지 확인
        console.log("API 응답:", posts);

        const mapped = (Array.isArray(posts) ? posts : []).map((p) => ({
          id: p.id,
          title: p.title || "제목",
          author:
            p.author_display_name ||
            p.authorLoginId ||
            String(p.authorId || "") ||
            "익명",
          createdAt: p.createdAt,
          views: p._views ?? 0,
          recommendations: p.recommendCount ?? 0,
          comments: p.commentsCount ?? 0,
        }));
        setRows(mapped);
      } catch (e) {
        console.error("목록 로드 에러:", e);
        setRows([]);
      }
    };

    loadData();

    // 포커스 이벤트 추가
    const handleFocus = () => loadData();
    const handleVisibilityChange = () => {
      if (!document.hidden) loadData();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stop = true;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [query]);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const q = (searchParams.get("q") ?? "").trim();
    const s = searchParams.get("sort") ?? "createdAt_desc";
    const p = Math.max(1, parseInt(searchParams.get("p") ?? "1", 10) || 1);

    setQuery(q);
    setSortOption(s);
    setPage(p);
  }, [searchParams]);

  useEffect(() => {
    if (!didInitRef.current) return;
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (sortOption && sortOption !== "createdAt_desc")
      params.set("sort", sortOption);
    if (page > 1) params.set("p", String(page));

    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, { scroll: false });
  }, [query, sortOption, page, pathname, router]);

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
    const [sortKey, sortDir] = sortOption.split("_");
    const dir = sortDir === "asc" ? 1 : -1;

    return [...list].sort((a, b) => {
      if (sortKey === "createdAt") {
        const av = new Date(a.createdAt || 0).getTime();
        const bv = new Date(b.createdAt || 0).getTime();
        return (av - bv) * dir;
      }
      return ((a[sortKey] ?? 0) - (b[sortKey] ?? 0)) * dir;
    });
  }, [rows, query, sortOption]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const paged = filtered.slice(start, end);

  useEffect(() => {
    setPage(1);
  }, [query, sortOption, rows.length]);

  const pages = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  );

  const goPage = (p) => {
    setPage(Math.min(Math.max(1, p), totalPages));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <h1 className="text-4xl font-bold py-[10px] h-16 px-6">{title}</h1>
      <p className="text-xl pt-[10px] h-12 fill-gray-600 px-6">{intro}</p>

      <SlidingBanner />

      <div className="w-full max-w-[1200px] mt-16 mb-2 flex items-center justify-end gap-3">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSearch={(q) => {
            setQuery(q);
            setPage(1);
          }}
        />

        <span className="flex items-center gap-2">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="h-10 px-2 bg-white min-w-[160px]">
            <option value="createdAt_desc">최근순</option>
            <option value="createdAt_asc">오래된순</option>
            <option value="comments_desc">댓글많은순</option>
            <option value="recommendations_desc">추천많은순</option>
            <option value="views_desc">조회수많은순</option>
          </select>

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

      <div className="overflow-hidden">
        <div className="w-full mb-6 mt-10 space-y-1">
          <div
            className="grid border-b mb-4 text-sm py-3 px-4 text-center"
            style={{ gridTemplateColumns: "140px 1fr 60px 60px 60px 200px" }}>
            <div className="text-left">작성자명</div>
            <div className="text-left">제목</div>
            <div className="text-center">댓글수</div>
            <div className="text-center">추천수</div>
            <div className="text-center">조회수</div>
            <div className="text-center">작성일</div>
          </div>

          {filtered.length === 0 && (
            <div className="py-10 text-center text-gray-500">
              검색 결과가 없습니다.
            </div>
          )}

          {paged.map((r) => (
            <div
              key={r.id}
              className="grid hover:bg-gray-50 bg-white py-3 px-4 border-b border-gray-300"
              style={{ gridTemplateColumns: "140px 1fr 60px 60px 60px 200px" }}>
              <div className="text-sm text-gray-800 text-left">{r.author}</div>
              <div>
                <Link
                  href={`/community/${r.id}`}
                  className="text-left text-sm text-gray-800 hover:underline line-clamp-1">
                  {r.title}
                </Link>
              </div>
              <div className="text-center text-sm">{r.comments}</div>
              <div className="text-center text-sm">{r.recommendations}</div>
              <div className="text-center text-sm">{r.views}</div>
              <div className="text-center text-sm text-gray-400">
                {fmtDate(r.createdAt)}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => goPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className={`px-3 py-2 rounded border ${
                  safePage === 1
                    ? "text-gray-300 border-gray-200 cursor-not-allowed"
                    : "text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}>
                이전
              </button>

              {pages.map((n) => (
                <button
                  key={n}
                  onClick={() => goPage(n)}
                  className={`min-w-[36px] px-3 py-2 rounded border ${
                    n === safePage
                      ? "bg-black text-white border-black"
                      : "text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}>
                  {n}
                </button>
              ))}

              <button
                onClick={() => goPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage === totalPages}
                className={`px-3 py-2 rounded border ${
                  safePage === totalPages
                    ? "text-gray-300 border-gray-200 cursor-not-allowed"
                    : "text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}>
                다음
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
