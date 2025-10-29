# Schedule List API 연동 완료

## 🎯 변경 사항 요약

Schedule List 페이지를 localStorage에서 Backend API로 완전히 마이그레이션했습니다.

---

## 📋 변경된 파일

### 1. `/app/schedule-list/page.tsx`
**Before (localStorage 사용):**
```typescript
// localStorage에서 데이터 가져오기
const storedList = localStorage.getItem('scheduleList')
const actualData = localStorage.getItem('confirmedScheduleData_${date}')
```

**After (API 사용):**
```typescript
// API에서 데이터 가져오기
const response = await fetch('/api/schedule')
const schedules = await response.json()

// 날짜별로 그룹화하여 표시
const dateGroups = {}
schedules.forEach(schedule => {
  if (!dateGroups[schedule.date]) {
    dateGroups[schedule.date] = []
  }
  dateGroups[schedule.date].push(schedule)
})
```

### 2. `/app/api/schedule/[id]/route.ts` (신규)
동적 라우트 생성 - RESTful DELETE/PUT 지원:
```typescript
DELETE /api/schedule/[id]  // 특정 스케줄 삭제
PUT    /api/schedule/[id]  // 특정 스케줄 수정
```

### 3. `/app/api/timesheet/[id]/route.ts` (신규)
Timesheet도 동일하게 동적 라우트 지원:
```typescript
DELETE /api/timesheet/[id]  // 특정 타임시트 삭제
PUT    /api/timesheet/[id]  // 특정 타임시트 수정
```

### 4. `/app/schedule/page.tsx`
날짜 필터링 지원 추가:
```typescript
// URL 파라미터에서 날짜 읽기
const dateParam = urlParams.get('date')
const url = dateParam 
  ? `/api/schedule?date=${dateParam}`
  : '/api/schedule'
```

---

## 🔄 데이터 흐름

### Before (localStorage 기반)
```
Schedule List Page
    ↓
localStorage.getItem('scheduleList')
    ↓
Local Storage
```

### After (API 기반)
```
Schedule List Page
    ↓
GET /api/schedule
    ↓
Backend NestJS API
    ↓
PostgreSQL Database
```

---

## 📊 주요 기능

### 1. 날짜별 스케줄 목록 표시
```typescript
// API에서 모든 스케줄 가져오기
const response = await fetch('/api/schedule')
const schedules = await response.json()

// 날짜별로 그룹화
Object.entries(dateGroups).map(([date, items]) => ({
  date: format(new Date(date), 'MM/dd/yyyy'),
  count: items.length,
  lastUpdated: format(latestUpdate, 'MM/dd/yyyy, hh:mm a')
}))
```

### 2. 특정 날짜 스케줄 보기
```typescript
// Schedule List에서 날짜 클릭 시
const handleViewSchedule = (date: string) => {
  router.push(`/schedule?date=${isoDate}`)
}

// Schedule 페이지에서
const dateParam = urlParams.get('date')
const url = `/api/schedule?date=${dateParam}`
```

### 3. 날짜별 스케줄 삭제
```typescript
// 해당 날짜의 모든 스케줄 조회
const response = await fetch(`/api/schedule?date=${isoDate}`)
const schedules = await response.json()

// 각 스케줄 삭제
await Promise.all(
  schedules.map(schedule =>
    fetch(`/api/schedule/${schedule.id}`, { method: 'DELETE' })
  )
)
```

---

## 🔧 API 엔드포인트

### Schedule API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/schedule` | 모든 스케줄 조회 |
| GET | `/api/schedule?date=2025-10-15` | 특정 날짜 스케줄 조회 |
| POST | `/api/schedule` | 스케줄 일괄 생성 |
| PUT | `/api/schedule/[id]` | 특정 스케줄 수정 |
| DELETE | `/api/schedule/[id]` | 특정 스케줄 삭제 |

### Timesheet API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/timesheet` | 모든 타임시트 조회 |
| GET | `/api/timesheet?date=2025-10-15` | 특정 날짜 타임시트 조회 |
| POST | `/api/timesheet` | 타임시트 생성 |
| PUT | `/api/timesheet/[id]` | 특정 타임시트 수정 |
| DELETE | `/api/timesheet/[id]` | 특정 타임시트 삭제 |

---

## ✅ 완료된 API 연동 페이지

1. ✅ **Location** (`/location`) - Backend API 사용
2. ✅ **Schedule Excel** (`/schedule-excel`) - Backend API 사용
3. ✅ **Schedule** (`/schedule`) - Backend API 사용 + 날짜 필터링
4. ✅ **Schedule List** (`/schedule-list`) - Backend API 사용 ⭐ NEW
5. ✅ **Checkin** (`/checkin`) - Backend API 사용
6. ✅ **Settings** (`/settings`) - Backend API 사용
7. ✅ **History** (`/history`) - Backend API 사용

---

## 🧪 테스트 방법

### 1. Schedule List 페이지 테스트
```bash
# 브라우저에서
http://localhost:3000/schedule-list
```

**확인 사항:**
- [ ] 날짜별 스케줄 목록이 표시됨
- [ ] 각 날짜의 아이템 개수가 정확함
- [ ] 마지막 업데이트 시간이 표시됨
- [ ] View 버튼 클릭 시 해당 날짜의 Schedule 페이지로 이동
- [ ] Delete 버튼 클릭 시 해당 날짜의 모든 스케줄 삭제

### 2. API 직접 테스트
```bash
# 모든 스케줄 조회
curl http://localhost:3001/api/schedule

# 특정 날짜 스케줄 조회
curl http://localhost:3001/api/schedule?date=2025-10-15

# 특정 스케줄 삭제
curl -X DELETE http://localhost:3001/api/schedule/{id}
```

---

## 🚀 배포 준비

### 환경 변수 확인

**Frontend (.env.local)**:
```env
BACKEND_URL=http://localhost:3001/api
```

**Backend (backend/.env)**:
```env
DATABASE_URL="postgresql://..."
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Git 커밋
```bash
git add .
git commit -m "feat: Migrate Schedule List to Backend API

- Replace localStorage with API calls
- Add dynamic routes for schedule/timesheet deletion
- Add date filtering support to Schedule page
- Group schedules by date in Schedule List"
git push origin main
```

---

## 📝 추가 개선 사항

### 1. 로딩 상태 개선
현재 로딩 중 표시가 있지만, Skeleton UI로 개선 가능:
```typescript
<Skeleton className="h-16 w-full" />
```

### 2. 에러 핸들링
API 에러 시 사용자 친화적인 메시지 표시:
```typescript
catch (error) {
  toast({
    title: "Error",
    description: "Failed to load schedules. Please try again.",
    variant: "destructive"
  })
}
```

### 3. 실시간 업데이트
WebSocket이나 Polling으로 자동 새로고침:
```typescript
setInterval(() => {
  loadScheduleList()
}, 30000) // 30초마다 새로고침
```

---

## 🎉 결과

### 이제 Schedule List 페이지는:
- ✅ **실시간 데이터** - Backend에서 최신 데이터 가져옴
- ✅ **데이터 영속성** - PostgreSQL에 안전하게 저장
- ✅ **동기화** - 다른 페이지와 데이터 일관성 유지
- ✅ **RESTful API** - 표준 HTTP 메서드 사용
- ✅ **날짜 필터링** - 특정 날짜 스케줄만 조회 가능

---

**작업 완료일**: 2025-10-22  
**변경 파일 수**: 4개  
**신규 파일**: 2개 (동적 라우트)  
**Status**: ✅ 완료


