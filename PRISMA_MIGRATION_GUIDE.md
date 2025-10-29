# Prisma Migration 가이드

## 📚 목차
1. [기본 개념](#기본-개념)
2. [로컬 개발](#로컬-개발)
3. [프로덕션 배포](#프로덕션-배포)
4. [자주 사용하는 명령어](#자주-사용하는-명령어)
5. [문제 해결](#문제-해결)

---

## 기본 개념

### Prisma Migration이란?
- 데이터베이스 스키마 변경을 **버전 관리**하는 시스템
- `schema.prisma` 파일의 변경사항을 SQL로 변환
- 팀원들과 DB 스키마를 **동기화**

### Migration 파일 위치
```
backend/
  ├── prisma/
  │   ├── schema.prisma          ← 스키마 정의
  │   └── migrations/            ← 마이그레이션 히스토리
  │       ├── 20250122000000_init/
  │       │   └── migration.sql
  │       └── migration_lock.toml
```

---

## 로컬 개발

### 1. Schema 수정

`backend/prisma/schema.prisma` 파일을 수정합니다.

**예시 1: 새 필드 추가**
```prisma
model Schedule {
  id              String   @id @default(cuid())
  date            String
  appointmentTime String
  locationId      String
  clientName      String
  phoneNumber     String
  serviceType     String
  notes           String?
  dock            String?  // ← 새로 추가
  checkInTime     String?  // ← 새로 추가
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([date])
  @@index([appointmentTime])
}
```

**예시 2: 새 모델 추가**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2. 마이그레이션 생성 및 적용

```bash
cd backend

# 마이그레이션 생성 (변경사항을 설명하는 이름 사용)
pnpm prisma migrate dev --name add_dock_and_checkin_to_schedule

# 또는
pnpm prisma migrate dev --name add_user_model

# 또는
pnpm prisma migrate dev --name update_location_status_enum
```

**이 명령어는 자동으로:**
1. ✅ 스키마 변경 감지
2. ✅ `migrations/` 폴더에 새 마이그레이션 파일 생성
3. ✅ 로컬 PostgreSQL에 자동 적용
4. ✅ Prisma Client 재생성 (`@prisma/client`)

### 3. 결과 확인

```bash
# 생성된 마이그레이션 파일 확인
ls backend/prisma/migrations/

# 출력 예시:
# 20250122000000_init/
# 20250123140530_add_dock_and_checkin_to_schedule/  ← 새로 생성됨

# 마이그레이션 SQL 확인
cat backend/prisma/migrations/20250123140530_add_dock_and_checkin_to_schedule/migration.sql
```

**마이그레이션 SQL 예시:**
```sql
-- AlterTable
ALTER TABLE "Schedule" 
ADD COLUMN "dock" TEXT,
ADD COLUMN "checkInTime" TEXT;
```

### 4. Prisma Studio로 확인 (선택사항)

```bash
cd backend
pnpm prisma studio
```

브라우저에서 `http://localhost:5555` 열림 → DB 데이터 확인 가능

---

## 프로덕션 배포

### 1. GitHub에 푸시

```bash
# 변경사항 확인
git status

# 마이그레이션 파일과 스키마 파일 추가
git add backend/prisma/schema.prisma
git add backend/prisma/migrations/

# 커밋
git commit -m "feat: Add dock and checkInTime fields to Schedule model"

# 푸시
git push origin main
```

### 2. Render 자동 배포

Render가 다음을 자동으로 실행:

```bash
# 1. 의존성 설치
pnpm install
  └─> postinstall: prisma generate

# 2. 마이그레이션 적용
pnpm prisma migrate deploy
  └─> 모든 pending 마이그레이션 적용

# 3. 빌드
pnpm build

# 4. 서버 시작
pnpm start:prod
```

### 3. 배포 로그 확인

Render 대시보드 → Backend 서비스 → **Logs** 탭:

```
✅ 정상 로그:
==> Running 'pnpm install'
==> Running postinstall script
✔ Generated Prisma Client
==> Running 'pnpm prisma migrate deploy'
✔ 1 migration applied: 
   └─ 20250123140530_add_dock_and_checkin_to_schedule
==> Build complete
✅ Database connected
```

---

## 자주 사용하는 명령어

### 개발 환경

```bash
cd backend

# 1. 마이그레이션 생성 + 적용 (개발용)
pnpm prisma migrate dev --name migration_name

# 2. Prisma Client만 재생성 (스키마 변경 없이)
pnpm prisma generate

# 3. DB 초기화 (경고: 모든 데이터 삭제!)
pnpm prisma migrate reset

# 4. Prisma Studio 실행 (DB GUI)
pnpm prisma studio

# 5. 마이그레이션 상태 확인
pnpm prisma migrate status

# 6. 스키마 포맷팅
pnpm prisma format
```

### 프로덕션 환경

```bash
# Render Build Command에서 자동 실행됨
pnpm prisma migrate deploy

# 수동 실행이 필요한 경우 (Render 콘솔에서)
cd backend && pnpm prisma migrate deploy
```

---

## 문제 해결

### 1. "Migration failed" 에러

**원인**: 마이그레이션 충돌 또는 스키마 오류

**해결**:
```bash
# 마이그레이션 상태 확인
cd backend
pnpm prisma migrate status

# 문제가 있는 마이그레이션 삭제
rm -rf prisma/migrations/20250123xxxxxx_problematic_migration

# 다시 생성
pnpm prisma migrate dev --name fixed_migration
```

### 2. "Prisma Client is out of sync"

**원인**: Prisma Client가 재생성되지 않음

**해결**:
```bash
cd backend
pnpm prisma generate
```

### 3. 로컬 DB와 스키마가 맞지 않음

**원인**: 마이그레이션이 적용되지 않음

**해결**:
```bash
cd backend

# 옵션 A: 모든 마이그레이션 재적용
pnpm prisma migrate deploy

# 옵션 B: DB 초기화 (데이터 삭제!)
pnpm prisma migrate reset
```

### 4. Render 배포 시 마이그레이션 실패

**원인**: DATABASE_URL이 잘못되었거나 DB 연결 실패

**해결**:
1. Render 대시보드 → Backend 서비스
2. **Environment** 탭에서 `DATABASE_URL` 확인
3. PostgreSQL **Internal URL** 사용 확인
4. Render PostgreSQL이 **Available** 상태인지 확인

### 5. 여러 사람이 동시에 마이그레이션 생성

**문제**: Git 충돌 발생

**해결**:
```bash
# 1. 최신 코드 pull
git pull origin main

# 2. 충돌 해결 후
cd backend
pnpm prisma migrate dev

# 3. Prisma가 자동으로 순서 조정
```

---

## 실전 예제

### 예제 1: Schedule에 dock 필드 추가

#### Step 1: Schema 수정
```prisma
model Schedule {
  // ... 기존 필드들
  dock            String?  // ← 추가
  // ...
}
```

#### Step 2: 마이그레이션 생성
```bash
cd backend
pnpm prisma migrate dev --name add_dock_to_schedule
```

#### Step 3: Git 커밋
```bash
git add backend/prisma/
git commit -m "feat: Add dock field to Schedule model"
git push
```

### 예제 2: 새 User 모델 추가

#### Step 1: Schema에 모델 추가
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}
```

#### Step 2: 마이그레이션 생성
```bash
cd backend
pnpm prisma migrate dev --name add_user_model
```

#### Step 3: Controller/Service 생성
```bash
cd backend
nest g module user
nest g controller user
nest g service user
```

### 예제 3: Location 모델 수정

#### Step 1: Enum 타입으로 변경
```prisma
enum LocationStatus {
  AVAILABLE
  DISABLED
  MAINTENANCE
}

model Location {
  id        String         @id
  status    LocationStatus @default(AVAILABLE)  // ← 변경
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt
}
```

#### Step 2: 마이그레이션 생성
```bash
cd backend
pnpm prisma migrate dev --name change_location_status_to_enum
```

---

## 베스트 프랙티스

### 1. 마이그레이션 이름 규칙
```bash
✅ 좋은 예:
add_dock_field_to_schedule
create_user_table
update_location_status_enum
add_email_unique_constraint

❌ 나쁜 예:
update
change
fix
test
```

### 2. 마이그레이션 생성 시점
- ✅ 기능 완성 후 한 번에
- ❌ 작은 변경마다 여러 번

### 3. 데이터 손실 방지
```bash
# 필드 삭제 전 백업
# Optional 필드로 먼저 변경
# 실제 삭제는 나중에
```

### 4. 프로덕션 배포 전 체크리스트
- [ ] 로컬에서 마이그레이션 테스트 완료
- [ ] 데이터 손실 가능성 확인
- [ ] Rollback 계획 수립
- [ ] 팀원들에게 공지

---

## 요약

### 로컬 개발
```bash
cd backend
pnpm prisma migrate dev --name describe_change
```

### 프로덕션 배포
```bash
git add backend/prisma/
git commit -m "Update database schema"
git push origin main
# Render가 자동으로 migrate deploy 실행
```

### 긴급 수동 배포
Render 콘솔 → Shell:
```bash
cd backend && pnpm prisma migrate deploy
```

---

**작성일**: 2025-10-22  
**Prisma Version**: 6.17.1  
**Database**: PostgreSQL


