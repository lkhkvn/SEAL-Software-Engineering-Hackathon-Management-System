<?php

namespace App\Presentation;

use App\Services\ChallengeService;
use App\Services\AuthService;
use App\Services\ActivityLogService;
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
        private readonly \App\Services\FileUploadService $fileUploadService,
        private readonly ActivityLogService $activityLogService
    ) {}

    /** GET /api/hackathons/{id}/challenge — Public (dùng cho thí sinh) */
    public function getForParticipant(int $contestId): void
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Yêu cầu đăng nhập để xem đề bài!"], JSON_UNESCAPED_UNICODE);
            return;
        }

        try {
            $currentUser = $this->authService->verifyToken($matches[1]);
            $data = $this->challengeService->getForParticipant($contestId, $currentUser);
            http_response_code(200);
            echo json_encode(['status' => 'success', 'data' => $data], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            $code = str_contains($e->getMessage(), 'không tồn tại') ? 404 : 400;
            if (str_contains($e->getMessage(), 'đăng nhập') || str_contains($e->getMessage(), 'Token') || str_contains($e->getMessage(), 'xác thực')) {
                $code = 401;
            }
            if (str_contains($e->getMessage(), 'chờ duyệt') || str_contains($e->getMessage(), 'chưa đăng ký') || str_contains($e->getMessage(), 'đội thi')) {
                $code = 403;
            }
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
        $currentUser = $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $result = $this->challengeService->upsert($contestId, $data);
            $code   = $result['action'] === 'created' ? 201 : 200;
            $msg    = $result['action'] === 'created'
                ? 'Tạo đề bài thành công!'
                : 'Cập nhật đề bài thành công!';

            $this->activityLogService->logActivity(
                $currentUser->id,
                $result['action'] === 'created' ? 'CREATE' : 'UPDATE',
                'contest_problems',
                $result['id'],
                ($result['action'] === 'created' ? "Tạo đề bài" : "Cập nhật đề bài") . " cho cuộc thi ID: " . $contestId . ", tiêu đề: " . ($data['title'] ?? ''),
                $_SERVER['REMOTE_ADDR'] ?? null
            );

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
        $currentUser = $this->requireAdmin();
        try {
            $this->challengeService->release($contestId);

            $this->activityLogService->logActivity(
                $currentUser->id,
                'RELEASE_CHALLENGE',
                'contest_problems',
                $contestId,
                "Phát đề bài thủ công cho cuộc thi ID: " . $contestId,
                $_SERVER['REMOTE_ADDR'] ?? null
            );

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
        $currentUser = $this->requireAdmin();

        if (!isset($_FILES['file'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Vui lòng chọn file để tải lên!'], JSON_UNESCAPED_UNICODE);
            return;
        }

        try {
            $fileInfo = $this->fileUploadService->uploadChallengeFile($_FILES['file'], $contestId);
            $this->challengeService->updateFileInfo($contestId, $fileInfo['url'], $fileInfo['name']);

            $this->activityLogService->logActivity(
                $currentUser->id,
                'UPLOAD_FILE',
                'contest_problems',
                $contestId,
                "Tải lên tài liệu đề thi cho cuộc thi ID: " . $contestId . ", tên file: " . $fileInfo['name'],
                $_SERVER['REMOTE_ADDR'] ?? null
            );

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

    private function requireAdmin(): \App\Domain\Entity\User
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
        return $user;
    }
}

