<?php

namespace App\Infrastructure\Model;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'schedules')]
class ScheduleModel
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(type: 'integer')]
    public ?int $id = null;

    #[ORM\Column(name: 'hackathon_id', type: 'integer', nullable: true)]
    public ?int $hackathonId = null;

    #[ORM\Column(type: 'string', length: 255)]
    public string $title;

    #[ORM\Column(type: 'text', nullable: true)]
    public ?string $description = null;

    #[ORM\Column(type: 'datetime')]
    public \DateTimeInterface $startTime;

    #[ORM\Column(type: 'datetime', nullable: true)]
    public ?\DateTimeInterface $endTime = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    public ?string $location = null;
}
