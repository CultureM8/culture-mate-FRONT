// /lib/nameUtils.js
export const pickReadableName = (...vals) => {
  for (const v of vals) {
    if (v == null) continue;
    const s = String(v).trim();
    if (!s) continue;
    // 숫자-only는 표시명으로 쓰지 않기
    if (/^\d+$/.test(s)) continue;
    return s;
  }
  return "사용자";
};

// 상황별 편의 래퍼 (선택)
export const pickFromUserName = (req) =>
  pickReadableName(
    req?.fromNickname,
    req?.fromUserName,
    req?.fromLoginId,
    req?.fromUserId
  );

export const pickToUserName = (req) =>
  pickReadableName(
    req?.toNickname,
    req?.toUserName,
    req?.toLoginId,
    req?.toUserId
  );
