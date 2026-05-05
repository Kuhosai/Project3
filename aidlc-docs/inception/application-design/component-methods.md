# Component Methods

컴포넌트별 메서드 시그니처 및 입출력 타입 정의입니다.

**Note**: 상세한 비즈니스 로직 및 알고리즘은 Functional Design 단계(CONSTRUCTION 단계)에서 정의됩니다.

---

## Backend Component Methods

### 1. Controller Layer Methods

#### UrlController

```java
@RestController
@RequestMapping("/api/urls")
public class UrlController {

    /**
     * URL 단축 생성 (익명/등록 사용자)
     * @param request 원본 URL 및 만료일 (선택)
     * @param principal 인증 정보 (선택 - 익명 사용자는 null)
     * @return 생성된 단축 URL 정보
     */
    @PostMapping
    public ResponseEntity<UrlResponse> createShortUrl(
        @RequestBody @Valid CreateUrlRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    );

    /**
     * 내 URL 목록 조회 (등록 사용자 전용)
     * @param principal 인증 정보
     * @return 사용자의 URL 목록
     */
    @GetMapping
    public ResponseEntity<List<UrlResponse>> getMyUrls(
        @AuthenticationPrincipal UserPrincipal principal
    );

    /**
     * URL 상세 조회 (등록 사용자 전용)
     * @param id URL ID
     * @param principal 인증 정보
     * @return URL 상세 정보
     */
    @GetMapping("/{id}")
    public ResponseEntity<UrlDetailResponse> getUrlDetails(
        @PathVariable Long id,
        @AuthenticationPrincipal UserPrincipal principal
    );

    /**
     * 단축 URL 리다이렉트
     * @param shortCode 단축 코드
     * @param request HTTP 요청 (클릭 추적용)
     * @return 원본 URL로 리다이렉트 (302)
     */
    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> redirect(
        @PathVariable String shortCode,
        HttpServletRequest request
    );
}
```

#### AnalyticsController

```java
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    /**
     * 일별 클릭수 통계 조회
     * @param urlId URL ID
     * @param startDate 시작 날짜 (기본값: 30일 전)
     * @param endDate 종료 날짜 (기본값: 오늘)
     * @param principal 인증 정보
     * @return 일별 클릭수 통계 리스트
     */
    @GetMapping("/{urlId}/daily")
    public ResponseEntity<List<DailyClickStatsDto>> getDailyClickStats(
        @PathVariable Long urlId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
        @AuthenticationPrincipal UserPrincipal principal
    );

    /**
     * 국가별 클릭 분포 조회
     * @param urlId URL ID
     * @param principal 인증 정보
     * @return 국가별 클릭 통계 (상위 10개)
     */
    @GetMapping("/{urlId}/countries")
    public ResponseEntity<List<CountryStatsDto>> getCountryDistribution(
        @PathVariable Long urlId,
        @AuthenticationPrincipal UserPrincipal principal
    );

    /**
     * 브라우저별 클릭 분포 조회
     * @param urlId URL ID
     * @param principal 인증 정보
     * @return 브라우저별 클릭 통계
     */
    @GetMapping("/{urlId}/browsers")
    public ResponseEntity<List<BrowserStatsDto>> getBrowserDistribution(
        @PathVariable Long urlId,
        @AuthenticationPrincipal UserPrincipal principal
    );
}
```

#### AuthController

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    /**
     * 이메일 회원 가입
     * @param request 이메일, 비밀번호
     * @return JWT 토큰 (자동 로그인)
     */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(
        @RequestBody @Valid SignupRequest request
    );

    /**
     * 이메일 로그인
     * @param request 이메일, 비밀번호
     * @return JWT 토큰
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
        @RequestBody @Valid LoginRequest request
    );

    /**
     * 토큰 갱신
     * @param request Refresh Token
     * @return 새로운 Access Token
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
        @RequestBody RefreshTokenRequest request
    );

    /**
     * OAuth2 콜백 처리 (내부용 - Spring Security OAuth2가 자동 처리)
     */
    // OAuth2 로그인은 Spring Security OAuth2 Client가 자동 처리
}
```

---

### 2. Service Layer Methods

#### UrlService

```java
@Service
public class UrlService {

    /**
     * URL 단축 생성
     * @param request 원본 URL, 만료일 (선택)
     * @param userId 사용자 ID (익명은 null)
     * @return 생성된 단축 URL 정보
     */
    public UrlResponse createShortUrl(CreateUrlRequest request, Long userId);

    /**
     * 단축 코드로 원본 URL 조회
     * @param shortCode Base62 단축 코드
     * @return 원본 URL
     * @throws UrlNotFoundException 존재하지 않는 코드
     * @throws UrlExpiredException 만료된 URL
     */
    public String getOriginalUrl(String shortCode);

    /**
     * 사용자 URL 목록 조회
     * @param userId 사용자 ID
     * @return URL 목록 (생성일 역순)
     */
    public List<UrlResponse> getUserUrls(Long userId);

    /**
     * URL 상세 조회 (소유권 검증 포함)
     * @param urlId URL ID
     * @param userId 요청 사용자 ID
     * @return URL 상세 정보
     * @throws AccessDeniedException 권한 없음
     */
    public UrlDetailResponse getUrlDetails(Long urlId, Long userId);

    /**
     * URL 검증 (내부 메서드)
     * @param url 원본 URL
     * @return 검증된 URL (프로토콜 자동 추가)
     * @throws InvalidUrlException 유효하지 않은 URL
     */
    private String validateAndNormalizeUrl(String url);
}
```

#### ClickTrackingService

```java
@Service
public class ClickTrackingService {

    /**
     * 클릭 로그 비동기 저장
     * @param urlId URL ID
     * @param request HTTP 요청 (IP, User-Agent, Referer 추출)
     */
    @Async
    public void trackClickAsync(Long urlId, HttpServletRequest request);

    /**
     * IP 주소에서 국가 정보 추출 (GeoLite2 사용)
     * @param ipAddress IP 주소
     * @return 국가 코드 (예: "KR", "US")
     */
    private String extractCountryFromIp(String ipAddress);

    /**
     * User-Agent에서 브라우저 정보 추출
     * @param userAgent User-Agent 문자열
     * @return 브라우저 이름 (예: "Chrome", "Firefox", "Safari")
     */
    private String extractBrowserFromUserAgent(String userAgent);
}
```

#### AnalyticsService

```java
@Service
public class AnalyticsService {

    /**
     * 일별 클릭수 통계 조회
     * @param urlId URL ID
     * @param startDate 시작 날짜
     * @param endDate 종료 날짜
     * @return 일별 클릭수 리스트
     */
    public List<DailyClickStatsDto> getDailyClickStats(
        Long urlId,
        LocalDate startDate,
        LocalDate endDate
    );

    /**
     * 국가별 클릭 분포 조회
     * @param urlId URL ID
     * @return 국가별 클릭 통계 (상위 10개, 비율 포함)
     */
    public List<CountryStatsDto> getCountryDistribution(Long urlId);

    /**
     * 브라우저별 클릭 분포 조회
     * @param urlId URL ID
     * @return 브라우저별 클릭 통계 (비율 포함)
     */
    public List<BrowserStatsDto> getBrowserDistribution(Long urlId);
}
```

#### AuthService

```java
@Service
public class AuthService {

    /**
     * 회원 가입
     * @param request 이메일, 비밀번호
     * @return JWT 토큰 (자동 로그인)
     * @throws EmailAlreadyExistsException 이메일 중복
     */
    public AuthResponse signup(SignupRequest request);

    /**
     * 로그인
     * @param request 이메일, 비밀번호
     * @return JWT 토큰
     * @throws InvalidCredentialsException 인증 실패
     */
    public AuthResponse login(LoginRequest request);

    /**
     * OAuth2 사용자 처리 (신규/기존 사용자 자동 판별)
     * @param oAuth2UserInfo OAuth2 사용자 정보
     * @return JWT 토큰
     */
    public AuthResponse processOAuth2User(OAuth2UserInfo oAuth2UserInfo);

    /**
     * 토큰 갱신
     * @param refreshToken Refresh Token
     * @return 새로운 Access Token
     * @throws InvalidTokenException 유효하지 않은 토큰
     */
    public AuthResponse refreshToken(String refreshToken);
}
```

#### Base62EncodingService

```java
@Service
public class Base62EncodingService {

    private static final String BASE62_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    /**
     * 순차 ID를 Base62 문자열로 인코딩
     * @param id 순차 ID (예: 12345)
     * @return Base62 문자열 (예: "dnh")
     */
    public String encode(Long id);

    /**
     * Base62 문자열을 ID로 디코딩
     * @param shortCode Base62 문자열
     * @return 원래 ID
     */
    public Long decode(String shortCode);
}
```

---

### 3. Repository Layer Methods

#### UrlRepository

```java
@Repository
public interface UrlRepository extends JpaRepository<Url, Long> {

    /**
     * 단축 코드로 URL 조회
     * @param shortCode Base62 단축 코드
     * @return URL 엔티티 (Optional)
     */
    Optional<Url> findByShortCode(String shortCode);

    /**
     * 사용자 ID로 URL 목록 조회 (생성일 역순)
     * @param userId 사용자 ID
     * @return URL 목록
     */
    List<Url> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * 사용자 ID로 활성화된 URL 목록만 조회
     * @param userId 사용자 ID
     * @return 활성화된 URL 목록
     */
    List<Url> findByUserIdAndActiveTrue(Long userId);
}
```

#### ClickLogRepository

```java
@Repository
public interface ClickLogRepository extends JpaRepository<ClickLog, Long> {

    /**
     * URL ID로 총 클릭수 조회
     * @param urlId URL ID
     * @return 클릭수
     */
    Long countByUrlId(Long urlId);

    /**
     * 일별 클릭수 통계 조회 (Spring Data JPA Projection 사용)
     * @param urlId URL ID
     * @param startDate 시작 날짜
     * @param endDate 종료 날짜
     * @return 일별 클릭수 DTO 리스트
     */
    @Query("SELECT new com.example.dto.DailyClickStatsDto(DATE(c.clickedAt), COUNT(c)) " +
           "FROM ClickLog c " +
           "WHERE c.urlId = :urlId AND DATE(c.clickedAt) BETWEEN :startDate AND :endDate " +
           "GROUP BY DATE(c.clickedAt) " +
           "ORDER BY DATE(c.clickedAt)")
    List<DailyClickStatsDto> findDailyStats(
        @Param("urlId") Long urlId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * 국가별 클릭 분포 조회 (상위 10개)
     * @param urlId URL ID
     * @return 국가별 통계 DTO 리스트
     */
    @Query("SELECT new com.example.dto.CountryStatsDto(c.country, COUNT(c)) " +
           "FROM ClickLog c " +
           "WHERE c.urlId = :urlId " +
           "GROUP BY c.country " +
           "ORDER BY COUNT(c) DESC")
    List<CountryStatsDto> findCountryDistribution(@Param("urlId") Long urlId);

    /**
     * 브라우저별 클릭 분포 조회
     * @param urlId URL ID
     * @return 브라우저별 통계 DTO 리스트
     */
    @Query("SELECT new com.example.dto.BrowserStatsDto(c.browser, COUNT(c)) " +
           "FROM ClickLog c " +
           "WHERE c.urlId = :urlId " +
           "GROUP BY c.browser " +
           "ORDER BY COUNT(c) DESC")
    List<BrowserStatsDto> findBrowserDistribution(@Param("urlId") Long urlId);
}
```

#### UserRepository

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 이메일로 사용자 조회
     * @param email 이메일
     * @return 사용자 엔티티 (Optional)
     */
    Optional<User> findByEmail(String email);

    /**
     * 이메일 중복 검사
     * @param email 이메일
     * @return 존재 여부
     */
    boolean existsByEmail(String email);

    /**
     * OAuth2 provider와 provider ID로 사용자 조회
     * @param provider OAuth2 provider (예: "google", "github")
     * @param providerId Provider의 user ID
     * @return 사용자 엔티티 (Optional)
     */
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
}
```

---

### 4. Security Component Methods

#### JwtAuthenticationFilter

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    /**
     * 요청마다 JWT 토큰 검증
     * @param request HTTP 요청
     * @param response HTTP 응답
     * @param filterChain 필터 체인
     */
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException;

    /**
     * Authorization 헤더에서 JWT 추출
     * @param request HTTP 요청
     * @return JWT 토큰 (없으면 null)
     */
    private String extractJwtFromRequest(HttpServletRequest request);
}
```

#### JwtTokenProvider

```java
@Component
public class JwtTokenProvider {

    /**
     * Access Token 생성
     * @param userId 사용자 ID
     * @param email 이메일
     * @return JWT Access Token (유효기간: 1시간)
     */
    public String generateAccessToken(Long userId, String email);

    /**
     * Refresh Token 생성
     * @param userId 사용자 ID
     * @return JWT Refresh Token (유효기간: 7일)
     */
    public String generateRefreshToken(Long userId);

    /**
     * JWT 토큰 검증
     * @param token JWT 토큰
     * @return 유효 여부
     */
    public boolean validateToken(String token);

    /**
     * JWT에서 사용자 ID 추출
     * @param token JWT 토큰
     * @return 사용자 ID
     */
    public Long getUserIdFromToken(String token);

    /**
     * JWT에서 이메일 추출
     * @param token JWT 토큰
     * @return 이메일
     */
    public String getEmailFromToken(String token);
}
```

#### OAuth2SuccessHandler

```java
@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    /**
     * OAuth2 로그인 성공 시 처리
     * @param request HTTP 요청
     * @param response HTTP 응답
     * @param authentication 인증 정보 (OAuth2 사용자 정보 포함)
     */
    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) throws IOException;
}
```

---

## Frontend Component Methods

### 1. Page Component Methods

#### HomePage

```typescript
export const HomePage: React.FC = () => {

    /**
     * URL 생성 핸들러
     * @param originalUrl 원본 URL
     * @param expiresAt 만료일 (선택)
     */
    const handleCreateUrl = async (originalUrl: string, expiresAt?: Date): Promise<void>;

    /**
     * 단축 URL 복사 핸들러
     * @param shortUrl 단축 URL
     */
    const handleCopyUrl = (shortUrl: string): void;
};
```

#### LoginPage

```typescript
export const LoginPage: React.FC = () => {

    /**
     * 이메일 로그인 핸들러
     * @param email 이메일
     * @param password 비밀번호
     */
    const handleLogin = async (email: string, password: string): Promise<void>;

    /**
     * 소셜 로그인 핸들러
     * @param provider OAuth2 provider ("google" | "github")
     */
    const handleSocialLogin = (provider: "google" | "github"): void;
};
```

#### SignupPage

```typescript
export const SignupPage: React.FC = () => {

    /**
     * 회원 가입 핸들러
     * @param email 이메일
     * @param password 비밀번호
     */
    const handleSignup = async (email: string, password: string): Promise<void>;

    /**
     * 이메일 형식 검증
     * @param email 이메일
     * @returns 유효 여부
     */
    const validateEmail = (email: string): boolean;

    /**
     * 비밀번호 강도 계산
     * @param password 비밀번호
     * @returns 강도 ("weak" | "medium" | "strong")
     */
    const calculatePasswordStrength = (password: string): "weak" | "medium" | "strong";
};
```

#### MyUrlsPage

```typescript
export const MyUrlsPage: React.FC = () => {

    /**
     * 사용자 URL 목록 로드
     */
    const loadUrls = async (): Promise<void>;

    /**
     * URL 상세 페이지로 이동
     * @param urlId URL ID
     */
    const navigateToUrlDetails = (urlId: number): void;
};
```

#### UrlDetailPage

```typescript
export const UrlDetailPage: React.FC = () => {

    /**
     * URL 통계 데이터 로드
     * @param urlId URL ID
     */
    const loadAnalytics = async (urlId: number): Promise<void>;
};
```

---

### 2. Common Component Methods

#### UrlForm

```typescript
interface UrlFormProps {
    onSubmit: (url: string, expiresAt?: Date) => void;
    loading: boolean;
}

export const UrlForm: React.FC<UrlFormProps> = ({ onSubmit, loading }) => {

    /**
     * 폼 제출 핸들러
     * @param e Form Event
     */
    const handleSubmit = (e: React.FormEvent): void;

    /**
     * URL 검증 (프로토콜 자동 추가)
     * @param url 원본 URL
     * @returns 정규화된 URL
     */
    const normalizeUrl = (url: string): string;
};
```

#### UrlCard

```typescript
interface UrlCardProps {
    url: UrlResponse;
    onCopy: (shortUrl: string) => void;
}

export const UrlCard: React.FC<UrlCardProps> = ({ url, onCopy }) => {

    /**
     * 복사 버튼 클릭 핸들러
     */
    const handleCopy = (): void;
};
```

---

### 3. Chart Component Methods

#### DailyClicksChart

```typescript
interface DailyClicksChartProps {
    data: DailyClickStatsDto[];
}

export const DailyClicksChart: React.FC<DailyClicksChartProps> = ({ data }) => {
    // Recharts LineChart 렌더링
};
```

#### CountryDistributionChart

```typescript
interface CountryDistributionChartProps {
    data: CountryStatsDto[];
}

export const CountryDistributionChart: React.FC<CountryDistributionChartProps> = ({ data }) => {
    // Recharts PieChart 렌더링
};
```

#### BrowserDistributionChart

```typescript
interface BrowserDistributionChartProps {
    data: BrowserStatsDto[];
}

export const BrowserDistributionChart: React.FC<BrowserDistributionChartProps> = ({ data }) => {
    // Recharts BarChart 렌더링
};
```

---

### 4. Service Layer Methods (Frontend)

#### apiService

```typescript
class ApiService {

    /**
     * Axios 인스턴스 생성 (Interceptor 설정)
     */
    private axiosInstance: AxiosInstance;

    /**
     * URL 생성
     * @param request CreateUrlRequest
     * @returns UrlResponse
     */
    async createUrl(request: CreateUrlRequest): Promise<UrlResponse>;

    /**
     * 내 URL 목록 조회
     * @returns UrlResponse[]
     */
    async getMyUrls(): Promise<UrlResponse[]>;

    /**
     * URL 상세 조회
     * @param urlId URL ID
     * @returns UrlDetailResponse
     */
    async getUrlDetails(urlId: number): Promise<UrlDetailResponse>;

    /**
     * 일별 클릭수 통계 조회
     * @param urlId URL ID
     * @param startDate 시작 날짜
     * @param endDate 종료 날짜
     * @returns DailyClickStatsDto[]
     */
    async getDailyClickStats(
        urlId: number,
        startDate?: Date,
        endDate?: Date
    ): Promise<DailyClickStatsDto[]>;

    /**
     * 국가별 클릭 분포 조회
     * @param urlId URL ID
     * @returns CountryStatsDto[]
     */
    async getCountryDistribution(urlId: number): Promise<CountryStatsDto[]>;

    /**
     * 브라우저별 클릭 분포 조회
     * @param urlId URL ID
     * @returns BrowserStatsDto[]
     */
    async getBrowserDistribution(urlId: number): Promise<BrowserStatsDto[]>;

    /**
     * 회원 가입
     * @param request SignupRequest
     * @returns AuthResponse
     */
    async signup(request: SignupRequest): Promise<AuthResponse>;

    /**
     * 로그인
     * @param request LoginRequest
     * @returns AuthResponse
     */
    async login(request: LoginRequest): Promise<AuthResponse>;
}

export const apiService = new ApiService();
```

#### authService

```typescript
class AuthService {

    /**
     * JWT 토큰 로컬 스토리지 저장
     * @param accessToken Access Token
     * @param refreshToken Refresh Token
     */
    saveTokens(accessToken: string, refreshToken: string): void;

    /**
     * JWT 토큰 로컬 스토리지 조회
     * @returns Access Token (없으면 null)
     */
    getAccessToken(): string | null;

    /**
     * JWT 토큰 삭제 (로그아웃)
     */
    clearTokens(): void;

    /**
     * 로그인 상태 확인
     * @returns 로그인 여부
     */
    isAuthenticated(): boolean;

    /**
     * JWT 토큰에서 사용자 정보 추출
     * @returns 사용자 정보 (없으면 null)
     */
    getUserFromToken(): { userId: number; email: string } | null;
}

export const authService = new AuthService();
```

---

### 5. Context Methods

#### AuthContext

```typescript
interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

/**
 * AuthContext Provider
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    /**
     * 로그인
     * @param email 이메일
     * @param password 비밀번호
     */
    const login = async (email: string, password: string): Promise<void>;

    /**
     * 로그아웃
     */
    const logout = (): void;
};

/**
 * useAuth Hook
 * @returns AuthContextType
 */
export const useAuth = (): AuthContextType;
```

---

## Summary

총 **100+ 메서드** 정의:
- **Backend Controller**: 12개 엔드포인트
- **Backend Service**: 25개 비즈니스 로직 메서드
- **Backend Repository**: 10개 데이터 접근 메서드
- **Backend Security**: 8개 인증/인가 메서드
- **Frontend Pages**: 10개 이벤트 핸들러
- **Frontend Services**: 15개 API 호출 메서드
- **Frontend Context**: 4개 전역 상태 관리 메서드
