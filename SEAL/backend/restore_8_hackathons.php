<?php
require_once __DIR__ . '/vendor/autoload.php';
$entityManager = require __DIR__ . '/cli-config.php';

use App\Infrastructure\Model\HackathonModel;

try {
    // Delete existing hackathons to start fresh
    $connection = $entityManager->getConnection();
    $connection->executeStatement("SET FOREIGN_KEY_CHECKS = 0;");
    $connection->executeStatement("TRUNCATE TABLE contests;");
    $connection->executeStatement("SET FOREIGN_KEY_CHECKS = 1;");

    $hackathons = [
        [
            'name' => 'AI Innovation Hackathon 2026',
            'description' => 'Cuộc thi về trí tuệ nhân tạo và học máy, mở ra cơ hội cho các đội thi sáng tạo ra các giải pháp AI đột phá.',
            'status' => 'ACTIVE',
            'start_date' => '2026-06-15',
            'end_date' => '2026-06-17',
            'location' => 'TP. Hồ Chí Minh',
            'max_team_size' => 5,
            'is_online' => false,
            'prize_pool' => '200,000,000 VND'
        ],
        [
            'name' => 'FinTech Challenge 2026',
            'description' => 'Hackathon về công nghệ tài chính, khuyến khích đổi mới trong lĩnh vực thanh toán số, ngân hàng và blockchain.',
            'status' => 'ACTIVE',
            'start_date' => '2026-06-22',
            'end_date' => '2026-06-24',
            'location' => 'Hà Nội',
            'max_team_size' => 4,
            'is_online' => false,
            'prize_pool' => '150,000,000 VND'
        ],
        [
            'name' => 'Green Tech Hackathon',
            'description' => 'Cuộc thi tìm kiếm giải pháp công nghệ xanh, bền vững cho môi trường và biến đổi khí hậu.',
            'status' => 'UPCOMING',
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-03',
            'location' => 'Đà Nẵng',
            'max_team_size' => 5,
            'is_online' => false,
            'prize_pool' => '100,000,000 VND'
        ],
        [
            'name' => 'Healthcare Innovation Summit',
            'description' => 'Hackathon y tế tập trung vào các giải pháp công nghệ cải thiện chăm sóc sức khỏe.',
            'status' => 'UPCOMING',
            'start_date' => '2026-07-10',
            'end_date' => '2026-07-12',
            'location' => 'TP. Hồ Chí Minh',
            'max_team_size' => 5,
            'is_online' => false,
            'prize_pool' => '250,000,000 VND'
        ],
        [
            'name' => 'EdTech Summit 2026',
            'description' => 'Cuộc thi đổi mới giáo dục, ứng dụng công nghệ vào học tập và giảng dạy.',
            'status' => 'UPCOMING',
            'start_date' => '2026-07-20',
            'end_date' => '2026-07-22',
            'location' => 'Hà Nội',
            'max_team_size' => 4,
            'is_online' => false,
            'prize_pool' => '100,000,000 VND'
        ],
        [
            'name' => 'Web3 & Blockchainathon',
            'description' => 'Khám phá thế giới phi tập trung, xây dựng các ứng dụng DApps và Smart Contracts.',
            'status' => 'COMPLETED',
            'start_date' => '2026-05-01',
            'end_date' => '2026-05-03',
            'location' => 'Online',
            'max_team_size' => 5,
            'is_online' => true,
            'prize_pool' => '5000 USD'
        ],
        [
            'name' => 'IoT Smart City Challenge',
            'description' => 'Thiết kế các giải pháp IoT thông minh để giải quyết các vấn đề giao thông, năng lượng tại các siêu đô thị.',
            'status' => 'COMPLETED',
            'start_date' => '2026-04-15',
            'end_date' => '2026-04-17',
            'location' => 'Bình Dương',
            'max_team_size' => 6,
            'is_online' => false,
            'prize_pool' => '300,000,000 VND'
        ],
        [
            'name' => 'Cyber Security CTF 2026',
            'description' => 'Giải đấu Capture The Flag dành cho các chuyên gia và sinh viên an toàn thông tin trên toàn cầu.',
            'status' => 'ONGOING',
            'start_date' => '2026-07-08',
            'end_date' => '2026-07-15',
            'location' => 'Online',
            'max_team_size' => 3,
            'is_online' => true,
            'prize_pool' => '10,000 USD'
        ]
    ];

    foreach ($hackathons as $idx => $data) {
        $hackathon = new HackathonModel();
        $hackathon->name = $data['name'];
        $hackathon->description = $data['description'];
        $hackathon->status = $data['status'];
        $hackathon->start_date = $data['start_date'];
        $hackathon->end_date = $data['end_date'];
        $hackathon->location = $data['location'];
        $hackathon->max_team_size = $data['max_team_size'];
        $hackathon->is_online = $data['is_online'];
        $hackathon->prize_pool = $data['prize_pool'];
        // Generic images for mock data
        $hackathon->logo_url = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=256&auto=format&fit=crop';
        $hackathon->cover_url = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop';

        $entityManager->persist($hackathon);
    }
    
    $entityManager->flush();
    echo "Restored 8 hackathons successfully!\n";
} catch (\Exception $e) {
    echo "Error restoring hackathons: " . $e->getMessage() . "\n";
}
