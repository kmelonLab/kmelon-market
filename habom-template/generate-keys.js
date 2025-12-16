#!/usr/bin/env node

/**
 * Habom Market - 보안 키 생성 스크립트
 *
 * 이 스크립트는 시스템 설정에 필요한 모든 보안 키를 생성합니다.
 *
 * 사용법:
 *   node generate-keys.js
 *
 * 출력:
 *   - 콘솔에 생성된 키 출력
 *   - generated-keys.txt 파일에 저장 (보안 주의!)
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ANSI 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

/**
 * 키 생성 함수
 */
function generateKeys() {
  return {
    // JWT Secret (64바이트)
    JWT_SECRET: crypto.randomBytes(64).toString('hex'),

    // API Key (32바이트)
    API_KEY: crypto.randomBytes(32).toString('hex'),

    // Webhook Signature Secret (32바이트)
    WEBHOOK_SIGNATURE_SECRET: crypto.randomBytes(32).toString('hex'),

    // Encryption Master Key (Base64)
    ENCRYPTION_MASTER_KEY: crypto.randomBytes(32).toString('base64'),

    // Swagger Password (16바이트)
    SWAGGER_PASSWORD: crypto.randomBytes(16).toString('hex'),

    // MySQL Passwords
    MYSQL_ROOT_PASSWORD: generateStrongPassword(24),
    MYSQL_PASSWORD: generateStrongPassword(24),
  };
}

/**
 * 강력한 비밀번호 생성
 */
function generateStrongPassword(length = 24) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }

  return password;
}

/**
 * 콘솔에 섹션 출력
 */
function printSection(title, content, color = colors.cyan) {
  console.log(`\n${colors.bright}${color}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}${color}${title}${colors.reset}`);
  console.log(`${colors.bright}${color}${'='.repeat(80)}${colors.reset}\n`);
  console.log(content);
}

/**
 * 키-값 쌍 출력
 */
function printKeyValue(key, value, indent = 0) {
  const indentStr = ' '.repeat(indent);
  console.log(`${indentStr}${colors.yellow}${key}${colors.reset}=${colors.green}${value}${colors.reset}`);
}

/**
 * 파일별 환경변수 생성
 */
function generateEnvContent(keys) {
  const sections = {
    // .env (Docker Compose)
    dockerCompose: `# ==============================================================================
# Docker Compose Environment (.env)
# 생성 일시: ${new Date().toISOString()}
# ==============================================================================

# MySQL 공통 설정
MYSQL_ROOT_PASSWORD=${keys.MYSQL_ROOT_PASSWORD}
MYSQL_USER=marketuser
MYSQL_PASSWORD=${keys.MYSQL_PASSWORD}

# MySQL 데이터베이스 설정
MYSQL_MARKET_DATABASE=market_db
MYSQL_MARKET_PORT=12057
MYSQL_PAY_DATABASE=pay_db
MYSQL_PAY_PORT=12058

# 서비스 포트 설정
BACKEND_PAY_PORT=12051
BACKEND_MARKET_PORT=12053
FRONTEND_MARKET_PORT=12055

# 타임존
TZ=Asia/Seoul
`,

    // backend-market/.env.production
    backendMarket: `# ==============================================================================
# Backend-Market Environment (.env.production)
# 생성 일시: ${new Date().toISOString()}
# ==============================================================================

# Server
PORT=8081
NODE_ENV=production
API_BASE_URL=<YOUR_BACKEND_MARKET_URL>

# Database (MySQL)
DB_HOST=mysql-market
DB_PORT=3306
DB_USERNAME=marketuser
DB_PASSWORD=${keys.MYSQL_PASSWORD}
DB_DATABASE=market_db
DB_CHARSET=utf8mb4
DB_POOL_MAX=20
DB_SYNCHRONIZE=true
DB_LOGGING=false
DB_TIMEZONE=Z

# JWT Authentication
JWT_SECRET=${keys.JWT_SECRET}
JWT_EXPIRES_IN=1h

# CORS
CORS_ORIGIN=<YOUR_FRONTEND_URL>

# Swagger
SWAGGER_ENABLED=false

# Rate Limiting
RATE_LIMIT_TTL=60000
RATE_LIMIT_DEFAULT=60
RATE_LIMIT_STRICT=5
RATE_LIMIT_RELAXED=120

# Logging
LOG_LEVEL=info

# Frontend URL
FRONTEND_URL=<YOUR_FRONTEND_URL>
`,

    // backend-pay/.env.production
    backendPay: `# ==============================================================================
# Backend-Pay Environment (.env.production)
# 생성 일시: ${new Date().toISOString()}
# ==============================================================================

# Server
PORT=8080
NODE_ENV=production

# Toss Payments API
TOSS_SECRET_KEY=<YOUR_TOSS_SECRET_KEY>
TOSS_CLIENT_KEY=<YOUR_TOSS_CLIENT_KEY>
TOSS_API_BASE=https://api.tosspayments.com

# Database (MySQL)
DATABASE_URL=mysql://marketuser:${keys.MYSQL_PASSWORD}@mysql-pay:3306/pay_db?charset=utf8mb4
DB_SYNCHRONIZE=true
DB_TIMEZONE=Z
DB_POOL_MAX=20
DB_POOL_MIN=5

# JWT Authentication
JWT_SECRET=${keys.JWT_SECRET}
JWT_EXPIRES_IN=1h
API_KEY=${keys.API_KEY}

# CORS
CORS_ORIGIN=<YOUR_FRONTEND_URL>

# Swagger
SWAGGER_USER=admin
SWAGGER_PASSWORD=${keys.SWAGGER_PASSWORD}
SWAGGER_IP_WHITELIST=<YOUR_ADMIN_IP>

# Webhook Configuration
WEBHOOK_SIGNATURE_SECRET=${keys.WEBHOOK_SIGNATURE_SECRET}
WEBHOOK_IP_WHITELIST=13.124.18.147,13.124.108.35,3.36.173.151,3.38.81.32,115.92.221.121,115.92.221.122,115.92.221.123,115.92.221.125,115.92.221.126,115.92.221.127
WEBHOOK_IP_WHITELIST_ENABLED=true
WEBHOOK_MAX_RETRIES=3
WEBHOOK_BASE_DELAY_MS=60000
WEBHOOK_MAX_DELAY_MS=3600000

# Rate Limiting
RATE_LIMIT_TTL=60000
RATE_LIMIT_DEFAULT=50
RATE_LIMIT_STRICT=5
RATE_LIMIT_VERY_STRICT=3
RATE_LIMIT_RELAXED=200
RATE_LIMIT_ORDER=30

# Logging
LOG_LEVEL=warn
LOG_RETENTION_DAYS=30
ERROR_LOG_RETENTION_DAYS=90
AUDIT_LOG_RETENTION_DAYS=365

# Email/SMTP Configuration
SMTP_HOST=<YOUR_SMTP_HOST>
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=<YOUR_SMTP_USER>
SMTP_PASSWORD=<YOUR_SMTP_PASSWORD>
SMTP_TLS_REJECT_UNAUTHORIZED=true
EMAIL_FROM=<YOUR_EMAIL_FROM>
EMAIL_FROM_NAME=<YOUR_SERVICE_NAME>

# Payment Validation
PAYMENT_MIN_AMOUNT=100
PAYMENT_MAX_AMOUNT=10000000
PAYMENT_DAILY_LIMIT=50000000
PAYMENT_DAILY_TRANSACTION_LIMIT=100
PAYMENT_ANOMALY_THRESHOLD=3
PAYMENT_AVERAGE_AMOUNT=100000

# Encryption
ENCRYPTION_KEY_PROVIDER=local
ENCRYPTION_MASTER_KEY=${keys.ENCRYPTION_MASTER_KEY}
ENCRYPTION_KEY_VERSION=1
ENCRYPTION_PREVIOUS_KEYS=

# Elasticsearch (선택사항)
ELASTICSEARCH_URL=
ELASTICSEARCH_USERNAME=
ELASTICSEARCH_PASSWORD=
ELASTICSEARCH_INDEX_PREFIX=tosspayments-logs
ELASTICSEARCH_TLS_REJECT_UNAUTHORIZED=true

# Sentry APM (선택사항)
SENTRY_DSN=
`,

    // frontend-market/.env.production
    frontendMarket: `# ============================================
# Frontend-Market Environment (.env.production)
# 생성 일시: ${new Date().toISOString()}
# ============================================

# API URLs
VITE_API_URL=<YOUR_BACKEND_MARKET_URL>/api
VITE_PAYMENT_API_URL=<YOUR_BACKEND_PAY_URL>

# TossPayments Client Key
VITE_TOSS_CLIENT_KEY=<YOUR_TOSS_CLIENT_KEY>

# Display Settings
VITE_DISPLAY_TIMEZONE=Asia/Seoul
VITE_DISPLAY_LOCALE=ko-KR
`,
  };

  return sections;
}

/**
 * 메인 함수
 */
function main() {
  console.clear();

  printSection('Habom Market - 보안 키 생성 스크립트',
    `이 스크립트는 시스템 설정에 필요한 모든 보안 키를 자동으로 생성합니다.
생성된 키는 반드시 안전하게 보관하고, 절대 Git에 커밋하지 마세요!`,
    colors.magenta);

  console.log(`${colors.yellow}⚠️  보안 경고:${colors.reset}`);
  console.log(`   - 생성된 키는 반드시 안전한 곳에 보관하세요`);
  console.log(`   - generated-keys.txt 파일은 절대 Git에 커밋하지 마세요`);
  console.log(`   - 운영 환경에서는 키 관리 시스템 사용을 권장합니다\n`);

  // 키 생성
  console.log(`${colors.cyan}🔐 키 생성 중...${colors.reset}\n`);
  const keys = generateKeys();

  // 콘솔 출력
  printSection('1. 공통 키 (전체 시스템)', '');
  printKeyValue('JWT_SECRET', keys.JWT_SECRET);
  console.log(`   ${colors.blue}→ 사용 위치: backend-market, backend-pay (동일한 값 사용)${colors.reset}`);

  printSection('2. MySQL 비밀번호 (.env)', '');
  printKeyValue('MYSQL_ROOT_PASSWORD', keys.MYSQL_ROOT_PASSWORD);
  printKeyValue('MYSQL_PASSWORD', keys.MYSQL_PASSWORD);
  console.log(`   ${colors.blue}→ 사용 위치: .env, backend-market, backend-pay${colors.reset}`);

  printSection('3. Backend-Pay 전용 키 (backend-pay/.env.production)', '');
  printKeyValue('API_KEY', keys.API_KEY);
  printKeyValue('WEBHOOK_SIGNATURE_SECRET', keys.WEBHOOK_SIGNATURE_SECRET);
  printKeyValue('ENCRYPTION_MASTER_KEY', keys.ENCRYPTION_MASTER_KEY);
  printKeyValue('SWAGGER_PASSWORD', keys.SWAGGER_PASSWORD);

  // 파일별 환경변수 생성
  const envContents = generateEnvContent(keys);

  // 출력 디렉토리 생성
  const outputDir = path.join(__dirname, 'generated-keys');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 파일 저장
  printSection('4. 환경변수 파일 생성', '');

  const files = [
    { name: '.env', content: envContents.dockerCompose, desc: 'Docker Compose 환경변수' },
    { name: 'backend-market.env.production', content: envContents.backendMarket, desc: 'Backend-Market 환경변수' },
    { name: 'backend-pay.env.production', content: envContents.backendPay, desc: 'Backend-Pay 환경변수' },
    { name: 'frontend-market.env.production', content: envContents.frontendMarket, desc: 'Frontend-Market 환경변수' },
  ];

  files.forEach(file => {
    const filePath = path.join(outputDir, file.name);
    fs.writeFileSync(filePath, file.content, 'utf8');
    console.log(`${colors.green}✓${colors.reset} ${file.desc}: ${colors.cyan}${filePath}${colors.reset}`);
  });

  // 전체 키 요약 파일 저장
  const summaryContent = `# Habom Market - 생성된 보안 키
# 생성 일시: ${new Date().toISOString()}
#
# ⚠️  보안 경고: 이 파일은 절대 Git에 커밋하지 마세요!
# 안전한 곳에 백업 후 삭제하는 것을 권장합니다.

# ==============================================================================
# 공통 키
# ==============================================================================

# JWT Secret (backend-market, backend-pay 공통 사용)
JWT_SECRET=${keys.JWT_SECRET}

# ==============================================================================
# MySQL 비밀번호 (.env, backend-market, backend-pay)
# ==============================================================================

MYSQL_ROOT_PASSWORD=${keys.MYSQL_ROOT_PASSWORD}
MYSQL_PASSWORD=${keys.MYSQL_PASSWORD}

# ==============================================================================
# Backend-Pay 전용 키
# ==============================================================================

API_KEY=${keys.API_KEY}
WEBHOOK_SIGNATURE_SECRET=${keys.WEBHOOK_SIGNATURE_SECRET}
ENCRYPTION_MASTER_KEY=${keys.ENCRYPTION_MASTER_KEY}
SWAGGER_PASSWORD=${keys.SWAGGER_PASSWORD}

# ==============================================================================
# 키 사용 위치 매핑
# ==============================================================================

# .env (Docker Compose)
# - MYSQL_ROOT_PASSWORD
# - MYSQL_PASSWORD

# backend-market/.env.production
# - JWT_SECRET
# - DB_PASSWORD (= MYSQL_PASSWORD)

# backend-pay/.env.production
# - JWT_SECRET (backend-market과 동일)
# - API_KEY
# - WEBHOOK_SIGNATURE_SECRET
# - ENCRYPTION_MASTER_KEY
# - SWAGGER_PASSWORD
# - DATABASE_URL에 MYSQL_PASSWORD 포함

# ==============================================================================
# 다음 단계
# ==============================================================================

1. generated-keys/ 폴더의 파일들을 각 위치로 복사:
   - .env → habom-template-shared/.env
   - backend-market.env.production → habom-template-shared/backend-market/.env.production
   - backend-pay.env.production → habom-template-shared/backend-pay/.env.production
   - frontend-market.env.production → habom-template-shared/frontend-market/.env.production

2. 각 파일에서 <YOUR_...> 부분을 실제 값으로 수정:
   - TossPayments API 키
   - 도메인 URL
   - SMTP 설정
   - IP 화이트리스트

3. 이 파일(generated-keys.txt)을 안전한 곳에 백업

4. generated-keys/ 폴더 삭제 (보안)
`;

  const summaryPath = path.join(outputDir, 'generated-keys.txt');
  fs.writeFileSync(summaryPath, summaryContent, 'utf8');

  printSection('5. 완료!', '');
  console.log(`${colors.green}✓${colors.reset} 모든 키가 생성되었습니다!`);
  console.log(`${colors.green}✓${colors.reset} 키 요약: ${colors.cyan}${summaryPath}${colors.reset}\n`);

  console.log(`${colors.bright}${colors.yellow}다음 단계:${colors.reset}`);
  console.log(`  1. ${colors.cyan}generated-keys/${colors.reset} 폴더의 파일들을 각 위치로 복사`);
  console.log(`  2. 각 파일에서 ${colors.yellow}<YOUR_...>${colors.reset} 부분을 실제 값으로 수정`);
  console.log(`  3. ${colors.cyan}generated-keys.txt${colors.reset} 파일을 안전한 곳에 백업`);
  console.log(`  4. ${colors.red}generated-keys/ 폴더 삭제${colors.reset} (보안)\n`);

  console.log(`${colors.bright}${colors.green}자세한 내용은 KEYS-GENERATION.md 파일을 참조하세요.${colors.reset}\n`);
}

// 실행
main();
