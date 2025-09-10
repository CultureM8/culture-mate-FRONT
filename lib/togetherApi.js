// lib/togetherApi.js
import axios from "axios";

// together 전용 axios 인스턴스
const togetherApi = axios.create({
  baseURL: "/api", // 프록시 사용을 위해 수정
  timeout: 15000,
  withCredentials: true,
});

// Authorization 자동 첨부
togetherApi.interceptors.request.use((config) => {
  try {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      console.log("요청 전 토큰 체크:", {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + "..." : "NO TOKEN"
      });
      
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn("경고: 액세스 토큰이 없습니다!");
      }
    }
  } catch (error) {
    console.error("토큰 설정 실패:", error);
  }
  return config;
});

// 응답 에러 처리
togetherApi.interceptors.response.use(
  (response) => response,
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
          localStorage.removeItem("accessToken");
          localStorage.removeItem("auth_session_v2");
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

// 공통 에러 래퍼
const handleResponse = async (promise) => {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    // 더 자세한 에러 정보 로깅
    console.error("API 요청 실패 - 전체 에러 객체:", error);
    console.error("API 요청 실패 - 에러 타입:", typeof error);
    console.error("API 요청 실패 - 에러 이름:", error?.name);
    console.error("API 요청 실패 - 에러 메시지:", error?.message);
    console.error("API 요청 실패 - 에러 코드:", error?.code);
    console.error("API 요청 실패 - 설정:", error?.config);
    console.error("API 요청 실패 - 응답:", error?.response);
    console.error("API 요청 실패 - 요청:", error?.request);

    let message;
    
    if (!error) {
      message = "알 수 없는 에러가 발생했습니다.";
    } else if (error?.code === 'ECONNREFUSED' || error?.code === 'ERR_NETWORK') {
      message = "서버에 연결할 수 없습니다. 백엔드 서버가 실행되고 있는지 확인해주세요.";
    } else if (error?.response?.status === 0) {
      message = "네트워크 연결을 확인해주세요.";
    } else if (error?.message?.includes('Network Error')) {
      message = "네트워크 에러가 발생했습니다. 서버 연결을 확인해주세요.";
    } else {
      message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "요청 처리 중 오류가 발생했습니다.";
    }

    console.error("최종 에러 메시지:", message);

    const customError = new Error(message);
    customError.status = error?.response?.status;
    customError.response = error?.response;
    customError.code = error?.code;
    customError.originalError = error;

    throw customError;
  }
};

/* ===== TOGETHER REST API ===== */

// 전체 모임 조회
export const fetchTogetherList = (params = {}) => {
  const { eventType, sort, search, page = 0, size = 20 } = params;

  const queryParams = new URLSearchParams();

  if (eventType && eventType !== "전체") {
    queryParams.append("eventType", eventType);
  }

  if (sort) {
    queryParams.append("sort", sort);
  }

  if (search && search.trim()) {
    queryParams.append("search", search.trim());
  }

  queryParams.append("page", page);
  queryParams.append("size", size);

  const queryString = queryParams.toString();
  const url = queryString ? `/v1/together?${queryString}` : "/v1/together";

  return handleResponse(togetherApi.get(url));
};

// 특정 모임 조회
export const fetchTogetherDetail = (togetherId) => {
  return handleResponse(togetherApi.get(`/v1/together/${togetherId}`));
};

// 모임 생성
export const createTogether = (payload) => {
  return handleResponse(togetherApi.post("/v1/together", payload));
};

// 모임 수정
export const updateTogether = (togetherId, payload) => {
  return handleResponse(togetherApi.put(`/v1/together/${togetherId}`, payload));
};

// 모임 삭제
export const deleteTogether = (togetherId) => {
  return handleResponse(togetherApi.delete(`/v1/together/${togetherId}`));
};

// 모임 신청
export const applyTogether = (togetherId) => {
  return handleResponse(togetherApi.post(`/v1/together/${togetherId}/apply`));
};

// 참가자 조회
export const fetchTogetherParticipants = (togetherId) => {
  return handleResponse(
    togetherApi.get(`/v1/together/${togetherId}/participants`)
  );
};

// 참가자 승인
export const approveParticipant = (togetherId, participantId) => {
  return handleResponse(
    togetherApi.post(
      `/v1/together/${togetherId}/participants/${participantId}/approve`
    )
  );
};

// 참가자 거절
export const rejectParticipant = (togetherId, participantId) => {
  return handleResponse(
    togetherApi.post(
      `/v1/together/${togetherId}/participants/${participantId}/reject`
    )
  );
};

// 참가 취소
export const cancelParticipation = (togetherId) => {
  return handleResponse(
    togetherApi.delete(`/v1/together/${togetherId}/participants/cancel`)
  );
};

// 모집 상태 변경
export const updateRecruitingStatus = (togetherId, isRecruiting) => {
  const action = isRecruiting ? "start" : "stop";
  return handleResponse(
    togetherApi.patch(`/v1/together/${togetherId}/recruiting/${action}`)
  );
};

export default togetherApi;
