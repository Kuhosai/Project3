-- V2__create_urls.sql
-- URL 단축 정보 테이블 생성

CREATE TABLE urls (
    -- 기본 키 (Base62 인코딩의 소스)
    id BIGSERIAL PRIMARY KEY,

    -- 단축 코드 (Base62 인코딩 결과, 유니크)
    short_code VARCHAR(10) UNIQUE NOT NULL,

    -- 원본 URL
    original_url TEXT NOT NULL,

    -- 생성한 사용자 (NULL이면 익명 사용자)
    user_id BIGINT,

    -- 생성일
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 만료일 (NULL이면 영구 URL)
    expires_at TIMESTAMP,

    -- 활성 상태 (사용자가 수동으로 비활성화 가능)
    is_active BOOLEAN DEFAULT TRUE,

    -- 외래 키: users 테이블 참조 (사용자 삭제 시 URL도 삭제)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- 제약 조건: 만료일이 생성일보다 나중이어야 함
    CONSTRAINT chk_expires_after_created CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- 인덱스: 단축 코드로 빠른 조회 (리다이렉트 시 사용)
CREATE INDEX idx_urls_short_code ON urls(short_code);

-- 인덱스: 사용자별 URL 조회 (내 URL 목록 시 사용)
CREATE INDEX idx_urls_user_id ON urls(user_id);

-- 인덱스: 만료일 검증 (만료된 URL 필터링)
CREATE INDEX idx_urls_expires_at ON urls(expires_at);

-- 복합 인덱스: 사용자별 최신 URL 조회 최적화
CREATE INDEX idx_urls_user_created ON urls(user_id, created_at DESC);

-- 주석 추가
COMMENT ON TABLE urls IS '단축 URL 정보';
COMMENT ON COLUMN urls.id IS 'URL 고유 ID (Base62 인코딩의 입력값)';
COMMENT ON COLUMN urls.short_code IS 'Base62 인코딩된 단축 코드';
COMMENT ON COLUMN urls.original_url IS '원본 URL';
COMMENT ON COLUMN urls.user_id IS '생성한 사용자 ID (NULL이면 익명)';
COMMENT ON COLUMN urls.created_at IS 'URL 생성 일시';
COMMENT ON COLUMN urls.expires_at IS 'URL 만료 일시 (NULL이면 영구)';
COMMENT ON COLUMN urls.is_active IS '활성 상태 (FALSE면 접근 불가)';
