<?php
namespace App\Presentation;

use App\Services\ContentService;
use Exception;

class ContentController {
    public function __construct(
        private ContentService $contentService
    ) {}

    public function getOrganizations(): void {
        try {
            $orgs = $this->contentService->getOrganizations();
            http_response_code(200);
            echo json_encode(['status' => 'success', 'data' => $orgs], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function getBlogs(): void {
        try {
            $blogs = $this->contentService->getBlogs();
            http_response_code(200);
            echo json_encode(['status' => 'success', 'data' => $blogs], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function createOrganization(): void {
        try {
            $data = json_decode(file_get_contents("php://input"), true) ?? [];
            if (empty($data['name'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Organization name is required'], JSON_UNESCAPED_UNICODE);
                return;
            }

            $id = $this->contentService->createOrganization($data);
            http_response_code(201);
            echo json_encode(['status' => 'success', 'message' => 'Organization created', 'id' => $id], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function createBlog(): void {
        try {
            $data = json_decode(file_get_contents("php://input"), true) ?? [];
            if (empty($data['title']) || empty($data['content'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Blog title and content are required'], JSON_UNESCAPED_UNICODE);
                return;
            }

            $id = $this->contentService->createBlog($data);
            http_response_code(201);
            echo json_encode(['status' => 'success', 'message' => 'Blog post created', 'id' => $id], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }
}
