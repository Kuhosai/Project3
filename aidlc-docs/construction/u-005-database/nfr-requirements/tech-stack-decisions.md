# Tech Stack Decisions - Unit U-005 (Database Schema)

## Purpose
This document records all technology stack decisions made for the URL Shortener database layer.

---

## Decision 1: Database Management System

### Decision
**PostgreSQL 15**

### Alternatives Considered
- MySQL 8.0
- MariaDB 10.x
- MongoDB (NoSQL)

### Rationale
1. **Open Source**: 무료, 활발한 커뮤니티
2. **ACID Compliance**: 트랜잭션 일관성 보장
3. **Advanced Features**:
   - Window Functions (통계 쿼리에 유용)
   - JSON Support (향후 확장 가능)
   - Partitioning (대량 데이터 관리)
4. **Spring Boot Integration**: 완벽한 JPA/Hibernate 지원
5. **Learning Value**: 업계 표준 RDBMS 학습

### Trade-offs
- **장점**: 강력한 기능, 높은 안정성, 표준 SQL 준수
- **단점**: MySQL 대비 초기 설정 복잡도 약간 높음

### Implementation
```yaml
# docker-compose.yml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: urlshortener
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
```

---

## Decision 2: Migration Tool

### Decision
**Flyway 9.x**

### Alternatives Considered
- Liquibase
- Manual SQL scripts
- JPA Auto-DDL

### Rationale
1. **Version Control**: SQL 스크립트 버전 관리
2. **Team Collaboration**: 팀원 간 스키마 변경 공유 용이
3. **Production Safety**: 운영 환경 스키마 변경 안전하게 적용
4. **Simple**: Liquibase보다 러닝 커브 낮음
5. **Spring Boot Integration**: 자동 실행 지원 (`spring.flyway.enabled=true`)

### Trade-offs
- **장점**: 간단한 사용법, SQL 스크립트 기반, 명확한 버전 관리
- **단점**: Undo 마이그레이션 미지원 (Community Edition)

### Implementation
```yaml
# application.yml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
```

**Migration Files**:
- `V1__create_users.sql`
- `V2__create_urls.sql`
- `V3__create_click_logs.sql`
- `V4__insert_sample_data.sql`

---

## Decision 3: ORM (Object-Relational Mapping)

### Decision
**Spring Data JPA + Hibernate 6.x**

### Alternatives Considered
- MyBatis
- JDBC Template
- jOOQ

### Rationale
1. **Productivity**: Entity 클래스로 테이블 매핑 자동화
2. **Repository Pattern**: CRUD 메서드 자동 생성
3. **Type Safety**: 컴파일 타임 타입 체크
4. **Caching**: 2차 캐시 지원 (향후 성능 최적화)
5. **Community**: 업계 표준, 방대한 레퍼런스

### Trade-offs
- **장점**: 개발 속도 향상, 유지보수 용이
- **단점**: 복잡한 쿼리는 Native Query 필요

### Implementation
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ...
}

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
```

---

## Decision 4: Connection Pool

### Decision
**HikariCP (Spring Boot 기본)**

### Alternatives Considered
- Apache DBCP2
- Tomcat JDBC Pool
- C3P0

### Rationale
1. **Default**: Spring Boot 3.x 기본 연결 풀
2. **Performance**: 가장 빠른 성능 (벤치마크 결과)
3. **Lightweight**: 작은 메모리 풋프린트
4. **Zero-Config**: 기본 설정으로도 충분한 성능

### Trade-offs
- **장점**: 최고 성능, 간단한 설정
- **단점**: 특별한 단점 없음 (업계 표준)

### Implementation
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

---

## Decision 5: Password Hashing

### Decision
**BCrypt (Spring Security BCryptPasswordEncoder)**

### Alternatives Considered
- PBKDF2
- Argon2
- Scrypt

### Rationale
1. **Industry Standard**: 널리 사용되는 표준
2. **Spring Security Integration**: 기본 제공
3. **Salt Auto-Generation**: 랜덤 salt 자동 생성
4. **Adaptive**: Work factor 조정 가능 (미래 하드웨어 대비)
5. **Learning Value**: 업계 표준 해싱 알고리즘 학습

### Trade-offs
- **장점**: 검증된 보안성, 간단한 사용법
- **단점**: Argon2보다 약간 느림 (학습용 프로젝트에서는 무관)

### Implementation
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

// 사용 예시
String hashedPassword = passwordEncoder.encode("plainPassword");
boolean matches = passwordEncoder.matches("plainPassword", hashedPassword);
```

---

## Decision 6: Indexing Strategy

### Decision
**B-Tree Indexes (PostgreSQL 기본)**

### Alternatives Considered
- Hash Indexes
- GiST Indexes
- GIN Indexes

### Rationale
1. **Default**: PostgreSQL의 기본 인덱스 타입
2. **Versatile**: 대부분의 쿼리 패턴에 적합 (=, <, >, BETWEEN, LIKE)
3. **Performance**: 조회/삽입/삭제 모두 O(log n)
4. **Learning Value**: 가장 널리 사용되는 인덱스 타입

### Trade-offs
- **장점**: 범용성, 안정성, 성능
- **단점**: Full-Text Search에는 GIN이 더 적합 (현재 요구사항 없음)

### Implementation
```sql
-- 단일 컬럼 인덱스
CREATE INDEX idx_urls_short_code ON urls(short_code);

-- 복합 인덱스
CREATE INDEX idx_click_logs_url_clicked ON click_logs(url_id, clicked_at);
```

---

## Decision 7: Data Types

### Decision Summary

| Column | Data Type | Rationale |
|---|---|---|
| id | BIGSERIAL | 자동 증가, 최대 9 quintillion |
| email | VARCHAR(255) | 표준 이메일 길이 |
| password_hash | VARCHAR(255) | BCrypt (60자) + 향후 알고리즘 변경 대비 |
| short_code | VARCHAR(10) | Base62 인코딩 결과 (62^10 = 839경 개) |
| original_url | TEXT | URL 길이 제한 없음 |
| ip_address | VARCHAR(45) | IPv6 최대 길이 (45자) |
| user_agent | TEXT | User-Agent 길이 제한 없음 |
| country_code | VARCHAR(2) | ISO 3166-1 alpha-2 (2자) |
| clicked_at | TIMESTAMP | 날짜+시간 (마이크로초 정밀도) |

### Key Decisions

#### BIGSERIAL vs INTEGER
- **Decision**: BIGSERIAL
- **Rationale**: 최대 ~9.2 quintillion 레코드 지원 (확장성)
- **Trade-off**: 디스크 공간 2배 (8 bytes vs 4 bytes) - 학습용에서는 무관

#### VARCHAR vs TEXT
- **Decision**: 가변 길이 필드는 TEXT, 제한 길이 필드는 VARCHAR
- **Rationale**:
  - `original_url`, `user_agent`: TEXT (길이 제한 없음)
  - `email`, `short_code`: VARCHAR (길이 제한 필요)
- **Trade-off**: TEXT는 인덱스 크기 증가 가능 (현재 요구사항에서는 무관)

#### TIMESTAMP vs TIMESTAMPTZ
- **Decision**: TIMESTAMP (timezone 미포함)
- **Rationale**: 학습용 프로젝트, 단일 타임존 가정
- **Future**: 운영 환경에서는 TIMESTAMPTZ 고려 (UTC 저장)

---

## Decision 8: Constraint Strategy

### Decision
**Database-Level Constraints + Application-Level Validation**

### Strategy

| Constraint Type | Enforcement Level | Examples |
|---|---|---|
| PRIMARY KEY | Database | `id BIGSERIAL PRIMARY KEY` |
| FOREIGN KEY | Database | `FOREIGN KEY (user_id) REFERENCES users(id)` |
| UNIQUE | Database | `email VARCHAR(255) UNIQUE` |
| CHECK | Database | `CHECK (provider IN ('local', 'google', 'github'))` |
| NOT NULL | Database | `email VARCHAR(255) NOT NULL` |
| Format Validation | Application | URL 형식 검증, 이메일 형식 검증 |
| Business Rules | Application | 만료일 < 생성일 검증 (추가) |

### Rationale
- **Database Constraints**: 마지막 방어선, 데이터 무결성 보장
- **Application Validation**: 사용자 친화적 에러 메시지, 빠른 피드백

### Trade-offs
- **장점**: 다층 방어, 데이터 일관성 보장
- **단점**: 중복 검증 로직 (필요한 trade-off)

---

## Decision 9: Cascade Delete Strategy

### Decision
**ON DELETE CASCADE for all Foreign Keys**

### Rationale
1. **GDPR Compliance**: 사용자 삭제 시 모든 관련 데이터 삭제
2. **Data Consistency**: 고아 레코드 (orphan records) 방지
3. **Simplicity**: 애플리케이션 코드에서 수동 삭제 불필요

### Cascade Chain
```
User 삭제
  ↓ (CASCADE)
Url 삭제 (해당 사용자의 모든 URL)
  ↓ (CASCADE)
ClickLog 삭제 (해당 URL의 모든 클릭 로그)
```

### Trade-offs
- **장점**: 자동 정리, GDPR 준수
- **단점**: 실수로 User 삭제 시 모든 데이터 손실 (주의 필요)

### Implementation
```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE
```

---

## Decision 10: Sample Data Strategy

### Decision
**Flyway V4__insert_sample_data.sql**

### Rationale
1. **Development Convenience**: 애플리케이션 실행 시 즉시 테스트 가능
2. **Consistent Test Data**: 팀원 간 동일한 샘플 데이터 공유
3. **UI Testing**: 통계 차트 UI 테스트용 다양한 데이터

### Sample Data Contents
- 3명의 사용자 (로컬 2명, Google OAuth2 1명)
- 5개의 URL (등록 사용자 4개, 익명 1개)
- 10개의 클릭 로그 (다양한 국가, 브라우저, 디바이스)

### Trade-offs
- **장점**: 개발 생산성 향상, 일관된 테스트 환경
- **단점**: 운영 환경에서는 제거 필요 (Flyway profile 분리)

---

## Decision 11: Normalization Level

### Decision
**3NF (Third Normal Form)**

### Rationale
1. **No Redundancy**: 중복 데이터 최소화
2. **Update Anomalies**: 업데이트 이상 방지
3. **Foreign Keys**: 명확한 관계 정의
4. **Learning Value**: 정규화 개념 학습

### Normalization Applied
- **1NF**: 모든 속성이 원자값 (atomic)
- **2NF**: 부분 함수 종속 제거
- **3NF**: 이행 함수 종속 제거

### Trade-offs
- **장점**: 데이터 일관성, 저장 공간 절약
- **단점**: JOIN 쿼리 필요 (인덱스로 성능 최적화)

### Example
❌ **비정규화** (click_logs에 url_owner_name 컬럼 추가)
```sql
-- 중복 데이터, UPDATE 이상 발생 가능
click_logs (id, url_id, url_owner_name, clicked_at)
```

✅ **3NF** (JOIN으로 조회)
```sql
-- 정규화된 구조
SELECT cl.*, u.name AS url_owner_name
FROM click_logs cl
JOIN urls ur ON cl.url_id = ur.id
JOIN users u ON ur.user_id = u.id
```

---

## Decision 12: Timezone Handling

### Decision
**TIMESTAMP (without timezone) + Application-Level UTC Conversion**

### Rationale
1. **Simplicity**: 학습용 프로젝트, 단일 타임존 가정
2. **Spring Boot Default**: LocalDateTime 사용
3. **Future Extension**: 운영 환경에서는 TIMESTAMPTZ + UTC 저장 권장

### Current Implementation
```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Future Recommendation (운영 환경)
```sql
created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
clicked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
```

### Trade-offs
- **장점** (현재): 간단한 구현
- **단점** (현재): 다중 타임존 지원 어려움
- **운영 환경**: TIMESTAMPTZ + UTC 저장 필수

---

## Tech Stack Summary

| Category | Technology | Version | Rationale |
|---|---|---|---|
| **Database** | PostgreSQL | 15 | ACID, Advanced Features, Learning Value |
| **Migration** | Flyway | 9.x | Simple, SQL-Based, Version Control |
| **ORM** | Spring Data JPA + Hibernate | 6.x | Productivity, Repository Pattern |
| **Connection Pool** | HikariCP | Default | Best Performance, Zero-Config |
| **Password Hashing** | BCrypt | Spring Security | Industry Standard, Salt Auto-Gen |
| **Indexing** | B-Tree | PostgreSQL Default | Versatile, Performance |
| **Constraints** | DB + App Validation | - | Multi-Layer Defense |
| **Cascade** | ON DELETE CASCADE | - | GDPR, Data Consistency |
| **Normalization** | 3NF | - | No Redundancy, Learning Value |
| **Sample Data** | Flyway V4 | - | Development Convenience |

---

## Decision Log

| Date | Decision | Rationale | Alternatives |
|---|---|---|---|
| 2026-05-31 | PostgreSQL 15 | ACID, Features, Learning | MySQL, MongoDB |
| 2026-05-31 | Flyway 9.x | Simple, SQL-Based | Liquibase, JPA Auto-DDL |
| 2026-05-31 | BCrypt | Industry Standard | Argon2, PBKDF2 |
| 2026-05-31 | B-Tree Indexes | Versatile, Default | Hash, GIN |
| 2026-05-31 | 3NF | Data Consistency | Denormalization |
| 2026-05-31 | CASCADE DELETE | GDPR, Simplicity | Manual Delete |
| 2026-05-31 | BIGSERIAL | Scalability | INTEGER |
| 2026-05-31 | TIMESTAMP | Simplicity | TIMESTAMPTZ |

---

**작성일**: 2026-05-31
**작성자**: AI-DLC (CONSTRUCTION Phase)
**상태**: Tech Stack Decisions 완료
