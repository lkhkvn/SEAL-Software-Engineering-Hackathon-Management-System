<?php
// backend/bin/seed_data.php

require_once __DIR__ . '/../vendor/autoload.php';

$entityManager = require __DIR__ . '/../cli-config.php';
$conn = $entityManager->getConnection();

echo "Bắt đầu seed dữ liệu mẫu cho hệ thống...\n";

try {
    // 1. Tắt tạm thời kiểm tra khóa ngoại để dọn dẹp bảng
    $conn->executeStatement('SET FOREIGN_KEY_CHECKS = 0');
    $conn->executeStatement('CREATE TABLE IF NOT EXISTS team_members (
        id INT NOT NULL AUTO_INCREMENT,
        team_id INT NOT NULL,
        user_id INT NOT NULL,
        role_in_team VARCHAR(20) NOT NULL DEFAULT \'MEMBER\',
        joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uniq_team_user (team_id, user_id),
        KEY idx_team_members_team_id (team_id),
        KEY idx_team_members_user_id (user_id),
        CONSTRAINT fk_team_members_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        CONSTRAINT fk_team_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');
    $conn->executeStatement('TRUNCATE TABLE scores');
    $conn->executeStatement('TRUNCATE TABLE submissions');
    $conn->executeStatement('TRUNCATE TABLE judging_assignments');
    $conn->executeStatement('TRUNCATE TABLE teams');
    $conn->executeStatement('TRUNCATE TABLE criteria');
    $conn->executeStatement('TRUNCATE TABLE users');
    $conn->executeStatement('TRUNCATE TABLE team_members');
    $conn->executeStatement('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Chèn tiêu chí đánh giá (Criteria)
    $conn->executeStatement("INSERT INTO criteria (id, name, weight, max_score) VALUES 
        (1, 'Sáng tạo', 1.00, 30),
        (2, 'Kỹ thuật', 1.00, 25),
        (3, 'Trình bày', 1.00, 20),
        (4, 'Khả thi', 1.00, 25)
    ");
    echo "- Đã tạo 4 Tiêu chí chấm điểm thành công.\n";

    // 3. Tạo các tài khoản người dùng (Users) gồm Admin, Giám khảo và Thí sinh
    $hashedPassword = password_hash('password123', PASSWORD_BCRYPT);
    $adminHashedPassword = password_hash('hack123', PASSWORD_BCRYPT);
    $conn->executeStatement("INSERT INTO users (id, name, email, password, role, phone, skills, team_id) VALUES 
        (1, 'Admin Hệ Thống', 'admin1@gmail.com', '$adminHashedPassword', 'ADMIN', '0900000001', 'Admin, System Management', NULL),
        (2, 'Giám khảo A', 'testuser@gmail.com', '$hashedPassword', 'JUDGE', '0900000002', 'Judging, Evaluation', NULL),
        (3, 'Nguyễn Văn A', 'nguyenvana@gmail.com', '$hashedPassword', 'PARTICIPANT', '0912345678', 'Python, React, Machine Learning', NULL),
        (4, 'Trần Thị B', 'tranthib@gmail.com', '$hashedPassword', 'PARTICIPANT', '0912345679', 'React, UI/UX, Tailwind CSS', NULL),
        (5, 'Lê Văn C', 'levanc@gmail.com', '$hashedPassword', 'PARTICIPANT', '0912345680', 'Node.js, Express, MongoDB', NULL),
        (6, 'Phạm Văn D', 'phamvand@gmail.com', '$hashedPassword', 'PARTICIPANT', '0912345681', 'Vue.js, Bootstrap, Javascript', NULL),
        (7, 'Hoàng Văn E', 'hoangvane@gmail.com', '$hashedPassword', 'PARTICIPANT', '0912345682', 'Flutter, Dart, Firebase', NULL)
    ");
    echo "- Đã tạo 5 tài khoản Thí sinh thành công.\n";

    // 4. Tạo các đội thi (Teams)
    $conn->executeStatement("INSERT INTO teams (id, team_name, category, join_code, status, leader_id) VALUES 
        (1, 'AI Innovators', 'AI & ML', 'AI123', 'APPROVED', 3),
        (2, 'Code Warriors', 'Web Application', 'CW456', 'APPROVED', 5),
        (3, 'Tech Titans', 'Mobile Application', 'TT789', 'APPROVED', 7)
    ");
    echo "- Đã tạo 3 Đội thi thành công.\n";

    // 5. Cập nhật nhóm cho thí sinh
    $conn->executeStatement("UPDATE users SET team_id = 1 WHERE id IN (3, 4)");
    $conn->executeStatement("UPDATE users SET team_id = 2 WHERE id IN (5, 6)");
    $conn->executeStatement("UPDATE users SET team_id = 3 WHERE id = 7");
    $conn->executeStatement("INSERT INTO team_members (team_id, user_id, role_in_team) VALUES
        (1, 3, 'LEAD'),
        (1, 4, 'MEMBER'),
        (2, 5, 'LEAD'),
        (2, 6, 'MEMBER'),
        (3, 7, 'LEAD')");
    echo "- Đã xếp thành viên vào đội thi tương ứng.\n";

    // 6. Tạo các bài nộp (Submissions)
    $conn->executeStatement("INSERT INTO submissions (id, team_id, project_name, description, github_url, demo_video_url, submitted_at) VALUES 
        (1, 1, 'Medical AI Diagnosis', 'Chẩn đoán hình ảnh X-quang phổi bằng học sâu', 'https://github.com/ai-innovators/medical-ai', 'https://youtube.com/demo-medical-ai', NOW()),
        (2, 2, 'AgriTrade Smart Platform', 'Sàn giao dịch kết nối nông dân với người tiêu dùng trực tiếp', 'https://github.com/code-warriors/agri-trade', 'https://youtube.com/demo-agritrade', NOW()),
        (3, 3, 'Elderly Medicine Reminder', 'Ứng dụng di động nhắc nhở uống thuốc cho người cao tuổi', 'https://github.com/tech-titans/elderly-health', 'https://youtube.com/demo-elderly-health', NOW())
    ");
    echo "- Đã tạo các Bài nộp dự án thành công.\n";

    // 7. Chèn điểm số mẫu từ Giám khảo (ID = 2 - testuser@gmail.com)
    // Đội 1: AI Innovators - Điểm: Sáng tạo=28, Kỹ thuật=24, Trình bày=18, Khả thi=25 (Tổng: 95)
    $conn->executeStatement("INSERT INTO scores (judge_id, team_id, criteria_id, score, feedback) VALUES 
        (2, 1, 1, 28.00, 'Ý tưởng sáng tạo đột phá, ứng dụng thiết thực.'),
        (2, 1, 2, 24.00, 'Kỹ thuật tốt, mô hình học máy độ chính xác cao.'),
        (2, 1, 3, 18.00, 'Trình bày rõ ràng, slide đẹp nhưng hơi quá giờ.'),
        (2, 1, 4, 25.00, 'Khả năng triển khai thương mại hóa rất tốt.')
    ");

    // Đội 2: Code Warriors - Điểm: Sáng tạo=27, Kỹ thuật=23, Trình bày=19, Khả thi=23 (Tổng: 92)
    $conn->executeStatement("INSERT INTO scores (judge_id, team_id, criteria_id, score, feedback) VALUES 
        (2, 2, 1, 27.00, 'Mô hình kinh doanh tốt, ý tưởng không quá mới nhưng tối ưu.'),
        (2, 2, 2, 23.00, 'Code sạch, kiến trúc gọn gàng, hoạt động mượt.'),
        (2, 2, 3, 19.00, 'Tác phong tự tin, demo trực tiếp mượt mà.'),
        (2, 2, 4, 23.00, 'Cần thêm thời gian tích hợp các cổng thanh toán.')
    ");

    // Đội 3: Tech Titans - Điểm: Sáng tạo=26, Kỹ thuật=23, Trình bày=18, Khả thi=23 (Tổng: 90)
    $conn->executeStatement("INSERT INTO scores (judge_id, team_id, criteria_id, score, feedback) VALUES 
        (2, 3, 1, 26.00, 'App hữu ích giải quyết bài toán thực tế của người già.'),
        (2, 3, 2, 23.00, 'UI/UX thân thiện, tính năng nhắc nhở ổn định.'),
        (2, 3, 3, 18.00, 'Phần trả lời phản biện của đội rất tốt.'),
        (2, 3, 4, 23.00, 'Dễ tiếp cận người dùng mục tiêu.')
    ");
    echo "- Đã chấm điểm mẫu thành công.\n";

    echo "\n==> HỆ THỐNG ĐÃ SEED DỮ LIỆU THÀNH CÔNG! <==\n";

} catch (Exception $e) {
    echo "Lỗi khi seed dữ liệu: " . $e->getMessage() . "\n";
}
