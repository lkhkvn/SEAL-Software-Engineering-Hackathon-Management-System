-- ============================================================================
-- MIGRATION: Tạo bảng contests (Quản lý cuộc thi Hackathon)
-- Chạy lệnh trong container MySQL:
--   docker exec -i mysql_clean_db mysql -u clean_user -puser_secret_password CleanDb < migrations/create_contests_table.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS contests (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    category    VARCHAR(100) NOT NULL,
    description TEXT,
    location    VARCHAR(255),
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    max_teams   INT          NOT NULL DEFAULT 50,
    status      VARCHAR(20)  NOT NULL DEFAULT 'UPCOMING'
                    COMMENT 'UPCOMING | ACTIVE | COMPLETED | CANCELLED',
    prize       VARCHAR(255),
    image       VARCHAR(255),
    schedule    TEXT,
    prize_details TEXT,
    rules       TEXT,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_dates CHECK (end_date >= start_date),
    INDEX idx_status    (status),
    INDEX idx_category  (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dữ liệu mẫu
INSERT INTO contests (name, category, description, location, start_date, end_date, max_teams, status) VALUES
('AI Innovation Hackathon 2026',    'AI & ML',       'Cuộc thi về trí tuệ nhân tạo và học máy, mở ra cơ hội cho các đội thi sáng tạo ra các giải pháp AI đột phá.', 'TP. Hồ Chí Minh', '2026-06-15', '2026-06-17', 150, 'ACTIVE'),
('FinTech Challenge 2026',          'FinTech',        'Hackathon về công nghệ tài chính, khuyến khích đổi mới trong lĩnh vực thanh toán số, ngân hàng và blockchain.', 'Hà Nội',          '2026-06-22', '2026-06-24', 100, 'ACTIVE'),
('Green Tech Hackathon',            'Sustainability', 'Cuộc thi tìm kiếm giải pháp công nghệ xanh, bền vững cho môi trường và biến đổi khí hậu.', 'Đà Nẵng',         '2026-07-01', '2026-07-03',  80, 'UPCOMING'),
('Healthcare Innovation Summit',    'Healthcare',     'Hackathon y tế tập trung vào các giải pháp công nghệ cải thiện chăm sóc sức khỏe.', 'TP. Hồ Chí Minh', '2026-07-10', '2026-07-12', 120, 'UPCOMING'),
('EdTech Summit 2026',              'Education',      'Cuộc thi đổi mới giáo dục, ứng dụng công nghệ vào học tập và giảng dạy.', 'Hà Nội',          '2026-07-20', '2026-07-22',  60, 'UPCOMING');
