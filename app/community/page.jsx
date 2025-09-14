"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

import useLogin from "@/hooks/useLogin";
import { ICONS } from "@/constants/path";
import SearchBar from "@/components/global/SearchBar";
import ListLayout from "@/components/global/ListLayout";
import CommunityList from "@/components/community/CommunityList";
import CommunityTableHeader from "@/components/community/CommunityTableHeader";
import * as boardApi from "@/lib/api/boardApi";

const { getBoardList, searchBoards, transformBoardList } = boardApi;

const PAGE_SIZE = 30;

export default function CommunityListTablePage() {
  const [title, intro] = ["커뮤니티", "자유게시판"];

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [boardPosts, setBoardPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState("createdAt_desc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const loadingRef = useRef(false);
  const abortControllerRef = useRef(null);

  const { ready, isLogined } = useLogin();

  const handleWriteClick = () => router.push("/community/write");

  const loadPosts = useCallback(async (searchQuery = "") => {
    // 이미 로딩 중이면 대기
    if (loadingRef.current) {
      return;
    }

    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 새로운 AbortController 생성
    abortControllerRef.current = new AbortController();

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const keyword = searchQuery.trim();
      let posts = [];

      if (keyword) {
        try {
          posts = await searchBoards({ keyword });
        } catch (searchError) {
          console.error("검색 API 에러:", searchError);
          setError(`검색 중 오류가 발생했습니다. 서버 상태를 확인해주세요.`);
          setBoardPosts([]);
          return;
        }
      } else {
        posts = await getBoardList();
      }

      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const mapped = transformBoardList(posts);
      setBoardPosts(mapped);
    } catch (e) {
      if (e.name === "AbortError") {
        return;
      }
      console.error("API 에러:", e);
      setError("데이터를 불러올 수 없습니다. 서버 연결을 확인해주세요.");
      setBoardPosts([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (initialized) return;

    const sortFromUrl = searchParams.get("sort") || "createdAt_desc";

    setQuery("");
    setSortOption(sortFromUrl);
    setInitialized(true);

    loadPosts("");
  }, [searchParams, loadPosts, initialized]);

  useEffect(() => {
    if (!initialized) return;

    const timeoutId = setTimeout(() => {
      loadPosts(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, loadPosts, initialized]);

  useEffect(() => {
    if (!initialized) return;

    const params = new URLSearchParams();
    if (sortOption !== "createdAt_desc") params.set("sort", sortOption);

    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [sortOption, pathname, router, initialized]);

  const sortedBoardPosts = useMemo(() => {
    if (!Array.isArray(boardPosts)) return [];

    const [sortKey, sortDir] = sortOption.split("_");
    const dir = sortDir === "asc" ? 1 : -1;

    return [...boardPosts].sort((a, b) => {
      if (sortKey === "createdAt") {
        return (
          (new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()) *
          dir
        );
      }
      return ((a[sortKey] ?? 0) - (b[sortKey] ?? 0)) * dir;
    });
  }, [boardPosts, sortOption]);

  const handleSearch = useCallback(
    (searchQuery) => {
      setQuery(searchQuery);
      loadPosts(searchQuery);
    },
    [loadPosts]
  );

  const handleSortChange = useCallback((newSort) => {
    setSortOption(newSort);
  }, []);

  return (
    <>
      <h1 className="text-4xl font-bold py-[10px] h-16 px-6">{title}</h1>
      <p className="text-xl pt-[10px] h-12 fill-gray-600 px-6">{intro}</p>

      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-8">
        <div className="relative w-full h-[370px] overflow-hidden ">
          <div className="min-w-full h-full relative flex-shrink-0">
            <img
              src={"/img/communitybanner.jpg"}
              alt={"배너이미지"}
              className="w-full h-full object-cover block"
            />
          </div>
        </div>
      </div>

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
            {/* <option value="views_desc">조회수많은순</option> */}
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
          <CommunityTableHeader />

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
          {!loading && sortedBoardPosts.length === 0 && (
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

          {/* 게시글 목록 with ListLayout */}
          {!loading && sortedBoardPosts.length > 0 && (
            <ListLayout
              Component={CommunityList}
              items={sortedBoardPosts}
              itemsPerPage={PAGE_SIZE}
            />
          )}
        </div>
      </div>
    </>
  );
}
