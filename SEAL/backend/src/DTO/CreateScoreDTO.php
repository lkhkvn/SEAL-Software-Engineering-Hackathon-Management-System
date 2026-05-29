<?php

namespace App\DTO;

class CreateScoreDTO
{
    public function __construct(
        public readonly int $judgeId,
        public readonly int $teamId,
        public readonly int $criteriaId,
        public readonly float $scoreValue
    ) {}

    /**
     * Tạo DTO tự động từ mảng dữ liệu Request (JSON)
     */
    public static function fromArray(array $data): self
    {
        return new self(
            judgeId: (int)($data['judge_id'] ?? 0),
            teamId: (int)($data['team_id'] ?? 0),
            criteriaId: (int)($data['criteria_id'] ?? 0),
            scoreValue: (float)($data['score'] ?? 0.0)
        );
    }
}