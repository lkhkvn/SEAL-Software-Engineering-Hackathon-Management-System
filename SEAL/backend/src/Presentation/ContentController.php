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
}
