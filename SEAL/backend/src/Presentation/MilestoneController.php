<?php
namespace App\Presentation;

use App\Services\MilestoneService;
use App\Services\AuthService;
use App\Services\ActivityLogService;
use Exception;

class MilestoneController {
    private MilestoneService $milestoneService;
    private AuthService $authService;
    private ActivityLogService $activityLogService;

    public function __construct(
        MilestoneService $milestoneService,
        AuthService $authService,
        ActivityLogService $activityLogService
    ) {
        $this->milestoneService = $milestoneService;
        $this->authService = $authService;
        $this->activityLogService = $activityLogService;
    }

    /** GET /api/hackathons/{id}/milestones */
    public function getByHackathon(int $hackathonId): void {
        $data = $this->milestoneService->getByHackathon($hackathonId);
        http_response_code(200);
        echo json_encode(['status' => 'success', 'data' => $data], JSON_UNESCAPED_UNICODE);
    }

    /** POST /api/hackathons/{id}/milestones */
    public function create(int $hackathonId): void {
        $currentUser = $this->requireAdmin();
        $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
        $newId = $this->milestoneService->create($hackathonId, $inputData);

        $this->activityLogService->logActivity(
            $currentUser->id,
            'CREATE',
            'milestones',
            $newId,
            "Tạo mới mốc thời gian: " . ($inputData['name'] ?? '') . " cho cuộc thi ID: " . $hackathonId,
            $_SERVER['REMOTE_ADDR'] ?? null
        );

        http_response_code(201);
        echo json_encode([
            'status'  => 'success',
            'message' => 'Tạo mốc thời gian thành công!',
            'id'      => $newId
        ], JSON_UNESCAPED_UNICODE);
    }

    /** PUT /api/milestones/{id} */
    public function update(int $id): void {
        $currentUser = $this->requireAdmin();
        $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
        $this->milestoneService->update($id, $inputData);

        $this->activityLogService->logActivity(
            $currentUser->id,
            'UPDATE',
            'milestones',
            $id,
            "Cập nhật mốc thời gian ID: " . $id . ", tên: " . ($inputData['name'] ?? ''),
            $_SERVER['REMOTE_ADDR'] ?? null
        );

        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Cập nhật mốc thời gian thành công!'], JSON_UNESCAPED_UNICODE);
    }

    /** DELETE /api/milestones/{id} */
    public function delete(int $id): void {
        $currentUser = $this->requireAdmin();
        $this->milestoneService->delete($id);

        $this->activityLogService->logActivity(
            $currentUser->id,
            'DELETE',
            'milestones',
            $id,
            "Xóa mốc thời gian ID: " . $id,
            $_SERVER['REMOTE_ADDR'] ?? null
        );

        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Xoá mốc thời gian thành công!'], JSON_UNESCAPED_UNICODE);
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

