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
                'tags' => $blog->tags ? array_map('trim', explode(',', $blog->tags)) : [],
                'createdAt' => $blog->createdAt->format('Y-m-d H:i:s')
            ];
        }
        return $result;
    }
}
