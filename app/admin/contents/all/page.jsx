"use client";

import AdminSubTitle from "@/components/admin/AdminSubTitle";
import AdminContentsAll from "@/components/admin/AdminContentsAll";

export default function AdminContentsAllPage() {
  return (
    <div className="w-full px-6">
      {/* 관리자 소제목 */}
      <AdminSubTitle title="전체 게시글" />

      {/* 관리자 컨텐츠 - AdminContentsAll 컴포넌트 */}
      <AdminContentsAll />
    </div>
  );
}