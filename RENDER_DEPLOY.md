# Render 배포 가이드

이 가이드는 InboundMS 애플리케이션을 Render에 PostgreSQL 데이터베이스와 함께 배포하는 방법을 설명합니다.

## 1. Render 계정 준비

1. [Render](https://render.com)에 가입하거나 로그인합니다.
2. GitHub 계정을 연결합니다.

## 2. PostgreSQL 데이터베이스 생성

### 2.1 새 PostgreSQL 인스턴스 생성
1. Render 대시보드에서 **"New +"** 클릭
2. **"PostgreSQL"** 선택
3. 다음 정보 입력:
   - **Name**: `timesheet-db` (또는 원하는 이름)
   - **Database**: `timesheetapp`
   - **User**: `timesheetuser`
   - **Region**: 가장 가까운 지역 선택 (예: Singapore)
   - **PostgreSQL Version**: 최신 버전 선택
   - **Plan**: Free 플랜 선택

4. **"Create Database"** 클릭

### 2.2 데이터베이스 연결 정보 확인
데이터베이스가 생성되면 다음 정보를 확인하세요:
- **Internal Database URL**: 내부 연결용
- **External Database URL**: 외부 연결용 (로컬 개발 시 사용)

**Internal Database URL**을 복사해두세요. 형식:
\`\`\`
postgresql://username:password@dpg-xxxxx-a/database_name
\`\`\`

## 3. 웹 서비스 생성

### 3.1 새 웹 서비스 생성
1. Render 대시보드에서 **"New +"** 클릭
2. **"Web Service"** 선택
3. GitHub 저장소 연결
4. 저장소에서 `timesheet-app` 선택

### 3.2 서비스 설정
다음 정보를 입력합니다:

- **Name**: `inboundms` (또는 원하는 이름)
- **Region**: PostgreSQL과 같은 지역 선택
- **Branch**: `main` (또는 배포할 브랜치)
- **Root Directory**: (비워두기)
- **Runtime**: `Node`
- **Build Command**:
  \`\`\`bash
  pnpm install && pnpm prisma generate && pnpm prisma migrate deploy && pnpm build
  \`\`\`
- **Start Command**:
  \`\`\`bash
  pnpm start
  \`\`\`
- **Plan**: Free 플랜 선택

### 3.3 환경 변수 설정
**Environment Variables** 섹션에서 다음 변수들을 추가합니다:

#### 필수 환경 변수:
\`\`\`
DATABASE_URL=<2.2에서 복사한 Internal Database URL>
\`\`\`

#### 선택 환경 변수 (Twilio SMS 사용 시):
\`\`\`
TWILIO_ACCOUNT_SID=<your_twilio_sid>
TWILIO_AUTH_TOKEN=<your_twilio_token>
TWILIO_PHONE_NUMBER=<your_twilio_number>
NOTIFICATION_PHONE_NUMBER=<recipient_phone_number>
\`\`\`

4. **"Create Web Service"** 클릭

## 4. 배포 진행

Render가 자동으로 다음 작업을 수행합니다:
1. 코드를 GitHub에서 가져옵니다
2. 의존성을 설치합니다 (`pnpm install`)
3. Prisma Client를 생성합니다 (`prisma generate`)
4. 데이터베이스 마이그레이션을 실행합니다 (`prisma migrate deploy`)
5. Next.js 앱을 빌드합니다 (`pnpm build`)
6. 앱을 시작합니다 (`pnpm start`)

배포가 완료되면 (약 5-10분 소요) **"Live"** 상태로 변경되고 URL이 생성됩니다.

## 5. 로컬 환경에서 .env 파일 설정

로컬에서 개발할 때는 `.env` 파일을 생성하세요:

\`\`\`bash
# .env
DATABASE_URL="<External Database URL>"

# Twilio (Optional)
TWILIO_ACCOUNT_SID="your_sid"
TWILIO_AUTH_TOKEN="your_token"
TWILIO_PHONE_NUMBER="+1234567890"
NOTIFICATION_PHONE_NUMBER="+1234567890"
\`\`\`

## 6. 로컬 개발 시 데이터베이스 마이그레이션

\`\`\`bash
# Prisma Client 생성
pnpm prisma generate

# 마이그레이션 실행
pnpm prisma migrate deploy

# (개발 중) 마이그레이션 생성
pnpm prisma migrate dev --name init
\`\`\`

## 7. 데이터베이스 관리

### Prisma Studio로 데이터 확인
\`\`\`bash
pnpm prisma studio
\`\`\`

브라우저에서 `http://localhost:5555` 열어서 데이터를 시각적으로 확인/수정할 수 있습니다.

### 데이터베이스 초기화 (주의!)
\`\`\`bash
# 모든 데이터 삭제 후 재생성
pnpm prisma migrate reset
\`\`\`

## 8. 배포 후 확인 사항

1. ✅ 웹사이트가 정상적으로 로드되는지 확인
2. ✅ Schedule 데이터를 추가하고 새로고침 후에도 유지되는지 확인
3. ✅ Location 설정이 저장되는지 확인
4. ✅ Timesheet 입력이 저장되는지 확인

## 9. 업데이트 배포

코드를 수정하고 GitHub에 푸시하면 Render가 자동으로 재배포합니다:

\`\`\`bash
git add .
git commit -m "Update features"
git push origin main
\`\`\`

## 10. 문제 해결

### 배포 실패 시
1. Render 대시보드에서 **Logs** 확인
2. Build Command가 정확한지 확인
3. 환경 변수가 올바르게 설정되었는지 확인

### 데이터베이스 연결 오류
1. `DATABASE_URL`이 올바른지 확인
2. PostgreSQL 인스턴스가 "Available" 상태인지 확인
3. 같은 Region에 배포되었는지 확인

### 마이그레이션 오류
1. Render 대시보드에서 **Shell** 열기
2. 다음 명령어 실행:
   \`\`\`bash
   pnpm prisma migrate deploy
   \`\`\`

## 11. 비용 및 제한사항

### Free Tier 제한:
- **PostgreSQL**: 1GB 저장소, 90일 후 삭제
- **Web Service**: 750시간/월, 15분 비활동 후 슬립 모드

### 슬립 모드 방지:
무료 플랜에서는 15분 동안 요청이 없으면 서비스가 슬립 모드로 전환됩니다.
- 첫 번째 요청 시 30초 정도 로딩 시간 발생
- UptimeRobot 등의 모니터링 서비스 사용 고려

## 12. 프로덕션 권장사항

실제 운영 환경에서는 유료 플랜 사용을 권장합니다:
- **PostgreSQL**: Standard 플랜 ($7/월)
- **Web Service**: Starter 플랜 ($7/월)
- 자동 백업 및 복구 기능
- 슬립 모드 없음
- 더 많은 리소스

## 지원

문제가 발생하면:
1. [Render 문서](https://render.com/docs)
2. [Prisma 문서](https://www.prisma.io/docs)
3. [Next.js 배포 가이드](https://nextjs.org/docs/deployment)


