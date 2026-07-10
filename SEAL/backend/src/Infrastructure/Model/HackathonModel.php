<?php

namespace App\Infrastructure\Model;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'contests')]
#[ORM\Index(name: 'idx_contests_created_at', columns: ['created_at'])]
class HackathonModel
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(type: 'integer')]
    public ?int $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    public string $name;

    #[ORM\Column(type: 'text', nullable: true)]
    public ?string $description = null;

    #[ORM\Column(name: 'start_date', type: 'datetime', nullable: true)]
    public ?\DateTimeInterface $startDate = null;

    #[ORM\Column(name: 'end_date', type: 'datetime', nullable: true)]
    public ?\DateTimeInterface $endDate = null;

    #[ORM\Column(name: 'registration_deadline', type: 'datetime', nullable: true)]
    public ?\DateTimeInterface $registrationDeadline = null;

    #[ORM\Column(name: 'submission_deadline', type: 'datetime', nullable: true)]
    public ?\DateTimeInterface $submissionDeadline = null;

    #[ORM\Column(type: 'string', length: 50, options: ['default' => 'UPCOMING'])]
    public string $status = 'UPCOMING';

    #[ORM\Column(type: 'string', length: 50, nullable: true)]
    public ?string $category = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    public ?string $location = null;

    #[ORM\Column(name: 'max_teams', type: 'integer', nullable: true)]
    public ?int $maxTeams = null;

    #[ORM\Column(type: 'text', nullable: true)]
    public ?string $rules = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    public ?string $prize = null;

    #[ORM\Column(name: 'prize_details', type: 'text', nullable: true)]
    public ?string $prizeDetails = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    public ?string $image = null;

    #[ORM\Column(name: 'logo_url', type: 'string', length: 255, nullable: true)]
    public ?string $logoUrl = null;

    #[ORM\Column(type: 'text', nullable: true)]
    public ?string $schedule = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    public ?string $organizer = null;

    #[ORM\Column(type: 'text', nullable: true)]
    public ?string $criteria = null;

    #[ORM\Column(name: 'created_at', type: 'datetime', options: ['default' => 'CURRENT_TIMESTAMP'])]
    public \DateTime $createdAt;

    public function __construct() {
        $this->createdAt = new \DateTime();
    }
}
