// /lib/chatRequestUtils.js
const KEY = "chatRequests";
const isBrowser = () => typeof window !== "undefined";

// 브로드캐스트(기존 커스텀 이벤트 호환 유지)
const broadcast = (type, detail) => {
  if (!isBrowser()) return;
  try {
    window.dispatchEvent(
      new CustomEvent("chat-request:sync", {
        detail: { type, payload: detail },
      })
    );
  } catch {}
};

/* ─────────── 기본 I/O ─────────── */
const load = () => {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const save = (rows) => {
  if (!isBrowser()) return;
  localStorage.setItem(KEY, JSON.stringify(rows));
};

/* 인메모리 캐시 */
let chatRequestsStorage = load();
const persist = () => save(chatRequestsStorage);

/* 유틸 */
const ensureId = (row) =>
  row?.requestId
    ? row
    : {
        ...row,
        requestId: `req_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 9)}`,
      };

const normalizeNew = (row) => {
  const r = ensureId({ ...row });
  if (!r.createdAt) r.createdAt = new Date().toISOString();
  if (!r.status) r.status = "pending"; // pending | accepted | rejected | canceled ...
  return r;
};

/* ─────────── CRUD ─────────── */

/** 채팅 신청 추가 */
export const addChatRequest = (requestData) => {
  const row = normalizeNew(requestData);
  const idx = chatRequestsStorage.findIndex(
    (r) => r.requestId === row.requestId
  );
  if (idx >= 0) chatRequestsStorage[idx] = row;
  else chatRequestsStorage.push(row);

  persist();

  // 실시간 동기화 알림
  broadcast("created", row);
  notifyChatRequestChange({ type: "created", request: row });

  return row;
};

/** (수신함) 특정 사용자가 받은 채팅 신청 목록 */
export const getChatRequestsForUser = (userId) => {
  if (!userId) return [];
  const me = String(userId);
  return chatRequestsStorage.filter((r) => String(r.toUserId) === me);
};

/** (발신함) 특정 사용자가 보낸 채팅 신청 목록 */
export const getChatRequestsFromUser = (userId) => {
  if (!userId) return [];
  const me = String(userId);
  return chatRequestsStorage.filter((r) => String(r.fromUserId) === me);
};

/** 채팅 신청 상태 업데이트 (수락/거절 등) */
export const updateChatRequestStatus = (requestId, status) => {
  const idx = chatRequestsStorage.findIndex((r) => r.requestId === requestId);
  if (idx === -1) return null;

  const updated = {
    ...chatRequestsStorage[idx],
    status,
    updatedAt: new Date().toISOString(),
  };
  chatRequestsStorage[idx] = updated;

  persist();

  // 실시간 동기화 알림
  broadcast("updated", updated);
  notifyChatRequestChange({ type: "updated", request: updated });

  return updated;
};

/** 채팅 신청 삭제 */
export const deleteChatRequest = (requestId) => {
  const idx = chatRequestsStorage.findIndex((r) => r.requestId === requestId);
  if (idx === -1) return null;

  const [deleted] = chatRequestsStorage.splice(idx, 1);

  persist();

  // 실시간 동기화 알림
  broadcast("deleted", deleted);
  notifyChatRequestChange({ type: "deleted", request: deleted });

  return deleted;
};

/** 읽지 않은(대기중) 채팅 신청 개수 */
export const getUnreadChatRequestsCount = (userId) => {
  if (!userId) return 0;
  const me = String(userId);
  return chatRequestsStorage.filter(
    (r) => String(r.toUserId) === me && r.status === "pending"
  ).length;
};

/** 단일 신청 조회 */
export const getChatRequestById = (requestId) => {
  return chatRequestsStorage.find((r) => r.requestId === requestId);
};

/** 전체 목록(디버그/관리용) */
export const getAllChatRequests = () => [...chatRequestsStorage];

/** 전체 초기화(개발용) */
export const __resetChatRequests = () => {
  chatRequestsStorage = [];
  persist();
};

/** (호환용) 더미 주입 제거 — 현재 사용자 수신 목록만 반환 */
export const seedChatRequestsForUser = (userId) =>
  getChatRequestsForUser(userId);

/* ─────────── 탭/컴포넌트 간 동기화 ─────────── */
const __chatReqBC =
  typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("chat-requests")
    : null;

/**
 * 다른 탭/컴포넌트에 "신청 데이터가 바뀌었다"는 신호를 보냅니다.
 * @param {{type?: 'created'|'updated'|'deleted'|'refresh', request?: any}} payload
 */
export function notifyChatRequestChange(payload = { type: "refresh" }) {
  try {
    __chatReqBC?.postMessage(payload);
  } catch {}
  try {
    if (isBrowser()) {
      window.dispatchEvent(
        new CustomEvent("chat-request:sync", { detail: payload })
      );
    }
  } catch {}
}
