<?php

namespace App\Presentation;

use App\Services\NotificationService;
use App\Services\AuthService;
use Exception;

/**
 * Presentation Controller: NotificationController
 * Tầng Presentation — chỉ xử lý HTTP request/response.
 *
 * Routes:
 *   GET  /api/notifications             — Lấy danh sách thông báo (auth required)
 *   POST /api/notifications/{id}/read   — Đánh dấu đã đọc
 *   POST /api/notifications/read-all    — Đánh dấu tất cả đã đọc
 */
class NotificationController
{
    public function __construct(
        private readonly NotificationService $notificationService,
        private readonly AuthService         $authService
    ) {}

    /** GET /api/notifications — Lấy thông báo của user đang đăng nhập */
    public function list(): void
    {
        $user = $this->requireAuth();
        try {
            $notifications = $this->notificationService->getUserNotifications($user->id);
            $unread        = $this->notificationService->countUnread($user->id);
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'data'   => [
                    'notifications' => $notifications,
                    'unread_count'  => $unread,
                ],
            ], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** POST /api/notifications/{id}/read — Đánh dấu 1 thông báo đã đọc */
    public function markRead(int $notifId): void
    {
        $user = $this->requireAuth();
        try {
            $this->notificationService->markAsRead($notifId, $user->id);
            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Đã đánh dấu đã đọc.'], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** POST /api/notifications/read-all — Đánh dấu tất cả đã đọc */
    public function markAllRead(): void
    {
        $user = $this->requireAuth();
        try {
            $this->notificationService->markAllAsRead($user->id);
            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Đã đánh dấu tất cả là đã đọc.'], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    // ── HELPER ────────────────────────────────────────────────────────────────

    private function requireAuth(): object
    {
        $headers    = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Yêu cầu phải có Token xác thực!'], JSON_UNESCAPED_UNICODE);
            exit(0);
        }

        return $this->authService->verifyToken($matches[1]);
    }
}
