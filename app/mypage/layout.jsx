"use client";
import RequireLogin from "@/components/auth/RequireLogin";

export default function MyPageLayout({ children }) {
  return <RequireLogin>{children}</RequireLogin>;
}
