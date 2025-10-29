# Vercel 배포 환경 변수 요약

## 🎯 빠른 시작

Vercel에 Frontend를 배포할 때 필요한 환경 변수는 **딱 1개**입니다!

---

## 📝 Frontend (Vercel) 환경 변수

### Vercel 대시보드에서 설정

**Project Settings** → **Environment Variables**에서 추가:

```
Name: BACKEND_URL
Value: https://your-backend.onrender.com/api
```

### ⚠️ 중요 사항

1. **반드시 `/api`를 끝에 붙이세요!**
   ```
   ✅ 맞음: https://your-backend.onrender.com/api
   ❌ 틀림: https://your-backend.onrender.com
   ```

2. **모든 환경에 적용**
   - Production: ✅
   - Preview: ✅
   - Development: ✅

3. **Backend URL은 Render에서 배포 후 복사**
   - Render 대시보드 → Backend 서비스 → URL 복사
   - 예: `https://inboundms-backend.onrender.com`
   - Vercel에 입력할 때: `https://inboundms-backend.onrender.com/api`

---

## 🔧 Backend (Render) 환경 변수

Backend는 Render에 배포하며, **4개**의 환경 변수가 필요합니다:

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `DATABASE_URL` | Render PostgreSQL URL | Render에서 자동 제공 |
| `PORT` | `3001` | Backend 포트 |
| `NODE_ENV` | `production` | 프로덕션 모드 |
| `FRONTEND_URL` | Vercel URL | CORS 설정용 |

### Render 설정 방법

**Service Settings** → **Environment**에서 추가:

```
DATABASE_URL=<Render PostgreSQL Internal URL>
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

---

## 🔄 배포 순서와 환경 변수

### Step 1: PostgreSQL 생성 (Render)
- Database URL 복사 → 다음 단계에서 사용

### Step 2: Backend 배포 (Render)
환경 변수 4개 설정:
```
DATABASE_URL=<Step 1에서 복사한 URL>
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://임시값.vercel.app  # 나중에 업데이트
```
- Backend URL 복사 → 다음 단계에서 사용

### Step 3: Frontend 배포 (Vercel)
환경 변수 1개 설정:
```
BACKEND_URL=<Step 2에서 복사한 URL>/api
```
- ⚠️ 끝에 `/api` 붙이는 것 잊지 마세요!
- Frontend URL 복사 → 다음 단계에서 사용

### Step 4: Backend FRONTEND_URL 업데이트
Render로 돌아가서:
```
FRONTEND_URL=<Step 3에서 복사한 Vercel URL>
```

---

## 📋 체크리스트

### Vercel 환경 변수
- [ ] `BACKEND_URL` 추가
- [ ] 값 끝에 `/api` 포함 확인
- [ ] Production, Preview, Development 모두 체크
- [ ] Save 클릭

### Render 환경 변수
- [ ] `DATABASE_URL` 추가 (PostgreSQL URL)
- [ ] `PORT` = `3001` 추가
- [ ] `NODE_ENV` = `production` 추가
- [ ] `FRONTEND_URL` 추가 (Vercel URL)
- [ ] Save Changes 클릭

---

## 🧪 테스트

### 1. Backend API 테스트
```bash
curl https://your-backend.onrender.com/api/settings
```

응답 예시:
```json
{
  "id": "settings",
  "logoUrl": "",
  "userImage": "",
  "createdAt": "2025-10-22T...",
  "updatedAt": "2025-10-22T..."
}
```

### 2. Frontend 테스트
1. Vercel URL 접속: `https://your-app.vercel.app`
2. Location 페이지 접속
3. 데이터가 로드되는지 확인

---

## 🐛 자주 발생하는 문제

### 1. "Failed to fetch" 에러

**원인**: `BACKEND_URL`이 잘못됨

**해결**:
```
# Vercel 환경 변수 확인
BACKEND_URL=https://your-backend.onrender.com/api
```
- ✅ `/api`가 끝에 있는지 확인
- ✅ https:// 포함 확인
- ✅ 오타 없는지 확인

### 2. CORS 에러

**원인**: Backend의 `FRONTEND_URL`이 잘못됨

**해결**:
```
# Render 환경 변수 확인
FRONTEND_URL=https://your-app.vercel.app
```
- ✅ Vercel URL과 정확히 일치하는지 확인
- ✅ 끝에 슬래시(/) 없는지 확인
- ✅ https:// 포함 확인

### 3. Database 연결 실패

**원인**: Backend의 `DATABASE_URL`이 잘못됨

**해결**:
1. Render PostgreSQL 대시보드 접속
2. **Internal Database URL** 복사 (External 아님!)
3. Render Backend 환경 변수에 붙여넣기

### 4. 환경 변수 변경이 반영 안 됨

**해결**:

**Vercel**:
1. Settings → Environment Variables에서 변경
2. Deployments → 최신 배포 → **Redeploy** 클릭

**Render**:
1. Environment에서 변경
2. **Save Changes** (자동 재배포됨)

---

## 📚 더 자세한 가이드

- **전체 배포 가이드**: [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)
- **환경 변수 상세**: [ENV_VARIABLES.md](./ENV_VARIABLES.md)
- **배포 체크리스트**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

## ✅ 환경 변수 정리

### Vercel (Frontend)
```env
BACKEND_URL=https://your-backend.onrender.com/api
```

### Render (Backend)
```env
DATABASE_URL=<PostgreSQL Internal URL>
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

---

**작성일**: 2025-10-22  
**플랫폼**: Vercel (Frontend) + Render (Backend)


