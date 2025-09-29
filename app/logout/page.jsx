"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useLogin from "@/hooks/useLogin";

export default function LogoutPage() {
  const { logout } = useLogin();
  const router = useRouter();
  useEffect(() => {
    (async () => {
      await logout(); // LoginProvider 세션 정리
      // (레거시) fakeLogin 세션 정리 코드 제거됨 - 더 이상 필요하지 않음
      router.replace("/");
    })();
  }, [logout, router]);
  return null;
}
