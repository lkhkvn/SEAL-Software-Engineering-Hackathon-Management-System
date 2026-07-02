<?php

namespace App\Infrastructure\Model;

use Doctrine\ORM\Mapping as ORM;
use DateTime;

#[ORM\Entity]
#[ORM\Table(name: 'judging_assignments')]
#[ORM\UniqueConstraint(name: 'unique_judge_team', columns: ['judge_id', 'team_id'])]
class JudgingAssignmentModel
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(type: 'integer')]
    public ?int $id = null;

    // Định nghĩa mối quan hệ trỏ đến UserModel (Tầng Infrastructure)
    #[ORM\ManyToOne(targetEntity: UserModel::class)]
    #[ORM\JoinColumn(name: 'judge_id', referencedColumnName: 'id', onDelete: 'CASCADE')]
    public UserModel $judge;

    // Định nghĩa mối quan hệ trỏ đến TeamModel (Bạn tạo file TeamModel tương tự nhé)
    #[ORM\ManyToOne(targetEntity: TeamModel::class)]
    #[ORM\JoinColumn(name: 'team_id', referencedColumnName: 'id', onDelete: 'CASCADE')]
    public TeamModel $team;

    #[ORM\Column(name: 'status', type: 'string', length: 20, options: ['default' => 'PENDING'])]
    public string $status = 'PENDING';

    #[ORM\Column(name: 'assigned_at', type: 'datetime')]
    public DateTime $assignedAt;

    public function __construct()
    {
        $this->assignedAt = new DateTime();
    }
}