"use client";

import { useState, useRef, useEffect } from "react";

export default function GalleryLayout({
  Component,
  items,
  commonProps = {},
  itemsPerPage = 20,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const layoutRef = useRef(null);

  // items가 변경되면 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (layoutRef.current) {
      const elementTop =
        layoutRef.current.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementTop - 100,
        behavior: "smooth",
      });
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 10;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 이전 버튼
    if (currentPage > 1) {
      pageNumbers.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-2 text-gray-600 hover:text-black">
          &lt;
        </button>
      );
    }

    // 페이지 번호
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 ${
            currentPage === i
              ? "bg-black text-white"
              : "text-gray-600 hover:text-black"
          }`}>
          {i}
        </button>
      );
    }

    // 다음 버튼
    if (currentPage < totalPages) {
      pageNumbers.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-2 text-gray-600 hover:text-black">
          &gt;
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div ref={layoutRef}>
      <div className="grid grid-cols-4 gap-0">
        {currentItems.map((item, idx) => {
          // 고유한 key 생성: item.id 또는 item._key 또는 고유한 식별자 사용
          const uniqueKey =
            item.id ||
            item._key ||
            item.eventId ||
            `${item.title}-${startIndex + idx}`;
          return <Component key={uniqueKey} {...item} {...commonProps} />;
        })}
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center items-center mt-8 gap-1">
        {renderPageNumbers()}
      </div>

      {/* 페이지 정보 */}
      <div className="text-center text-gray-500 text-sm mt-4">
        {items.length}개 중 {startIndex + 1}-{Math.min(endIndex, items.length)}
        개 표시
      </div>
    </div>
  );
}
