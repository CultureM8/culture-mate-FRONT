"use client";

import HistoryEvent from "./history/HistoryEvent";

export default function MyEventReview() {
  return (
    <div className="w-full">
      {/* 이벤트 리뷰 리스트 영역 */}
      <div className="mt-4">
        <HistoryEvent />
      </div>
    </div>
  );
}