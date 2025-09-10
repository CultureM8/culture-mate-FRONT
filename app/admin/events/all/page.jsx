"use client";

import AdminSubTitle from "@/components/admin/AdminSubTitle";
import AdminEventsAll from "@/components/admin/AdminEventsAll";

export default function AdminEventsAllPage() {
  return (
    <div className="w-full px-6">
      {/* 관리자 소제목 */}
      <AdminSubTitle title="전체 이벤트" />

      {/* 관리자 컨텐츠 - AdminEventsAll 컴포넌트 */}
      <AdminEventsAll />
    </div>
  );
}