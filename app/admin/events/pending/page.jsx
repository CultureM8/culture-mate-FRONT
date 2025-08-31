"use client";

import AdminSubTitle from "@/components/admin/AdminSubTitle";
import AdminEventsPending from "@/components/admin/AdminEventsPending";

export default function AdminEventsPendingPage() {
  return (
    <div className="w-full px-6">
      {/* 관리자 소제목 */}
      <AdminSubTitle title="승인 대기 이벤트" />

      {/* 관리자 컨텐츠 - AdminEventsPending 컴포넌트 */}
      <AdminEventsPending />
    </div>
  );
}