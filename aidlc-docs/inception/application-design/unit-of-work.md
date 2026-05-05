# Unit of Work Definitions

URL 단축 서비스를 구현 가능한 Units로 분해하고, 각 Unit의 책임과 범위를 정의합니다.

**Architecture Strategy**: Monolith (단일 Spring Boot 앱 + React 프론트엔드)
**Material Design 3 Integration**: MUI (Material-UI) v5+ 라이브러리 사용

---

## Unit Overview

| Unit ID | Unit Name | Type | Primary Responsibility |
|---|---|---|---|
| U-001 | Backend Core | Backend | URL Management, Click Tracking, Base62 Encoding |
| U-002 | Backend Analytics | Backend | Statistics Aggregation and Querying |
| U-003 | Backend Auth | Backend | User Authentication (Email, OAuth2, JWT) |
| U-004 | Frontend UI | Frontend | React UI with Material Design 3 (MUI) |
| U-005 | Database Schema | Database | PostgreSQL Schema + Flyway Migrations |
| U-006 | Infrastructure | Infrastructure | Docker Compose Multi-Container Setup |

**Total Units**: 6

---

## Material Design 3 Integration Plan

### MUI (Material-UI) v5+ 적용 전략

**Packages**:
```bash
npm install @mui/material @emotion/react @emotion/styled
```

**Design System 통일화**:
1. **Theme Configuration**:
   - MUI Theme Provider로 전역 색상, 타이포그래피, 간격 통일
   - M3 Color Scheme 적용 (Primary, Secondary, Surface, Error 등)
   - 커스텀 테마 파일: `src/theme/theme.ts`

2. **Component Library**:
   - MUI 컴포넌트 사용: Button, TextField, Card, AppBar, Drawer, Chip, Dialog 등
   - 모든 UI 컴포넌트를 MUI 기반으로 구축하여 일관성 유지

3. **Typography**:
   - MUI Typography 컴포넌트 사용
   - Roboto 폰트 적용 (M3 기본 폰트)

4. **Icons**:
   - Material Icons 라이브러리 사용 (`@mui/icons-material`)

5. **Responsive Design**:
   - MUI Grid, Container, Stack 컴포넌트로 반응형 레이아웃
   - Breakpoints 활용 (xs, sm, md, lg, xl)

**Responsibility**: Unit U-004 (Frontend UI)

---

## Unit U-001: Backend Core

### Responsibilities
- URL 단축 생성 및 검증
- Base62 인코딩/디코딩
- URL 리다이렉트 처리
- 클릭 추적 (비동기)
- URL 조회 및 관리

### Scope
- **Controllers**: `UrlController` (4 endpoints)
- **Services**: `UrlService`, `ClickTrackingService`, `Base62EncodingService`
- **Repositories**: `UrlRepository`, `ClickLogRepository`
- **Entities**: `Url`, `ClickLog`
- **DTOs**: `UrlCreateRequest`, `UrlResponse`
- **Utilities**: GeoLite2DatabaseReader, UserAgentParser

### Dependencies
- **Internal**: Unit U-005 (Database Schema)
- **External**: Spring Boot 3.x, Spring Data JPA, GeoLite2, Spring @Async

### User Stories Coverage
- US-001: 익명 URL 생성
- US-002: 등록 사용자 URL 생성
- US-003: 단축 URL 리다이렉트
- US-004: 클릭 정보 자동 수집

### Key Business Rules
1. URL 검증: HTTP/HTTPS 프로토콜만 허용, 프로토콜 없으면 `https://` 자동 추가
2. Base62 인코딩: 순차 ID → 짧은 코드 (a-z, A-Z, 0-9)
3. 만료일 검증: 리다이렉트 전 만료일 체크
4. 비동기 클릭 추적: 리다이렉트 응답 시간에 영향 없도록 클릭 로그 비동기 저장

### NFR Requirements
- **Performance**: 리다이렉트 응답 시간 200ms 이내
- **Async Processing**: ThreadPoolTaskExecutor (Core: 5, Max: 10)
- **Transaction**: `@Transactional` 사용 (읽기 전용 트랜잭션 최적화)

---

## Unit U-002: Backend Analytics

### Responsibilities
- 클릭 통계 집계 및 조회
- 일별 클릭수 통계
- 국가별/브라우저별 분포 통계
- URL 소유권 검증

### Scope
- **Controllers**: `AnalyticsController` (3 endpoints)
- **Services**: `AnalyticsService`
- **Repositories**: `ClickLogRepository` (커스텀 통계 쿼리), `UrlRepository` (소유권 검증)
- **DTOs**: `DailyClickStatsDto`, `CountryDistributionDto`, `BrowserDistributionDto`

### Dependencies
- **Internal**: Unit U-001 (ClickLog 엔티티), Unit U-005 (Database Schema)
- **External**: Spring Data JPA Projection

### User Stories Coverage
- US-005: 내 URL 목록 조회
- US-006: 일별 클릭수 차트
- US-007: 국가별 클릭 분포 차트
- US-008: 브라우저별 클릭 분포 차트

### Key Business Rules
1. 소유권 검증: URL의 user_id와 요청자의 user_id 일치 여부 확인
2. 통계 집계: Spring Data JPA Projection으로 DTO 직접 매핑
3. 비율 계산: 총 클릭수 대비 각 카테고리별 비율(%) 계산

### NFR Requirements
- **Performance**: 통계 쿼리 최적화 (INDEX 활용)
- **Future Extension**: Spring Cache 적용 가능 (캐싱 레이어 추가 예정)

---

## Unit U-003: Backend Auth

### Responsibilities
- 사용자 회원 가입 및 로그인
- JWT 토큰 발급 및 검증
- OAuth2 소셜 로그인 (Google, GitHub)
- 비밀번호 암호화 (BCrypt)
- 토큰 갱신

### Scope
- **Controllers**: `AuthController` (5 endpoints)
- **Services**: `AuthService`
- **Repositories**: `UserRepository`
- **Entities**: `User`
- **DTOs**: `SignupRequest`, `LoginRequest`, `AuthResponse`
- **Security**: `JwtTokenProvider`, `JwtAuthenticationFilter`, `OAuth2SuccessHandler`

### Dependencies
- **Internal**: Unit U-005 (Database Schema)
- **External**: Spring Security 6.x, Spring Security OAuth2 Client, jjwt, BCrypt

### User Stories Coverage
- US-009: 이메일 회원 가입
- US-010: 이메일 로그인
- US-011: 소셜 로그인 (Google)
- US-012: 소셜 로그인 (GitHub)

### Key Business Rules
1. 이메일 중복 검사: 회원 가입 시 이메일 유니크 검증
2. 비밀번호 암호화: BCrypt 사용 (비밀번호 평문 저장 금지)
3. JWT 발급: Access Token (1시간), Refresh Token (7일)
4. OAuth2 자동 계정 생성: Provider + ProviderId로 기존 사용자 조회, 없으면 신규 생성

### NFR Requirements
- **Security**: JWT Secret 환경 변수로 관리 (하드코딩 금지)
- **Password Policy**: 최소 8자 이상 (프론트엔드에서 검증)

---

## Unit U-004: Frontend UI

### Responsibilities
- React 기반 사용자 인터페이스
- Material Design 3 (MUI) 디자인 시스템 적용
- REST API 통신 (Axios)
- 클라이언트 측 라우팅
- JWT 토큰 관리
- 차트 시각화

### Scope
- **Pages**: `HomePage`, `LoginPage`, `SignupPage`, `MyUrlsPage`, `UrlDetailPage`
- **Components**:
  - **MUI-Based**: `UrlForm`, `UrlCard`, `LoadingSpinner`, `ErrorMessage`, `DailyClicksChart`, `CountryDistributionChart`, `BrowserDistributionChart`
  - **Layout**: `AppBar` (MUI), `NavigationDrawer` (MUI)
- **Services**: `apiService` (Axios Interceptor), `authService` (Token Management)
- **Context**: `AuthContext` (useAuth hook)
- **Theme**: `theme.ts` (MUI Theme Configuration)
- **Routing**: React Router v6

### Material Design 3 Integration Details

#### 1. Theme Configuration (`src/theme/theme.ts`)
```typescript
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6750A4', // M3 Primary
    },
    secondary: {
      main: '#625B71', // M3 Secondary
    },
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

#### 2. Component Mapping

| Custom Component | MUI Component | M3 Pattern |
|---|---|---|
| UrlForm | TextField, Button | Filled Text Field + Elevated Button |
| UrlCard | Card, CardContent, Chip | M3 Card + Filled Tonal Chip |
| LoadingSpinner | CircularProgress | M3 Circular Progress Indicator |
| ErrorMessage | Alert | M3 Snackbar/Alert |
| AppBar | AppBar, Toolbar | M3 Top App Bar |
| NavigationDrawer | Drawer, List, ListItem | M3 Navigation Drawer |

#### 3. Typography
- All text elements use `<Typography>` component
- Variants: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `body1`, `body2`, `caption`

#### 4. Icons
```bash
npm install @mui/icons-material
```
- Use Material Icons: `<LinkIcon />`, `<BarChartIcon />`, `<LoginIcon />`, etc.

#### 5. Responsive Layout
- Use `<Container>`, `<Grid>`, `<Stack>` for responsive design
- Breakpoints: `theme.breakpoints.up('md')`, `theme.breakpoints.down('sm')`

### Dependencies
- **Internal**: Unit U-001, U-002, U-003 (Backend REST APIs)
- **External**: React 18.x, React Router 6.x, MUI v5+, Emotion, Axios, Recharts, jwt-decode

### User Stories Coverage
- US-001, US-002: URL 생성 폼 (MUI TextField + Button)
- US-005: 내 URL 목록 (MUI Card + List)
- US-006, US-007, US-008: 차트 컴포넌트 (Recharts + MUI Container)
- US-009, US-010: 회원 가입/로그인 폼 (MUI TextField + Button)
- US-011, US-012: 소셜 로그인 버튼 (MUI Button with custom styling)

### Key Business Rules
1. JWT 자동 추가: Axios Request Interceptor로 Authorization 헤더 자동 삽입
2. 401 에러 처리: Axios Response Interceptor로 자동 로그아웃 + 로그인 페이지 리다이렉트
3. Protected Routes: 로그인 필요한 페이지는 AuthContext로 보호
4. URL 검증: 프론트엔드에서도 URL 형식 검증 (백엔드와 동일한 규칙)

### NFR Requirements
- **Responsive Design**: MUI Grid 시스템으로 모바일/태블릿/데스크톱 대응
- **Accessibility**: MUI 컴포넌트의 내장 a11y 기능 활용 (ARIA labels, keyboard navigation)
- **Theme Consistency**: 모든 페이지에서 동일한 MUI Theme 적용

---

## Unit U-005: Database Schema

### Responsibilities
- PostgreSQL 데이터베이스 스키마 정의
- Flyway 마이그레이션 스크립트 관리
- 테이블 구조 및 관계 설정
- 인덱스 최적화

### Scope
- **Tables**: `users`, `urls`, `click_logs`
- **Migrations**: Flyway SQL 스크립트 (`V1__create_users.sql`, `V2__create_urls.sql`, `V3__create_click_logs.sql`)
- **Indexes**: 성능 최적화를 위한 인덱스 (short_code, user_id, url_id, clicked_at)

### Schema Design

#### Table: `users`
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL for OAuth2 users
    provider VARCHAR(50), -- 'local', 'google', 'github'
    provider_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);
```

#### Table: `urls`
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
CREATE INDEX idx_urls_short_code ON urls(short_code);
CREATE INDEX idx_urls_user_id ON urls(user_id);
```

#### Table: `click_logs`
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
CREATE INDEX idx_click_logs_url_id ON clicks_logs(url_id);
CREATE INDEX idx_click_logs_clicked_at ON click_logs(clicked_at);
```

### Dependencies
- **Internal**: None (독립적)
- **External**: PostgreSQL 15, Flyway 9.x

### User Stories Coverage
- 모든 User Stories의 데이터 저장소 역할

### Key Design Decisions
1. **Normalization**: 3NF 준수 (중복 제거, 외래 키 관계 명확)
2. **Cascade Delete**: user 삭제 시 관련 urls, click_logs 자동 삭제
3. **Indexes**: 자주 조회되는 컬럼에 인덱스 추가 (short_code, user_id, url_id, clicked_at)
4. **Flyway Versioning**: `V1__`, `V2__`, `V3__` 순서로 마이그레이션

### NFR Requirements
- **Performance**: 인덱스 최적화로 쿼리 속도 향상
- **Data Integrity**: Foreign Key 제약 조건으로 데이터 일관성 보장

---

## Unit U-006: Infrastructure

### Responsibilities
- Docker Compose 멀티 컨테이너 오케스트레이션
- PostgreSQL 데이터베이스 컨테이너
- Spring Boot 백엔드 컨테이너
- React 프론트엔드 컨테이너 (Nginx)
- 네트워크 및 볼륨 설정

### Scope
- **docker-compose.yml**: 3개 서비스 (db, backend, frontend)
- **Dockerfile (Backend)**: Spring Boot JAR 빌드 + 실행
- **Dockerfile (Frontend)**: React 빌드 + Nginx 서빙
- **nginx.conf**: React 라우팅 설정 (SPA fallback)

### Docker Compose Structure

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

### Dependencies
- **Internal**: Unit U-001, U-002, U-003 (Backend), Unit U-004 (Frontend), Unit U-005 (Database)
- **External**: Docker 24.x, Docker Compose 2.x

### User Stories Coverage
- US-013: Swagger API 문서 (백엔드 컨테이너에서 `/swagger-ui` 제공)

### Key Design Decisions
1. **Single docker-compose.yml**: 모든 서비스를 하나의 파일로 관리
2. **Service Dependencies**: `depends_on`으로 시작 순서 제어 (db → backend → frontend)
3. **Volume Persistence**: PostgreSQL 데이터 영속성 보장
4. **Environment Variables**: 환경 변수로 DB 연결 정보 및 JWT Secret 관리

### NFR Requirements
- **Portability**: Docker 컨테이너로 환경 독립성 보장
- **Ease of Deployment**: `docker-compose up` 한 번으로 전체 스택 실행

---

## Unit Dependencies Matrix

| Unit | Depends On | Used By |
|---|---|---|
| U-001 (Backend Core) | U-005 (Database) | U-002, U-004 |
| U-002 (Backend Analytics) | U-001, U-005 | U-004 |
| U-003 (Backend Auth) | U-005 | U-004 |
| U-004 (Frontend UI) | U-001, U-002, U-003 | - |
| U-005 (Database) | - | U-001, U-002, U-003 |
| U-006 (Infrastructure) | U-001, U-002, U-003, U-004, U-005 | - |

**Circular Dependencies**: None (단방향 의존성 유지)

---

## Development Sequence (Sequential)

### Phase 1: Database Foundation
**Unit U-005 (Database Schema)**
- Reason: 모든 백엔드 유닛이 데이터베이스에 의존

### Phase 2: Backend Core
**Unit U-001 (Backend Core) → U-002 (Backend Analytics) → U-003 (Backend Auth)**
- Reason: U-002는 U-001의 ClickLog 엔티티 사용, U-003는 독립적이나 순서상 백엔드 완료 후 프론트엔드 진행

### Phase 3: Frontend UI
**Unit U-004 (Frontend UI)**
- Reason: 백엔드 API가 완성된 후 프론트엔드 개발 (Material Design 3 적용)

### Phase 4: Infrastructure Integration
**Unit U-006 (Infrastructure)**
- Reason: 모든 유닛이 완성된 후 Docker Compose로 통합

---

## Code Organization (Greenfield Project Structure)

### Backend Directory Structure

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
│   │   │   ├── UrlCreateRequest.java
│   │   │   ├── SignupRequest.java
│   │   │   └── LoginRequest.java
│   │   └── response/
│   │       ├── UrlResponse.java
│   │       ├── AuthResponse.java
│   │       ├── DailyClickStatsDto.java
│   │       ├── CountryDistributionDto.java
│   │       └── BrowserDistributionDto.java
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

### Frontend Directory Structure (with MUI)

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── App.tsx
│   ├── index.tsx
│   ├── theme/
│   │   └── theme.ts  # MUI Theme Configuration (M3)
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── MyUrlsPage.tsx
│   │   └── UrlDetailPage.tsx
│   ├── components/
│   │   ├── common/
│   │   │   ├── LoadingSpinner.tsx  # MUI CircularProgress
│   │   │   ├── ErrorMessage.tsx    # MUI Alert
│   │   │   └── AppBar.tsx          # MUI AppBar
│   │   ├── url/
│   │   │   ├── UrlForm.tsx         # MUI TextField + Button
│   │   │   └── UrlCard.tsx         # MUI Card
│   │   └── charts/
│   │       ├── DailyClicksChart.tsx
│   │       ├── CountryDistributionChart.tsx
│   │       └── BrowserDistributionChart.tsx
│   ├── services/
│   │   ├── apiService.ts     # Axios Instance + Interceptors
│   │   └── authService.ts    # JWT Token Management
│   ├── context/
│   │   └── AuthContext.tsx   # React Context for Auth
│   └── types/
│       └── api.types.ts      # TypeScript Type Definitions
├── package.json
├── tsconfig.json
├── Dockerfile
└── nginx.conf
```

### Infrastructure Files

```
infrastructure/
├── docker-compose.yml
└── .env.example  # Environment variables template
```

---

## Story-to-Unit Mapping Preview

| User Story | Primary Unit | Supporting Units |
|---|---|---|
| US-001, US-002, US-003, US-004 | U-001 (Backend Core) | U-005 (Database) |
| US-005, US-006, US-007, US-008 | U-002 (Backend Analytics) | U-001, U-005 |
| US-009, US-010, US-011, US-012 | U-003 (Backend Auth) | U-005 |
| All UI Stories | U-004 (Frontend UI) | U-001, U-002, U-003 |
| US-013 (Swagger) | U-001, U-002, U-003 | U-006 (Infrastructure) |

**Full mapping details**: See [unit-of-work-story-map.md](unit-of-work-story-map.md)

---

## Summary

- **Total Units**: 6 (Backend 3, Frontend 1, Database 1, Infrastructure 1)
- **Architecture**: Monolith (Spring Boot + React)
- **Design System**: Material Design 3 (MUI v5+ with @mui/material, @emotion/react, @emotion/styled)
- **Development Approach**: Sequential (Database → Backend → Frontend → Infrastructure)
- **Circular Dependencies**: None
- **Estimated Timeline**: 2주 (학습용 프로젝트)

**Next Steps**:
1. Review unit-of-work-dependency.md for detailed dependency analysis
2. Review unit-of-work-story-map.md for complete story-to-unit mapping
3. Proceed to CONSTRUCTION phase (Functional Design for Unit U-005)
