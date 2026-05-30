<?php

namespace App\Infrastructure\Model;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'hackathons')]
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

    #[ORM\Column(type: 'datetime', nullable: true)]
    public ?\DateTimeInterface $startDate = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    public ?\DateTimeInterface $endDate = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    public ?\DateTimeInterface $registrationStart = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    public ?\DateTimeInterface $registrationEnd = null;

    #[ORM\Column(type: 'string', length: 50, options: ['default' => 'UPCOMING'])]
    public string $status = 'UPCOMING';
}
