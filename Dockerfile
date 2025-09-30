# Next.js 15 프로덕션 빌드용 멀티 스테이지 Dockerfile

# 1단계: 의존성 설치
FROM node:20-alpine AS deps
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package.json package-lock.json ./

# 프로덕션 의존성만 설치
RUN npm ci --only=production --legacy-peer-deps

# 2단계: 빌드
FROM node:20-alpine AS builder
WORKDIR /app

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./

# 모든 의존성 설치 (devDependencies 포함)
RUN npm ci --legacy-peer-deps

# 소스 코드 복사
COPY . .

# 환경 변수 (빌드 타임)
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}

# Next.js 빌드
RUN npm run build

# 3단계: 프로덕션 실행
FROM node:20-alpine AS runner
WORKDIR /app

# 프로덕션 환경 설정
ENV NODE_ENV=production

# 보안을 위한 non-root 사용자 생성
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 필요한 파일만 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 소유권 변경
RUN chown -R nextjs:nodejs /app

# non-root 사용자로 전환
USER nextjs

# 포트 노출
EXPOSE 3000

# 환경 변수
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 애플리케이션 실행
CMD ["node", "server.js"]