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
  timeout: 30000, // 30초
  withCredentials: true,
});

const KEY_V2 = "auth_session_v2";
const KEY_V1 = "auth_session_v1";

// ▶ 토큰 읽기: accessToken 단일 키 + 세션 JSON(v2/v1) 모두 대응
function getAccessTokenFromStorage() {
  try {
    // 1) 우선 accessToken 단독 키
    const direct = localStorage.getItem("accessToken");
    if (direct && typeof direct === "string") return direct;

    // 2) v2 세션 JSON
    const v2raw = localStorage.getItem(KEY_V2);
    if (v2raw) {
      try {
        const v2 = JSON.parse(v2raw);
        // 가능한 키를 모두 시도 (프로젝트에 맞게 한 가지면 충분)
        if (typeof v2?.accessToken === "string") return v2.accessToken;
        if (typeof v2?.token === "string") return v2.token;
        if (typeof v2?.access_token === "string") return v2.access_token;
        if (typeof v2?.auth?.accessToken === "string")
          return v2.auth.accessToken;
      } catch {}
    }

    // 3) v1 세션 JSON (구버전 호환)
    const v1raw = localStorage.getItem(KEY_V1);
    if (v1raw) {
      try {
        const v1 = JSON.parse(v1raw);
        if (typeof v1?.accessToken === "string") return v1.accessToken;
        if (typeof v1?.token === "string") return v1.token;
        if (typeof v1?.access_token === "string") return v1.access_token;
        if (typeof v1?.auth?.accessToken === "string")
          return v1.auth.accessToken;
      } catch {}
    }
  } catch {}
  return null;
}

// ─────────────────────────────────────────────
// 요청 인터셉터: accessToken 있으면 Bearer 붙이기
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = getAccessTokenFromStorage();
    console.log('🔐 Auth token check:', token ? 'Found token' : 'No token found');
    if (token) {
      config.headers = config.headers || {};
      // 서버가 소문자/대문자 둘다 허용하지만 관례적으로 대문자 사용
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Added auth header to request:', config.url);
    }
  }
  return config;
});

// 응답 인터셉터: 401/403 글로벌 핸들링
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      console.warn("인증 에러 발생:", {
        status,
        url: error?.config?.url,
        method: error?.config?.method,
      });

      // 401만 토큰 제거, 403은 유지 (권한 문제일 수 있음)
      if (status === 401) {
        try {
          localStorage.removeItem(KEY_V2);
          localStorage.removeItem(KEY_V1);
          localStorage.removeItem("accessToken");
        } catch {}
      }

      // 자동 리다이렉트는 사용 안 함 (상위에서 처리)
    }
    return Promise.reject(error);
  }
);

// unwrap 유틸
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
