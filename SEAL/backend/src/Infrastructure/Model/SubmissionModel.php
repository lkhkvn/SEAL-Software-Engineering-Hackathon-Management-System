<?php

namespace App\Infrastructure\Model;

use Doctrine\ORM\Mapping as ORM;
use DateTime;

#[ORM\Entity]
#[ORM\Table(name: 'submissions')]
class SubmissionModel
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(type: 'integer')]
    public ?int $id = null;

    // Thiết lập mối quan hệ 1-1 với TeamModel (Tầng Infrastructure)
    #[ORM\OneToOne(targetEntity: TeamModel::class)]
    #[ORM\JoinColumn(name: 'team_id', referencedColumnName: 'id', unique: true, onDelete: 'CASCADE')]
    public TeamModel $team;

    #[ORM\Column(name: 'project_name', type: 'string', length: 150, nullable: true)]
    public ?string $projectName = null;

    #[ORM\Column(type: 'text', nullable: true)]
    public ?string $description = null;

    #[ORM\Column(name: 'github_url', type: 'string', length: 255, nullable: true)]
    public ?string $githubUrl = null;

    #[ORM\Column(name: 'demo_video_url', type: 'string', length: 255, nullable: true)]
    public ?string $demoVideoUrl = null;

    #[ORM\Column(name: 'file_url', type: 'string', length: 255, nullable: true)]
    public ?string $fileUrl = null;

    #[ORM\Column(type: 'text', nullable: true)]
    public ?string $notes = null;

    #[ORM\Column(name: 'submitted_at', type: 'datetime', nullable: true)]
    public ?DateTime $submittedAt = null;
}