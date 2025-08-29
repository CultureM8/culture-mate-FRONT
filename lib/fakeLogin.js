/** 실제 서버 없이도 로그인 기능을 테스트할 수 있는 가짜 인증 시스템 - 프론트 전용 */
import { setSession, clearSession, getSession } from './loginStorage';
import { ICONS } from '@/constants/path';

export function fakeLogin({
  login_id = '',
  nickname = '',
  password = '',
  remember = false,
} = {}) {
  const actualId = login_id || nickname;
  
  if (!actualId) {
    throw new Error('id를 입력해주세요.');
  }

  if (!password) {
    throw new Error('비밀번호를 입력해주세요.');
  }

  /**로그인 유지시간 */
  const now = Date.now();
  const ttlMs = remember
    ? 1000 * 60 * 60 * 24 * 7
    : 1000 * 60 * 60 * 24; /**7일 or 24시간*/
  /**user-현재시간으로 id 생성 */
  const user_id = 'user-' + now.toString(36);

  /**세션 객체 생성 */
  const session = {
    token: 'fake-' + user_id,
    user: {
      id: user_id,
      login_id: actualId,
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

/** 현재 세션 가져오기(편의 함수) */
export function currentSession() {
  return getSession();
}
