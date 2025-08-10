# 슈퍼클로드 명령어 (한국어)

슈퍼클로드 프레임워크의 주요 명령어들을 한국어로 설명합니다.

## 개발 명령어

### `/build [대상]`
**목적**: 프레임워크 자동 감지와 함께 프로젝트 빌드
**사용법**: 
```
/build [대상] [--플래그]
```
**예시**:
- `/build` - 전체 프로젝트 빌드
- `/build --frontend` - 프론트엔드만 빌드
- `/build src/` - 특정 디렉토리 빌드

### `/implement [기능설명]`
**목적**: 지능적인 페르소나 활성화를 통한 기능 및 코드 구현
**사용법**:
```
/implement [기능설명] [--type 컴포넌트|api|서비스|기능] [--framework 이름]
```
**예시**:
- `/implement 로그인 컴포넌트` - 로그인 UI 컴포넌트 구현
- `/implement --type api 사용자 인증` - 사용자 인증 API 구현

## 분석 명령어

### `/analyze [대상]`
**목적**: 다차원 코드 및 시스템 분석
**사용법**:
```
/analyze [대상] [--플래그]
```
**예시**:
- `/analyze` - 전체 프로젝트 분석
- `/analyze --focus performance` - 성능 중심 분석
- `/analyze src/components` - 특정 폴더 분석

### `/troubleshoot [증상] [플래그]`
**목적**: 문제 조사 및 해결
**사용법**:
```
/troubleshoot [증상] [--플래그]
```
**예시**:
- `/troubleshoot 빌드 에러` - 빌드 에러 해결
- `/troubleshoot --verbose` - 자세한 문제 분석

### `/explain [주제] [플래그]`
**목적**: 교육적 설명 제공
**사용법**:
```
/explain [주제] [--플래그]
```
**예시**:
- `/explain React hooks` - React 훅 설명
- `/explain --detailed API 설계` - API 설계 자세히 설명

## 품질 개선 명령어

### `/improve [대상]`
**목적**: 증거 기반 코드 개선
**사용법**:
```
/improve [대상] [--type 품질|성능|유지보수성|스타일] [--safe]
```
**예시**:
- `/improve` - 전체 코드 개선
- `/improve --type performance` - 성능 개선
- `/improve src/components --safe` - 안전한 컴포넌트 개선

### `/cleanup [대상]`
**목적**: 프로젝트 정리 및 기술부채 감소
**사용법**:
```
/cleanup [대상] [--플래그]
```
**예시**:
- `/cleanup` - 전체 프로젝트 정리
- `/cleanup --unused` - 사용하지 않는 코드 제거

## 문서화 명령어

### `/document [대상]`
**목적**: 문서 생성
**사용법**:
```
/document [대상] [--type readme|api|가이드] [--lang ko]
```
**예시**:
- `/document --type readme` - README 파일 생성
- `/document API --lang ko` - 한국어 API 문서 생성

## 테스팅 명령어

### `/test [타입]`
**목적**: 테스팅 워크플로우
**사용법**:
```
/test [타입] [--플래그]
```
**예시**:
- `/test unit` - 유닛 테스트 실행
- `/test e2e` - E2E 테스트 실행

## Git 명령어

### `/git [작업]`
**목적**: Git 워크플로우 도우미
**사용법**:
```
/git [작업] [--플래그]
```
**예시**:
- `/git commit` - 스마트 커밋 생성
- `/git pr` - Pull Request 생성

## 설계 명령어

### `/design [도메인]`
**목적**: 설계 오케스트레이션
**사용법**:
```
/design [도메인] [--플래그]
```
**예시**:
- `/design UI` - UI 설계
- `/design system` - 시스템 아키텍처 설계

## 유용한 플래그

### 분석 플래그
- `--think` - 다중 파일 분석 (약 4K 토큰)
- `--think-hard` - 심화 아키텍처 분석 (약 10K 토큰)
- `--ultrathink` - 최대 심도 분석 (약 32K 토큰)

### 효율성 플래그
- `--uc` / `--ultracompressed` - 30-50% 토큰 절약
- `--validate` - 사전 작업 검증 및 위험 평가
- `--safe-mode` - 최대 검증으로 보수적 실행

### 페르소나 플래그
- `--persona-frontend` - 프론트엔드 전문가
- `--persona-backend` - 백엔드 전문가
- `--persona-security` - 보안 전문가
- `--persona-analyzer` - 분석 전문가

### MCP 서버 플래그
- `--c7` / `--context7` - 라이브러리 문서 조회
- `--seq` / `--sequential` - 복잡한 다단계 분석
- `--magic` - UI 컴포넌트 생성
- `--play` / `--playwright` - 브라우저 자동화 및 E2E 테스팅

### 반복 개선 플래그
- `--loop` - 반복 개선 모드 활성화
- `--iterations [n]` - 개선 사이클 수 제어 (기본: 3)
- `--interactive` - 반복 간 사용자 확인 활성화

## 예시 사용법

### 컴포넌트 생성
```
/implement 반응형 네비게이션 바 --type component --persona-frontend
```

### 성능 분석
```
/analyze --focus performance --think-hard --persona-performance
```

### 코드 품질 개선
```
/improve src/ --type quality --safe --loop --iterations 3
```

### API 문서화
```
/document API --type api --lang ko --persona-scribe=ko
```

### 보안 감사
```
/analyze --focus security --ultrathink --persona-security --validate
```

이 명령어들을 사용하여 더 효율적으로 개발 작업을 진행할 수 있습니다!