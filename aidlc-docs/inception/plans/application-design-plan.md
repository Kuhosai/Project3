# Application Design Plan

## Overview
URL 단축 서비스의 애플리케이션 설계 계획입니다. 컴포넌트 식별, 메서드 정의, 서비스 계층 설계, 의존성 관계를 정의합니다.

## Design Scope
- **Backend**: Spring Boot REST API 컴포넌트
- **Frontend**: React SPA 컴포넌트
- **Database**: PostgreSQL 스키마
- **Infrastructure**: Docker Compose 설정

---

## Design Questions

### 질문 1: 백엔드 컴포넌트 구조 - 레이어 분리 전략
Spring Boot 백엔드의 컴포넌트를 어떻게 구성할까요?

A) 전통적인 3-tier 구조 (Controller - Service - Repository) **← 추천**
B) Hexagonal Architecture (Port-Adapter 패턴)
C) CQRS (Command-Query Responsibility Segregation)
D) 기타 (아래 [Answer]: 태그 뒤에 설명해주세요)

[Answer]: A

### 질문 2: 도메인 모델 vs DTO 전략
API 요청/응답과 도메인 엔티티를 어떻게 분리할까요?

A) DTO를 별도로 정의하여 엔티티와 분리 (권장 - 캡슐화 유지) **← 추천**
B) 엔티티를 직접 노출 (단순하지만 캡슐화 약함)
C) 기타 (아래 [Answer]: 태그 뒤에 설명해주세요)

[Answer]: A 

### 질문 3: URL 단축 코드 생성 - Base62 인코딩 위치
Base62 인코딩 로직을 어디에 배치할까요?

A) Service 계층에 배치 (비즈니스 로직의 일부로 취급) **← 추천**
B) Utility/Helper 클래스로 분리 (재사용성 강조)
C) Repository 계층에 배치 (데이터 저장 시점에 생성)
D) 기타 (아래 [Answer]: 태그 뒤에 설명해주세요)

[Answer]: A

### 질문 4: 클릭 추적 - 비동기 처리 전략
클릭 로그 저장을 위한 비동기 처리를 어떻게 구현할까요?

A) Spring @Async + ThreadPoolTaskExecutor (간단하고 학습용으로 적합) **← 추천**
B) Spring ApplicationEventPublisher + @EventListener (이벤트 기반)
C) 메시지 큐 (Kafka, RabbitMQ 등 - 오버엔지니어링 가능)
D) 기타 (아래 [Answer]: 태그 뒤에 설명해주세요)

[Answer]:A

### 질문 5: 인증/인가 - Spring Security 구성
JWT 인증과 OAuth2 소셜 로그인을 어떻게 구성할까요?

A) Spring Security + JWT Filter + OAuth2 Client (표준 방식) **← 추천**
B) 커스텀 필터 체인 (학습 목적으로 직접 구현)
C) 기타 (아래 [Answer]: 태그 뒤에 설명해주세요)

[Answer]:A

### 질문 6: 프론트엔드 컴포넌트 구조 - 상태 관리
React 애플리케이션의 상태 관리를 어떻게 할까요?

A) React Context API + useState/useReducer (간단한 앱에 적합) **← 추천**
B) Redux Toolkit (복잡한 상태 관리)
C) Zustand (가벼운 상태 관리)
D) React Query만 사용 (서버 상태만 관리)
E) 기타 (아래 [Answer]: 태그 뒤에 설명해주세요)

[Answer]: A

### 질문 7: 프론트엔드 - 라우팅 구조
React 라우팅을 어떻게 구성할까요?

A) React Router v6 (표준) **← 추천**
B) Next.js (SSR/SSG 지원 - 오버엔지니어링 가능)
C) 기타 (아래 [Answer]: 태그 뒤에 설명해주세요)

[Answer]: A

### 질문 8: API 통신 - 에러 핸들링 전략
프론트엔드-백엔드 API 통신의 에러 핸들링을 어떻게 할까요?

A) Axios Interceptor + React Query onError (중앙 집중식) **← 추천**
B) 각 API 호출마다 try-catch (분산 방식)
C) 기타 (아래 [Answer]: 태그 뒤에 설명해주세요)

[Answer]: a

### 질문 9: 데이터베이스 스키마 - 테이블 관계 설계
users, urls, click_logs 테이블 관계를 어떻게 설계할까요?

A) users 1:N urls, urls 1:N click_logs (정규화된 구조) **← 추천**
B) 비정규화하여 성능 최적화 (클릭 로그에 URL 정보 중복 저장)
C) 기타 (아래 [Answer]: 태그 뒤에 설명해주세요)

[Answer]:A

### 질문 10: JPA vs QueryDSL - 통계 쿼리 방식
복잡한 통계 쿼리(일별 클릭수, 국가별 분포 등)를 어떻게 구현할까요?

A) JPA @Query + JPQL (간단한 쿼리)
B) JPA Native Query (복잡한 집계)
C) Spring Data JPA Projection (DTO 직접 매핑) **← 추천**
D) QueryDSL (타입 안전한 쿼리)
E) 기타 (아래 [Answer]: 태그 뒤에 설명해주세요)

[Answer]:C

---

## Design Execution Plan

### Phase 1: 컴포넌트 식별 및 정의
- [ ] 백엔드 컴포넌트 식별
  - [ ] Controller 계층 컴포넌트
  - [ ] Service 계층 컴포넌트
  - [ ] Repository 계층 컴포넌트
  - [ ] Domain Entity 컴포넌트
  - [ ] DTO 컴포넌트
- [ ] 프론트엔드 컴포넌트 식별
  - [ ] 페이지 컴포넌트
  - [ ] 공통 UI 컴포넌트
  - [ ] 차트 컴포넌트
  - [ ] 레이아웃 컴포넌트
- [ ] components.md 생성

### Phase 2: 컴포넌트 메서드 정의
- [ ] 백엔드 컴포넌트 메서드 시그니처 정의
  - [ ] Controller 엔드포인트 메서드
  - [ ] Service 비즈니스 로직 메서드
  - [ ] Repository 데이터 접근 메서드
- [ ] 프론트엔드 컴포넌트 메서드 정의
  - [ ] 이벤트 핸들러
  - [ ] API 호출 함수
  - [ ] 유틸리티 함수
- [ ] component-methods.md 생성

### Phase 3: 서비스 계층 설계
- [ ] 백엔드 서비스 정의
  - [ ] UrlService (URL 생성, 조회, 리다이렉트)
  - [ ] ClickTrackingService (클릭 로그 비동기 저장)
  - [ ] AnalyticsService (통계 집계 및 조회)
  - [ ] AuthService (인증 및 사용자 관리)
- [ ] 프론트엔드 서비스 정의
  - [ ] API Service (Axios 기반 HTTP 클라이언트)
  - [ ] Auth Service (토큰 관리)
- [ ] services.md 생성

### Phase 4: 컴포넌트 의존성 분석
- [ ] 백엔드 의존성 매트릭스 생성
  - [ ] Controller → Service 의존성
  - [ ] Service → Repository 의존성
  - [ ] Service → Service 의존성
- [ ] 프론트엔드 의존성 매트릭스 생성
  - [ ] 페이지 → API Service 의존성
  - [ ] 컴포넌트 → 공통 컴포넌트 의존성
- [ ] 통신 패턴 정의
  - [ ] REST API 엔드포인트
  - [ ] WebSocket (필요 시)
- [ ] component-dependency.md 생성

### Phase 5: 통합 문서 생성
- [ ] application-design.md 생성 (위 4개 문서 통합)

### Phase 6: 설계 검증
- [ ] 모든 사용자 스토리가 컴포넌트로 매핑되는지 확인
- [ ] 컴포넌트 간 순환 의존성 여부 확인
- [ ] 단일 책임 원칙 준수 여부 확인

---

## Artifacts to Generate

1. **components.md**
   - 모든 백엔드/프론트엔드 컴포넌트 정의
   - 각 컴포넌트의 책임과 역할

2. **component-methods.md**
   - 각 컴포넌트의 메서드 시그니처
   - 입력/출력 타입
   - 메서드 목적 (상세 비즈니스 로직은 Functional Design 단계에서)

3. **services.md**
   - 서비스 계층 정의
   - 서비스 간 상호작용 및 오케스트레이션

4. **component-dependency.md**
   - 컴포넌트 간 의존성 매트릭스
   - 통신 패턴 및 데이터 흐름

5. **application-design.md**
   - 위 4개 문서를 통합한 전체 애플리케이션 설계 문서

---

**답변 방법**:
1. 각 [Answer]: 태그 뒤에 선택한 답변 (A, B, C, D, E)을 입력하세요
2. "기타"를 선택한 경우, [Answer]: 태그 뒤에 원하는 내용을 설명해주세요
3. 완료 후 **"완료"** 또는 **"done"**이라고 답장해주세요
