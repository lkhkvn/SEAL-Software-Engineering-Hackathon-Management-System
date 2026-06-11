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

    #[ORM\Column(name: 'cv_summary', type: 'text', nullable: true)]
    public ?string $cvSummary = null;

    #[ORM\Column(name: 'cv_education', type: 'string', length: 255, nullable: true)]
    public ?string $cvEducation = null;

    #[ORM\Column(name: 'cv_experience', type: 'text', nullable: true)]
    public ?string $cvExperience = null;

    #[ORM\Column(name: 'cv_portfolio_url', type: 'string', length: 255, nullable: true)]
    public ?string $cvPortfolioUrl = null;

    #[ORM\Column(name: 'cv_theme', type: 'string', length: 30, options: ['default' => 'ocean'])]
    public string $cvTheme = 'ocean';
}