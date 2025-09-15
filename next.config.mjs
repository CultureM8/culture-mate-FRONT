/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // ✅ 이미지 프록시
      {
        source: "/images/:path*",
        destination: "http://localhost:8080/images/:path*",
      },
      // ✅ 일반 API (chatroom 포함)
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
