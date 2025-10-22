# 환경 변수 설정 가이드

## 로컬 개발 환경 설정

### 1. `.env` 파일 생성

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

\`\`\`env
# Database URL
# 로컬 PostgreSQL 사용 시:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/timesheet?schema=public"

# 또는 Render PostgreSQL External URL 사용 시:
# DATABASE_URL="postgresql://username:password@host/database"

# Twilio SMS (선택사항)
TWILIO_ACCOUNT_SID="your_account_sid"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"
NOTIFICATION_PHONE_NUMBER="+1234567890"
\`\`\`

### 2. 로컬 PostgreSQL 설치 (옵션 A)

#### macOS (Homebrew 사용)
\`\`\`bash
# PostgreSQL 설치
brew install postgresql@15

# PostgreSQL 서비스 시작
brew services start postgresql@15

# 데이터베이스 생성
createdb timesheet
\`\`\`

#### Windows
1. [PostgreSQL 공식 사이트](https://www.postgresql.org/download/windows/)에서 다운로드
2. 설치 후 pgAdmin 또는 psql로 `timesheet` 데이터베이스 생성

#### Linux (Ubuntu/Debian)
\`\`\`bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb timesheet
\`\`\`

### 3. Render PostgreSQL 사용 (옵션 B - 권장)

로컬 개발 시에도 Render의 External Database URL을 사용할 수 있습니다:

1. Render 대시보드에서 PostgreSQL 인스턴스 생성
2. **External Database URL** 복사
3. `.env` 파일의 `DATABASE_URL`에 붙여넣기

**장점:**
- 로컬 PostgreSQL 설치 불필요
- 프로덕션과 동일한 환경
- 팀원들과 데이터 공유 가능

### 4. Prisma 설정 및 마이그레이션

\`\`\`bash
# Prisma Client 생성
pnpm prisma generate

# 데이터베이스 마이그레이션 실행
pnpm prisma migrate deploy

# (선택) Prisma Studio로 데이터 확인
pnpm prisma studio
\`\`\`

### 5. 개발 서버 시작

\`\`\`bash
pnpm dev
\`\`\`

브라우저에서 `http://localhost:3000` 접속

## Render 배포 환경 설정

### 1. Environment Variables 추가

Render 웹 서비스 설정에서 다음 변수들을 추가:

#### 필수:
\`\`\`
DATABASE_URL = <Internal Database URL>
\`\`\`

#### 선택 (Twilio SMS 사용 시):
\`\`\`
TWILIO_ACCOUNT_SID = <your_sid>
TWILIO_AUTH_TOKEN = <your_token>
TWILIO_PHONE_NUMBER = <your_number>
NOTIFICATION_PHONE_NUMBER = <recipient_number>
\`\`\`

### 2. Build Command

\`\`\`bash
pnpm install && pnpm prisma generate && pnpm prisma migrate deploy && pnpm build
\`\`\`

### 3. Start Command

\`\`\`bash
pnpm start
\`\`\`

## 데이터베이스 URL 형식

### PostgreSQL URL 구조:
\`\`\`
postgresql://[username]:[password]@[host]:[port]/[database]?schema=public
\`\`\`

### 예시:
\`\`\`
# 로컬
postgresql://postgres:postgres@localhost:5432/timesheet?schema=public

# Render Internal (Web Service에서 사용)
postgresql://user:pass@dpg-xxxxx-a/database_name

# Render External (로컬 개발에서 사용)
postgresql://user:pass@dpg-xxxxx-a.oregon-postgres.render.com/database_name
\`\`\`

## 문제 해결

### "P1001: Can't reach database server"
- DATABASE_URL이 올바른지 확인
- PostgreSQL 서비스가 실행 중인지 확인
- 방화벽 설정 확인

### "P1003: Database does not exist"
- 데이터베이스가 생성되었는지 확인
- `createdb timesheet` 명령어 실행

### Prisma Client 오류
\`\`\`bash
# Prisma Client 재생성
pnpm prisma generate

# 캐시 클리어
rm -rf node_modules/.prisma
pnpm prisma generate
\`\`\`

### 마이그레이션 오류
\`\`\`bash
# 마이그레이션 상태 확인
pnpm prisma migrate status

# 마이그레이션 재실행
pnpm prisma migrate deploy

# (개발 중) 마이그레이션 리셋
pnpm prisma migrate reset
\`\`\`

## 보안 주의사항

1. ⚠️ `.env` 파일을 절대 Git에 커밋하지 마세요
2. ⚠️ 데이터베이스 비밀번호를 공개 저장소에 노출하지 마세요
3. ⚠️ Twilio 인증 정보를 안전하게 보관하세요
4. ⚠️ 프로덕션 데이터베이스 URL을 로컬 개발에 사용하지 마세요

## 도움말

- [Prisma 문서](https://www.prisma.io/docs)
- [Render 문서](https://render.com/docs)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)


