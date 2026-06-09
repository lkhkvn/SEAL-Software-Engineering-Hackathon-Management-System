<?php

namespace App\Presentation;

use App\Services\ChallengeService;
use App\Services\AuthService;
use Exception;

/**
 * Presentation Controller: ChallengeController
 * Tầng Presentation — chỉ xử lý HTTP request/response.
 * Không chứa business logic.
 *
 * Routes:
 *   GET  /api/hackathons/{id}/challenge          — Thí sinh lấy đề bài (có kiểm tra thời gian)
 *   GET  /api/admin/hackathons/{id}/challenge     — Admin xem đề bài đầy đủ
 *   POST /api/admin/hackathons/{id}/challenge     — Admin tạo / cập nhật đề bài
 *   POST /api/admin/hackathons/{id}/challenge/release — Admin phát đề thủ công
 */
class ChallengeController
{
    public function __construct(
        private readonly ChallengeService  $challengeService,
        private readonly AuthService       $authService,
        private readonly \App\Services\FileUploadService $fileUploadService
    ) {}

    /** GET /api/hackathons/{id}/challenge — Public (dùng cho thí sinh) */
    public function getForParticipant(int $contestId): void
    {
        try {
            $data = $this->challengeService->getForParticipant($contestId);
            http_response_code(200);
            echo json_encode(['status' => 'success', 'data' => $data], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            $code = str_contains($e->getMessage(), 'không tồn tại') ? 404 : 400;
            http_response_code($code);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** GET /api/admin/hackathons/{id}/challenge — Admin xem chi tiết đề bài */
    public function getForAdmin(int $contestId): void
    {
        $this->requireAdmin();
        try {
            $data = $this->challengeService->getForAdmin($contestId);
            http_response_code(200);
            echo json_encode(['status' => 'success', 'data' => $data], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            $code = str_contains($e->getMessage(), 'không tồn tại') ? 404 : 400;
            http_response_code($code);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** POST /api/admin/hackathons/{id}/challenge — Admin tạo / cập nhật đề bài */
    public function upsert(int $contestId): void
    {
        $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $result = $this->challengeService->upsert($contestId, $data);
            $code   = $result['action'] === 'created' ? 201 : 200;
            $msg    = $result['action'] === 'created'
                ? 'Tạo đề bài thành công!'
                : 'Cập nhật đề bài thành công!';

            http_response_code($code);
            echo json_encode([
                'status'  => 'success',
                'message' => $msg,
                'data'    => ['id' => $result['id']],
            ], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            $code = str_contains($e->getMessage(), 'không tồn tại') ? 404 : 400;
            http_response_code($code);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** POST /api/admin/hackathons/{id}/challenge/release — Admin phát đề thủ công */
    public function release(int $contestId): void
    {
        $this->requireAdmin();
        try {
            $this->challengeService->release($contestId);
            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Đã phát đề bài thành công!'], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            $code = str_contains($e->getMessage(), 'không tồn tại') ? 404 : 400;
            http_response_code($code);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** POST /api/admin/hackathons/{id}/challenge/upload — Admin upload file đề bài */
    public function uploadFile(int $contestId): void
    {
        $this->requireAdmin();

        if (!isset($_FILES['file'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Vui lòng chọn file để tải lên!'], JSON_UNESCAPED_UNICODE);
            return;
        }

        try {
            $fileInfo = $this->fileUploadService->uploadChallengeFile($_FILES['file'], $contestId);
            $this->challengeService->updateFileInfo($contestId, $fileInfo['url'], $fileInfo['name']);

            http_response_code(200);
            echo json_encode([
                'status'  => 'success',
                'message' => 'Đã tải lên file đề bài thành công!',
                'data'    => $fileInfo
            ], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    // ── HELPER ────────────────────────────────────────────────────────────────

    private function requireAdmin(): void
    {
        $headers    = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Yêu cầu phải có Token xác thực!'], JSON_UNESCAPED_UNICODE);
            exit(0);
        }

        $user = $this->authService->verifyToken($matches[1]);
        if (!$user->isAdmin()) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Chỉ Ban tổ chức (ADMIN) mới có quyền thực hiện!'], JSON_UNESCAPED_UNICODE);
            exit(0);
        }
    }
}
