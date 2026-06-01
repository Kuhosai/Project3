# Infrastructure Design - Unit U-005 (Database Schema)

## Purpose
This document defines the infrastructure design for deploying the PostgreSQL database in the URL Shortener system.

---

## Deployment Environment

### Target Environment
**Docker Compose (Local Development)**

### Rationale
- 학습용 프로젝트 - 로컬 개발 환경 전용
- 모든 서비스를 단일 머신에서 실행
- 간단한 설정 및 배포

### Future Considerations
- **Staging/Production**: Docker Swarm, Kubernetes, or cloud-managed databases (AWS RDS, Azure Database for PostgreSQL)

---

## Database Infrastructure

### Service Specification

**Service Name**: `db`
**Container Image**: `postgres:15`
**Exposed Port**: `5432`

### Environment Configuration

```yaml
services:
  db:
    image: postgres:15
    container_name: urlshortener-db
    environment:
      POSTGRES_DB: urlshortener
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - urlshortener-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### Volume Mapping

**Volume Name**: `db-data`
**Mount Point**: `/var/lib/postgresql/data`
**Purpose**: 데이터 영속성 보장 (컨테이너 재시작 시에도 데이터 유지)

```yaml
volumes:
  db-data:
    driver: local
```

---

## Network Architecture

### Network Configuration

**Network Name**: `urlshortener-network`
**Driver**: `bridge` (Docker 기본값)

**Connected Services**:
- `db` (PostgreSQL)
- `backend` (Spring Boot)
- `frontend` (React + Nginx)

```yaml
networks:
  urlshortener-network:
    driver: bridge
```

### Service Communication

```
┌─────────────┐
│  frontend   │
│  (port 80)  │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────┐
│  backend    │
│ (port 8080) │
└──────┬──────┘
       │ JDBC
       ▼
┌─────────────┐
│     db      │
│ (port 5432) │
└─────────────┘
```

**Internal Hostname**: `db` (Docker DNS 자동 해석)
**Connection String**: `jdbc:postgresql://db:5432/urlshortener`

---

## Resource Allocation

### Database Container Resources

| Resource | Allocation | Rationale |
|---|---|---|
| CPU | No limit | 학습용 - 호스트 CPU 공유 |
| Memory | No limit | 학습용 - 호스트 메모리 공유 |
| Storage | Docker Volume | 영속성 보장 |
| Network | Bridge | 컨테이너 간 통신 |

### Future Considerations (Production)

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 4G
    reservations:
      cpus: '1.0'
      memory: 2G
```

---

## High Availability (Future)

### Current Architecture
**Single Instance** - 학습용 프로젝트

### Production Architecture (Future)

```
┌─────────────────────────────────────┐
│         HAProxy / PgBouncer         │
│       (Load Balancer + Pool)        │
└───────────┬─────────────────────────┘
            │
       ┌────┴────┐
       │         │
       ▼         ▼
  ┌────────┐  ┌────────┐  ┌────────┐
  │Primary │  │Replica │  │Replica │
  │  (RW)  │  │  (R)   │  │  (R)   │
  └────────┘  └────────┘  └────────┘
       │
       ▼
  [Streaming Replication]
```

**Components**:
- **Primary**: Read/Write
- **Replicas**: Read-only (통계 쿼리용)
- **HAProxy**: Load balancing
- **Patroni**: Automatic failover

---

## Backup and Recovery (Future)

### Current State
- **No automated backup** (학습용)
- **Manual backup**: `docker exec` + `pg_dump`

### Production Strategy (Future)

**Automated Backup**:
```bash
# Daily backup script
pg_dump -U admin -h localhost urlshortener > backup_$(date +%Y%m%d).sql
```

**Backup Retention**:
- Daily backups: 30일 보관
- Weekly backups: 3개월 보관
- Monthly backups: 1년 보관

**Storage**: AWS S3, Azure Blob Storage, or local NAS

---

## Monitoring and Observability (Future)

### Current State
- **No monitoring** (학습용)
- **Manual check**: `docker logs urlshortener-db`

### Production Monitoring (Future)

**Metrics to Monitor**:
- Connection count
- Query performance (slow query log)
- Disk usage
- Replication lag (if using replicas)
- Transaction throughput

**Tools**:
- **Prometheus + Grafana**: 메트릭 수집 및 시각화
- **pg_stat_statements**: 쿼리 성능 분석
- **Datadog / New Relic**: APM (Application Performance Monitoring)

**Alerting**:
- Disk usage > 80%
- Connection pool exhaustion
- Replication lag > 10s

---

## Security Configuration

### Current Configuration

**Credentials**:
- Username: `admin`
- Password: `secret`
- Database: `urlshortener`

**Network Exposure**:
- Port `5432` exposed to localhost only
- Docker bridge network isolation

### Production Security (Future)

**Credentials Management**:
- Use Docker secrets or environment variables from secret manager
- Rotate credentials periodically

**Network Security**:
- Do NOT expose port 5432 to public internet
- Use private network or VPN for remote access
- Enable SSL/TLS for database connections

**Access Control**:
- Create separate users for different services
- Grant minimal privileges (least privilege principle)
- Use connection pooling with limited connections

```sql
-- Production user setup
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE urlshortener TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
```

---

## Flyway Migration Integration

### Docker Compose Integration

**Migration Execution**: Spring Boot 시작 시 자동 실행

**Environment Variables** (backend service):
```yaml
backend:
  environment:
    SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/urlshortener
    SPRING_DATASOURCE_USERNAME: admin
    SPRING_DATASOURCE_PASSWORD: secret
    SPRING_FLYWAY_ENABLED: true
    SPRING_FLYWAY_LOCATIONS: classpath:db/migration
```

### Migration Files Location

**Container Path**: `/app/BOOT-INF/classes/db/migration/`
**Migration Files**:
- `V1__create_users.sql`
- `V2__create_urls.sql`
- `V3__create_click_logs.sql`
- `V4__insert_sample_data.sql`

### Execution Order

```
1. Docker Compose starts `db` service
2. PostgreSQL initializes (healthcheck passes)
3. Backend service starts (depends_on: db)
4. Flyway runs migrations in order (V1 → V2 → V3 → V4)
5. Application starts
```

---

## Healthcheck Configuration

### Database Healthcheck

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U admin"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 30s
```

**Purpose**:
- Docker Compose가 DB 준비 상태 확인
- Backend service가 DB 준비 후 시작 (`depends_on` + `condition: service_healthy`)

**Healthcheck Command**:
```bash
pg_isready -U admin
# Output: /var/run/postgresql:5432 - accepting connections
```

---

## Data Persistence Strategy

### Volume Type
**Named Volume**: `db-data`

### Lifecycle
- **Created**: `docker-compose up` 첫 실행 시
- **Persisted**: 컨테이너 재시작/삭제 시에도 유지
- **Deleted**: `docker-compose down -v` 명시적 삭제 시만

### Backup Volume Data

```bash
# Volume 백업
docker run --rm -v db-data:/data -v $(pwd):/backup \
  ubuntu tar czf /backup/db-backup.tar.gz /data

# Volume 복원
docker run --rm -v db-data:/data -v $(pwd):/backup \
  ubuntu tar xzf /backup/db-backup.tar.gz -C /
```

---

## Deployment Sequence

### Initial Deployment

```bash
# 1. Docker Compose 파일 확인
cat docker-compose.yml

# 2. 네트워크 및 볼륨 생성 (자동)
docker-compose up -d db

# 3. DB 헬스체크 대기
docker-compose ps  # db (healthy) 확인

# 4. Backend 시작 (Flyway 마이그레이션 자동 실행)
docker-compose up -d backend

# 5. 전체 스택 확인
docker-compose ps
```

### Verification

```bash
# DB 접속 확인
docker exec -it urlshortener-db psql -U admin -d urlshortener

# 테이블 확인
\dt

# 샘플 데이터 확인
SELECT * FROM users;
SELECT * FROM urls;
SELECT * FROM click_logs;
```

---

## Troubleshooting Guide

### Issue 1: DB 컨테이너가 시작되지 않음

**Symptoms**:
```bash
docker-compose ps
# db - Exit 1
```

**Diagnosis**:
```bash
docker-compose logs db
```

**Common Causes**:
- Port 5432 already in use
- Volume permission issues
- Invalid environment variables

**Solutions**:
- Change port mapping: `"5433:5432"`
- Remove volume: `docker-compose down -v`
- Check environment variables

---

### Issue 2: Backend가 DB에 연결하지 못함

**Symptoms**:
```
Connection refused: db:5432
```

**Diagnosis**:
```bash
# DB 헬스체크 확인
docker-compose ps db

# 네트워크 확인
docker network inspect urlshortener-network
```

**Common Causes**:
- DB not healthy yet
- Wrong connection string
- Network issue

**Solutions**:
- Wait for DB healthcheck to pass
- Verify `SPRING_DATASOURCE_URL`
- Check `networks` in docker-compose.yml

---

### Issue 3: Flyway 마이그레이션 실패

**Symptoms**:
```
Flyway migration failed: V1__create_users.sql
```

**Diagnosis**:
```bash
# Backend 로그 확인
docker-compose logs backend | grep Flyway
```

**Common Causes**:
- SQL syntax error
- Table already exists (not idempotent)
- Missing migration file

**Solutions**:
- Fix SQL syntax
- Use `CREATE TABLE IF NOT EXISTS`
- Verify migration files in classpath

---

## Infrastructure Summary

| Component | Technology | Configuration | Purpose |
|---|---|---|---|
| Database | PostgreSQL 15 | Docker container | Data storage |
| Volume | Docker named volume | `db-data` | Data persistence |
| Network | Docker bridge | `urlshortener-network` | Service communication |
| Healthcheck | pg_isready | 10s interval | Readiness check |
| Migration | Flyway | Auto-run on startup | Schema versioning |
| Backup | Manual | `pg_dump` | Data recovery (Future) |
| Monitoring | None | - | Future enhancement |

---

## Acceptance Criteria

- [ ] PostgreSQL 15 컨테이너 시작 성공
- [ ] Healthcheck 통과 (`service_healthy`)
- [ ] Backend가 DB에 연결 성공
- [ ] Flyway 마이그레이션 성공 (V1 → V4)
- [ ] 샘플 데이터 삽입 확인
- [ ] Volume 데이터 영속성 확인 (컨테이너 재시작 후)
- [ ] `docker-compose down -v` 후 재시작 시 마이그레이션 재실행

---

**작성일**: 2026-05-31
**작성자**: AI-DLC (CONSTRUCTION Phase)
**상태**: Infrastructure Design 완료
