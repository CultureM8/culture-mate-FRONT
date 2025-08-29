"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/constants/path";

export default function FindIdPage() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [sent, setSent] = useState(false);

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    // TODO: 백엔드 연동 (아이디 찾기)
    setSent(true);
  };

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">아이디 찾기</h1>

      {sent ? (
        <div className="rounded border p-4 bg-gray-50">
          <p className="text-sm">id는 @@@입니다.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">이름</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">이메일</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white rounded py-2">
            아이디 조회
          </button>
        </form>
      )}

      <div className="text-sm text-gray-600 mt-6 flex items-center justify-between">
        <Link
          className="underline"
          href={ROUTES.RESET_PW || "/login/reset-password"}>
          비밀번호 찾기
        </Link>
        <Link className="underline" href={ROUTES.LOGIN || "/login"}>
          로그인으로
        </Link>
      </div>
    </main>
  );
}
