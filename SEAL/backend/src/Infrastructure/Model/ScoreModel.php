<?php

namespace App\Infrastructure\Model;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'scores')]
#[ORM\UniqueConstraint(name: 'unique_score_entry', columns: ['judge_id', 'team_id', 'criteria_id'])]
#[ORM\Index(name: 'idx_score_team', columns: ['team_id'])]
class ScoreModel
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(type: 'integer')]
    public ?int $id = null;

    // Liên kết tới UserModel (Tầng Infrastructure)
    #[ORM\ManyToOne(targetEntity: UserModel::class)]
    #[ORM\JoinColumn(name: 'judge_id', referencedColumnName: 'id', onDelete: 'CASCADE')]
    public UserModel $judge;

    // Liên kết tới TeamModel (Tầng Infrastructure)
    #[ORM\ManyToOne(targetEntity: TeamModel::class)]
    #[ORM\JoinColumn(name: 'team_id', referencedColumnName: 'id', onDelete: 'CASCADE')]
    public TeamModel $team;

    // Liên kết tới CriteriaModel (Tầng Infrastructure)
    #[ORM\ManyToOne(targetEntity: CriteriaModel::class)]
    #[ORM\JoinColumn(name: 'criteria_id', referencedColumnName: 'id', onDelete: 'CASCADE')]
    public CriteriaModel $criteria;

    // Sử dụng kiểu dữ liệu string cho decimal để tránh sai số dấu phẩy động trong PHP
    #[ORM\Column(type: 'decimal', precision: 4, scale: 2)]
    public string $score; 

    #[ORM\Column(type: 'text', nullable: true)]
    public ?string $feedback = null;
}