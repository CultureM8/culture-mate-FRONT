// /lib/displayName.js
// 닉네임 > 로그인아이디 > 멤버ID(숫자) 우선순위
import { pickReadableName } from "@/lib/nameUtils";

/**
 * 닉네임 / 로그인아이디 / 멤버ID(숫자)로 표시명을 만든다.
 * - 닉네임/로그인아이디 중 사람이 읽을 수 있는 값을 우선
 * - 그래도 없으면 멤버ID(숫자)로 폴백
 */
export const displayNameFromTriplet = (nickname, loginId, memberId) => {
  const readable = pickReadableName(nickname, loginId); // 숫자-only는 걸러줌
  if (readable !== "사용자") return readable;
  if (memberId != null && String(memberId).trim() !== "")
    return String(memberId);
  return "사용자";
};
