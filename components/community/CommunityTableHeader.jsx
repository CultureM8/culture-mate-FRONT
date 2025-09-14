"use client";

export default function CommunityTableHeader() {
  return (
    <div
      className="grid border-b-2 border-gray-200 mb-4 text-sm py-3 px-4 text-center bg-gray-50 font-semibold"
      style={{ gridTemplateColumns: "140px 1fr 60px 60px 200px" }}>
      <div className="text-left">작성자명</div>
      <div className="text-left">제목</div>
      <div className="text-center">댓글수</div>
      <div className="text-center">추천수</div>
      {/* <div className="text-center">조회수</div> */}
      <div className="text-center">작성일</div>
    </div>
  );
}
