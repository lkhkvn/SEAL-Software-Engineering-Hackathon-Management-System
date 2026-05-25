<?php

namespace App\Domain\Entity;

use DateTime;

class Submission 
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $teamId, // Liên kết bằng ID thuần túy ở tầng Domain
        public readonly ?string $projectName = null,
        public readonly ?string $description = null,
        public readonly ?string $githubUrl = null,
        public readonly ?string $demoVideoUrl = null,
        public readonly ?string $fileUrl = null,
        public readonly ?string $notes = null,
        public readonly ?DateTime $submittedAt = null
    ) {}
}