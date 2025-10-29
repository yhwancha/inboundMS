# 환경 변수 설정 가이드

## 📋 개요

이 애플리케이션은 Frontend와 Backend가 분리되어 있으며, 각각 다른 환경 변수가 필요합니다.

---

## 🎨 Frontend 환경 변수

### 파일 위치
- 로컬 개발: `.env.local`
- Vercel 배포: Vercel 대시보드 → 프로젝트 → Settings → Environment Variables

### 필수 환경 변수

| 변수명 | 설명 | 로컬 개발 값 | 프로덕션 값 |
|--------|------|-------------|------------|
| `BACKEND_URL` | Backend API URL | `http://localhost:3001/api` | `https://your-backend.onrender.com/api` |

### .env.local 예제
```env
# 로컬 개발
BACKEND_URL=http://localhost:3001/api

# 프로덕션 (Vercel에서 설정)
# BACKEND_URL=https://your-backend.onrender.com/api
```

### Vercel 설정 방법
1. Vercel 대시보드 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 클릭
4. 다음 변수 추가:
   ```
   Name: BACKEND_URL
   Value: https://your-backend.onrender.com/api
   ```
5. **Add** 클릭
6. 배포 환경 선택:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

⚠️ **중요**: `BACKEND_URL` 끝에 반드시 `/api`를 포함해야 합니다!

---

## 🔧 Backend 환경 변수

### 파일 위치
- 로컬 개발: `backend/.env`
- Render 배포: Render 대시보드 → 서비스 → Environment

### 필수 환경 변수

| 변수명 | 설명 | 로컬 개발 값 | 프로덕션 값 |
|--------|------|-------------|------------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 | `postgresql://postgres:password@localhost:5432/inboundms` | Render에서 제공 |
| `PORT` | Backend 서버 포트 | `3001` | `3001` |
| `NODE_ENV` | Node 환경 | `development` | `production` |
| `FRONTEND_URL` | Frontend URL (CORS) | `http://localhost:3000` | `https://your-app.vercel.app` |

### backend/.env 예제
```env
# 로컬 개발
DATABASE_URL="postgresql://postgres:password@localhost:5432/inboundms?schema=public"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# 프로덕션 (Render에서 설정)
# DATABASE_URL="<Render PostgreSQL Internal URL>"
# PORT=3001
# NODE_ENV=production
# FRONTEND_URL=https://your-app.vercel.app
```

### Render 설정 방법
1. Render 대시보드 접속
2. Backend 서비스 선택
3. **Environment** 탭 클릭
4. 다음 변수들 추가:

```
Key: DATABASE_URL
Value: <Render PostgreSQL의 Internal Database URL>

Key: PORT
Value: 3001

Key: NODE_ENV
Value: production

Key: FRONTEND_URL
Value: https://your-app.vercel.app
```

5. **Save Changes** 클릭 (자동으로 재배포됨)

---

## 🗄️ DATABASE_URL 형식

### PostgreSQL 연결 문자열 형식
```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

### 예시
```bash
# 로컬 개발
postgresql://postgres:mypassword@localhost:5432/inboundms?schema=public

# Render PostgreSQL (Internal URL)
postgresql://inboundms_user:abc123xyz@dpg-xxx-a.singapore-postgres.render.com/inboundms_db
```

### Render PostgreSQL URL 찾기
1. Render 대시보드
2. PostgreSQL 인스턴스 선택
3. **Connect** 섹션에서 **Internal Database URL** 복사

⚠️ **중요**: 
- Backend는 **Internal Database URL** 사용 (빠르고 무료)
- 로컬 개발은 **External Database URL** 또는 로컬 PostgreSQL 사용

---

## 🚀 배포 시나리오별 환경 변수

### 시나리오 1: 로컬 개발

#### Frontend (.env.local)
```env
BACKEND_URL=http://localhost:3001/api
```

#### Backend (backend/.env)
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/inboundms?schema=public"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 시나리오 2: 프로덕션 배포 (Vercel + Render)

#### Frontend (Vercel 환경 변수)
```env
BACKEND_URL=https://inboundms-backend.onrender.com/api
```

#### Backend (Render 환경 변수)
```env
DATABASE_URL=postgresql://user:pass@host.render.com/dbname
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://inboundms.vercel.app
```

### 시나리오 3: 커스텀 도메인 사용

#### Frontend (Vercel 환경 변수)
```env
BACKEND_URL=https://api.yourdomain.com/api
```

#### Backend (Render 환경 변수)
```env
DATABASE_URL=postgresql://user:pass@host.render.com/dbname
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

---

## 🔐 보안 주의사항

### ❌ 절대 하지 말아야 할 것
1. `.env` 파일을 Git에 커밋
2. GitHub에 환경 변수 노출
3. 프론트엔드 코드에 민감 정보 포함
4. `DATABASE_URL`을 프론트엔드에서 사용

### ✅ 보안 체크리스트
- [ ] `.env` 파일이 `.gitignore`에 포함됨
- [ ] `.env.example` 파일만 Git에 커밋
- [ ] 프로덕션 환경 변수는 플랫폼에서만 설정
- [ ] Database URL은 Backend에서만 사용
- [ ] CORS 설정으로 허용된 도메인만 접근

---

## 🧪 환경 변수 테스트

### Frontend 테스트
```bash
# .env.local 파일 생성 확인
cat .env.local

# Frontend 실행
pnpm dev

# 브라우저 콘솔에서 확인
# BACKEND_URL이 올바르게 설정되었는지 Network 탭 확인
```

### Backend 테스트
```bash
# .env 파일 생성 확인
cat backend/.env

# Backend 실행
cd backend
pnpm start:dev

# API 테스트
curl http://localhost:3001/api/settings
```

### 통합 테스트
```bash
# 1. Backend 실행 (터미널 1)
cd backend
pnpm start:dev

# 2. Frontend 실행 (터미널 2)
pnpm dev

# 3. 브라우저에서 테스트
# http://localhost:3000 접속
# Location 페이지에서 데이터 로드 확인
```

---

## 🐛 문제 해결

### Frontend에서 Backend에 연결 안 됨

**증상**: Network 에러, CORS 에러

**해결**:
1. `BACKEND_URL`이 올바른지 확인
   ```bash
   # Frontend .env.local
   echo $BACKEND_URL  # 또는 파일 직접 확인
   ```
2. Backend가 실행 중인지 확인
   ```bash
   curl http://localhost:3001/api/settings
   ```
3. CORS 설정 확인
   ```typescript
   // backend/src/main.ts
   app.enableCors({
     origin: process.env.FRONTEND_URL,  // 확인!
   });
   ```

### Database 연결 실패

**증상**: Prisma 연결 에러

**해결**:
1. `DATABASE_URL` 형식 확인
   ```bash
   cd backend
   echo $DATABASE_URL
   ```
2. PostgreSQL 실행 확인 (로컬)
   ```bash
   psql -U postgres -c "SELECT version();"
   ```
3. Render PostgreSQL 상태 확인 (프로덕션)
   - Render 대시보드에서 확인

### 환경 변수가 적용 안 됨 (Vercel)

**원인**: 환경 변수 변경 후 재배포 필요

**해결**:
1. Vercel 대시보드 → Deployments
2. 최신 배포 선택
3. **Redeploy** 클릭

### 환경 변수가 적용 안 됨 (Render)

**원인**: 환경 변수 저장 후 자동 재배포 안 됨

**해결**:
1. Render 대시보드 → 서비스 선택
2. **Manual Deploy** → **Deploy latest commit** 클릭

---

## 📚 추가 자료

- [Next.js 환경 변수 문서](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel 환경 변수 가이드](https://vercel.com/docs/concepts/projects/environment-variables)
- [Render 환경 변수 가이드](https://render.com/docs/environment-variables)
- [Prisma 연결 문자열](https://www.prisma.io/docs/reference/database-reference/connection-urls)

---

## ✅ 체크리스트

### 로컬 개발 시작 전
- [ ] `.env.local` 파일 생성 (Frontend)
- [ ] `backend/.env` 파일 생성
- [ ] PostgreSQL 로컬 설치 및 실행
- [ ] 환경 변수 값 확인

### 프로덕션 배포 전
- [ ] Render PostgreSQL 생성
- [ ] Render Backend 환경 변수 설정
- [ ] Vercel Frontend 환경 변수 설정
- [ ] CORS 설정 확인
- [ ] 테스트 완료

---

**마지막 업데이트**: 2025-10-22  
**작성자**: AI Assistant  
**버전**: 1.0


