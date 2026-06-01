# Domain Entities - Unit U-005 (Database Schema)

## Purpose
This document defines the domain entities (database tables) for the URL Shortener service.

---

## Entity 1: User

### Description
사용자 정보를 저장하는 엔티티. 이메일 로그인과 OAuth2 소셜 로그인을 모두 지원.

### Attributes

| Attribute | Type | Constraints | Description |
|---|---|---|---|
| id | BIGSERIAL | PRIMARY KEY | 사용자 고유 ID (자동 증가) |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 주소 (로그인 ID) |
| password_hash | VARCHAR(255) | NULL 허용 | BCrypt 해시된 비밀번호 (소셜 로그인 시 NULL) |
| provider | VARCHAR(50) | NULL 허용, CHECK | 인증 제공자 ('local', 'google', 'github') |
| provider_id | VARCHAR(255) | NULL 허용 | OAuth2 제공자의 사용자 고유 ID |
| name | VARCHAR(100) | NULL 허용 | 사용자 이름 또는 닉네임 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 계정 생성 일시 |

### Business Rules
1. **이메일 유니크 제약**: 동일한 이메일로 여러 계정 생성 불가
2. **Provider 제한**: provider는 'local', 'google', 'github' 중 하나만 허용
3. **복합 유니크 제약**: (provider, provider_id) 조합은 유니크해야 함 (동일한 소셜 계정 중복 방지)
4. **비밀번호 해싱**: 비밀번호는 절대 평문 저장 금지, BCrypt 해시만 저장
5. **소셜 로그인 사용자**: provider가 'google' 또는 'github'인 경우 password_hash는 NULL

### Relationships
- **User → Url**: 1:N (한 사용자가 여러 URL 생성 가능)
- **Cascade Behavior**: 사용자 삭제 시 해당 사용자의 모든 URL 삭제

---

## Entity 2: Url

### Description
단축 URL 정보를 저장하는 엔티티. 원본 URL과 단축 코드의 매핑 관계를 관리.

### Attributes

| Attribute | Type | Constraints | Description |
|---|---|---|---|
| id | BIGSERIAL | PRIMARY KEY | URL 고유 ID (Base62 인코딩의 입력값) |
| short_code | VARCHAR(10) | UNIQUE, NOT NULL | Base62 인코딩된 단축 코드 |
| original_url | TEXT | NOT NULL | 원본 URL |
| user_id | BIGINT | FOREIGN KEY, NULL 허용 | 생성한 사용자 ID (NULL이면 익명) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | URL 생성 일시 |
| expires_at | TIMESTAMP | NULL 허용, CHECK | URL 만료 일시 (NULL이면 영구) |
| is_active | BOOLEAN | DEFAULT TRUE | 활성 상태 (FALSE면 접근 불가) |

### Business Rules
1. **Short Code 유니크 제약**: 동일한 short_code 중복 불가
2. **익명 URL 지원**: user_id가 NULL이면 익명 사용자가 생성한 URL
3. **만료일 검증**: expires_at이 NULL이 아닌 경우, created_at보다 나중이어야 함
4. **Soft Delete**: URL 삭제는 is_active를 FALSE로 설정 (hard delete 아님)
5. **Base62 인코딩**: id 값을 Base62로 인코딩하여 short_code 생성
6. **URL 형식 검증**: original_url은 HTTP/HTTPS 프로토콜만 허용 (애플리케이션 레벨 검증)

### Relationships
- **Url → User**: N:1 (여러 URL이 한 사용자에게 속함)
- **Url → ClickLog**: 1:N (한 URL이 여러 번 클릭됨)
- **Cascade Behavior**: URL 삭제 시 해당 URL의 모든 클릭 로그 삭제

---

## Entity 3: ClickLog

### Description
단축 URL 클릭 로그를 저장하는 엔티티. 통계 수집 및 분석을 위한 데이터.

### Attributes

| Attribute | Type | Constraints | Description |
|---|---|---|---|
| id | BIGSERIAL | PRIMARY KEY | 클릭 로그 고유 ID |
| url_id | BIGINT | FOREIGN KEY, NOT NULL | 클릭된 URL ID |
| ip_address | VARCHAR(45) | NULL 허용 | 클릭한 사용자의 IP 주소 (IPv4/IPv6 지원) |
| user_agent | TEXT | NULL 허용 | 브라우저 User-Agent 문자열 |
| referer | TEXT | NULL 허용 | HTTP Referer 헤더 (이전 페이지 URL) |
| country_code | VARCHAR(2) | NULL 허용 | 국가 코드 (GeoLite2로 IP에서 추출) |
| browser | VARCHAR(50) | NULL 허용 | 브라우저 이름 (User-Agent에서 파싱) |
| os | VARCHAR(50) | NULL 허용 | 운영체제 (User-Agent에서 파싱) |
| device_type | VARCHAR(20) | NULL 허용, CHECK | 디바이스 타입 ('mobile', 'desktop', 'tablet', 'unknown') |
| clicked_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 클릭 발생 일시 |

### Business Rules
1. **URL 필수**: url_id는 NULL 불가 (모든 클릭은 URL과 연결되어야 함)
2. **Device Type 제한**: device_type은 'mobile', 'desktop', 'tablet', 'unknown' 중 하나만 허용
3. **비동기 저장**: 클릭 로그는 비동기로 저장 (리다이렉트 응답 속도에 영향 없음)
4. **GeoIP 국가 추출**: ip_address에서 GeoLite2 데이터베이스로 country_code 추출
5. **User-Agent 파싱**: user_agent 문자열에서 browser, os, device_type 파싱
6. **IP 주소 형식**: IPv4 (15자) 또는 IPv6 (45자) 모두 지원

### Relationships
- **ClickLog → Url**: N:1 (여러 클릭 로그가 한 URL에 속함)
- **Cascade Behavior**: URL 삭제 시 해당 URL의 모든 클릭 로그 삭제

---

## Entity Relationship Summary

```
┌──────────┐
│  User    │
│  (1)     │
└────┬─────┘
     │
     │ 1:N (user_id FK, NULL 허용)
     │
     ▼
┌──────────┐
│  Url     │
│  (N)     │
└────┬─────┘
     │
     │ 1:N (url_id FK)
     │
     ▼
┌──────────┐
│ ClickLog │
│  (N)     │
└──────────┘
```

### Cascade Delete Chain
1. User 삭제 → 해당 User의 모든 Url 삭제
2. Url 삭제 → 해당 Url의 모든 ClickLog 삭제

**결과**: User 삭제 시 해당 사용자의 모든 Url과 ClickLog가 함께 삭제됨

---

## Data Integrity Constraints

### Primary Keys
- **users.id**: BIGSERIAL (자동 증가)
- **urls.id**: BIGSERIAL (자동 증가)
- **click_logs.id**: BIGSERIAL (자동 증가)

### Foreign Keys
1. **urls.user_id → users.id**
   - ON DELETE CASCADE
   - NULL 허용 (익명 사용자)

2. **click_logs.url_id → urls.id**
   - ON DELETE CASCADE
   - NOT NULL (필수)

### Unique Constraints
1. **users.email**: 이메일 중복 방지
2. **users.(provider, provider_id)**: 동일한 소셜 계정 중복 방지
3. **urls.short_code**: 단축 코드 중복 방지

### Check Constraints
1. **users.provider** IN ('local', 'google', 'github')
2. **urls.expires_at** IS NULL OR expires_at > created_at
3. **click_logs.device_type** IN ('mobile', 'desktop', 'tablet', 'unknown')

---

## Indexing Strategy

### users 테이블
- `idx_users_email` (email): 로그인 시 이메일 조회
- `idx_users_provider` (provider, provider_id): 소셜 로그인 조회

### urls 테이블
- `idx_urls_short_code` (short_code): 리다이렉트 시 단축 코드 조회
- `idx_urls_user_id` (user_id): 사용자별 URL 목록 조회
- `idx_urls_expires_at` (expires_at): 만료된 URL 필터링
- `idx_urls_user_created` (user_id, created_at DESC): 사용자별 최신 URL 조회 최적화

### click_logs 테이블
- `idx_click_logs_url_id` (url_id): URL별 클릭 로그 조회
- `idx_click_logs_clicked_at` (clicked_at): 시간 범위별 조회
- `idx_click_logs_url_clicked` (url_id, clicked_at): 일별 통계 쿼리 최적화

---

## Expected Data Volume

### 학습용 프로젝트 (2주)
| Entity | Records | Disk Size |
|---|---|---|
| User | ~10 | < 1 KB |
| Url | ~50 | < 10 KB |
| ClickLog | ~500 | < 100 KB |

### 운영 환경 예상 (참고)
| Entity | Records | Disk Size |
|---|---|---|
| User | 10,000 | ~1 MB |
| Url | 1,000,000 | ~100 MB |
| ClickLog | 100,000,000 | ~10 GB |

**운영 환경 고려사항**: ClickLog 테이블은 월별 파티셔닝 필요

---

**작성일**: 2026-05-31
**작성자**: AI-DLC (CONSTRUCTION Phase)
**상태**: Functional Design 완료
