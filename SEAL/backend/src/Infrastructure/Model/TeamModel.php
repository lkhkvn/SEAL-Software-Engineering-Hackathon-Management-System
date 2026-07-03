<?php

namespace App\Infrastructure\Model;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity]
#[ORM\Table(name: 'teams')]
#[ORM\Index(name: 'idx_team_code', columns: ['join_code'])]
class TeamModel
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(type: 'integer')]
    public ?int $id = null;

    // Quan hệ 1-N lấy danh sách thành viên thuộc nhóm (Trỏ đến UserModel)
    #[ORM\OneToMany(mappedBy: 'team', targetEntity: UserModel::class)]
    public Collection $members;

    // Quan hệ 1-1 với bài nộp (Trỏ đến SubmissionModel)
    #[ORM\OneToOne(mappedBy: 'team', targetEntity: SubmissionModel::class, cascade: ['remove'])]
    public ?SubmissionModel $submission = null;

    #[ORM\Column(name: 'team_name', type: 'string', length: 100, unique: true)]
    public string $teamName;

    #[ORM\Column(type: 'string', length: 50)]
    public string $category;

    #[ORM\Column(name: 'join_code', type: 'string', length: 10, unique: true)]
    public string $joinCode;

    // Mối quan hệ Trưởng nhóm trỏ đến UserModel
    #[ORM\ManyToOne(targetEntity: UserModel::class)]
    #[ORM\JoinColumn(name: 'leader_id', referencedColumnName: 'id', onDelete: 'RESTRICT')]
    public UserModel $leader;

    #[ORM\Column(type: 'string', length: 20, options: ['default' => 'APPROVED'])]
    public string $status = 'APPROVED';

    #[ORM\Column(name: 'max_members', type: 'integer', options: ['default' => 5])]
    public int $maxMembers = 5;

    public function __construct()
    {
        $this->members = new ArrayCollection();
    }
}