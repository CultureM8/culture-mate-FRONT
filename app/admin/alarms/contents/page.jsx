"use client";

import AdminSubTitle from "@/components/admin/AdminSubTitle";
import AdminAlarmsContents from "@/components/admin/AdminAlarmsContents";

export default function AdminAlarmsContentsPage() {
  return (
    <div className="w-full px-6">
      {/* 관리자 소제목 */}
      <AdminSubTitle title="게시글 신고 목록" />

      {/* 관리자 컨텐츠 - AdminAlarmsContents 컴포넌트 */}
      <AdminAlarmsContents />
    </div>
  );
}