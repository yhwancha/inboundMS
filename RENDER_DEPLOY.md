# Render 배포 가이드

이 가이드는 InboundMS 애플리케이션을 Render에 배포하는 방법을 설명합니다.

**참고:** 이 애플리케이션은 데이터베이스가 필요하지 않습니다. 모든 데이터는 인메모리 스토리지를 사용합니다.

## 1. Render 계정 준비

1. [Render](https://render.com)에 가입하거나 로그인합니다.
2. GitHub 계정을 연결합니다.

## 2. 웹 서비스 생성

### 2.1 새 웹 서비스 생성
1. Render 대시보드에서 **"New +"** 클릭
2. **"Web Service"** 선택
3. GitHub 저장소 연결
4. 저장소 선택

### 2.2 서비스 설정
다음 정보를 입력합니다:

- **Name**: `inboundms` (또는 원하는 이름)
- **Region**: 가장 가까운 지역 선택 (예: Singapore)
- **Branch**: `main` (또는 배포할 브랜치)
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
- **Plan**: Free 플랜 선택

### 2.3 환경 변수 설정 (선택사항)
**Environment Variables** 섹션에서 Twilio SMS를 사용하는 경우 다음 변수들을 추가합니다:

\`\`\`
TWILIO_ACCOUNT_SID=<your_twilio_sid>
TWILIO_AUTH_TOKEN=<your_twilio_token>
TWILIO_PHONE_NUMBER=<your_twilio_number>
NOTIFICATION_PHONE_NUMBER=<recipient_phone_number>
\`\`\`

4. **"Create Web Service"** 클릭

## 3. 배포 진행

Render가 자동으로 다음 작업을 수행합니다:
1. 코드를 GitHub에서 가져옵니다
2. 의존성을 설치합니다 (`pnpm install`)
3. Next.js 앱을 빌드합니다 (`pnpm build`)
4. 앱을 시작합니다 (`pnpm start`)

배포가 완료되면 (약 5-10분 소요) **"Live"** 상태로 변경되고 URL이 생성됩니다.

## 4. 로컬 환경에서 .env 파일 설정

로컬에서 개발할 때 Twilio를 사용하는 경우 `.env` 파일을 생성하세요:

\`\`\`bash
# .env
# Twilio (Optional)
TWILIO_ACCOUNT_SID="your_sid"
TWILIO_AUTH_TOKEN="your_token"
TWILIO_PHONE_NUMBER="+1234567890"
NOTIFICATION_PHONE_NUMBER="+1234567890"
\`\`\`

## 5. 배포 후 확인 사항

1. ✅ 웹사이트가 정상적으로 로드되는지 확인
2. ✅ Schedule 데이터를 추가할 수 있는지 확인
3. ✅ Location 설정이 작동하는지 확인
4. ✅ Timesheet 입력이 가능한지 확인

**중요:** 서버가 재시작되면 모든 데이터가 초기화됩니다. 이는 인메모리 스토리지의 특성입니다.

## 6. 업데이트 배포

코드를 수정하고 GitHub에 푸시하면 Render가 자동으로 재배포합니다:

\`\`\`bash
git add .
git commit -m "Update features"
git push origin main
\`\`\`

## 7. 문제 해결

### 배포 실패 시
1. Render 대시보드에서 **Logs** 확인
2. Build Command가 정확한지 확인
3. 환경 변수가 올바르게 설정되었는지 확인

### 빌드 오류
1. 로컬에서 `pnpm build`를 실행하여 빌드 오류 확인
2. 모든 의존성이 `package.json`에 올바르게 명시되어 있는지 확인

## 8. 비용 및 제한사항

### Free Tier 제한:
- **Web Service**: 750시간/월, 15분 비활동 후 슬립 모드

### 슬립 모드:
무료 플랜에서는 15분 동안 요청이 없으면 서비스가 슬립 모드로 전환됩니다.
- 첫 번째 요청 시 30초 정도 로딩 시간 발생
- 슬립 모드 후 재시작 시 데이터가 초기화됨
- UptimeRobot 등의 모니터링 서비스 사용 고려

## 9. 프로덕션 권장사항

실제 운영 환경에서는:
1. **유료 플랜 사용 권장**: Starter 플랜 ($7/월)
   - 슬립 모드 없음
   - 더 많은 리소스
2. **영구 저장소 구현**: 
   - 데이터베이스 추가 (PostgreSQL, MongoDB 등)
   - 파일 시스템 기반 스토리지
   - 외부 스토리지 서비스 (S3, Google Cloud Storage 등)

## 10. 데이터 영속성

현재 애플리케이션은 인메모리 데이터 저장소를 사용합니다. 영구적인 데이터 저장이 필요한 경우:

1. 데이터베이스 추가 (PostgreSQL, MySQL, MongoDB 등)
2. 파일 시스템 기반 스토리지 구현
3. 외부 스토리지 API 사용 (Supabase, Firebase 등)

## 지원

문제가 발생하면:
1. [Render 문서](https://render.com/docs)
2. [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
3. [pnpm 문서](https://pnpm.io/)


