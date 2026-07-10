<?php
namespace App\Services;

use Doctrine\ORM\EntityManagerInterface;
use App\Infrastructure\Model\OrganizationModel;
use App\Infrastructure\Model\BlogPostModel;

class ContentService {
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em) {
        $this->em = $em;
    }

    public function getOrganizations(): array {
        $repository = $this->em->getRepository(OrganizationModel::class);
        $orgs = $repository->findBy([], ['createdAt' => 'DESC']);
        $result = [];
        foreach ($orgs as $org) {
            $result[] = [
                'id' => $org->id,
                'name' => $org->name,
                'description' => $org->description,
                'logoUrl' => $org->logoUrl,
                'coverUrl' => $org->coverUrl,
                'websiteUrl' => $org->websiteUrl
            ];
        }
        return $result;
    }

    public function getBlogs(): array {
        $repository = $this->em->getRepository(BlogPostModel::class);
        $blogs = $repository->findBy([], ['createdAt' => 'DESC']);
        $result = [];
        foreach ($blogs as $blog) {
            $result[] = [
                'id' => $blog->id,
                'title' => $blog->title,
                'summary' => $blog->summary,
                'content' => $blog->content,
                'thumbnailUrl' => $blog->thumbnailUrl,
                'author' => $blog->author,
                'authorAvatarUrl' => $blog->authorAvatarUrl,
                'tags' => $blog->tags ? array_map('trim', explode(',', $blog->tags)) : [],
                'createdAt' => $blog->createdAt->format('Y-m-d H:i:s')
            ];
        }
        return $result;
    }

    public function createOrganization(array $data): int {
        $org = new OrganizationModel();
        $org->name = trim($data['name'] ?? '');
        if (isset($data['description'])) $org->description = trim($data['description']);
        if (isset($data['logoUrl'])) $org->logoUrl = trim($data['logoUrl']);
        if (isset($data['coverUrl'])) $org->coverUrl = trim($data['coverUrl']);
        if (isset($data['websiteUrl'])) $org->websiteUrl = trim($data['websiteUrl']);

        $this->em->persist($org);
        $this->em->flush();
        return $org->id;
    }

    public function createBlog(array $data): int {
        $blog = new BlogPostModel();
        $blog->title = trim($data['title'] ?? '');
        $blog->summary = trim($data['summary'] ?? '');
        $blog->content = trim($data['content'] ?? '');
        $blog->author = trim($data['author'] ?? 'Admin');
        
        if (isset($data['thumbnailUrl'])) $blog->thumbnailUrl = trim($data['thumbnailUrl']);
        if (isset($data['authorAvatarUrl'])) $blog->authorAvatarUrl = trim($data['authorAvatarUrl']);
        if (isset($data['tags'])) {
            $tags = is_array($data['tags']) ? implode(',', $data['tags']) : trim($data['tags']);
            $blog->tags = $tags;
        }

        $this->em->persist($blog);
        $this->em->flush();
        return $blog->id;
    }
}
