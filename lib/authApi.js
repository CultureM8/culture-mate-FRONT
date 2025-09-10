// /lib/authApi
import { api, unwrap } from "@/lib/apiBase";

export async function login({ loginId, password }) {
  // 백엔드 응답: { message, user, token }
  const data = await unwrap(api.post("/v1/auth/login", { loginId, password }));

  // ✅ 토큰 저장
  if (data?.token) {
    localStorage.setItem("accessToken", data.token);
  }

  // 최소 프로필
  const base = {
    id: data?.user?.id ?? null,
    login_id: data?.user?.loginId ?? null,
    role: data?.user?.role ?? null,
  };

  // 표기용 이름
  const display_name = base.login_id ?? base.id ?? "사용자";
  return { ...base, nickname: null, display_name };
}

export async function logout() {
  // 서버 세션 없음 → 프론트 상태만 초기화
  try {
    localStorage.removeItem("accessToken"); // ✅ 토큰 제거
  } catch {}
  return true;
}
