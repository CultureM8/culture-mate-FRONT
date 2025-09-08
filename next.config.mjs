/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // ✅ 채팅 전용 오버라이드: 프론트는 /api/chat/* 로 호출하지만,
      //    백엔드는 /chat/* (API prefix 없음) 으로 전달한다.
      //    가장 위(특정 경로 우선)로 배치해야 함!
      {
        source: "/api/chat/rooms/list",
        destination: "http://localhost:8080/chat/rooms/list",
      },
      {
        source: "/api/chat/room/list",
        destination: "http://localhost:8080/chat/room/list",
      },

      {
        source: "/api/chat/room",
        destination: "http://localhost:8080/chat/room",
      },
      {
        source: "/api/chat/rooms",
        destination: "http://localhost:8080/chat/rooms",
      },
      {
        source: "/api/chat/room/create",
        destination: "http://localhost:8080/chat/room/create",
      },
      {
        source: "/api/chat/rooms/create",
        destination: "http://localhost:8080/chat/rooms/create",
      },

      {
        source: "/api/chat/room/:roomId",
        destination: "http://localhost:8080/chat/room/:roomId",
      },
      {
        source: "/api/chat/room/:roomId/messages",
        destination: "http://localhost:8080/chat/room/:roomId/messages",
      },

      // ✅ 그 외 일반 API는 그대로 /api/* -> /api/* 로 프록시
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },

      // SockJS/STOMP (이미 OK)
      {
        source: "/ws-chat/:path*",
        destination: "http://localhost:8080/ws-chat/:path*",
      },
    ];
  },
};

export default nextConfig;
