-- V4__insert_sample_data.sql
-- 테스트용 샘플 데이터 삽입

-- 샘플 사용자 3명 추가
INSERT INTO users (email, password_hash, provider, name) VALUES
('user1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'local', '김철수'),  -- 비밀번호: password123
('user2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'local', '이영희'),  -- 비밀번호: password123
('google-user@gmail.com', NULL, 'google', 'google-oauth2-id-12345', '박민수');  -- Google 소셜 로그인

-- user_id 1, 2, 3으로 가정
-- 샘플 URL 5개 추가
INSERT INTO urls (short_code, original_url, user_id, expires_at, is_active) VALUES
-- 등록 사용자 URL (만료일 있음)
('abc123', 'https://www.google.com', 1, '2026-12-31 23:59:59', TRUE),
('xyz789', 'https://www.github.com', 1, NULL, TRUE),  -- 영구 URL

-- 익명 사용자 URL
('test01', 'https://www.notion.so', NULL, NULL, TRUE),

-- 등록 사용자 URL (다른 사용자)
('demo99', 'https://www.youtube.com', 2, '2026-06-30 23:59:59', TRUE),
('hello1', 'https://www.stackoverflow.com', 2, NULL, TRUE);

-- url_id 1, 2, 3, 4, 5로 가정
-- 샘플 클릭 로그 10개 추가
INSERT INTO click_logs (url_id, ip_address, user_agent, referer, country_code, browser, os, device_type, clicked_at) VALUES
-- URL 1 (abc123) 클릭 로그
(1, '203.0.113.45', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'https://www.google.com', 'KR', 'Chrome', 'Windows', 'desktop', '2026-05-01 10:30:00'),
(1, '198.51.100.23', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1', NULL, 'US', 'Safari', 'iOS', 'mobile', '2026-05-01 14:15:00'),
(1, '192.0.2.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'https://www.facebook.com', 'JP', 'Chrome', 'macOS', 'desktop', '2026-05-02 09:20:00'),

-- URL 2 (xyz789) 클릭 로그
(2, '203.0.113.67', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0', NULL, 'KR', 'Firefox', 'Windows', 'desktop', '2026-05-02 16:45:00'),
(2, '198.51.100.89', 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36', 'https://www.twitter.com', 'US', 'Chrome', 'Android', 'mobile', '2026-05-03 11:30:00'),

-- URL 3 (test01) 클릭 로그
(3, '192.0.2.150', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', NULL, 'DE', 'Chrome', 'Linux', 'desktop', '2026-05-03 13:00:00'),
(3, '203.0.113.200', 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1', 'https://www.reddit.com', 'GB', 'Safari', 'iOS', 'tablet', '2026-05-04 08:15:00'),

-- URL 4 (demo99) 클릭 로그
(4, '198.51.100.45', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36', NULL, 'FR', 'Edge', 'Windows', 'desktop', '2026-05-04 15:30:00'),

-- URL 5 (hello1) 클릭 로그
(5, '192.0.2.77', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15', 'https://www.linkedin.com', 'CA', 'Safari', 'macOS', 'desktop', '2026-05-05 10:00:00'),
(5, '203.0.113.111', 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36', NULL, 'KR', 'Chrome', 'Android', 'mobile', '2026-05-05 17:45:00');

-- 주석
COMMENT ON TABLE users IS '샘플 사용자: 3명 (로컬 2명, Google 1명)';
COMMENT ON TABLE urls IS '샘플 URL: 5개 (등록 사용자 4개, 익명 1개)';
COMMENT ON TABLE click_logs IS '샘플 클릭 로그: 10개';
