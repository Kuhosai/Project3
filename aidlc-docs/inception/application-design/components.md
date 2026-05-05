# Application Components

## 컴포넌트 개요

URL 단축 서비스는 **3-tier 아키텍처** (Controller - Service - Repository)를 따릅니다.

---

## Backend Components (Spring Boot)

### 1. Controller Layer

#### 1.1 UrlController
- **목적**: URL 단축 및 리다이렉트 REST API 제공
- **책임**:
  - URL 단축 요청 처리 (익명/등록 사용자)
  - 단축 URL 리다이렉트 처리
  - URL 목록 조회 (등록 사용자)
  - URL 상세 조회
- **엔드포인트**:
  - `POST /api/urls` - URL 단축
  - `GET /{shortCode}` - 리다이렉트
  - `GET /api/urls` - 내 URL 목록 조회 (인증 필요)
  - `GET /api/urls/{id}` - URL 상세 조회 (인증 필요)

#### 1.2 AnalyticsController
- **목적**: 클릭 통계 조회 REST API 제공
- **책임**:
  - 일별 클릭수 통계 조회
  - 국가별 클릭 분포 조회
  - 브라우저별 클릭 분포 조회
- **엔드포인트**:
  - `GET /api/analytics/{urlId}/daily` - 일별 클릭수
  - `GET /api/analytics/{urlId}/countries` - 국가별 분포
  - `GET /api/analytics/{urlId}/browsers` - 브라우저별 분포

#### 1.3 AuthController
- **목적**: 회원 가입, 로그인, 소셜 로그인 REST API 제공
- **책임**:
  - 이메일 회원 가입
  - 이메일 로그인 (JWT 발급)
  - OAuth2 소셜 로그인 (Google, GitHub)
  - 토큰 갱신
- **엔드포인트**:
  - `POST /api/auth/signup` - 회원 가입
  - `POST /api/auth/login` - 로그인
  - `GET /api/auth/oauth2/{provider}` - 소셜 로그인 시작
  - `POST /api/auth/refresh` - 토큰 갱신

---

### 2. Service Layer

#### 2.1 UrlService
- **목적**: URL 단축 및 관리 비즈니스 로직
- **책임**:
  - URL 검증 (프로토콜, 형식)
  - Base62 인코딩 (순차 ID 기반)
  - URL 저장 및 조회
  - 만료일 설정 처리
  - 사용자별 URL 목록 조회
- **주요 메서드**:
  - `createShortUrl(CreateUrlRequest) -> UrlResponse`
  - `getOriginalUrl(String shortCode) -> String`
  - `getUserUrls(Long userId) -> List<UrlResponse>`
  - `getUrlDetails(Long urlId) -> UrlDetailResponse`

#### 2.2 ClickTrackingService
- **목적**: 클릭 로그 비동기 저장
- **책임**:
  - 클릭 정보 수집 (IP, User-Agent, Referer, Timestamp)
  - GeoLite2를 통한 국가 정보 추출
  - 비동기 클릭 로그 저장 (@Async)
- **주요 메서드**:
  - `trackClickAsync(Long urlId, HttpServletRequest) -> void`
  - `extractCountryFromIp(String ip) -> String`
  - `extractBrowserFromUserAgent(String userAgent) -> String`

#### 2.3 AnalyticsService
- **목적**: 통계 집계 및 조회
- **책임**:
  - 일별 클릭수 집계
  - 국가별 클릭 분포 집계
  - 브라우저별 클릭 분포 집계
  - 통계 데이터 캐싱 (선택적)
- **주요 메서드**:
  - `getDailyClickStats(Long urlId, LocalDate startDate, LocalDate endDate) -> List<DailyClickStatsDto>`
  - `getCountryDistribution(Long urlId) -> List<CountryStatsDto>`
  - `getBrowserDistribution(Long urlId) -> List<BrowserStatsDto>`

#### 2.4 AuthService
- **목적**: 사용자 인증 및 회원 관리
- **책임**:
  - 회원 가입 (비밀번호 BCrypt 암호화)
  - 로그인 검증 및 JWT 토큰 발급
  - OAuth2 사용자 생성 및 연동
  - 토큰 갱신
- **주요 메서드**:
  - `signup(SignupRequest) -> AuthResponse`
  - `login(LoginRequest) -> AuthResponse`
  - `processOAuth2User(OAuth2UserInfo) -> AuthResponse`
  - `refreshToken(String refreshToken) -> AuthResponse`

#### 2.5 Base62EncodingService
- **목적**: Base62 인코딩/디코딩 유틸리티
- **책임**:
  - 순차 ID를 Base62 문자열로 변환
  - Base62 문자열을 ID로 디코딩
- **주요 메서드**:
  - `encode(Long id) -> String`
  - `decode(String shortCode) -> Long`

---

### 3. Repository Layer

#### 3.1 UrlRepository
- **목적**: URL 엔티티 데이터 접근
- **책임**:
  - URL 저장, 조회, 수정, 삭제
  - 사용자별 URL 목록 조회
  - 단축 코드로 URL 조회
- **인터페이스**: `JpaRepository<Url, Long>`
- **커스텀 쿼리**:
  - `findByShortCode(String shortCode) -> Optional<Url>`
  - `findByUserIdOrderByCreatedAtDesc(Long userId) -> List<Url>`
  - `findByUserIdAndActiveTrue(Long userId) -> List<Url>`

#### 3.2 ClickLogRepository
- **목적**: 클릭 로그 데이터 접근
- **책임**:
  - 클릭 로그 저장
  - URL별 클릭 통계 조회 (Spring Data JPA Projection 사용)
- **인터페이스**: `JpaRepository<ClickLog, Long>`
- **커스텀 쿼리**:
  - `countByUrlId(Long urlId) -> Long`
  - `findDailyStats(Long urlId, LocalDate start, LocalDate end) -> List<DailyClickStatsDto>`
  - `findCountryDistribution(Long urlId) -> List<CountryStatsDto>`
  - `findBrowserDistribution(Long urlId) -> List<BrowserStatsDto>`

#### 3.3 UserRepository
- **목적**: 사용자 엔티티 데이터 접근
- **책임**:
  - 사용자 저장, 조회, 수정
  - 이메일 중복 검사
  - OAuth2 provider ID로 사용자 조회
- **인터페이스**: `JpaRepository<User, Long>`
- **커스텀 쿼리**:
  - `findByEmail(String email) -> Optional<User>`
  - `existsByEmail(String email) -> boolean`
  - `findByProviderAndProviderId(String provider, String providerId) -> Optional<User>`

---

### 4. Domain Entity Layer

#### 4.1 Url (엔티티)
- **목적**: URL 도메인 모델
- **필드**:
  - `id: Long` (PK, Auto Increment)
  - `shortCode: String` (Base62 인코딩된 짧은 코드)
  - `originalUrl: String` (원본 URL)
  - `userId: Long` (FK, nullable - 익명 사용자는 null)
  - `createdAt: LocalDateTime`
  - `expiresAt: LocalDateTime` (nullable)
  - `active: boolean` (활성 상태)
- **관계**:
  - `ManyToOne` - User (optional)
  - `OneToMany` - ClickLog

#### 4.2 ClickLog (엔티티)
- **목적**: 클릭 로그 도메인 모델
- **필드**:
  - `id: Long` (PK, Auto Increment)
  - `urlId: Long` (FK)
  - `ipAddress: String`
  - `userAgent: String`
  - `referer: String` (nullable)
  - `country: String` (GeoLite2에서 추출)
  - `browser: String` (User-Agent 파싱)
  - `clickedAt: LocalDateTime`
- **관계**:
  - `ManyToOne` - Url

#### 4.3 User (엔티티)
- **목적**: 사용자 도메인 모델
- **필드**:
  - `id: Long` (PK, Auto Increment)
  - `email: String` (unique)
  - `password: String` (BCrypt 암호화, nullable - 소셜 로그인 사용자)
  - `provider: String` (nullable - "google", "github")
  - `providerId: String` (nullable - OAuth2 provider의 user ID)
  - `createdAt: LocalDateTime`
- **관계**:
  - `OneToMany` - Url

---

### 5. DTO Layer

#### 5.1 Request DTOs
- **CreateUrlRequest**: URL 단축 요청
  - `originalUrl: String`
  - `expiresAt: LocalDateTime` (optional)
- **SignupRequest**: 회원 가입 요청
  - `email: String`
  - `password: String`
- **LoginRequest**: 로그인 요청
  - `email: String`
  - `password: String`

#### 5.2 Response DTOs
- **UrlResponse**: URL 응답
  - `id: Long`
  - `shortCode: String`
  - `shortUrl: String` (full URL)
  - `originalUrl: String`
  - `createdAt: LocalDateTime`
  - `expiresAt: LocalDateTime`
  - `clickCount: Long`
- **AuthResponse**: 인증 응답
  - `accessToken: String`
  - `refreshToken: String`
  - `email: String`
- **DailyClickStatsDto**: 일별 클릭 통계
  - `date: LocalDate`
  - `clickCount: Long`
- **CountryStatsDto**: 국가별 통계
  - `country: String`
  - `clickCount: Long`
  - `percentage: Double`
- **BrowserStatsDto**: 브라우저별 통계
  - `browser: String`
  - `clickCount: Long`
  - `percentage: Double`

---

### 6. Security Components

#### 6.1 JwtAuthenticationFilter
- **목적**: JWT 토큰 검증 필터
- **책임**:
  - Authorization 헤더에서 JWT 추출
  - JWT 유효성 검증
  - SecurityContext에 인증 정보 설정

#### 6.2 JwtTokenProvider
- **목적**: JWT 토큰 생성 및 검증 유틸리티
- **책임**:
  - Access Token 생성
  - Refresh Token 생성
  - 토큰 검증 및 Claims 추출

#### 6.3 OAuth2SuccessHandler
- **목적**: OAuth2 로그인 성공 핸들러
- **책임**:
  - OAuth2 사용자 정보 추출
  - 신규/기존 사용자 처리
  - JWT 발급 및 프론트엔드로 리다이렉트

---

## Frontend Components (React)

### 1. Pages (페이지 컴포넌트)

#### 1.1 HomePage
- **목적**: 메인 페이지 (익명 URL 생성)
- **책임**:
  - URL 입력 폼 렌더링
  - URL 생성 API 호출
  - 생성된 단축 URL 표시 및 복사 기능
- **주요 State**:
  - `originalUrl: string`
  - `shortUrl: string | null`
  - `loading: boolean`
  - `error: string | null`

#### 1.2 LoginPage
- **목적**: 로그인 페이지
- **책임**:
  - 이메일/비밀번호 로그인 폼
  - 소셜 로그인 버튼 (Google, GitHub)
  - 로그인 API 호출 및 토큰 저장
- **주요 State**:
  - `email: string`
  - `password: string`
  - `loading: boolean`
  - `error: string | null`

#### 1.3 SignupPage
- **목적**: 회원 가입 페이지
- **책임**:
  - 회원 가입 폼
  - 이메일 형식 검증
  - 비밀번호 강도 표시
  - 회원 가입 API 호출
- **주요 State**:
  - `email: string`
  - `password: string`
  - `passwordConfirm: string`
  - `loading: boolean`
  - `error: string | null`

#### 1.4 MyUrlsPage
- **목적**: 내 URL 목록 페이지 (등록 사용자)
- **책임**:
  - 사용자 URL 목록 조회 및 표시
  - URL별 클릭수 요약 표시
  - URL 상세 페이지로 이동 링크
- **주요 State**:
  - `urls: UrlResponse[]`
  - `loading: boolean`
  - `error: string | null`

#### 1.5 UrlDetailPage
- **목적**: URL 상세 통계 페이지
- **책임**:
  - 일별 클릭수 차트 표시
  - 국가별 클릭 분포 차트 표시
  - 브라우저별 클릭 분포 차트 표시
- **주요 State**:
  - `urlId: number`
  - `dailyStats: DailyClickStatsDto[]`
  - `countryStats: CountryStatsDto[]`
  - `browserStats: BrowserStatsDto[]`
  - `loading: boolean`
  - `error: string | null`

---

### 2. Common Components (공통 UI 컴포넌트)

#### 2.1 Header
- **목적**: 상단 네비게이션 바
- **책임**:
  - 로고 및 메뉴 표시
  - 로그인/로그아웃 버튼
  - 사용자 정보 표시 (로그인 시)

#### 2.2 UrlForm
- **목적**: URL 입력 폼 (재사용 가능)
- **책임**:
  - URL 입력 필드
  - 만료일 선택 (선택적)
  - URL 검증 (프로토콜 자동 추가)
- **Props**:
  - `onSubmit: (url: string, expiresAt?: Date) => void`
  - `loading: boolean`

#### 2.3 UrlCard
- **목적**: URL 정보 카드 컴포넌트
- **책임**:
  - 단축 URL 표시
  - 원본 URL 표시
  - 클릭수 표시
  - 복사 버튼
- **Props**:
  - `url: UrlResponse`
  - `onCopy: (shortUrl: string) => void`

#### 2.4 LoadingSpinner
- **목적**: 로딩 인디케이터
- **책임**:
  - 데이터 로딩 중 스피너 표시

#### 2.5 ErrorMessage
- **목적**: 에러 메시지 표시
- **책임**:
  - 에러 메시지 스타일링 및 표시
- **Props**:
  - `message: string`

---

### 3. Chart Components (차트 컴포넌트)

#### 3.1 DailyClicksChart
- **목적**: 일별 클릭수 꺾은선 차트
- **책임**:
  - Recharts LineChart 렌더링
  - 날짜별 클릭수 시각화
- **Props**:
  - `data: DailyClickStatsDto[]`

#### 3.2 CountryDistributionChart
- **목적**: 국가별 클릭 분포 원형 차트
- **책임**:
  - Recharts PieChart 렌더링
  - 상위 10개 국가 시각화
- **Props**:
  - `data: CountryStatsDto[]`

#### 3.3 BrowserDistributionChart
- **목적**: 브라우저별 클릭 분포 막대 차트
- **책임**:
  - Recharts BarChart 렌더링
  - 브라우저별 클릭수 시각화
- **Props**:
  - `data: BrowserStatsDto[]`

---

### 4. Service Layer (Frontend)

#### 4.1 apiService
- **목적**: Axios 기반 HTTP 클라이언트
- **책임**:
  - API 기본 URL 설정
  - Axios Interceptor 설정 (토큰 자동 추가, 에러 핸들링)
  - API 메서드 제공 (createUrl, getUrls, getAnalytics, login, signup 등)

#### 4.2 authService
- **목적**: 인증 관련 로직
- **책임**:
  - JWT 토큰 로컬 스토리지 저장/조회/삭제
  - 로그인 상태 확인
  - 자동 로그아웃 (토큰 만료 시)

---

### 5. Context & Hooks

#### 5.1 AuthContext
- **목적**: 전역 인증 상태 관리
- **제공 값**:
  - `user: User | null`
  - `login: (email, password) => Promise<void>`
  - `logout: () => void`
  - `isAuthenticated: boolean`

#### 5.2 useAuth (Hook)
- **목적**: AuthContext 사용 훅
- **반환 값**: `{ user, login, logout, isAuthenticated }`

#### 5.3 useApi (Hook)
- **목적**: React Query 기반 API 호출 훅
- **기능**:
  - 로딩 상태 관리
  - 에러 핸들링
  - 캐싱 및 자동 갱신

---

## Database Components

### PostgreSQL Tables

#### 1. users
- **목적**: 사용자 정보 저장
- **컬럼**: id, email, password, provider, provider_id, created_at

#### 2. urls
- **목적**: 단축 URL 정보 저장
- **컬럼**: id, short_code, original_url, user_id, created_at, expires_at, active

#### 3. click_logs
- **목적**: 클릭 로그 저장
- **컬럼**: id, url_id, ip_address, user_agent, referer, country, browser, clicked_at

---

## Infrastructure Components

### Docker Compose Services

#### 1. db (PostgreSQL)
- **목적**: 데이터베이스 서비스
- **이미지**: postgres:15
- **볼륨**: ./postgres-data:/var/lib/postgresql/data

#### 2. backend (Spring Boot)
- **목적**: 백엔드 애플리케이션
- **이미지**: Dockerfile (멀티스테이지 빌드)
- **포트**: 8080:8080

#### 3. frontend (React)
- **목적**: 프론트엔드 애플리케이션
- **이미지**: Dockerfile (nginx 기반)
- **포트**: 3000:80

---

## Summary

총 **50+ 컴포넌트**:
- **Backend**: 18개 (Controller 3, Service 5, Repository 3, Entity 3, Security 3, DTO 다수)
- **Frontend**: 20개 (Pages 5, Common 5, Charts 3, Services 2, Context/Hooks 3, Layouts 2)
- **Database**: 3개 테이블
- **Infrastructure**: 3개 Docker 서비스
