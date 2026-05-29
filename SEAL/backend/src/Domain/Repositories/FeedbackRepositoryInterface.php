<?php

namespace App\Domain\Repositories;

use App\Domain\Entity\Feedback;

interface FeedbackRepositoryInterface
{
    /**
     * Lưu mới nhận xét hoặc phản hồi của giám khảo
     */
    public function save(Feedback $feedback): void;

    /**
     * Lấy danh sách nhận xét của một đội thi cụ thể
     * @return Feedback[]
     */
    public function findByTeamId(int $teamId): array;
}