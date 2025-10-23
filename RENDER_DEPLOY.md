# Render 배포 가이드

이 가이드는 InboundMS 애플리케이션을 Render에 배포하는 방법을 설명합니다.

**구조:** 이 애플리케이션은 프론트엔드(Next.js)와 백엔드(NestJS)로 분리되어 있으며, PostgreSQL 데이터베이스를 사용합니다.

## 배포 순서

1. PostgreSQL 데이터베이스 생성
2. 백엔드 API 배포
3. 프론트엔드 배포

## 1. Render 계정 준비

1. [Render](https://render.com)에 가입하거나 로그인합니다.
2. GitHub 계정을 연결합니다.

## 2. PostgreSQL 데이터베이스 생성

### 2.1 새 PostgreSQL 인스턴스 생성
1. Render 대시보드에서 **"New +"** 클릭
2. **"PostgreSQL"** 선택
3. 다음 정보 입력:
   - **Name**: `inboundms-db`
   - **Database**: `inboundms`
   - **User**: `inboundms_user`
   - **Region**: 가장 가까운 지역 선택 (예: Singapore)
   - **PostgreSQL Version**: 16 (최신 버전)
   - **Plan**: Free 플랜 선택

4. **"Create Database"** 클릭

### 2.2 데이터베이스 연결 정보 확인
데이터베이스가 생성되면:
- **Internal Database URL**: 백엔드에서 사용 (같은 Render 내부)
- **External Database URL**: 로컬 개발에서 사용

**Internal Database URL**을 복사해두세요.

## 3. 백엔드 API 배포

### 3.1 새 웹 서비스 생성
1. Render 대시보드에서 **"New +"** 클릭
2. **"Web Service"** 선택
3. GitHub 저장소 연결

### 3.2 백엔드 서비스 설정
- **Name**: `inboundms-backend`
- **Region**: PostgreSQL과 같은 지역 선택
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**:
  \`\`\`bash
  pnpm install && pnpm prisma generate && pnpm build
  \`\`\`
- **Start Command**:
  \`\`\`bash
  pnpm start:prod
  \`\`\`
- **Plan**: Free 플랜

### 3.3 백엔드 환경 변수
**Environment Variables** 섹션에 추가:

\`\`\`
DATABASE_URL=<Internal Database URL>
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://inboundms.onrender.com
\`\`\`

**참고:** `FRONTEND_URL`은 나중에 프론트엔드 URL로 업데이트합니다.

4. **"Create Web Service"** 클릭

배포가 완료되면 백엔드 URL을 복사합니다 (예: `https://inboundms-backend.onrender.com`)

## 4. 프론트엔드 배포

### 4.1 새 웹 서비스 생성
1. Render 대시보드에서 **"New +"** 클릭
2. **"Web Service"** 선택
3. 같은 GitHub 저장소 선택

### 4.2 프론트엔드 서비스 설정
- **Name**: `inboundms`
- **Region**: 백엔드와 같은 지역
- **Branch**: `main`
- **Root Directory**: (비워두기)
- **Runtime**: `Node`
- **Build Command**:
  \`\`\`bash
  pnpm install && pnpm build
  \`\`\`
- **Start Command**:
  \`\`\`bash
  pnpm start
  \`\`\`
- **Plan**: Free 플랜

### 4.3 프론트엔드 환경 변수
**Environment Variables** 섹션에 추가:

\`\`\`
BACKEND_URL=https://inboundms-backend.onrender.com/api
\`\`\`

**선택사항 (Twilio SMS):**
\`\`\`
TWILIO_ACCOUNT_SID=<your_sid>
TWILIO_AUTH_TOKEN=<your_token>
TWILIO_PHONE_NUMBER=<your_number>
NOTIFICATION_PHONE_NUMBER=<recipient_number>
\`\`\`

4. **"Create Web Service"** 클릭

## 5. 백엔드 환경 변수 업데이트

프론트엔드가 배포되면:
1. 백엔드 서비스 설정으로 이동
2. `FRONTEND_URL`을 실제 프론트엔드 URL로 업데이트
   \`\`\`
   FRONTEND_URL=https://inboundms.onrender.com
   \`\`\`
3. 저장하면 자동으로 재배포됩니다

## 6. 배포 완료 확인

### 6.1 백엔드 확인
1. 백엔드 URL 접속: `https://inboundms-backend.onrender.com/api/settings`
2. JSON 응답이 반환되는지 확인

### 6.2 프론트엔드 확인
1. 프론트엔드 URL 접속: `https://inboundms.onrender.com`
2. ✅ 웹사이트가 정상적으로 로드되는지 확인
3. ✅ Schedule 데이터를 추가할 수 있는지 확인
4. ✅ Location 설정이 작동하는지 확인
5. ✅ Timesheet 입력 및 저장이 가능한지 확인

## 7. 로컬 개발 환경 설정

### 프론트엔드 (.env.local)
\`\`\`bash
BACKEND_URL=http://localhost:3001/api
\`\`\`

### 백엔드 (backend/.env)
\`\`\`bash
DATABASE_URL="<External Database URL>"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
\`\`\`

로컬에서 External Database URL을 사용하여 프로덕션 데이터베이스에 접근할 수 있습니다.

## 8. 업데이트 배포

코드를 수정하고 GitHub에 푸시하면 Render가 자동으로 재배포합니다:

\`\`\`bash
git add .
git commit -m "Update features"
git push origin main
\`\`\`

**참고:** 백엔드와 프론트엔드가 개별적으로 배포됩니다.

## 9. 문제 해결

### 배포 실패 시
1. Render 대시보드에서 **Logs** 확인
2. Build Command와 Root Directory가 정확한지 확인
3. 환경 변수가 올바르게 설정되었는지 확인

### 백엔드 연결 오류
1. 백엔드 URL이 올바른지 확인
2. 백엔드 로그에서 CORS 에러 확인
3. `FRONTEND_URL`이 실제 프론트엔드 URL과 일치하는지 확인

### 데이터베이스 연결 오류
1. `DATABASE_URL`이 올바른지 확인 (Internal URL 사용)
2. PostgreSQL 인스턴스가 "Available" 상태인지 확인
3. 같은 Region에 배포되었는지 확인

### 마이그레이션 오류
1. 백엔드 대시보드에서 **Shell** 열기
2. 다음 명령어 실행:
   \`\`\`bash
   cd backend
   pnpm prisma migrate deploy
   \`\`\`

## 10. 비용 및 제한사항

### Free Tier 제한:
- **PostgreSQL**: 1GB 저장소, 90일 후 삭제 (데이터는 유지)
- **Web Service**: 750시간/월, 15분 비활동 후 슬립 모드

### 슬립 모드:
- 무료 플랜에서는 15분 동안 요청이 없으면 슬립 모드로 전환
- 첫 번째 요청 시 30초 정도 로딩 시간 발생
- **데이터는 유지됩니다** (PostgreSQL 사용)
- UptimeRobot 등의 모니터링 서비스로 슬립 모드 방지 가능

## 11. 프로덕션 권장사항

실제 운영 환경에서는 유료 플랜 사용을 권장합니다:

### Starter 플랜 ($7/월 × 3 = $21/월)
- **PostgreSQL**: Standard 플랜
  - 자동 백업
  - 더 많은 저장소
- **Backend**: Starter 플랜
  - 슬립 모드 없음
  - 더 많은 메모리/CPU
- **Frontend**: Starter 플랜
  - 빠른 응답 속도
  - 안정적인 운영

## 12. 데이터베이스 관리

### Render Console
1. PostgreSQL 인스턴스 선택
2. **Connect** → **External Connection**
3. psql 또는 GUI 도구로 연결

### Prisma Studio
로컬에서 External URL을 사용:
\`\`\`bash
cd backend
DATABASE_URL="<External Database URL>" pnpm prisma:studio
\`\`\`

## 지원

문제가 발생하면:
1. [Render 문서](https://render.com/docs)
2. [NestJS 배포 가이드](https://docs.nestjs.com/deployment)
3. [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
4. [Prisma 문서](https://www.prisma.io/docs)


