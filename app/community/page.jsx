"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

import useLogin from "@/hooks/useLogin";
import { ICONS } from "@/constants/path";
import SlidingBanner from "@/components/community/SlidingBanner";
import { fetchPosts, searchPosts } from "@/lib/communityApi";
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

export default function CommunityListTablePage() {
  const [title, intro] = ["커뮤니티", "자유게시판"];

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState("createdAt_desc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // 중복 요청 방지를 위한 ref
  const loadingRef = useRef(false);
  const abortControllerRef = useRef(null);

  const { ready, isLogined } = useLogin();

  const handleWriteClick = () => router.push("/community/write");

  // 데이터 로딩 함수 - useCallback으로 최적화
  // 커뮤니티 페이지의 loadPosts 함수를 이렇게 수정하세요

  const loadPosts = useCallback(async (searchQuery = "") => {
    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 새로운 AbortController 생성
    abortControllerRef.current = new AbortController();

    // 이미 로딩 중이면 대기
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const kw = searchQuery.trim();
      console.log("API 호출:", { keyword: kw || "(전체)" });

      let posts = [];

      if (kw) {
        // 검색 모드 - 서버 에러 시 빈 결과 반환
        try {
          posts = await searchPosts({ keyword: kw });
          console.log("검색 결과:", posts?.length || 0, "건");
        } catch (searchError) {
          console.error("검색 API 에러:", searchError);
          // 검색 실패 시 빈 배열 반환하고 사용자에게 알림
          setError(`검색 중 오류가 발생했습니다. 서버 상태를 확인해주세요.`);
          setRows([]);
          return;
        }
      } else {
        // 전체 목록 모드
        posts = await fetchPosts();
        console.log("전체 목록:", posts?.length || 0, "건");
      }

      // 요청이 취소되었으면 무시
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

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
      if (e.name === "AbortError") {
        console.log("요청 취소됨");
        return;
      }
      console.error("API 에러:", e);
      setError("데이터를 불러올 수 없습니다. 서버 연결을 확인해주세요.");
      setRows([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // 초기화 - URL 파라미터 읽기 및 첫 로드
  useEffect(() => {
    if (initialized) return;

    const q = "";
    const s = searchParams.get("sort") || "createdAt_desc";
    const p = Math.max(1, parseInt(searchParams.get("p") || "1", 10));

    setQuery(q);
    setSortOption(s);
    setPage(p);
    setInitialized(true);

    // 초기 데이터 로드
    loadPosts(q);
  }, [searchParams, loadPosts, initialized]);

  // 검색어 변경 시 디바운스 처리
  useEffect(() => {
    if (!initialized) return;

    const timeoutId = setTimeout(() => {
      loadPosts(query);
      setPage(1); // 검색 시 첫 페이지로
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, loadPosts, initialized]);

  // URL 업데이트
  useEffect(() => {
    if (!initialized) return;

    const params = new URLSearchParams();
    if (sortOption !== "createdAt_desc") params.set("sort", sortOption);
    if (page > 1) params.set("p", String(page));

    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [sortOption, page, pathname, router, initialized]);

  // 클라이언트 정렬 및 페이지네이션
  const { paged, totalPages, safePage } = useMemo(() => {
    if (!Array.isArray(rows)) return { paged: [], totalPages: 1, safePage: 1 };

    // 정렬
    const [sortKey, sortDir] = sortOption.split("_");
    const dir = sortDir === "asc" ? 1 : -1;

    const sorted = [...rows].sort((a, b) => {
      if (sortKey === "createdAt") {
        return (
          (new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()) *
          dir
        );
      }
      return ((a[sortKey] ?? 0) - (b[sortKey] ?? 0)) * dir;
    });

    // 페이지네이션
    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    const paged = sorted.slice(start, start + PAGE_SIZE);

    return { paged, totalPages, safePage };
  }, [rows, sortOption, page]);

  // 페이지 이동
  const goPage = useCallback(
    (newPage) => {
      const targetPage = Math.min(Math.max(1, newPage), totalPages);
      setPage(targetPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [totalPages]
  );

  // 검색 핸들러
  const handleSearch = useCallback(
    (searchQuery) => {
      setQuery(searchQuery);
      setPage(1);
      loadPosts(searchQuery);

      // 검색 후 검색어 초기화
      setTimeout(() => {
        setQuery("");
      }, 100);
    },
    [loadPosts]
  );

  // 정렬 변경 핸들러
  const handleSortChange = useCallback((newSort) => {
    setSortOption(newSort);
    setPage(1);
  }, []);

  // 페이지 버튼 생성
  const pageButtons = useMemo(() => {
    const buttons = [];
    const maxVisible = 10;
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, safePage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      buttons.push(i);
    }

    return buttons;
  }, [safePage, totalPages]);

  return (
    <>
      <h1 className="text-4xl font-bold py-[10px] h-16 px-6">{title}</h1>
      <p className="text-xl pt-[10px] h-12 fill-gray-600 px-6">{intro}</p>

      <SlidingBanner />

      <div className="w-full mt-6 mb-2 flex items-center justify-end gap-3">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSearch={handleSearch}
          placeholder="제목, 내용, 작성자로 검색"
        />

        <span className="flex items-center gap-2">
          <select
            value={sortOption}
            onChange={(e) => handleSortChange(e.target.value)}
            className="h-10 px-2 bg-white min-w-[160px] border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            disabled={loading}>
            <option value="createdAt_desc">최근순</option>
            <option value="createdAt_asc">오래된순</option>
            <option value="comments_desc">댓글많은순</option>
            <option value="recommendations_desc">추천많은순</option>
            <option value="views_desc">조회수많은순</option>
          </select>

          {ready && isLogined && (
            <button
              className="flex items-center gap-1 hover:cursor-pointer  text-black px-4 py-2 rounded "
              onClick={handleWriteClick}>
              글쓰기
              <Image
                src={ICONS.ADD_WRITE}
                alt="글쓰기"
                width={24}
                height={24}
              />
            </button>
          )}
        </span>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="w-full max-w-[1200px] mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-600">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => loadPosts(query)}
              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
              다시 시도
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden">
        <div className="w-full mb-6 mt-10 space-y-1">
          {/* 테이블 헤더 */}
          <div
            className="grid border-b-2 border-gray-200 mb-4 text-sm py-3 px-4 text-center bg-gray-50 font-semibold"
            style={{ gridTemplateColumns: "140px 1fr 60px 60px 60px 200px" }}>
            <div className="text-left">작성자명</div>
            <div className="text-left">제목</div>
            <div className="text-center">댓글수</div>
            <div className="text-center">추천수</div>
            <div className="text-center">조회수</div>
            <div className="text-center">작성일</div>
          </div>

          {/* 로딩 */}
          {loading && (
            <div className="py-12 text-center">
              <div className="inline-flex items-center gap-2 text-gray-500">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                {query ? "검색 중..." : "로딩 중..."}
              </div>
            </div>
          )}

          {/* 빈 결과 */}
          {!loading && paged.length === 0 && (
            <div className="py-16 text-center text-gray-500">
              {query ? (
                <div>
                  <p className="text-lg mb-2">검색 결과가 없습니다</p>
                  <p className="text-sm text-gray-400">
                    다른 키워드로 검색해보세요
                  </p>
                </div>
              ) : (
                <p className="text-lg">게시글이 없습니다</p>
              )}
            </div>
          )}

          {/* 게시글 목록 */}
          {!loading &&
            paged.map((post) => (
              <div
                key={post.id}
                className="grid hover:bg-gray-50 bg-white py-3 px-4 border-b border-gray-300 transition-colors duration-150"
                style={{
                  gridTemplateColumns: "140px 1fr 60px 60px 60px 200px",
                }}>
                <div
                  className="text-sm text-gray-800 text-left truncate"
                  title={post.author}>
                  {post.author}
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/community/${post.id}`}
                    className="text-left text-sm text-gray-800 hover:text-blue-600 hover:underline line-clamp-1 transition-colors"
                    title={post.title}>
                    {post.title}
                  </Link>
                </div>
                <div className="text-center text-sm text-gray-600">
                  {post.comments}
                </div>
                <div className="text-center text-sm text-gray-600">
                  {post.recommendations}
                </div>
                <div className="text-center text-sm text-gray-600">
                  {post.views}
                </div>
                <div className="text-center text-xs text-gray-400">
                  {fmtDate(post.createdAt)}
                </div>
              </div>
            ))}

          {/* 페이지네이션 */}
          {!loading && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {/* 첫 페이지, 이전 */}
              {safePage > 1 && (
                <>
                  <button
                    onClick={() => goPage(1)}
                    className="px-3 py-2 rounded border text-gray-700 border-gray-300 hover:bg-gray-50 transition-colors">
                    ≪
                  </button>
                  <button
                    onClick={() => goPage(safePage - 1)}
                    className="px-3 py-2 rounded border text-gray-700 border-gray-300 hover:bg-gray-50 transition-colors">
                    이전
                  </button>
                </>
              )}

              {/* 페이지 번호들 */}
              {pageButtons.map((n) => (
                <button
                  key={n}
                  onClick={() => goPage(n)}
                  className={`min-w-[36px] px-3 py-2 rounded border transition-colors ${
                    n === safePage
                      ? "bg-blue-500 text-white border-blue-500"
                      : "text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}>
                  {n}
                </button>
              ))}

              {/* 다음, 마지막 페이지 */}
              {safePage < totalPages && (
                <>
                  <button
                    onClick={() => goPage(safePage + 1)}
                    className="px-3 py-2 rounded border text-gray-700 border-gray-300 hover:bg-gray-50 transition-colors">
                    다음
                  </button>
                  <button
                    onClick={() => goPage(totalPages)}
                    className="px-3 py-2 rounded border text-gray-700 border-gray-300 hover:bg-gray-50 transition-colors">
                    ≫
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
