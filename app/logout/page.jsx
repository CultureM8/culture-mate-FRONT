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
      try {
        // (레거시) fakeLogin 세션도 있으면 정리
        const mod = await import("@/lib/fakeLogin");
        if (mod?.fakeLogout) mod.fakeLogout();
      } catch {}
      router.replace("/");
    })();
  }, [logout, router]);
  return null;
}
