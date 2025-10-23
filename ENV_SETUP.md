# 환경 변수 설정 가이드

## 로컬 개발 환경 설정

이 애플리케이션은 **프론트엔드(Next.js)**와 **백엔드(NestJS)**로 분리되어 있으며, **PostgreSQL** 데이터베이스를 사용합니다.

### 1. 프론트엔드 환경 변수 설정

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

\`\`\`env
# Backend API URL
BACKEND_URL=http://localhost:3001/api

# Twilio SMS (선택사항)
TWILIO_ACCOUNT_SID="your_account_sid"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"
NOTIFICATION_PHONE_NUMBER="+1234567890"
\`\`\`

### 2. 백엔드 환경 변수 설정

`backend` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

\`\`\`env
# Database URL
# 로컬 PostgreSQL 사용 시:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inboundms?schema=public"

# 또는 Render PostgreSQL External URL 사용 시:
# DATABASE_URL="postgresql://username:password@host/database"

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
\`\`\`

### 3. PostgreSQL 설치 및 설정

#### macOS (Homebrew 사용)
\`\`\`bash
# PostgreSQL 설치
brew install postgresql@15

# PostgreSQL 서비스 시작
brew services start postgresql@15

# 데이터베이스 생성
createdb inboundms
\`\`\`

#### Windows
1. [PostgreSQL 공식 사이트](https://www.postgresql.org/download/windows/)에서 다운로드
2. 설치 후 pgAdmin 또는 psql로 `inboundms` 데이터베이스 생성

#### Linux (Ubuntu/Debian)
\`\`\`bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb inboundms
\`\`\`

### 4. 데이터베이스 초기화

\`\`\`bash
cd backend

# Prisma Client 생성
pnpm prisma generate

# 데이터베이스 마이그레이션 실행
pnpm prisma migrate deploy
\`\`\`

### 5. 개발 서버 시작

두 개의 터미널을 사용하여 각각 실행:

#### 터미널 1: 백엔드
\`\`\`bash
cd backend
pnpm install
pnpm start:dev
\`\`\`

#### 터미널 2: 프론트엔드
\`\`\`bash
pnpm install
pnpm dev
\`\`\`

브라우저에서 `http://localhost:3000` 접속

## Render 배포 환경 설정

### 1. PostgreSQL 환경 변수

Render PostgreSQL 인스턴스 생성 후, Internal Database URL을 복사합니다.

### 2. 백엔드 환경 변수

Render 백엔드 웹 서비스 설정에서 다음 변수들을 추가:

\`\`\`
DATABASE_URL = <Internal Database URL>
PORT = 3001
NODE_ENV = production
FRONTEND_URL = <Frontend URL>
\`\`\`

### 3. 프론트엔드 환경 변수

Render 프론트엔드 웹 서비스 설정에서 다음 변수들을 추가:

\`\`\`
BACKEND_URL = <Backend URL>/api
\`\`\`

#### 선택사항 (Twilio SMS):
\`\`\`
TWILIO_ACCOUNT_SID = <your_sid>
TWILIO_AUTH_TOKEN = <your_token>
TWILIO_PHONE_NUMBER = <your_number>
NOTIFICATION_PHONE_NUMBER = <recipient_number>
\`\`\`

### 4. 백엔드 Build & Start Commands

**Build Command:**
\`\`\`bash
pnpm install && pnpm prisma generate && pnpm build
\`\`\`

**Start Command:**
\`\`\`bash
pnpm start:prod
\`\`\`

**Root Directory:** `backend`

### 5. 프론트엔드 Build & Start Commands

**Build Command:**
\`\`\`bash
pnpm install && pnpm build
\`\`\`

**Start Command:**
\`\`\`bash
pnpm start
\`\`\`

**Root Directory:** (비워두기)

## 데이터베이스 URL 형식

### PostgreSQL URL 구조:
\`\`\`
postgresql://[username]:[password]@[host]:[port]/[database]?schema=public
\`\`\`

### 예시:
\`\`\`
# 로컬
postgresql://postgres:postgres@localhost:5432/inboundms?schema=public

# Render Internal (Backend에서 사용)
postgresql://user:pass@dpg-xxxxx-a/database_name

# Render External (로컬 개발에서 사용)
postgresql://user:pass@dpg-xxxxx-a.oregon-postgres.render.com/database_name
\`\`\`

## 보안 주의사항

1. ⚠️ `.env` 파일을 절대 Git에 커밋하지 마세요
2. ⚠️ Twilio 인증 정보를 안전하게 보관하세요
3. ⚠️ API 키를 공개 저장소에 노출하지 마세요

## 도움말

- [Next.js 문서](https://nextjs.org/docs)
- [Render 문서](https://render.com/docs)
- [Twilio 문서](https://www.twilio.com/docs)


