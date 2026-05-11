# URL 단축 서비스 학습 정리 (Notion용)

**Notion 페이지**: https://www.notion.so/URL-35c45c86c1cd8071bcf2f9b59e76925e

---

## 📚 학습 개요

### 프로젝트 정보
- **프로젝트명**: URL 단축 서비스 (URL Shortener)
- **목적**: 학습용 토이 프로젝트
- **팀 구성**: 2인 개발팀
- **기간**: 2주 (15일)
- **프로젝트 유형**: Greenfield (신규 프로젝트)

### 개발 방법론
- **AI-DLC (AI-Driven Development Life Cycle)** 적용
- **Phase**: INCEPTION → CONSTRUCTION → OPERATIONS
- **현재 진행**: INCEPTION 완료, CONSTRUCTION 시작

---

## 🎯 학습 목표

### 1. Backend 학습
- ✅ Spring Boot 3.x 프레임워크
- ✅ Spring Data JPA / Hibernate ORM
- ✅ Spring Security + JWT 인증
- ✅ OAuth2 소셜 로그인 (Google, GitHub)
- ✅ Spring @Async 비동기 처리
- ✅ PostgreSQL 데이터베이스 설계
- ✅ Flyway 데이터베이스 마이그레이션
- ✅ RESTful API 설계

### 2. Frontend 학습
- ✅ React 18.x
- ✅ TypeScript
- ✅ Material Design 3 (MUI v5+)
- ✅ React Router 6.x
- ✅ React Context API
- ✅ Axios HTTP Client
- ✅ Recharts 데이터 시각화

### 3. Infrastructure 학습
- ✅ Docker & Docker Compose
- ✅ Multi-container 환경 구성
- ✅ Nginx 리버스 프록시

### 4. 소프트웨어 설계 학습
- ✅ 3-tier 아키텍처 설계
- ✅ Database 정규화 (3NF)
- ✅ RESTful API 설계 원칙
- ✅ User Story 작성
- ✅ Unit of Work 분해

---

## 📖 주요 학습 내용

### 1️⃣ 요구사항 분석 (Requirements Analysis)

**학습한 것**:
- 기능적 요구사항 vs 비기능적 요구사항 구분
- 사용자 페르소나 정의
- 요구사항 우선순위 (Must Have, Should Have, Nice to Have)

**핵심 요구사항**:
1. URL 단축 기능 (익명/등록 사용자)
2. 단축 URL 리다이렉트 (200ms 이내)
3. 클릭 추적 및 통계
4. 회원 가입/로그인 (이메일, OAuth2)
5. 통계 대시보드 (일별, 국가별, 브라우저별)

**문서**: [requirements.md](aidlc-docs/inception/requirements/requirements.md)

---

### 2️⃣ User Stories 작성

**학습한 것**:
- User Story 작성 형식: "As a {역할}, I want to {기능}, So that {목적}"
- INVEST 원칙 (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- Acceptance Criteria (인수 조건) 정의

**작성한 User Stories**: 총 13개
- Must Have: 11개
- Should Have: 2개

**예시**:
```
US-001: 익명 URL 생성
As an 익명 사용자
I want to 회원 가입 없이 긴 URL을 짧은 URL로 변환
So that 빠르게 링크를 공유할 수 있다

Acceptance Criteria:
1. URL 검증 규칙 적용 (HTTP/HTTPS만 허용)
2. 단축 코드 자동 생성
3. 복사 가능한 단축 URL 표시
```

**문서**: [stories.md](aidlc-docs/inception/user-stories/stories.md)

---

### 3️⃣ Application Design (애플리케이션 설계)

**학습한 것**:
- 3-tier 아키텍처 (Controller - Service - Repository)
- DTO (Data Transfer Object) 패턴
- Service Layer 책임 분리
- Component 의존성 설계

**설계 결정**:
1. **Backend 구조**: 3-tier (간단하고 학습에 적합)
2. **DTO 전략**: Entity와 DTO 분리 (보안 및 유연성)
3. **Base62 인코딩**: Service 계층에서 처리
4. **비동기 처리**: Spring @Async로 클릭 추적
5. **인증**: JWT + OAuth2

**주요 컴포넌트**:
- **Controllers**: UrlController, AnalyticsController, AuthController
- **Services**: UrlService, ClickTrackingService, AnalyticsService, AuthService, Base62EncodingService
- **Repositories**: UrlRepository, ClickLogRepository, UserRepository
- **Entities**: Url, ClickLog, User

**문서**:
- [application-design.md](aidlc-docs/inception/application-design/application-design.md)
- [components.md](aidlc-docs/inception/application-design/components.md)
- [services.md](aidlc-docs/inception/application-design/services.md)

---

### 4️⃣ Material Design 3 적용

**학습한 것**:
- Material Design 3 (M3) 디자인 시스템 개념
- MUI (Material-UI) v5+ 라이브러리 사용법
- MUI Theme 설정으로 디자인 통일화
- MUI 컴포넌트 매핑

**적용 전략**:
```bash
npm install @mui/material @emotion/react @emotion/styled
```

**Theme 설정**:
```typescript
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6750A4' },  // M3 Primary
    secondary: { main: '#625B71' }, // M3 Secondary
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  shape: {
    borderRadius: 12, // M3 rounded corners
  },
});
```

**MUI 컴포넌트 사용**:
- TextField, Button, Card, AppBar, Drawer
- CircularProgress, Alert, Chip
- Material Icons (`@mui/icons-material`)

---

### 5️⃣ Units of Work 분해

**학습한 것**:
- 시스템을 독립적인 개발 단위(Unit)로 분해
- Unit 간 의존성 분석
- 개발 순서 결정 (Sequential vs Parallel)

**정의한 6개 Units**:

| Unit | 이름 | 책임 | 기간 |
|---|---|---|---|
| U-001 | Backend Core | URL 단축, 리다이렉트, 클릭 추적 | 3일 |
| U-002 | Backend Analytics | 통계 집계 및 조회 | 2일 |
| U-003 | Backend Auth | 인증 및 인가 (JWT, OAuth2) | 3일 |
| U-004 | Frontend UI | React + MUI 사용자 인터페이스 | 4일 |
| U-005 | Database Schema | PostgreSQL 스키마 + Flyway | 1일 |
| U-006 | Infrastructure | Docker Compose 통합 | 2일 |

**개발 순서**: U-005 → U-001 → U-002 → U-003 → U-004 → U-006

**문서**:
- [unit-of-work.md](aidlc-docs/inception/application-design/unit-of-work.md)
- [unit-of-work-dependency.md](aidlc-docs/inception/application-design/unit-of-work-dependency.md)

---

### 6️⃣ Database 설계 (진행 중)

**학습한 것**:
- 데이터베이스 정규화 (3NF)
- Foreign Key로 참조 무결성 유지
- 인덱스 최적화 전략
- CHECK 제약조건 활용

**설계한 3개 테이블**:

#### 1. users 테이블
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),        -- BCrypt 해시
    provider VARCHAR(50),               -- 'local', 'google', 'github'
    provider_id VARCHAR(255),           -- OAuth2 제공자 ID
    name VARCHAR(100),                  -- 사용자 이름
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**학습 포인트**:
- BIGSERIAL로 자동 증가 ID
- BCrypt 비밀번호 해싱
- 소셜 로그인 지원 (provider, provider_id)

#### 2. urls 테이블
```sql
CREATE TABLE urls (
    id BIGSERIAL PRIMARY KEY,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    user_id BIGINT,                     -- NULL이면 익명 사용자
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,               -- NULL이면 영구 URL
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**학습 포인트**:
- Base62 인코딩: ID → short_code
- Foreign Key로 사용자 참조
- ON DELETE CASCADE로 연쇄 삭제

#### 3. click_logs 테이블
```sql
CREATE TABLE click_logs (
    id BIGSERIAL PRIMARY KEY,
    url_id BIGINT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    country_code VARCHAR(2),            -- GeoLite2로 추출
    browser VARCHAR(50),                -- User-Agent 파싱
    os VARCHAR(50),
    device_type VARCHAR(20),            -- 'mobile', 'desktop', 'tablet'
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE
);
```

**학습 포인트**:
- 클릭 통계를 위한 로그 테이블
- GeoLite2로 IP → 국가 코드 변환
- User-Agent 파싱으로 브라우저/OS 추출

**인덱스 전략**:
- 자주 조회되는 컬럼에 인덱스 추가 (short_code, user_id, url_id)
- 복합 인덱스로 쿼리 최적화 (url_id, clicked_at)

**문서**: [database-design-discussion.md](aidlc-docs/construction/u-005-database/database-design-discussion.md)

---

### 7️⃣ REST API 설계

**학습한 것**:
- RESTful API 설계 원칙
- HTTP Method 활용 (GET, POST, PUT, DELETE)
- 인증이 필요한 API vs 공개 API 구분
- JWT Bearer Token 인증

**설계한 API 엔드포인트**: 총 12개

#### URL Management
| Method | Endpoint | 설명 | 인증 필요 |
|---|---|---|---|
| POST | /api/urls | URL 생성 | No (익명 OK) |
| GET | /api/urls | 내 URL 목록 | Yes |
| GET | /api/urls/:id | URL 상세 | Yes |
| GET | /:shortCode | 리다이렉트 | No |

#### Analytics
| Method | Endpoint | 설명 | 인증 필요 |
|---|---|---|---|
| GET | /api/analytics/:urlId/daily | 일별 클릭수 | Yes |
| GET | /api/analytics/:urlId/countries | 국가별 분포 | Yes |
| GET | /api/analytics/:urlId/browsers | 브라우저별 분포 | Yes |

#### Authentication
| Method | Endpoint | 설명 | 인증 필요 |
|---|---|---|---|
| POST | /api/auth/signup | 회원 가입 | No |
| POST | /api/auth/login | 로그인 | No |
| POST | /api/auth/refresh | 토큰 갱신 | Refresh Token |
| GET | /api/auth/oauth2/google | Google 로그인 | No |
| GET | /api/auth/oauth2/github | GitHub 로그인 | No |

**인증 방식**:
```
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

---

### 8️⃣ 비동기 처리 (Spring @Async)

**학습한 것**:
- 동기 vs 비동기 처리 차이
- Spring @Async 어노테이션 사용법
- ThreadPoolTaskExecutor 설정

**적용 사례**: 클릭 추적
```java
@Async
public void trackClickAsync(Long urlId, HttpServletRequest request) {
    // IP 추출
    String ip = request.getRemoteAddr();

    // GeoLite2로 국가 추출
    String country = geoIpService.getCountryCode(ip);

    // User-Agent 파싱
    String browser = userAgentParser.getBrowser(request.getHeader("User-Agent"));

    // 클릭 로그 저장
    clickLogRepository.save(new ClickLog(urlId, ip, country, browser));
}
```

**장점**:
- 리다이렉트 응답 시간에 영향 없음 (200ms 이내 보장)
- 사용자 경험 향상

**Thread Pool 설정**:
- Core Pool Size: 5
- Max Pool Size: 10
- Queue Capacity: 100

---

### 9️⃣ JWT 인증

**학습한 것**:
- JWT (JSON Web Token) 구조 (Header, Payload, Signature)
- Access Token vs Refresh Token
- JWT 생성 및 검증
- Spring Security Filter Chain

**JWT 구조**:
```
Header.Payload.Signature
```

**토큰 종류**:
- **Access Token**: 1시간 (API 호출 시 사용)
- **Refresh Token**: 7일 (Access Token 갱신용)

**발급 흐름**:
1. 사용자 로그인 성공
2. JWT Access Token + Refresh Token 발급
3. 클라이언트가 로컬 스토리지에 저장
4. API 호출 시 `Authorization: Bearer <token>` 헤더 추가

**장점**:
- Stateless 인증 (서버에 세션 저장 불필요)
- 확장성 좋음 (서버 추가 시 세션 공유 불필요)

---

### 🔟 OAuth2 소셜 로그인

**학습한 것**:
- OAuth2 인증 흐름
- Spring Security OAuth2 Client
- Google / GitHub OAuth2 설정

**OAuth2 흐름**:
1. 사용자가 "Google로 로그인" 클릭
2. OAuth2 Provider(Google)로 리다이렉트
3. 사용자가 권한 승인
4. 인증 코드를 백엔드로 콜백
5. 백엔드가 Access Token 요청
6. 사용자 정보 조회 (이메일, 이름)
7. 신규 사용자면 자동 가입, 기존 사용자면 로그인
8. JWT 발급

**장점**:
- 비밀번호 관리 불필요
- 사용자 편의성 향상
- 신뢰할 수 있는 인증

---

### 1️⃣1️⃣ Base62 인코딩

**학습한 것**:
- Base62 인코딩 알고리즘
- 순차 ID → 짧은 코드 변환

**Base62 문자셋**:
```
0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
```

**인코딩 예시**:
| ID | Base62 Short Code |
|---|---|
| 1 | `1` |
| 10 | `a` |
| 61 | `Z` |
| 62 | `10` |
| 1,000,000 | `4c92` |

**알고리즘**:
```java
public String encode(long id) {
    StringBuilder sb = new StringBuilder();
    while (id > 0) {
        sb.append(CHARSET.charAt((int) (id % 62)));
        id /= 62;
    }
    return sb.reverse().toString();
}
```

**장점**:
- URL-safe (특수문자 없음)
- 짧은 코드 생성 가능

---

### 1️⃣2️⃣ 2인 개발팀 협업 전략

**학습한 것**:
- Backend/Frontend 역할 분담
- Git 브랜치 전략
- API 계약 정의

**역할 분담 (추천)**:
- **개발자 A**: Backend 전담 (U-005, U-001, U-002, U-003)
- **개발자 B**: Frontend 전담 (U-004, U-006)

**Git 브랜치 전략**:
```
main (배포 가능)
├── dev (통합 브랜치)
│   ├── feature/backend-database (A)
│   ├── feature/backend-core (A)
│   ├── feature/frontend-setup (B)
│   └── feature/frontend-url-pages (B)
```

**커뮤니케이션**:
- Daily Sync: 매일 진행 상황 공유
- API 계약: Swagger 문서 공유
- 공통 코드 조율: MUI Theme, AuthContext

---

## 🚀 다음 학습 계획

### Phase 1: Database (1일) - 진행 중
- [ ] 데이터베이스 설계 논의 완료
- [ ] Flyway 마이그레이션 스크립트 작성
- [ ] PostgreSQL Docker 컨테이너 실행
- [ ] 스키마 생성 및 검증

### Phase 2: Backend Core (3일)
- [ ] Spring Boot 프로젝트 초기 설정
- [ ] UrlController, UrlService 구현
- [ ] Base62EncodingService 구현
- [ ] ClickTrackingService (비동기) 구현
- [ ] 단위 테스트 작성

### Phase 3: Backend Analytics (2일)
- [ ] AnalyticsController, AnalyticsService 구현
- [ ] Spring Data JPA Projection 쿼리 작성
- [ ] 통계 집계 로직 구현

### Phase 4: Backend Auth (3일)
- [ ] Spring Security 설정
- [ ] JWT 발급/검증 구현
- [ ] OAuth2 소셜 로그인 구현
- [ ] 인증 필터 체인 설정

### Phase 5: Frontend UI (4일)
- [ ] React 프로젝트 초기 설정
- [ ] MUI Theme 설정
- [ ] HomePage, LoginPage, SignupPage 구현
- [ ] MyUrlsPage, UrlDetailPage 구현
- [ ] Recharts 차트 컴포넌트 구현

### Phase 6: Infrastructure (2일)
- [ ] Docker Compose 작성
- [ ] Backend Dockerfile 작성
- [ ] Frontend Dockerfile + Nginx 설정
- [ ] E2E 테스트

---

## 📝 학습 회고

### 잘한 점
1. ✅ **체계적인 설계**: AI-DLC 방법론으로 단계별 설계 완료
2. ✅ **문서화**: 모든 설계 문서 작성 (aidlc-docs/)
3. ✅ **역할 분담**: 2인 개발팀 협업 전략 수립
4. ✅ **기술 스택 선정**: 학습에 적합한 기술 스택 결정

### 개선할 점
1. ⚠️ **실제 코드 작성**: 설계 완료 후 빠르게 구현 시작 필요
2. ⚠️ **테스트 전략**: 단위 테스트, 통합 테스트 계획 구체화 필요
3. ⚠️ **성능 최적화**: 인덱스, 캐싱 전략 심화 학습 필요

### 다음 학습 목표
1. 🎯 Flyway 마이그레이션 스크립트 작성 및 실행
2. 🎯 Spring Boot 프로젝트 초기 설정 및 첫 API 구현
3. 🎯 React + MUI 프로젝트 초기 설정 및 첫 페이지 구현

---

## 📚 참고 자료

### 문서
- [PROJECT-SUMMARY.md](aidlc-docs/PROJECT-SUMMARY.md) - 전체 프로젝트 요약
- [Requirements](aidlc-docs/inception/requirements/requirements.md)
- [User Stories](aidlc-docs/inception/user-stories/stories.md)
- [Application Design](aidlc-docs/inception/application-design/application-design.md)
- [Unit of Work](aidlc-docs/inception/application-design/unit-of-work.md)
- [Database Design Discussion](aidlc-docs/construction/u-005-database/database-design-discussion.md)

### 기술 문서
- [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
- [React 공식 문서](https://react.dev)
- [MUI 공식 문서](https://mui.com)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)

---

**작성일**: 2026-05-06
**상태**: INCEPTION 완료, CONSTRUCTION 진행 중 (U-005 Database)
**다음 단계**: Flyway 마이그레이션 스크립트 작성
