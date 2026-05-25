<?php

namespace App\Domain\Entity;

class Criteria 
{
    public function __construct(
        public readonly ?int $id,
        public readonly string $name,      // Ví dụ: UI/UX, Code Quality, Presentation
        public readonly float $weight,     // Trọng số phần trăm: 0.30, 0.40...
        public readonly int $maxScore = 10
    ) {}
}