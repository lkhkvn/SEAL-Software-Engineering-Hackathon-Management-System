<?php

namespace App\Infrastructure\Model;

use Doctrine\ORM\Mapping as ORM;

/**
 * Infrastructure Model: ChallengeModel
 * Doctrine ORM Entity — ánh xạ trực tiếp tới bảng `contest_problems`.
 * Tầng này KHÔNG chứa business logic.
 */
#[ORM\Entity]
#[ORM\Table(name: 'contest_problems')]
class ChallengeModel
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(type: 'integer')]
    public ?int $id = null;

    #[ORM\Column(name: 'contest_id', type: 'integer')]
    public int $contestId;

    #[ORM\Column(type: 'string', length: 255)]
    public string $title;

    #[ORM\Column(type: 'text', nullable: true)]
    public ?string $description = null;

    #[ORM\Column(type: 'text', nullable: true)]
    public ?string $resources = null;

    #[ORM\Column(type: 'text', nullable: true)]
    public ?string $constraints = null;

    /**
     * JSON string: [{"name":"Tính sáng tạo","weight":30},...]
     */
    #[ORM\Column(name: 'criteria_json', type: 'text', nullable: true)]
    public ?string $criteriaJson = null;

    #[ORM\Column(name: 'released_at', type: 'datetime', nullable: true)]
    public ?\DateTimeInterface $releasedAt = null;

    #[ORM\Column(name: 'created_at', type: 'datetime')]
    public \DateTimeInterface $createdAt;

    #[ORM\Column(name: 'file_url', type: 'string', length: 500, nullable: true)]
    public ?string $fileUrl = null;

    #[ORM\Column(name: 'file_name', type: 'string', length: 255, nullable: true)]
    public ?string $fileName = null;
}
