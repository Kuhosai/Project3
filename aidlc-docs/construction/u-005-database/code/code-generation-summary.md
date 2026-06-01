# Code Generation Summary - Unit U-005 (Database Schema)

## Purpose
이 문서는 Unit U-005 (Database Schema)의 코드 생성 결과를 요약합니다.

---

## Generated Files

### 1. SQL Migration Files
**Location**: `backend/src/main/resources/db/migration/`

| File | Purpose | Tables/Rows Created |
|---|---|---|
| `V1__create_users.sql` | 사용자 테이블 생성 | users (3 indexes) |
| `V2__create_urls.sql` | URL 단축 테이블 생성 | urls (4 indexes) |
| `V3__create_click_logs.sql` | 클릭 로그 테이블 생성 | click_logs (3 indexes) |
| `V4__insert_sample_data.sql` | 샘플 데이터 삽입 | 3 users, 5 urls, 10 click_logs |

**Source**: `aidlc-docs/construction/u-005-database/V*.sql` (기존 파일 복사)

**Note**: V4__insert_sample_data.sql의 Google 사용자 INSERT문에서 provider_id 위치 수정하여 복사함

---

### 2. Docker Compose Configuration
**Location**: `docker-compose.yml` (workspace root)

**Services**:
- **db**: PostgreSQL 15 컨테이너
  - Image: `postgres:15`
  - Port: `5432:5432`
  - Volume: `db-data` (named volume for data persistence)
  - Healthcheck: `pg_isready -U admin` (10s interval)
  - Environment: POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD

- **backend**: Spring Boot 컨테이너 (플레이스홀더)
  - Port: `8080:8080`
  - Depends on: `db` (service_healthy condition)
  - Environment: DataSource URL, Flyway configuration, JWT secret
  - **Note**: Dockerfile will be created in Unit U-001

- **frontend**: React + Nginx 컨테이너 (플레이스홀더)
  - Port: `80:80`
  - Depends on: `backend`
  - **Note**: Dockerfile will be created in Unit U-004

**Network**: `urlshortener-network` (bridge driver)

---

### 3. Backend Spring Boot Configuration
**Location**: `backend/src/main/resources/application.yml`

**Configuration Sections**:
- **DataSource**: PostgreSQL connection (`jdbc:postgresql://localhost:5432/urlshortener`)
- **HikariCP**: Connection pool (max: 10, min-idle: 5, timeout: 30s)
- **Flyway**: Migration enabled, classpath location, baseline-on-migrate
- **JPA/Hibernate**: PostgreSQL dialect, ddl-auto: validate, show-sql: false
- **Logging**: DEBUG level for com.urlshortener, Hibernate SQL
- **Server**: Port 8080, error details included

**Environment Variables Support**:
- `SPRING_DATASOURCE_URL` (default: localhost)
- `SPRING_DATASOURCE_USERNAME` (default: admin)
- `SPRING_DATASOURCE_PASSWORD` (default: secret)

---

### 4. Backend Maven Dependencies
**Location**: `backend/pom.xml`

**Spring Boot Version**: 3.2.0
**Java Version**: 17

**Dependencies** (Database-related):
- `spring-boot-starter-web` - REST API support
- `spring-boot-starter-data-jpa` - JPA/Hibernate
- `postgresql` - PostgreSQL JDBC driver (runtime)
- `flyway-core` - Flyway migration
- `flyway-database-postgresql` - Flyway PostgreSQL support
- `spring-boot-starter-validation` - @Valid, @NotNull support
- `lombok` - Boilerplate reduction (optional)
- `spring-boot-devtools` - Auto-reload (runtime, optional)
- `spring-boot-starter-test` - Testing (test scope)

**Note**: Additional dependencies for Base62, GeoLite2, JWT, OAuth2, Swagger will be added in Units U-001, U-002, U-003, U-006

---

### 5. Environment Variables Template
**Location**: `.env.example` (workspace root)

**Variables**:
```env
POSTGRES_DB=urlshortener
POSTGRES_USER=admin
POSTGRES_PASSWORD=secret
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/urlshortener
SPRING_DATASOURCE_USERNAME=admin
SPRING_DATASOURCE_PASSWORD=secret
JWT_SECRET=your-secret-key-change-in-production-minimum-32-characters
```

**Placeholder variables** (for future units):
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (Unit U-003)
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (Unit U-003)
- `GEOIP_DATABASE_PATH` (Unit U-001)
- `CORS_ALLOWED_ORIGINS` (Units U-001, U-002, U-003)

**Usage**: Copy `.env.example` to `.env` and fill in actual values

---

### 6. Git Ignore Rules
**Location**: `.gitignore` (workspace root)

**Added Entries**:
- `.env` (sensitive credentials)
- `backend/target/` (Maven build results)
- `frontend/node_modules/`, `frontend/build/` (Node.js artifacts)
- `.idea/`, `*.iml` (IntelliJ IDEA)
- `.vscode/` (VS Code - already existed)
- `*.log`, `logs/` (log files)
- `*.jar`, `*.war` (package files)
- `*.mmdb` (GeoIP database)
- `coverage/`, `.cache/` (test artifacts)

---

## Database Schema Overview

### Tables Created
1. **users** (7 columns, 2 indexes)
   - Primary Key: `id` (BIGSERIAL)
   - Unique Constraints: `email`, `(provider, provider_id)`
   - Check Constraint: `provider IN ('local', 'google', 'github')`

2. **urls** (7 columns, 4 indexes)
   - Primary Key: `id` (BIGSERIAL)
   - Unique Constraint: `short_code`
   - Foreign Key: `user_id` → users(id) ON DELETE CASCADE
   - Check Constraint: `expires_at > created_at`

3. **click_logs** (10 columns, 3 indexes)
   - Primary Key: `id` (BIGSERIAL)
   - Foreign Key: `url_id` → urls(id) ON DELETE CASCADE
   - Check Constraint: `device_type IN ('mobile', 'desktop', 'tablet', 'unknown')`

### Cascade Delete Chain
```
User deleted → URLs deleted → ClickLogs deleted
```

---

## Flyway Migration Workflow

### Execution Order
1. **V1__create_users.sql**: Creates `users` table with 2 indexes
2. **V2__create_urls.sql**: Creates `urls` table with 4 indexes (references `users`)
3. **V3__create_click_logs.sql**: Creates `click_logs` table with 3 indexes (references `urls`)
4. **V4__insert_sample_data.sql**: Inserts sample data (3 users, 5 URLs, 10 click logs)

### Flyway Configuration
- **Location**: `classpath:db/migration`
- **Baseline on Migrate**: `true` (allows Flyway to run on existing database)
- **Baseline Version**: `0`
- **Validate on Migrate**: `true` (checks migration checksums)

---

## Docker Compose Deployment Flow

### Start Database Only
```bash
docker-compose up -d db
```

**Result**: PostgreSQL 15 starts, creates `urlshortener` database, waits for healthcheck

### Start Backend (when Dockerfile exists in Unit U-001)
```bash
docker-compose up -d backend
```

**Result**:
1. Backend waits for `db` service to be healthy
2. Spring Boot starts
3. Flyway automatically runs migrations (V1 → V4)
4. Application connects to database

### Verify Migration
```bash
# Check database tables
docker exec -it urlshortener-db psql -U admin -d urlshortener -c "\dt"

# Check sample data
docker exec -it urlshortener-db psql -U admin -d urlshortener -c "SELECT * FROM users;"
```

---

## File Structure

```
project3/
├── backend/
│   ├── src/main/resources/
│   │   ├── application.yml  ✅ Created
│   │   └── db/migration/
│   │       ├── V1__create_users.sql  ✅ Copied
│   │       ├── V2__create_urls.sql  ✅ Copied
│   │       ├── V3__create_click_logs.sql  ✅ Copied
│   │       └── V4__insert_sample_data.sql  ✅ Copied (modified)
│   └── pom.xml  ✅ Created
├── docker-compose.yml  ✅ Created
├── .env.example  ✅ Created
├── .gitignore  ✅ Updated
└── aidlc-docs/
    └── construction/
        └── u-005-database/
            ├── functional-design/
            ├── nfr-requirements/
            ├── infrastructure-design/
            └── code/
                └── code-generation-summary.md  ✅ This file
```

---

## Next Steps

### 1. Test Database Service
```bash
# Start database
docker-compose up -d db

# Check healthcheck
docker-compose ps

# Verify PostgreSQL
docker exec -it urlshortener-db psql -U admin -d urlshortener -c "SELECT version();"
```

### 2. Create Backend Dockerfile (Unit U-001)
**File**: `backend/Dockerfile`
**Content**: Multi-stage build for Spring Boot JAR

### 3. Start Unit U-001 (Backend Core)
**Stages**:
- Functional Design
- NFR Requirements
- NFR Design
- Infrastructure Design
- Code Generation

**Deliverables**:
- Entity classes (User, Url, ClickLog)
- Repository interfaces
- Service classes (UrlService, ClickTrackingService, Base62EncodingService)
- REST Controllers (UrlController)
- Unit tests

---

## Completion Checklist

- [x] SQL migration files copied to `backend/src/main/resources/db/migration/`
- [x] Docker Compose file created with PostgreSQL service
- [x] Backend application.yml created (DataSource, Flyway, HikariCP, JPA)
- [x] Backend pom.xml created (Spring Boot 3.2.0, PostgreSQL, Flyway, JPA)
- [x] .env.example created with database credentials template
- [x] .gitignore updated with backend and frontend exclusions
- [x] Code generation summary documented

---

**작성일**: 2026-05-31
**작성자**: AI-DLC (CONSTRUCTION Phase - Code Generation)
**상태**: Code Generation Complete
