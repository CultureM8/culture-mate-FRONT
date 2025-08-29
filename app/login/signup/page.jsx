"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/constants/path";

export default function SignUpPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp?.get("next") || ROUTES.LOGIN || "/login";

  const [form, setForm] = useState({
    login_id: "",
    email: "",
    password: "",
    confirm: "",
    agree: false,
  });
  const [errors, setErrors] = useState({});

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    const err = {};
    if (!form.login_id.trim()) err.login_id = "아이디를 입력하세요.";
    if (!form.password || form.password.length < 8)
      err.password = "비밀번호는 8자 이상이어야 합니다.";
    if (form.password !== form.confirm)
      err.confirm = "비밀번호가 일치하지 않습니다.";
    if (!form.agree) err.agree = "이용약관 및 개인정보에 동의해주세요.";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // TODO: 백엔드 연동 (회원가입 API)
    alert("회원가입 요청이 전송되었습니다. (UI 목업)");
    router.replace(
      `${ROUTES.LOGIN || "/login"}?next=${encodeURIComponent(next)}`
    );
  };

  return (
    <main className="mx-auto max-w-md px-6 py-10 mb-4 mt-4">
      <h1 className="text-2xl font-semibold mb-6">회원가입</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">아이디</label>
          <input
            name="login_id"
            value={form.login_id}
            onChange={onChange}
            placeholder="예: culturemate01"
            className="w-full border rounded px-3 py-2"
          />
          {errors.login_id && (
            <p className="text-red-600 text-sm mt-1">{errors.login_id}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">이메일 (선택)</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">비밀번호</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder="8자 이상"
            className="w-full border rounded px-3 py-2"
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">비밀번호 확인</label>
          <input
            name="confirm"
            type="password"
            value={form.confirm}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
          />
          {errors.confirm && (
            <p className="text-red-600 text-sm mt-1">{errors.confirm}</p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="agree"
            checked={form.agree}
            onChange={onChange}
            className="h-4 w-4"
          />
          이용약관 및 개인정보 처리방침에 동의합니다.
        </label>
        {errors.agree && <p className="text-red-600 text-sm">{errors.agree}</p>}

        <button
          type="submit"
          className="w-full bg-black text-white rounded py-2 disabled:opacity-60"
          disabled={!form.login_id || !form.password || !form.confirm}>
          가입하기
        </button>
      </form>

      <p className="text-sm text-gray-600 mt-6">
        이미 계정이 있으신가요?{" "}
        <Link
          className="underline"
          href={`${ROUTES.LOGIN || "/login"}?next=${encodeURIComponent(next)}`}>
          로그인
        </Link>
      </p>
    </main>
  );
}
