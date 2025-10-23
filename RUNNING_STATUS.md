# 🎉 InboundMS - 실행 중

## 현재 상태

✅ **Backend API** (NestJS) - 실행 중  
- URL: http://localhost:3001/api
- Database: PostgreSQL (Render External)
- Status: ✅ Connected and Running

✅ **Frontend** (Next.js) - 실행 중  
- URL: http://localhost:3000
- Proxy: ✅ Connected to Backend
- Status: ✅ Running

## API 테스트 결과

### ✅ Settings API
```bash
GET /api/settings
```
- Status: ✅ Working
- Data: Settings created and retrieved

### ✅ Location API
```bash
GET /api/location
POST /api/location
PUT /api/location
```
- Status: ✅ Working
- Test Data:
  - LOC001 (Active)
  - LOC002 (Inactive)

### ✅ Timesheet API
```bash
GET /api/timesheet
POST /api/timesheet
PUT /api/timesheet/:id
DELETE /api/timesheet/:id
```
- Status: ✅ Working
- Test Data: Created and retrieved successfully

### ✅ Schedule API
```bash
GET /api/schedule?date=2025-01-22
POST /api/schedule
PUT /api/schedule/:id
DELETE /api/schedule/:id
```
- Status: ✅ Working
- Test Data: CRUD operations all successful

## 데이터 흐름

```
Browser (http://localhost:3000)
    ↓
Next.js Frontend
    ↓
API Proxy (/api/*)
    ↓
NestJS Backend (http://localhost:3001/api)
    ↓
Prisma ORM
    ↓
PostgreSQL (Render External)
    ✅ dpg-d3sm9n1r0fns738jrk1g-a.oregon-postgres.render.com
```

## 환경 변수

### Frontend (.env.local)
```env
BACKEND_URL=http://localhost:3001/api
```

### Backend (backend/.env)
```env
DATABASE_URL="postgresql://inboundms_user:***@dpg-d3sm9n1r0fns738jrk1g-a.oregon-postgres.render.com/inboundms"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 접속 방법

1. **Frontend 웹사이트**
   - 브라우저에서 http://localhost:3000 접속
   - 모든 페이지가 Backend API와 연결되어 작동

2. **Backend API 직접 접근** (테스트용)
   ```bash
   # Settings 조회
   curl http://localhost:3001/api/settings
   
   # Locations 조회
   curl http://localhost:3001/api/location
   
   # Schedules 조회
   curl http://localhost:3001/api/schedule
   
   # Timesheets 조회
   curl http://localhost:3001/api/timesheet
   ```

3. **Frontend를 통한 API 접근** (프록시)
   ```bash
   # Frontend API proxy를 통해 Backend 호출
   curl http://localhost:3000/api/settings
   curl http://localhost:3000/api/location
   curl http://localhost:3000/api/schedule
   curl http://localhost:3000/api/timesheet
   ```

## 데이터베이스 확인

### Prisma Studio 실행
```bash
cd backend
pnpm prisma:studio
```
- URL: http://localhost:5555
- GUI로 데이터 확인 및 수정 가능

## 서버 중지

### Backend 중지
```bash
# Backend 프로세스 찾기
lsof -ti:3001 | xargs kill -9
```

### Frontend 중지
```bash
# Frontend 프로세스 찾기
lsof -ti:3000 | xargs kill -9
```

## 서버 재시작

### Backend 재시작
```bash
cd backend
pnpm start:dev
```

### Frontend 재시작
```bash
cd /Users/ycha/Desktop/FNS/inboundMS
pnpm dev
```

## 다음 단계

### 1. Frontend 페이지 확인
- http://localhost:3000 - 홈페이지
- http://localhost:3000/schedule - 스케줄 관리
- http://localhost:3000/checkin - 체크인
- http://localhost:3000/location - 로케이션 관리
- http://localhost:3000/settings - 설정

### 2. 데이터 입력
- 웹 인터페이스를 통해 실제 데이터 입력
- Excel 파일 업로드 테스트
- PDF 생성 테스트

### 3. 기능 테스트
- [ ] Schedule 업로드 (Excel)
- [ ] Timesheet 입력 및 PDF 생성
- [ ] Location 상태 변경
- [ ] Settings 업데이트 (로고, 이미지)

## 문제 해결

### Backend 연결 실패
```bash
# Backend가 실행 중인지 확인
curl http://localhost:3001/api/settings

# 실행되지 않으면 재시작
cd backend
pnpm start:dev
```

### Frontend 연결 실패
```bash
# Frontend가 실행 중인지 확인
curl http://localhost:3000

# 실행되지 않으면 재시작
pnpm dev
```

### 데이터베이스 연결 실패
```bash
# DATABASE_URL 확인
cat backend/.env

# Prisma 재생성
cd backend
pnpm prisma generate
```

## 현재 데이터베이스 상태

### Tables
- ✅ Settings (1 row)
- ✅ Location (2 rows)
- ✅ TimesheetEntry (1 row)
- ✅ Schedule (1 row - 1개 삭제 후)

### 생성된 테스트 데이터
- Settings: Default settings created
- Locations: LOC001 (Active), LOC002 (Inactive)
- Timesheet: John Doe - 2025-01-22 (8 hours)
- Schedule: Bob Johnson - 2025-01-22 14:00

---

**Last Updated:** 2025-10-22 23:31:51  
**Status:** ✅ All Systems Operational

