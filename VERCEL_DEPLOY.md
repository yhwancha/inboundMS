# Vercel 배포 가이드

이 가이드는 InboundMS 애플리케이션을 Vercel(Frontend)과 Render(Backend)에 배포하는 방법을 설명합니다.

## 🏗️ 배포 아키텍처

```
┌─────────────────────────────────────┐
│   Frontend (Next.js)                │
│   📍 Vercel                         │
│   https://your-app.vercel.app       │
└──────────────┬──────────────────────┘
               │ API Calls
               │
┌──────────────▼──────────────────────┐
│   Backend (NestJS)                  │
│   📍 Render (또는 Railway)          │
│   https://your-api.onrender.com     │
└──────────────┬──────────────────────┘
               │ SQL Queries
               │
┌──────────────▼──────────────────────┐
│   PostgreSQL Database               │
│   📍 Render PostgreSQL              │
└─────────────────────────────────────┘
```

**왜 이렇게 분리하나요?**
- ✅ **Vercel**: Next.js에 최적화, 빠른 글로벌 CDN, 무료 플랜
- ✅ **Render**: Node.js 서버에 적합, PostgreSQL 무료 제공, 24/7 실행

## 📋 배포 순서

1. **PostgreSQL 데이터베이스** 생성 (Render)
2. **Backend API** 배포 (Render)
3. **Frontend** 배포 (Vercel)
4. **환경 변수** 업데이트

---

## Step 1: PostgreSQL 데이터베이스 생성 (Render)

### 1.1 Render 계정 준비
1. [Render](https://render.com)에 가입/로그인
2. GitHub 계정 연결

### 1.2 PostgreSQL 인스턴스 생성
1. Render 대시보드에서 **"New +"** → **"PostgreSQL"** 클릭
2. 다음 정보 입력:
   ```
   Name: inboundms-db
   Database: inboundms
   User: inboundms_user
   Region: Singapore (또는 가까운 지역)
   PostgreSQL Version: 16
   Plan: Free
   ```
3. **"Create Database"** 클릭

### 1.3 연결 정보 복사
- **Internal Database URL** 복사 (백엔드에서 사용)
- 형식: `postgresql://user:password@hostname/database`

---

## Step 2: Backend API 배포 (Render)

### 2.1 새 웹 서비스 생성
1. Render 대시보드에서 **"New +"** → **"Web Service"** 클릭
2. GitHub 저장소 연결

### 2.2 서비스 설정
```yaml
Name: inboundms-backend
Region: Singapore (DB와 동일)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: pnpm install && pnpm prisma generate && pnpm prisma migrate deploy && pnpm build
Start Command: pnpm start:prod
Plan: Free
```

### 2.3 환경 변수 설정
**Environment Variables** 섹션에 추가:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `<Internal Database URL>` (Step 1.3에서 복사한 URL) |
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://your-app.vercel.app` (나중에 업데이트) |

### 2.4 배포
1. **"Create Web Service"** 클릭
2. 배포 완료 대기 (약 5-10분)
3. 백엔드 URL 복사: `https://inboundms-backend.onrender.com`

### 2.5 API 테스트
배포 완료 후 터미널에서 테스트:
```bash
curl https://your-backend-url.onrender.com/api/settings
```

**⚠️ 중요**: Render 무료 플랜은 15분간 요청이 없으면 sleep 모드로 전환됩니다. 첫 요청 시 30초 정도 소요될 수 있습니다.

---

## Step 3: Frontend 배포 (Vercel)

### 3.1 Vercel 계정 준비
1. [Vercel](https://vercel.com)에 가입/로그인
2. GitHub 계정 연결

### 3.2 프로젝트 Import
1. Vercel 대시보드에서 **"Add New..."** → **"Project"** 클릭
2. GitHub에서 `inboundMS` 저장소 선택
3. **"Import"** 클릭

### 3.3 프로젝트 설정
```yaml
Framework Preset: Next.js
Root Directory: ./  (루트)
Build Command: pnpm build  (기본값)
Output Directory: .next  (기본값)
Install Command: pnpm install  (기본값)
```

### 3.4 환경 변수 설정
**Environment Variables** 섹션에 추가:

| Name | Value |
|------|-------|
| `BACKEND_URL` | `https://your-backend-url.onrender.com/api` |

**⚠️ 주의**: Step 2.4에서 복사한 백엔드 URL 뒤에 `/api`를 붙여야 합니다!

### 3.5 배포
1. **"Deploy"** 클릭
2. 배포 완료 대기 (약 2-3분)
3. 배포된 URL 복사: `https://your-app.vercel.app`

---

## Step 4: 환경 변수 업데이트

### 4.1 Backend의 FRONTEND_URL 업데이트
1. Render 대시보드 → 백엔드 서비스 선택
2. **Environment** 탭 클릭
3. `FRONTEND_URL` 값을 Vercel URL로 업데이트:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
4. **"Save Changes"** 클릭
5. 자동으로 재배포됩니다

### 4.2 CORS 확인
Backend의 `main.ts`에서 CORS가 올바르게 설정되어 있는지 확인:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
});
```

---

## ✅ 배포 완료 확인

### Frontend 테스트
1. Vercel URL 접속: `https://your-app.vercel.app`
2. 각 페이지 확인:
   - `/location` - Location 관리
   - `/schedule` - Schedule 관리
   - `/schedule-excel` - Excel 업로드
   - `/checkin` - 체크인
   - `/settings` - 설정
   - `/history` - 기록

### Backend API 테스트
```bash
# Settings
curl https://your-backend-url.onrender.com/api/settings

# Locations
curl https://your-backend-url.onrender.com/api/location

# Schedules
curl https://your-backend-url.onrender.com/api/schedule

# Timesheet
curl https://your-backend-url.onrender.com/api/timesheet
```

---

## 🔧 환경 변수 요약

### Frontend (Vercel)
```env
BACKEND_URL=https://your-backend-url.onrender.com/api
```

### Backend (Render)
```env
DATABASE_URL=postgresql://user:password@hostname/database
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

---

## 🚀 배포 후 업데이트

### Frontend 업데이트
1. GitHub에 코드 푸시
2. Vercel이 자동으로 배포 (Git push 감지)

### Backend 업데이트
1. GitHub에 코드 푸시
2. Render가 자동으로 배포 (Git push 감지)

### 데이터베이스 마이그레이션
새로운 Prisma 마이그레이션이 있을 때:
```bash
# 로컬에서 마이그레이션 생성
cd backend
pnpm prisma migrate dev --name your_migration_name

# GitHub에 푸시
git add .
git commit -m "Add database migration"
git push
```

Render에서 자동으로 `prisma migrate deploy`가 실행됩니다.

---

## 🐛 트러블슈팅

### 1. Backend가 응답하지 않음
**원인**: Render 무료 플랜의 sleep 모드  
**해결**: 첫 요청 시 30초 정도 대기, 또는 Keep-alive 서비스 사용

### 2. CORS 에러
**원인**: FRONTEND_URL 설정 오류  
**해결**: 
- Backend 환경 변수에서 `FRONTEND_URL` 확인
- Vercel URL과 정확히 일치하는지 확인 (마지막 슬래시 제거)

### 3. Database 연결 실패
**원인**: DATABASE_URL 오류  
**해결**:
- Render PostgreSQL의 **Internal Database URL** 사용
- 연결 문자열 형식 확인

### 4. Build 실패 (Frontend)
**원인**: 환경 변수 누락  
**해결**:
- Vercel에서 `BACKEND_URL` 환경 변수 확인
- Build & Development에서 모두 설정되어 있는지 확인

### 5. API 호출 실패
**원인**: BACKEND_URL에 `/api` 누락  
**해결**:
```env
# ❌ 틀림
BACKEND_URL=https://your-backend-url.onrender.com

# ✅ 맞음
BACKEND_URL=https://your-backend-url.onrender.com/api
```

---

## 💰 비용

### Render (무료 플랜)
- PostgreSQL: 1GB 스토리지
- Backend: 750시간/월
- **제한사항**:
  - 15분 비활성 시 sleep 모드
  - 월 750시간 (약 31일)

### Vercel (무료 플랜)
- Frontend: 무제한 배포
- **제한사항**:
  - 대역폭: 100GB/월
  - 빌드 시간: 6000분/월

### 🔥 프로덕션 권장사항
실제 서비스에는 유료 플랜 권장:
- **Render**: $7/월 (sleep 없음)
- **Vercel**: $20/월 (더 많은 리소스)

---

## 📚 추가 자료

- [Vercel 문서](https://vercel.com/docs)
- [Render 문서](https://render.com/docs)
- [Prisma 배포 가이드](https://www.prisma.io/docs/guides/deployment)

---

## 🎉 완료!

배포가 완료되었습니다! 이제 전 세계 어디서나 애플리케이션에 접근할 수 있습니다.

**Frontend**: `https://your-app.vercel.app`  
**Backend API**: `https://your-backend-url.onrender.com/api`  
**Database**: Render PostgreSQL

---

**작성일**: 2025-10-22  
**업데이트**: Vercel + Render 배포 구조

