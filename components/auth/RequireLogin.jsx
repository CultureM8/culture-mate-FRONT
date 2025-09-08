"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LoginContext } from "@/components/auth/LoginProvider";

export default function RequireLogin({ children, loginPath = "/login" }) {
  const { ready, isLogined } = useContext(LoginContext);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (isLogined) {
      setOk(true);
      return;
    }
    const q = searchParams?.toString();
    const next = q ? `${pathname}?${q}` : pathname;
    router.replace(`${loginPath}?next=${encodeURIComponent(next)}`);
  }, [ready, isLogined, router, pathname, searchParams, loginPath]);

  if (!ready || !ok) return null;
  return children;
}
