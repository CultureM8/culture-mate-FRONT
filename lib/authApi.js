// /lib/authApi
import { api, unwrap } from "@/lib/apiBase";

export async function login({ loginId, password }) {
  // 1) 로그인 - 백엔드 응답 형식에 맞춰 수정
  const data = await unwrap(api.post("/v1/auth/login", { loginId, password }));

  // ★ 추가: 백엔드 응답에서 토큰 추출 후 저장 (필드명은 accessToken/token/jwt 중 있는 것 사용)
  try {
    const token =
      data?.accessToken || data?.token || data?.jwt || data?.id_token || null;
    if (token && typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
    }
  } catch {}

  const base = {
    id: data?.id ?? null,
    login_id: data?.loginId ?? null, // 백엔드가 loginId로 응답
    role: data?.role ?? null,
  };

  // 2) 닉네임 보강 (실패해도 폴백)
  let nickname = null;
  try {
    if (base.id != null) {
      const detail = await unwrap(api.get(`/v1/member-detail/${base.id}`));
      nickname = detail?.nickname ?? null;
    }
  } catch {
    // 무시 (표시명 폴백 규칙으로 처리)
  }

  const display_name = nickname ?? base.login_id ?? base.id ?? "사용자";
  return { ...base, nickname, display_name };
}

export async function logout() {
  // 서버 세션 없음 → 프론트 상태만 초기화
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken"); // ★ 추가: 로그아웃 시 토큰 제거
    }
  } catch {}
  return true;
}
