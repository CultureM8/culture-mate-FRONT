"use client";

import AdminSubTitle from "@/components/admin/AdminSubTitle";
import AdminUsersAll from "@/components/admin/AdminUsersAll";

export default function AdminUsersAllPage() {
  return (
    <div className="w-full px-6">
      {/* 관리자 소제목 */}
      <AdminSubTitle title="전체 사용자" />

      {/* 관리자 컨텐츠 - AdminUsersAll 컴포넌트 */}
      <AdminUsersAll />
    </div>
  );
}