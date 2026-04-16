# URL 단축 서비스 요구사항 명세서

## 프로젝트 개요

### 의도 분석
- **사용자 요청**: 긴 URL을 짧게 줄여주고 클릭 통계를 제공하는 학습용 URL 단축 서비스 개발
- **요청 유형**: 신규 프로젝트 (Greenfield)
- **범위 추정**: 다중 컴포넌트 (React Frontend + Spring Boot Backend + PostgreSQL)
- **복잡도 추정**: 중간 복잡도 (비즈니스 로직은 간단하나, 확장 포인트가 많은 학습용 프로젝트)

### 프로젝트 목적
학습용 토이 프로젝트로서, Spring Boot, React, Docker를 활용한 풀스택 개발 경험 습득

---

## 기능 요구사항 (Functional Requirements)

### FR-1: URL 단축 기능
**우선순위**: 필수
**설명**: 사용자가 긴 URL을 입력하면 짧은 코드로 변환하여 단축 URL 생성

**상세 요구사항**:
- 원본 URL 입력 및 검증
  - URL 형식 검증
  - HTTP/HTTPS 프로토콜 확인
- Base62 인코딩을 사용한 짧은 코드 생성
  - 순차 ID 기반 인코딩 방식 사용 (예: ID 12345 → "dnh")
  - 생성된 코드는 URL-safe한 문자만 사용 (a-z, A-Z, 0-9)
- 단축 URL 형식: `https://short.ly/{short_code}`
- 동일한 원본 URL에 대해 새로운 단축 URL 생성 가능 (중복 허용)

**인수 조건**:
- 유효한 URL을 입력하면 단축 코드가 생성됨
- 생성된 단축 URL이 데이터베이스에 저장됨
- 잘못된 URL 형식은 에러 메시지와 함께 거부됨

---

### FR-2: URL 리다이렉트 기능
**우선순위**: 필수
**설명**: 단축 URL 접근 시 원본 URL로 리다이렉트

**상세 요구사항**:
- 단축 코드를 통해 원본 URL 조회
- HTTP 302 Found 응답으로 리다이렉트
- 존재하지 않는 코드 접근 시 404 에러
- 만료된 URL 접근 시 간단한 에러 페이지 표시 ("이 링크는 만료되었습니다")

**인수 조건**:
- 유효한 단축 URL 접근 시 원본 URL로 즉시 리다이렉트됨
- 리다이렉트 응답 시간이 200ms 이하
- 만료된 URL은 에러 페이지 표시

---

### FR-3: 클릭 추적 기능
**우선순위**: 필수
**설명**: 단축 URL 클릭 시 통계 정보 수집

**상세 요구사항**:
- 리다이렉트 발생 시 클릭 정보 비동기 저장 (Spring `@Async` 사용)
- 수집 정보:
  - IP 주소
  - User-Agent (브라우저 정보)
  - 타임스탬프 (클릭 시간)
  - Referer (유입 경로)
  - 국가 정보 (GeoLite2를 사용한 IP 기반 국가 감지)
- 클릭 로그는 응답 속도에 영향을 주지 않도록 비동기 처리

**인수 조건**:
- 클릭 발생 시 클릭 로그가 데이터베이스에 저장됨
- 클릭 로그 저장이 리다이렉트 응답 시간에 영향을 주지 않음
- IP 주소로부터 국가 정보가 정확히 추출됨

---

### FR-4: 통계 대시보드
**우선순위**: 필수
**설명**: 단축 URL에 대한 클릭 통계를 시각화하여 제공

**상세 요구사항**:
- React 기반 대시보드 UI
- 제공 차트:
  - 일별 클릭수 추이 (LineChart)
  - 국가별 클릭 분포 (PieChart)
  - 브라우저별 클릭 분포 (BarChart)
- 사용 라이브러리:
  - 차트: Recharts
  - HTTP 요청: Axios + React Query
  - 스타일: Tailwind CSS

**인수 조건**:
- 대시보드에서 실시간 클릭 통계 확인 가능
- 차트가 반응형으로 동작
- 데이터 로딩 중 로딩 인디케이터 표시

---

### FR-5: 회원 기능
**우선순위**: 필수
**설명**: 사용자 등록 및 로그인, 내 URL 관리

**상세 요구사항**:
- 사용자 등록 (이메일, 비밀번호)
- JWT 기반 인증
  - 기본 JWT 인증 (이메일/비밀번호)
  - 소셜 로그인 (Google, GitHub 등)
- 로그인 사용자만 URL 생성 가능
- 내 URL 목록 조회
- URL별 클릭 통계 조회

**인수 조건**:
- 사용자 등록 및 로그인 성공
- JWT 토큰 발급 및 검증
- 소셜 로그인을 통한 인증 성공
- 로그인 후 내 URL 목록 확인 가능

---

### FR-6: URL 만료 기능
**우선순위**: 선택
**설명**: 특정 날짜 이후 링크 비활성화

**상세 요구사항**:
- URL 생성 시 만료일 설정 가능 (선택 사항)
- `@Scheduled`를 사용한 주기적 만료 URL 비활성화
- 만료된 URL 접근 시 간단한 에러 페이지 표시

**인수 조건**:
- 만료일이 설정된 URL은 만료일 이후 접근 불가
- 만료된 URL 접근 시 에러 페이지 표시
- 스케줄러가 주기적으로 만료 URL을 비활성화

---

## 비기능 요구사항 (Non-Functional Requirements)

### NFR-1: 성능
- 리다이렉트 응답 시간: 200ms 이하
- 클릭 로그 저장은 비동기 처리로 응답 속도에 영향 없음
- 대시보드 차트 렌더링: 1초 이내

### NFR-2: 확장성
- Docker Compose를 사용한 컨테이너화
- 서비스 간 느슨한 결합 (Frontend, Backend, Database)

### NFR-3: 유지보수성
- Flyway를 사용한 데이터베이스 마이그레이션 관리
- Swagger/OpenAPI를 사용한 API 문서 자동 생성
- 단위 테스트 + API 통합 테스트

### NFR-4: 보안
- JWT 기반 인증
- 비밀번호 암호화 (BCrypt)
- SQL Injection 방지 (JPA Parameterized Query)
- 보안 확장 규칙: 생략 (학습 프로젝트)

### NFR-5: 사용성
- 직관적인 React UI
- 반응형 디자인 (Tailwind CSS)
- 명확한 에러 메시지

### NFR-6: 배포
- 로컬 개발 환경 (Docker Compose)
- 컨테이너 실행 순서 제어 (`depends_on`)
- 환경 변수를 통한 설정 관리

---

## 기술 스택

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Database**: PostgreSQL 15
- **ORM**: Spring Data JPA
- **Migration**: Flyway
- **Authentication**: Spring Security + JWT
- **API Documentation**: Swagger/OpenAPI (springdoc-openapi)
- **Async Processing**: Spring `@Async`
- **Scheduling**: Spring `@Scheduled`
- **Geolocation**: GeoLite2 (무료 IP 위치정보 DB)

### Frontend
- **Framework**: React 18
- **Chart Library**: Recharts
- **HTTP Client**: Axios + React Query
- **Styling**: Tailwind CSS
- **Build Tool**: Vite 또는 Create React App

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL (Docker 컨테이너)
- **Web Server**: Nginx (React 빌드 결과 서빙)

---

## 데이터베이스 설계

### 테이블 구조

#### users (사용자)
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    provider VARCHAR(50),  -- 'local', 'google', 'github'
    provider_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### urls (단축 URL)
```sql
CREATE TABLE urls (
    id BIGSERIAL PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    user_id BIGINT REFERENCES users(id),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_short_code ON urls(short_code);
CREATE INDEX idx_user_id ON urls(user_id);
```

#### click_logs (클릭 로그)
```sql
CREATE TABLE click_logs (
    id BIGSERIAL PRIMARY KEY,
    url_id BIGINT REFERENCES urls(id) ON DELETE CASCADE,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referer TEXT,
    country VARCHAR(2)
);

CREATE INDEX idx_url_id ON click_logs(url_id);
CREATE INDEX idx_clicked_at ON click_logs(clicked_at);
```

---

## 아키텍처

### 시스템 아키텍처
```
[React Frontend] → [Spring Boot API] → [PostgreSQL Database]
                         ↓
                  클릭 발생 시 비동기 처리
                  (Spring @Async)
                         ↓
                  [Click Logs 저장]
```

### 주요 흐름

**URL 단축 흐름**:
1. 사용자가 원본 URL 입력
2. Spring Boot가 URL 검증
3. Base62 인코딩으로 단축 코드 생성
4. PostgreSQL에 저장
5. 단축 URL 반환

**리다이렉트 및 클릭 추적 흐름**:
1. 사용자가 `short.ly/abc123` 접근
2. Spring Boot가 DB에서 원본 URL 조회
3. 302 Redirect 응답 → 사용자는 원본 URL로 이동
4. 동시에 클릭 정보를 비동기로 PostgreSQL에 저장 (응답 속도 영향 없음)

**통계 대시보드 흐름**:
1. React에서 통계 API 호출
2. Spring Boot가 집계 쿼리 실행 (GROUP BY, COUNT)
3. 집계 결과를 DTO로 반환
4. React가 Recharts로 시각화

---

## 학습 포인트

### Backend (Spring Boot)
- Base62 인코딩 알고리즘 구현
- `@Async` - 비동기 처리
- `@Scheduled` - 스케줄러
- Spring Security + JWT 인증
- 소셜 로그인 통합 (OAuth2)
- JPA Projections - 집계 쿼리 결과를 DTO로 받기
- Flyway 마이그레이션

### Frontend (React)
- React Query를 사용한 데이터 페칭
- Recharts를 사용한 차트 시각화
- Tailwind CSS를 사용한 스타일링
- JWT 토큰 관리

### Infrastructure (Docker)
- Docker Compose 멀티 컨테이너 구성
- `depends_on` - 컨테이너 실행 순서 제어
- `environment` - 환경 변수 관리
- `volumes` - 데이터 영구 저장
- 멀티스테이지 빌드 - React 빌드 최적화

---

## 테스트 전략

### 단위 테스트 (Unit Tests)
- Base62 인코딩 로직 테스트
- URL 검증 로직 테스트
- JWT 토큰 생성/검증 테스트

### 통합 테스트 (Integration Tests)
- URL 생성 API 테스트
- 리다이렉트 API 테스트
- 통계 API 테스트
- 인증 API 테스트

### 테스트 도구
- JUnit 5
- MockMvc
- Testcontainers (PostgreSQL 테스트 컨테이너)

---

## API 문서화

### Swagger/OpenAPI
- springdoc-openapi를 사용한 자동 API 문서 생성
- Swagger UI를 통한 API 테스트
- API 엔드포인트:
  - `POST /api/urls` - URL 단축
  - `GET /{shortCode}` - 리다이렉트
  - `GET /api/urls` - 내 URL 목록
  - `GET /api/urls/{id}/stats` - URL 통계
  - `POST /api/auth/register` - 회원 가입
  - `POST /api/auth/login` - 로그인
  - `POST /api/auth/oauth2/{provider}` - 소셜 로그인

---

## 사용량 제한 (Rate Limiting)

**결정**: 사용량 제한 불필요 (학습 프로젝트)

학습 프로젝트이므로 Rate Limiting은 구현하지 않음. 향후 확장 포인트로 남겨둠.

---

## 확장 규칙 적용 여부

### 보안 확장 규칙
**적용**: 아니오 (생략)
**이유**: 학습 초기 단계의 프로토타입 프로젝트

### 속성 기반 테스트 (PBT) 확장
**적용**: 아니오 (생략)
**이유**: 학습 초기 단계, CRUD 중심 프로젝트

---

## 개발 일정 (2주, 5시간/일 기준)

| 기간 | 할 일 |
|------|------|
| 1~2일 | 프로젝트 세팅, Docker Compose 기본 구성, DB 설계 |
| 3~4일 | URL 단축 API + 리다이렉트 구현 |
| 5~6일 | JWT 인증, 소셜 로그인, 회원 기능 |
| 7~8일 | 클릭 로그 저장 (@Async), 통계 집계 API |
| 9~10일 | React 대시보드 UI + 차트 연동 |
| 11~12일 | 만료일 기능, 예외처리 보강 |
| 13~14일 | 배포 최적화, 버그 수정, README 작성 |

---

## 역할 분담 제안

- **Backend 담당**: Spring Boot API, Docker 세팅, DB 설계
- **Frontend 담당**: React UI, 차트 시각화, API 연동

**공통 작업**: DB 설계 및 API 스펙 문서 (Swagger) 사전 협의
