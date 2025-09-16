# Culture-Mate Frontend

> 문화 이벤트 및 커뮤니티 플랫폼의 프론트엔드 웹 애플리케이션

## 🚀 프로젝트 개요

Culture-Mate Frontend는 사용자가 문화 이벤트를 발견하고, 그룹 활동에 참여하며, 커뮤니티에서 소통할 수 있는 Next.js 기반의 모던 웹 애플리케이션입니다.

## 📋 주요 기능

- **이벤트 발견**: 다양한 문화 이벤트 검색 및 상세 정보 제공
- **투게더(Together)**: 그룹 활동 생성 및 참여 관리
- **커뮤니티**: 게시판을 통한 사용자 간 소통
- **실시간 채팅**: WebSocket 기반 실시간 채팅 시스템
- **사용자 프로필**: 마이페이지 및 개인 설정 관리
- **관리자 대시보드**: 콘텐츠 및 사용자 관리

## 🛠 기술 스택

### 프레임워크 & 라이브러리
- **Next.js 15.4.4**: React 기반 풀스택 프레임워크
- **React 19.1.0**: 최신 React 버전
- **Turbopack**: 고속 번들러 (개발 환경)

### 스타일링
- **Tailwind CSS 4.1.11**: 유틸리티 기반 CSS 프레임워크
- **모바일 퍼스트**: 반응형 디자인 구현

### HTTP & 실시간 통신
- **Axios 1.11.0**: HTTP 클라이언트
- **@stomp/stompjs 7.1.1**: STOMP 프로토콜 클라이언트
- **sockjs-client 1.6.1**: WebSocket 폴백

### 기타 도구
- **DOMPurify 3.2.6**: XSS 방지를 위한 HTML 정화
- **React Router DOM 7.7.1**: 클라이언트 사이드 라우팅
- **ESLint**: 코드 품질 관리

## 🏗 프로젝트 구조

```
culture-mate-FRONT/
├── app/                      # Next.js App Router
│   ├── (routes)/            # 페이지 라우트
│   │   ├── events/          # 이벤트 관련 페이지
│   │   ├── with/            # 투게더 기능
│   │   ├── community/       # 커뮤니티 페이지
│   │   ├── mypage/          # 마이페이지
│   │   ├── admin/           # 관리자 페이지
│   │   └── chat/            # 채팅 페이지
│   ├── globals.css          # 전역 스타일
│   ├── layout.jsx           # 루트 레이아웃
│   └── page.jsx             # 홈페이지
├── components/              # 재사용 컴포넌트
│   ├── global/             # 전역 컴포넌트
│   │   ├── NavigationBar.jsx
│   │   ├── Gallery.jsx
│   │   └── Footer.jsx
│   ├── auth/               # 인증 관련 컴포넌트
│   └── [feature]/          # 기능별 컴포넌트
├── constants/              # 상수 정의
│   └── path.jsx            # 라우트, 이미지, 아이콘 경로
├── hooks/                  # 커스텀 훅
├── lib/                    # 유틸리티 라이브러리
└── public/                 # 정적 파일
    └── img/                # 이미지 파일
```

## 🚀 시작하기

### 사전 요구사항
- Node.js 18.0 이상
- npm 또는 yarn

### 환경 변수 설정

`.env` 파일에 다음 환경 변수를 설정하세요:

```env
# Backend Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:8080

# API Base Path
NEXT_PUBLIC_API_BASE=/api/v1

# WebSocket 설정
NEXT_PUBLIC_CHAT_WS=http://localhost:8080/websocket

# App 설정
NEXT_PUBLIC_APP_NAME=culture-mate
NEXT_PUBLIC_APP_VERSION=0.1.0
```

### 서버 실행

```bash
# 1. 프로젝트 클론
git clone [repository-url]
cd culture-mate-FRONT

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

## 🔧 개발 명령어

```bash
# 개발 서버 실행 (Turbopack 포함)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 코드 린팅
npm run lint
```

## 🌐 라우팅 구조

### 주요 페이지
- `/` - 홈페이지
- `/events` - 이벤트 목록 및 상세
- `/with` - 투게더 기능
- `/community` - 커뮤니티 게시판
- `/mypage` - 사용자 프로필
- `/admin` - 관리자 대시보드
- `/chat/room/[roomId]` - 채팅방

### API 프록시
Next.js의 `rewrites` 기능을 통해 백엔드 API와 연결:

```javascript
// next.config.js
rewrites: [
  {
    source: '/api/:path*',
    destination: 'http://localhost:8080/api/:path*'
  },
  {
    source: '/websocket/:path*',
    destination: 'http://localhost:8080/websocket/:path*'
  }
]
```

## 🎨 디자인 시스템

### Tailwind CSS 설정
- **모바일 퍼스트**: 반응형 디자인 우선
- **클램프 함수**: 유연한 폰트 크기 조정
- **커스텀 컬러**: 브랜드 컬러 팔레트
- **한국어 폰트**: 최적화된 한글 폰트 적용

### 컴포넌트 패턴
- **ListComponent + ListLayout**: 일관된 목록 표시
- **컴포넌트 합성**: 재사용 가능한 컴포넌트 구조
- **이벤트 핸들러**: "Handler" 접미사 사용

## 🔐 인증 시스템

### JWT 토큰 관리
- **저장 방식**: localStorage 사용
- **자동 주입**: API 요청 시 자동으로 토큰 헤더 추가
- **Context API**: 전역 인증 상태 관리

```javascript
// 인증 헤더 자동 추가
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

## 💬 실시간 채팅

### WebSocket 연결
- **프로토콜**: STOMP over WebSocket
- **인증**: JWT 토큰 기반 인증
- **연결 URL**: `ws://localhost:8080/websocket`

```javascript
// WebSocket 연결 예시
const client = new Client({
  brokerURL: 'ws://localhost:8080/websocket',
  connectHeaders: {
    Authorization: `Bearer ${token}`
  }
});
```

## 📱 반응형 디자인

### 브레이크포인트
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### 최적화
- **이미지**: Next.js Image 컴포넌트 사용
- **번들 크기**: 자동 코드 분할
- **성능**: React 19의 최신 최적화 기능 활용

## 🔧 개발 가이드라인

### 코딩 스타일
- **들여쓰기**: 2칸 스페이스
- **세미콜론**: 필수 사용
- **네이밍**: camelCase (변수/함수), PascalCase (컴포넌트)
- **파일명**: 컴포넌트는 PascalCase.jsx, 페이지는 소문자 폴더

### 상태 관리
- **Context API**: 전역 상태 (인증, 사용자 정보)
- **useState/useEffect**: 로컬 상태 관리
- **커스텀 훅**: 재사용 가능한 로직

### 이미지 관리
```javascript
// constants/path.jsx에서 중앙 관리
export const IMAGES = {
  LOGO: '/img/logo.png',
  // 기타 이미지들...
};
```

## 🐛 알려진 이슈 & 해결 방법

### CORS 문제
- Next.js의 `rewrites` 설정으로 해결
- 백엔드 CORS 설정과 함께 작동

### 이미지 로딩
- Next.js Image 컴포넌트 사용으로 최적화
- `remotePatterns` 설정으로 외부 이미지 허용

### 포트 충돌
- 프론트엔드: 3000번 포트
- 백엔드: 8080번 포트
- 두 포트 모두 사용 가능한지 확인 필요

## 🚢 배포

### 프로덕션 빌드
```bash
npm run build
```

### 환경별 설정
- **개발**: `.env.local`
- **스테이징**: `.env.staging`
- **프로덕션**: `.env.production`

## 🧪 테스트

현재 테스트 프레임워크가 구성되어 있지 않습니다. 향후 Jest 및 React Testing Library 추가 예정입니다.

## 📊 성능 최적화

### Next.js 최적화
- **Turbopack**: 개발 환경 고속 빌드
- **자동 코드 분할**: 페이지별 청크 분리
- **이미지 최적화**: WebP 자동 변환
- **프리패치**: 링크 호버 시 사전 로딩

### 컴파일러 설정
```javascript
// next.config.js
compiler: {
  removeConsole: process.env.NODE_ENV === 'production'
}
```

## 📄 라이선스

이 프로젝트는 개인 학습 및 포트폴리오 목적으로 제작되었습니다.

## 👨‍💻 개발자

- **개발자**: [개발자명]
- **이메일**: [이메일]
- **GitHub**: [GitHub URL]

---

## 🔗 관련 프로젝트

- **Backend**: [culture-mate-BACK](../culture-mate-BACK/) - Spring Boot 기반 백엔드 API

## 🆘 문제 해결

### 자주 발생하는 문제들

1. **서버 연결 실패**
   ```bash
   # 백엔드 서버가 실행 중인지 확인
   curl http://localhost:8080/api/v1/health
   ```

2. **의존성 설치 오류**
   ```bash
   # 캐시 삭제 후 재설치
   npm cache clean --force
   npm install
   ```

3. **빌드 오류**
   ```bash
   # Next.js 캐시 삭제
   rm -rf .next
   npm run build
   ```

자세한 문제 해결은 프로젝트 Wiki 또는 Issues 페이지를 참고하세요.