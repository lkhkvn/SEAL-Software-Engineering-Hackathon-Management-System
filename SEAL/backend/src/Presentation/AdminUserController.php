<?php
namespace App\Presentation;

use App\Services\AuthService;
use App\Services\ActivityLogService;
use App\Domain\Repositories\UserRepositoryInterface;
use Exception;

class AdminUserController {
    private AuthService $authService;
    private UserRepositoryInterface $userRepository;
    private ActivityLogService $activityLogService;

    public function __construct(
        AuthService $authService,
        UserRepositoryInterface $userRepository,
        ActivityLogService $activityLogService
    ) {
        $this->authService = $authService;
        $this->userRepository = $userRepository;
        $this->activityLogService = $activityLogService;
    }

    public function getAllUsers(): void {
        $this->requireAdmin();

        $users = $this->userRepository->findAll();
        $userDataList = array_map(function($user) {
            return [
                "id"       => $user->id,
                "username" => $user->username,
                "email"    => $user->email,
                "role"     => $user->role,
                "phone"    => $user->phone,
                "skills"   => $user->skills,
                "teamId"   => $user->teamId
            ];
        }, $users);

        http_response_code(200);
        echo json_encode(["status" => "success", "data" => $userDataList], JSON_UNESCAPED_UNICODE);
    }

    public function getActivityLogs(): void {
        try {
            $this->requireAdmin();
            $logs = $this->activityLogService->getAllLogs();
            http_response_code(200);
            echo json_encode(["status" => "success", "data" => $logs], JSON_UNESCAPED_UNICODE);
        } catch (\Throwable $e) {
            file_put_contents(__DIR__ . '/debug_500.txt', $e->getMessage() . "\n" . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    public function updateRole(): void {
        $currentUser = $this->requireAdmin();

        $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
        $userId = $inputData['userId'] ?? null;
        $newRole = $inputData['role'] ?? null;

        if (!$userId || !$newRole) {
            throw new Exception("Thiếu thông tin userId hoặc vai trò (role)!");
        }

        $allowedRoles = ['ADMIN', 'JUDGE', 'PARTICIPANT', 'MENTOR'];
        if (!in_array(strtoupper($newRole), $allowedRoles)) {
            throw new Exception("Vai trò mới không hợp lệ!");
        }

        $targetUser = $this->userRepository->findById((int)$userId);
        if (!$targetUser) {
            throw new Exception("Người dùng không tồn tại!");
        }

        $oldRole = $targetUser->role;
        $updatedUser = $targetUser->withRole(strtoupper($newRole));
        $this->userRepository->save($updatedUser);

        $this->activityLogService->logActivity(
            $currentUser->id,
            'UPDATE',
            'users',
            $updatedUser->id,
            "Đã thay đổi vai trò của người dùng " . $updatedUser->username . " (" . $updatedUser->email . ") từ " . $oldRole . " sang " . strtoupper($newRole),
            $_SERVER['REMOTE_ADDR'] ?? null
        );

        http_response_code(200);
        echo json_encode([
            "status"  => "success",
            "message" => "Cập nhật vai trò người dùng thành công!",
            "data"    => [
                "id"       => $updatedUser->id,
                "username" => $updatedUser->username,
                "email"    => $updatedUser->email,
                "role"     => $updatedUser->role
            ]
        ], JSON_UNESCAPED_UNICODE);
    }

    private function requireAdmin(): \App\Domain\Entity\User {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Yêu cầu phải có Token xác thực hợp lệ!"], JSON_UNESCAPED_UNICODE);
            exit(0);
        }
        $currentUser = $this->authService->verifyToken($matches[1]);
        if (!$currentUser->isAdmin()) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Chỉ Ban tổ chức (ADMIN) mới có quyền truy cập!"], JSON_UNESCAPED_UNICODE);
            exit(0);
        }
        return $currentUser;
    }
}
