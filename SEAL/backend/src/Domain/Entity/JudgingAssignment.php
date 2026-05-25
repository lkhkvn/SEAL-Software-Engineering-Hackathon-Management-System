<?php

namespace App\Domain\Entity;

use DateTime;

class JudgingAssignment 
{
    public readonly DateTime $assignedAt;

    public function __construct(
        public readonly ?int $id,
        public readonly int $judgeId, // Lưu ID thuần túy ở tầng nghiệp vụ
        public readonly int $teamId,  // Lưu ID thuần túy ở tầng nghiệp vụ
        ?DateTime $assignedAt = null
    ) {
        $this->assignedAt = $assignedAt ?? new DateTime();
    }
}