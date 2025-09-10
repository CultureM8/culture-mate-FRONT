// app/api/chat/rooms/list/route.js
// 백엔드가 거대한/깨진 JSON을 내려줘도 최상위 채팅방 { ... } 들에서 id/roomName만 추출

function extractRoomsFromMalformedJson(raw) {
  // 배열 블록만 추출: [ ... ] 구간
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return [];

  const arrText = raw.slice(start + 1, end); // 대괄호 제거
  const items = [];

  // 최상위 객체 단위로 split: 중괄호 깊이 추적
  let depth = 0;
  let buf = "";
  for (let i = 0; i < arrText.length; i++) {
    const ch = arrText[i];
    buf += ch;
    if (ch === "{") depth++;
    else if (ch === "}") depth--;

    // 객체 하나 끝(깊이 0, 다음이 , 또는 문자열 끝)
    if (depth === 0 && (ch === "}" || i === arrText.length - 1)) {
      const item = buf.trim();
      if (item) items.push(item.replace(/^[,\s]+|[,\s]+$/g, ""));
      buf = "";
    }
  }

  // 각 아이템 문자열에서 id, roomName만 정규식으로 뽑기
  const rooms = [];
  for (const it of items) {
    // roomName 은 문자열
    const rn = it.match(/"roomName"\s*:\s*"([^"]*)"/);
    if (!rn) continue;

    // id는 숫자. 같은 아이템 안에 "id": 가 여러 번 있을 수 있으므로
    // 첫 등장(보통 room의 id)을 사용. (필요하면 roomName 앞쪽 가장 가까운 id로 바꿀 수 있음)
    const ids = [...it.matchAll(/"id"\s*:\s*(\d+)/g)].map((m) => Number(m[1]));
    const id = ids.length ? ids[0] : null;

    rooms.push({ id, roomName: rn[1] });
  }
  return rooms;
}

export async function GET() {
  try {
    const beRes = await fetch("http://localhost:8080/chat/rooms/list", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const raw = await beRes.text();

    // 1) 정상 JSON이면 그대로 파싱해서 정제
    try {
      const data = JSON.parse(raw);
      const rooms = Array.isArray(data)
        ? data.map((r) => ({
            id: r?.id ?? r?.roomId ?? null,
            roomName: r?.roomName ?? r?.name ?? "",
          }))
        : [];
      return Response.json(rooms, { status: 200 });
    } catch {
      // 2) 깨진 JSON이면 수동 추출
      const rooms = extractRoomsFromMalformedJson(raw);
      return Response.json(rooms, { status: 200 });
    }
  } catch (err) {
    return Response.json(
      { ok: false, reason: "PROXY_ERROR", message: String(err) },
      { status: 500 }
    );
  }
}
