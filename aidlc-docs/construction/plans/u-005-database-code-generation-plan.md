# Code Generation Plan - Unit U-005 (Database Schema)

## Purpose
이 플랜은 Unit U-005 (Database Schema)의 코드 생성 단계를 정의합니다.

**중요**: Unit U-005는 데이터베이스 스키마 전용 유닛으로, Java 애플리케이션 코드는 생성하지 않습니다. SQL 마이그레이션 파일은 이미 존재하며, Docker Compose 및 Spring Boot 설정 파일만 생성합니다.

---

## Unit Context

### Unit Information
- **Unit ID**: U-005
- **Unit Name**: Database Schema
- **Unit Type**: Database
- **Primary Responsibility**: PostgreSQL Schema + Flyway Migrations

### Dependencies
- **Internal**: None (독립적 유닛)
- **External**: PostgreSQL 15, Flyway 9.x

### Existing Artifacts
**SQL Migration Files** (이미 존재, 재사용):
- `aidlc-docs/construction/u-005-database/V1__create_users.sql`
- `aidlc-docs/construction/u-005-database/V2__create_urls.sql`
- `aidlc-docs/construction/u-005-database/V3__create_click_logs.sql`
- `aidlc-docs/construction/u-005-database/V4__insert_sample_data.sql`

**Design Artifacts**:
- Functional Design: `aidlc-docs/construction/u-005-database/functional-design/`
- NFR Requirements: `aidlc-docs/construction/u-005-database/nfr-requirements/`
- Infrastructure Design: `aidlc-docs/construction/u-005-database/infrastructure-design/`

---

## Code Generation Steps

### Step 1: SQL 마이그레이션 파일 이동
- [x] **Action**: 기존 SQL 파일을 백엔드 리소스 경로로 이동
- **Source**: `aidlc-docs/construction/u-005-database/V*.sql`
- **Target**: `backend/src/main/resources/db/migration/`
- **Files**:
  - `V1__create_users.sql`
  - `V2__create_urls.sql`
  - `V3__create_click_logs.sql`
  - `V4__insert_sample_data.sql` (provider_id 위치 수정하여 복사)
- **Rationale**: Flyway는 classpath의 `db/migration` 폴더에서 마이그레이션 파일을 자동 실행

### Step 2: Docker Compose 파일 생성
- [x] **Action**: 멀티 컨테이너 Docker Compose 설정 파일 생성
- **File**: `docker-compose.yml` (workspace root)
- **Services**:
  - `db`: PostgreSQL 15 컨테이너
  - `backend`: Spring Boot 컨테이너 (플레이스홀더, U-001에서 구현)
  - `frontend`: React + Nginx 컨테이너 (플레이스홀더, U-004에서 구현)
- **Configuration**:
  - Database: `postgres:15`, port 5432, named volume `db-data`
  - Network: `urlshortener-network` (bridge)
  - Healthcheck: `pg_isready -U admin`
  - Environment variables: POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
- **Rationale**: Infrastructure Design에서 정의한 Docker Compose 구조 구현

### Step 3: PostgreSQL 초기화 스크립트 생성 (Optional)
- [x] **Action**: SKIPPED - PostgreSQL 컨테이너 초기화 스크립트 생성
- **File**: `init-db.sh` (workspace root)
- **Purpose**: PostgreSQL 컨테이너 시작 시 자동 실행 (DB 생성 확인)
- **Content**:
  - Database 생성 확인
  - 기본 권한 설정
- **Rationale**: Docker Compose의 POSTGRES_DB 환경 변수가 자동으로 DB 생성하므로, 추가 스크립트는 옵션

### Step 4: Backend application.yml 생성 (Database 설정만)
- [x] **Action**: Spring Boot 데이터베이스 연결 설정 생성
- **File**: `backend/src/main/resources/application.yml`
- **Configuration**:
  - DataSource: `jdbc:postgresql://db:5432/urlshortener`
  - Flyway: enabled, locations, baseline-on-migrate
  - HikariCP: pool size, connection timeout
  - JPA: show-sql, ddl-auto=validate
- **Rationale**: Backend 유닛(U-001, U-002, U-003)에서 DB 연결 및 Flyway 자동 실행 설정

### Step 5: Backend pom.xml 생성 (Database 의존성만)
- [x] **Action**: Spring Boot 프로젝트 POM 파일 생성 (Database 관련 의존성)
- **File**: `backend/pom.xml`
- **Dependencies**:
  - `spring-boot-starter-data-jpa`
  - `postgresql` (runtime)
  - `flyway-core`
- **Rationale**: Database 연결 및 마이그레이션 실행을 위한 최소 의존성 설정

### Step 6: .env 예시 파일 생성
- [x] **Action**: Docker Compose 환경 변수 템플릿 생성
- **File**: `.env.example` (workspace root)
- **Variables**:
  - `POSTGRES_DB=urlshortener`
  - `POSTGRES_USER=admin`
  - `POSTGRES_PASSWORD=secret`
  - `SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/urlshortener`
- **Rationale**: 환경 변수 관리 및 보안 (실제 `.env`는 `.gitignore`에 추가)

### Step 7: .gitignore 파일 생성
- [x] **Action**: Git 버전 관리 제외 파일 목록 생성 (기존 파일에 추가)
- **File**: `.gitignore` (workspace root)
- **Entries**:
  - `.env` (실제 환경 변수 파일)
  - `target/` (Maven 빌드 결과)
  - `node_modules/` (프론트엔드 의존성)
  - `.idea/`, `.vscode/` (IDE 설정)
- **Rationale**: 민감 정보 및 빌드 결과물 Git 추적 방지

### Step 8: 코드 생성 요약 문서 작성
- [x] **Action**: 생성된 파일 및 설정 요약 문서 작성
- **File**: `aidlc-docs/construction/u-005-database/code/code-generation-summary.md`
- **Content**:
  - 생성된 파일 목록 (경로 포함)
  - SQL 마이그레이션 파일 이동 내역
  - Docker Compose 서비스 구조
  - Flyway 설정 요약
  - Backend 의존성 목록
  - 다음 단계 가이드 (Unit U-001 개발 시작)
- **Rationale**: 코드 생성 과정 및 결과 문서화

---

## File Generation Summary

### Application Code (Workspace Root)
**생성할 파일**:
1. `docker-compose.yml` - Docker Compose 멀티 컨테이너 설정
2. `.env.example` - 환경 변수 템플릿
3. `.gitignore` - Git 제외 파일 목록
4. `backend/src/main/resources/application.yml` - Spring Boot DB 설정
5. `backend/pom.xml` - Maven 의존성 (Database 관련)

**이동할 파일** (SQL Migrations):
- `aidlc-docs/construction/u-005-database/V*.sql` → `backend/src/main/resources/db/migration/`

### Documentation (aidlc-docs/)
**생성할 파일**:
1. `aidlc-docs/construction/u-005-database/code/code-generation-summary.md` - 코드 생성 요약

---

## Story Traceability

**Unit U-005는 User Story가 아닌 기술 인프라 유닛이므로, Story ID는 없습니다.**

**지원하는 User Stories** (간접적):
- 모든 User Stories (US-001 ~ US-013)의 데이터 저장소 역할

---

## Completion Criteria

- [x] 모든 계획 단계 (Step 1-8) 완료
- [ ] SQL 마이그레이션 파일 백엔드 리소스 경로로 이동
- [ ] Docker Compose 파일 생성 (PostgreSQL 서비스 설정)
- [ ] Backend application.yml 생성 (DB 연결 및 Flyway 설정)
- [ ] Backend pom.xml 생성 (Database 의존성)
- [ ] .env.example 및 .gitignore 생성
- [ ] 코드 생성 요약 문서 작성
- [ ] 사용자 승인 완료

---

## Next Steps After Code Generation

1. **Unit U-001 (Backend Core) 시작**:
   - Functional Design 단계로 진행
   - URL Management, Click Tracking 비즈니스 로직 설계

2. **Docker Compose 테스트**:
   - `docker-compose up db` 실행하여 PostgreSQL 컨테이너 시작 확인
   - Healthcheck 통과 여부 확인 (`docker-compose ps`)

3. **Flyway 마이그레이션 검증**:
   - Backend 컨테이너 시작 시 Flyway 자동 실행 확인
   - 테이블 생성 확인 (`docker exec -it urlshortener-db psql -U admin -d urlshortener`)

---

**작성일**: 2026-05-31
**작성자**: AI-DLC (CONSTRUCTION Phase - Code Generation Planning)
**상태**: Plan Created - Awaiting User Approval
