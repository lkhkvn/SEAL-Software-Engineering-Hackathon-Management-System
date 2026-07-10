<?php
require_once __DIR__ . '/../vendor/autoload.php';
$em = require __DIR__ . '/../cli-config.php';
$conn = $em->getConnection();

try {
    // 1. Lấy ID của cuộc thi đầu tiên
    $stmt = $conn->executeQuery("SELECT id FROM contests LIMIT 1");
    $contestId = $stmt->fetchOne();
    
    if (!$contestId) {
        echo json_encode(["status" => "error", "message" => "Không tìm thấy cuộc thi nào trong CSDL."]);
        exit;
    }
    
    // 2. Tạo dữ liệu các đội thi giả
    $teams = [
        ['team_name' => 'Team Alpha', 'category' => 'AI & ML', 'join_code' => 'ALPHA123', 'status' => 'active', 'leader_id' => 1],
        ['team_name' => 'Block Titans', 'category' => 'Blockchain', 'join_code' => 'TITAN123', 'status' => 'active', 'leader_id' => 1],
        ['team_name' => 'Innovators', 'category' => 'EdTech', 'join_code' => 'INNOV123', 'status' => 'active', 'leader_id' => 1]
    ];
    
    foreach ($teams as $team) {
        // Tạo đội thi mới
        $conn->executeStatement(
            "INSERT INTO teams (team_name, category, join_code, status, max_members, leader_id) VALUES (?, ?, ?, ?, ?, ?)",
            [$team['team_name'], $team['category'], $team['join_code'], $team['status'], 5, $team['leader_id']]
        );
        $teamId = $conn->lastInsertId();
        
        // Đăng ký đội vào cuộc thi (bảng contest_registrations)
        $conn->executeStatement(
            "INSERT INTO contest_registrations (team_id, contest_id, status) VALUES (?, ?, ?)",
            [$teamId, $contestId, 'APPROVED']
        );
        
        // Tạo file nộp bài (submission)
        if ($team['team_name'] === 'Team Alpha') {
            $conn->executeStatement(
                "INSERT INTO submissions (team_id, contest_id, project_name, description, github_url, demo_video_url, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [$teamId, $contestId, 'Hệ thống Y tế AI (MediCare)', 'Giải pháp ứng dụng trí tuệ nhân tạo để chẩn đoán bệnh lý thông qua hình ảnh X-quang với độ chính xác trên 95%.', 'https://github.com/teamalpha', 'https://youtube.com/medicare', date('Y-m-d H:i:s')]
            );
        } else if ($team['team_name'] === 'Block Titans') {
            $conn->executeStatement(
                "INSERT INTO submissions (team_id, contest_id, project_name, description, github_url, demo_video_url, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [$teamId, $contestId, 'EduChain - Bằng cấp điện tử', 'Nền tảng lưu trữ và xác thực văn bằng đại học sử dụng công nghệ Blockchain, chống làm giả tuyệt đối.', 'https://github.com/blocktitans', '', date('Y-m-d H:i:s')]
            );
        } else if ($team['team_name'] === 'Innovators') {
            $conn->executeStatement(
                "INSERT INTO submissions (team_id, contest_id, project_name, description, github_url, demo_video_url, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [$teamId, $contestId, 'LearnSync - Học tập kết nối', 'Ứng dụng ghép cặp gia sư và học sinh dựa trên thói quen học tập và định hướng nghề nghiệp tương lai.', 'https://github.com/innovators', 'https://youtube.com/learnsync', date('Y-m-d H:i:s')]
            );
        }
    }
    
    echo "<h1>Tạo dữ liệu thật thành công!</h1>";
    echo "<p>Đã chèn 3 đội thi (Team Alpha, Block Titans, Innovators) và 3 dự án tương ứng vào Database.</p>";

} catch (\Exception $e) {
    echo "<h1>Lỗi:</h1><p>" . $e->getMessage() . "</p>";
}
