"use client";
import RequireLogin from "@/components/auth/RequireLogin";

export default function AdminLayout({ children }) {
  return <RequireLogin>{children}</RequireLogin>;
}
