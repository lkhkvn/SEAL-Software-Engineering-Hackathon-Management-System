<?php

namespace App\Domain\Entity;

class Score 
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $judgeId,    // Sử dụng ID thuần túy ở tầng nghiệp vụ
        public readonly int $teamId,     // Sử dụng ID thuần túy ở tầng nghiệp vụ
        public readonly int $criteriaId, // Sử dụng ID thuần túy ở tầng nghiệp vụ
        public readonly float $score,    // Điểm số thực tế, ví dụ: 9.50
        public readonly ?string $feedback = null
    ) {}
}