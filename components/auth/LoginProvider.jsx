"use client";
import { createContext, useEffect, useMemo, useRef, useState } from "react";
import { login as apiLogin, logout as apiLogout } from "@/lib/authApi";

export const LoginContext = createContext(null);

// v2 세션 키 (v1 호환 로드 지원)
const KEY = "auth_session_v2";
const V1_KEY = "auth_session_v1";

const load = () => {
  if (typeof window === "undefined") return null;
  try {
    const v2 = localStorage.getItem(KEY);
    if (v2) return JSON.parse(v2);

    // v1 → v2 마이그레이션 (최초 1회)
    const v1 = localStorage.getItem(V1_KEY);
    if (v1) {
      const s = JSON.parse(v1);
      const migrated = { user: s?.user ?? null, expiresAt: null };
      localStorage.setItem(KEY, JSON.stringify(migrated));
      localStorage.removeItem(V1_KEY);
      return migrated;
    }
  } catch {}
  return null;
};

const save = (s) => {
  if (typeof window !== "undefined")
    localStorage.setItem(KEY, JSON.stringify(s));
};

const clear = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(KEY);
    localStorage.removeItem(V1_KEY);
    //  저장된 액세스 토큰도 제거
    try {
      localStorage.removeItem("accessToken");
    } catch {}
  }
};

export default function LoginProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bcRef = useRef(null);

  // 초기 복원 + 만료 체크 + 개발용 계정 전환
  useEffect(() => {
    // 개발용 계정 전환 (쿼리스트링 체크)
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const devUser = urlParams.get("user");

      if (devUser === "user1") {
        console.log("🔄 개발용 계정 전환: User1");
        const u1 = {
          id: 952,
          login_id: "user1",
          nickname: "user1",
          display_name: "user1",
          role: "MEMBER",
        };
        setUser(u1);
        save({ user: u1, expiresAt: null });
        setLoading(false);
        setReady(true);
        return;
      }

      if (devUser === "user2") {
        console.log("🔄 개발용 계정 전환: User2");
        const u2 = {
          id: 953,
          login_id: "user2",
          nickname: "user2",
          display_name: "user2",
          role: "MEMBER",
        };
        setUser(u2);
        save({ user: u2, expiresAt: null });
        setLoading(false);
        setReady(true);
        return;
      }
    }

    // 기존 로직: 세션 복원 + 만료 체크
    const s = load();
    const now = Date.now();
    const exp = s?.expiresAt ?? null;
    if (exp && now > exp) {
      clear();
      setUser(null);
    } else {
      setUser(s?.user ?? null);
    }
    setLoading(false);
    setReady(true);

    // BroadcastChannel(멀티탭 동기화) + storage 이벤트
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bcRef.current = new BroadcastChannel("auth");
      bcRef.current.onmessage = (ev) => {
        if (ev?.data === "logout") {
          setUser(null);
        } else if (ev?.data?.type === "login" && ev?.data?.user) {
          setUser(ev.data.user);
        }
      };
    }
    const onStorage = (e) => {
      if (e.key !== KEY) return;
      const s2 = load();
      setUser(s2?.user ?? null);
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      if (bcRef.current) bcRef.current.close();
    };
  }, []);

  const doLogin = async ({ login_id, password, remember = false }) => {
    setLoading(true);
    try {
      const profile = await apiLogin({ loginId: login_id, password });
      const u = {
        id: profile.id,
        login_id: profile.login_id,
        nickname: profile.nickname ?? null,
        display_name: profile.display_name,
        role: profile.role ?? null,
      };
      const now = Date.now();
      const ttlMs = remember ? 1000 * 60 * 60 * 24 * 7 : 1000 * 60 * 60 * 24; // 7일/1일

      setUser(u);
      save({ user: u, expiresAt: now + ttlMs });

      // 기존 코드 호환(관리자 메뉴 등)
      try {
        localStorage.setItem("userRole", (u.role ?? "").toString());
      } catch {}

      // 멀티탭 동기화
      if (bcRef.current) bcRef.current.postMessage({ type: "login", user: u });

      return u;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiLogout();
      setUser(null);
      clear();
      if (bcRef.current) bcRef.current.postMessage("logout");
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    const s = load();
    setUser(s?.user ?? null);
    return s;
  };

  const uid = user?.id ?? null;
  const loginId = user?.login_id ?? null;
  const displayName =
    user?.display_name ?? user?.nickname ?? loginId ?? uid ?? "사용자";

  const value = useMemo(
    () => ({
      ready,
      loading,
      user,
      isLogined: !!user,
      uid,
      loginId,
      displayName,
      doLogin,
      logout,
      refresh,
    }),
    [ready, loading, user, uid, loginId, displayName]
  );

  return (
    <LoginContext.Provider value={value}>{children}</LoginContext.Provider>
  );
}
