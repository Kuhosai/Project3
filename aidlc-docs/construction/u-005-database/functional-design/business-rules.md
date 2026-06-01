# Business Rules - Unit U-005 (Database Schema)

## Purpose
This document defines the business rules enforced at the database level for the URL Shortener service.

---

## BR-001: User Email Uniqueness

**Rule**: 동일한 이메일 주소로 여러 계정을 생성할 수 없음

**Enforcement**: Database UNIQUE constraint on `users.email`

**SQL Implementation**:
```sql
email VARCHAR(255) UNIQUE NOT NULL
```

**Business Rationale**:
- 이메일은 로그인 ID로 사용되므로 유니크해야 함
- 동일한 이메일로 여러 계정 생성 방지

**Error Handling**:
- 중복 이메일 삽입 시 PostgreSQL 에러 발생
- 애플리케이션에서 `DataIntegrityViolationException` 처리 필요

---

## BR-002: OAuth2 Provider Validation

**Rule**: provider 값은 'local', 'google', 'github' 중 하나만 허용

**Enforcement**: Database CHECK constraint on `users.provider`

**SQL Implementation**:
```sql
CONSTRAINT chk_provider CHECK (provider IN ('local', 'google', 'github'))
```

**Business Rationale**:
- 지원하지 않는 OAuth2 제공자의 데이터 삽입 방지
- 데이터 무결성 보장

**Error Handling**:
- 잘못된 provider 값 삽입 시 PostgreSQL 에러 발생
- 애플리케이션에서 provider 값 사전 검증 필요

---

## BR-003: OAuth2 Account Uniqueness

**Rule**: 동일한 OAuth2 제공자의 동일한 사용자 ID로 여러 계정 생성 불가

**Enforcement**: Database UNIQUE constraint on `(provider, provider_id)`

**SQL Implementation**:
```sql
CONSTRAINT uk_users_provider UNIQUE (provider, provider_id)
```

**Business Rationale**:
- Google 계정 `google-user-123`으로 여러 번 가입 방지
- 소셜 로그인 사용자 중복 방지

**Error Handling**:
- 중복 (provider, provider_id) 삽입 시 PostgreSQL 에러 발생
- 애플리케이션에서 기존 사용자 조회 후 로그인 처리

---

## BR-004: Password Hashing

**Rule**: 비밀번호는 절대 평문으로 저장하지 않으며, BCrypt 해시만 저장

**Enforcement**: Application-level validation (DB에는 VARCHAR(255) 컬럼만 존재)

**Implementation**:
- Spring Security의 `BCryptPasswordEncoder` 사용
- 해시 길이: 60자 (BCrypt 기본)
- VARCHAR(255)로 설정하여 향후 해싱 알고리즘 변경 대비

**Business Rationale**:
- 보안: 데이터베이스 유출 시에도 비밀번호 안전
- 규정 준수: GDPR, 개인정보보호법

**Error Handling**:
- 애플리케이션에서 평문 비밀번호 삽입 시도 시 검증 로직 필요
- 코드 리뷰 시 password_hash에 평문 저장 여부 확인

---

## BR-005: Short Code Uniqueness

**Rule**: 단축 코드는 유니크해야 하며, 중복된 short_code 생성 불가

**Enforcement**: Database UNIQUE constraint on `urls.short_code`

**SQL Implementation**:
```sql
short_code VARCHAR(10) UNIQUE NOT NULL
```

**Business Rationale**:
- 단축 URL의 유일성 보장
- 동일한 short_code로 여러 URL 매핑 방지

**Error Handling**:
- 중복 short_code 삽입 시 PostgreSQL 에러 발생
- 애플리케이션에서 재시도 로직 구현 (새로운 short_code 생성)

**Conflict Resolution**:
- Base62 인코딩으로 ID → short_code 변환하므로 충돌 가능성 극히 낮음
- 충돌 발생 시: ID 재생성 또는 무작위 문자 추가

---

## BR-006: URL Expiration Date Validation

**Rule**: URL 만료일은 생성일보다 나중이어야 함

**Enforcement**: Database CHECK constraint on `urls.expires_at`

**SQL Implementation**:
```sql
CONSTRAINT chk_expires_after_created CHECK (expires_at IS NULL OR expires_at > created_at)
```

**Business Rationale**:
- 논리적 오류 방지 (생성일보다 앞선 만료일 설정 불가)
- 데이터 무결성 보장

**Error Handling**:
- 잘못된 expires_at 값 삽입 시 PostgreSQL 에러 발생
- 애플리케이션에서 사전 검증 필요

---

## BR-007: Anonymous URL Support

**Rule**: user_id가 NULL인 경우 익명 사용자가 생성한 URL로 간주

**Enforcement**: Database NULL constraint (user_id allows NULL)

**SQL Implementation**:
```sql
user_id BIGINT,  -- NULL 허용
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```

**Business Rationale**:
- 회원 가입 없이 URL 단축 기능 사용 가능
- 사용자 편의성 향상

**Lifecycle**:
- 익명 URL은 사용자 삭제에 영향받지 않음 (user_id가 NULL이므로)
- 만료일 또는 is_active=false로만 비활성화 가능

---

## BR-008: Soft Delete for URLs

**Rule**: URL 삭제는 is_active를 FALSE로 설정 (hard delete 아님)

**Enforcement**: Application-level logic (DB에는 BOOLEAN 컬럼만 존재)

**SQL Implementation**:
```sql
is_active BOOLEAN DEFAULT TRUE
```

**Business Rationale**:
- 데이터 복구 가능성 확보
- 삭제된 URL 통계 유지 (click_logs는 CASCADE DELETE되지 않음)
- 실수로 삭제한 URL 복구 가능

**Implementation**:
- 삭제 요청 시: `UPDATE urls SET is_active = FALSE WHERE id = ?`
- 조회 시: `WHERE is_active = TRUE`

---

## BR-009: Device Type Validation

**Rule**: device_type 값은 'mobile', 'desktop', 'tablet', 'unknown' 중 하나만 허용

**Enforcement**: Database CHECK constraint on `click_logs.device_type`

**SQL Implementation**:
```sql
CONSTRAINT chk_device_type CHECK (device_type IN ('mobile', 'desktop', 'tablet', 'unknown'))
```

**Business Rationale**:
- 정의되지 않은 디바이스 타입 방지
- 통계 집계 시 일관성 보장

**Error Handling**:
- 잘못된 device_type 값 삽입 시 PostgreSQL 에러 발생
- 애플리케이션에서 User-Agent 파싱 시 4가지 타입 중 하나로 매핑 필요

---

## BR-010: Cascade Delete for User → URLs → ClickLogs

**Rule**: 사용자 삭제 시 해당 사용자의 모든 URL과 클릭 로그 자동 삭제

**Enforcement**: Database FOREIGN KEY with ON DELETE CASCADE

**SQL Implementation**:
```sql
-- urls 테이블
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

-- click_logs 테이블
FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE
```

**Business Rationale**:
- 데이터 일관성 보장
- 고아 레코드 (orphan records) 방지
- GDPR 준수: 사용자 삭제 요청 시 모든 관련 데이터 삭제

**Cascade Chain**:
1. User 삭제 → 해당 User의 모든 Url 삭제
2. Url 삭제 → 해당 Url의 모든 ClickLog 삭제

**결과**: User 삭제 시 해당 사용자의 모든 Url과 ClickLog가 함께 삭제됨

---

## BR-011: IP Address Format Support

**Rule**: IP 주소는 IPv4 (15자) 및 IPv6 (45자) 모두 지원

**Enforcement**: Database column size (VARCHAR(45))

**SQL Implementation**:
```sql
ip_address VARCHAR(45)
```

**Business Rationale**:
- IPv4 주소: 최대 15자 (예: `255.255.255.255`)
- IPv6 주소: 최대 45자 (예: `2001:0db8:85a3:0000:0000:8a2e:0370:7334`)
- 미래 호환성 확보

**Implementation**:
- 애플리케이션에서 IP 주소 추출 시 형식 검증 불필요 (VARCHAR(45)로 충분)

---

## BR-012: Country Code ISO Standard

**Rule**: 국가 코드는 ISO 3166-1 alpha-2 형식 (2자리) 사용

**Enforcement**: Application-level validation (DB에는 VARCHAR(2) 컬럼만 존재)

**SQL Implementation**:
```sql
country_code VARCHAR(2)
```

**Business Rationale**:
- 표준 형식 사용으로 일관성 보장
- GeoLite2 데이터베이스의 출력 형식과 일치

**Implementation**:
- GeoLite2에서 추출한 국가 코드를 그대로 저장
- 예: 'KR' (대한민국), 'US' (미국), 'JP' (일본)

---

## BR-013: Click Log Immutability

**Rule**: 클릭 로그는 한 번 삽입되면 수정 불가 (INSERT만 허용, UPDATE 금지)

**Enforcement**: Application-level logic (DB 제약 없음)

**Business Rationale**:
- 통계 데이터의 무결성 보장
- 조작 방지 (클릭수 부풀리기 방지)

**Implementation**:
- JPA Entity를 `@Immutable`로 설정
- Repository에서 UPDATE/DELETE 메서드 제공하지 않음

**Exception**:
- CASCADE DELETE만 허용 (URL 삭제 시)

---

## BR-014: Timestamp Defaults

**Rule**: created_at, clicked_at 컬럼은 자동으로 현재 시각 설정

**Enforcement**: Database DEFAULT constraint

**SQL Implementation**:
```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**Business Rationale**:
- 애플리케이션에서 timestamp 설정 불필요
- 데이터베이스 서버 시각 기준으로 일관성 유지

**Implementation**:
- JPA Entity에서 `@CreationTimestamp` 어노테이션 사용 가능
- 또는 DB의 DEFAULT 값 활용

---

## BR-015: NULL Handling for Optional Fields

**Rule**: 선택적 필드는 NULL 허용, 필수 필드는 NOT NULL 제약

**Enforcement**: Database NOT NULL constraints

**NULL 허용 필드**:
- `users.password_hash` (소셜 로그인 사용자)
- `users.provider`, `users.provider_id` (로컬 사용자)
- `users.name` (선택 사항)
- `urls.user_id` (익명 URL)
- `urls.expires_at` (영구 URL)
- `click_logs.*` (대부분 필드 - 수집 실패 시 NULL)

**NOT NULL 필드**:
- 모든 PRIMARY KEY
- `users.email`
- `urls.short_code`, `urls.original_url`
- `click_logs.url_id`

**Business Rationale**:
- 필수 데이터만 NOT NULL로 강제
- 선택적 데이터는 NULL 허용으로 유연성 확보

---

## Summary of Business Rules

| Rule ID | Rule Name | Enforcement | Severity |
|---|---|---|---|
| BR-001 | User Email Uniqueness | Database UNIQUE | Critical |
| BR-002 | OAuth2 Provider Validation | Database CHECK | High |
| BR-003 | OAuth2 Account Uniqueness | Database UNIQUE | Critical |
| BR-004 | Password Hashing | Application | Critical |
| BR-005 | Short Code Uniqueness | Database UNIQUE | Critical |
| BR-006 | URL Expiration Date Validation | Database CHECK | Medium |
| BR-007 | Anonymous URL Support | Database NULL | Medium |
| BR-008 | Soft Delete for URLs | Application | Medium |
| BR-009 | Device Type Validation | Database CHECK | Low |
| BR-010 | Cascade Delete | Database FK CASCADE | High |
| BR-011 | IP Address Format Support | Database VARCHAR(45) | Low |
| BR-012 | Country Code ISO Standard | Application | Low |
| BR-013 | Click Log Immutability | Application | Medium |
| BR-014 | Timestamp Defaults | Database DEFAULT | Low |
| BR-015 | NULL Handling | Database NOT NULL | Medium |

---

**작성일**: 2026-05-31
**작성자**: AI-DLC (CONSTRUCTION Phase)
**상태**: Functional Design 완료
