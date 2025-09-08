// app/chat/room/[roomId]/page.jsx
import { headers } from "next/headers";
import GroupChat from "@/components/mypage/TogetherManagement/GroupChat";

export default async function ChatRoomPage({ params }) {
  const { roomId } = params;

  // 같은 호스트로 API 호출을 만들기 위한 base URL 계산
  const host = headers().get("host");
  const isDev = process.env.NODE_ENV !== "production";
  const base =
    process.env.NEXT_PUBLIC_BASE_URL || `${isDev ? "http" : "https"}://${host}`;

  let initialMessages = [];
  try {
    const res = await fetch(`${base}/api/chat/room/${roomId}`, {
      cache: "no-store",
    });
    if (res.ok) {
      initialMessages = await res.json();
    } else {
      // 디버그용 헤더가 실려오면 서버 로그에 남기기(원하면 console.log로 확인)
      // const dbg = res.headers.get("x-chat-debug");
    }
  } catch {
    // API 실패 시 빈 배열로 렌더 (실시간 소켓은 그대로 붙음)
  }

  return (
    <div className="h-[calc(100vh-0px)]">
      <GroupChat
        groupData={{
          roomId,
          groupName: `동행방 #${roomId}`,
          participants: [], // 필요 시 별도 API로 주입
        }}
        currentUserId={"me"} // 로그인 사용자 ID로 교체
        initialMessages={initialMessages}
        onClose={() => history.back()}
      />
    </div>
  );
}
