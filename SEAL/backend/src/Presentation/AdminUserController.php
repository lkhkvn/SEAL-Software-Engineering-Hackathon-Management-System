<?php
namespace App\Presentation;

use App\Services\AuthService;
use App\Domain\Repositories\UserRepositoryInterface;
use Exception;

class AdminUserController {
    private AuthService $authService;
    private UserRepositoryInterface $userRepository;

    public function __construct(AuthService $authService, UserRepositoryInterface $userRepository) {
        $this->authService = $authService;
        $this->userRepository = $userRepository;
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

    public function updateRole(): void {
        $this->requireAdmin();

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

        $updatedUser = $targetUser->withRole(strtoupper($newRole));
        $this->userRepository->save($updatedUser);

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

    private function requireAdmin(): void {
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
    }
}
