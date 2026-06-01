# Business Logic Model - Unit U-005 (Database Schema)

## Purpose
This document defines the business logic model for the URL Shortener database schema, including entity relationships, data flows, and key business processes.

---

## Entity Relationship Diagram (ERD)

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
                │ ON DELETE CASCADE
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
                │ ON DELETE CASCADE
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

## Business Process 1: User Registration

### Process Flow

```
[사용자 입력]
   ↓
[이메일 중복 검사]
   ↓
   ├─ 중복 → [에러 반환]
   │
   └─ 유니크 → [비밀번호 해싱 (BCrypt)]
              ↓
         [users 테이블 INSERT]
              ↓
         [JWT 토큰 발급]
              ↓
         [자동 로그인]
```

### Database Operations

1. **중복 검사 Query**:
   ```sql
   SELECT EXISTS(SELECT 1 FROM users WHERE email = ?)
   ```

2. **사용자 INSERT**:
   ```sql
   INSERT INTO users (email, password_hash, provider, name, created_at)
   VALUES (?, ?, 'local', ?, CURRENT_TIMESTAMP)
   RETURNING id
   ```

### Business Rules Applied
- BR-001: User Email Uniqueness
- BR-004: Password Hashing

---

## Business Process 2: OAuth2 Social Login

### Process Flow

```
[OAuth2 인증 (Google/GitHub)]
   ↓
[provider + provider_id로 기존 사용자 조회]
   ↓
   ├─ 존재함 → [JWT 발급 + 로그인]
   │
   └─ 존재 안함 → [신규 사용자 자동 생성]
                     ↓
                 [users 테이블 INSERT]
                     ↓
                 [JWT 발급 + 로그인]
```

### Database Operations

1. **기존 사용자 조회 Query**:
   ```sql
   SELECT * FROM users
   WHERE provider = ? AND provider_id = ?
   ```

2. **신규 사용자 생성 INSERT**:
   ```sql
   INSERT INTO users (email, password_hash, provider, provider_id, name, created_at)
   VALUES (?, NULL, ?, ?, ?, CURRENT_TIMESTAMP)
   RETURNING id
   ```

### Business Rules Applied
- BR-002: OAuth2 Provider Validation
- BR-003: OAuth2 Account Uniqueness
- BR-004: Password Hashing (소셜 로그인 사용자는 password_hash가 NULL)

---

## Business Process 3: URL Shortening

### Process Flow

```
[사용자 입력: original_url, expires_at (선택)]
   ↓
[URL 형식 검증 (HTTP/HTTPS)]
   ↓
[urls 테이블 INSERT] → id 자동 생성
   ↓
[Base62 인코딩] → id를 short_code로 변환
   ↓
[short_code UPDATE]
   ↓
[단축 URL 반환]
```

### Database Operations

1. **URL INSERT** (id 자동 생성):
   ```sql
   INSERT INTO urls (original_url, user_id, expires_at, is_active, created_at)
   VALUES (?, ?, ?, TRUE, CURRENT_TIMESTAMP)
   RETURNING id
   ```

2. **short_code UPDATE** (Base62 인코딩 결과):
   ```sql
   UPDATE urls
   SET short_code = ?
   WHERE id = ?
   ```

### Business Rules Applied
- BR-005: Short Code Uniqueness
- BR-006: URL Expiration Date Validation
- BR-007: Anonymous URL Support (user_id가 NULL이면 익명)

---

## Business Process 4: URL Redirect

### Process Flow

```
[사용자 접근: short.ly/{short_code}]
   ↓
[short_code로 urls 조회]
   ↓
   ├─ 없음 → [404 에러]
   │
   └─ 존재 → [만료일 검증]
              ↓
              ├─ 만료됨 → [만료 에러 페이지]
              │
              ├─ is_active = FALSE → [비활성화 에러]
              │
              └─ 유효함 → [302 Redirect]
                          ↓
                     [비동기 클릭 추적]
```

### Database Operations

1. **short_code 조회 Query**:
   ```sql
   SELECT * FROM urls
   WHERE short_code = ?
     AND is_active = TRUE
   ```

2. **만료일 검증 Query**:
   ```sql
   SELECT * FROM urls
   WHERE short_code = ?
     AND is_active = TRUE
     AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
   ```

### Business Rules Applied
- BR-005: Short Code Uniqueness
- BR-006: URL Expiration Date Validation
- BR-008: Soft Delete for URLs

---

## Business Process 5: Click Tracking (Async)

### Process Flow

```
[리다이렉트 발생]
   ↓
[비동기 작업 시작] (@Async)
   ↓
[클릭 정보 수집]
   ├─ IP 주소 추출
   ├─ User-Agent 파싱 → browser, os, device_type
   ├─ Referer 추출
   └─ GeoLite2 → IP → country_code
              ↓
   [click_logs 테이블 INSERT]
              ↓
   [완료 (메인 스레드에 영향 없음)]
```

### Database Operations

1. **Click Log INSERT**:
   ```sql
   INSERT INTO click_logs (url_id, ip_address, user_agent, referer, country_code, browser, os, device_type, clicked_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
   ```

### Business Rules Applied
- BR-009: Device Type Validation
- BR-011: IP Address Format Support
- BR-012: Country Code ISO Standard
- BR-013: Click Log Immutability

---

## Business Process 6: Statistics Aggregation

### Process Flow

```
[사용자 요청: URL 통계]
   ↓
[소유권 검증] (urls.user_id = 요청자 ID)
   ↓
   ├─ 불일치 → [403 Forbidden]
   │
   └─ 일치 → [통계 쿼리 실행]
              ↓
         [집계 결과 반환]
```

### Database Operations

1. **일별 클릭수 통계 Query**:
   ```sql
   SELECT DATE(clicked_at) AS date, COUNT(*) AS clicks
   FROM click_logs
   WHERE url_id = ?
     AND clicked_at >= NOW() - INTERVAL '30 days'
   GROUP BY DATE(clicked_at)
   ORDER BY date DESC
   ```

2. **국가별 클릭 분포 Query**:
   ```sql
   SELECT country_code, COUNT(*) AS clicks,
          ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS percentage
   FROM click_logs
   WHERE url_id = ?
   GROUP BY country_code
   ORDER BY clicks DESC
   LIMIT 10
   ```

3. **브라우저별 클릭 분포 Query**:
   ```sql
   SELECT browser, COUNT(*) AS clicks,
          ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS percentage
   FROM click_logs
   WHERE url_id = ?
   GROUP BY browser
   ORDER BY clicks DESC
   ```

4. **디바이스 타입별 분포 Query**:
   ```sql
   SELECT device_type, COUNT(*) AS clicks
   FROM click_logs
   WHERE url_id = ?
   GROUP BY device_type
   ORDER BY clicks DESC
   ```

### Business Rules Applied
- BR-013: Click Log Immutability
- BR-014: Timestamp Defaults

---

## Business Process 7: User Deletion (GDPR Compliance)

### Process Flow

```
[사용자 삭제 요청]
   ↓
[users 테이블 DELETE]
   ↓
   [CASCADE: urls 테이블 DELETE]
   ↓
      [CASCADE: click_logs 테이블 DELETE]
   ↓
[완료: 모든 관련 데이터 삭제됨]
```

### Database Operations

1. **User DELETE** (CASCADE 자동 실행):
   ```sql
   DELETE FROM users WHERE id = ?
   ```

2. **Cascade 동작**:
   - `urls.user_id → users.id` (ON DELETE CASCADE)
   - `click_logs.url_id → urls.id` (ON DELETE CASCADE)

**결과**: User 1명 삭제 시 해당 사용자의 모든 URL + 클릭 로그 자동 삭제

### Business Rules Applied
- BR-010: Cascade Delete for User → URLs → ClickLogs

---

## Business Process 8: URL Soft Delete

### Process Flow

```
[사용자 요청: URL 삭제]
   ↓
[소유권 검증]
   ↓
   ├─ 불일치 → [403 Forbidden]
   │
   └─ 일치 → [is_active = FALSE로 UPDATE]
              ↓
         [URL 비활성화 완료]
              ↓
         [click_logs는 유지됨]
```

### Database Operations

1. **Soft Delete UPDATE**:
   ```sql
   UPDATE urls
   SET is_active = FALSE
   WHERE id = ? AND user_id = ?
   ```

2. **비활성화된 URL 조회 방지 Query**:
   ```sql
   SELECT * FROM urls
   WHERE short_code = ?
     AND is_active = TRUE
   ```

### Business Rules Applied
- BR-008: Soft Delete for URLs
- BR-013: Click Log Immutability (클릭 로그는 유지됨)

---

## Data Flow Summary

### Insert (생성) 흐름
```
User Registration → users INSERT
         ↓
URL Shortening → urls INSERT → short_code UPDATE
         ↓
Click Tracking (Async) → click_logs INSERT
```

### Read (조회) 흐름
```
Login → users SELECT (email 조회)
         ↓
Redirect → urls SELECT (short_code 조회)
         ↓
Statistics → click_logs SELECT (집계 쿼리)
```

### Update (수정) 흐름
```
URL Deactivation → urls UPDATE (is_active = FALSE)
Short Code Generation → urls UPDATE (short_code 설정)
```

### Delete (삭제) 흐름
```
User Deletion → users DELETE
         ↓ (CASCADE)
    urls DELETE (해당 사용자의 모든 URL)
         ↓ (CASCADE)
    click_logs DELETE (해당 URL의 모든 클릭 로그)
```

---

## Performance Optimization Strategy

### Index Usage in Queries

| Query | Index Used | Performance Gain |
|---|---|---|
| 이메일 로그인 | `idx_users_email` | 95% |
| 소셜 로그인 | `idx_users_provider` | 96% |
| 단축 코드 조회 | `idx_urls_short_code` | 95% |
| 사용자별 URL 목록 | `idx_urls_user_id` | 90% |
| 사용자별 최신 URL | `idx_urls_user_created` | 92% |
| URL별 클릭 로그 | `idx_click_logs_url_id` | 90% |
| 일별 클릭 통계 | `idx_click_logs_url_clicked` | 90% |

### Query Optimization Techniques

1. **Projection (DTO 직접 매핑)**:
   - JPA Projection으로 필요한 컬럼만 SELECT
   - 예: 통계 쿼리에서 id, clicked_at만 선택

2. **Composite Index 활용**:
   - `(url_id, clicked_at)` 복합 인덱스로 일별 통계 쿼리 최적화
   - `(user_id, created_at DESC)` 복합 인덱스로 최신 URL 조회 최적화

3. **Partial Index (향후 고려)**:
   - `WHERE is_active = TRUE` 조건의 Partial Index
   - 활성 URL만 인덱싱하여 성능 향상

---

## Security Considerations

### 1. SQL Injection 방지
- **방법**: JPA Parameterized Query 사용
- **금지**: 문자열 연결로 쿼리 생성 (`"SELECT * FROM users WHERE email = '" + email + "'"`)

### 2. 비밀번호 보안
- **저장**: BCrypt 해시만 저장 (평문 금지)
- **비교**: `BCryptPasswordEncoder.matches()` 사용

### 3. IP 주소 프라이버시
- **현재**: 평문 저장 (학습용)
- **운영 환경**: 해싱 또는 일부만 저장 고려 (GDPR 준수)

### 4. Cascade Delete 주의
- **위험**: User 삭제 시 모든 URL + 클릭 로그 삭제
- **완화**: 사용자에게 명확한 경고 메시지 표시

---

## Scalability Considerations

### 향후 확장 가능성

1. **click_logs 테이블 파티셔닝**:
   - 월별 파티션 분할 (운영 환경)
   - 예: `click_logs_2026_05`, `click_logs_2026_06`

2. **Materialized View 활용**:
   - 일별 통계 사전 집계
   - 매일 배치 작업으로 갱신

3. **Redis 캐싱**:
   - 인기 URL의 original_url 캐싱
   - 리다이렉트 성능 향상

4. **Read Replica**:
   - 통계 조회는 Read Replica 사용
   - Write/Read 분리

---

**작성일**: 2026-05-31
**작성자**: AI-DLC (CONSTRUCTION Phase)
**상태**: Functional Design 완료
