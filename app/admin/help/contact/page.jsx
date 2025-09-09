"use client";

import AdminSubTitle from "@/components/admin/AdminSubTitle";
import AdminHelpContact from "@/components/admin/AdminHelpContact";

export default function AdminHelpContactPage() {
  return (
    <div className="w-full px-6">
      {/* 관리자 소제목 */}
      <AdminSubTitle title="1:1 문의사항" />

      {/* 관리자 컨텐츠 - AdminHelpContact 컴포넌트 */}
      <AdminHelpContact />
    </div>
  );
}