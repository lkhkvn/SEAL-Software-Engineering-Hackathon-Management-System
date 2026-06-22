<?php
namespace App\Presentation;

use App\Services\ScheduleService;
use App\Services\AuthService;
use App\Services\ActivityLogService;
use Exception;

class ScheduleController {
    private ScheduleService $scheduleService;
    private AuthService $authService;
    private ActivityLogService $activityLogService;

    public function __construct(
        ScheduleService $scheduleService,
        AuthService $authService,
        ActivityLogService $activityLogService
    ) {
        $this->scheduleService = $scheduleService;
        $this->authService = $authService;
        $this->activityLogService = $activityLogService;
    }

    /** GET /api/schedules?hackathonId=X */
    public function getAll(): void {
        $hackathonId = isset($_GET['hackathonId']) ? (int)$_GET['hackathonId'] : null;
        $data = $this->scheduleService->getAll($hackathonId);
        http_response_code(200);
        echo json_encode(['status' => 'success', 'data' => $data], JSON_UNESCAPED_UNICODE);
    }

    /** POST /api/schedules */
    public function create(): void {
        $currentUser = $this->requireAdmin();
        $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
        $newId = $this->scheduleService->create($inputData);

        $this->activityLogService->logActivity(
            $currentUser->id,
            'CREATE',
            'schedules',
            $newId,
            "Tạo sự kiện lịch trình mới: " . ($inputData['title'] ?? '') . " cho cuộc thi ID: " . ($inputData['hackathonId'] ?? ''),
            $_SERVER['REMOTE_ADDR'] ?? null
        );

        http_response_code(201);
        echo json_encode([
            'status'  => 'success',
            'message' => 'Tạo lịch trình thành công!',
            'id'      => $newId
        ], JSON_UNESCAPED_UNICODE);
    }

    /** PUT /api/schedules/{id} */
    public function update(int $id): void {
        $currentUser = $this->requireAdmin();
        $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
        $this->scheduleService->update($id, $inputData);

        $this->activityLogService->logActivity(
            $currentUser->id,
            'UPDATE',
            'schedules',
            $id,
            "Cập nhật sự kiện lịch trình ID: " . $id . ", tiêu đề: " . ($inputData['title'] ?? ''),
            $_SERVER['REMOTE_ADDR'] ?? null
        );

        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Cập nhật lịch trình thành công!'], JSON_UNESCAPED_UNICODE);
    }

    /** DELETE /api/schedules/{id} */
    public function delete(int $id): void {
        $currentUser = $this->requireAdmin();
        $this->scheduleService->delete($id);

        $this->activityLogService->logActivity(
            $currentUser->id,
            'DELETE',
            'schedules',
            $id,
            "Xóa sự kiện lịch trình ID: " . $id,
            $_SERVER['REMOTE_ADDR'] ?? null
        );

        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Xoá lịch trình thành công!'], JSON_UNESCAPED_UNICODE);
    }

    private function requireAdmin(): \App\Domain\Entity\User {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Yêu cầu phải có Token xác thực hợp lệ!'], JSON_UNESCAPED_UNICODE);
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

