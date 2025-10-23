# InboundMS 아키텍처 문서

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                      Client (Browser)                    │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/HTTPS
                   ▼
┌─────────────────────────────────────────────────────────┐
│             Frontend (Next.js 14)                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Pages:                                           │  │
│  │  - Schedule Management                            │  │
│  │  - Timesheet Tracking                             │  │
│  │  - Location Management                            │  │
│  │  - Settings                                       │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  API Proxy Routes (/api/*)                       │  │
│  │  - Forward requests to Backend                    │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP (BACKEND_URL)
                   ▼
┌─────────────────────────────────────────────────────────┐
│             Backend (NestJS 10)                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  REST API (/api/*)                               │  │
│  │  ┌────────────┬────────────┬─────────────────┐  │  │
│  │  │ Settings   │ Timesheet  │ Location        │  │  │
│  │  │ Module     │ Module     │ Module          │  │  │
│  │  └────────────┴────────────┴─────────────────┘  │  │
│  │  ┌────────────┬────────────┬─────────────────┐  │  │
│  │  │ Schedule   │ Prisma     │ Config          │  │  │
│  │  │ Module     │ Module     │ Module          │  │  │
│  │  └────────────┴────────────┴─────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────────┘
                   │ Prisma ORM
                   ▼
┌─────────────────────────────────────────────────────────┐
│          Database (PostgreSQL)                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Tables:                                          │  │
│  │  - Settings                                       │  │
│  │  - TimesheetEntry                                 │  │
│  │  - Location                                       │  │
│  │  - Schedule                                       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 폴더 구조

```
inboundMS/
├── app/                          # Next.js App Router
│   ├── api/                      # API Proxy Routes
│   │   ├── location/
│   │   │   └── route.ts          # Proxy to /api/location
│   │   ├── schedule/
│   │   │   └── route.ts          # Proxy to /api/schedule
│   │   ├── settings/
│   │   │   └── route.ts          # Proxy to /api/settings
│   │   └── timesheet/
│   │       └── route.ts          # Proxy to /api/timesheet
│   ├── checkin/                  # Check-in page
│   ├── schedule/                 # Schedule pages
│   ├── location/                 # Location page
│   └── settings/                 # Settings page
│
├── backend/                      # NestJS Backend
│   ├── src/
│   │   ├── main.ts              # Application entry point
│   │   ├── app.module.ts        # Root module
│   │   │
│   │   ├── prisma/              # Prisma module
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   │
│   │   ├── settings/            # Settings module
│   │   │   ├── settings.module.ts
│   │   │   ├── settings.controller.ts
│   │   │   ├── settings.service.ts
│   │   │   └── dto/
│   │   │       └── update-settings.dto.ts
│   │   │
│   │   ├── timesheet/           # Timesheet module
│   │   │   ├── timesheet.module.ts
│   │   │   ├── timesheet.controller.ts
│   │   │   ├── timesheet.service.ts
│   │   │   └── dto/
│   │   │       ├── create-timesheet.dto.ts
│   │   │       └── update-timesheet.dto.ts
│   │   │
│   │   ├── location/            # Location module
│   │   │   ├── location.module.ts
│   │   │   ├── location.controller.ts
│   │   │   ├── location.service.ts
│   │   │   └── dto/
│   │   │       ├── initialize-locations.dto.ts
│   │   │       └── update-location.dto.ts
│   │   │
│   │   └── schedule/            # Schedule module
│   │       ├── schedule.module.ts
│   │       ├── schedule.controller.ts
│   │       ├── schedule.service.ts
│   │       └── dto/
│   │           ├── create-schedules.dto.ts
│   │           └── update-schedule.dto.ts
│   │
│   └── prisma/                  # Prisma schema & migrations
│       ├── schema.prisma        # Database schema
│       └── migrations/          # Migration files
│
├── components/                  # Shared React components
│   ├── ui/                     # shadcn/ui components
│   ├── date-picker.tsx
│   ├── email-dialog.tsx
│   └── sidebar.tsx
│
└── lib/                        # Utility libraries
    ├── excel-parser.ts
    ├── pdf-generator.ts
    ├── types.ts
    └── utils.ts
```

## 데이터 흐름

### 1. 사용자 요청 플로우

```
User Action (Frontend)
    ↓
Next.js Page Component
    ↓
Frontend API Call (fetch)
    ↓
Next.js API Proxy Route (/app/api/*)
    ↓
Backend API (NestJS) (/api/*)
    ↓
Controller (Validate & Route)
    ↓
Service (Business Logic)
    ↓
Prisma Service (ORM)
    ↓
PostgreSQL Database
    ↓
Response back through chain
```

### 2. 예시: Schedule 생성

```typescript
// 1. Frontend: User uploads Excel file
// app/schedule-excel/page.tsx
const uploadSchedule = async (schedules) => {
  const response = await fetch('/api/schedule', {
    method: 'POST',
    body: JSON.stringify({ schedules })
  });
}

// 2. Proxy: Forward to backend
// app/api/schedule/route.ts
export async function POST(request) {
  const response = await fetch(`${BACKEND_URL}/schedule`, {
    method: 'POST',
    body: await request.json()
  });
}

// 3. Backend: Receive and validate
// backend/src/schedule/schedule.controller.ts
@Post()
async createSchedules(@Body() dto: CreateSchedulesDto) {
  return this.scheduleService.createSchedules(dto);
}

// 4. Service: Business logic
// backend/src/schedule/schedule.service.ts
async createSchedules(dto: CreateSchedulesDto) {
  // Delete existing schedules for the date
  await this.prisma.schedule.deleteMany({ where: { date } });
  
  // Create new schedules
  return this.prisma.schedule.createMany({ data: schedules });
}

// 5. Prisma: Database query
// Automatically generated by Prisma Client
```

## API 엔드포인트

### Settings
- `GET /api/settings` - 설정 조회
- `PUT /api/settings` - 설정 업데이트

### Timesheet
- `GET /api/timesheet?date={date}` - 타임시트 조회
- `POST /api/timesheet` - 타임시트 생성
- `PUT /api/timesheet/:id` - 타임시트 수정
- `DELETE /api/timesheet/:id` - 타임시트 삭제

### Location
- `GET /api/location` - 로케이션 조회
- `POST /api/location` - 로케이션 초기화
- `PUT /api/location` - 로케이션 상태 업데이트

### Schedule
- `GET /api/schedule?date={date}` - 스케줄 조회
- `POST /api/schedule` - 스케줄 생성 (배치)
- `PUT /api/schedule/:id` - 스케줄 수정
- `DELETE /api/schedule/:id` - 스케줄 삭제

## 데이터베이스 스키마

### Settings
```sql
CREATE TABLE "Settings" (
    id TEXT PRIMARY KEY DEFAULT 'settings',
    logoUrl TEXT DEFAULT '',
    userImage TEXT DEFAULT '',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP
);
```

### TimesheetEntry
```sql
CREATE TABLE "TimesheetEntry" (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    employeeName TEXT NOT NULL,
    checkInTime TEXT NOT NULL,
    checkOutTime TEXT NOT NULL,
    location TEXT NOT NULL,
    totalHours FLOAT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP,
    INDEX idx_date (date)
);
```

### Location
```sql
CREATE TABLE "Location" (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP
);
```

### Schedule
```sql
CREATE TABLE "Schedule" (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    appointmentTime TEXT NOT NULL,
    locationId TEXT NOT NULL,
    clientName TEXT NOT NULL,
    phoneNumber TEXT NOT NULL,
    serviceType TEXT NOT NULL,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP,
    INDEX idx_date (date),
    INDEX idx_appointmentTime (appointmentTime)
);
```

## 보안 고려사항

### CORS (Cross-Origin Resource Sharing)
- Backend에서 Frontend URL만 허용
- 환경 변수로 관리: `FRONTEND_URL`

### 환경 변수
- 민감한 정보는 `.env` 파일로 관리
- Git에 커밋하지 않음 (`.gitignore`)

### 입력 검증
- NestJS `class-validator`로 DTO 검증
- 모든 API 입력값 검증

### 데이터베이스
- Prisma ORM으로 SQL Injection 방지
- Prepared statements 자동 사용

## 성능 최적화

### Frontend
- Next.js Static Generation (SSG)
- Image Optimization
- Code Splitting

### Backend
- 데이터베이스 인덱싱 (date, appointmentTime)
- Connection Pooling (Prisma)
- Caching 가능 (추후 Redis)

### Database
- 인덱스 최적화
- Query 최적화 (Prisma)

## 배포 전략

### 독립 배포
- Frontend와 Backend 개별 배포
- 각각 독립적으로 확장 가능

### 환경 분리
- Development (로컬)
- Staging (테스트)
- Production (Render)

### CI/CD
- Git push → 자동 배포 (Render)
- 개별 서비스 배포로 영향 최소화

## 확장성

### Horizontal Scaling
- Frontend: 정적 파일, 쉽게 확장
- Backend: Stateless API, 인스턴스 추가 가능
- Database: PostgreSQL replication

### Vertical Scaling
- 각 서비스 독립적으로 리소스 증설

### Future Enhancements
- Redis 캐싱 추가
- Message Queue (BullMQ)
- Microservices 분리
- GraphQL API
- Real-time WebSocket

## 모니터링 & 로깅

### 로그
- Frontend: Next.js 로그
- Backend: NestJS Logger
- Database: PostgreSQL 로그

### 에러 추적
- Try-catch 블록
- 에러 응답 표준화
- Sentry 통합 (추후)

### 성능 모니터링
- API 응답 시간
- 데이터베이스 쿼리 시간
- Render 대시보드 모니터링

