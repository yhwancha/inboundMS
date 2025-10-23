# 배포 체크리스트

Vercel(Frontend) + Render(Backend) 배포를 위한 단계별 체크리스트입니다.

## 📋 배포 전 준비

### 1. GitHub 저장소 확인
- [ ] 코드가 GitHub에 푸시되어 있는지 확인
- [ ] `.env` 파일들이 `.gitignore`에 포함되어 있는지 확인
- [ ] 최신 변경사항이 모두 커밋되었는지 확인

### 2. 로컬 테스트
- [ ] Backend가 로컬에서 정상 작동하는지 확인 (`pnpm start:dev`)
- [ ] Frontend가 로컬에서 정상 작동하는지 확인 (`pnpm dev`)
- [ ] 모든 API 엔드포인트가 정상 작동하는지 확인
- [ ] 데이터베이스 마이그레이션이 최신인지 확인

---

## 🗄️ Step 1: Database 배포 (Render)

- [ ] Render 계정 생성/로그인
- [ ] PostgreSQL 인스턴스 생성
  - [ ] Name: `inboundms-db`
  - [ ] Region: Singapore (또는 가까운 지역)
  - [ ] Plan: Free
- [ ] **Internal Database URL** 복사 및 저장
- [ ] 데이터베이스 연결 테스트 (선택사항)

**Internal Database URL**:
```
postgresql://user:password@hostname/database
```

---

## 🔧 Step 2: Backend 배포 (Render)

### 2.1 서비스 생성
- [ ] Render에서 "New Web Service" 생성
- [ ] GitHub 저장소 연결
- [ ] 서비스 설정 입력:
  - [ ] Name: `inboundms-backend`
  - [ ] Root Directory: `backend`
  - [ ] Build Command: `pnpm install && pnpm prisma generate && pnpm prisma migrate deploy && pnpm build`
  - [ ] Start Command: `pnpm start:prod`

### 2.2 환경 변수 설정
- [ ] `DATABASE_URL` = (Step 1의 Internal Database URL)
- [ ] `PORT` = `3001`
- [ ] `NODE_ENV` = `production`
- [ ] `FRONTEND_URL` = `https://임시.vercel.app` (나중에 업데이트)

### 2.3 배포 및 확인
- [ ] "Create Web Service" 클릭
- [ ] 배포 완료 대기 (5-10분)
- [ ] 배포 로그에서 에러 확인
- [ ] Backend URL 복사: `https://your-backend.onrender.com`
- [ ] API 테스트:
  ```bash
  curl https://your-backend.onrender.com/api/settings
  ```

**Backend URL**: _______________________________

---

## 🎨 Step 3: Frontend 배포 (Vercel)

### 3.1 프로젝트 Import
- [ ] Vercel 계정 생성/로그인
- [ ] "Add New Project" 클릭
- [ ] GitHub 저장소 선택 및 Import

### 3.2 프로젝트 설정
- [ ] Framework: Next.js (자동 감지)
- [ ] Root Directory: `./` (루트)
- [ ] Build Command: 기본값 사용
- [ ] Output Directory: 기본값 사용

### 3.3 환경 변수 설정
- [ ] `BACKEND_URL` = `https://your-backend.onrender.com/api`
  - ⚠️ 주의: 끝에 `/api` 붙이기!

### 3.4 배포 및 확인
- [ ] "Deploy" 클릭
- [ ] 배포 완료 대기 (2-3분)
- [ ] 배포 로그에서 에러 확인
- [ ] Frontend URL 복사: `https://your-app.vercel.app`
- [ ] 브라우저에서 접속 테스트

**Frontend URL**: _______________________________

---

## 🔄 Step 4: 환경 변수 업데이트

### 4.1 Backend FRONTEND_URL 업데이트
- [ ] Render 대시보드 → Backend 서비스 선택
- [ ] "Environment" 탭 클릭
- [ ] `FRONTEND_URL` 값을 Vercel URL로 변경
- [ ] "Save Changes" (자동 재배포됨)
- [ ] 재배포 완료 대기

---

## ✅ Step 5: 전체 테스트

### 5.1 Frontend 페이지 테스트
- [ ] Home 페이지 (`/`)
- [ ] Location 페이지 (`/location`)
  - [ ] Location 목록 로드 확인
  - [ ] Location 상태 변경 테스트
- [ ] Schedule Excel 페이지 (`/schedule-excel`)
  - [ ] Excel 파일 업로드 테스트
- [ ] Schedule 페이지 (`/schedule`)
  - [ ] Schedule 목록 로드 확인
- [ ] Checkin 페이지 (`/checkin`)
  - [ ] 체크인 데이터 로드 확인
- [ ] Settings 페이지 (`/settings`)
  - [ ] 설정 저장 테스트
- [ ] History 페이지 (`/history`)
  - [ ] Timesheet 기록 확인

### 5.2 Backend API 테스트
```bash
# Settings
curl https://your-backend.onrender.com/api/settings

# Locations
curl https://your-backend.onrender.com/api/location

# Schedules
curl https://your-backend.onrender.com/api/schedule

# Timesheet
curl https://your-backend.onrender.com/api/timesheet
```

- [ ] Settings API 응답 확인
- [ ] Location API 응답 확인
- [ ] Schedule API 응답 확인
- [ ] Timesheet API 응답 확인

### 5.3 통합 테스트
- [ ] Frontend에서 데이터 생성 → Backend에 저장 확인
- [ ] Frontend에서 데이터 수정 → Backend에 반영 확인
- [ ] Frontend에서 데이터 삭제 → Backend에서 삭제 확인
- [ ] 페이지 새로고침 → 데이터 유지 확인

---

## 📊 Step 6: 모니터링 설정 (선택사항)

### 6.1 Vercel Analytics
- [ ] Vercel 대시보드 → 프로젝트 선택
- [ ] "Analytics" 탭 활성화

### 6.2 Render Monitoring
- [ ] Render 대시보드 → 서비스 선택
- [ ] "Metrics" 탭에서 성능 확인

---

## 🐛 문제 해결

### Backend 응답 없음
- [ ] Render 서비스 로그 확인
- [ ] DATABASE_URL 연결 확인
- [ ] 15분 sleep 시 30초 대기

### Frontend CORS 에러
- [ ] Backend의 FRONTEND_URL 확인
- [ ] URL 끝의 슬래시 제거 확인
- [ ] Render 서비스 재배포

### Build 실패
- [ ] 환경 변수 모두 설정되었는지 확인
- [ ] Build 로그에서 에러 메시지 확인
- [ ] Node.js 버전 확인

---

## 📝 배포 정보 기록

### Database
- **Platform**: Render PostgreSQL
- **Region**: _______________
- **URL**: _______________

### Backend
- **Platform**: Render
- **Region**: _______________
- **URL**: _______________
- **Git Branch**: main

### Frontend
- **Platform**: Vercel
- **Region**: Auto (Global CDN)
- **URL**: _______________
- **Git Branch**: main

---

## 🎉 배포 완료!

- [ ] 모든 테스트 통과
- [ ] URL을 팀원들과 공유
- [ ] 문서 업데이트
- [ ] GitHub README에 배포 URL 추가

---

## 📚 추가 작업 (선택사항)

### 커스텀 도메인 설정
- [ ] Vercel에서 커스텀 도메인 추가
- [ ] DNS 설정 (A 레코드 또는 CNAME)
- [ ] SSL 인증서 자동 적용 확인
- [ ] Backend의 FRONTEND_URL을 커스텀 도메인으로 업데이트

### 모니터링 및 알림
- [ ] Sentry 설정 (에러 트래킹)
- [ ] LogRocket 설정 (사용자 세션 기록)
- [ ] Uptime 모니터링 (UptimeRobot 등)

### 성능 최적화
- [ ] Next.js Image Optimization 활성화
- [ ] Vercel Analytics 검토
- [ ] Database 인덱스 최적화
- [ ] API 응답 캐싱 구현

---

**배포 완료일**: _______________  
**배포자**: _______________  
**버전**: _______________

