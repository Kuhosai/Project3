# Unit of Work Plan

## Overview
URL 단축 서비스를 구현 가능한 Units로 분해하는 계획입니다.

**참고**: Material Design 3 (M3) 디자인 시스템 적용 요청을 반영합니다.

---

## Decomposition Questions

### 질문 1: Unit 분해 전략 - Monolith vs Microservices
시스템을 어떻게 분해할까요?

A) **Monolith** - 단일 Spring Boot 애플리케이션 + React 프론트엔드 (학습용으로 적합) **← 확정**
B) **Microservices** - URL Service, Analytics Service, Auth Service를 별도 서비스로 분리 (복잡도 높음)
C) **Modular Monolith** - 단일 애플리케이션 내에서 모듈로 분리 (중간)

[Answer]: A

### 질문 2: Frontend Unit 분해 - Single vs Multiple
프론트엔드를 어떻게 분해할까요?

A) **Single Frontend Unit** - 하나의 React 앱 (간단) **← 확정**
B) **Multiple Frontend Units** - 기능별로 별도 React 앱 (Micro Frontend)

[Answer]: A

### 질문 3: Material Design 3 적용 범위
Material Design 3 (M3)를 어떻게 적용할까요?

A) **MUI (Material-UI) v5+** 라이브러리 사용 (M3 컴포넌트 제공) **← 확정**
   - 패키지: @mui/material, @emotion/react, @emotion/styled
   - 디자인 시스템 통일화: MUI 테마로 색상, 타이포그래피, 컴포넌트 스타일 일관성 유지
B) **Tailwind CSS + Custom M3 Components** (직접 구현)
C) **M3 Design Token만** 적용 (색상, 타이포그래피만)

[Answer]: A

### 질문 4: Database Migration Unit
데이터베이스 마이그레이션을 어떻게 관리할까요?

A) **Backend Unit에 포함** - Flyway 마이그레이션을 Backend 코드와 함께 관리 **← 확정**
B) **Separate Database Unit** - 별도 Unit으로 분리

[Answer]: A

### 질문 5: Infrastructure Unit 분해
Docker Compose 인프라를 어떻게 분해할까요?

A) **Single Infrastructure Unit** - 모든 서비스(db, backend, frontend)를 하나의 docker-compose.yml로 관리 **← 확정**
B) **Multiple Infrastructure Units** - 서비스별로 별도 docker-compose 파일

[Answer]: A

### 질문 6: Unit 간 의존성 관리
Unit 간 의존성을 어떻게 관리할까요?

A) **Sequential Development** - Backend → Frontend → Infrastructure 순서로 개발 **← 확정**
B) **Parallel Development** - 독립적으로 병렬 개발 후 통합

[Answer]: A

### 질문 7: Story-to-Unit Mapping 전략
13개 User Stories를 Unit에 어떻게 매핑할까요?

A) **기능별 그룹핑** - URL Management, Analytics, Auth 등 기능별로 Backend 모듈 분리 **← 확정**
B) **수직 분할** - 각 Story를 독립적인 Unit으로 (너무 세분화됨)

[Answer]: A

---

## Unit of Work Generation Plan

### Phase 1: Unit 분해 및 정의
- [x] Requirements, User Stories, Application Design 분석
- [x] Unit 경계 식별
- [x] 각 Unit의 책임 및 범위 정의
- [x] Material Design 3 적용 방안 통합
- [x] unit-of-work.md 생성

### Phase 2: Unit 의존성 매트릭스
- [x] Unit 간 의존성 분석
- [x] 개발 순서 결정
- [x] 통합 포인트 식별
- [x] unit-of-work-dependency.md 생성

### Phase 3: Story-to-Unit Mapping
- [x] 13개 User Stories를 Unit에 매핑
- [x] 각 Story가 속한 Unit 명시
- [x] Coverage 검증 (모든 Story가 Unit에 할당되었는지)
- [x] unit-of-work-story-map.md 생성

### Phase 4: Code Organization (Greenfield)
- [x] Backend 디렉토리 구조 정의
- [x] Frontend 디렉토리 구조 정의 (Material Design 3 컴포넌트 구조 포함)
- [x] Database 마이그레이션 구조 정의
- [x] Infrastructure 구조 정의
- [x] unit-of-work.md에 Code Organization 섹션 추가

### Phase 5: 검증
- [x] 모든 User Stories가 Unit에 매핑되었는지 확인
- [x] Unit 간 순환 의존성 여부 확인
- [x] 각 Unit이 독립적으로 개발 가능한지 확인
- [x] Material Design 3 통합 계획 검증

---

## Artifacts to Generate

1. **unit-of-work.md**
   - Unit 정의 및 책임
   - 각 Unit의 범위
   - Material Design 3 적용 계획
   - Code Organization (Backend, Frontend, DB, Infrastructure)

2. **unit-of-work-dependency.md**
   - Unit 간 의존성 매트릭스
   - 개발 순서 (Sequential vs Parallel)
   - 통합 포인트

3. **unit-of-work-story-map.md**
   - User Stories → Units 매핑 테이블
   - 각 Unit의 Story 목록
   - Coverage 검증

---

**답변 방법**:
1. 각 [Answer]: 태그 뒤에 선택한 답변 (A, B, C)을 입력하세요
2. 완료 후 **"완료"** 또는 **"done"**이라고 답장해주세요
