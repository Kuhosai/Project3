# Code Generation Summary - Unit U-001 (Backend Core)

## Purpose
이 문서는 Unit U-001 (Backend Core)의 코드 생성 결과를 요약합니다.

---

## Generated Files

### 1. Entity Classes
**Location**: `backend/src/main/java/com/urlshortener/entity/`

| File | Purpose | Key Features |
|---|---|---|
| `Url.java` | URL 단축 엔티티 | 7 attributes, 2 relationships, business logic methods |
| `ClickLog.java` | 클릭 로그 엔티티 (immutable) | 10 attributes, 1 relationship, query helper methods |
| `User.java` | 사용자 엔티티 (placeholder) | Basic structure for Unit U-003 |

**Url.java Key Methods**:
```java
public boolean isExpired()       // Check if URL has expired
public boolean isAccessible()    // Check if URL is active and not expired
public void deactivate()         // Soft delete URL
```

**ClickLog.java Key Methods**:
```java
public boolean isMobile()        // Check if device is mobile
public boolean isFromKorea()     // Check if country is Korea
```

---

### 2. Repository Interfaces
**Location**: `backend/src/main/java/com/urlshortener/repository/`

| File | Purpose | Key Queries |
|---|---|---|
| `UrlRepository.java` | URL CRUD operations | `findByShortCode()`, `existsByShortCode()` |
| `ClickLogRepository.java` | ClickLog CRUD operations | Basic JpaRepository methods (analytics in U-002) |
| `UserRepository.java` | User CRUD operations (placeholder) | `findByEmail()` for Unit U-003 |

**Note**: All repositories extend `JpaRepository<T, Long>` for automatic CRUD support.

---

### 3. Service Classes
**Location**: `backend/src/main/java/com/urlshortener/service/`

| File | Purpose | Key Methods |
|---|---|---|
| `Base62EncodingService.java` | Base62 encoding/decoding | `encode(Long id)`, `decode(String shortCode)` |
| `UrlService.java` | URL management business logic | `createShortUrl()`, `redirectToOriginalUrl()`, `getUrlInfo()`, `deactivateUrl()` |
| `ClickTrackingService.java` | Async click tracking | `trackClick()` (async), GeoIP extraction, User-Agent parsing |

**Base62EncodingService**:
- Character set: `0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`
- Converts database ID to short code (e.g., `123` → `B9`)
- Converts short code back to database ID (e.g., `B9` → `123`)

**UrlService**:
- URL normalization: Adds `http://` if protocol missing
- URL validation: Regex pattern matching
- Expiration validation: Future date check
- Transaction management with `@Transactional`

**ClickTrackingService**:
- **Async processing**: Uses `@Async` annotation for non-blocking execution
- **GeoIP extraction**: MaxMind GeoIP2 API with GeoLite2-City.mmdb
- **User-Agent parsing**: UserAgentUtils library for browser/OS/device detection
- **IP extraction**: Handles `X-Forwarded-For` header for proxy scenarios
- **Error resilience**: Logs errors without throwing exceptions

---

### 4. Controller Classes
**Location**: `backend/src/main/java/com/urlshortener/controller/`

| File | Purpose | Endpoints |
|---|---|---|
| `UrlController.java` | REST API for URL operations | 4 endpoints (POST, GET, GET, DELETE) |

**REST API Endpoints**:

| Method | Endpoint | Purpose | Status Code |
|---|---|---|---|
| POST | `/api/urls` | Create shortened URL | 201 CREATED |
| GET | `/{shortCode}` | Redirect to original URL | 302 FOUND |
| GET | `/api/urls/{shortCode}` | Get URL info | 200 OK |
| DELETE | `/api/urls/{shortCode}` | Deactivate URL | 204 NO CONTENT |

**Validation**:
- Uses `@Valid` annotation for request body validation
- Jakarta Bean Validation (`@NotBlank`, `@Size`, `@Future`)

---

### 5. DTO Classes
**Location**: `backend/src/main/java/com/urlshortener/dto/`

| File | Purpose | Key Fields |
|---|---|---|
| `UrlCreateRequest.java` | URL creation request DTO | `originalUrl`, `expiresAt` |
| `UrlResponse.java` | URL response DTO | `shortCode`, `originalUrl`, `shortUrl`, `createdAt`, `expiresAt`, `isActive` |
| `ErrorResponse.java` | Error response DTO | `status`, `message`, `timestamp` |

**UrlCreateRequest Validation**:
- `originalUrl`: `@NotBlank`, `@Size(max = 2048)`
- `expiresAt`: `@Future` (optional)

**UrlResponse Factory Method**:
```java
public static UrlResponse from(Url url) {
    return UrlResponse.builder()
        .shortCode(url.getShortCode())
        .originalUrl(url.getOriginalUrl())
        .shortUrl("http://localhost:8080/" + url.getShortCode())
        .createdAt(url.getCreatedAt())
        .expiresAt(url.getExpiresAt())
        .isActive(url.getIsActive())
        .build();
}
```

---

### 6. Exception Classes
**Location**: `backend/src/main/java/com/urlshortener/exception/`

| File | Purpose | HTTP Status |
|---|---|---|
| `UrlNotFoundException.java` | URL not found by short code | 404 NOT FOUND |
| `UrlInactiveException.java` | URL is inactive (soft deleted) | 410 GONE |
| `UrlExpiredException.java` | URL has expired | 410 GONE |
| `InvalidUrlException.java` | Invalid URL format or validation failure | 400 BAD REQUEST |

**All exceptions extend `RuntimeException`** for unchecked exception handling.

---

### 7. Configuration Classes
**Location**: `backend/src/main/java/com/urlshortener/config/`

| File | Purpose | Key Configuration |
|---|---|---|
| `AsyncConfig.java` | Async thread pool configuration | 5 core, 10 max threads, 100 queue capacity |
| `GlobalExceptionHandler.java` | Global exception handling | `@RestControllerAdvice` for centralized error handling |

**AsyncConfig**:
- Thread pool name: `async-click-tracking-`
- Enables async processing with `@EnableAsync`
- Bean name: `taskExecutor`

**GlobalExceptionHandler**:
- Handles `UrlNotFoundException` → 404 NOT FOUND
- Handles `UrlInactiveException` → 410 GONE
- Handles `UrlExpiredException` → 410 GONE
- Handles `InvalidUrlException` → 400 BAD REQUEST
- Handles `MethodArgumentNotValidException` → 400 BAD REQUEST with field errors
- Handles generic `Exception` → 500 INTERNAL SERVER ERROR
- Logs all exceptions with appropriate log levels

---

### 8. Main Application Class
**Location**: `backend/src/main/java/com/urlshortener/`

| File | Purpose |
|---|---|
| `UrlShortenerApplication.java` | Spring Boot main entry point |

**Configuration**:
- `@SpringBootApplication` annotation enables auto-configuration, component scanning, and configuration properties

---

### 9. Maven Dependencies
**Location**: `backend/pom.xml`

**Added Dependencies for Unit U-001**:

```xml
<!-- Unit U-001: GeoIP2 for geolocation -->
<dependency>
    <groupId>com.maxmind.geoip2</groupId>
    <artifactId>geoip2</artifactId>
    <version>4.0.0</version>
</dependency>

<!-- Unit U-001: UserAgentUtils for browser/OS/device detection -->
<dependency>
    <groupId>eu.bitwalker</groupId>
    <artifactId>UserAgentUtils</artifactId>
    <version>1.21</version>
</dependency>
```

**Existing Dependencies**:
- Spring Boot 3.2.0
- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- PostgreSQL Driver
- Flyway Core + PostgreSQL Support
- Spring Boot Starter Validation
- Lombok
- Spring Boot DevTools (runtime)
- Spring Boot Starter Test (test scope)

---

### 10. Application Configuration
**Location**: `backend/src/main/resources/application.yml`

**Added Configuration for Unit U-001**:

```yaml
# Unit U-001: GeoIP database path
geoip:
  database:
    path: ${GEOIP_DATABASE_PATH:/app/geoip/GeoLite2-City.mmdb}
```

**Existing Configuration**:
- DataSource: PostgreSQL connection with HikariCP pooling
- Flyway: Migration enabled with baseline-on-migrate
- JPA/Hibernate: PostgreSQL dialect, validate ddl-auto
- Logging: DEBUG level for `com.urlshortener`, Hibernate SQL
- Server: Port 8080, error details included

---

### 11. Dockerfile
**Location**: `backend/Dockerfile`

**Content**:
```dockerfile
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the JAR file from target directory
COPY target/*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Base Image**: `eclipse-temurin:17-jre-alpine` (lightweight JRE 17)

---

## Architecture Overview

### Service Layer Architecture

```
UrlController (REST API)
  ↓
UrlService (Business Logic)
  ↓                    ↓
Base62EncodingService  ClickTrackingService (Async)
  ↓                    ↓
UrlRepository          ClickLogRepository
  ↓                    ↓
PostgreSQL Database
```

### Request Flow: Create Short URL

1. **Client** → POST `/api/urls` with `UrlCreateRequest`
2. **UrlController** → Validates request with `@Valid`
3. **UrlService** → Normalizes URL, validates format, creates `Url` entity
4. **UrlRepository** → Saves entity to database (generates ID)
5. **Base62EncodingService** → Encodes ID to short code
6. **UrlRepository** → Updates entity with short code
7. **UrlService** → Returns `UrlResponse`
8. **UrlController** → Returns 201 CREATED

### Request Flow: Redirect

1. **Client** → GET `/{shortCode}`
2. **UrlController** → Calls `UrlService.redirectToOriginalUrl()`
3. **UrlService** → Finds URL by short code, validates active/expired
4. **ClickTrackingService** → **Async** tracks click (non-blocking)
5. **UrlService** → Returns original URL
6. **UrlController** → Returns 302 FOUND redirect

### Async Click Tracking Flow

1. **ClickTrackingService.trackClick()** → `@Async` annotation (non-blocking)
2. **Thread Pool** → Executes on `taskExecutor` thread pool (5 core, 10 max)
3. **IP Extraction** → Handles `X-Forwarded-For` header
4. **GeoIP Lookup** → MaxMind GeoIP2 API (country code)
5. **User-Agent Parsing** → UserAgentUtils (browser, OS, device type)
6. **ClickLogRepository** → Saves `ClickLog` entity to database
7. **Error Handling** → Logs errors without throwing exceptions

---

## Business Rules Implemented

### URL Validation (BR-001 to BR-005)
- **BR-001**: Protocol validation (`http://` or `https://`)
- **BR-002**: Auto-correction (adds `http://` if missing)
- **BR-003**: URL length limit (2048 characters via `@Size`)
- **BR-004**: Regex pattern validation
- **BR-005**: Transaction rollback on validation failure

### URL Shortening (BR-006 to BR-010)
- **BR-006**: Base62 encoding (custom implementation)
- **BR-007**: Short code uniqueness (database auto-increment ID ensures uniqueness)
- **BR-008**: Anonymous URL support (user_id can be null)
- **BR-009**: Expiration date validation (`@Future` annotation)
- **BR-010**: Default is_active = true

### URL Redirect (BR-011 to BR-015)
- **BR-011**: Short code resolution via `findByShortCode()`
- **BR-012**: Active check (`isActive == true`)
- **BR-013**: Expiration check (`expiresAt == null || now < expiresAt`)
- **BR-014**: Performance target P95 < 200ms (async click tracking helps)
- **BR-015**: HTTP 302 redirect (`ResponseEntity.status(HttpStatus.FOUND)`)

### Click Tracking (BR-016 to BR-020)
- **BR-016**: Async processing (`@Async` annotation)
- **BR-017**: IP extraction (handles `X-Forwarded-For`)
- **BR-018**: GeoIP country code extraction (MaxMind GeoIP2)
- **BR-019**: User-Agent parsing (browser, OS, device type)
- **BR-020**: ClickLog immutability (no setter methods, `@NoArgsConstructor(access = PROTECTED)`)

### Data Integrity (BR-021 to BR-025)
- **BR-021**: Transaction management (`@Transactional`)
- **BR-022**: Cascade delete (JPA `cascade = CascadeType.ALL`)
- **BR-023**: Soft delete via `deactivate()` method
- **BR-024**: HikariCP connection pooling (10 max, 5 min idle)
- **BR-025**: Flyway schema validation (ddl-auto: validate)

---

## NFR Requirements Compliance

### Performance (NFR-1 to NFR-5)
- **NFR-1**: Redirect P95 < 200ms → **Async click tracking** ensures redirect is not blocked
- **NFR-2**: URL creation P95 < 500ms → **Simple Base62 encoding** with single database roundtrip
- **NFR-3**: Database query optimization → **Indexed short_code** (unique constraint creates index)
- **NFR-4**: Async click tracking → **@Async** with dedicated thread pool
- **NFR-5**: Connection pooling → **HikariCP** with 10 max connections

### Scalability (NFR-6 to NFR-10)
- **NFR-6**: Horizontal scalability → **Stateless architecture** (no session state)
- **NFR-7**: Database scalability → **PostgreSQL with indexes** on short_code, user_id, url_id
- **NFR-8**: Base62 encoding → **No hash collisions** (uses auto-increment ID)
- **NFR-9**: Thread pool sizing → **5 core, 10 max threads, 100 queue capacity**
- **NFR-10**: Async task queue → **ThreadPoolTaskExecutor** with bounded queue

### Availability (NFR-11 to NFR-15)
- **NFR-11**: Error resilience → **Try-catch in async click tracking** (logs errors without throwing)
- **NFR-12**: GeoIP fallback → **Returns "unknown" if GeoIP lookup fails**
- **NFR-13**: Database connection retry → **HikariCP automatic retry** with connection timeout
- **NFR-14**: Health check → **Spring Boot Actuator** (to be added in Build and Test stage)
- **NFR-15**: Graceful degradation → **Async click tracking failures don't affect redirects**

### Security (NFR-16 to NFR-20)
- **NFR-16**: Input validation → **@Valid, @NotBlank, @Size, @Future** annotations
- **NFR-17**: SQL injection prevention → **JPA parameterized queries** (no raw SQL)
- **NFR-18**: XSS prevention → **No HTML rendering** in API responses (JSON only)
- **NFR-19**: HTTPS enforcement → **To be configured in reverse proxy** (Nginx/Load Balancer)
- **NFR-20**: Error message sanitization → **Generic error messages** in GlobalExceptionHandler

### Reliability (NFR-21 to NFR-25)
- **NFR-21**: Transaction rollback → **@Transactional** on service methods
- **NFR-22**: Data consistency → **JPA cascade operations** ensure referential integrity
- **NFR-23**: Idempotency → **Deactivate URL** is idempotent (multiple calls have same effect)
- **NFR-24**: Duplicate short code prevention → **Unique constraint** on short_code column
- **NFR-25**: Database constraints → **CHECK constraints** on device_type, provider

### Maintainability (NFR-26 to NFR-30)
- **NFR-26**: Code structure → **Clear separation** of controller/service/repository layers
- **NFR-27**: Unit test coverage → **To be implemented in Build and Test stage** (target > 80%)
- **NFR-28**: Logging → **SLF4J with Logback**, DEBUG level for application, INFO for dependencies
- **NFR-29**: Exception handling → **Centralized GlobalExceptionHandler** with appropriate HTTP status codes
- **NFR-30**: Code documentation → **Javadoc comments** on all public methods

### Usability (NFR-31 to NFR-35)
- **NFR-31**: REST API design → **RESTful endpoints** with standard HTTP methods (POST, GET, DELETE)
- **NFR-32**: Error messages → **User-friendly error messages** with field-level validation details
- **NFR-33**: HTTP status codes → **Appropriate status codes** (201, 302, 404, 410, 400, 500)
- **NFR-34**: Response format → **Consistent JSON format** with DTO classes
- **NFR-35**: API documentation → **To be added in Unit U-006** (Swagger/OpenAPI)

---

## Technology Stack Decisions

### Decision 1: Custom Base62 Implementation
**Rationale**: No external library needed, simple algorithm, full control over character set
**Implementation**: [Base62EncodingService.java](backend/src/main/java/com/urlshortener/service/Base62EncodingService.java:17)

### Decision 2: MaxMind GeoIP2 Java API
**Rationale**: Industry-standard, free GeoLite2 database, high accuracy
**Implementation**: [ClickTrackingService.java](backend/src/main/java/com/urlshortener/service/ClickTrackingService.java:31)
**Database**: GeoLite2-City.mmdb (mounted at `/app/geoip/GeoLite2-City.mmdb`)

### Decision 3: UserAgentUtils 1.21
**Rationale**: Lightweight, no external service calls, supports browser/OS/device detection
**Implementation**: [ClickTrackingService.java](backend/src/main/java/com/urlshortener/service/ClickTrackingService.java:52)

### Decision 4: Spring @Async + ThreadPoolTaskExecutor
**Rationale**: Native Spring support, easy configuration, bounded thread pool
**Implementation**: [AsyncConfig.java](backend/src/main/java/com/urlshortener/config/AsyncConfig.java:17)
**Configuration**: 5 core, 10 max threads, 100 queue capacity

### Decision 5: @RestControllerAdvice for Exception Handling
**Rationale**: Centralized error handling, consistent error format, DRY principle
**Implementation**: [GlobalExceptionHandler.java](backend/src/main/java/com/urlshortener/config/GlobalExceptionHandler.java:21)

### Decision 6: Jakarta Bean Validation
**Rationale**: Declarative validation, Spring integration, standard annotations
**Implementation**: [UrlCreateRequest.java](backend/src/main/java/com/urlshortener/dto/request/UrlCreateRequest.java:13)

---

## File Structure

```
project3/
├── backend/
│   ├── src/main/
│   │   ├── java/com/urlshortener/
│   │   │   ├── UrlShortenerApplication.java  ✅ Created
│   │   │   ├── entity/
│   │   │   │   ├── Url.java  ✅ Created
│   │   │   │   ├── ClickLog.java  ✅ Created
│   │   │   │   └── User.java  ✅ Created (placeholder)
│   │   │   ├── repository/
│   │   │   │   ├── UrlRepository.java  ✅ Created
│   │   │   │   ├── ClickLogRepository.java  ✅ Created
│   │   │   │   └── UserRepository.java  ✅ Created
│   │   │   ├── service/
│   │   │   │   ├── Base62EncodingService.java  ✅ Created
│   │   │   │   ├── UrlService.java  ✅ Created
│   │   │   │   └── ClickTrackingService.java  ✅ Created
│   │   │   ├── controller/
│   │   │   │   └── UrlController.java  ✅ Created
│   │   │   ├── dto/
│   │   │   │   ├── request/
│   │   │   │   │   └── UrlCreateRequest.java  ✅ Created
│   │   │   │   └── response/
│   │   │   │       ├── UrlResponse.java  ✅ Created
│   │   │   │       └── ErrorResponse.java  ✅ Created
│   │   │   ├── exception/
│   │   │   │   ├── UrlNotFoundException.java  ✅ Created
│   │   │   │   ├── UrlInactiveException.java  ✅ Created
│   │   │   │   ├── UrlExpiredException.java  ✅ Created
│   │   │   │   └── InvalidUrlException.java  ✅ Created
│   │   │   └── config/
│   │   │       ├── AsyncConfig.java  ✅ Created
│   │   │       └── GlobalExceptionHandler.java  ✅ Created
│   │   └── resources/
│   │       ├── application.yml  ✅ Updated (GeoIP path)
│   │       └── db/migration/
│   │           └── (migrations from Unit U-005)
│   ├── pom.xml  ✅ Updated (GeoIP2, UserAgentUtils)
│   └── Dockerfile  ✅ Created
├── docker-compose.yml  (from Unit U-005)
├── .env.example  (from Unit U-005, already has GEOIP_DATABASE_PATH)
└── aidlc-docs/
    └── construction/
        └── u-001-backend-core/
            ├── functional-design/
            ├── nfr-requirements/
            ├── nfr-design/
            ├── infrastructure-design/
            └── code/
                └── code-generation-summary.md  ✅ This file
```

---

## Next Steps

### 1. Download GeoIP Database
**File**: `GeoLite2-City.mmdb`
**Location**: `geoip/GeoLite2-City.mmdb` (workspace root)
**Download URL**: https://dev.maxmind.com/geoip/geolite2-free-geolocation-data

**Steps**:
1. Create account on MaxMind
2. Download GeoLite2-City.mmdb
3. Place in `project3/geoip/` directory
4. Ensure `.gitignore` excludes `*.mmdb` files

### 2. Build Backend JAR
```bash
cd backend
mvn clean package -DskipTests
```

**Result**: `backend/target/url-shortener-0.0.1-SNAPSHOT.jar`

### 3. Build Docker Image
```bash
docker-compose build backend
```

### 4. Start All Services
```bash
docker-compose up -d
```

**Service Startup Order**:
1. `db` service (PostgreSQL 15)
2. `backend` service (waits for db healthcheck)
3. Flyway migrations run automatically
4. Spring Boot application starts

### 5. Verify Service Health
```bash
# Check all services
docker-compose ps

# Check backend logs
docker-compose logs -f backend

# Test URL creation
curl -X POST http://localhost:8080/api/urls \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://example.com"}'

# Test redirect (replace {shortCode} with actual short code)
curl -I http://localhost:8080/{shortCode}

# Test URL info
curl http://localhost:8080/api/urls/{shortCode}
```

### 6. Unit Testing
**To be implemented in Build and Test stage**:
- Base62EncodingService unit tests
- UrlService unit tests (with mocked repositories)
- ClickTrackingService unit tests (with mocked GeoIP)
- UrlController integration tests (with MockMvc)

**Target Coverage**: > 80%

### 7. Proceed to Unit U-002 (Backend Analytics)
**Next Unit**: Unit U-002 (Backend Analytics)
**Stages**:
- Functional Design
- NFR Requirements
- NFR Design (if needed)
- Infrastructure Design (if needed)
- Code Generation

**Deliverables**:
- Analytics service
- DTO classes for analytics
- REST endpoints for analytics
- Unit tests

---

## Completion Checklist

- [x] Entity classes created (Url, ClickLog, User placeholder)
- [x] Repository interfaces created (UrlRepository, ClickLogRepository, UserRepository)
- [x] Service classes created (Base62EncodingService, UrlService, ClickTrackingService)
- [x] Controller created (UrlController with 4 endpoints)
- [x] DTO classes created (UrlCreateRequest, UrlResponse, ErrorResponse)
- [x] Exception classes created (4 custom exceptions)
- [x] Configuration classes created (AsyncConfig, GlobalExceptionHandler)
- [x] Main application class created (UrlShortenerApplication)
- [x] Maven dependencies updated (GeoIP2, UserAgentUtils)
- [x] Application.yml updated (GeoIP database path)
- [x] Dockerfile created (eclipse-temurin:17-jre-alpine)
- [x] Code generation summary documented

---

**작성일**: 2026-05-31
**작성자**: AI-DLC (CONSTRUCTION Phase - Code Generation)
**상태**: Code Generation Complete
