"use client";

/** 로그인 페이지 (아이디 + 비밀번호, 프론트 전용)
 * - 아이디와 비밀번호를 모두 입력해야 제출 가능
 * - remember 체크 시 7일, 아니면 24시간 유지 (fakeLogin 이용)
 * - ?next=/원래경로 가 있으면 로그인 후 그 경로로 복귀
 * - 아무 next가 없으면 referrer → 없으면 홈으로
 */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useLogin from "@/hooks/useLogin";
import { ROUTES, IMAGES } from "@/constants/path";
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  const { ready, isLogined, loading, doLogin } = useLogin();

  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const nextUrl = nextParam && nextParam.startsWith("/") ? nextParam : "/";
  /**id찾기라우팅 */
  const goFindId = () => {
    router.push(
      `${ROUTES.FIND_ID || "/login/find-id"}?next=${encodeURIComponent(
        nextUrl
      )}`
    );
  };

  /**pw찾기라우팅 */
  const goResetPw = () => {
    router.push(
      `${ROUTES.RESET_PW || "/login/reset-password"}?next=${encodeURIComponent(
        nextUrl
      )}`
    );
  };

  /**회원가입라우팅 */
  const goSignup = () => {
    router.push(
      `${ROUTES.SIGNUP || "/login/signup"}?next=${encodeURIComponent(nextUrl)}`
    );
  };

  /*로그인 후 돌아갈 곳*/
  const getAfterLoginTarget = () => {
    const next = searchParams.get("next");
    if (
      next &&
      typeof next === "string" &&
      next.startsWith("/") &&
      next !== "/login"
    ) {
      return next;
    }
    if (typeof window !== "undefined" && document.referrer) {
      try {
        const ref = new URL(document.referrer);
        if (
          ref.origin === window.location.origin &&
          ref.pathname !== "/login"
        ) {
          return ref.pathname + (ref.search || "") + (ref.hash || "");
        }
      } catch {}
    }
    return ROUTES.HOME || "/";
  };

  /**이미 로그인 상태면 복귀*/
  useEffect(() => {
    if (!ready) return;
    if (isLogined) {
      router.replace(getAfterLoginTarget());
    }
  }, [ready, isLogined]);

  /**로그인 폼 제출*/
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("아이디를 입력해주세요.");
      return;
    }
    if (!password.trim()) {
      setError("비밀번호를 입력해주세요.");
      return;
    }
    /**로그인 실행 */
    try {
      /**fakelogin에 전달 */
      await doLogin({
        login_id: username.trim(),
        password: password,
        remember,
      });
      router.replace(getAfterLoginTarget());
    } catch (err) {
      setError(err?.message || "로그인에 실패했습니다.");
    }
  };

  /**ui렌더링*/
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center px-4 mb-4 mt-4">
      <div className="w-full max-w-[560px] border border-gray-200 rounded-2xl p-8 bg-white shadow-sm">
        {/* 로고 */}
        <div className="flex justify-center mb-6">
          <a href={ROUTES.HOME} aria-label="홈으로 이동">
            <Image src={IMAGES.LOGO} alt="logo" width={140} height={46} />
          </a>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">로그인</h1>
        <p className="text-center text-gray-500 mb-6">
          아이디와 비밀번호를 입력하세요.
        </p>

        {/* 폼 */}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* 아이디 */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="username">
              아이디
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="아이디를 입력하세요"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="password">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호를 입력하세요"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* 로그인 상태 유지 */}
          <label className="flex items-center gap-2 select-none">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span className="text-sm text-gray-600">로그인 상태 유지</span>
          </label>

          {/* 에러 */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={!ready || loading}
            className="w-full h-11 rounded-lg bg-black text-white disabled:opacity-60">
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {/* 추가 링크(모의) */}
        <div className="mt-6 text-sm text-gray-600 flex items-center justify-center gap-4">
          <button onClick={goFindId} className="text-sm underline">
            아이디 찾기
          </button>
          <span className="text-gray-300">|</span>
          <button onClick={goResetPw} className="text-sm underline">
            비밀번호 찾기
          </button>
          <span className="text-gray-300">|</span>
          <button onClick={goSignup} className="text-sm underline">
            회원가입
          </button>
        </div>

        {/* <div className="mt-3 text-xs text-gray-400 text-center">
          로그인 후{' '}
          <code className="px-1 py-0.5 bg-gray-100 rounded">
            ?next=원래경로
          </code>
          로 돌아갑니다.
        </div> */}
      </div>
    </div>
  );
}
