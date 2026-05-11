# URL 단축 서비스 프로젝트 진행 상황

## 📌 프로젝트 개요

**프로젝트명**: URL 단축 서비스 (URL Shortener)
**프로젝트 유형**: Greenfield (신규 프로젝트)
**목적**: 학습용 토이 프로젝트
**예상 기간**: 2주 (15일)
**시작일**: 2026-04-14
**현재 상태**: ✅ INCEPTION 단계 완료, CONSTRUCTION 단계 진입 대기

---

## 🎯 핵심 기능

### 1. URL 단축 기능
- 익명 사용자도 URL 생성 가능
- 회원 가입 후 만료일 설정 가능
- Base62 인코딩 방식 사용

### 2. URL 리다이렉트
- HTTP 302 리다이렉트
- 200ms 이내 응답 시간 목표
- 만료된 URL 에러 처리

### 3. 클릭 추적
- 비동기 처리 (Spring @Async)
- IP, User-Agent, 국가, 브라우저 정보 수집
- GeoLite2로 국가 추출

### 4. 통계 대시보드
- 내 URL 목록 조회
- 일별 클릭수 차트 (Recharts LineChart)
- 국가별 클릭 분포 (Recharts PieChart)
- 브라우저별 클릭 분포 (Recharts BarChart)

### 5. 회원 기능
- 이메일 회원 가입 (BCrypt 암호화)
- 이메일 로그인 (JWT)
- 소셜 로그인 (Google, GitHub OAuth2)

### 6. API 문서화
- Swagger UI 제공 (`/swagger-ui`)

---

## 🏗️ 기술 스택

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java
- **Database**: PostgreSQL 15
- **ORM**: Spring Data JPA / Hibernate 6.x
- **Security**: Spring Security 6.x + JWT + OAuth2
- **Password**: BCrypt
- **Migration**: Flyway 9.x
- **Async**: Spring @Async
- **API Docs**: Swagger/OpenAPI 3.0
- **Geo IP**: GeoLite2 (MaxMind)

### Frontend
- **Framework**: React 18.x
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) v5+ with **Material Design 3**
- **Styling**: `@mui/material`, `@emotion/react`, `@emotion/styled`
- **Routing**: React Router 6.x
- **State**: Context API + useState
- **Server State**: React Query 4.x
- **HTTP**: Axios 1.x
- **Charts**: Recharts 2.x
- **JWT**: jwt-decode 3.x

### Infrastructure
- **Container**: Docker 24.x
- **Orchestration**: Docker Compose 2.x
- **Reverse Proxy**: Nginx 1.25

---

## 🎨 Material Design 3 통합

### MUI Theme 구성
```typescript
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6750A4' }, // M3 Primary
    secondary: { main: '#625B71' }, // M3 Secondary
    background: {
      default: '#FFFBFE', // M3 Surface
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  shape: {
    borderRadius: 12, // M3 rounded corners
  },
});
```

### MUI 컴포넌트 활용
- **TextField** (Filled Text Field)
- **Button** (Elevated Button, Filled Tonal Button)
- **Card** (M3 Card)
- **Chip** (Filled Tonal Chip)
- **AppBar** (Top App Bar)
- **Drawer** (Navigation Drawer)
- **CircularProgress** (M3 Progress Indicator)
- **Alert** (M3 Snackbar/Alert)

---

## 📊 User Stories (13개)

### Must Have (11개)
1. **US-001**: 익명 URL 생성
2. **US-002**: 등록 사용자 URL 생성
3. **US-003**: 단축 URL 리다이렉트
4. **US-004**: 클릭 정보 자동 수집
5. **US-005**: 내 URL 목록 조회
6. **US-006**: 일별 클릭수 차트
7. **US-007**: 국가별 클릭 분포 차트
8. **US-008**: 브라우저별 클릭 분포 차트
9. **US-009**: 이메일 회원 가입
10. **US-010**: 이메일 로그인
11. **US-011**: 소셜 로그인 (Google)

### Should Have (2개)
12. **US-012**: 소셜 로그인 (GitHub)
13. **US-013**: Swagger API 문서

---

## 📦 Units of Work (6개)

### U-001: Backend Core
**책임**: URL 단축 생성, 리다이렉트, 클릭 추적
**컴포넌트**:
- UrlController
- UrlService, ClickTrackingService, Base62EncodingService
- UrlRepository, ClickLogRepository
- Url, ClickLog 엔티티

**User Stories**: US-001, US-002, US-003, US-004

---

### U-002: Backend Analytics
**책임**: 클릭 통계 집계 및 조회
**컴포넌트**:
- AnalyticsController
- AnalyticsService
- ClickLogRepository (통계 쿼리)

**User Stories**: US-005, US-006, US-007, US-008

---

### U-003: Backend Auth
**책임**: 사용자 인증 및 인가 (JWT + OAuth2)
**컴포넌트**:
- AuthController
- AuthService
- UserRepository
- JwtTokenProvider, JwtAuthenticationFilter, OAuth2SuccessHandler

**User Stories**: US-009, US-010, US-011, US-012

---

### U-004: Frontend UI
**책임**: React 기반 사용자 인터페이스 (Material Design 3)
**컴포넌트**:
- Pages: HomePage, LoginPage, SignupPage, MyUrlsPage, UrlDetailPage
- Components: UrlForm, UrlCard, Charts (MUI 기반)
- Services: apiService (Axios), authService (JWT)
- Theme: MUI Theme Configuration

**Material Design 3 통합**:
- MUI v5+ 컴포넌트 사용
- Theme로 색상, 타이포그래피 통일
- Roboto 폰트 적용
- Material Icons 사용

**User Stories**: 모든 UI 관련 스토리 (12개)

---

### U-005: Database Schema
**책임**: PostgreSQL 데이터베이스 스키마 정의
**테이블**: `users`, `urls`, `click_logs`
**Flyway 마이그레이션**:
- V1__create_users.sql
- V2__create_urls.sql
- V3__create_click_logs.sql

**User Stories**: 모든 스토리의 데이터 저장소 (13개)

---

### U-006: Infrastructure
**책임**: Docker Compose 멀티 컨테이너 오케스트레이션
**서비스**:
- db: PostgreSQL 15
- backend: Spring Boot 3.x
- frontend: React 18.x + Nginx

**User Stories**: US-013 (Swagger UI 배포)

---

## 🗄️ 데이터베이스 스키마

### users 테이블
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL for OAuth2 users
    provider VARCHAR(50), -- 'local', 'google', 'github'
    provider_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### urls 테이블
```sql
CREATE TABLE urls (
    id BIGSERIAL PRIMARY KEY,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    user_id BIGINT, -- NULL for anonymous
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- NULL for permanent
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### click_logs 테이블
```sql
CREATE TABLE click_logs (
    id BIGSERIAL PRIMARY KEY,
    url_id BIGINT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referer TEXT,
    country_code VARCHAR(2),
    browser VARCHAR(50),
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE
);
```

---

## 📅 개발 순서 (Sequential)

### Phase 1: Database Foundation (1일)
- **Unit U-005**: Database Schema
- Flyway 마이그레이션 스크립트 작성
- PostgreSQL 컨테이너 실행

### Phase 2: Backend Core (3일)
- **Unit U-001**: Backend Core
- URL 단축, 리다이렉트, 클릭 추적 구현

### Phase 3: Backend Analytics (2일)
- **Unit U-002**: Backend Analytics
- 통계 집계 쿼리 구현

### Phase 4: Backend Auth (3일)
- **Unit U-003**: Backend Auth
- JWT 인증, OAuth2 소셜 로그인 구현

### Phase 5: Frontend UI (4일)
- **Unit U-004**: Frontend UI
- Material Design 3 (MUI) 적용
- React 페이지 및 컴포넌트 구현

### Phase 6: Infrastructure Integration (2일)
- **Unit U-006**: Infrastructure
- Docker Compose 통합
- E2E 테스트

**총 기간**: 15일 (약 2주)

---

## 🔗 REST API 엔드포인트

### URL Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/urls` | URL 생성 | No (익명 OK) |
| GET | `/api/urls` | 내 URL 목록 | Yes |
| GET | `/api/urls/:id` | URL 상세 | Yes |
| GET | `/:shortCode` | 리다이렉트 | No |

### Analytics
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/:urlId/daily` | 일별 클릭수 통계 | Yes |
| GET | `/api/analytics/:urlId/countries` | 국가별 통계 | Yes |
| GET | `/api/analytics/:urlId/browsers` | 브라우저별 통계 | Yes |

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | 회원 가입 | No |
| POST | `/api/auth/login` | 로그인 | No |
| POST | `/api/auth/refresh` | 토큰 갱신 | No (Refresh Token 필요) |
| GET | `/api/auth/oauth2/google` | Google OAuth2 | No |
| GET | `/api/auth/oauth2/github` | GitHub OAuth2 | No |

---

## 🏛️ 아키텍처

### 시스템 구조
- **Architecture Pattern**: Monolith (3-tier)
  - Controller Layer
  - Service Layer
  - Repository Layer

### 프론트엔드 구조
- **Single Page Application (SPA)**
- **Material Design 3 (M3) 디자인 시스템**
- **MUI Theme 기반 통일된 UI/UX**

### 데이터베이스 구조
- **Normalization**: 3NF (Third Normal Form)
- **Tables**: `users`, `urls`, `click_logs`
- **Migration**: Flyway 버전 관리

---

## 🔒 주요 설계 결정

### 1. Monolith vs Microservices
**결정**: Monolith (단일 Spring Boot 앱)
**이유**: 학습용 프로젝트로 복잡도를 낮추고, 빠른 개발 가능

### 2. Material Design 3 적용
**결정**: MUI (Material-UI) v5+ 라이브러리 사용
**이유**:
- M3 컴포넌트 제공
- 디자인 시스템 통일화 용이
- MUI Theme로 색상, 타이포그래피 일관성 유지

### 3. 인증 방식
**결정**: JWT + OAuth2
**이유**:
- Stateless 인증 (서버 부하 감소)
- 소셜 로그인 지원 (사용자 편의성)

### 4. 클릭 추적 처리
**결정**: Spring @Async 비동기 처리
**이유**:
- 리다이렉트 응답 시간에 영향 없음
- 200ms 이내 응답 시간 보장

### 5. URL 인코딩
**결정**: Base62 인코딩
**이유**:
- URL-safe 문자만 사용 (a-z, A-Z, 0-9)
- 짧은 코드 생성 가능

### 6. 데이터베이스 스키마
**결정**: 3NF 정규화
**이유**:
- 중복 제거
- 데이터 일관성 보장

---

## 📊 비기능 요구사항 (NFR)

### 성능
- **리다이렉트 응답 시간**: 200ms 이내
- **비동기 클릭 추적**: 응답 시간에 영향 없음
- **인덱스 최적화**: 자주 조회되는 컬럼에 인덱스 추가

### 보안
- **JWT Secret**: 환경 변수로 관리 (하드코딩 금지)
- **비밀번호 암호화**: BCrypt 사용
- **SQL Injection 방지**: JPA Parameterized Query 사용
- **CORS 설정**: 명시적 Origin 허용

### 확장성
- **캐싱 준비**: Spring Cache 적용 가능 (향후 확장)
- **Thread Pool**: 비동기 처리용 ThreadPoolTaskExecutor 설정

### 가용성
- **Database Persistence**: Docker Volume으로 데이터 영속성 보장

---

## 🧪 테스트 전략

### Backend
- **Unit Test**: `@WebMvcTest` (Controller), `@SpringBootTest` (Service), `@DataJpaTest` (Repository)
- **Integration Test**: Testcontainers + PostgreSQL
- **API Test**: MockMvc

### Frontend
- **Unit Test**: Jest + React Testing Library
- **API Mocking**: Mock Service Worker (MSW)

### E2E Test
- **Tool**: Cypress
- **Scope**: 전체 스택 통합 테스트 (docker-compose up 후 실행)

---

## 🐳 Docker Compose 구성

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: urlshortener
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
    volumes:
      - db-data:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    depends_on:
      - db
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/urlshortener
      SPRING_DATASOURCE_USERNAME: admin
      SPRING_DATASOURCE_PASSWORD: secret
      JWT_SECRET: your-secret-key

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  db-data:
```

---

## 📁 디렉토리 구조

### Backend
```
backend/
├── src/main/java/com/urlshortener/
│   ├── UrlShortenerApplication.java
│   ├── controller/
│   │   ├── UrlController.java
│   │   ├── AnalyticsController.java
│   │   └── AuthController.java
│   ├── service/
│   │   ├── UrlService.java
│   │   ├── ClickTrackingService.java
│   │   ├── AnalyticsService.java
│   │   ├── AuthService.java
│   │   └── Base62EncodingService.java
│   ├── repository/
│   │   ├── UrlRepository.java
│   │   ├── ClickLogRepository.java
│   │   └── UserRepository.java
│   ├── entity/
│   │   ├── Url.java
│   │   ├── ClickLog.java
│   │   └── User.java
│   ├── dto/
│   │   ├── request/
│   │   └── response/
│   ├── security/
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── OAuth2SuccessHandler.java
│   ├── config/
│   │   ├── AsyncConfig.java
│   │   ├── SecurityConfig.java
│   │   └── SwaggerConfig.java
│   └── exception/
│       ├── GlobalExceptionHandler.java
│       ├── UrlNotFoundException.java
│       └── UrlExpiredException.java
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/
│       ├── V1__create_users.sql
│       ├── V2__create_urls.sql
│       └── V3__create_click_logs.sql
├── pom.xml
└── Dockerfile
```

### Frontend
```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── App.tsx
│   ├── index.tsx
│   ├── theme/
│   │   └── theme.ts  # MUI Theme Configuration
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── MyUrlsPage.tsx
│   │   └── UrlDetailPage.tsx
│   ├── components/
│   │   ├── common/
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   └── AppBar.tsx
│   │   ├── url/
│   │   │   ├── UrlForm.tsx
│   │   │   └── UrlCard.tsx
│   │   └── charts/
│   │       ├── DailyClicksChart.tsx
│   │       ├── CountryDistributionChart.tsx
│   │       └── BrowserDistributionChart.tsx
│   ├── services/
│   │   ├── apiService.ts
│   │   └── authService.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   └── types/
│       └── api.types.ts
├── package.json
├── tsconfig.json
├── Dockerfile
└── nginx.conf
```

---

## 🚀 다음 단계

### CONSTRUCTION Phase 진입 예정
1. **U-005 (Database Schema)** - Functional Design → Code Generation
2. **U-001 (Backend Core)** - Full cycle
3. **U-002 (Backend Analytics)** - Full cycle
4. **U-003 (Backend Auth)** - Full cycle
5. **U-004 (Frontend UI with MUI)** - Full cycle
6. **U-006 (Infrastructure)** - Full cycle
7. **Build and Test** - 전체 통합 테스트

---

## 🔗 Git Repository

**Repository URL**: https://github.com/Kuhosai/Project3.git
**현재 브랜치**: main

---

## 📝 관련 문서

프로젝트 상세 문서는 다음 경로에서 확인할 수 있습니다:

- [Requirements](aidlc-docs/inception/requirements/requirements.md)
- [User Stories](aidlc-docs/inception/user-stories/stories.md)
- [Execution Plan](aidlc-docs/inception/plans/execution-plan.md)
- [Application Design](aidlc-docs/inception/application-design/application-design.md)
- [Unit of Work](aidlc-docs/inception/application-design/unit-of-work.md)
- [Unit Dependencies](aidlc-docs/inception/application-design/unit-of-work-dependency.md)
- [Story-to-Unit Mapping](aidlc-docs/inception/application-design/unit-of-work-story-map.md)

---

**생성일**: 2026-05-11
**AIDLC 버전**: 1.0
**프로젝트 상태**: INCEPTION 완료, CONSTRUCTION 시작 대기
