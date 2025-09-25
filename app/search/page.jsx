"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MainSearchBar from "@/components/global/MainSearchBar";

export default function TotalSearch() {

  const searchParams = useSearchParams();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [eventCount, setEventCount] = useState(0);
  const [togetherCount, setTogetherCount] = useState(0);

  useEffect(() => {
    // URL 쿼리 파라미터에서 검색어 가져오기
    const query = searchParams.get("q") || "";
    setKeyword(query);

    // TODO: 검색어로 API 호출하여 결과 가져오기
    if (query) {
      // 여기서 실제 검색 API 호출
      console.log("검색어:", query);
      setEventCount(0);
      setTogetherCount(0);
    }
  }, [searchParams]);

  // 검색 실행 핸들러
  const handleSearch = (newKeyword) => {
    router.push(`/search?q=${encodeURIComponent(newKeyword)}`);
  };

  function Title({ site, keyword, count }) {
    const title = `${site}의 "${keyword}" 검색 결과`;
    return (
      <div className="h-7 mb-2 flex items-center gap-2 mb-4">
        <h2 className="font-bold text-xl text-[#26282a] leading-[1.4]">
          {title}
        </h2>
        <div className="text-gray-500">
          총 {count}건
        </div>
      </div>
    );
  }

  /**ui렌더링*/
  return (
    <div className="my-10">
      {/* 검색바 추가 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-center mb-6">통합검색</h1>
        <MainSearchBar
          initialValue={keyword}
          placeholder="검색어를 입력해주세요"
          onSearch={handleSearch}
          showTags={false}
        />
      </div>

      {/* 검색 결과가 있을 때만 표시 */}
      {keyword && (
        <>
          <div className="mb-10">
            <Title site="[이벤트] " keyword={keyword} count={eventCount} />
            <div className="p-4 bg-gray-50 rounded-lg">이벤트의 검색 결과가 표시됩니다</div>
          </div>
          <div className="mb-10">
            <Title site="[동행모집글] " keyword={keyword} count={togetherCount} />
            <div className="p-4 bg-gray-50 rounded-lg">동행모집글의 검색결과가 표시됩니다</div>
          </div>
        </>
      )}

      {/* 검색어가 없을 때 */}
      {!keyword && (
        <div className="text-center py-20 text-gray-500">
          검색어를 입력해주세요
        </div>
      )}
    </div>
  );
}
