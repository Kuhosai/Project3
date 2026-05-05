# Application Design

URL 단축 서비스의 전체 애플리케이션 설계 통합 문서입니다.

이 문서는 다음 4개의 상세 설계 문서를 통합한 요약본입니다:
1. [components.md](./components.md) - 컴포넌트 정의 및 책임
2. [component-methods.md](./component-methods.md) - 메서드 시그니처
3. [services.md](./services.md) - 서비스 계층 오케스트레이션
4. [component-dependency.md](./component-dependency.md) - 의존성 및 통신 패턴

---

## 1. Architecture Overview

### 1.1 Architecture Style
**3-tier Architecture** (Controller - Service - Repository)

### 1.2 System Components
- **Backend**: Spring Boot REST API (8080)
- **Frontend**: React SPA (3000 → Nginx 80)
- **Database**: PostgreSQL (5432)
- **Infrastructure**: Docker Compose

---

## 2. Backend Design Summary

### 2.1 Layer Structure

```
┌─────────────────────────────────────────────┐
│          Controller Layer                   │
│  (UrlController, AnalyticsController,       │
│   AuthController)                           │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│          Service Layer                      │
│  (UrlService, ClickTrackingService,         │
│   AnalyticsService, AuthService,            │
│   Base62EncodingService)                    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│          Repository Layer                   │
│  (UrlRepository, ClickLogRepository,        │
│   UserRepository)                           │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│          Domain Layer                       │
│  (Url, ClickLog, User - JPA Entities)      │
└─────────────────────────────────────────────┘
```

### 2.2 Core Components (18개)

#### Controllers (3개)
- `UrlController` - URL 단축 및 리다이렉트 API
- `AnalyticsController` - 통계 조회 API
- `AuthController` - 인증 API

#### Services (5개)
- `UrlService` - URL 단축 비즈니스 로직
- `ClickTrackingService` - 비동기 클릭 추적
- `AnalyticsService` - 통계 집계
- `AuthService` - 인증 및 회원 관리
- `Base62EncodingService` - URL 인코딩

#### Repositories (3개)
- `UrlRepository` - URL 데이터 접근
- `ClickLogRepository` - 클릭 로그 + 통계 쿼리
- `UserRepository` - 사용자 데이터 접근

#### Entities (3개)
- `Url` - URL 도메인 모델
- `ClickLog` - 클릭 로그 도메인 모델
- `User` - 사용자 도메인 모델

#### Security (3개)
- `JwtAuthenticationFilter` - JWT 검증 필터
- `JwtTokenProvider` - JWT 생성/검증
- `OAuth2SuccessHandler` - OAuth2 성공 핸들러

#### DTOs (다수)
- Request DTOs: CreateUrlRequest, SignupRequest, LoginRequest
- Response DTOs: UrlResponse, AuthResponse
- Projection DTOs: DailyClickStatsDto, CountryStatsDto, BrowserStatsDto

---

## 3. Frontend Design Summary

### 3.1 Component Structure

```
┌─────────────────────────────────────────────┐
│          Pages Layer                        │
│  (HomePage, LoginPage, SignupPage,          │
│   MyUrlsPage, UrlDetailPage)                │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────┼─────────┐
         │         │         │
┌────────▼──┐ ┌───▼────┐ ┌──▼─────────┐
│ Common    │ │ Charts │ │ Services   │
│ Components│ │        │ │            │
│ (UrlForm, │ │ (Daily,│ │ (api,      │
│  UrlCard, │ │ Country│ │  auth)     │
│  Header)  │ │ Browser│ │            │
└───────────┘ └────────┘ └────────────┘
                   │
         ┌─────────┴─────────┐
┌────────▼──────┐  ┌─────────▼────────┐
│ AuthContext   │  │ External Libs    │
│ (useAuth)     │  │ (Axios, Recharts)│
└───────────────┘  └──────────────────┘
```

### 3.2 Core Components (20개)

#### Pages (5개)
- `HomePage` - 익명 URL 생성
- `LoginPage` - 로그인
- `SignupPage` - 회원 가입
- `MyUrlsPage` - 내 URL 목록
- `UrlDetailPage` - URL 상세 통계

#### Common Components (5개)
- `Header` - 네비게이션 바
- `UrlForm` - URL 입력 폼
- `UrlCard` - URL 카드
- `LoadingSpinner` - 로딩
- `ErrorMessage` - 에러 메시지

#### Charts (3개)
- `DailyClicksChart` - 일별 클릭수 (LineChart)
- `CountryDistributionChart` - 국가별 분포 (PieChart)
- `BrowserDistributionChart` - 브라우저별 분포 (BarChart)

#### Services (2개)
- `apiService` - Axios HTTP 클라이언트
- `authService` - JWT 토큰 관리

#### Context/Hooks (3개)
- `AuthContext` - 인증 상태 관리
- `useAuth` - AuthContext Hook
- `useApi` - React Query Hook

---

## 4. Database Design

### 4.1 Tables (3개)

#### users
| Column | Type | Constraints |
|---|---|---|
| id | BIGSERIAL | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | NULLABLE (소셜 로그인) |
| provider | VARCHAR(50) | NULLABLE (google, github) |
| provider_id | VARCHAR(255) | NULLABLE |
| created_at | TIMESTAMP | NOT NULL |

#### urls
| Column | Type | Constraints |
|---|---|---|
| id | BIGSERIAL | PK |
| short_code | VARCHAR(20) | UNIQUE |
| original_url | TEXT | NOT NULL |
| user_id | BIGINT | FK → users.id (NULLABLE) |
| created_at | TIMESTAMP | NOT NULL |
| expires_at | TIMESTAMP | NULLABLE |
| active | BOOLEAN | DEFAULT TRUE |

**Indexes**:
- `idx_short_code` ON short_code
- `idx_user_id` ON user_id

#### click_logs
| Column | Type | Constraints |
|---|---|---|
| id | BIGSERIAL | PK |
| url_id | BIGINT | FK → urls.id, NOT NULL |
| ip_address | VARCHAR(45) | NOT NULL |
| user_agent | TEXT | NOT NULL |
| referer | TEXT | NULLABLE |
| country | VARCHAR(2) | NOT NULL |
| browser | VARCHAR(50) | NOT NULL |
| clicked_at | TIMESTAMP | NOT NULL |

**Indexes**:
- `idx_url_id` ON url_id
- `idx_clicked_at` ON clicked_at

### 4.2 Relationships
- `users` 1:N `urls` (사용자는 여러 URL 소유)
- `urls` 1:N `click_logs` (URL은 여러 클릭 로그)

---

## 5. Key Design Decisions

### 5.1 Backend Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Architecture | 3-tier (Controller-Service-Repository) | 학습용으로 적합, 단순하고 명확 |
| DTO Strategy | 별도 DTO 클래스 (엔티티 분리) | 캡슐화 유지, API 안정성 |
| Base62 Encoding | Service 계층에 배치 | 비즈니스 로직의 일부로 취급 |
| Async Tracking | Spring @Async + ThreadPoolTaskExecutor | 간단하고 학습용으로 적합 |
| Security | Spring Security + JWT + OAuth2 Client | 표준 방식, 프레임워크 지원 강함 |
| Statistics Query | Spring Data JPA Projection (DTO 직접 매핑) | 타입 안전, 간단한 집계에 적합 |
| DB Schema | 정규화 (users 1:N urls 1:N click_logs) | 데이터 무결성, 학습용으로 적합 |

### 5.2 Frontend Decisions

| Decision | Choice | Rationale |
|---|---|---|
| State Management | React Context API + useState | 간단한 앱에 적합 |
| Routing | React Router v6 | 표준 라우팅 라이브러리 |
| API Client | Axios + React Query | 중앙 집중식 에러 핸들링 |
| Charts | Recharts | React 친화적, 간단한 API |
| Styling | Tailwind CSS | Utility-first, 빠른 개발 |

---

## 6. Communication Patterns

### 6.1 REST API Endpoints (12개)

**URL Management**:
- `POST /api/urls` - URL 생성
- `GET /api/urls` - 내 URL 목록 (인증 필요)
- `GET /api/urls/:id` - URL 상세 (인증 필요)
- `GET /:shortCode` - 리다이렉트

**Analytics**:
- `GET /api/analytics/:urlId/daily` - 일별 통계 (인증 필요)
- `GET /api/analytics/:urlId/countries` - 국가별 통계 (인증 필요)
- `GET /api/analytics/:urlId/browsers` - 브라우저별 통계 (인증 필요)

**Authentication**:
- `POST /api/auth/signup` - 회원 가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/refresh` - 토큰 갱신
- `GET /api/auth/oauth2/{provider}` - OAuth2 로그인 시작

### 6.2 Authentication Flow
1. 로그인 성공 → JWT Access Token + Refresh Token 발급
2. Frontend → 로컬 스토리지에 저장
3. API 요청 시 → Axios Interceptor가 Authorization 헤더에 JWT 자동 추가
4. Backend → JwtAuthenticationFilter가 JWT 검증 → SecurityContext에 인증 정보 설정

### 6.3 Asynchronous Processing
- **리다이렉트 + 클릭 추적**: 리다이렉트 응답(302)은 즉시 반환, 클릭 추적은 비동기 실행
- **Thread Pool**: Core 5, Max 10, Queue 100

---

## 7. Technology Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Database**: PostgreSQL 15 + Flyway
- **Security**: Spring Security 6.x, JWT (jjwt), OAuth2 Client
- **ORM**: Spring Data JPA / Hibernate 6.x
- **Others**: GeoLite2 (IP → Country), BCrypt (Password)

### Frontend
- **Framework**: React 18.x
- **Routing**: React Router 6.x
- **HTTP**: Axios 1.x + React Query 4.x
- **Charts**: Recharts 2.x
- **Styling**: Tailwind CSS 3.x

### Infrastructure
- **Container**: Docker 24.x + Docker Compose 2.x
- **Services**: db (PostgreSQL 15), backend (Spring Boot), frontend (React + Nginx)

---

## 8. Non-Functional Design

### 8.1 Performance
- **리다이렉트 응답 시간**: 200ms 이하 (목표)
- **비동기 클릭 추적**: 응답 시간에 영향 없음
- **Database Indexes**: short_code, user_id, url_id, clicked_at

### 8.2 Security
- **Password Encryption**: BCrypt
- **JWT**: Access Token (1시간), Refresh Token (7일)
- **OAuth2**: Google, GitHub 소셜 로그인
- **CORS**: 프론트엔드 도메인만 허용

### 8.3 Scalability
- **Async Processing**: Spring @Async + ThreadPoolTaskExecutor
- **Connection Pool**: HikariCP (Spring Boot 기본값)
- **Stateless API**: JWT 기반 인증 (서버 세션 없음)

### 8.4 Observability
- **Logging**: Logback (Spring Boot 기본)
- **Monitoring**: Spring Boot Actuator (선택적)

---

## 9. Data Flow Examples

### 9.1 URL Creation Flow
```
User → Frontend (UrlForm)
  → POST /api/urls {originalUrl}
  → UrlController
  → UrlService
    → validateAndNormalizeUrl()
    → UrlRepository.save() (ID 생성)
    → Base62EncodingService.encode(id)
    → UrlRepository.save() (shortCode 업데이트)
  ← UrlResponse {shortUrl: "https://short.ly/dnh"}
  ← Frontend (UrlCard 표시)
```

### 9.2 Redirect + Click Tracking Flow
```
User → GET /dnh
  → UrlController
  → UrlService.getOriginalUrl("dnh")
    → Base62EncodingService.decode("dnh") → 12345
    → UrlRepository.findById(12345)
    → 만료일 검증
  ← 원본 URL
  → ClickTrackingService.trackClickAsync() [비동기]
  ← 302 Redirect (즉시 반환)

[Async Worker]
  → extractCountryFromIp()
  → extractBrowserFromUserAgent()
  → ClickLogRepository.save()
```

### 9.3 Analytics Flow
```
User → Frontend (UrlDetailPage)
  → GET /api/analytics/123/daily
  → AnalyticsController
  → AnalyticsService
    → UrlRepository.findById(123) (소유권 검증)
    → ClickLogRepository.findDailyStats()
  ← List<DailyClickStatsDto>
  ← Frontend (DailyClicksChart 렌더링)
```

---

## 10. File Structure

### Backend (Spring Boot)
```
src/main/java/com/example/urlshortener/
├── controller/
│   ├── UrlController.java
│   ├── AnalyticsController.java
│   └── AuthController.java
├── service/
│   ├── UrlService.java
│   ├── ClickTrackingService.java
│   ├── AnalyticsService.java
│   ├── AuthService.java
│   └── Base62EncodingService.java
├── repository/
│   ├── UrlRepository.java
│   ├── ClickLogRepository.java
│   └── UserRepository.java
├── domain/
│   ├── Url.java
│   ├── ClickLog.java
│   └── User.java
├── dto/
│   ├── request/
│   │   ├── CreateUrlRequest.java
│   │   ├── SignupRequest.java
│   │   └── LoginRequest.java
│   └── response/
│       ├── UrlResponse.java
│       ├── AuthResponse.java
│       ├── DailyClickStatsDto.java
│       ├── CountryStatsDto.java
│       └── BrowserStatsDto.java
├── security/
│   ├── JwtAuthenticationFilter.java
│   ├── JwtTokenProvider.java
│   └── OAuth2SuccessHandler.java
├── config/
│   ├── SecurityConfig.java
│   ├── AsyncConfig.java
│   └── CorsConfig.java
└── UrlShortenerApplication.java

src/main/resources/
├── application.yml
└── db/migration/
    ├── V1__create_users_table.sql
    ├── V2__create_urls_table.sql
    └── V3__create_click_logs_table.sql
```

### Frontend (React)
```
src/
├── pages/
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── MyUrlsPage.tsx
│   └── UrlDetailPage.tsx
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── UrlForm.tsx
│   │   ├── UrlCard.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorMessage.tsx
│   └── charts/
│       ├── DailyClicksChart.tsx
│       ├── CountryDistributionChart.tsx
│       └── BrowserDistributionChart.tsx
├── services/
│   ├── apiService.ts
│   └── authService.ts
├── context/
│   └── AuthContext.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useApi.ts
├── types/
│   └── api.ts
├── App.tsx
└── main.tsx
```

---

## 11. Next Steps

Application Design이 완료되면 다음 단계로 진행:
1. **Units Generation** - 시스템을 구현 가능한 7개 Unit으로 분해
2. **Functional Design** (per-unit) - 각 Unit의 상세 비즈니스 로직 설계
3. **NFR Design** (per-unit) - JWT, OAuth2, @Async 등 구체적 설계
4. **Infrastructure Design** (per-unit) - Docker Compose 설정
5. **Code Generation** (per-unit) - 실제 코드 생성

---

## Summary

- **Architecture**: 3-tier (Controller - Service - Repository)
- **Backend Components**: 18개 (Controllers 3, Services 5, Repositories 3, Entities 3, Security 3, DTOs 다수)
- **Frontend Components**: 20개 (Pages 5, Common 5, Charts 3, Services 2, Context/Hooks 3)
- **Database**: 3 tables (users, urls, click_logs)
- **API Endpoints**: 12개 REST endpoints
- **Technology Stack**: Spring Boot + React + PostgreSQL + Docker
- **Design Patterns**: DTO 분리, JWT 인증, OAuth2, @Async, JPA Projection
