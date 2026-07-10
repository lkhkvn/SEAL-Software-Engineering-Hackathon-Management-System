<?php
namespace App\Infrastructure\Model;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'organizations')]
class OrganizationModel {
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'AUTO')]
    #[ORM\Column(type: 'integer')]
    public int $id;

    #[ORM\Column(type: 'string', length: 255)]
    public string $name;

    #[ORM\Column(type: 'text', nullable: true)]
    public ?string $description = null;

    #[ORM\Column(name: 'logo_url', type: 'string', length: 255, nullable: true)]
    public ?string $logoUrl = null;

    #[ORM\Column(name: 'website_url', type: 'string', length: 255, nullable: true)]
    public ?string $websiteUrl = null;

    #[ORM\Column(name: 'cover_url', type: 'string', length: 255, nullable: true)]
    public ?string $coverUrl = null;

    #[ORM\Column(name: 'created_at', type: 'datetime', options: ['default' => 'CURRENT_TIMESTAMP'])]
    public \DateTime $createdAt;

    public function __construct() {
        $this->createdAt = new \DateTime();
    }
}
