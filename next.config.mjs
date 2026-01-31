/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker 배포를 위한 standalone 모드 활성화
  output: "standalone",

  // 이미지 도메인 허용
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
