# NFR Requirements - Unit U-005 (Database Schema)

## Purpose
This document defines the non-functional requirements (NFR) for the URL Shortener database schema.

---

## NFR-1: Performance

### NFR-1.1: Query Response Time
**Requirement**: 데이터베이스 쿼리 응답 시간 최소화

**Target Metrics**:
- **Short Code 조회**: < 5ms (with index)
- **이메일 로그인 조회**: < 5ms (with index)
- **사용자별 URL 목록**: < 50ms
- **일별 클릭 통계**: < 100ms (30일 기준)
- **국가별/브라우저별 분포**: < 100ms

**Implementation**:
- 자주 조회되는 컬럼에 인덱스 추가
- 복합 인덱스로 쿼리 최적화
- JPA Projection으로 필요한 컬럼만 SELECT

**Acceptance Criteria**:
- EXPLAIN ANALYZE로 인덱스 사용 확인
- 실제 응답 시간 측정 결과가 목표치 이하

---

### NFR-1.2: Index Optimization
**Requirement**: 효율적인 인덱스 전략으로 조회 성능 향상

**Index Strategy**:

| Table | Index | Columns | Purpose |
|---|---|---|---|
| users | idx_users_email | (email) | 로그인 시 이메일 조회 |
| users | idx_users_provider | (provider, provider_id) | 소셜 로그인 조회 |
| urls | idx_urls_short_code | (short_code) | 리다이렉트 시 단축 코드 조회 |
| urls | idx_urls_user_id | (user_id) | 사용자별 URL 목록 |
| urls | idx_urls_expires_at | (expires_at) | 만료 URL 필터링 |
| urls | idx_urls_user_created | (user_id, created_at DESC) | 최신 URL 조회 최적화 |
| click_logs | idx_click_logs_url_id | (url_id) | URL별 클릭 로그 조회 |
| click_logs | idx_click_logs_clicked_at | (clicked_at) | 시간 범위별 조회 |
| click_logs | idx_click_logs_url_clicked | (url_id, clicked_at) | 일별 통계 최적화 |

**Expected Performance Gain**:
- 인덱스 없음 대비 90-96% 성능 향상

---

### NFR-1.3: Connection Pool
**Requirement**: 데이터베이스 연결 풀 최적화

**Configuration** (Spring Boot):
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

**Rationale**:
- 학습용 프로젝트: 소규모 연결 풀 (최대 10개)
- 운영 환경: 트래픽에 따라 조정 필요

---

## NFR-2: Scalability

### NFR-2.1: Data Volume Capacity
**Requirement**: 대량 데이터 처리 능력

**Expected Volume**:

| Phase | Users | URLs | ClickLogs | Total Size |
|---|---|---|---|---|
| 학습용 (2주) | 10 | 50 | 500 | < 1 MB |
| 소규모 운영 | 10,000 | 1,000,000 | 100,000,000 | ~10 GB |
| 대규모 운영 | 1,000,000 | 100,000,000 | 10,000,000,000 | ~1 TB |

**Scalability Strategy**:
- **학습용**: 현재 스키마로 충분
- **운영 환경**: click_logs 테이블 파티셔닝 필요 (월별)

---

### NFR-2.2: Horizontal Scalability
**Requirement**: 데이터베이스 수평 확장 가능성

**Future Considerations**:
- **Read Replica**: 통계 조회는 Read Replica 사용
- **Sharding**: URL 테이블 샤딩 (short_code 기준)
- **Caching**: Redis로 인기 URL 캐싱

**Current Decision**: 학습용 프로젝트에서는 단일 PostgreSQL 인스턴스 사용

---

### NFR-2.3: Table Partitioning (Future)
**Requirement**: 대량 데이터 관리를 위한 파티셔닝

**Partitioning Strategy** (운영 환경):
- **click_logs 테이블**: 월별 파티셔닝
  - `click_logs_2026_05` (2026년 5월 데이터)
  - `click_logs_2026_06` (2026년 6월 데이터)
- **장점**: 쿼리 성능 향상, 오래된 데이터 아카이빙 용이

**Current Decision**: 학습용 프로젝트에서는 파티셔닝 미적용

---

## NFR-3: Availability

### NFR-3.1: Data Persistence
**Requirement**: 데이터 영속성 보장

**Implementation**:
- Docker Volume으로 PostgreSQL 데이터 영구 저장
- 컨테이너 재시작 시에도 데이터 유지

**Docker Compose Configuration**:
```yaml
volumes:
  db-data:

services:
  db:
    volumes:
      - db-data:/var/lib/postgresql/data
```

---

### NFR-3.2: Backup and Recovery (Future)
**Requirement**: 정기 백업 및 복구 전략

**Future Strategy** (운영 환경):
- **Automated Backup**: pg_dump로 일일 백업
- **Backup Retention**: 30일간 백업 보관
- **Recovery Testing**: 월 1회 복구 테스트

**Current Decision**: 학습용 프로젝트에서는 백업 미구현

---

### NFR-3.3: High Availability (Future)
**Requirement**: 고가용성 보장

**Future Strategy** (운영 환경):
- **Primary-Replica Setup**: 1 Primary + 2 Replicas
- **Automatic Failover**: Patroni 또는 PgBouncer 사용
- **Load Balancing**: HAProxy로 Read 요청 분산

**Current Decision**: 학습용 프로젝트에서는 단일 인스턴스 사용

---

## NFR-4: Security

### NFR-4.1: Password Security
**Requirement**: 비밀번호 안전한 저장

**Implementation**:
- **Hashing Algorithm**: BCrypt (Spring Security)
- **Salt**: BCrypt 자동 생성 (랜덤 salt)
- **Hash Length**: 60자 (BCrypt 기본)
- **Database Column**: VARCHAR(255) (향후 알고리즘 변경 대비)

**Acceptance Criteria**:
- 비밀번호 평문 저장 절대 금지
- BCryptPasswordEncoder.encode() 사용 확인

---

### NFR-4.2: SQL Injection Prevention
**Requirement**: SQL Injection 공격 방지

**Implementation**:
- **Parameterized Queries**: JPA/Hibernate의 Prepared Statement 사용
- **Input Validation**: 애플리케이션 레벨에서 입력 검증
- **ORM 사용**: 직접 SQL 문자열 연결 금지

**Prohibited Pattern**:
```java
// ❌ 절대 금지
String query = "SELECT * FROM users WHERE email = '" + email + "'";
```

**Correct Pattern**:
```java
// ✅ 올바른 방법
@Query("SELECT u FROM User u WHERE u.email = :email")
User findByEmail(@Param("email") String email);
```

---

### NFR-4.3: IP Address Privacy (GDPR)
**Requirement**: 개인정보 보호 (IP 주소)

**Current Implementation**:
- **학습용**: IP 주소 평문 저장 (VARCHAR(45))

**Future Considerations** (운영 환경):
- **Option 1**: IP 주소 해싱 (SHA-256)
- **Option 2**: IP 일부만 저장 (예: `203.0.113.*`)
- **Option 3**: 개인정보처리방침에 IP 수집 명시 + 동의 획득

**GDPR Compliance**:
- 사용자 삭제 시 모든 관련 데이터 삭제 (CASCADE DELETE)

---

### NFR-4.4: Database Connection Security
**Requirement**: 데이터베이스 연결 보안

**Implementation**:
- **Credentials Management**: 환경 변수로 관리 (application.yml에 하드코딩 금지)
- **SSL/TLS Connection** (Future): 운영 환경에서 암호화 연결 사용

**Environment Variables**:
```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/urlshortener
SPRING_DATASOURCE_USERNAME=admin
SPRING_DATASOURCE_PASSWORD=secret  # 운영 환경: 보안 관리 필요
```

---

## NFR-5: Data Integrity

### NFR-5.1: Referential Integrity
**Requirement**: 외래 키 제약으로 데이터 일관성 보장

**Foreign Key Constraints**:
1. `urls.user_id → users.id` (ON DELETE CASCADE)
2. `click_logs.url_id → urls.id` (ON DELETE CASCADE)

**Cascade Behavior**:
- User 삭제 → 모든 URL 삭제 → 모든 클릭 로그 삭제

---

### NFR-5.2: Data Validation
**Requirement**: 데이터베이스 레벨 검증

**CHECK Constraints**:
1. `users.provider` IN ('local', 'google', 'github')
2. `urls.expires_at` IS NULL OR expires_at > created_at
3. `click_logs.device_type` IN ('mobile', 'desktop', 'tablet', 'unknown')

**UNIQUE Constraints**:
1. `users.email` - 이메일 중복 방지
2. `users.(provider, provider_id)` - 소셜 계정 중복 방지
3. `urls.short_code` - 단축 코드 중복 방지

---

### NFR-5.3: Immutability
**Requirement**: 클릭 로그 불변성 보장

**Implementation**:
- click_logs 테이블은 INSERT만 허용
- UPDATE/DELETE 금지 (CASCADE DELETE 제외)
- JPA Entity를 `@Immutable`로 설정

**Rationale**:
- 통계 데이터 조작 방지
- 클릭수 부풀리기 방지

---

## NFR-6: Maintainability

### NFR-6.1: Schema Versioning
**Requirement**: 데이터베이스 스키마 버전 관리

**Implementation**:
- **Migration Tool**: Flyway
- **Versioning Scheme**: `V{version}__{description}.sql`
  - V1__create_users.sql
  - V2__create_urls.sql
  - V3__create_click_logs.sql
  - V4__insert_sample_data.sql

**Migration Strategy**:
- **Forward-Only**: Undo 마이그레이션 미지원 (Flyway Community Edition)
- **Idempotent**: 마이그레이션 재실행 시 안전

---

### NFR-6.2: Documentation
**Requirement**: 데이터베이스 스키마 문서화

**Implementation**:
- **SQL Comments**: COMMENT ON TABLE/COLUMN으로 각 테이블/컬럼 설명
- **ERD**: 엔티티 관계도 문서화
- **README**: 마이그레이션 실행 방법, 쿼리 예시 포함

**Documentation Files**:
- `ERD.md`: 상세 ERD 다이어그램
- `README.md`: 스키마 개요 및 사용 방법
- `database-design-discussion.md`: 설계 논의사항

---

### NFR-6.3: Code Quality (SQL)
**Requirement**: SQL 스크립트 품질 관리

**Standards**:
- **Naming Convention**: snake_case (PostgreSQL 표준)
- **Formatting**: 일관된 들여쓰기 및 줄바꿈
- **Comments**: 복잡한 제약 조건에 주석 추가
- **Explicit Constraints**: 제약 조건에 명시적 이름 부여

**Example**:
```sql
CONSTRAINT chk_provider CHECK (provider IN ('local', 'google', 'github'))
CONSTRAINT uk_users_provider UNIQUE (provider, provider_id)
```

---

## NFR-7: Usability

### NFR-7.1: Sample Data
**Requirement**: 개발/테스트용 샘플 데이터 제공

**Implementation**:
- **V4__insert_sample_data.sql**: 샘플 데이터 마이그레이션
- **샘플 데이터 구성**:
  - 3명의 사용자 (로컬 2명, Google 1명)
  - 5개의 URL (등록 사용자 4개, 익명 1개)
  - 10개의 클릭 로그 (다양한 국가, 브라우저, 디바이스)

**Purpose**:
- 애플리케이션 개발 시 즉시 테스트 가능
- 통계 차트 UI 테스트용 데이터

---

### NFR-7.2: Query Examples
**Requirement**: 자주 사용하는 쿼리 예시 제공

**Documentation** (README.md):
- 사용자별 URL 목록 조회
- 일별 클릭수 통계
- 국가별/브라우저별 클릭 분포
- 디바이스 타입별 분포

**Purpose**:
- 백엔드 개발자가 JPA Repository 쿼리 작성 시 참고
- 통계 API 구현 시 SQL 쿼리 가이드

---

## NFR-8: Reliability

### NFR-8.1: Error Handling
**Requirement**: 데이터베이스 오류 처리

**Error Scenarios**:
1. **Duplicate Key**: UNIQUE 제약 위반 → 애플리케이션에서 재시도 또는 에러 메시지
2. **Foreign Key Violation**: 존재하지 않는 user_id 참조 → 데이터 검증 에러
3. **CHECK Constraint Violation**: 잘못된 provider 값 → 입력 검증 에러
4. **Connection Timeout**: 연결 풀 고갈 → 재시도 로직

**Handling Strategy**:
- Spring Boot의 `DataIntegrityViolationException` 처리
- 사용자에게 명확한 에러 메시지 반환

---

### NFR-8.2: Transaction Management
**Requirement**: 트랜잭션 일관성 보장

**Implementation**:
- **Spring @Transactional**: 서비스 레이어에서 트랜잭션 관리
- **Isolation Level**: READ_COMMITTED (PostgreSQL 기본값)
- **Propagation**: REQUIRED (기본값)

**Critical Transactions**:
- User 생성 + JWT 발급 (원자성 보장)
- URL 생성 + short_code 업데이트 (원자성 보장)

---

## NFR Summary Table

| NFR Category | Key Requirements | Implementation | Priority |
|---|---|---|---|
| Performance | 쿼리 응답 < 100ms | 인덱스 최적화, JPA Projection | High |
| Scalability | 1M URLs, 100M ClickLogs | 파티셔닝 (Future), Read Replica (Future) | Medium |
| Availability | 데이터 영속성 | Docker Volume, 백업 (Future) | High |
| Security | BCrypt, SQL Injection 방지 | Parameterized Query, 환경 변수 | Critical |
| Data Integrity | FK, UNIQUE, CHECK 제약 | PostgreSQL Constraints | Critical |
| Maintainability | Flyway 마이그레이션 | 버전 관리, 문서화 | High |
| Usability | 샘플 데이터, 쿼리 예시 | V4 마이그레이션, README | Low |
| Reliability | 트랜잭션, 에러 처리 | @Transactional, Exception Handling | High |

---

## Acceptance Criteria

### Performance
- [ ] 모든 인덱스가 EXPLAIN ANALYZE로 확인됨
- [ ] short_code 조회 응답 시간 < 5ms
- [ ] 통계 쿼리 응답 시간 < 100ms

### Security
- [ ] 비밀번호 평문 저장 없음 (BCrypt 해싱만)
- [ ] Parameterized Query 사용 확인
- [ ] 환경 변수로 DB credentials 관리

### Data Integrity
- [ ] 모든 FK 제약 조건 동작 확인
- [ ] UNIQUE 제약 위반 시 에러 발생 확인
- [ ] CHECK 제약 위반 시 에러 발생 확인

### Maintainability
- [ ] Flyway 마이그레이션 성공적 실행
- [ ] 모든 테이블/컬럼에 COMMENT 추가
- [ ] ERD 및 README 문서화 완료

---

**작성일**: 2026-05-31
**작성자**: AI-DLC (CONSTRUCTION Phase)
**상태**: NFR Requirements 완료
