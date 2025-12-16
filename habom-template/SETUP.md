# Habom Market 설치 가이드

이 문서는 Habom Market 시스템을 Docker 환경에서 설치하고 구성하는 방법을 안내합니다.

## 목차

1. [사전 요구사항](#사전-요구사항)
2. [폴더 구조](#폴더-구조)
3. [빠른 시작 (권장)](#빠른-시작-권장)
4. [설정 파일 생성](#설정-파일-생성)
5. [환경변수 설정 상세](#환경변수-설정-상세)
6. [시크릿 키 생성 방법](#시크릿-키-생성-방법)
7. [Docker 실행](#docker-실행)
8. [문제 해결](#문제-해결)

---

## 사전 요구사항

- Docker 및 Docker Compose 설치
- TossPayments 가맹점 계정 (API 키 필요)
- 도메인 및 SSL 인증서 (운영 환경)
- SMTP 서버 정보 (이메일 발송용)

---

## 폴더 구조

```
habom-template-shared/
├── .env                              # Docker Compose 환경변수 (생성 필요)
├── .env.example                      # Docker Compose 환경변수 템플릿
├── docker-compose.yaml               # Docker 서비스 정의
├── SETUP.md                          # 이 문서
│
├── backend-market/
│   ├── .env.production               # Backend-Market 환경변수 (생성 필요)
│   ├── .env.production.example       # Backend-Market 환경변수 템플릿
│   └── uploads/                      # 업로드 파일 저장 디렉토리
│
├── backend-pay/
│   ├── .env.production               # Backend-Pay 환경변수 (생성 필요)
│   └── .env.production.example       # Backend-Pay 환경변수 템플릿
│
├── frontend-market/
│   ├── .env.production               # Frontend-Market 환경변수 (생성 필요)
│   └── .env.production.example       # Frontend-Market 환경변수 템플릿
│
├── mysql-market/
│   ├── data/                         # MySQL 데이터 (자동 생성)
│   └── init/
│       └── 01-init.sql               # 초기화 스크립트
│
└── mysql-pay/
    ├── data/                         # MySQL 데이터 (자동 생성)
    └── init/
        └── 01-init.sql               # 초기화 스크립트
```

---

## 빠른 시작 (권장)

가장 빠르고 안전하게 설정하는 방법입니다.

### 1단계: 자동 키 생성

```bash
# 모든 보안 키와 환경변수 파일 자동 생성
node generate-keys.js
```

### 2단계: 파일 복사

```bash
# Windows
copy generated-keys\.env .env
copy generated-keys\backend-market.env.production backend-market\.env.production
copy generated-keys\backend-pay.env.production backend-pay\.env.production
copy generated-keys\frontend-market.env.production frontend-market\.env.production

# Linux/Mac
cp generated-keys/.env .env
cp generated-keys/backend-market.env.production backend-market/.env.production
cp generated-keys/backend-pay.env.production backend-pay/.env.production
cp generated-keys/frontend-market.env.production frontend-market/.env.production
```

### 3단계: 플레이스홀더 수정

각 파일에서 `<YOUR_...>` 부분만 실제 값으로 수정하세요:
- TossPayments API 키
- 도메인 URL
- SMTP 설정
- IP 화이트리스트

### 4단계: Docker 실행

```bash
docker-compose up -d
```

자세한 내용은 [KEYS-GENERATION.md](./KEYS-GENERATION.md)를 참조하세요.

---

## 설정 파일 생성

### 1단계: 템플릿 파일 복사

각 `.example` 파일을 복사하여 실제 설정 파일을 생성합니다:

```bash
# 루트 디렉토리에서 실행
cp .env.example .env
cp backend-market/.env.production.example backend-market/.env.production
cp backend-pay/.env.production.example backend-pay/.env.production
cp frontend-market/.env.production.example frontend-market/.env.production
```

### 2단계: 필수 디렉토리 생성

```bash
mkdir -p backend-market/uploads
mkdir -p mysql-market/data
mkdir -p mysql-pay/data
```

---

## 환경변수 설정 상세

### 파일별 수정 항목 요약

| 파일 경로 | 수정 항목 | 중요도 |
|-----------|-----------|--------|
| `.env` | MySQL 비밀번호, 포트 | 필수 |
| `backend-market/.env.production` | API URL, DB 정보, JWT, CORS | 필수 |
| `backend-pay/.env.production` | Toss API 키, DB, JWT, SMTP | 필수 |
| `frontend-market/.env.production` | API URL, Toss Client Key | 필수 |

---

### `.env` (Docker Compose 환경변수)

| 변수명 | 설명 | 수정 필요 | 예시 |
|--------|------|-----------|------|
| `MYSQL_ROOT_PASSWORD` | MySQL root 비밀번호 | **필수** | `StrongPassword123!` |
| `MYSQL_USER` | MySQL 사용자명 | **필수** | `marketuser` |
| `MYSQL_PASSWORD` | MySQL 사용자 비밀번호 | **필수** | `UserPassword456!` |
| `MYSQL_MARKET_DATABASE` | Market DB 이름 | 선택 | `market_db` |
| `MYSQL_MARKET_PORT` | Market DB 외부 포트 | 선택 | `12057` |
| `MYSQL_PAY_DATABASE` | Pay DB 이름 | 선택 | `pay_db` |
| `MYSQL_PAY_PORT` | Pay DB 외부 포트 | 선택 | `12058` |
| `BACKEND_PAY_PORT` | Backend-Pay 외부 포트 | 선택 | `12051` |
| `BACKEND_MARKET_PORT` | Backend-Market 외부 포트 | 선택 | `12053` |
| `FRONTEND_MARKET_PORT` | Frontend 외부 포트 | 선택 | `12055` |

---

### `backend-market/.env.production`

| 변수명 | 설명 | 수정 필요 | 예시 |
|--------|------|-----------|------|
| `API_BASE_URL` | Backend-Market API 도메인 | **필수** | `https://api.yourdomain.com` |
| `DB_USERNAME` | MySQL 사용자명 (`.env`와 동일) | **필수** | `marketuser` |
| `DB_PASSWORD` | MySQL 비밀번호 (`.env`와 동일) | **필수** | `UserPassword456!` |
| `JWT_SECRET` | JWT 시크릿 키 (64바이트 HEX) | **필수** | 아래 생성 방법 참조 |
| `CORS_ORIGIN` | Frontend 도메인 | **필수** | `https://yourdomain.com` |
| `FRONTEND_URL` | Frontend 도메인 (OAuth용) | **필수** | `https://yourdomain.com` |
| `SWAGGER_ENABLED` | Swagger UI 활성화 | 선택 | `false` (운영 환경) |

> **중요**: `JWT_SECRET`은 `backend-pay`와 **동일한 값**을 사용해야 합니다!

---

### `backend-pay/.env.production`

| 변수명 | 설명 | 수정 필요 | 예시 |
|--------|------|-----------|------|
| `TOSS_SECRET_KEY` | TossPayments Secret Key | **필수** | `live_sk_xxxxxxxxxxxx` |
| `TOSS_CLIENT_KEY` | TossPayments Client Key | **필수** | `live_ck_xxxxxxxxxxxx` |
| `DATABASE_URL` | MySQL 연결 문자열 | **필수** | 아래 참조 |
| `JWT_SECRET` | JWT 시크릿 (backend-market과 동일) | **필수** | 아래 생성 방법 참조 |
| `API_KEY` | 내부 API 인증 키 | **필수** | 아래 생성 방법 참조 |
| `CORS_ORIGIN` | Frontend 도메인 | **필수** | `https://yourdomain.com` |
| `SWAGGER_PASSWORD` | Swagger UI 비밀번호 | **필수** | 강력한 비밀번호 |
| `SWAGGER_IP_WHITELIST` | Swagger 접근 허용 IP | **필수** | `1.2.3.4,5.6.7.8` |
| `WEBHOOK_SIGNATURE_SECRET` | 웹훅 서명 시크릿 | **필수** | 아래 생성 방법 참조 |
| `SMTP_HOST` | SMTP 서버 주소 | **필수** | `smtp.gmail.com` |
| `SMTP_USER` | SMTP 계정 | **필수** | `your-email@gmail.com` |
| `SMTP_PASSWORD` | SMTP 비밀번호 | **필수** | `app-password` |
| `EMAIL_FROM` | 발신자 이메일 | **필수** | `noreply@yourdomain.com` |
| `EMAIL_FROM_NAME` | 발신자 이름 | **필수** | `Your Service` |
| `ENCRYPTION_MASTER_KEY` | 암호화 마스터 키 (Base64) | **필수** | 아래 생성 방법 참조 |

**DATABASE_URL 형식:**
```
mysql://<MYSQL_USER>:<MYSQL_PASSWORD>@mysql-pay:3306/pay_db?charset=utf8mb4
```

---

### `frontend-market/.env.production`

| 변수명 | 설명 | 수정 필요 | 예시 |
|--------|------|-----------|------|
| `VITE_API_URL` | Backend-Market API URL (**끝에 /api 필수**) | **필수** | `https://api.yourdomain.com/api` |
| `VITE_PAYMENT_API_URL` | Backend-Pay API URL | **필수** | `https://pay.yourdomain.com` |
| `VITE_TOSS_CLIENT_KEY` | TossPayments Client Key | **필수** | `live_ck_xxxxxxxxxxxx` |

---

## 시크릿 키 생성 방법

### 방법 1: 자동 키 생성 스크립트 (권장)

모든 키를 한 번에 자동으로 생성하는 스크립트를 제공합니다:

```bash
# habom-template-shared 폴더에서 실행
node generate-keys.js
```

이 스크립트는:
- 모든 필요한 보안 키를 자동으로 생성
- 각 서비스별 환경변수 파일을 자동으로 생성
- 키를 올바른 위치에 자동으로 매핑
- 생성된 키를 `generated-keys/` 폴더에 저장

자세한 사용법은 [KEYS-GENERATION.md](./KEYS-GENERATION.md)를 참조하세요.

---

### 방법 2: 수동 키 생성

Node.js가 설치되어 있어야 합니다.

#### JWT_SECRET (64바이트 HEX)
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### API_KEY (32바이트 HEX)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### WEBHOOK_SIGNATURE_SECRET (32바이트 HEX)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### ENCRYPTION_MASTER_KEY (Base64)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### SWAGGER_PASSWORD (32바이트 HEX)
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

수동 키 생성 시 주의사항 및 각 키의 사용 위치는 [KEYS-GENERATION.md](./KEYS-GENERATION.md)를 참조하세요.

---

## Docker 실행

### 서비스 시작

```bash
# 모든 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 특정 서비스 로그 확인
docker-compose logs -f backend-pay
```

### 서비스 상태 확인

```bash
docker-compose ps
```

### 서비스 중지

```bash
docker-compose down
```

### 데이터 포함 완전 삭제

```bash
docker-compose down -v
rm -rf mysql-market/data mysql-pay/data
```

---

## 문제 해결

### MySQL 연결 오류

1. MySQL 컨테이너 상태 확인:
   ```bash
   docker-compose logs mysql-market
   docker-compose logs mysql-pay
   ```

2. `.env` 파일의 비밀번호와 각 서비스의 `.env.production` 비밀번호가 일치하는지 확인

### API 연결 오류

1. CORS 설정 확인 - `CORS_ORIGIN`이 프론트엔드 도메인과 정확히 일치하는지 확인
2. 네트워크 확인 - 모든 서비스가 `market-network`에 연결되어 있는지 확인

### JWT 인증 오류

- `backend-market`과 `backend-pay`의 `JWT_SECRET`이 **완전히 동일**해야 합니다

### TossPayments 결제 오류

1. 테스트 환경에서는 `test_sk_`/`test_ck_` 키 사용
2. 운영 환경에서는 `live_sk_`/`live_ck_` 키 사용
3. TossPayments 대시보드에서 웹훅 URL 설정 필요

---

## 체크리스트

설치 전 다음 항목을 확인하세요:

- [ ] `.env` 파일 생성 및 MySQL 비밀번호 설정
- [ ] `backend-market/.env.production` 파일 생성
- [ ] `backend-pay/.env.production` 파일 생성
- [ ] `frontend-market/.env.production` 파일 생성
- [ ] JWT_SECRET 생성 (backend-market, backend-pay 동일 값)
- [ ] TossPayments API 키 입력
- [ ] SMTP 설정 입력
- [ ] 도메인 URL 설정 (API_BASE_URL, CORS_ORIGIN, FRONTEND_URL)
- [ ] 암호화 키 생성 (ENCRYPTION_MASTER_KEY)
- [ ] 필요한 디렉토리 생성 (uploads, data)

---

## 보안 주의사항

1. **절대로 `.env` 및 `.env.production` 파일을 Git에 커밋하지 마세요**
2. 운영 환경에서는 반드시 `SWAGGER_ENABLED=false` 설정
3. 모든 시크릿 키는 충분히 강력하게 생성
4. HTTPS 사용 필수 (운영 환경)
5. 정기적으로 비밀번호 및 키 교체 권장
