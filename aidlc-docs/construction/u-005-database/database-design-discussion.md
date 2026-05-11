# Database Schema 설계 논의사항

**Unit**: U-005 (Database Schema)
**논의 대상**: 2인 개발 팀
**목적**: 테이블 구조 및 제약조건 최종 결정

---

## 📋 논의사항 요약

총 **15개 논의 포인트**를 5개 카테고리로 분류했습니다.

---

## 1️⃣ users 테이블 관련 (5개)

### 질문 1-1: password_hash 컬럼 길이
**현재 설계**: `password_hash VARCHAR(255)`

**선택지**:
- A) `VARCHAR(255)` 유지 (여유 공간 확보)
- B) `VARCHAR(60)` 변경 (BCrypt 고정 길이에 맞춤)https://github.com/Kuhosai/Project3.git
**추천**: ✅ **A) VARCHAR(255) 유지**

**이유**:
- BCrypt는 현재 60자 고정이지만, 향후 알고리즘 변경 시 유연성 확보
- Argon2, scrypt 등 다른 해싱 알고리즘은 더 긴 문자열 사용 가능
- 디스크 공간 차이 미미 (사용자 수 적음)

---

### 질문 1-2: provider + provider_id 복합 유니크 제약
**현재 설계**: 복합 유니크 제약 없음

**선택지**:
- A) 복합 유니크 제약 추가 (`UNIQUE(provider, provider_id)`)
- B) 제약 없이 유지 (애플리케이션 레벨에서 처리)

**추천**: ✅ **A) 복합 유니크 제약 추가**

**이유**:
- 동일한 Google 계정이 2번 가입되는 것을 DB 레벨에서 방지
- 데이터 무결성 보장 (애플리케이션 버그로 인한 중복 방지)
- 성능: 인덱스와 동일한 역할 (추가 인덱스 불필요)

**적용 SQL**:
```sql
ALTER TABLE users ADD CONSTRAINT uk_users_provider
UNIQUE (provider, provider_id);
```

---

### 질문 1-3: name 컬럼 추가
**현재 설계**: name 컬럼 없음

**선택지**:
- A) `name VARCHAR(100)` 추가 (사용자 이름/닉네임)
- B) 추가하지 않음 (이메일만 사용)

**추천**: ✅ **A) name 컬럼 추가**

**이유**:
- UI에서 "안녕하세요, {이름}님" 표시 가능
- 소셜 로그인 시 프로필 이름 저장
- 향후 프로필 기능 확장 시 필수

**적용 SQL**:
```sql
ALTER TABLE users ADD COLUMN name VARCHAR(100);
```

---

### 질문 1-4: profile_image_url 컬럼 추가
**현재 설계**: profile_image_url 컬럼 없음

**선택지**:
- A) `profile_image_url TEXT` 추가
- B) 추가하지 않음 (학습용이므로 불필요)

**추천**: ✅ **B) 추가하지 않음**

**이유**:
- 학습용 프로젝트로 프로필 이미지 기능 우선순위 낮음
- 향후 필요 시 Flyway 마이그레이션으로 추가 가능
- 초기 개발 복잡도 감소

---

### 질문 1-5: updated_at 컬럼 추가
**현재 설계**: created_at만 존재

**선택지**:
- A) `updated_at TIMESTAMP` 추가
- B) 추가하지 않음

**추천**: ✅ **B) 추가하지 않음**

**이유**:
- 사용자 정보 수정 기능이 현재 요구사항에 없음
- 필요 시 Flyway로 추가 가능
- YAGNI 원칙 (You Aren't Gonna Need It)

---

## 2️⃣ urls 테이블 관련 (4개)

### 질문 2-1: short_code 최대 길이
**현재 설계**: `short_code VARCHAR(10)`

**선택지**:
- A) `VARCHAR(10)` 유지 (62^10 = 약 839경 개 URL)
- B) `VARCHAR(7)` 축소 (62^7 = 약 35억 개 URL)
- C) `VARCHAR(15)` 확장

**추천**: ✅ **A) VARCHAR(10) 유지**

**이유**:
- 62^7 (35억)도 충분하지만, 여유 공간 확보 (실수 방지)
- 10자는 짧은 URL 유지하면서도 충분한 확장성 제공
- 디스크 공간 차이 미미

---

### 질문 2-2: click_count 컬럼 추가
**현재 설계**: click_count 컬럼 없음 (click_logs에서 집계)

**선택지**:
- A) `click_count BIGINT DEFAULT 0` 추가 (빠른 조회)
- B) 추가하지 않음 (click_logs에서 COUNT 쿼리)

**추천**: ✅ **B) 추가하지 않음**

**이유**:
- 데이터 중복 (click_logs에서 집계 가능)
- 동기화 문제 (click_count와 실제 click_logs 불일치 가능성)
- 학습용 프로젝트로 성능 이슈 적음
- 필요 시 Materialized View 또는 캐싱으로 최적화 가능

**쿼리 예시**:
```sql
SELECT u.*, COUNT(cl.id) AS click_count
FROM urls u
LEFT JOIN click_logs cl ON u.id = cl.url_id
WHERE u.user_id = ?
GROUP BY u.id;
```

---

### 질문 2-3: title 컬럼 추가
**현재 설계**: title 컬럼 없음

**선택지**:
- A) `title VARCHAR(255)` 추가 (사용자가 URL에 제목 지정)
- B) 추가하지 않음

**추천**: ⚠️ **A) title 컬럼 추가 (선택적)**

**이유**:
- **추가하는 경우**: "내 블로그 글", "회사 홈페이지" 등 사용자가 구분하기 쉬움
- **추가하지 않는 경우**: original_url로 충분, 초기 개발 복잡도 감소
- **제안**: Phase 1에서는 B 선택 → Phase 2에서 사용자 피드백 후 추가

---

### 질문 2-4: Soft Delete vs Hard Delete
**현재 설계**: Hard Delete (is_active로 비활성화만 가능)

**선택지**:
- A) `deleted_at TIMESTAMP` 추가 (Soft Delete)
- B) Hard Delete 유지 (실제 삭제)

**추천**: ✅ **B) Hard Delete 유지**

**이유**:
- 학습용 프로젝트로 복구 기능 불필요
- 데이터베이스 용량 절약
- 쿼리 단순화 (`WHERE deleted_at IS NULL` 조건 불필요)
- `is_active`로 사용자 비활성화 이미 지원

---

## 3️⃣ click_logs 테이블 관련 (4개)

### 질문 3-1: IP 주소 개인정보 이슈
**현재 설계**: `ip_address VARCHAR(45)` (평문 저장)

**선택지**:
- A) 평문 저장 (학습용이므로 OK)
- B) 해싱 후 저장 (SHA-256 등)
- C) IP 일부만 저장 (예: `203.0.113.*`)
- D) 저장하지 않음

**추천**: ✅ **A) 평문 저장 (학습용 프로젝트)**

**이유**:
- 학습용 프로젝트로 실제 사용자 데이터 없음
- 국가 추출에 원본 IP 필요 (GeoLite2)
- 운영 환경에서는 GDPR 고려 필요 (B 또는 C 선택)

**운영 환경 권장**:
- EU 사용자 대상: IP 해싱 또는 일부만 저장
- 개인정보처리방침에 IP 수집 명시

---

### 질문 3-2: OS 컬럼 추가
**현재 설계**: OS 정보 없음

**선택지**:
- A) `os VARCHAR(50)` 추가 (예: 'Windows 10', 'macOS', 'Android')
- B) 추가하지 않음

**추천**: ✅ **A) os 컬럼 추가**

**이유**:
- User-Agent에서 OS 정보 파싱 가능
- 통계 대시보드에 "OS별 클릭 분포" 추가 가능
- 추가 비용 미미 (User-Agent 파싱 시 함께 추출)

**적용 SQL**:
```sql
ALTER TABLE click_logs ADD COLUMN os VARCHAR(50);
```

---

### 질문 3-3: device_type 컬럼 추가
**현재 설계**: device_type 정보 없음

**선택지**:
- A) `device_type VARCHAR(20)` 추가 ('mobile', 'desktop', 'tablet')
- B) 추가하지 않음

**추천**: ✅ **A) device_type 컬럼 추가**

**이유**:
- 모바일 vs 데스크톱 통계는 중요한 지표
- User-Agent에서 파싱 가능
- 반응형 디자인 개선 시 유용한 데이터

**적용 SQL**:
```sql
ALTER TABLE click_logs ADD COLUMN device_type VARCHAR(20);
```

**CHECK 제약 추가** (선택적):
```sql
ALTER TABLE click_logs ADD CONSTRAINT chk_device_type
CHECK (device_type IN ('mobile', 'desktop', 'tablet', 'unknown'));
```

---

### 질문 3-4: referer → referrer 오타 수정
**현재 설계**: `referer TEXT` (HTTP 헤더 스펠링 따름)

**선택지**:
- A) `referer` 유지 (HTTP 표준 스펠링)
- B) `referrer` 변경 (올바른 영어 스펠링)

**추천**: ✅ **A) referer 유지**

**이유**:
- HTTP 헤더 이름이 `Referer` (오타이지만 표준)
- 대부분의 웹 프레임워크가 `referer` 사용
- 일관성 유지 (HTTP 스펙과 동일)

**참고**: HTTP 명세서도 "Referer"로 정의됨 (역사적 이유)

---

## 4️⃣ 인덱스 전략 관련 (1개)

### 질문 4-1: 복합 인덱스 추가
**현재 설계**: 단일 컬럼 인덱스만 존재

**선택지**:
- A) 복합 인덱스 추가
  - `urls(user_id, created_at)` - 사용자별 최신 URL 조회
  - `click_logs(url_id, clicked_at)` - 이미 존재 ✅
- B) 단일 인덱스만 유지

**추천**: ✅ **A) 복합 인덱스 추가 (urls만)**

**적용 SQL**:
```sql
CREATE INDEX idx_urls_user_created ON urls(user_id, created_at DESC);
```

**이유**:
- "내 URL 목록" 페이지에서 최신순 정렬 시 성능 향상
- `click_logs(url_id, clicked_at)` 복합 인덱스는 이미 존재

---

## 5️⃣ 제약 조건 관련 (1개)

### 질문 5-1: CHECK 제약 추가
**현재 설계**: CHECK 제약 없음

**선택지**:
- A) CHECK 제약 추가
  - `urls.expires_at > urls.created_at` (만료일이 생성일 이후)
  - `users.provider IN ('local', 'google', 'github')` (제공자 제한)
- B) 애플리케이션 레벨에서만 검증

**추천**: ✅ **A) CHECK 제약 추가**

**적용 SQL**:
```sql
-- urls 테이블
ALTER TABLE urls ADD CONSTRAINT chk_expires_after_created
CHECK (expires_at IS NULL OR expires_at > created_at);

-- users 테이블
ALTER TABLE users ADD CONSTRAINT chk_provider
CHECK (provider IN ('local', 'google', 'github'));
```

**이유**:
- DB 레벨에서 데이터 무결성 보장
- 애플리케이션 버그로 인한 잘못된 데이터 방지
- 성능 영향 미미

---

## 📊 논의사항 요약표

| 번호 | 카테고리 | 질문 | 추천 | 우선순위 |
|---|---|---|---|---|
| 1-1 | users | password_hash 길이 | A (255 유지) | 낮음 |
| 1-2 | users | provider 복합 유니크 | A (추가) | **높음** |
| 1-3 | users | name 컬럼 추가 | A (추가) | 중간 |
| 1-4 | users | profile_image_url | B (추가 안함) | 낮음 |
| 1-5 | users | updated_at | B (추가 안함) | 낮음 |
| 2-1 | urls | short_code 길이 | A (10 유지) | 낮음 |
| 2-2 | urls | click_count | B (추가 안함) | 중간 |
| 2-3 | urls | title 컬럼 | B (나중에) | 낮음 |
| 2-4 | urls | Soft Delete | B (Hard Delete) | 중간 |
| 3-1 | click_logs | IP 주소 개인정보 | A (평문 저장) | 중간 |
| 3-2 | click_logs | os 컬럼 | A (추가) | 중간 |
| 3-3 | click_logs | device_type 컬럼 | A (추가) | 중간 |
| 3-4 | click_logs | referer 오타 | A (유지) | 낮음 |
| 4-1 | 인덱스 | 복합 인덱스 | A (추가) | **높음** |
| 5-1 | 제약조건 | CHECK 제약 | A (추가) | **높음** |

---

## ✅ 최종 권장 설계 (추천 반영)

### users 테이블
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),  -- BCrypt 해시 (255 유지)
    provider VARCHAR(50),
    provider_id VARCHAR(255),
    name VARCHAR(100),           -- ✅ 추가
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_provider UNIQUE (provider, provider_id),  -- ✅ 추가
    CONSTRAINT chk_provider CHECK (provider IN ('local', 'google', 'github'))  -- ✅ 추가
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);
```

### urls 테이블
```sql
CREATE TABLE urls (
    id BIGSERIAL PRIMARY KEY,
    short_code VARCHAR(10) UNIQUE NOT NULL,  -- 10자 유지
    original_url TEXT NOT NULL,
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_expires_after_created CHECK (expires_at IS NULL OR expires_at > created_at)  -- ✅ 추가
);

CREATE INDEX idx_urls_short_code ON urls(short_code);
CREATE INDEX idx_urls_user_id ON urls(user_id);
CREATE INDEX idx_urls_expires_at ON urls(expires_at);
CREATE INDEX idx_urls_user_created ON urls(user_id, created_at DESC);  -- ✅ 추가
```

### click_logs 테이블
```sql
CREATE TABLE click_logs (
    id BIGSERIAL PRIMARY KEY,
    url_id BIGINT NOT NULL,
    ip_address VARCHAR(45),      -- 평문 저장 (학습용)
    user_agent TEXT,
    referer TEXT,                 -- HTTP 표준 스펠링 유지
    country_code VARCHAR(2),
    browser VARCHAR(50),
    os VARCHAR(50),               -- ✅ 추가
    device_type VARCHAR(20),      -- ✅ 추가
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE,
    CONSTRAINT chk_device_type CHECK (device_type IN ('mobile', 'desktop', 'tablet', 'unknown'))  -- ✅ 추가
);

CREATE INDEX idx_click_logs_url_id ON click_logs(url_id);
CREATE INDEX idx_click_logs_clicked_at ON click_logs(clicked_at);
CREATE INDEX idx_click_logs_url_clicked ON click_logs(url_id, clicked_at);
```

---

## 🎯 다음 단계

1. **논의 완료 확인**: 두 명이 함께 위 권장사항 리뷰
2. **변경사항 반영**: 추가/수정할 항목 최종 결정
3. **Flyway 스크립트 작성**: V1, V2, V3 마이그레이션 파일 생성
4. **로컬 테스트**: PostgreSQL Docker 컨테이너에서 스크립트 실행 및 검증

---

**생성일**: 2026-05-06
**최종 수정**: 2026-05-06
**상태**: 논의 대기 중
