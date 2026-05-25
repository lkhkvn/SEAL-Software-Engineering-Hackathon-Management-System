<?php

namespace App\Domain\Entity;

class Team 
{
    /**
     * @var User[] Mảng chứa danh sách các thực thể User là thành viên của nhóm
     */
    public array $members = [];

    public function __construct(
        public readonly ?int $id,
        public readonly string $teamName,
        public readonly string $category, // Ví dụ: Web Application, Mobile, AI
        public readonly string $joinCode,
        public readonly int $leaderId,    // Lưu ID trưởng nhóm dạng số nguyên thuần túy
        public readonly string $status = 'APPROVED' // PENDING, APPROVED, LOCKED
    ) {}
}