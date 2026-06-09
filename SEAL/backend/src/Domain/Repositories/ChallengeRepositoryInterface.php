<?php

namespace App\Domain\Repositories;

use App\Domain\Entity\Challenge;

/**
 * Repository Interface — Tầng Domain định nghĩa CONTRACT.
 * Infrastructure sẽ implement interface này (Dependency Inversion Principle).
 */
interface ChallengeRepositoryInterface
{
    /**
     * Tìm đề bài theo contest ID.
     * Trả về null nếu chưa có đề bài nào được tạo.
     */
    public function findByContestId(int $contestId): ?Challenge;

    /**
     * Lưu đề bài mới → trả về ID vừa tạo.
     */
    public function save(Challenge $challenge): int;

    /**
     * Cập nhật đề bài đã có (title, description, resources, constraints, criteriaJson, releasedAt).
     */
    public function update(Challenge $challenge): void;
}
