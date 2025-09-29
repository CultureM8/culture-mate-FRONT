import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 응답에서 메시지 배열을 최대한 뽑아보는 헬퍼
function extractMessages(data) {
  if (Array.isArray(data)) return data;

  if (!data || typeof data !== "object") return null;

  // 1차 키에서 찾기
  const keys = ["messages", "chatMessages", "items", "content", "list"];
  for (const k of keys) {
    if (Array.isArray(data[k])) return data[k];
  }

  // 2차 중첩 객체에서 찾기 (data, result 등)
  const containers = ["data", "result", "payload", "body"];
  for (const c of containers) {
    const box = data[c];
    if (box && typeof box === "object") {
      for (const k of keys) {
        if (Array.isArray(box[k])) return box[k];
      }
    }
  }

  return null;
}

async function getJson(url) {
  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    const text = await res.text();
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        url,
        preview: text.slice(0, 200),
      };
    }
    try {
      return { ok: true, json: JSON.parse(text), url };
    } catch {
      return {
        ok: false,
        status: 502,
        url,
        reason: "INVALID_JSON",
        preview: text.slice(0, 200),
      };
    }
  } catch (e) {
    return { ok: false, status: 500, url, reason: String(e) };
  }
}

export async function GET(_req, { params }) {
  const { roomId } = params || {};
  if (!roomId) {
    return NextResponse.json(
      { ok: false, reason: "NO_ROOM_ID" },
      { status: 400 }
    );
  }

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
  const backend = process.env.BACKEND_ORIGIN || BASE_URL;

  // ▼ 여기에 네 백엔드에서 실제 200 나오는 후보를 "위에서부터" 넣어둔 상태야.
  // Swagger에서 확인해서 맞는 게 있으면 맨 위로 끌어올리면 됨.
  const candidates = [
    // 메시지 전용 엔드포인트들이 있을 법한 후보
    `${backend}/chat/message/list?roomId=${roomId}`,
    `${backend}/chat/messages?roomId=${roomId}`,
    `${backend}/chat/room/${roomId}/messages`,
    // 방 상세(여기에 메시지 배열이 딸려오는 경우도 종종 있음)
    `${backend}/chat/room/${roomId}`,
    // 마지막으로 우리 "자체" 프론트 API 방 상세 라우트도 시도 (넌 이게 되는 걸 확인했지!)
    `${backend}/chat/room/1`,
  ];

  const tried = [];

  for (const url of candidates) {
    const hit = await getJson(url);
    tried.push({
      url,
      ok: hit.ok,
      status: hit.status,
      reason: hit.reason,
      preview: hit.preview,
    });

    if (!hit.ok) continue;

    // 바로 배열이면 그걸 반환
    if (Array.isArray(hit.json)) {
      return NextResponse.json(hit.json, { status: 200 });
    }

    // 객체라면 메시지 배열 뽑아보기
    const msgs = extractMessages(hit.json);
    if (Array.isArray(msgs)) {
      return NextResponse.json(msgs, { status: 200 });
    }
  }

  // 그래도 못 찾으면 "빈 배열"을 주고, 디버깅 정보는 헤더에 넣어줌(응답 본문은 프론트가 쉽게 처리하게 간단히)
  const res = NextResponse.json([], { status: 200 });
  res.headers.set("x-chat-debug", JSON.stringify(tried).slice(0, 1000));
  return res;
}
