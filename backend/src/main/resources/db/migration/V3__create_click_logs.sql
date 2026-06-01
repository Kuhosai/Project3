-- V3__create_click_logs.sql
-- 클릭 로그 테이블 생성

CREATE TABLE click_logs (
    -- 기본 키
    id BIGSERIAL PRIMARY KEY,

    -- 클릭된 URL (외래 키)
    url_id BIGINT NOT NULL,

    -- 클릭한 사용자의 IP 주소 (IPv4: 15자, IPv6: 45자)
    ip_address VARCHAR(45),

    -- User-Agent (브라우저 정보)
    user_agent TEXT,

    -- Referer (어디서 클릭했는지)
    referer TEXT,

    -- 국가 코드 (GeoLite2로 추출, ISO 3166-1 alpha-2)
    country_code VARCHAR(2),

    -- 브라우저 이름 (User-Agent에서 파싱)
    browser VARCHAR(50),

    -- OS 정보 (User-Agent에서 파싱)
    os VARCHAR(50),

    -- 디바이스 타입 (mobile, desktop, tablet, unknown)
    device_type VARCHAR(20),

    -- 클릭 시각
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 외래 키: urls 테이블 참조 (URL 삭제 시 클릭 로그도 삭제)
    FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE,

    -- 제약 조건: device_type 값 제한
    CONSTRAINT chk_device_type CHECK (device_type IN ('mobile', 'desktop', 'tablet', 'unknown'))
);

-- 인덱스: URL별 클릭 로그 조회 (통계 시 사용)
CREATE INDEX idx_click_logs_url_id ON click_logs(url_id);

-- 인덱스: 클릭 시각 범위 조회 (일별 통계 시 사용)
CREATE INDEX idx_click_logs_clicked_at ON click_logs(clicked_at);

-- 복합 인덱스: URL별 + 클릭 시각 조회 최적화 (일별 통계)
CREATE INDEX idx_click_logs_url_clicked ON click_logs(url_id, clicked_at);

-- 주석 추가
COMMENT ON TABLE click_logs IS '단축 URL 클릭 로그 (통계 수집용)';
COMMENT ON COLUMN click_logs.id IS '클릭 로그 고유 ID';
COMMENT ON COLUMN click_logs.url_id IS '클릭된 URL ID';
COMMENT ON COLUMN click_logs.ip_address IS '클릭한 사용자의 IP 주소';
COMMENT ON COLUMN click_logs.user_agent IS '브라우저 User-Agent 문자열';
COMMENT ON COLUMN click_logs.referer IS '이전 페이지 URL (HTTP Referer 헤더)';
COMMENT ON COLUMN click_logs.country_code IS '국가 코드 (GeoLite2로 IP에서 추출)';
COMMENT ON COLUMN click_logs.browser IS '브라우저 이름 (Chrome, Firefox, Safari 등)';
COMMENT ON COLUMN click_logs.os IS '운영체제 (Windows, macOS, Android 등)';
COMMENT ON COLUMN click_logs.device_type IS '디바이스 타입 (mobile, desktop, tablet, unknown)';
COMMENT ON COLUMN click_logs.clicked_at IS '클릭 발생 일시';
