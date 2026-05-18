# 2인 개발팀 작업 분담 가이드

**팀 구성**: 개발자 A (Backend), 개발자 B (Frontend)
**개발 방식**: Backend/Frontend 분리 전략
**현재 상태**: U-005 Database 설계 완료

---

## 👥 역할 분담

### 개발자 A - Backend 전담
**책임 범위**:
- U-005: Database Schema (PostgreSQL + Flyway)
- U-001: Backend Core (URL 단축, 리다이렉트, 클릭 추적)
- U-002: Backend Analytics (통계 집계)
- U-003: Backend Auth (JWT, OAuth2)

**기술 스택**:
- Java 17+
- Spring Boot 3.x
- Spring Data JPA / Hibernate
- Spring Security
- PostgreSQL 15
- Flyway
- Docker

**개발 기간**: 9일

---

### 개발자 B - Frontend 전담
**책임 범위**:
- U-004: Frontend UI (React + Material Design 3)
- U-006: Infrastructure (Docker Compose)

**기술 스택**:
- React 18.x
- TypeScript
- Material-UI (MUI) v5+
- React Router 6.x
- Axios
- Recharts
- Docker

**개발 기간**: 6일 (대기 1일 포함 7일)

---

## 📅 전체 일정 (15일)

```
Day 1  : [A] Database 설계 + 초기 설정    [B] 프로젝트 셋업 + API 문서 리뷰
Day 2-4: [A] Backend Core                 [B] MUI Theme + Mock UI 개발
Day 5-6: [A] Backend Analytics            [B] Auth 페이지 + URL 목록 페이지
Day 7-9: [A] Backend Auth                 [B] URL 상세 페이지 + Charts
Day 10 : [A] Backend 통합 테스트          [B] Mock → Real API 연결
Day 11 : [A] API 문서 검증                [B] Frontend 통합 테스트
Day 12-13: [A] Infrastructure             [B] Infrastructure 협업
Day 14-15: [A+B] E2E 테스트 + 버그 수정
```

---

## 📋 Day 1: 초기 설정 (공동 작업)

### 🔵 개발자 A - Backend 초기 설정

#### 1. 개발 환경 준비
```bash
# 1.1 Java 17 설치 확인
java -version  # 17 이상

# 1.2 IntelliJ IDEA or VS Code 설치

# 1.3 Docker Desktop 설치 및 실행
docker --version
```

#### 2. PostgreSQL Docker 컨테이너 실행
```bash
docker run -d \
  --name urlshortener-db \
  -e POSTGRES_DB=urlshortener \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=secret \
  -p 5432:5432 \
  postgres:15

# 컨테이너 확인
docker ps

# PostgreSQL 접속 테스트
docker exec -it urlshortener-db psql -U admin -d urlshortener
\dt  # 테이블 목록 (아직 비어있음)
\q   # 종료
```

#### 3. Spring Boot 프로젝트 생성
```bash
# Spring Initializr 사용 (https://start.spring.io)
# 또는 IntelliJ IDEA New Project

설정:
- Project: Maven
- Language: Java
- Spring Boot: 3.2.x (최신 안정 버전)
- Java: 17
- Packaging: Jar
- Dependencies:
  ✅ Spring Web
  ✅ Spring Data JPA
  ✅ PostgreSQL Driver
  ✅ Flyway Migration
  ✅ Spring Security
  ✅ OAuth2 Client
  ✅ Lombok
  ✅ Validation
```

#### 4. Flyway 마이그레이션 파일 복사
```bash
# aidlc-docs에서 Backend 프로젝트로 복사
cd backend
mkdir -p src/main/resources/db/migration

cp ../aidlc-docs/construction/u-005-database/V1__create_users.sql \
   src/main/resources/db/migration/

cp ../aidlc-docs/construction/u-005-database/V2__create_urls.sql \
   src/main/resources/db/migration/

cp ../aidlc-docs/construction/u-005-database/V3__create_click_logs.sql \
   src/main/resources/db/migration/

cp ../aidlc-docs/construction/u-005-database/V4__insert_sample_data.sql \
   src/main/resources/db/migration/
```

#### 5. application.yml 설정
```yaml
# src/main/resources/application.yml
spring:
  application:
    name: urlshortener

  datasource:
    url: jdbc:postgresql://localhost:5432/urlshortener
    username: admin
    password: secret
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: validate  # Flyway가 스키마 관리
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect

  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID:your-google-client-id}
            client-secret: ${GOOGLE_CLIENT_SECRET:your-google-client-secret}
            scope: profile, email
          github:
            client-id: ${GITHUB_CLIENT_ID:your-github-client-id}
            client-secret: ${GITHUB_CLIENT_SECRET:your-github-client-secret}
            scope: user:email

server:
  port: 8080

jwt:
  secret: ${JWT_SECRET:your-256-bit-secret-key-change-in-production}
  access-token-expiration: 3600000  # 1시간
  refresh-token-expiration: 604800000  # 7일
```

#### 6. Spring Boot 실행 및 Flyway 검증
```bash
# Maven으로 실행
./mvnw spring-boot:run

# 로그 확인 (Flyway 마이그레이션 성공 메시지)
# Successfully applied 4 migrations

# PostgreSQL에서 테이블 확인
docker exec -it urlshortener-db psql -U admin -d urlshortener
\dt  # users, urls, click_logs, flyway_schema_history 확인
SELECT * FROM users;  # 샘플 데이터 3개 확인
```

#### 7. Git 브랜치 생성 및 커밋
```bash
# main 브랜치에서 dev 브랜치 생성
git checkout -b dev

# Backend 초기 설정 커밋
git add backend/
git commit -m "feat: initialize Spring Boot project with Flyway migrations"

# feature 브랜치 생성
git checkout -b feature/backend-database
git push -u origin feature/backend-database
```

#### ✅ Day 1 완료 체크리스트 (개발자 A)
- [ ] PostgreSQL Docker 컨테이너 실행 성공
- [ ] Spring Boot 프로젝트 생성
- [ ] Flyway 마이그레이션 4개 파일 복사
- [ ] application.yml 설정 완료
- [ ] Spring Boot 실행 시 Flyway 마이그레이션 성공
- [ ] 샘플 데이터 3개 users 테이블에 존재 확인
- [ ] Git 브랜치 생성 및 push

---

### 🟡 개발자 B - Frontend 초기 설정

#### 1. 개발 환경 준비
```bash
# 1.1 Node.js 18+ 설치 확인
node --version  # 18 이상
npm --version

# 1.2 VS Code 설치

# 1.3 VS Code Extensions 설치
- ESLint
- Prettier
- React Developer Tools
```

#### 2. React 프로젝트 생성
```bash
# Vite로 React + TypeScript 프로젝트 생성
npm create vite@latest frontend -- --template react-ts

cd frontend
npm install
```

#### 3. MUI 및 필수 라이브러리 설치
```bash
# Material-UI (MUI) v5+
npm install @mui/material @emotion/react @emotion/styled

# Material Icons
npm install @mui/icons-material

# React Router
npm install react-router-dom

# Axios (HTTP Client)
npm install axios

# Recharts (차트 라이브러리)
npm install recharts

# JWT Decode
npm install jwt-decode

# TypeScript 타입 정의
npm install -D @types/react-router-dom
```

#### 4. MUI Theme 설정
```typescript
// src/theme/theme.ts
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
    error: {
      main: '#BA1A1A',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 12, // M3 rounded corners
  },
});
```

#### 5. App.tsx에 Theme Provider 적용
```typescript
// src/App.tsx
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        <h1>URL Shortener - MUI Theme Loaded</h1>
      </div>
    </ThemeProvider>
  );
}

export default App;
```

#### 6. 개발 서버 실행
```bash
npm run dev
# http://localhost:5173 접속하여 확인
```

#### 7. API 문서 리뷰
```bash
# Backend 개발자 A가 제공할 Swagger API 문서 리뷰
# http://localhost:8080/swagger-ui.html (Day 2 이후 사용 가능)

# 현재는 aidlc-docs에서 REST API 엔드포인트 리뷰
# aidlc-docs/PROJECT-SUMMARY.md 참고
```

#### 8. Mock API 서비스 준비
```typescript
// src/services/mockApiService.ts
export const mockUrls = [
  {
    id: 1,
    shortCode: 'abc123',
    originalUrl: 'https://www.google.com',
    createdAt: '2026-05-01T10:00:00Z',
    expiresAt: '2026-12-31T23:59:59Z',
    clickCount: 150,
  },
  // 더 많은 Mock 데이터...
];

export const getMockUrls = () => {
  return Promise.resolve(mockUrls);
};
```

#### 9. Git 브랜치 생성 및 커밋
```bash
# main 브랜치에서 dev 브랜치 생성
git checkout -b dev

# Frontend 초기 설정 커밋
git add frontend/
git commit -m "feat: initialize React + TypeScript + MUI project"

# feature 브랜치 생성
git checkout -b feature/frontend-setup
git push -u origin feature/frontend-setup
```

#### ✅ Day 1 완료 체크리스트 (개발자 B)
- [ ] Node.js 18+ 설치 확인
- [ ] React + TypeScript 프로젝트 생성 (Vite)
- [ ] MUI 라이브러리 설치 완료
- [ ] MUI Theme 설정 완료
- [ ] 개발 서버 실행 성공 (http://localhost:5173)
- [ ] API 엔드포인트 문서 리뷰 완료
- [ ] Mock API 서비스 준비
- [ ] Git 브랜치 생성 및 push

---

## 📋 Day 2-4: Backend Core 개발 (개발자 A)

### 작업 범위: U-001 (Backend Core)

#### Day 2: Entity 및 Repository 구현

**1. JPA Entity 클래스 작성**
```bash
backend/src/main/java/com/urlshortener/entity/
├── User.java
├── Url.java
└── ClickLog.java
```

**샘플: User.java**
```java
@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    private String provider;

    @Column(name = "provider_id")
    private String providerId;

    private String name;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

**2. Repository 인터페이스 작성**
```bash
backend/src/main/java/com/urlshortener/repository/
├── UserRepository.java
├── UrlRepository.java
└── ClickLogRepository.java
```

**샘플: UrlRepository.java**
```java
public interface UrlRepository extends JpaRepository<Url, Long> {
    Optional<Url> findByShortCode(String shortCode);
    List<Url> findByUserId(Long userId);
}
```

**3. 단위 테스트 작성**
```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
class UrlRepositoryTest {
    @Autowired
    private UrlRepository urlRepository;

    @Test
    void testFindByShortCode() {
        Url url = urlRepository.findByShortCode("abc123").orElseThrow();
        assertThat(url.getOriginalUrl()).isEqualTo("https://www.google.com");
    }
}
```

**✅ Day 2 완료 체크리스트**:
- [ ] User, Url, ClickLog Entity 작성
- [ ] UserRepository, UrlRepository, ClickLogRepository 작성
- [ ] Repository 단위 테스트 3개 작성 및 통과
- [ ] Git 커밋 및 push

---

#### Day 3: Service Layer 구현

**1. DTO 클래스 작성**
```bash
backend/src/main/java/com/urlshortener/dto/
├── request/
│   ├── UrlCreateRequest.java
│   └── LoginRequest.java
└── response/
    ├── UrlResponse.java
    └── AuthResponse.java
```

**2. Base62EncodingService 구현**
```java
@Service
public class Base62EncodingService {
    private static final String CHARSET =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    public String encode(long id) {
        StringBuilder sb = new StringBuilder();
        while (id > 0) {
            sb.append(CHARSET.charAt((int) (id % 62)));
            id /= 62;
        }
        return sb.reverse().toString();
    }

    public long decode(String shortCode) {
        long id = 0;
        for (char c : shortCode.toCharArray()) {
            id = id * 62 + CHARSET.indexOf(c);
        }
        return id;
    }
}
```

**3. UrlService 구현**
```java
@Service
@RequiredArgsConstructor
public class UrlService {
    private final UrlRepository urlRepository;
    private final Base62EncodingService base62Service;

    @Transactional
    public UrlResponse createShortUrl(UrlCreateRequest request, Long userId) {
        // URL 검증 및 정규화
        String normalizedUrl = validateAndNormalizeUrl(request.getOriginalUrl());

        // URL 저장
        Url url = new Url();
        url.setOriginalUrl(normalizedUrl);
        url.setUserId(userId);
        url.setExpiresAt(request.getExpiresAt());
        Url savedUrl = urlRepository.save(url);

        // Base62 인코딩
        String shortCode = base62Service.encode(savedUrl.getId());
        savedUrl.setShortCode(shortCode);
        urlRepository.save(savedUrl);

        return UrlResponse.from(savedUrl);
    }
}
```

**✅ Day 3 완료 체크리스트**:
- [ ] DTO 클래스 5개 작성
- [ ] Base62EncodingService 구현 및 테스트
- [ ] UrlService 구현 (createShortUrl, getOriginalUrl)
- [ ] ClickTrackingService 구현 (비동기)
- [ ] Service 단위 테스트 작성 및 통과
- [ ] Git 커밋 및 push

---

#### Day 4: Controller 및 비동기 처리

**1. AsyncConfig 설정**
```java
@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.initialize();
        return executor;
    }
}
```

**2. UrlController 구현**
```java
@RestController
@RequestMapping("/api/urls")
@RequiredArgsConstructor
public class UrlController {
    private final UrlService urlService;

    @PostMapping
    public ResponseEntity<UrlResponse> createUrl(@RequestBody UrlCreateRequest request) {
        // 익명 사용자도 생성 가능 (userId = null)
        UrlResponse response = urlService.createShortUrl(request, null);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> redirect(@PathVariable String shortCode, HttpServletRequest request) {
        String originalUrl = urlService.getOriginalUrl(shortCode);
        // 비동기 클릭 추적
        clickTrackingService.trackClickAsync(shortCode, request);
        return ResponseEntity.status(HttpStatus.FOUND)
            .location(URI.create(originalUrl))
            .build();
    }
}
```

**✅ Day 4 완료 체크리스트**:
- [ ] AsyncConfig 설정
- [ ] UrlController 구현 (4개 엔드포인트)
- [ ] 리다이렉트 테스트 (200ms 이내 확인)
- [ ] Postman으로 API 테스트
- [ ] Git 커밋 및 push
- [ ] **dev 브랜치로 PR 생성 및 merge**

---

## 📋 Day 2-4: Frontend Mock UI 개발 (개발자 B)

### 작업 범위: MUI Theme + HomePage Mock

#### Day 2: Layout 및 공통 컴포넌트

**1. AppBar 컴포넌트**
```typescript
// src/components/common/AppBar.tsx
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

export function CustomAppBar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          URL Shortener
        </Typography>
        <Button color="inherit">Login</Button>
      </Toolbar>
    </AppBar>
  );
}
```

**2. LoadingSpinner 컴포넌트**
```typescript
// src/components/common/LoadingSpinner.tsx
import { CircularProgress, Box } from '@mui/material';

export function LoadingSpinner() {
  return (
    <Box display="flex" justifyContent="center" padding={4}>
      <CircularProgress />
    </Box>
  );
}
```

**✅ Day 2 완료 체크리스트**:
- [ ] CustomAppBar 컴포넌트
- [ ] LoadingSpinner 컴포넌트
- [ ] ErrorMessage 컴포넌트 (MUI Alert)
- [ ] Layout 구조 설정
- [ ] Git 커밋 및 push

---

#### Day 3-4: HomePage + UrlForm Mock

**1. UrlForm 컴포넌트**
```typescript
// src/components/url/UrlForm.tsx
import { TextField, Button, Box } from '@mui/material';
import { useState } from 'react';

export function UrlForm() {
  const [url, setUrl] = useState('');

  const handleSubmit = () => {
    // Mock: 나중에 Real API로 대체
    console.log('Creating short URL for:', url);
  };

  return (
    <Box component="form" sx={{ mt: 3 }}>
      <TextField
        fullWidth
        label="Enter your long URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        variant="filled"
      />
      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleSubmit}
      >
        Shorten URL
      </Button>
    </Box>
  );
}
```

**2. HomePage 구현**
```typescript
// src/pages/HomePage.tsx
import { Container, Typography } from '@mui/material';
import { UrlForm } from '../components/url/UrlForm';

export function HomePage() {
  return (
    <Container maxWidth="md">
      <Typography variant="h3" align="center" sx={{ mt: 4, mb: 2 }}>
        Shorten Your URL
      </Typography>
      <UrlForm />
    </Container>
  );
}
```

**✅ Day 3-4 완료 체크리스트**:
- [ ] UrlForm 컴포넌트 (MUI TextField + Button)
- [ ] HomePage 구현
- [ ] React Router 설정
- [ ] Mock 데이터로 UI 테스트
- [ ] Git 커밋 및 push
- [ ] **dev 브랜치로 PR 생성 및 merge**

---

## 🔄 Day 5 이후 일정

Day 5-15는 다음과 같이 진행됩니다:

- **Day 5-6**: Backend Analytics (A) / Auth 페이지 (B)
- **Day 7-9**: Backend Auth (A) / Charts 구현 (B)
- **Day 10-11**: 통합 테스트 (A+B)
- **Day 12-13**: Infrastructure (A+B 협업)
- **Day 14-15**: E2E 테스트 및 버그 수정 (A+B)

---

## 📞 커뮤니케이션

### Daily Sync (매일 30분)
- 오늘 완료한 작업
- 내일 계획
- 블로커 (막힌 부분)

### API 계약 정의
- REST API 엔드포인트 합의
- Request/Response DTO 구조 확인
- Swagger 문서 공유 (Day 2부터)

---

**다음 상세 단계가 필요하시면 말씀해주세요!**
