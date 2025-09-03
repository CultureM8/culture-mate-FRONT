"use client";
/** 사이트 전체에서 사용할 수 있는 인증 상태 관리 시스템 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { timeLeftMs } from "@/lib/loginStorage";
import { fakeLogin, fakeLogout, currentSession } from "@/lib/fakeLogin";

/** 전역 인증 상태를 공유할 Context 생성 */
export const LoginContext = createContext(null);

/** 사이트 전체를 감싸는 Provider 컴포넌트 */
export default function LoginProvider({ children }) {
  const [ready, setReady] = useState(false); // 로그인 상태 파악(flicker 방지)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 로그인/로그아웃 로딩 표시
  const timerRef = useRef(null);

  /** 마운트시 세션 복원 (정규화된 currentSession 사용) */
  useEffect(() => {
    const s = currentSession(); /* display_name 보장*/
    setUser(s?.user ?? null);
    setLoading(false);
    setReady(true);
  }, []);

  /** 만료 자동 감지(1초마다) */
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (timeLeftMs() <= 0) {
        if (user) setUser(null);
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user]); /* user 변경 시 타이머 재설정*/

  /** 탭 간 동기화(로그인/로그아웃 반영) */
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== "login") return; /* loginStorage가 쓰는 키*/
      const s = currentSession();
      setUser(s?.user ?? null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /** 로그인 */
  const doLogin = async ({
    login_id = "",
    password = "",
    remember = false,
  } = {}) => {
    setLoading(true);
    try {
      const s = fakeLogin({
        login_id,
        password,
        remember,
      }); /* fakeLogin이 display_name 세팅*/
      setUser(s.user);
      return s;
    } finally {
      setLoading(false);
    }
  };

  /** 로그아웃 */
  const logout = async () => {
    setLoading(true);
    try {
      fakeLogout();
      setUser(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  /** 세션 재동기화(수동 새로고침) */
  const refresh = () => {
    const s = currentSession();
    setUser(s?.user ?? null);
    return s;
  };

  /* 파생값(프로젝트 전역에서 이 값들만 쓰면 규칙 일관성 유지) */
  const uid =
    user?.id ??
    user?.user_id ??
    null; /* 내부 고유 ID(권한/소유권 비교에 사용)*/
  const loginId = user?.login_id ?? null; /* 로그인 계정명*/
  const displayName =
    user?.display_name ??
    user?.nickname ??
    user?.name ??
    loginId ??
    uid ??
    "사용자"; /* 화면표시용 이름(별명 > 실명 > login_id > uid)*/

  const value = useMemo(
    () => ({
      /*상태*/
      ready,
      loading,
      user,
      isLogined: !!user,

      /* 파생 프로필*/
      uid,
      loginId,
      displayName,

      /* 액션*/
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
