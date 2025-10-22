# 환경 변수 설정 가이드

## 로컬 개발 환경 설정

### 1. `.env` 파일 생성 (선택사항)

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

\`\`\`env
# Twilio SMS (선택사항)
TWILIO_ACCOUNT_SID="your_account_sid"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"
NOTIFICATION_PHONE_NUMBER="+1234567890"
\`\`\`

**참고:** 이 애플리케이션은 데이터베이스가 필요하지 않습니다. 모든 데이터는 메모리에 저장됩니다.

### 2. 개발 서버 시작

\`\`\`bash
# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm dev
\`\`\`

브라우저에서 `http://localhost:3000` 접속

## Render 배포 환경 설정

### 1. Environment Variables 추가 (선택사항)

Render 웹 서비스 설정에서 다음 변수들을 추가:

#### Twilio SMS 사용 시:
\`\`\`
TWILIO_ACCOUNT_SID = <your_sid>
TWILIO_AUTH_TOKEN = <your_token>
TWILIO_PHONE_NUMBER = <your_number>
NOTIFICATION_PHONE_NUMBER = <recipient_number>
\`\`\`

### 2. Build Command

\`\`\`bash
pnpm install && pnpm build
\`\`\`

### 3. Start Command

\`\`\`bash
pnpm start
\`\`\`

## 데이터 저장 방식

이 애플리케이션은 인메모리 데이터 저장소를 사용합니다:
- 데이터베이스 설정 불필요
- 빠른 개발 및 배포
- **주의:** 서버 재시작 시 데이터가 초기화됩니다

프로덕션 환경에서 영구 저장이 필요한 경우, 파일 시스템 기반 스토리지나 데이터베이스를 추가로 구현해야 합니다.

## 보안 주의사항

1. ⚠️ `.env` 파일을 절대 Git에 커밋하지 마세요
2. ⚠️ Twilio 인증 정보를 안전하게 보관하세요
3. ⚠️ API 키를 공개 저장소에 노출하지 마세요

## 도움말

- [Next.js 문서](https://nextjs.org/docs)
- [Render 문서](https://render.com/docs)
- [Twilio 문서](https://www.twilio.com/docs)


