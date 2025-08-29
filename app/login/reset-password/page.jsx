"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/constants/path";

export default function ResetPasswordPage() {
  const [step, setStep] = useState("request"); // 'request' | 'reset'
  const [req, setReq] = useState({ login_id: "", email: "" });
  const [reset, setReset] = useState({ code: "", password: "", confirm: "" });

  const onChangeReq = (e) =>
    setReq((s) => ({ ...s, [e.target.name]: e.target.value }));
  const onChangeReset = (e) =>
    setReset((s) => ({ ...s, [e.target.name]: e.target.value }));

  const submitRequest = (e) => {
    e.preventDefault();
    if (!req.login_id.trim() || !req.email.trim()) return;
    /*백엔드 연동 (재설정 코드/링크 발송)*/
    setStep("reset");
  };

  const submitReset = (e) => {
    e.preventDefault();
    if (!reset.code.trim()) return;
    if (!reset.password || reset.password.length < 8) return;
    if (reset.password !== reset.confirm) return;
    /* 백엔드 연동 (코드 검증 + 비밀번호 변경)*/
    alert("비밀번호가 재설정되었습니다.");
  };

  return (
    <main className="mx-auto max-w-md px-6 py-10 mb-4 mt-4">
      <h1 className="text-2xl font-semibold mb-6">비밀번호 찾기</h1>

      {step === "request" ? (
        <form onSubmit={submitRequest} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">아이디</label>
            <input
              name="login_id"
              value={req.login_id}
              onChange={onChangeReq}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">이메일</label>
            <input
              name="email"
              type="email"
              value={req.email}
              onChange={onChangeReq}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white rounded py-2">
            재설정 링크 발송
          </button>
          <p className="text-xs text-gray-500">
            입력한 이메일로 인증 코드 또는 재설정 링크가 전송됩니다.
          </p>
        </form>
      ) : (
        <form onSubmit={submitReset} className="space-y-4">
          <div className="rounded border p-3 bg-gray-50 text-sm">
            이메일로 전송된 인증 코드를 입력하고 새 비밀번호를 설정하세요.
          </div>

          <div>
            <label className="block text-sm mb-1">인증 코드</label>
            <input
              name="code"
              value={reset.code}
              onChange={onChangeReset}
              className="w-full border rounded px-3 py-2"
              placeholder="6자리 코드"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">새 비밀번호</label>
            <input
              name="password"
              type="password"
              value={reset.password}
              onChange={onChangeReset}
              className="w-full border rounded px-3 py-2"
              placeholder="8자 이상"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">비밀번호 확인</label>
            <input
              name="confirm"
              type="password"
              value={reset.confirm}
              onChange={onChangeReset}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white rounded py-2">
            비밀번호 재설정
          </button>
        </form>
      )}

      <div className="text-sm text-gray-600 mt-6 flex items-center justify-between">
        <Link className="underline" href={ROUTES.FIND_ID || "/login/find-id"}>
          아이디 찾기
        </Link>
        <Link className="underline" href={ROUTES.LOGIN || "/login"}>
          로그인으로
        </Link>
      </div>
    </main>
  );
}
