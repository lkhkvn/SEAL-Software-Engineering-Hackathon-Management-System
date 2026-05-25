<?php

namespace App\Infrastructure\Model;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'users')]
#[ORM\Index(name: 'idx_user_role', columns: ['role'])]
#[ORM\Index(name: 'idx_user_email', columns: ['email'])]
class UserModel
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(type: 'integer')]
    public ?int $id = null;

    #[ORM\Column(type: 'string', length: 100)]
    public string $name;

    #[ORM\Column(type: 'string', length: 100, unique: true)]
    public string $email;

    #[ORM\Column(type: 'string', length: 255)]
    public string $password;

    #[ORM\Column(type: 'string', length: 20, options: ['default' => 'PARTICIPANT'])]
    public string $role;

    #[ORM\Column(type: 'string', length: 15, nullable: true)]
    public ?string $phone = null;

    #[ORM\Column(type: 'text', nullable: true)]
    public ?string $skills = null;

    #[ORM\Column(name: 'team_id', type: 'integer', nullable: true)]
    public ?int $teamId = null;
}