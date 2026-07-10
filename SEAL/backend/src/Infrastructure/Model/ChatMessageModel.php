<?php

namespace App\Infrastructure\Model;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'chat_messages')]
class ChatMessageModel
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(type: 'integer')]
    public ?int $id = null;

    #[ORM\ManyToOne(targetEntity: TeamModel::class)]
    #[ORM\JoinColumn(name: 'team_id', referencedColumnName: 'id', onDelete: 'CASCADE')]
    public TeamModel $team;

    #[ORM\ManyToOne(targetEntity: UserModel::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', onDelete: 'CASCADE')]
    public UserModel $user;

    #[ORM\Column(type: 'text')]
    public string $message;

    #[ORM\Column(name: 'created_at', type: 'datetime')]
    public \DateTime $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }
}
