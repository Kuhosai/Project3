# AI-DLC Audit Log

## Workspace Detection - Initial Request
**Timestamp**: 2026-04-14T08:52:00Z
**User Input**: "Using AI-DLC, 긴 URL을 짧게 줄여주고(https://short.ly/abc123), 클릭할 때마다 누가, 언제, 어디서 클릭했는지 통계를 보여주는 서비스예요.
비즈니스 로직이 심플한데 확장 포인트가 많아서 학습용으로 딱이에요.

📋 핵심 기능 목록
기능설명난이도URL 단축긴 URL → 짧은 코드 생성 (Base62 인코딩)⭐⭐리다이렉트단축 URL 접근 시 원본으로 이동⭐클릭 추적클릭 시 IP, UserAgent, 시간 기록⭐⭐통계 대시보드일별 클릭수, 국가/브라우저 분포 차트⭐⭐⭐회원 기능내 URL 목록 관리, JWT 인증⭐⭐만료일 설정특정 날짜 이후 링크 비활성화⭐

🏗️ 아키텍처
[React] → [Spring Boot API] → [PostgreSQL]
              ↓
         클릭 발생 시
         비동기로 통계 저장
         (Spring @Async)
흐름 설명

사용자가 short.ly/abc123 접근
Spring이 DB에서 원본 URL 조회
302 Redirect 응답 → 사용자는 원본으로 이동
동시에 클릭 정보를 비동기로 PostgreSQL에 저장 (응답속도 영향 없게)
대시보드에서 통계 API 호출 → React로 차트 렌더링


🗄️ DB 설계
sql-- 사용자
users
  id, email, password, created_at

-- 단축 URL
urls
  id, original_url, short_code (unique),
  user_id (FK), expires_at, created_at, is_active

-- 클릭 로그
click_logs
  id, url_id (FK), clicked_at,
  ip_address, user_agent, referer, country
학습 포인트: url_id 기준으로 집계 쿼리(GROUP BY, COUNT)를 직접 짜보면서 JPA vs 네이티브 쿼리 차이를 체감할 수 있어요.

☕ Java (Spring Boot) 구현 포인트
java// Base62 인코딩 - URL 코드 생성 핵심 로직
// 숫자 ID를 a-z, A-Z, 0-9 조합의 짧은 문자열로 변환
public String encode(long id) {
    String chars = \"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\";
    StringBuilder sb = new StringBuilder();
    while (id > 0) {
        sb.append(chars.charAt((int)(id % 62)));
        id /= 62;
    }
    return sb.reverse().toString(); // ex) 12345 → \"dnh\"
}
배울 수 있는 Spring 개념들

@Async — 클릭 로그를 메인 스레드 블로킹 없이 저장
@Scheduled — 만료된 URL 주기적으로 비활성화
Spring Security + JWT — 토큰 기반 인증
JPA Projections — 통계 집계 결과를 DTO로 바로 받기


⚛️ React 구현 포인트
추천 라이브러리
용도라이브러리차트Recharts (러닝커브 낮음)HTTP 요청Axios + React Query스타일Tailwind CSS
대시보드 구성 예시
📊 내 URL 통계
┌─────────────────────────────┐
│  총 클릭수: 1,284           │
│  활성 URL: 12개             │
└─────────────────────────────┘
📈 일별 클릭 추이 (LineChart)
🌍 국가별 분포 (PieChart)
🖥️ 브라우저별 분포 (BarChart)

🐳 Docker Compose 구성
yaml# docker-compose.yml 구조 개념
services:
  db:        # PostgreSQL 컨테이너
  backend:   # Spring Boot (db 뜬 후 시작)
  frontend:  # React (Nginx로 빌드 결과 서빙)
학습 포인트

depends_on — 컨테이너 실행 순서 제어
environment — DB 접속 정보를 코드에 하드코딩하지 않는 법
volumes — DB 데이터를 컨테이너 재시작 후에도 유지하는 법
멀티스테이지 빌드 — React 빌드 결과만 Nginx 이미지에 담기


📅 2주 개발 일정 (5시간/일 기준)
기간할 일1~2일프로젝트 세팅, Docker Compose 기본 구성, DB 설계3~4일URL 단축 API + 리다이렉트 구현5~6일JWT 인증, 회원 기능7~8일클릭 로그 저장 (@Async), 통계 집계 API9~10일React 대시보드 UI + 차트 연동11~12일만료일 기능, 예외처리 보강13~14일배포 최적화, 버그 수정, README 작성

💡 역할 분담 제안
혼자 다 하면 실력이 안 늘어요. 기능 단위로 나누는 게 좋아요.

동기 A → 백엔드 (Spring) + Docker 세팅
동기 B → 프론트엔드 (React) + API 연동

단, DB 설계와 API 스펙 문서(Swagger)는 같이 먼저 맞춰야 나중에 충돌이 없어요.

더 궁금한 부분 있으면 말해줘요! Docker Compose 파일이나 API 설계서 초안도 같이 만들어줄 수 있어요 🙌이거 내 notion 스터디쪽에 페이지하나 만들어서 추가해줘4월 8일Notion에 페이지를 만들어줄게요! 먼저 스터디 관련 페이지를 찾아볼게요.로드된 도구, notion 통합 사용함로드된 도구, notion 통합 사용함\"4. 스터디 📖\" 페이지를 찾았어요! 여기에 새 페이지를 만들어줄게요.로드된 도구, notion 통합 사용함로드된 도구, notion 통합 사용함\"4. 스터디 📖\" 페이지 안에 새 페이지를 만들었어요! 🎉
🔗 URL 단축 서비스 + 클릭 통계 대시보드 (토이프로젝트)
아래 내용이 모두 정리되어 있어요:

기술 스택 / 핵심 기능 목록
아키텍처 흐름 설명
DB 설계 (SQL)
Spring Boot 핵심 개념 + 코드 예시
React 대시보드 구성
Docker Compose 구성 포인트
2주 개발 일정
역할 분담 제안"
**AI Response**: "Starting AI-DLC workflow - Workspace Detection phase"
**Context**: INCEPTION - Workspace Detection

---

## Requirements Analysis - Question Responses
**Timestamp**: 2026-04-14T09:15:00Z
**User Input**: "다했어"
**AI Response**: "Reading user responses from requirement-verification-questions.md"
**Context**: INCEPTION - Requirements Analysis

### User Answers Summary:
- 질문 1 (배포 환경): A - 로컬 개발 환경만 (Docker Compose, 학습용)
- 질문 2 (사용자 인증 범위): B - JWT + 소셜 로그인 (Google, GitHub 등)
- 질문 3 (URL 코드 생성 전략): A - 순차 ID 기반 인코딩
- 질문 4 (클릭 분석 상세도): B - 표준 추적 (IP, User-Agent, 타임스탬프, 국가, referer)
- 질문 5 (국가 감지 방법): A - 무료 IP 위치정보 DB (GeoLite2)
- 질문 6 (URL 만료 처리): A - 간단한 에러 페이지 표시
- 질문 7 (사용량 제한): D - 사용량 제한 불필요
- 질문 8 (URL 유효성 검사): B - 표준 검사 (형식 + HTTP/HTTPS 프로토콜 확인)
- 질문 9 (대시보드 기능 우선순위): C - 일별 클릭수 + 국가별 분포 + 브라우저 분포
- 질문 10 (API 문서화): A - 예 - Swagger/OpenAPI 사용
- 질문 11 (테스트 요구사항): B - 단위 테스트 + API 통합 테스트
- 질문 12 (데이터베이스 마이그레이션 전략): A - Flyway 마이그레이션 스크립트
- 질문 13 (보안 확장 규칙): B - 아니오 (보안 규칙 생략)
- 질문 14 (속성 기반 테스트 확장): C - 아니오 (PBT 규칙 생략)

---

## User Stories - Planning and Generation
**Timestamp**: 2026-04-14T09:30:00Z
**User Input**: "유저 스토리 만들어줘"
**AI Response**: "Starting User Stories stage - Creating story generation plan"
**Context**: INCEPTION - User Stories

### Story Plan Responses:
- 질문 1 (페르소나 범위): B - 익명 사용자 + 등록 사용자 + 소셜 로그인 사용자
- 질문 2 (스토리 세분화 수준): B - 중간 단위 (10-15개 스토리)
- 질문 3 (스토리 구성 방식): B - Feature 기반
- 질문 4 (인수 조건 상세도): B - 표준 (3-5개 조건)
- 질문 5 (우선순위 표시): A - Must Have / Should Have / Nice to Have

### Generated Artifacts:
- 3개 페르소나 생성 (익명 사용자, 등록 사용자, 소셜 로그인 사용자)
- 14개 사용자 스토리 생성 (Must Have: 11개, Should Have: 3개)
- 모든 스토리에 INVEST 원칙 준수 및 인수 조건 포함

---

## User Stories - Refinement (URL Validation Common Rules)
**Timestamp**: 2026-04-16T09:45:00Z
**User Input**: "아까 추가한 http 관련내용 익명사용자 말고 사용자 공통으로 넣어야하지 않을까?"
**AI Response**: "Refactored URL validation rules to common section"
**Context**: INCEPTION - User Stories Refinement

### Changes Made:
- Created "공통 규칙 (Common Rules)" section at the top of stories.md
- Moved URL validation rules (protocol handling, format validation) to common section
- Updated US-001 to reference common validation rules instead of duplicating them
- Updated US-002 to reference common validation rules explicitly
- This ensures all user types (익명/등록 사용자) follow the same URL validation logic

---

## User Stories - Refinement (US-003 Removal)
**Timestamp**: 2026-04-16T09:50:00Z
**User Input**: "더 수정할 사항 없는지 다시 검토해봐" → "해줘"
**AI Response**: "Removed duplicate US-003 (URL 만료일 설정) and renumbered all user stories"
**Context**: INCEPTION - User Stories Refinement

### Issue Identified:
- US-003 "URL 만료일 설정" was a duplicate
- All acceptance criteria were already covered in US-002 (URL creation with expiration) and US-004 (redirect behavior)
- US-003 had no unique value

### Changes Made:
- Deleted US-003: URL 만료일 설정
- Renumbered US-004 through US-014 to US-003 through US-013
- Updated User Stories Summary (Must Have: 11→10개, Should Have: 3→2개)
- Updated Sprint plan to reflect new numbering
- Total user stories reduced from 14 to 13

---
