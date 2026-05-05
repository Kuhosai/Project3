# Services Layer Design

서비스 계층의 책임, 상호작용, 오케스트레이션 패턴을 정의합니다.

---

## Backend Services

### 1. UrlService

**책임**:
- URL 단축 생성 비즈니스 로직
- URL 검증 및 정규화 (프로토콜 자동 추가)
- Base62EncodingService를 통한 단축 코드 생성
- UrlRepository를 통한 URL 저장/조회
- 사용자 권한 검증 (등록 사용자 URL 조회 시)

**의존성**:
- `UrlRepository` - 데이터 접근
- `Base62EncodingService` - 코드 생성
- `UserRepository` - 사용자 검증 (선택적)

**오케스트레이션**:
1. URL 검증 및 정규화
2. URL 저장 (ID 자동 생성)
3. 생성된 ID를 Base62로 인코딩
4. 단축 코드 업데이트
5. UrlResponse 반환

---

### 2. ClickTrackingService

**책임**:
- 클릭 로그 비동기 저장 (@Async)
- IP 주소에서 국가 정보 추출 (GeoLite2)
- User-Agent에서 브라우저 정보 파싱
- 리다이렉트 응답 시간에 영향 없도록 비동기 처리

**의존성**:
- `ClickLogRepository` - 클릭 로그 저장
- `GeoLite2DatabaseReader` - IP → 국가 변환
- `UserAgentParser` - User-Agent 파싱

**오케스트레이션**:
1. HttpServletRequest에서 IP, User-Agent, Referer 추출
2. GeoLite2로 국가 정보 추출
3. User-Agent 파싱하여 브라우저 정보 추출
4. ClickLog 엔티티 생성 및 저장 (비동기)

**비동기 설정**:
```java
@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean
    public ThreadPoolTaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-click-");
        executor.initialize();
        return executor;
    }
}
```

---

### 3. AnalyticsService

**책임**:
- 클릭 통계 집계 및 조회
- 일별 클릭수 통계 (Spring Data JPA Projection 사용)
- 국가별/브라우저별 분포 통계
- 통계 데이터 캐싱 (선택적 - 향후 확장)

**의존성**:
- `ClickLogRepository` - 통계 쿼리
- `UrlRepository` - URL 소유권 검증

**오케스트레이션**:
1. URL 소유권 검증 (사용자 ID 일치 확인)
2. ClickLogRepository의 커스텀 쿼리 호출
3. 집계 결과를 DTO로 변환
4. 비율(%) 계산 (총 클릭수 대비)

---

### 4. AuthService

**책임**:
- 회원 가입 (BCrypt 암호화)
- 로그인 검증 및 JWT 발급
- OAuth2 사용자 처리 (신규/기존 자동 판별)
- 토큰 갱신

**의존성**:
- `UserRepository` - 사용자 데이터 접근
- `PasswordEncoder` (BCrypt) - 비밀번호 암호화
- `JwtTokenProvider` - JWT 생성/검증

**오케스트레이션 (회원 가입)**:
1. 이메일 중복 검사
2. 비밀번호 BCrypt 암호화
3. User 엔티티 생성 및 저장
4. JWT Access/Refresh Token 발급
5. AuthResponse 반환

**오케스트레이션 (OAuth2)**:
1. Provider + ProviderId로 기존 사용자 조회
2. 없으면 신규 사용자 생성, 있으면 조회
3. JWT 발급 및 반환

---

### 5. Base62EncodingService

**책임**:
- 순차 ID ↔ Base62 문자열 변환
- URL-safe 문자만 사용 (a-z, A-Z, 0-9)

**의존성**: 없음 (Stateless Utility)

**알고리즘**:
- Base62 문자셋: `0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`
- 인코딩: ID를 62진법으로 변환
- 디코딩: 62진법 → 10진법 변환

---

## Frontend Services

### 1. apiService

**책임**:
- Axios 기반 HTTP 클라이언트
- API 기본 URL 설정 (`/api`)
- Axios Interceptor 설정
  - **Request Interceptor**: Authorization 헤더에 JWT 자동 추가
  - **Response Interceptor**: 401 에러 시 자동 로그아웃
- 모든 REST API 메서드 제공

**의존성**:
- `axios` - HTTP 클라이언트
- `authService` - 토큰 관리

**Interceptor 설정**:
```typescript
// Request Interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = authService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor (에러 핸들링)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.clearTokens();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

### 2. authService

**책임**:
- JWT 토큰 로컬 스토리지 저장/조회/삭제
- 로그인 상태 확인
- 토큰에서 사용자 정보 추출 (JWT 디코딩)

**의존성**:
- `jwt-decode` - JWT 디코딩 라이브러리

**로컬 스토리지 키**:
- `accessToken` - Access Token
- `refreshToken` - Refresh Token

---

## Service Interaction Patterns

### 패턴 1: URL 생성 플로우

```
User → UrlController.createShortUrl()
  → UrlService.createShortUrl()
    → UrlService.validateAndNormalizeUrl() (내부)
    → UrlRepository.save() (URL 저장, ID 자동 생성)
    → Base62EncodingService.encode(id)
    → UrlRepository.save() (shortCode 업데이트)
  ← UrlResponse 반환
```

### 패턴 2: 리다이렉트 + 클릭 추적 플로우

```
User → UrlController.redirect(shortCode)
  → UrlService.getOriginalUrl(shortCode)
    → Base62EncodingService.decode(shortCode) → ID
    → UrlRepository.findById(id)
    → 만료일 검증
  ← 원본 URL 반환
  → ClickTrackingService.trackClickAsync() [비동기 실행]
    → extractCountryFromIp() (GeoLite2)
    → extractBrowserFromUserAgent()
    → ClickLogRepository.save()
  ← 302 Redirect 응답 (클릭 추적 완료 대기 안함)
```

### 패턴 3: 통계 조회 플로우

```
User → AnalyticsController.getDailyClickStats()
  → AnalyticsService.getDailyClickStats()
    → UrlRepository.findById() (소유권 검증)
    → ClickLogRepository.findDailyStats() (Projection 쿼리)
  ← List<DailyClickStatsDto> 반환
```

### 패턴 4: OAuth2 로그인 플로우

```
User → OAuth2LoginButton 클릭
  → Spring Security OAuth2 Client (자동 처리)
    → Google/GitHub OAuth2 인증
    → OAuth2SuccessHandler.onAuthenticationSuccess()
      → AuthService.processOAuth2User()
        → UserRepository.findByProviderAndProviderId()
        → 없으면 User 생성, 있으면 조회
        → JwtTokenProvider.generateAccessToken()
      ← JWT 반환
    ← 프론트엔드로 리다이렉트 (토큰 전달)
```

---

## Service Layer Best Practices

### 1. Transaction 관리
- `@Transactional` 어노테이션 사용 (Service 계층)
- 읽기 전용 트랜잭션: `@Transactional(readOnly = true)`
- 쓰기 트랜잭션: `@Transactional`

### 2. 예외 처리
- 비즈니스 로직 예외: Custom Exception 사용
  - `UrlNotFoundException`
  - `UrlExpiredException`
  - `EmailAlreadyExistsException`
  - `InvalidCredentialsException`
- `@ControllerAdvice`로 전역 예외 핸들러 구현

### 3. 비동기 처리
- `@Async` 메서드는 반환 타입 void 또는 CompletableFuture
- ThreadPoolTaskExecutor 설정으로 스레드 풀 관리
- 비동기 메서드는 같은 클래스 내에서 호출하면 동작 안함 (프록시 패턴)

### 4. 캐싱 (향후 확장)
- Spring Cache Abstraction 사용
- `@Cacheable` - 통계 조회 메서드
- `@CacheEvict` - URL 삭제 시 캐시 무효화

---

## Summary

- **Backend Services**: 5개 (Url, ClickTracking, Analytics, Auth, Base62Encoding)
- **Frontend Services**: 2개 (api, auth)
- **Interaction Patterns**: 4개 주요 플로우
- **Best Practices**: Transaction, Exception, Async, Cache
