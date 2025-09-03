/** 실제 서버 없이도 로그인 기능을 테스트할 수 있는 가짜 인증 시스템 - 프론트 전용 */
import { setSession, clearSession, getSession } from "./loginStorage";
import { ICONS } from "@/constants/path";

/**
 * login_id  : 로그인할 때 입력하는 계정명(필수)
 * nickname  : 화면에 표시될 별명(선택) — 없으면 화면엔 login_id를 표시
 * name      : 실명(선택) — 회원정보 페이지 전용, 기본 흐름에서는 사용 안 함
 */
export function fakeLogin({
  login_id = "",
  nickname = "",
  name = "",
  password = "",
  remember = false,
} = {}) {
  if (!login_id.trim()) {
    throw new Error("login_id를 입력해주세요.");
  }
  if (!password) {
    throw new Error("비밀번호를 입력해주세요.");
  }

  /** 로그인 유지시간 */
  const now = Date.now();
  const ttlMs = remember ? 1000 * 60 * 60 * 24 * 7 : 1000 * 60 * 60 * 24; // 7일 or 24시간

  /** user-현재시간으로 uid 생성 */
  const user_id = "user-" + now.toString(36);

  /* 화면 표시용 display_name: nickname || login_id*/
  const display_name = nickname?.trim() ? nickname.trim() : login_id.trim();

  /** 세션 객체 생성 */
  const session = {
    token: "fake-" + user_id,
    user: {
      id: user_id /* 내부 고유 ID*/,
      user_id /* (호환용)*/,
      login_id: login_id.trim() /* 로그인용 계정명*/,
      nickname: nickname?.trim() || "" /* 별명(선택)*/,
      name: name?.trim() || "" /* 실명(선택, 회원정보 전용)*/,
      display_name /* 화면표시 전용*/,
      avatarUrl: ICONS.DEFAULT_PROFILE,
    },
    issuedAt: now,
    expiresAt: now + ttlMs,
  };

  setSession(session);
  return session;
}

/** 가짜 로그아웃 */
export function fakeLogout() {
  clearSession();
}

/** 세션 정규화(이전 세션 호환) */
function normalizeSession(sess) {
  if (!sess || !sess.user) return sess;
  const u = sess.user;
  const display_name =
    (u.nickname && String(u.nickname).trim()) ||
    (u.display_name && String(u.display_name).trim()) ||
    (u.login_id && String(u.login_id).trim()) ||
    "";
  return {
    ...sess,
    user: {
      ...u,
      user_id: u.user_id || u.id,
      nickname: u.nickname ?? "",
      name: u.name ?? "",
      display_name,
    },
  };
}

/** 현재 세션 가져오기(편의 함수) */
export function currentSession() {
  const raw = getSession();
  return normalizeSession(raw);
}
