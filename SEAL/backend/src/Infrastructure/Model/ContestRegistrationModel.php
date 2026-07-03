<?php
namespace App\Infrastructure\Model;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'contest_registrations')]
class ContestRegistrationModel {
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'AUTO')]
    #[ORM\Column(type: 'integer')]
    public int $id;

    #[ORM\Column(name: 'contest_id', type: 'integer')]
    public int $contestId;

    #[ORM\Column(name: 'team_id', type: 'integer')]
    public int $teamId;

    #[ORM\Column(type: 'string', length: 20, options: ['default' => 'PENDING'])]
    public string $status = 'PENDING';

    #[ORM\Column(name: 'registered_at', type: 'datetime', options: ['default' => 'CURRENT_TIMESTAMP'])]
    public \DateTime $registeredAt;

    public function __construct() {
        $this->registeredAt = new \DateTime();
    }
}
