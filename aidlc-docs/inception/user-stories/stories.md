# User Stories

## 공통 규칙 (Common Rules)

### URL 검증 규칙 (URL Validation Rules)

모든 URL 생성 기능(익명/등록 사용자)에 공통으로 적용되는 검증 규칙입니다.

1. 사용자가 원본 URL을 입력 폼에 입력할 수 있다
2. 프로토콜 없이 입력한 경우 (`example.com`) 자동으로 `https://` 추가
3. 올바른 프로토콜 (`http://`, `https://`)을 가진 URL만 허용
4. 잘못된 프로토콜 (`httpo://`, `htps://`, `ftp://`) 입력 시 에러: "HTTP 또는 HTTPS URL만 허용됩니다"
5. 잘못된 URL 형식 (공백, 특수문자만) 입력 시 에러: "올바른 URL 형식이 아닙니다"

---

## Feature 1: URL 단축 기능

### US-001: 익명 URL 생성

**As an** 익명 사용자
**I want to** 회원 가입 없이 긴 URL을 짧은 URL로 변환
**So that** 빠르게 링크를 공유할 수 있다

**Priority**: Must Have

**Acceptance Criteria**:
1. **URL 검증 규칙** 섹션의 모든 규칙 적용
2. "단축하기" 버튼 클릭 시 짧은 코드가 생성된다
3. 생성된 단축 URL이 화면에 표시되고 복사 가능하다

**Persona**: 익명 사용자 (최민수)

---

### US-002: 등록 사용자 URL 생성

**As a** 등록 사용자
**I want to** 로그인 후 URL을 생성하고 관리
**So that** 생성한 URL 목록을 추적하고 통계를 볼 수 있다

**Priority**: Must Have

**Acceptance Criteria**:
1. 로그인한 사용자만 URL 생성 가능
2. 생성된 URL이 사용자 계정과 연결되어 저장됨
3. URL 생성 폼에서 **URL을 생성하는 사용자가** 선택적으로 만료일 설정 가능 (날짜 피커 제공)
4. 만료일을 설정하지 않으면 영구적으로 활성화
5. **URL 검증 규칙** 섹션의 모든 규칙 적용
6. 생성 완료 후 "내 URL 목록"에서 확인 가능

**Persona**: 등록 사용자 (박지영), 소셜 로그인 사용자 (김태현)

---

## Feature 2: URL 리다이렉트

### US-003: 단축 URL 리다이렉트
**As a** 모든 사용자 (익명/등록)
**I want to** 단축 URL 클릭 시 원본 URL로 즉시 이동
**So that** 짧은 링크로 목적지에 빠르게 접근할 수 있다

**Priority**: Must Have

**Acceptance Criteria**:
1. 단축 URL 접근 시 HTTP 302 응답으로 원본 URL로 리다이렉트
2. 리다이렉트 응답 시간이 200ms 이내
3. 존재하지 않는 단축 코드 접근 시 404 에러 페이지 표시
4. 만료된 URL 접근 시 에러 페이지 표시
5. 비활성화된 URL 접근 불가

**Persona**: 모든 사용자

---

## Feature 3: 클릭 추적

### US-004: 클릭 정보 자동 수집
**As a** 시스템
**I want to** 단축 URL 클릭 시 통계 정보를 자동으로 수집
**So that** 사용자에게 클릭 분석 데이터를 제공할 수 있다

**Priority**: Must Have

**Acceptance Criteria**:
1. 리다이렉트 발생 시 클릭 정보가 비동기로 저장됨
2. 수집 정보: IP, User-Agent, 타임스탬프, Referer, 국가
3. 클릭 로그 저장이 리다이렉트 응답 속도에 영향 주지 않음
4. IP 주소로부터 국가 코드 자동 추출 (GeoLite2)
5. 모든 클릭 로그가 데이터베이스에 정확히 저장됨

**Persona**: 시스템 (백엔드)

---

## Feature 4: 통계 대시보드

### US-005: 내 URL 목록 조회
**As a** 등록 사용자
**I want to** 내가 생성한 URL 목록을 조회
**So that** 어떤 링크들을 만들었는지 한눈에 파악할 수 있다

**Priority**: Must Have

**Acceptance Criteria**:
1. 로그인 후 "내 URL" 페이지 접근 가능
2. 생성한 모든 URL이 목록으로 표시됨
3. 각 URL의 원본 주소, 단축 코드, 생성일, 만료일, 활성 상태 표시
4. 클릭수 요약 정보 표시 (총 클릭수)
5. URL별 상세 통계 페이지 링크 제공

**Persona**: 등록 사용자 (박지영), 소셜 로그인 사용자 (김태현)

---

### US-006: 일별 클릭수 차트
**As a** 등록 사용자
**I want to** URL별 일별 클릭수를 차트로 확인
**So that** 시간 경과에 따른 클릭 추이를 분석할 수 있다

**Priority**: Must Have

**Acceptance Criteria**:
1. URL 상세 페이지에서 일별 클릭수 꺾은선 차트 표시
2. 최근 30일간의 데이터 기본 표시
3. 차트에서 특정 날짜 클릭 시 해당 일의 상세 정보 표시
4. 데이터 로딩 중 로딩 인디케이터 표시
5. 차트가 반응형으로 동작 (모바일/태블릿 대응)

**Persona**: 등록 사용자 (박지영), 소셜 로그인 사용자 (김태현)

---

### US-007: 국가별 클릭 분포 차트
**As a** 등록 사용자
**I want to** URL을 클릭한 사용자들의 국가별 분포를 확인
**So that** 어느 국가에서 관심이 많은지 파악할 수 있다

**Priority**: Must Have

**Acceptance Criteria**:
1. URL 상세 페이지에서 국가별 클릭 분포 원형 차트 표시
2. 상위 10개 국가 데이터 표시
3. 각 국가의 클릭 비율(%) 표시
4. 차트 섹션 클릭 시 해당 국가 이름 및 클릭수 툴팁 표시

**Persona**: 등록 사용자 (박지영), 소셜 로그인 사용자 (김태현)

---

### US-008: 브라우저별 클릭 분포 차트
**As a** 등록 사용자
**I want to** URL을 클릭한 사용자들의 브라우저 분포를 확인
**So that** 어떤 브라우저 사용자가 많은지 알 수 있다

**Priority**: Must Have

**Acceptance Criteria**:
1. URL 상세 페이지에서 브라우저별 클릭 분포 막대 차트 표시
2. User-Agent에서 브라우저 정보 자동 파싱
3. Chrome, Firefox, Safari, Edge, 기타 등으로 분류
4. 각 브라우저의 클릭수 및 비율 표시

**Persona**: 등록 사용자 (박지영), 소셜 로그인 사용자 (김태현)

---

## Feature 5: 회원 기능

### US-009: 이메일 회원 가입
**As a** 신규 사용자
**I want to** 이메일과 비밀번호로 회원 가입
**So that** URL을 관리하고 통계를 볼 수 있다

**Priority**: Must Have

**Acceptance Criteria**:
1. 회원 가입 폼에서 이메일, 비밀번호 입력
2. 이메일 중복 검사 수행
3. 비밀번호 암호화 저장 (BCrypt)
4. 가입 완료 후 자동 로그인
5. 유효하지 않은 이메일 형식 거부

**Persona**: 등록 사용자 (박지영)

---

### US-010: 이메일 로그인
**As a** 등록 사용자
**I want to** 이메일과 비밀번호로 로그인
**So that** 내 계정에 접근하여 URL을 관리할 수 있다

**Priority**: Must Have

**Acceptance Criteria**:
1. 로그인 폼에서 이메일, 비밀번호 입력
2. 로그인 성공 시 JWT 토큰 발급
3. JWT 토큰을 로컬 스토리지에 저장
4. 잘못된 이메일 또는 비밀번호 입력 시 에러 메시지
5. 로그인 유지 옵션 제공

**Persona**: 등록 사용자 (박지영)

---

### US-011: 소셜 로그인 (Google)
**As a** 신규 또는 기존 사용자
**I want to** Google 계정으로 간편 로그인
**So that** 별도 비밀번호 없이 빠르게 서비스를 이용할 수 있다

**Priority**: Must Have

**Acceptance Criteria**:
1. "Google로 로그인" 버튼 클릭 시 OAuth2 인증 시작
2. Google 계정 선택 및 권한 승인
3. 신규 사용자인 경우 자동으로 계정 생성
4. 기존 사용자인 경우 바로 로그인
5. 로그인 성공 시 JWT 토큰 발급

**Persona**: 소셜 로그인 사용자 (김태현)

---

### US-012: 소셜 로그인 (GitHub)
**As a** 신규 또는 기존 사용자
**I want to** GitHub 계정으로 간편 로그인
**So that** 개발자 친화적인 방식으로 서비스를 이용할 수 있다

**Priority**: Should Have

**Acceptance Criteria**:
1. "GitHub로 로그인" 버튼 클릭 시 OAuth2 인증 시작
2. GitHub 계정 선택 및 권한 승인
3. 신규 사용자인 경우 자동으로 계정 생성
4. 기존 사용자인 경우 바로 로그인
5. 로그인 성공 시 JWT 토큰 발급

**Persona**: 소셜 로그인 사용자 (김태현)

---

## Feature 6: API 문서화

### US-013: Swagger API 문서
**As a** 개발자 (백엔드/프론트엔드)
**I want to** Swagger UI를 통해 API 명세를 확인
**So that** API 스펙을 이해하고 테스트할 수 있다

**Priority**: Should Have

**Acceptance Criteria**:
1. `/swagger-ui` 경로에서 Swagger UI 접근 가능
2. 모든 REST API 엔드포인트 문서화
3. 각 API의 요청/응답 예시 제공
4. Swagger UI에서 직접 API 테스트 가능
5. JWT 인증이 필요한 API는 Authorization 헤더 설정 가능

**Persona**: 개발자 (백엔드 담당자, 프론트엔드 담당자)

---

## User Stories Summary

### Must Have (10개)
- US-001: 익명 URL 생성
- US-002: 등록 사용자 URL 생성
- US-003: 단축 URL 리다이렉트
- US-004: 클릭 정보 자동 수집
- US-005: 내 URL 목록 조회
- US-006: 일별 클릭수 차트
- US-007: 국가별 클릭 분포 차트
- US-008: 브라우저별 클릭 분포 차트
- US-009: 이메일 회원 가입
- US-010: 이메일 로그인
- US-011: 소셜 로그인 (Google)

### Should Have (2개)
- US-012: 소셜 로그인 (GitHub)
- US-013: Swagger API 문서

### Nice to Have (0개)
- 현재 버전에서는 없음 (향후 확장 포인트로 남겨둠)

---

## INVEST 원칙 준수 확인

모든 사용자 스토리는 다음 INVEST 원칙을 준수합니다:

- **Independent (독립적)**: 각 스토리는 다른 스토리와 독립적으로 구현 가능
- **Negotiable (협상 가능)**: 구현 방법은 개발 중 조정 가능
- **Valuable (가치 있는)**: 각 스토리는 사용자에게 명확한 가치 제공
- **Estimable (추정 가능)**: 각 스토리의 개발 시간 추정 가능
- **Small (작은 단위)**: 각 스토리는 1-3일 내 완료 가능한 크기
- **Testable (테스트 가능)**: 명확한 인수 조건으로 테스트 가능

---

## 개발 우선순위 제안

### Sprint 1 (Week 1): Core Features
1. US-001: 익명 URL 생성
2. US-003: 단축 URL 리다이렉트
3. US-004: 클릭 정보 자동 수집

### Sprint 2 (Week 1-2): Authentication
4. US-009: 이메일 회원 가입
5. US-010: 이메일 로그인
6. US-002: 등록 사용자 URL 생성 (만료일 설정 포함)

### Sprint 3 (Week 2): Dashboard & Social Login
7. US-005: 내 URL 목록 조회
8. US-006: 일별 클릭수 차트
9. US-011: 소셜 로그인 (Google)

### Sprint 4 (Week 2): Advanced Features
10. US-007: 국가별 클릭 분포 차트
11. US-008: 브라우저별 클릭 분포 차트

### Optional:
12. US-012: 소셜 로그인 (GitHub)
13. US-013: Swagger API 문서
