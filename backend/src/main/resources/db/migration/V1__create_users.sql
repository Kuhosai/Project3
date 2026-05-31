-- V1__create_users.sql
-- 사용자 테이블 생성

CREATE TABLE users (
    -- 기본 키 (자동 증가)
    id BIGSERIAL PRIMARY KEY,

    -- 이메일 (로그인 ID, 유니크)
    email VARCHAR(255) UNIQUE NOT NULL,

    -- 비밀번호 해시 (BCrypt, 소셜 로그인 시 NULL)
    password_hash VARCHAR(255),

    -- OAuth2 제공자 ('local', 'google', 'github')
    provider VARCHAR(50),

    -- OAuth2 제공자의 사용자 ID
    provider_id VARCHAR(255),

    -- 사용자 이름/닉네임
    name VARCHAR(100),

    -- 생성일
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 제약 조건: provider + provider_id 복합 유니크 (동일한 소셜 계정 중복 방지)
    CONSTRAINT uk_users_provider UNIQUE (provider, provider_id),

    -- 제약 조건: provider 값 제한
    CONSTRAINT chk_provider CHECK (provider IN ('local', 'google', 'github'))
);

-- 인덱스: 이메일로 빠른 조회 (로그인 시 사용)
CREATE INDEX idx_users_email ON users(email);

-- 인덱스: OAuth2 제공자별 조회 (소셜 로그인 시 사용)
CREATE INDEX idx_users_provider ON users(provider, provider_id);

-- 주석 추가
COMMENT ON TABLE users IS '사용자 정보 (이메일 로그인 및 OAuth2 소셜 로그인 지원)';
COMMENT ON COLUMN users.id IS '사용자 고유 ID';
COMMENT ON COLUMN users.email IS '이메일 주소 (로그인 ID)';
COMMENT ON COLUMN users.password_hash IS 'BCrypt 해시된 비밀번호 (소셜 로그인 시 NULL)';
COMMENT ON COLUMN users.provider IS '인증 제공자 (local, google, github)';
COMMENT ON COLUMN users.provider_id IS 'OAuth2 제공자의 사용자 고유 ID';
COMMENT ON COLUMN users.name IS '사용자 이름 또는 닉네임';
COMMENT ON COLUMN users.created_at IS '계정 생성 일시';
