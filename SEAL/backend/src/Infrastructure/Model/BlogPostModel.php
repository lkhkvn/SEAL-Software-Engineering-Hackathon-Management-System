<?php
namespace App\Infrastructure\Model;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'blog_posts')]
class BlogPostModel {
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'AUTO')]
    #[ORM\Column(type: 'integer')]
    public int $id;

    #[ORM\Column(type: 'string', length: 255)]
    public string $title;

    #[ORM\Column(type: 'text')]
    public string $summary;

    #[ORM\Column(type: 'text')]
    public string $content;

    #[ORM\Column(name: 'thumbnail_url', type: 'string', length: 255, nullable: true)]
    public ?string $thumbnailUrl = null;

    #[ORM\Column(type: 'string', length: 100)]
    public string $author;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    public ?string $tags = null; // Comma separated tags

    #[ORM\Column(name: 'created_at', type: 'datetime', options: ['default' => 'CURRENT_TIMESTAMP'])]
    public \DateTime $createdAt;

    public function __construct() {
        $this->createdAt = new \DateTime();
    }
}
