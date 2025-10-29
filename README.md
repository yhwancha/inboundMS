# InboundMS - Inbound Management System

Inbound 관리 시스템 (타임시트, 스케줄, 로케이션 관리)

## 🎉 최신 업데이트: 전체 API 연동 완료!

**모든 프론트엔드 페이지가 Backend API와 완전히 연동되었습니다!** 시스템이 이제 데이터베이스 기반의 실시간 데이터 동기화로 작동합니다.

자세한 내용은 [FULL_INTEGRATION_COMPLETE.md](./FULL_INTEGRATION_COMPLETE.md)를 참조하세요.

## 프로젝트 구조

이 프로젝트는 **프론트엔드(Next.js)**와 **백엔드(NestJS)**로 분리된 구조입니다.

```
inboundMS/
├── app/                    # Next.js 프론트엔드
│   ├── api/               # API 프록시 라우트 (Backend로 요청 전달)
│   ├── components/        # React 컴포넌트
│   └── pages/            # 페이지
├── backend/               # NestJS 백엔드
│   ├── src/
│   │   ├── settings/     # Settings 모듈
│   │   ├── timesheet/    # Timesheet 모듈
│   │   ├── location/     # Location 모듈
│   │   ├── schedule/     # Schedule 모듈
│   │   └── prisma/       # Prisma 서비스
│   └── prisma/
│       └── schema.prisma # 데이터베이스 스키마
├── components/            # UI 컴포넌트
├── lib/                   # 유틸리티 라이브러리
└── public/               # 정적 파일
```

## 기술 스택

### Frontend
- **Next.js 14** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **Radix UI** - UI 컴포넌트
- **React Hook Form** - 폼 관리
- **date-fns** - 날짜 처리

### Backend
- **NestJS** - Node.js 프레임워크
- **Prisma** - ORM
- **PostgreSQL** - 데이터베이스
- **TypeScript** - 타입 안정성
- **class-validator** - 유효성 검사

## 시작하기

### 사전 요구사항

- Node.js 18+ 
- pnpm (패키지 매니저)
- PostgreSQL (로컬 또는 Render)

### 설치

1. 저장소 클론
```bash
git clone <repository-url>
cd inboundMS
```

2. 프론트엔드 의존성 설치
```bash
pnpm install
```

3. 백엔드 의존성 설치
```bash
cd backend
pnpm install
```

### 환경 변수 설정

#### 프론트엔드 (.env.local)
프로젝트 루트에 `.env.local` 파일 생성:

```env
# Backend API URL
BACKEND_URL=http://localhost:3001/api

# Twilio SMS (Optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
NOTIFICATION_PHONE_NUMBER=+1234567890
```

#### 백엔드 (backend/.env)
`backend` 폴더에 `.env` 파일 생성:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inboundms?schema=public"

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 데이터베이스 설정

1. PostgreSQL 데이터베이스 생성
```bash
createdb inboundms
```

2. Prisma 마이그레이션 실행
```bash
cd backend
pnpm prisma generate
pnpm prisma migrate deploy
```

### 개발 서버 실행

두 개의 터미널 창을 열어 각각 실행:

#### 터미널 1: 백엔드
```bash
cd backend
pnpm start:dev
```
백엔드가 `http://localhost:3001`에서 실행됩니다.

#### 터미널 2: 프론트엔드
```bash
pnpm dev
```
프론트엔드가 `http://localhost:3000`에서 실행됩니다.

## 주요 기능

### 1. 타임시트 관리
- 직원 체크인/체크아웃 기록
- 근무 시간 자동 계산
- 날짜별 조회 및 필터링

### 2. 스케줄 관리
- 고객 예약 관리
- 엑셀 파일로 스케줄 업로드
- 날짜별 스케줄 조회

### 3. 로케이션 관리
- 작업 위치 관리
- 위치별 상태 추적

### 4. 설정
- 로고 및 사용자 이미지 관리
- 시스템 설정

## API 엔드포인트

백엔드 API는 `/api` prefix를 사용합니다:

### Settings
- `GET /api/settings` - 설정 조회
- `PUT /api/settings` - 설정 업데이트

### Timesheet
- `GET /api/timesheet?date={date}` - 타임시트 조회
- `POST /api/timesheet` - 타임시트 생성
- `PUT /api/timesheet/:id` - 타임시트 수정
- `DELETE /api/timesheet/:id` - 타임시트 삭제

### Location
- `GET /api/location` - 로케이션 조회
- `POST /api/location` - 로케이션 초기화
- `PUT /api/location` - 로케이션 수정

### Schedule
- `GET /api/schedule?date={date}` - 스케줄 조회
- `POST /api/schedule` - 스케줄 생성
- `PUT /api/schedule/:id` - 스케줄 수정
- `DELETE /api/schedule/:id` - 스케줄 삭제

## 배포

### 🚀 Vercel + Render 배포 (권장)
Frontend는 Vercel에, Backend는 Render에 배포하는 것을 권장합니다.

**자세한 가이드**: [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

#### 배포 순서
1. **PostgreSQL 생성** (Render) - 무료 750MB
2. **Backend 배포** (Render) - NestJS API
3. **Frontend 배포** (Vercel) - Next.js 앱

#### 필요한 환경 변수
- **Frontend (Vercel)**: `BACKEND_URL`
- **Backend (Render)**: `DATABASE_URL`, `PORT`, `NODE_ENV`, `FRONTEND_URL`

📚 **더 많은 가이드**:
- [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) - Vercel + Render 배포
- [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) - Render 전용 배포
- [ENV_VARIABLES.md](./ENV_VARIABLES.md) - 환경 변수 상세 설명
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - 배포 체크리스트

## 개발 가이드

### 백엔드에 새 모듈 추가

1. 모듈 생성
```bash
cd backend
nest g module feature-name
nest g controller feature-name
nest g service feature-name
```

2. Prisma 스키마 업데이트 (`backend/prisma/schema.prisma`)

3. 마이그레이션 생성
```bash
pnpm prisma migrate dev --name add-feature-name
```

### 데이터베이스 관리

```bash
cd backend

# Prisma Studio 실행 (GUI)
pnpm prisma:studio

# 마이그레이션 생성
pnpm prisma migrate dev --name migration-name

# 프로덕션 마이그레이션 실행
pnpm prisma:migrate
```

## 문제 해결

### 백엔드 연결 오류
- 백엔드가 실행 중인지 확인 (`http://localhost:3001`)
- `BACKEND_URL` 환경 변수가 올바른지 확인
- CORS 설정 확인

### 데이터베이스 연결 오류
- PostgreSQL이 실행 중인지 확인
- `DATABASE_URL`이 올바른지 확인
- 데이터베이스가 생성되었는지 확인

### Prisma 오류
```bash
cd backend
rm -rf node_modules/.prisma
pnpm prisma generate
```

## 라이선스

Private Project

## 지원

문제가 있으면 GitHub Issues에 등록해주세요.
