# Render 빌드 에러 해결 가이드

## 🐛 문제: Prisma Client 생성 안 됨

### 에러 메시지
```
Module '"@prisma/client"' has no exported member 'PrismaClient'
Property 'schedule' does not exist on type 'PrismaService'
```

### 원인
Render 빌드 시 `prisma generate`가 실행되지 않아 Prisma Client가 생성되지 않음

---

## ✅ 해결 방법

### 1단계: package.json 수정 (완료!)

`backend/package.json`에 `postinstall` 스크립트 추가:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "nest build",
    "start:prod": "node dist/main",
    "prisma:migrate": "prisma migrate deploy"
  }
}
```

✅ 이미 수정되었습니다!

### 2단계: Render Build Command 확인

Render 대시보드에서 Build Command를 다음 중 하나로 설정:

#### 옵션 A (권장 - postinstall 사용)
```bash
pnpm install && pnpm prisma migrate deploy && pnpm build
```

#### 옵션 B (명시적)
```bash
pnpm install && pnpm prisma generate && pnpm prisma migrate deploy && pnpm build
```

### 3단계: GitHub에 푸시

```bash
git add backend/package.json
git commit -m "Fix: Add postinstall script for Prisma Client generation"
git push origin main
```

### 4단계: Render 재배포

Render가 자동으로 새 커밋을 감지하고 재배포합니다.

---

## 🔧 Render 설정 전체 확인

### Backend 서비스 설정

1. **Root Directory**: `backend`

2. **Build Command**:
   ```bash
   pnpm install && pnpm prisma migrate deploy && pnpm build
   ```

3. **Start Command**:
   ```bash
   pnpm start:prod
   ```

4. **Environment Variables**:
   ```
   DATABASE_URL=<Internal Database URL>
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   ```

---

## 🧪 빌드 프로세스 확인

정상적인 빌드 순서:

```
1. pnpm install
   └─> postinstall: prisma generate 자동 실행 ✅
2. pnpm prisma migrate deploy
   └─> 데이터베이스 마이그레이션 적용
3. pnpm build
   └─> NestJS 빌드
4. pnpm start:prod
   └─> 서버 시작
```

---

## 📝 로컬 테스트

변경사항을 로컬에서 먼저 테스트:

```bash
cd backend

# 의존성 설치 (postinstall 자동 실행)
pnpm install

# Prisma Client가 생성되었는지 확인
ls node_modules/.prisma/client

# 빌드 테스트
pnpm build

# 서버 시작
pnpm start:prod
```

---

## 🚨 여전히 에러가 발생하면

### 1. Render 대시보드에서 로그 확인

**Logs** 탭에서 다음을 확인:

✅ **정상 로그**:
```
Running 'pnpm install'
Running postinstall script
✔ Generated Prisma Client
Running 'pnpm build'
✔ Build complete
```

❌ **에러 로그**:
```
Cannot find module '@prisma/client'
```

### 2. 캐시 클리어 후 재배포

Render 대시보드에서:
1. **Settings** → **Clear Build Cache**
2. **Manual Deploy** → **Deploy latest commit**

### 3. Build Command 다시 확인

**Settings** → **Build Command**에서:
```bash
pnpm install && pnpm prisma generate && pnpm prisma migrate deploy && pnpm build
```

명시적으로 `prisma generate`를 포함하세요.

---

## 🎯 문제 해결 체크리스트

- [x] `backend/package.json`에 `postinstall` 스크립트 추가
- [ ] GitHub에 변경사항 푸시
- [ ] Render Build Command 확인/수정
- [ ] Render에서 자동 재배포 대기
- [ ] 빌드 로그에서 "Generated Prisma Client" 확인
- [ ] 배포 성공 확인

---

## 📚 추가 정보

### postinstall 스크립트란?

`postinstall`은 `npm install` (또는 `pnpm install`) 후 **자동으로 실행**되는 스크립트입니다.

**장점**:
- Render, Vercel 등 모든 플랫폼에서 자동 실행
- Build Command를 간단하게 유지
- 실수로 `prisma generate` 누락 방지

### Prisma Client 생성 확인

로컬에서 확인:
```bash
cd backend
pnpm install

# Prisma Client 파일 확인
ls node_modules/.prisma/client/index.d.ts
```

---

## 🎉 성공 확인

Render 배포가 성공하면:

1. **로그 확인**:
   ```
   ✅ Database connected
   [Nest] Application successfully started
   ```

2. **API 테스트**:
   ```bash
   curl https://your-backend.onrender.com/api/settings
   ```

3. **응답 확인**:
   ```json
   {
     "id": "settings",
     "logoUrl": "",
     "userImage": "",
     ...
   }
   ```

---

**수정일**: 2025-10-22  
**문제**: Prisma Client 미생성  
**해결**: postinstall 스크립트 추가


