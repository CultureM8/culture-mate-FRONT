/** 로컬스토리지 사용 => 사용자 인증 세션관리 유틸 (프론트 전용 가짜로그인) */
/**인증정보 저장키 이름 정의 */
const LOGIN_KEY = 'login';

/** window.localStorage 사용 가능 여부 함수(브라우저 환경인지 확인/로컬스토리지api 지원 여부 확인) */
function canUseStorage() {
  return (
    typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  );
}

/** JSON 문자열을 안전하게 파싱하는 함수(null 예외처리) */
function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** 세션 읽기(만료 시 자동 제거) */
export function getSession() {
  /**로컬 스토리지 사용 못하면 null 반환 */
  if (!canUseStorage()) return null;
  /**로컬스토리지에서 login키값 가져오기 */
  const raw = window.localStorage.getItem(LOGIN_KEY);
  if (!raw) return null;

  /**json파싱 */
  const session = safeParse(raw);
  if (!session) {
    window.localStorage.removeItem(LOGIN_KEY);
    return null;
  }

  /**현재 시간 가져오기 */
  const now = Date.now();
  /**만료시 세션제거 */
  if (typeof session.expiresAt === 'number' && now >= session.expiresAt) {
    window.localStorage.removeItem(LOGIN_KEY);
    return null;
  }
  return session;
}

/**json문자열 변환 => 세션 저장 함수 */
export function setSession(session) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(LOGIN_KEY, JSON.stringify(session));
  } catch {}
}

/** 세션 제거 함수(인증정보 제거) */
export function clearSession() {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(LOGIN_KEY);
  } catch {}
}

/** 인증 여부 (만료 검사 포함) */
export function isLogined() {
  return !!getSession();
}

/** 남은 시간(ms). 세션 없으면 0 */
export function timeLeftMs() {
  const s = getSession(); /**세션 읽기함수 */
  if (!s || typeof s.expiresAt !== 'number') return 0;
  return Math.max(0, s.expiresAt - Date.now()); /**만료시간-현재시간=남은시간 */
}
