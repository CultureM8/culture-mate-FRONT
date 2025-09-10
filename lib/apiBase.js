import axios from "axios";

// SSR 환경에서도 동작하도록 baseURL 설정
const getBaseURL = () => {
  // 브라우저 환경에서는 상대 경로 사용 (프록시 적용)
  if (typeof window !== "undefined") {
    return "/api";
  }
  
  // 서버 환경에서는 절대 URL 사용
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
};

export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  withCredentials: true,
});

const KEY = "auth_session_v2";

//  요청 인터셉터: accessToken 있으면 Bearer 붙이기
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

//응답 인터셉터: 401/403 글로벌 핸들링
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      console.warn("인증 에러 발생:", {
        status,
        url: error?.config?.url,
        method: error?.config?.method
      });
      
      // 401만 토큰 제거, 403은 유지 (권한 문제일 수 있음)
      if (status === 401) {
        try {
          localStorage.removeItem(KEY);
          localStorage.removeItem("auth_session_v1");
          localStorage.removeItem("accessToken");
        } catch {}
      }
      
      // 자동 리다이렉트 비활성화 - 에러를 던지고 상위에서 처리하도록 함
      // if (typeof window !== "undefined") {
      //   const url = new URL(window.location.href);
      //   const next = `${url.pathname}${url.search}${url.hash}`;
      //   window.location.replace(`/login?next=${encodeURIComponent(next)}`);
      // }
    }
    return Promise.reject(error);
  }
);

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
