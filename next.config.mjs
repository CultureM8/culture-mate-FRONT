/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // ✅ 채팅 전용 오버라이드
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
      // ✅ 일반 API
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
      // ✅ SockJS/STOMP
      {
        source: "/ws-chat/:path*",
        destination: "http://localhost:8080/ws-chat/:path*",
      },
    ];
  },

  // ✅ 이미지 도메인 허용 추가
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/**", // /images/** 같은 경로를 다 허용
      },
    ],
  },
};

export default nextConfig;
