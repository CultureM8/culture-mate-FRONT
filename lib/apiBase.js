import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api",
  timeout: 15000,
  withCredentials: true,
});

const KEY = "auth_session_v2";

// Authorization 자동 첨부
api.interceptors.request.use((config) => {
  try {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("accessToken");
      if (t) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${t}`;
      }
    }
  } catch {}
  return config;
});

export const unwrap = (p) =>
  p
    .then((r) => r.data)
    .catch((e) => {
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        "요청 처리 중 오류가 발생했습니다.";
      const err = new Error(msg);
      err.response = e?.response;
      throw err;
    });

// 401/403 글로벌 핸들링
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      try {
        localStorage.removeItem(KEY);
        localStorage.removeItem("auth_session_v1");
        // 토큰도 함께 제거(세션과 동기화)
        localStorage.removeItem("accessToken");
      } catch {}
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const next = `${url.pathname}${url.search}${url.hash}`;
        window.location.replace(`/login?next=${encodeURIComponent(next)}`);
      }
    }
    return Promise.reject(error);
  }
);
