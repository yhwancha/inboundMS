# Render Database URL 가이드

## 🗄️ Internal vs External Database URL

Render PostgreSQL은 **2가지 연결 URL**을 제공합니다.

### 📊 비교표

| 항목 | Internal Database URL | External Database URL |
|------|----------------------|----------------------|
| **사용 대상** | Render 내 Backend 서비스 | 로컬 개발, 외부 서버 |
| **속도** | ⚡ 매우 빠름 | 🐢 느림 |
| **비용** | 💰 무료 | 💸 대역폭 비용 발생 가능 |
| **보안** | 🔒 내부 네트워크 (안전) | 🌐 인터넷 경유 |
| **위치** | Render 내부 | 인터넷을 통해 접속 |

### ✅ Internal Database URL 사용 (권장)

**언제**: Backend와 PostgreSQL이 **같은 Render 계정**에 있을 때

**형식**:
```
postgresql://user:password@dpg-xxxxx-a/database_name
```

**특징**:
- `dpg-xxxxx-a` 형태의 내부 호스트명
- Render 내부 네트워크를 통해 연결
- 빠르고 무료

### 🌐 External Database URL 사용

**언제**: 
- 로컬 개발 환경에서 Render DB에 접속
- Render가 아닌 다른 서버에서 접속

**형식**:
```
postgresql://user:password@dpg-xxxxx-a.singapore-postgres.render.com/database_name
```

**특징**:
- `*.singapore-postgres.render.com` 형태의 외부 호스트명
- 인터넷을 통해 연결
- 느리고 대역폭 비용 발생 가능

---

## 🎯 Render에서 URL 복사하기

### Step 1: PostgreSQL 대시보드 접속
1. Render 대시보드 로그인
2. 왼쪽 메뉴에서 PostgreSQL 인스턴스 선택

### Step 2: Connection 섹션 확인
**Connections** 섹션에서 2가지 URL을 볼 수 있습니다:

#### 1️⃣ Internal Database URL
```
postgresql://inboundms_user:6W2OU2MbvMKMeVpQqgcUnWFLBiQZ7B7@dpg-d3sm9nir0fns738jrk1g-a/inboundms_db
```
- 👆 이것을 **Render Backend 환경 변수**에 사용

#### 2️⃣ External Database URL
```
postgresql://inboundms_user:6W2OU2MbvMKMeVpQqgcUnWFLBiQZ7B7@dpg-d3sm9nir0fns738jrk1g-a.singapore-postgres.render.com/inboundms_db
```
- 👆 이것을 **로컬 개발 환경**에서 사용 (선택사항)

---

## 🔧 환경별 설정

### 1. Render Backend 배포 (프로덕션)

**Render Backend 환경 변수**:
```env
DATABASE_URL=postgresql://inboundms_user:6W2OU2MbvMKMeVpQqgcUnWFLBiQZ7B7@dpg-d3sm9nir0fns738jrk1g-a/inboundms_db
```
✅ **Internal URL 사용** (dpg-xxxxx-a)

### 2. 로컬 개발 (옵션 A - 로컬 PostgreSQL 권장)

**backend/.env**:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/inboundms?schema=public"
```
✅ **로컬 PostgreSQL 사용** (권장)

### 3. 로컬 개발 (옵션 B - Render DB 사용)

**backend/.env**:
```env
DATABASE_URL="postgresql://inboundms_user:6W2OU2MbvMKMeVpQqgcUnWFLBiQZ7B7@dpg-d3sm9nir0fns738jrk1g-a.singapore-postgres.render.com/inboundms_db"
```
⚠️ **External URL 사용** (느림, 비권장)

---

## 📝 Render Backend 환경 변수 설정 방법

### Render 대시보드에서 설정

1. Render 대시보드 → Backend 서비스 선택
2. **Environment** 탭 클릭
3. **Add Environment Variable** 클릭
4. 다음 정보 입력:

```
Key: DATABASE_URL
Value: postgresql://inboundms_user:6W2OU2MbvMKMeVpQqgcUnWFLBiQZ7B7@dpg-d3sm9nir0fns738jrk1g-a/inboundms_db
```

5. **Save Changes** 클릭
6. 자동으로 재배포됩니다

---

## 🧪 연결 테스트

### Backend에서 테스트

Backend 배포 후 로그 확인:

```
✅ Database connected
[Nest] 12345 - 10/22/2025, 6:56:05 PM   LOG [NestApplication] Nest application successfully started
```

### 로컬에서 테스트 (External URL 사용 시)

```bash
# PostgreSQL 클라이언트로 테스트
psql "postgresql://inboundms_user:6W2OU2MbvMKMeVpQqgcUnWFLBiQZ7B7@dpg-d3sm9nir0fns738jrk1g-a.singapore-postgres.render.com/inboundms_db"

# 연결 성공 시
inboundms_db=> \dt
```

---

## 🐛 문제 해결

### 1. "Database connection failed"

**원인**: Internal URL을 로컬에서 사용하려고 시도

**해결**:
- 로컬 개발: External URL 또는 로컬 PostgreSQL 사용
- Render Backend: Internal URL 사용

### 2. "Connection timeout"

**원인**: 
- 잘못된 URL 형식
- PostgreSQL이 준비되지 않음

**해결**:
1. Render PostgreSQL 상태 확인 (Available 상태여야 함)
2. URL 복사 시 공백이나 줄바꿈 없는지 확인
3. 전체 URL을 큰따옴표로 감싸기:
   ```env
   DATABASE_URL="postgresql://..."
   ```

### 3. "Authentication failed"

**원인**: 비밀번호가 잘못됨

**해결**:
1. Render PostgreSQL 대시보드에서 새로 복사
2. 비밀번호에 특수문자가 있으면 URL 인코딩 필요할 수 있음

---

## 🔒 보안 주의사항

### ⚠️ Database URL 보호

1. **절대 Git에 커밋하지 마세요**
   ```bash
   # .gitignore에 포함되어 있는지 확인
   .env
   backend/.env
   ```

2. **환경 변수로만 관리**
   - Render: Environment Variables
   - 로컬: `.env` 파일 (Git 제외)

3. **공개 저장소 주의**
   - README나 문서에 실제 URL 작성 금지
   - 예제는 `postgresql://user:password@host/database` 형식으로

---

## 📚 요약

### Render Backend 환경 변수 설정 시

```env
# ✅ 정답 - Internal Database URL
DATABASE_URL=postgresql://user:password@dpg-xxxxx-a/database
```

### 로컬 개발 시

```env
# ✅ 권장 - 로컬 PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/inboundms"

# ⚠️ 대안 - Render External URL (느림)
DATABASE_URL="postgresql://user:password@dpg-xxxxx-a.region.render.com/database"
```

---

## ✅ 체크리스트

### Render Backend 배포
- [ ] PostgreSQL의 **Internal Database URL** 복사
- [ ] Render Backend 환경 변수에 `DATABASE_URL` 추가
- [ ] `dpg-xxxxx-a` 형태의 호스트명인지 확인
- [ ] 배포 로그에서 "Database connected" 확인

### 로컬 개발
- [ ] 로컬 PostgreSQL 설치 (권장)
- [ ] `backend/.env` 파일에 로컬 DB URL 설정
- [ ] 또는 Render **External Database URL** 사용
- [ ] `.env` 파일이 `.gitignore`에 포함되었는지 확인

---

**작성일**: 2025-10-22  
**플랫폼**: Render PostgreSQL  
**권장 사용**: Internal Database URL (같은 Render 계정 내)


