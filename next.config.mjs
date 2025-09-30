/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // 환경 변수에서 백엔드 URL 가져오기 (기본값: localhost:8080)
    const backendUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

    return [
      // ✅ 이미지 프록시
      {
        source: "/images/:path*",
        destination: `${backendUrl}/images/:path*`,
      },
      // ✅ 일반 API (chatroom 포함)
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      // ✅ SockJS/STOMP
      {
        source: "/websocket/:path*",
        destination: `${backendUrl}/websocket/:path*`,
      },
    ];
  },

  // ✅ 이미지 도메인 허용 추가
  images: {
    remotePatterns: [
      // 개발 환경 (HTTP)
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/**",
      },
      // 운영 환경 (HTTPS) - 모든 HTTPS 도메인 허용
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
