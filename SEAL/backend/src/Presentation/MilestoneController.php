<?php
namespace App\Presentation;

use App\Services\MilestoneService;
use App\Services\AuthService;
use Exception;

class MilestoneController {
    public function __construct(
        private MilestoneService $milestoneService,
        private AuthService $authService
    ) {}

    /** GET /api/hackathons/{id}/milestones */
    public function getByHackathon(int $hackathonId): void {
        $data = $this->milestoneService->getByHackathon($hackathonId);
        http_response_code(200);
        echo json_encode(['status' => 'success', 'data' => $data], JSON_UNESCAPED_UNICODE);
    }

    /** POST /api/hackathons/{id}/milestones */
    public function create(int $hackathonId): void {
        $this->requireAdmin();
        $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
        $newId = $this->milestoneService->create($hackathonId, $inputData);
        http_response_code(201);
        echo json_encode([
            'status'  => 'success',
            'message' => 'Tạo mốc thời gian thành công!',
            'id'      => $newId
        ], JSON_UNESCAPED_UNICODE);
    }

    /** PUT /api/milestones/{id} */
    public function update(int $id): void {
        $this->requireAdmin();
        $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
        $this->milestoneService->update($id, $inputData);
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Cập nhật mốc thời gian thành công!'], JSON_UNESCAPED_UNICODE);
    }

    /** DELETE /api/milestones/{id} */
    public function delete(int $id): void {
        $this->requireAdmin();
        $this->milestoneService->delete($id);
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Xoá mốc thời gian thành công!'], JSON_UNESCAPED_UNICODE);
    }

    private function requireAdmin(): void {
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
    }
}
