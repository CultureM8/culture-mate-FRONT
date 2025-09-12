/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'}/api/:path*`,
      },
    ];
  },

  // CORS 헤더 (필요시)
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },

  // 성능 최적화
  experimental: {
    optimizeCss: true,
  },

  // 컴파일러 설정
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 이미지 호스트 설정
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: '**', // 모든 HTTPS 호스트 허용 (프로덕션용)
      },
    ],
  },
};

module.exports = nextConfig;
