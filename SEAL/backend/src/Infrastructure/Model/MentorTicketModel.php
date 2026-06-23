<?php
namespace App\Infrastructure\Model;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'mentor_tickets')]
class MentorTicketModel
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(type: 'integer')]
    public ?int $id = null;

    #[ORM\Column(name: 'team_id', type: 'integer')]
    public int $teamId;

    #[ORM\Column(name: 'mentor_id', type: 'integer', nullable: true)]
    public ?int $mentorId = null;

    #[ORM\Column(type: 'string', length: 255)]
    public string $topic;

    #[ORM\Column(type: 'string', length: 20, options: ['default' => 'OPEN'])]
    public string $status = 'OPEN'; // OPEN, ASSIGNED, RESOLVED

    #[ORM\Column(name: 'created_at', type: 'datetime_immutable')]
    public \DateTimeImmutable $createdAt;
    
    public function __construct() {
        $this->createdAt = new \DateTimeImmutable();
    }
}
