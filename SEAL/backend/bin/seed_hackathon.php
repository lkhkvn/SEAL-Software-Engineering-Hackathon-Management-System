<?php
// backend/bin/seed_hackathon.php

require_once __DIR__ . '/../vendor/autoload.php';

$entityManager = require __DIR__ . '/../cli-config.php';

use App\Infrastructure\Model\HackathonModel;
use App\Infrastructure\Model\MilestoneModel;
use App\Infrastructure\Model\ScheduleModel;

echo "Bắt đầu khởi tạo mẫu Hackathon kèm theo Milestones và Schedules...\n";

try {
    // 1. Tạo Hackathon mẫu
    $hackathon = new HackathonModel();
    $hackathon->name = "Green Tech Hackathon 2026";
    $hackathon->description = "Cuộc thi phát triển các giải pháp công nghệ xanh đột phá nhằm giảm thiểu rác thải nhựa, tối ưu hóa năng lượng tái tạo và bảo vệ môi trường sống.";
    $hackathon->startDate = new \DateTime('2026-06-15 08:00:00');
    $hackathon->endDate = new \DateTime('2026-06-17 17:00:00');
    $hackathon->registrationDeadline = new \DateTime('2026-06-14 23:59:59');
    $hackathon->status = "ACTIVE";
    $hackathon->category = "Sustainability";
    $hackathon->location = "Hội trường A - Đại học Bách Khoa";
    $hackathon->maxTeams = 30;

    $entityManager->persist($hackathon);
    $entityManager->flush();

    $hackathonId = $hackathon->id;
    echo "- Đã tạo thành công Hackathon (ID: $hackathonId)\n";

    // 2. Tạo các mốc thời gian (Milestones)
    $m1 = new MilestoneModel();
    $m1->hackathonId = $hackathonId;
    $m1->name = "Bắt đầu mở đơn đăng ký";
    $m1->description = "Các đội thi hoàn thành hồ sơ đăng ký thành viên và ý tưởng sơ bộ trực tuyến.";
    $m1->dueDate = new \DateTime('2026-06-01 00:00:00');
    $entityManager->persist($m1);

    $m2 = new MilestoneModel();
    $m2->hackathonId = $hackathonId;
    $m2->name = "Hạn chót đăng ký và ghép đội";
    $m2->description = "Cổng đăng ký sẽ đóng tự động. Các đội thi cần chốt danh sách thành viên trước mốc thời gian này.";
    $m2->dueDate = new \DateTime('2026-06-14 23:59:59');
    $entityManager->persist($m2);

    $m3 = new MilestoneModel();
    $m3->hackathonId = $hackathonId;
    $m3->name = "Nộp sản phẩm & Github URL";
    $m3->description = "Tất cả các đội thi tiến hành push code lên Github và nộp link demo video sản phẩm cuối cùng.";
    $m3->dueDate = new \DateTime('2026-06-17 10:00:00');
    $entityManager->persist($m3);

    // 3. Tạo các sự kiện lịch trình (Schedules)
    $s1 = new ScheduleModel();
    $s1->hackathonId = $hackathonId;
    $s1->title = "Lễ Khai mạc và Phổ biến Thể lệ";
    $s1->description = "Tập trung các đội thi, phổ biến quy chế phòng thi, tiêu chí chấm điểm và giới thiệu hội đồng Giám khảo.";
    $s1->startTime = new \DateTime('2026-06-15 08:00:00');
    $s1->endTime = new \DateTime('2026-06-15 10:00:00');
    $s1->location = "Hội trường chính A1";
    $entityManager->persist($s1);

    $s2 = new ScheduleModel();
    $s2->hackathonId = $hackathonId;
    $s2->title = "Vòng Mentoring số 1 - Tối ưu hóa mô hình";
    $s2->description = "Gặp gỡ trực tiếp các chuyên gia công nghệ và môi trường để định hình sản phẩm.";
    $s2->startTime = new \DateTime('2026-06-16 09:00:00');
    $s2->endTime = new \DateTime('2026-06-16 12:00:00');
    $s2->location = "Khu vực sảnh làm việc chung";
    $entityManager->persist($s2);

    $s3 = new ScheduleModel();
    $s3->hackathonId = $hackathonId;
    $s3->title = "Pitching Chung kết và Lễ Trao giải";
    $s3->description = "Mỗi đội thi có 5 phút thuyết trình và 3 phút trả lời câu hỏi phản biện từ Ban giám khảo.";
    $s3->startTime = new \DateTime('2026-06-17 13:30:00');
    $s3->endTime = new \DateTime('2026-06-17 17:00:00');
    $s3->location = "Hội trường chính A1";
    $entityManager->persist($s3);

    $entityManager->flush();
    echo "- Đã tạo thành công các mốc Timeline (Milestones) và Lịch trình (Schedules) mẫu!\n";
    echo "\n==> Đã seed Hackathon mẫu thành công! <==\n";

} catch (\Exception $e) {
    echo "Lỗi khi seed Hackathon mẫu: " . $e->getMessage() . "\n";
}
