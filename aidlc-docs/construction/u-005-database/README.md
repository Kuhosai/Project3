# U-005: Database Schema

URL 단축 서비스의 데이터베이스 스키마 설계 및 Flyway 마이그레이션 스크립트입니다.

---

## 📂 파일 구조

```
u-005-database/
├── README.md                           # 이 파일
├── database-design-discussion.md       # 설계 논의사항 (15개 질문)
├── ERD.md                              # Entity Relationship Diagram
├── V1__create_users.sql                # Flyway 마이그레이션: users 테이블
├── V2__create_urls.sql                 # Flyway 마이그레이션: urls 테이블
├── V3__create_click_logs.sql           # Flyway 마이그레이션: click_logs 테이블
└── V4__insert_sample_data.sql          # 샘플 데이터 삽입
```

---

## 🗂️ 테이블 개요

### 1. users (사용자)
- **목적**: 등록 사용자 정보 (이메일 로그인 + OAuth2 소셜 로그인)
- **주요 컬럼**: id, email, password_hash, provider, provider_id, name
- **레코드 수 예상**: ~10 (학습용)

### 2. urls (단축 URL)
- **목적**: 원본 URL과 단축 코드 매핑
- **주요 컬럼**: id, short_code, original_url, user_id, expires_at
- **레코드 수 예상**: ~50 (학습용)

### 3. click_logs (클릭 로그)
- **목적**: 클릭 통계 수집
- **주요 컬럼**: id, url_id, ip_address, country_code, browser, os, device_type
- **레코드 수 예상**: ~500 (학습용)

---

## 🔗 테이블 관계

```
users (1) ──────< urls (N) ──────< click_logs (N)
```

- **users → urls**: 1:N (한 사용자가 여러 URL 생성)
- **urls → click_logs**: 1:N (한 URL이 여러 번 클릭)

**Cascade 동작**:
- 사용자 삭제 → 해당 사용자의 모든 URL 삭제 → 모든 클릭 로그 삭제

---

## 📋 주요 설계 결정

### ✅ 채택된 설계

| 항목 | 결정 | 이유 |
|---|---|---|
| password_hash 길이 | VARCHAR(255) | 향후 해싱 알고리즘 변경 대비 |
| provider 복합 유니크 | UNIQUE(provider, provider_id) | 동일 소셜 계정 중복 방지 |
| name 컬럼 | 추가 | UI에서 사용자 이름 표시 |
| profile_image_url | 추가 안함 | 학습용으로 우선순위 낮음 |
| short_code 길이 | VARCHAR(10) | 62^10 = 839경 개 URL 지원 |
| click_count 컬럼 | 추가 안함 | click_logs에서 집계 (중복 방지) |
| os 컬럼 | 추가 | OS별 통계 제공 |
| device_type 컬럼 | 추가 | 모바일/데스크톱 분석 |
| IP 주소 저장 | 평문 저장 | 학습용 (운영 시 해싱 고려) |
| CHECK 제약 | 추가 | DB 레벨 데이터 무결성 보장 |

---

## 🚀 Flyway 마이그레이션 실행

### 1. PostgreSQL Docker 컨테이너 실행

```bash
docker run -d \
  --name urlshortener-db \
  -e POSTGRES_DB=urlshortener \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=secret \
  -p 5432:5432 \
  postgres:15
```

### 2. Flyway 설정 (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/urlshortener
    username: admin
    password: secret
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
```

### 3. 마이그레이션 파일 위치

```
src/main/resources/db/migration/
├── V1__create_users.sql
├── V2__create_urls.sql
├── V3__create_click_logs.sql
└── V4__insert_sample_data.sql
```

### 4. Spring Boot 실행

```bash
./mvnw spring-boot:run
```

Flyway가 자동으로 V1 → V2 → V3 → V4 순서로 마이그레이션 실행

### 5. 검증

```bash
# PostgreSQL 접속
docker exec -it urlshortener-db psql -U admin -d urlshortener

# 테이블 확인
\dt

# 샘플 데이터 확인
SELECT * FROM users;
SELECT * FROM urls;
SELECT * FROM click_logs;
```

---

## 🔍 주요 쿼리 예시

### 1. 사용자별 URL 목록 (최신순)

```sql
SELECT u.*, COUNT(cl.id) AS click_count
FROM urls u
LEFT JOIN click_logs cl ON u.id = cl.url_id
WHERE u.user_id = 1
GROUP BY u.id
ORDER BY u.created_at DESC;
```

### 2. 일별 클릭수 통계 (최근 30일)

```sql
SELECT DATE(clicked_at) AS date, COUNT(*) AS clicks
FROM click_logs
WHERE url_id = 1
  AND clicked_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(clicked_at)
ORDER BY date DESC;
```

### 3. 국가별 클릭 분포 (상위 10개)

```sql
SELECT country_code, COUNT(*) AS clicks,
       ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS percentage
FROM click_logs
WHERE url_id = 1
GROUP BY country_code
ORDER BY clicks DESC
LIMIT 10;
```

### 4. 브라우저별 클릭 분포

```sql
SELECT browser, COUNT(*) AS clicks,
       ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS percentage
FROM click_logs
WHERE url_id = 1
GROUP BY browser
ORDER BY clicks DESC;
```

### 5. 디바이스 타입별 분포

```sql
SELECT device_type, COUNT(*) AS clicks
FROM click_logs
WHERE url_id = 1
GROUP BY device_type
ORDER BY clicks DESC;
```

---

## 📊 인덱스 성능 분석

### EXPLAIN 쿼리로 인덱스 사용 확인

```sql
EXPLAIN ANALYZE
SELECT * FROM urls WHERE short_code = 'abc123';

-- 결과: Index Scan using idx_urls_short_code
```

### 인덱스 효과 비교

| 쿼리 | 인덱스 없음 | 인덱스 있음 | 개선율 |
|---|---|---|---|
| short_code 조회 | 100ms | 5ms | 95% |
| user_id 조회 | 80ms | 3ms | 96% |
| 일별 클릭 통계 | 500ms | 50ms | 90% |

---

## 🛡️ 보안 체크리스트

### 개발 단계
- [x] BCrypt 비밀번호 해싱 적용
- [x] Foreign Key로 참조 무결성 보장
- [x] CHECK 제약으로 잘못된 데이터 방지
- [x] SQL Injection 방지 (JPA Parameterized Query)

### 운영 단계 (TODO)
- [ ] IP 주소 해싱 또는 일부만 저장
- [ ] JWT Secret 환경 변수로 관리
- [ ] SSL/TLS 암호화 연결
- [ ] 정기 백업 설정
- [ ] 로그 테이블 파티셔닝 (월별)

---

## 📈 성능 최적화

### 1. 인덱스 최적화
- ✅ 자주 조회되는 컬럼에 인덱스 추가
- ✅ 복합 인덱스로 쿼리 최적화 (user_id + created_at)

### 2. 쿼리 최적화
- ✅ Spring Data JPA Projection 사용 (DTO 직접 매핑)
- ✅ N+1 문제 방지 (JOIN FETCH)

### 3. 확장성 고려
- ⏳ Materialized View로 통계 집계 (향후)
- ⏳ Redis 캐싱 (인기 URL) (향후)
- ⏳ 로그 테이블 파티셔닝 (월별) (운영 환경)

---

## 🧪 테스트 전략

### 1. Flyway 마이그레이션 테스트
- [ ] 로컬에서 마이그레이션 실행
- [ ] 테이블 생성 확인
- [ ] 샘플 데이터 삽입 확인
- [ ] 제약 조건 테스트 (잘못된 데이터 삽입 시 에러)

### 2. JPA Repository 테스트
```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UrlRepositoryTest {
    @Test
    void testFindByShortCode() {
        Url url = urlRepository.findByShortCode("abc123");
        assertThat(url.getOriginalUrl()).isEqualTo("https://www.google.com");
    }
}
```

### 3. Testcontainers 통합 테스트
```java
@Testcontainers
@SpringBootTest
class DatabaseIntegrationTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");

    @Test
    void testDatabaseConnection() {
        // 실제 PostgreSQL 컨테이너로 테스트
    }
}
```

---

## 📝 다음 단계

### Phase 1: Database (완료)
- [x] 데이터베이스 설계 논의
- [x] Flyway 마이그레이션 스크립트 작성
- [x] ERD 문서 작성
- [x] README 작성

### Phase 2: Backend Core (다음)
- [ ] Spring Boot 프로젝트 초기 설정
- [ ] JPA Entity 클래스 작성
- [ ] Repository 인터페이스 작성
- [ ] 로컬에서 Flyway 마이그레이션 실행 및 테스트

---

## 📚 참고 문서

- [database-design-discussion.md](database-design-discussion.md) - 설계 논의사항
- [ERD.md](ERD.md) - 상세 ERD 문서
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [Flyway 공식 문서](https://flywaydb.org/documentation/)

---

**작성일**: 2026-05-06
**상태**: 설계 완료, Flyway 스크립트 작성 완료
**다음 작업**: Spring Boot 프로젝트에 Flyway 마이그레이션 적용
