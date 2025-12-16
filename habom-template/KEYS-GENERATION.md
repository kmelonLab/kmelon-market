# 보안 키 생성 가이드

이 문서는 Habom Market 시스템에 필요한 모든 보안 키를 생성하고 설정하는 방법을 설명합니다.

## 목차

1. [개요](#개요)
2. [자동 키 생성 (권장)](#자동-키-생성-권장)
3. [수동 키 생성](#수동-키-생성)
4. [키 사용 위치 매핑](#키-사용-위치-매핑)
5. [보안 주의사항](#보안-주의사항)

---

## 개요

Habom Market 시스템은 다음과 같은 보안 키가 필요합니다:

| 키 이름 | 타입 | 용도 | 사용 위치 |
|--------|------|------|-----------|
| `JWT_SECRET` | 64바이트 HEX | JWT 토큰 서명/검증 | backend-market, backend-pay (동일 값) |
| `API_KEY` | 32바이트 HEX | 내부 API 인증 | backend-pay |
| `WEBHOOK_SIGNATURE_SECRET` | 32바이트 HEX | 웹훅 서명 검증 | backend-pay |
| `ENCRYPTION_MASTER_KEY` | 32바이트 Base64 | 민감 데이터 암호화 | backend-pay |
| `SWAGGER_PASSWORD` | 16바이트 HEX | Swagger UI 접근 | backend-pay |
| `MYSQL_ROOT_PASSWORD` | 강력한 비밀번호 | MySQL root 계정 | .env |
| `MYSQL_PASSWORD` | 강력한 비밀번호 | MySQL 사용자 계정 | .env, backend-market, backend-pay |

---

## 자동 키 생성 (권장)

가장 간단하고 안전한 방법은 제공된 스크립트를 사용하는 것입니다.

### 1단계: 스크립트 실행

```bash
# habom-template-shared 폴더에서 실행
node generate-keys.js
```

### 2단계: 생성된 파일 확인

스크립트가 `generated-keys/` 폴더에 다음 파일들을 생성합니다:

```
generated-keys/
├── generated-keys.txt              # 모든 키 요약
├── .env                            # Docker Compose 환경변수
├── backend-market.env.production   # Backend-Market 환경변수
├── backend-pay.env.production      # Backend-Pay 환경변수
└── frontend-market.env.production  # Frontend-Market 환경변수
```

### 3단계: 파일 복사

생성된 파일들을 각 위치로 복사합니다:

```bash
# 예시 (Windows)
copy generated-keys\.env .env
copy generated-keys\backend-market.env.production backend-market\.env.production
copy generated-keys\backend-pay.env.production backend-pay\.env.production
copy generated-keys\frontend-market.env.production frontend-market\.env.production

# 예시 (Linux/Mac)
cp generated-keys/.env .env
cp generated-keys/backend-market.env.production backend-market/.env.production
cp generated-keys/backend-pay.env.production backend-pay/.env.production
cp generated-keys/frontend-market.env.production frontend-market/.env.production
```

### 4단계: 플레이스홀더 수정

각 파일에서 `<YOUR_...>` 형태의 플레이스홀더를 실제 값으로 수정합니다:

**backend-market/.env.production**
```bash
API_BASE_URL=https://api.yourdomain.com  # <YOUR_BACKEND_MARKET_URL> 수정
CORS_ORIGIN=https://yourdomain.com       # <YOUR_FRONTEND_URL> 수정
FRONTEND_URL=https://yourdomain.com      # <YOUR_FRONTEND_URL> 수정
```

**backend-pay/.env.production**
```bash
# TossPayments API 키
TOSS_SECRET_KEY=live_sk_xxxxxxxx         # <YOUR_TOSS_SECRET_KEY> 수정
TOSS_CLIENT_KEY=live_ck_xxxxxxxx         # <YOUR_TOSS_CLIENT_KEY> 수정

# CORS
CORS_ORIGIN=https://yourdomain.com       # <YOUR_FRONTEND_URL> 수정

# Swagger
SWAGGER_IP_WHITELIST=1.2.3.4,5.6.7.8     # <YOUR_ADMIN_IP> 수정

# SMTP
SMTP_HOST=smtp.gmail.com                 # <YOUR_SMTP_HOST> 수정
SMTP_USER=your-email@gmail.com           # <YOUR_SMTP_USER> 수정
SMTP_PASSWORD=app-password               # <YOUR_SMTP_PASSWORD> 수정
EMAIL_FROM=noreply@yourdomain.com        # <YOUR_EMAIL_FROM> 수정
EMAIL_FROM_NAME=Your Service             # <YOUR_SERVICE_NAME> 수정
```

**frontend-market/.env.production**
```bash
VITE_API_URL=https://api.yourdomain.com/api  # <YOUR_BACKEND_MARKET_URL> 수정
VITE_PAYMENT_API_URL=https://pay.yourdomain.com  # <YOUR_BACKEND_PAY_URL> 수정
VITE_TOSS_CLIENT_KEY=live_ck_xxxxxxxx    # <YOUR_TOSS_CLIENT_KEY> 수정
```

### 5단계: 백업 및 정리

```bash
# 1. generated-keys.txt 파일을 안전한 곳에 백업
# 2. generated-keys/ 폴더 삭제 (보안)
rm -rf generated-keys/  # Linux/Mac
rmdir /s generated-keys  # Windows
```

---

## 수동 키 생성

자동 스크립트를 사용하지 않는 경우, 아래 명령어로 각 키를 수동으로 생성할 수 있습니다.

Node.js가 설치되어 있어야 합니다.

### JWT_SECRET (64바이트 HEX)

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**사용 위치:**
- `backend-market/.env.production` → `JWT_SECRET`
- `backend-pay/.env.production` → `JWT_SECRET` (동일한 값)

**중요:** 두 파일의 `JWT_SECRET`은 **반드시 동일한 값**을 사용해야 합니다!

---

### API_KEY (32바이트 HEX)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**사용 위치:**
- `backend-pay/.env.production` → `API_KEY`

---

### WEBHOOK_SIGNATURE_SECRET (32바이트 HEX)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**사용 위치:**
- `backend-pay/.env.production` → `WEBHOOK_SIGNATURE_SECRET`

---

### ENCRYPTION_MASTER_KEY (Base64)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**사용 위치:**
- `backend-pay/.env.production` → `ENCRYPTION_MASTER_KEY`

---

### SWAGGER_PASSWORD (16바이트 HEX)

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

**사용 위치:**
- `backend-pay/.env.production` → `SWAGGER_PASSWORD`

---

### MYSQL_ROOT_PASSWORD (강력한 비밀번호)

```bash
node -e "const c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';const b=require('crypto').randomBytes(24);let p='';for(let i=0;i<24;i++)p+=c[b[i]%c.length];console.log(p)"
```

**사용 위치:**
- `.env` → `MYSQL_ROOT_PASSWORD`

---

### MYSQL_PASSWORD (강력한 비밀번호)

```bash
node -e "const c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';const b=require('crypto').randomBytes(24);let p='';for(let i=0;i<24;i++)p+=c[b[i]%c.length];console.log(p)"
```

**사용 위치:**
- `.env` → `MYSQL_PASSWORD`
- `backend-market/.env.production` → `DB_PASSWORD`
- `backend-pay/.env.production` → `DATABASE_URL` 및 `DB_PASSWORD`

**중요:** 모든 파일에서 **동일한 값**을 사용해야 합니다!

---

## 키 사용 위치 매핑

### .env (Docker Compose)

```bash
MYSQL_ROOT_PASSWORD=<생성된_비밀번호>
MYSQL_USER=marketuser
MYSQL_PASSWORD=<생성된_비밀번호>
```

---

### backend-market/.env.production

```bash
# Database 비밀번호 (.env의 MYSQL_PASSWORD와 동일)
DB_PASSWORD=<생성된_비밀번호>

# JWT Secret (backend-pay와 동일)
JWT_SECRET=<생성된_64바이트_HEX>
```

---

### backend-pay/.env.production

```bash
# Database URL (MYSQL_PASSWORD 포함)
DATABASE_URL=mysql://marketuser:<생성된_비밀번호>@mysql-pay:3306/pay_db?charset=utf8mb4

# 개별 DB 설정 (fallback)
DB_PASSWORD=<생성된_비밀번호>

# JWT Secret (backend-market과 동일)
JWT_SECRET=<생성된_64바이트_HEX>

# API Key
API_KEY=<생성된_32바이트_HEX>

# Webhook Secret
WEBHOOK_SIGNATURE_SECRET=<생성된_32바이트_HEX>

# Encryption Key
ENCRYPTION_MASTER_KEY=<생성된_Base64>

# Swagger Password
SWAGGER_PASSWORD=<생성된_16바이트_HEX>
```

---

## 보안 주의사항

### ⚠️ 절대 금지

1. **Git에 키 커밋 금지**
   - `.env`, `.env.production` 파일을 절대 Git에 커밋하지 마세요
   - `.gitignore`에 다음 항목이 있는지 확인:
     ```
     .env
     .env.production
     .env.local
     generated-keys/
     generated-keys.txt
     ```

2. **키 공개 금지**
   - 생성된 키를 공개 채널(Slack, 이메일 등)에 공유하지 마세요
   - 스크린샷이나 문서에 키를 포함하지 마세요

3. **약한 키 사용 금지**
   - 수동으로 키를 만들지 마세요 (예: "password123")
   - 반드시 암호학적으로 안전한 난수 생성기 사용

### ✅ 권장사항

1. **키 관리**
   - 운영 환경에서는 AWS Secrets Manager, Azure Key Vault 등 키 관리 서비스 사용
   - 정기적으로 키 교체 (최소 6개월마다)
   - 키 백업은 암호화된 저장소에 보관

2. **접근 제어**
   - 키 파일에 대한 접근 권한 최소화
   - 개발/스테이징/운영 환경별로 다른 키 사용

3. **모니터링**
   - 키 사용 로그 모니터링
   - 비정상적인 접근 시도 감지 및 알림

---

## 문제 해결

### JWT 인증 실패

**증상:** 로그인 후 다른 서비스에서 인증 실패

**해결방법:**
- `backend-market/.env.production`의 `JWT_SECRET`과
- `backend-pay/.env.production`의 `JWT_SECRET`이
- **완전히 동일한지** 확인

### MySQL 연결 실패

**증상:** "Access denied for user" 오류

**해결방법:**
- `.env`의 `MYSQL_PASSWORD`와
- `backend-market/.env.production`의 `DB_PASSWORD`와
- `backend-pay/.env.production`의 `DATABASE_URL` 및 `DB_PASSWORD`가
- **모두 동일한지** 확인

### generated-keys 폴더가 생성되지 않음

**증상:** 스크립트 실행 후 파일이 없음

**해결방법:**
```bash
# Node.js 버전 확인 (12 이상 필요)
node --version

# 스크립트 권한 확인 (Linux/Mac)
chmod +x generate-keys.js

# 다시 실행
node generate-keys.js
```

---

## 체크리스트

설정 완료 전 다음 항목을 확인하세요:

- [ ] 모든 키가 자동 생성 스크립트로 생성됨
- [ ] `JWT_SECRET`이 backend-market과 backend-pay에 동일하게 설정됨
- [ ] `MYSQL_PASSWORD`가 모든 파일에 동일하게 설정됨
- [ ] TossPayments API 키 입력 완료
- [ ] SMTP 설정 입력 완료
- [ ] 도메인 URL 설정 완료
- [ ] `generated-keys.txt` 백업 완료
- [ ] `generated-keys/` 폴더 삭제 완료
- [ ] `.gitignore`에 환경변수 파일 제외 확인

---

## 추가 참고

- [SETUP.md](./SETUP.md) - 전체 시스템 설치 가이드
- [TossPayments 개발자 문서](https://developers.tosspayments.com) - API 키 발급
- [Node.js Crypto 문서](https://nodejs.org/api/crypto.html) - 암호화 관련 참고
