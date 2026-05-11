# Entity Relationship Diagram (ERD)

URL 단축 서비스의 데이터베이스 스키마 ERD 문서입니다.

---

## 📊 ERD 다이어그램

```
┌─────────────────────────────────────────┐
│             users                       │
├─────────────────────────────────────────┤
│ PK  id                BIGSERIAL         │
│ UK  email             VARCHAR(255)      │
│     password_hash     VARCHAR(255)      │
│     provider          VARCHAR(50)       │
│     provider_id       VARCHAR(255)      │
│     name              VARCHAR(100)      │
│     created_at        TIMESTAMP         │
├─────────────────────────────────────────┤
│ UK: (provider, provider_id)             │
│ CHK: provider IN ('local','google',     │
│                   'github')             │
└─────────────────────────────────────────┘
                │
                │ 1:N (user_id FK, NULL 허용)
                │
                ▼
┌─────────────────────────────────────────┐
│             urls                        │
├─────────────────────────────────────────┤
│ PK  id                BIGSERIAL         │
│ UK  short_code        VARCHAR(10)       │
│     original_url      TEXT              │
│ FK  user_id           BIGINT            │ ◄─┐ NULL = 익명 사용자
│     created_at        TIMESTAMP         │
│     expires_at        TIMESTAMP         │
│     is_active         BOOLEAN           │
├─────────────────────────────────────────┤
│ CHK: expires_at IS NULL OR              │
│      expires_at > created_at            │
└─────────────────────────────────────────┘
                │
                │ 1:N (url_id FK)
                │
                ▼
┌─────────────────────────────────────────┐
│          click_logs                     │
├─────────────────────────────────────────┤
│ PK  id                BIGSERIAL         │
│ FK  url_id            BIGINT            │
│     ip_address        VARCHAR(45)       │
│     user_agent        TEXT              │
│     referer           TEXT              │
│     country_code      VARCHAR(2)        │
│     browser           VARCHAR(50)       │
│     os                VARCHAR(50)       │
│     device_type       VARCHAR(20)       │
│     clicked_at        TIMESTAMP         │
├─────────────────────────────────────────┤
│ CHK: device_type IN ('mobile',          │
│      'desktop','tablet','unknown')      │
└─────────────────────────────────────────┘
```

---

## 🔗 관계 (Relationships)

### 1. users → urls (1:N)
- **관계**: 한 명의 사용자가 여러 개의 URL 생성 가능
- **카디널리티**: 1:N (One-to-Many)
- **외래 키**: `urls.user_id` → `users.id`
- **CASCADE**: `ON DELETE CASCADE` (사용자 삭제 시 해당 사용자의 모든 URL 삭제)
- **NULL 허용**: `user_id`가 NULL이면 익명 사용자가 생성한 URL

### 2. urls → click_logs (1:N)
- **관계**: 한 개의 URL이 여러 번 클릭될 수 있음
- **카디널리티**: 1:N (One-to-Many)
- **외래 키**: `click_logs.url_id` → `urls.id`
- **CASCADE**: `ON DELETE CASCADE` (URL 삭제 시 해당 URL의 모든 클릭 로그 삭제)
- **NULL 허용**: 불가 (`url_id NOT NULL`)

---

## 📋 테이블 상세

### users 테이블

| 컬럼 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | BIGSERIAL | PK | 사용자 고유 ID (자동 증가) |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 주소 (로그인 ID) |
| password_hash | VARCHAR(255) | NULL 허용 | BCrypt 해시 (소셜 로그인 시 NULL) |
| provider | VARCHAR(50) | NULL 허용, CHECK | 'local', 'google', 'github' |
| provider_id | VARCHAR(255) | NULL 허용 | OAuth2 제공자의 사용자 ID |
| name | VARCHAR(100) | NULL 허용 | 사용자 이름/닉네임 |
| created_at | TIMESTAMP | DEFAULT NOW | 계정 생성 일시 |

**제약조건**:
- `UNIQUE (provider, provider_id)`: 동일한 소셜 계정 중복 방지
- `CHECK (provider IN ('local', 'google', 'github'))`: provider 값 제한

**인덱스**:
- `idx_users_email` (email)
- `idx_users_provider` (provider, provider_id)

---

### urls 테이블

| 컬럼 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | BIGSERIAL | PK | URL 고유 ID (Base62 인코딩 소스) |
| short_code | VARCHAR(10) | UNIQUE, NOT NULL | Base62 인코딩된 단축 코드 |
| original_url | TEXT | NOT NULL | 원본 URL |
| user_id | BIGINT | FK, NULL 허용 | 생성한 사용자 (NULL이면 익명) |
| created_at | TIMESTAMP | DEFAULT NOW | URL 생성 일시 |
| expires_at | TIMESTAMP | NULL 허용, CHECK | 만료 일시 (NULL이면 영구) |
| is_active | BOOLEAN | DEFAULT TRUE | 활성 상태 |

**제약조건**:
- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
- `CHECK (expires_at IS NULL OR expires_at > created_at)`: 만료일이 생성일 이후

**인덱스**:
- `idx_urls_short_code` (short_code)
- `idx_urls_user_id` (user_id)
- `idx_urls_expires_at` (expires_at)
- `idx_urls_user_created` (user_id, created_at DESC): 복합 인덱스

---

### click_logs 테이블

| 컬럼 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | BIGSERIAL | PK | 클릭 로그 고유 ID |
| url_id | BIGINT | FK, NOT NULL | 클릭된 URL |
| ip_address | VARCHAR(45) | NULL 허용 | IP 주소 (IPv4/IPv6) |
| user_agent | TEXT | NULL 허용 | User-Agent 문자열 |
| referer | TEXT | NULL 허용 | HTTP Referer 헤더 |
| country_code | VARCHAR(2) | NULL 허용 | 국가 코드 (GeoLite2) |
| browser | VARCHAR(50) | NULL 허용 | 브라우저 이름 |
| os | VARCHAR(50) | NULL 허용 | 운영체제 |
| device_type | VARCHAR(20) | NULL 허용, CHECK | 디바이스 타입 |
| clicked_at | TIMESTAMP | DEFAULT NOW | 클릭 발생 일시 |

**제약조건**:
- `FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE`
- `CHECK (device_type IN ('mobile', 'desktop', 'tablet', 'unknown'))`

**인덱스**:
- `idx_click_logs_url_id` (url_id)
- `idx_click_logs_clicked_at` (clicked_at)
- `idx_click_logs_url_clicked` (url_id, clicked_at): 복합 인덱스

---

## 🔍 인덱스 전략

### 단일 컬럼 인덱스
| 테이블 | 인덱스 | 컬럼 | 용도 |
|---|---|---|---|
| users | idx_users_email | email | 로그인 시 이메일 조회 |
| urls | idx_urls_short_code | short_code | 리다이렉트 시 단축 코드 조회 |
| urls | idx_urls_user_id | user_id | 사용자별 URL 목록 조회 |
| urls | idx_urls_expires_at | expires_at | 만료된 URL 필터링 |
| click_logs | idx_click_logs_url_id | url_id | URL별 클릭 로그 조회 |
| click_logs | idx_click_logs_clicked_at | clicked_at | 시간 범위별 조회 |

### 복합 인덱스
| 테이블 | 인덱스 | 컬럼 | 용도 |
|---|---|---|---|
| users | idx_users_provider | (provider, provider_id) | 소셜 로그인 조회 |
| urls | idx_urls_user_created | (user_id, created_at DESC) | 사용자별 최신 URL 조회 |
| click_logs | idx_click_logs_url_clicked | (url_id, clicked_at) | 일별 통계 쿼리 최적화 |

---

## 📊 데이터 예상 볼륨

### 학습용 프로젝트 (2주)
| 테이블 | 예상 레코드 수 | 디스크 사용량 |
|---|---|---|
| users | ~10 | < 1 KB |
| urls | ~50 | < 10 KB |
| click_logs | ~500 | < 100 KB |

### 운영 환경 예상 (참고)
| 테이블 | 예상 레코드 수 | 디스크 사용량 |
|---|---|---|
| users | 10,000 | ~1 MB |
| urls | 1,000,000 | ~100 MB |
| click_logs | 100,000,000 | ~10 GB |

**참고**: 운영 환경에서는 click_logs 테이블 파티셔닝 고려 필요 (월별 파티션)

---

## 🛡️ 데이터 무결성

### Foreign Key Constraints
1. `urls.user_id` → `users.id`
   - ON DELETE CASCADE: 사용자 삭제 시 해당 사용자의 모든 URL 삭제
   - NULL 허용: 익명 사용자 URL 지원

2. `click_logs.url_id` → `urls.id`
   - ON DELETE CASCADE: URL 삭제 시 해당 URL의 모든 클릭 로그 삭제
   - NOT NULL: 모든 클릭 로그는 URL과 연결되어야 함

### CHECK Constraints
1. `users.provider` IN ('local', 'google', 'github')
   - 정의되지 않은 provider 값 방지

2. `urls.expires_at` IS NULL OR `expires_at` > `created_at`
   - 만료일이 생성일보다 앞서는 것 방지

3. `click_logs.device_type` IN ('mobile', 'desktop', 'tablet', 'unknown')
   - 정의되지 않은 디바이스 타입 방지

### UNIQUE Constraints
1. `users.email`: 이메일 중복 방지
2. `users.(provider, provider_id)`: 동일한 소셜 계정 중복 방지
3. `urls.short_code`: 단축 코드 중복 방지

---

## 🔐 보안 고려사항

### 1. 비밀번호 저장
- BCrypt 해싱 사용
- `password_hash` 컬럼에 해시값만 저장 (평문 금지)
- Salt는 BCrypt가 자동 생성

### 2. IP 주소 저장
- 학습용 프로젝트: 평문 저장
- 운영 환경: GDPR 고려 필요
  - 옵션 1: IP 해싱 (SHA-256)
  - 옵션 2: IP 일부만 저장 (예: `203.0.113.*`)
  - 옵션 3: 개인정보처리방침에 IP 수집 명시

### 3. SQL Injection 방지
- JPA Parameterized Query 사용
- 사용자 입력값 직접 쿼리 삽입 금지

---

## 📝 마이그레이션 순서

1. **V1__create_users.sql**: users 테이블 생성
2. **V2__create_urls.sql**: urls 테이블 생성 (users 참조)
3. **V3__create_click_logs.sql**: click_logs 테이블 생성 (urls 참조)
4. **V4__insert_sample_data.sql**: 샘플 데이터 삽입

**Flyway 실행 순서**: V1 → V2 → V3 → V4

---

## 🔄 확장 가능성

### 향후 추가 가능한 테이블

1. **url_tags** (URL 태그)
   - url_id, tag_name
   - 사용자가 URL에 태그 추가 가능

2. **url_statistics** (집계 테이블)
   - url_id, date, click_count
   - Materialized View 또는 배치 작업으로 일별 집계

3. **custom_domains** (커스텀 도메인)
   - user_id, domain, is_verified
   - 사용자가 자신의 도메인 사용 가능

---

**생성일**: 2026-05-06
**버전**: 1.0
**상태**: 설계 완료, 구현 대기
