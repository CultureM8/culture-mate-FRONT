"use client";
import { useContext, useState } from "react";
import { LoginContext } from "@/components/auth/LoginProvider";

export default function LoginForm() {
  const { doLogin, isLogined, displayName } = useContext(LoginContext);
  const [login_id, setId] = useState("");
  const [password, setPw] = useState("");
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("로그인 중…");
    try {
      const u = await doLogin({ login_id, password });
      setMsg(`환영합니다, ${u.display_name}님`);
    } catch (e) {
      setMsg(e?.response?.data?.message ?? "로그인 실패");
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={onSubmit} className="space-y-2">
        <input
          className="border rounded px-3 py-2 w-64"
          placeholder="로그인 아이디"
          value={login_id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2 w-64"
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPw(e.target.value)}
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          로그인
        </button>
      </form>
      {isLogined ? (
        <div className="text-sm text-green-700">로그인됨: {displayName}</div>
      ) : (
        <div className="text-sm text-gray-600">{msg}</div>
      )}
    </div>
  );
}
