<?php

namespace App\Domain\Repositories;

use App\Domain\Entity\Score;

interface ScoreRepositoryInterface
{
    /**
     * Lưu hoặc cập nhật điểm số chi tiết từ giám khảo
     */
    public function save(Score $score): void;

    /**
     * Lấy toàn bộ danh sách điểm của một đội thi cụ thể
     * @return Score[]
     */
    public function findByTeamId(int $teamId): array;

    /**
     * Lấy tất cả điểm số trong hệ thống để tính toán Leaderboard
     * @return Score[]
     */
    public function findAll(): array;
}