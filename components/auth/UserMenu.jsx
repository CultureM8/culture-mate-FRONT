"use client";
import { useContext } from "react";
import { LoginContext } from "@/components/auth/LoginProvider";

export default function UserMenu() {
  const { isLogined, displayName, logout } = useContext(LoginContext);

  if (!isLogined) {
    return (
      <a href="/login-test" className="text-sm text-blue-600 hover:underline">
        로그인
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700">
        안녕하세요, <b>{displayName}</b>님
      </span>
      <button
        onClick={logout}
        className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300"
        aria-label="로그아웃">
        로그아웃
      </button>
    </div>
  );
}
