// /lib/displayName.js
// 닉네임 > 로그인아이디 > 멤버ID(숫자) 우선순위

/**
 * 사람이 읽을 수 있는 이름인지 체크 (숫자만으로 이루어진 경우 제외)
 */
const isReadableName = (name) => {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  if (!trimmed) return false;
  // 숫자만으로 이루어진 경우는 readable하지 않다고 판단
  return !/^\d+$/.test(trimmed);
};

/**
 * 닉네임과 로그인아이디 중 읽을 수 있는 값을 우선 선택
 * 닉네임이 있으면 무조건 닉네임, 없으면 로그인아이디
 */
const pickReadableName = (nickname, loginId) => {
  // 닉네임이 있으면 무조건 우선 (빈 문자열이 아닌 경우)
  if (nickname && typeof nickname === "string" && nickname.trim()) {
    return nickname.trim();
  }
  // 닉네임이 없으면 로그인아이디 체크
  if (isReadableName(loginId)) return loginId.trim();
  return "사용자";
};

/**
 * 닉네임 / 로그인아이디 / 멤버ID(숫자)로 표시명을 만든다.
 * - 닉네임/로그인아이디 중 사람이 읽을 수 있는 값을 우선
 * - 그래도 없으면 멤버ID(숫자)로 폴백
 */
export const displayNameFromTriplet = (nickname, loginId, memberId) => {
  const readable = pickReadableName(nickname, loginId);
  if (readable !== "사용자") return readable;
  if (memberId != null && String(memberId).trim() !== "")
    return String(memberId);
  return "사용자";
};
