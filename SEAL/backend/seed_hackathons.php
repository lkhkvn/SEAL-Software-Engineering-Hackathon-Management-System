<?php
require_once __DIR__ . '/vendor/autoload.php';
$entityManager = require __DIR__ . '/cli-config.php';

use App\Infrastructure\Model\HackathonModel;

try {
    $hackathons = [
        [
            'name' => 'SEAL Global Hackathon 2026',
            'description' => 'Cuộc thi Hackathon thường niên dành cho sinh viên và kỹ sư phần mềm trên toàn cầu. Tập trung vào các giải pháp phần mềm tối ưu và AI.',
            'status' => 'Registration',
            'start_date' => '2026-08-01 08:00:00',
            'end_date' => '2026-08-03 17:00:00',
            'logo_url' => 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=256&auto=format&fit=crop',
            'cover_url' => 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop',
            'max_team_size' => 5,
            'is_online' => true,
            'location' => 'Online',
            'prize_pool' => '$50,000'
        ],
        [
            'name' => 'AI Innovators Challenge',
            'description' => 'Cuộc thi tạo ra các sản phẩm trí tuệ nhân tạo thế hệ mới.',
            'status' => 'Ongoing',
            'start_date' => '2026-07-01 08:00:00',
            'end_date' => '2026-07-15 17:00:00',
            'logo_url' => 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=256&auto=format&fit=crop',
            'cover_url' => 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop',
            'max_team_size' => 4,
            'is_online' => false,
            'location' => 'Hà Nội, Việt Nam',
            'prize_pool' => '$20,000'
        ]
    ];

    foreach ($hackathons as $data) {
        $hackathon = new HackathonModel();
        $hackathon->name = $data['name'];
        $hackathon->description = $data['description'];
        $hackathon->status = $data['status'];
        $hackathon->start_date = $data['start_date'];
        $hackathon->end_date = $data['end_date'];
        $hackathon->logo_url = $data['logo_url'];
        $hackathon->cover_url = $data['cover_url'];
        $hackathon->max_team_size = $data['max_team_size'];
        $hackathon->is_online = $data['is_online'];
        $hackathon->location = $data['location'];
        $hackathon->prize_pool = $data['prize_pool'];

        $entityManager->persist($hackathon);
    }
    $entityManager->flush();
    
    echo "Seeded Hackathons successfully!\n";
} catch (\Exception $e) {
    echo "Error seeding hackathons: " . $e->getMessage() . "\n";
}
