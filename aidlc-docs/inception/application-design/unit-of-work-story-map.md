# Story-to-Unit Mapping

13개 User Stories를 6개 Units에 매핑하고, Coverage를 검증합니다.

---

## Story-to-Unit Mapping Table

| Story ID | Story Name | Primary Unit | Supporting Units | Priority |
|---|---|---|---|---|
| US-001 | 익명 URL 생성 | U-001 (Backend Core) | U-005 (Database), U-004 (Frontend) | Must Have |
| US-002 | 등록 사용자 URL 생성 | U-001 (Backend Core) | U-003 (Auth), U-005 (Database), U-004 (Frontend) | Must Have |
| US-003 | 단축 URL 리다이렉트 | U-001 (Backend Core) | U-005 (Database) | Must Have |
| US-004 | 클릭 정보 자동 수집 | U-001 (Backend Core) | U-005 (Database) | Must Have |
| US-005 | 내 URL 목록 조회 | U-002 (Backend Analytics) | U-001 (ClickLog), U-005 (Database), U-004 (Frontend) | Must Have |
| US-006 | 일별 클릭수 차트 | U-002 (Backend Analytics) | U-001 (ClickLog), U-005 (Database), U-004 (Frontend) | Must Have |
| US-007 | 국가별 클릭 분포 차트 | U-002 (Backend Analytics) | U-001 (ClickLog), U-005 (Database), U-004 (Frontend) | Must Have |
| US-008 | 브라우저별 클릭 분포 차트 | U-002 (Backend Analytics) | U-001 (ClickLog), U-005 (Database), U-004 (Frontend) | Must Have |
| US-009 | 이메일 회원 가입 | U-003 (Backend Auth) | U-005 (Database), U-004 (Frontend) | Must Have |
| US-010 | 이메일 로그인 | U-003 (Backend Auth) | U-005 (Database), U-004 (Frontend) | Must Have |
| US-011 | 소셜 로그인 (Google) | U-003 (Backend Auth) | U-005 (Database), U-004 (Frontend) | Must Have |
| US-012 | 소셜 로그인 (GitHub) | U-003 (Backend Auth) | U-005 (Database), U-004 (Frontend) | Should Have |
| US-013 | Swagger API 문서 | U-001, U-002, U-003 (All Backend Units) | U-006 (Infrastructure) | Should Have |

---

## Unit-to-Story Mapping (By Unit)

### Unit U-001: Backend Core

**Primary Stories** (4):
- US-001: 익명 URL 생성
- US-002: 등록 사용자 URL 생성
- US-003: 단축 URL 리다이렉트
- US-004: 클릭 정보 자동 수집

**Supporting Stories** (4):
- US-005: 내 URL 목록 조회 (ClickLog 엔티티 제공)
- US-006: 일별 클릭수 차트 (ClickLog 엔티티 제공)
- US-007: 국가별 클릭 분포 차트 (ClickLog 엔티티 제공)
- US-008: 브라우저별 클릭 분포 차트 (ClickLog 엔티티 제공)

**Total Contribution**: 8 Stories

**Key Deliverables**:
- ✅ URL 생성 및 검증 로직
- ✅ Base62 인코딩/디코딩
- ✅ 리다이렉트 처리 (만료일 검증)
- ✅ 비동기 클릭 추적 (GeoLite2 국가 추출, User-Agent 파싱)

---

### Unit U-002: Backend Analytics

**Primary Stories** (4):
- US-005: 내 URL 목록 조회
- US-006: 일별 클릭수 차트
- US-007: 국가별 클릭 분포 차트
- US-008: 브라우저별 클릭 분포 차트

**Supporting Stories**: None

**Total Contribution**: 4 Stories

**Key Deliverables**:
- ✅ 통계 집계 쿼리 (Spring Data JPA Projection)
- ✅ 소유권 검증 (URL의 user_id 확인)
- ✅ 일별/국가별/브라우저별 분포 DTO 반환

---

### Unit U-003: Backend Auth

**Primary Stories** (4):
- US-009: 이메일 회원 가입
- US-010: 이메일 로그인
- US-011: 소셜 로그인 (Google)
- US-012: 소셜 로그인 (GitHub)

**Supporting Stories** (1):
- US-002: 등록 사용자 URL 생성 (JWT 인증 제공)

**Total Contribution**: 5 Stories

**Key Deliverables**:
- ✅ 회원 가입 (BCrypt 암호화)
- ✅ 로그인 및 JWT 발급
- ✅ OAuth2 소셜 로그인 (Google, GitHub)
- ✅ 토큰 갱신

---

### Unit U-004: Frontend UI

**Primary Stories** (0 - UI만 담당)

**Supporting Stories** (12):
- US-001: 익명 URL 생성 (UrlForm 컴포넌트)
- US-002: 등록 사용자 URL 생성 (UrlForm + 만료일 피커)
- US-005: 내 URL 목록 조회 (MyUrlsPage + UrlCard 컴포넌트)
- US-006: 일별 클릭수 차트 (DailyClicksChart - Recharts)
- US-007: 국가별 클릭 분포 차트 (CountryDistributionChart - Recharts)
- US-008: 브라우저별 클릭 분포 차트 (BrowserDistributionChart - Recharts)
- US-009: 이메일 회원 가입 (SignupPage + MUI TextField)
- US-010: 이메일 로그인 (LoginPage + MUI TextField)
- US-011: 소셜 로그인 (Google) (LoginPage + MUI Button)
- US-012: 소셜 로그인 (GitHub) (LoginPage + MUI Button)
- US-013: Swagger API 문서 (링크 제공 - 개발자용)

**Total Contribution**: 12 Stories

**Key Deliverables**:
- ✅ Material Design 3 (MUI) Theme 설정
- ✅ React 페이지 및 컴포넌트 (MUI 기반)
- ✅ Axios Interceptor (JWT 자동 추가)
- ✅ React Router 설정
- ✅ Recharts 차트 컴포넌트

---

### Unit U-005: Database Schema

**Primary Stories** (0 - 데이터 저장소만 담당)

**Supporting Stories** (13 - All Stories):
- 모든 User Stories의 데이터 저장소 역할

**Total Contribution**: 13 Stories

**Key Deliverables**:
- ✅ `users` 테이블 (US-009, US-010, US-011, US-012)
- ✅ `urls` 테이블 (US-001, US-002, US-003)
- ✅ `click_logs` 테이블 (US-004, US-005, US-006, US-007, US-008)
- ✅ Flyway 마이그레이션 스크립트

---

### Unit U-006: Infrastructure

**Primary Stories** (0 - 배포 환경만 담당)

**Supporting Stories** (1):
- US-013: Swagger API 문서 (배포 환경에서 Swagger UI 접근 가능)

**Total Contribution**: 1 Story (간접적으로 전체 시스템 통합)

**Key Deliverables**:
- ✅ docker-compose.yml (db, backend, frontend)
- ✅ Backend Dockerfile
- ✅ Frontend Dockerfile + nginx.conf

---

## Coverage Verification

### Story Coverage Matrix

| Story ID | Covered by Unit(s) | Status |
|---|---|---|
| US-001 | U-001 (Backend), U-005 (Database), U-004 (Frontend) | ✅ Covered |
| US-002 | U-001 (Backend), U-003 (Auth), U-005 (Database), U-004 (Frontend) | ✅ Covered |
| US-003 | U-001 (Backend), U-005 (Database) | ✅ Covered |
| US-004 | U-001 (Backend), U-005 (Database) | ✅ Covered |
| US-005 | U-002 (Analytics), U-001 (ClickLog), U-005 (Database), U-004 (Frontend) | ✅ Covered |
| US-006 | U-002 (Analytics), U-001 (ClickLog), U-005 (Database), U-004 (Frontend) | ✅ Covered |
| US-007 | U-002 (Analytics), U-001 (ClickLog), U-005 (Database), U-004 (Frontend) | ✅ Covered |
| US-008 | U-002 (Analytics), U-001 (ClickLog), U-005 (Database), U-004 (Frontend) | ✅ Covered |
| US-009 | U-003 (Auth), U-005 (Database), U-004 (Frontend) | ✅ Covered |
| US-010 | U-003 (Auth), U-005 (Database), U-004 (Frontend) | ✅ Covered |
| US-011 | U-003 (Auth), U-005 (Database), U-004 (Frontend) | ✅ Covered |
| US-012 | U-003 (Auth), U-005 (Database), U-004 (Frontend) | ✅ Covered |
| US-013 | U-001, U-002, U-003 (Backend), U-006 (Infrastructure) | ✅ Covered |

**Total Stories**: 13
**Covered Stories**: 13
**Uncovered Stories**: 0

✅ **100% Coverage Achieved**

---

## Detailed Story-to-Unit Breakdown

### Feature 1: URL 단축 기능

#### US-001: 익명 URL 생성

**Backend**:
- **Unit U-001**: `UrlController.createShortUrl()`, `UrlService.createShortUrl()`, `UrlRepository.save()`, `Base62EncodingService.encode()`
- **Unit U-005**: `urls` 테이블

**Frontend**:
- **Unit U-004**: `HomePage` + `UrlForm` (MUI TextField + Button)

**Acceptance Criteria Coverage**:
1. URL 검증 규칙 → U-001 (`UrlService.validateAndNormalizeUrl()`)
2. 단축 코드 생성 → U-001 (`Base62EncodingService`)
3. 복사 가능한 단축 URL 표시 → U-004 (`UrlCard` with Copy Button)

---

#### US-002: 등록 사용자 URL 생성

**Backend**:
- **Unit U-001**: `UrlController.createShortUrl()`, `UrlService.createShortUrl()` (user_id 연결)
- **Unit U-003**: JWT 인증 (`JwtAuthenticationFilter`)
- **Unit U-005**: `urls` 테이블 (user_id, expires_at)

**Frontend**:
- **Unit U-004**: `HomePage` + `UrlForm` (만료일 DatePicker 추가)

**Acceptance Criteria Coverage**:
1. 로그인 사용자만 → U-003 (JWT 검증)
2. 사용자 계정과 연결 → U-001 (user_id 저장)
3. 만료일 설정 → U-001 (expires_at 저장)
4. URL 검증 규칙 → U-001 (`UrlService.validateAndNormalizeUrl()`)

---

### Feature 2: URL 리다이렉트

#### US-003: 단축 URL 리다이렉트

**Backend**:
- **Unit U-001**: `UrlController.redirect()`, `UrlService.getOriginalUrl()`, `Base62EncodingService.decode()`
- **Unit U-005**: `urls` 테이블

**Acceptance Criteria Coverage**:
1. HTTP 302 리다이렉트 → U-001 (`UrlController.redirect()`)
2. 200ms 이내 → U-001 (비동기 클릭 추적으로 응답 시간 최적화)
3. 404 에러 → U-001 (`UrlNotFoundException`)
4. 만료 에러 → U-001 (`UrlExpiredException`)

---

### Feature 3: 클릭 추적

#### US-004: 클릭 정보 자동 수집

**Backend**:
- **Unit U-001**: `ClickTrackingService.trackClickAsync()` (비동기)
- **Unit U-005**: `click_logs` 테이블

**Acceptance Criteria Coverage**:
1. 비동기 저장 → U-001 (`@Async` 메서드)
2. 수집 정보 → U-001 (IP, User-Agent, 타임스탬프, Referer, 국가)
3. 응답 속도 영향 없음 → U-001 (비동기 처리)
4. 국가 코드 추출 → U-001 (GeoLite2)

---

### Feature 4: 통계 대시보드

#### US-005: 내 URL 목록 조회

**Backend**:
- **Unit U-002**: `AnalyticsController.getMyUrls()`, `AnalyticsService.getMyUrls()`
- **Unit U-001**: `UrlRepository` (URL 데이터)
- **Unit U-005**: `urls`, `click_logs` 테이블

**Frontend**:
- **Unit U-004**: `MyUrlsPage` + `UrlCard` (MUI Card)

**Acceptance Criteria Coverage**:
1. "내 URL" 페이지 → U-004 (`MyUrlsPage`)
2. URL 목록 표시 → U-002 (API), U-004 (UI)
3. 원본 주소, 단축 코드, 생성일, 만료일 → U-002 (DTO)
4. 총 클릭수 표시 → U-002 (COUNT 쿼리)

---

#### US-006: 일별 클릭수 차트

**Backend**:
- **Unit U-002**: `AnalyticsController.getDailyClickStats()`, `AnalyticsService.getDailyClickStats()`
- **Unit U-001**: `ClickLog` 엔티티
- **Unit U-005**: `click_logs` 테이블

**Frontend**:
- **Unit U-004**: `UrlDetailPage` + `DailyClicksChart` (Recharts LineChart)

**Acceptance Criteria Coverage**:
1. 일별 클릭수 차트 → U-004 (Recharts)
2. 최근 30일 → U-002 (SQL WHERE 절)
3. 반응형 → U-004 (MUI Container + Recharts ResponsiveContainer)

---

#### US-007: 국가별 클릭 분포 차트

**Backend**:
- **Unit U-002**: `AnalyticsController.getCountryDistribution()`, `AnalyticsService.getCountryDistribution()`
- **Unit U-001**: `ClickLog` 엔티티 (country_code)
- **Unit U-005**: `click_logs` 테이블

**Frontend**:
- **Unit U-004**: `UrlDetailPage` + `CountryDistributionChart` (Recharts PieChart)

**Acceptance Criteria Coverage**:
1. 원형 차트 → U-004 (Recharts PieChart)
2. 상위 10개 국가 → U-002 (SQL LIMIT 10)
3. 클릭 비율(%) → U-002 (비율 계산)

---

#### US-008: 브라우저별 클릭 분포 차트

**Backend**:
- **Unit U-002**: `AnalyticsController.getBrowserDistribution()`, `AnalyticsService.getBrowserDistribution()`
- **Unit U-001**: `ClickLog` 엔티티 (browser)
- **Unit U-005**: `click_logs` 테이블

**Frontend**:
- **Unit U-004**: `UrlDetailPage` + `BrowserDistributionChart` (Recharts BarChart)

**Acceptance Criteria Coverage**:
1. 막대 차트 → U-004 (Recharts BarChart)
2. 브라우저 파싱 → U-001 (ClickTrackingService - UserAgentParser)
3. 클릭수 및 비율 → U-002 (비율 계산)

---

### Feature 5: 회원 기능

#### US-009: 이메일 회원 가입

**Backend**:
- **Unit U-003**: `AuthController.signup()`, `AuthService.signup()`, `UserRepository.save()`
- **Unit U-005**: `users` 테이블

**Frontend**:
- **Unit U-004**: `SignupPage` (MUI TextField + Button)

**Acceptance Criteria Coverage**:
1. 회원 가입 폼 → U-004 (`SignupPage`)
2. 이메일 중복 검사 → U-003 (`UserRepository.existsByEmail()`)
3. 비밀번호 암호화 → U-003 (BCrypt)
4. 자동 로그인 → U-003 (JWT 발급)

---

#### US-010: 이메일 로그인

**Backend**:
- **Unit U-003**: `AuthController.login()`, `AuthService.login()`, `JwtTokenProvider.generateAccessToken()`
- **Unit U-005**: `users` 테이블

**Frontend**:
- **Unit U-004**: `LoginPage` (MUI TextField + Button)

**Acceptance Criteria Coverage**:
1. 로그인 폼 → U-004 (`LoginPage`)
2. JWT 토큰 발급 → U-003 (`JwtTokenProvider`)
3. 로컬 스토리지 저장 → U-004 (`authService.setTokens()`)
4. 에러 메시지 → U-003 (`InvalidCredentialsException`) + U-004 (MUI Alert)

---

#### US-011: 소셜 로그인 (Google)

**Backend**:
- **Unit U-003**: `OAuth2SuccessHandler`, `AuthService.processOAuth2User()`, `UserRepository`
- **Unit U-005**: `users` 테이블 (provider='google')

**Frontend**:
- **Unit U-004**: `LoginPage` + MUI Button ("Google로 로그인")

**Acceptance Criteria Coverage**:
1. OAuth2 인증 → U-003 (Spring Security OAuth2 Client)
2. 신규 사용자 자동 생성 → U-003 (`AuthService.processOAuth2User()`)
3. JWT 발급 → U-003 (`JwtTokenProvider`)

---

#### US-012: 소셜 로그인 (GitHub)

**Backend**:
- **Unit U-003**: `OAuth2SuccessHandler`, `AuthService.processOAuth2User()`, `UserRepository`
- **Unit U-005**: `users` 테이블 (provider='github')

**Frontend**:
- **Unit U-004**: `LoginPage` + MUI Button ("GitHub로 로그인")

**Acceptance Criteria Coverage**:
1. OAuth2 인증 → U-003 (Spring Security OAuth2 Client)
2. 신규 사용자 자동 생성 → U-003 (`AuthService.processOAuth2User()`)
3. JWT 발급 → U-003 (`JwtTokenProvider`)

---

### Feature 6: API 문서화

#### US-013: Swagger API 문서

**Backend**:
- **Unit U-001**: `UrlController` (Swagger 어노테이션)
- **Unit U-002**: `AnalyticsController` (Swagger 어노테이션)
- **Unit U-003**: `AuthController` (Swagger 어노테이션)

**Infrastructure**:
- **Unit U-006**: Docker Compose 환경에서 `/swagger-ui` 접근 가능

**Acceptance Criteria Coverage**:
1. Swagger UI 접근 → U-001, U-002, U-003 (`SwaggerConfig`)
2. 모든 API 문서화 → U-001, U-002, U-003 (`@Operation`, `@ApiResponse`)
3. API 테스트 가능 → Swagger UI 기본 기능

---

## Unit Responsibility Summary

| Unit | Primary Focus | Story Count |
|---|---|---|
| U-001 (Backend Core) | URL 생성, 리다이렉트, 클릭 추적 | 8 (4 Primary + 4 Supporting) |
| U-002 (Backend Analytics) | 통계 집계 및 조회 | 4 (4 Primary) |
| U-003 (Backend Auth) | 인증 및 인가 | 5 (4 Primary + 1 Supporting) |
| U-004 (Frontend UI) | UI/UX (Material Design 3) | 12 (Supporting All) |
| U-005 (Database) | 데이터 저장소 | 13 (Supporting All) |
| U-006 (Infrastructure) | 배포 환경 | 1 (Supporting) |

---

## Development Priority by Story

### Sprint 1 (Week 1): Core Features
**Units**: U-005, U-001
**Stories**: US-001, US-003, US-004

1. **Phase 1.1**: U-005 (Database Schema)
   - Flyway 마이그레이션 (`urls`, `click_logs`)

2. **Phase 1.2**: U-001 (Backend Core)
   - US-001: 익명 URL 생성
   - US-003: 단축 URL 리다이렉트
   - US-004: 클릭 추적

---

### Sprint 2 (Week 1-2): Authentication
**Units**: U-003, U-001
**Stories**: US-009, US-010, US-002

1. **Phase 2.1**: U-003 (Backend Auth)
   - US-009: 이메일 회원 가입
   - US-010: 이메일 로그인

2. **Phase 2.2**: U-001 (Backend Core - Auth Integration)
   - US-002: 등록 사용자 URL 생성 (JWT 연동)

---

### Sprint 3 (Week 2): Dashboard & Analytics
**Units**: U-002, U-004
**Stories**: US-005, US-006, US-011

1. **Phase 3.1**: U-002 (Backend Analytics)
   - US-005: 내 URL 목록 조회
   - US-006: 일별 클릭수 차트

2. **Phase 3.2**: U-004 (Frontend UI - Material Design 3)
   - MUI Theme 설정
   - HomePage, LoginPage, SignupPage, MyUrlsPage
   - US-011: 소셜 로그인 (Google)

---

### Sprint 4 (Week 2): Advanced Features
**Units**: U-002, U-004, U-006
**Stories**: US-007, US-008, US-012, US-013

1. **Phase 4.1**: U-002 (Backend Analytics)
   - US-007: 국가별 클릭 분포
   - US-008: 브라우저별 클릭 분포

2. **Phase 4.2**: U-004 (Frontend UI - Charts)
   - UrlDetailPage + Recharts 차트 컴포넌트

3. **Phase 4.3**: U-003 (Backend Auth - Optional)
   - US-012: 소셜 로그인 (GitHub)

4. **Phase 4.4**: U-006 (Infrastructure)
   - Docker Compose 통합
   - US-013: Swagger API 문서

---

## Summary

- ✅ **Total Stories**: 13
- ✅ **Total Units**: 6
- ✅ **Coverage**: 100% (모든 Story가 Unit에 매핑됨)
- ✅ **Circular Dependencies**: None
- ✅ **Development Sequence**: U-005 → U-001 → U-002 → U-003 → U-004 → U-006

**Next Steps**:
1. Proceed to CONSTRUCTION phase
2. Start with Unit U-005 (Database Schema) - Functional Design
