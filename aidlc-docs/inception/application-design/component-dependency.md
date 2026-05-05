# Component Dependencies

컴포넌트 간 의존성 관계, 통신 패턴, 데이터 흐름을 정의합니다.

---

## Backend Dependency Matrix

### Controller → Service 의존성

| Controller | Depends On Services |
|---|---|
| UrlController | UrlService, ClickTrackingService |
| AnalyticsController | AnalyticsService |
| AuthController | AuthService |

### Service → Repository 의존성

| Service | Depends On Repositories |
|---|---|
| UrlService | UrlRepository, UserRepository (optional) |
| ClickTrackingService | ClickLogRepository |
| AnalyticsService | ClickLogRepository, UrlRepository |
| AuthService | UserRepository |
| Base62EncodingService | (None) |

### Service → Service 의존성

| Service | Depends On Services |
|---|---|
| UrlService | Base62EncodingService |
| AuthService | JwtTokenProvider |
| (Others) | (None) |

---

## Backend Dependency Graph

```mermaid
graph TD
    UC[UrlController] --> US[UrlService]
    UC --> CTS[ClickTrackingService]
    AC[AnalyticsController] --> AS[AnalyticsService]
    AuthC[AuthController] --> AuthS[AuthService]

    US --> UR[UrlRepository]
    US --> UserR[UserRepository]
    US --> B62[Base62EncodingService]

    CTS --> CLR[ClickLogRepository]

    AS --> CLR
    AS --> UR

    AuthS --> UserR
    AuthS --> JTP[JwtTokenProvider]

    UR --> UrlEntity[(Url Entity)]
    CLR --> CLEntity[(ClickLog Entity)]
    UserR --> UserEntity[(User Entity)]

    style UC fill:#FFE0B2
    style AC fill:#FFE0B2
    style AuthC fill:#FFE0B2

    style US fill:#C5E1A5
    style CTS fill:#C5E1A5
    style AS fill:#C5E1A5
    style AuthS fill:#C5E1A5
    style B62 fill:#C5E1A5

    style UR fill:#B3E5FC
    style CLR fill:#B3E5FC
    style UserR fill:#B3E5FC

    style UrlEntity fill:#E1BEE7
    style CLEntity fill:#E1BEE7
    style UserEntity fill:#E1BEE7
```

---

## Frontend Dependency Matrix

### Pages → Services 의존성

| Page | Depends On Services |
|---|---|
| HomePage | apiService |
| LoginPage | apiService, authService |
| SignupPage | apiService, authService |
| MyUrlsPage | apiService, authService |
| UrlDetailPage | apiService, authService |

### Pages → Components 의존성

| Page | Uses Components |
|---|---|
| HomePage | UrlForm, UrlCard, LoadingSpinner, ErrorMessage |
| LoginPage | LoadingSpinner, ErrorMessage |
| SignupPage | LoadingSpinner, ErrorMessage |
| MyUrlsPage | UrlCard, LoadingSpinner, ErrorMessage |
| UrlDetailPage | DailyClicksChart, CountryDistributionChart, BrowserDistributionChart, LoadingSpinner |

### Pages → Context 의존성

| Page | Uses Context |
|---|---|
| LoginPage | AuthContext (useAuth) |
| SignupPage | AuthContext (useAuth) |
| MyUrlsPage | AuthContext (useAuth) |
| UrlDetailPage | AuthContext (useAuth) |

---

## Frontend Dependency Graph

```mermaid
graph TD
    HP[HomePage] --> UF[UrlForm]
    HP --> UC[UrlCard]
    HP --> API[apiService]

    LP[LoginPage] --> AuthCtx[AuthContext]
    LP --> API
    LP --> AuthSvc[authService]

    SP[SignupPage] --> AuthCtx
    SP --> API
    SP --> AuthSvc

    MU[MyUrlsPage] --> UC
    MU --> API
    MU --> AuthCtx
    MU --> AuthSvc

    UD[UrlDetailPage] --> DCC[DailyClicksChart]
    UD --> CDC[CountryDistributionChart]
    UD --> BDC[BrowserDistributionChart]
    UD --> API
    UD --> AuthCtx
    UD --> AuthSvc

    API --> Axios[Axios]
    AuthSvc --> LocalStorage[LocalStorage]

    style HP fill:#FFECB3
    style LP fill:#FFECB3
    style SP fill:#FFECB3
    style MU fill:#FFECB3
    style UD fill:#FFECB3

    style UF fill:#C8E6C9
    style UC fill:#C8E6C9
    style DCC fill:#C8E6C9
    style CDC fill:#C8E6C9
    style BDC fill:#C8E6C9

    style API fill:#B2EBF2
    style AuthSvc fill:#B2EBF2

    style AuthCtx fill:#D1C4E9
```

---

## Communication Patterns

### 1. REST API Communication (Frontend ↔ Backend)

**Pattern**: HTTP REST API (JSON)

**Endpoints**:

| HTTP Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | /api/urls | URL 생성 | No (익명 OK) |
| GET | /api/urls | 내 URL 목록 | Yes |
| GET | /api/urls/:id | URL 상세 | Yes |
| GET | /:shortCode | 리다이렉트 | No |
| GET | /api/analytics/:urlId/daily | 일별 통계 | Yes |
| GET | /api/analytics/:urlId/countries | 국가별 통계 | Yes |
| GET | /api/analytics/:urlId/browsers | 브라우저별 통계 | Yes |
| POST | /api/auth/signup | 회원 가입 | No |
| POST | /api/auth/login | 로그인 | No |
| POST | /api/auth/refresh | 토큰 갱신 | No (Refresh Token 필요) |

**인증 방식**:
- Authorization 헤더: `Bearer <JWT_ACCESS_TOKEN>`
- Axios Interceptor가 자동으로 헤더 추가

---

### 2. Database Communication (Backend ↔ Database)

**Pattern**: JPA/Hibernate ORM

**Repository → Database 매핑**:

| Repository | Table | Access Pattern |
|---|---|---|
| UrlRepository | urls | JPA findBy, custom JPQL |
| ClickLogRepository | click_logs | JPA save, custom JPQL (aggregation) |
| UserRepository | users | JPA findBy, existsBy |

**쿼리 전략**:
- **Simple Queries**: Spring Data JPA 메서드 이름 기반 (findByShortCode)
- **Complex Queries**: `@Query` + JPQL
- **Aggregation Queries**: `@Query` + Spring Data JPA Projection (DTO 직접 매핑)

---

### 3. Asynchronous Communication (Backend Internal)

**Pattern**: Spring `@Async`

**Async Flow**:
```
UrlController.redirect()
  ↓ (Synchronous)
UrlService.getOriginalUrl()
  ↓ (Return 302 immediately)
  ⚡ (Async - Fire and Forget)
ClickTrackingService.trackClickAsync()
  ↓
ClickLogRepository.save()
```

**Thread Pool**:
- Core Pool Size: 5
- Max Pool Size: 10
- Queue Capacity: 100

---

## Data Flow Diagrams

### 1. URL 생성 플로우

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant DB

    User->>Frontend: URL 입력 + "단축하기"
    Frontend->>Backend: POST /api/urls {originalUrl}
    Backend->>Backend: URL 검증 및 정규화
    Backend->>DB: INSERT INTO urls (original_url)
    DB-->>Backend: ID 반환 (예: 12345)
    Backend->>Backend: Base62 인코딩 (12345 → "dnh")
    Backend->>DB: UPDATE urls SET short_code = "dnh"
    DB-->>Backend: OK
    Backend-->>Frontend: {shortUrl: "https://short.ly/dnh"}
    Frontend-->>User: 단축 URL 표시 + 복사 버튼
```

---

### 2. 리다이렉트 + 클릭 추적 플로우

```mermaid
sequenceDiagram
    participant User
    participant Backend
    participant DB
    participant AsyncWorker

    User->>Backend: GET /dnh
    Backend->>Backend: Base62 디코딩 (dnh → 12345)
    Backend->>DB: SELECT * FROM urls WHERE id = 12345
    DB-->>Backend: {original_url, expires_at}
    Backend->>Backend: 만료일 검증
    Backend-->>User: 302 Redirect to original_url

    par Async Click Tracking
        Backend->>AsyncWorker: trackClickAsync()
        AsyncWorker->>AsyncWorker: Extract IP, User-Agent, Country, Browser
        AsyncWorker->>DB: INSERT INTO click_logs
        DB-->>AsyncWorker: OK
    end
```

---

### 3. 통계 조회 플로우

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant DB

    User->>Frontend: URL 상세 페이지 접근
    Frontend->>Backend: GET /api/analytics/123/daily
    Backend->>DB: SELECT * FROM urls WHERE id = 123
    DB-->>Backend: {user_id: 456}
    Backend->>Backend: 소유권 검증 (user_id == 456?)
    Backend->>DB: SELECT DATE(clicked_at), COUNT(*)<br/>FROM click_logs<br/>WHERE url_id = 123<br/>GROUP BY DATE(clicked_at)
    DB-->>Backend: [{date, count}, ...]
    Backend-->>Frontend: [{date, clickCount}, ...]
    Frontend->>Frontend: Recharts LineChart 렌더링
    Frontend-->>User: 일별 클릭수 차트 표시
```

---

### 4. OAuth2 로그인 플로우

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant OAuth2Provider
    participant DB

    User->>Frontend: "Google로 로그인" 클릭
    Frontend->>Backend: GET /api/auth/oauth2/google
    Backend->>OAuth2Provider: OAuth2 인증 리다이렉트
    OAuth2Provider-->>User: 로그인 화면
    User->>OAuth2Provider: 로그인 + 권한 승인
    OAuth2Provider->>Backend: OAuth2 콜백 + 인증 코드
    Backend->>OAuth2Provider: Access Token 요청
    OAuth2Provider-->>Backend: Access Token + 사용자 정보
    Backend->>DB: SELECT * FROM users<br/>WHERE provider = 'google'<br/>AND provider_id = 'xxx'
    alt 신규 사용자
        DB-->>Backend: 없음
        Backend->>DB: INSERT INTO users (email, provider, provider_id)
    else 기존 사용자
        DB-->>Backend: {id, email}
    end
    Backend->>Backend: JWT 발급
    Backend-->>Frontend: Redirect with JWT
    Frontend->>Frontend: JWT 로컬 스토리지 저장
    Frontend-->>User: 로그인 완료 (홈으로 이동)
```

---

## Circular Dependency Prevention

### 규칙
1. **Controller → Service 단방향**: Controller는 Service를 호출하지만, Service는 Controller를 호출하지 않음
2. **Service → Repository 단방향**: Service는 Repository를 호출하지만, Repository는 Service를 호출하지 않음
3. **Service ↔ Service 순환 방지**: Service 간 의존성은 최소화하며, 순환 의존 금지

### 현재 설계 검증
- ✅ UrlService → Base62EncodingService (단방향)
- ✅ AuthService → JwtTokenProvider (단방향)
- ✅ 모든 Service → Repository (단방향)
- ✅ 순환 의존성 없음

---

## Technology Stack Mapping

### Backend Dependencies

| Component | Technology | Version |
|---|---|---|
| Framework | Spring Boot | 3.x |
| ORM | Spring Data JPA / Hibernate | 6.x |
| Database | PostgreSQL | 15 |
| Security | Spring Security | 6.x |
| OAuth2 | Spring Security OAuth2 Client | 6.x |
| JWT | jjwt (Java JWT) | 0.11.x |
| Password Encoding | BCrypt (Spring Security) | - |
| Geo IP | GeoLite2 (MaxMind) | 2.x |
| Async | Spring @Async | - |
| Validation | Jakarta Validation (Hibernate Validator) | 3.x |
| Database Migration | Flyway | 9.x |

### Frontend Dependencies

| Component | Technology | Version |
|---|---|---|
| Framework | React | 18.x |
| Routing | React Router | 6.x |
| HTTP Client | Axios | 1.x |
| State Management | React Context API + useState | - |
| Server State | React Query | 4.x |
| Charts | Recharts | 2.x |
| Styling | Tailwind CSS | 3.x |
| JWT Decode | jwt-decode | 3.x |

### Infrastructure Dependencies

| Component | Technology | Version |
|---|---|---|
| Containerization | Docker | 24.x |
| Orchestration | Docker Compose | 2.x |
| Database | PostgreSQL Docker Image | 15 |
| Reverse Proxy | Nginx (Frontend) | 1.25 |

---

## Summary

- **Backend Dependencies**: 명확한 3-tier 구조 (Controller → Service → Repository)
- **Frontend Dependencies**: Pages → Services/Components → Context
- **Communication Patterns**: REST API (JSON), JPA ORM, Spring @Async
- **Data Flows**: 4개 주요 플로우 (URL 생성, 리다이렉트, 통계 조회, OAuth2)
- **Circular Dependency**: 없음 (단방향 의존성 유지)
