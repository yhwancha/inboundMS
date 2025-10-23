# 빠른 시작 가이드

InboundMS 애플리케이션을 로컬에서 실행하는 방법을 단계별로 설명합니다.

## 1. 사전 준비

### 필수 설치
- **Node.js** 18 이상 ([다운로드](https://nodejs.org/))
- **pnpm** ([설치 방법](https://pnpm.io/installation))
- **PostgreSQL** ([설치 가이드](#postgresql-설치))

### PostgreSQL 설치

#### macOS (Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
createdb inboundms
```

#### Windows
1. [PostgreSQL 공식 사이트](https://www.postgresql.org/download/windows/)에서 다운로드
2. 설치 후 pgAdmin 실행
3. `inboundms` 데이터베이스 생성

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb inboundms
```

## 2. 프로젝트 설정

### 2.1 저장소 클론 및 의존성 설치
```bash
# 저장소 클론
git clone <your-repository-url>
cd inboundMS

# 프론트엔드 의존성 설치
pnpm install

# 백엔드 의존성 설치
cd backend
pnpm install
cd ..
```

### 2.2 환경 변수 설정

#### 프론트엔드 (.env.local)
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가:

```bash
cat > .env.local << 'EOF'
# Backend API URL
BACKEND_URL=http://localhost:3001/api
EOF
```

#### 백엔드 (backend/.env)
`backend` 폴더에 `.env` 파일을 생성:

```bash
cat > backend/.env << 'EOF'
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inboundms?schema=public"

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
EOF
```

**참고:** PostgreSQL 사용자명/비밀번호가 다르면 `DATABASE_URL`을 수정하세요.

### 2.3 데이터베이스 초기화
```bash
cd backend
pnpm prisma generate
pnpm prisma migrate deploy
cd ..
```

## 3. 애플리케이션 실행

### 옵션 A: 두 개의 터미널 사용 (권장)

#### 터미널 1: 백엔드 시작
```bash
cd backend
pnpm start:dev
```

백엔드가 시작되면 다음 메시지가 표시됩니다:
```
✅ Database connected
🚀 Backend API running on: http://localhost:3001/api
```

#### 터미널 2: 프론트엔드 시작
```bash
pnpm dev
```

프론트엔드가 시작되면:
```
  ▲ Next.js 14.2.25
  - Local:        http://localhost:3000
```

### 옵션 B: Concurrently 사용 (선택)

루트의 `package.json`에 스크립트 추가 후:
```bash
pnpm dev:all
```

## 4. 애플리케이션 접속

브라우저에서 다음 URL로 접속:
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:3001/api

## 5. 확인 사항

### ✅ 백엔드 확인
브라우저나 curl로 테스트:
```bash
curl http://localhost:3001/api/settings
```

예상 응답:
```json
{
  "id": "settings",
  "logoUrl": "",
  "userImage": "",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### ✅ 프론트엔드 확인
- http://localhost:3000 접속
- 페이지가 정상적으로 로드되는지 확인
- Settings, Schedule, Location 메뉴 확인

## 6. 데이터베이스 관리

### Prisma Studio 실행 (GUI)
```bash
cd backend
pnpm prisma:studio
```

브라우저에서 http://localhost:5555 접속하여 데이터를 시각적으로 확인/수정

## 문제 해결

### "Database connection failed"
```bash
# PostgreSQL이 실행 중인지 확인
pg_isready

# macOS
brew services list

# Linux
sudo systemctl status postgresql
```

### "Cannot find module @prisma/client"
```bash
cd backend
rm -rf node_modules
pnpm install
pnpm prisma generate
```

### "Port 3000/3001 already in use"
```bash
# 포트를 사용 중인 프로세스 종료 (macOS/Linux)
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### 백엔드 연결 오류
1. 백엔드가 먼저 실행되었는지 확인
2. `.env.local`의 `BACKEND_URL`이 올바른지 확인
3. 백엔드 로그에서 에러 확인

## 다음 단계

- [README.md](./README.md) - 전체 프로젝트 문서
- [ENV_SETUP.md](./ENV_SETUP.md) - 환경 변수 상세 설정
- [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) - 프로덕션 배포 가이드

## 개발 팁

### 핫 리로드
- 프론트엔드: 파일 저장 시 자동 리로드
- 백엔드: `start:dev`로 실행 시 자동 재시작

### 로그 확인
- 프론트엔드 로그: 브라우저 콘솔
- 백엔드 로그: 터미널

### 데이터 초기화
```bash
cd backend
pnpm prisma migrate reset
```
**경고:** 모든 데이터가 삭제됩니다!

## 도움이 필요하신가요?

문제가 지속되면 다음을 확인하세요:
1. Node.js 버전: `node --version` (18 이상)
2. pnpm 버전: `pnpm --version` (8 이상)
3. PostgreSQL 실행 상태
4. 환경 변수 설정

Issues에 질문을 남겨주세요!

