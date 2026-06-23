<?php
namespace App\Presentation;

use App\Services\AuthService;
use App\Services\ActivityLogService;
use App\DTO\RegisterRequestDTO;
use App\DTO\LoginRequestDTO;
use Exception;

class AuthController {
    private AuthService $authService;
    private ActivityLogService $activityLogService;

    public function __construct(AuthService $authService, ActivityLogService $activityLogService) {
        $this->authService = $authService;
        $this->activityLogService = $activityLogService;
    }

    public function register(): void {
        $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
        $dto = new RegisterRequestDTO($inputData);
        $user = $this->authService->register($dto);

        http_response_code(201);
        echo json_encode([
            "status"  => "success",
            "message" => "Đăng ký tài khoản thành công!",
            "data"    => ["username" => $user->username, "email" => $user->email]
        ], JSON_UNESCAPED_UNICODE);
    }

    public function login(): void {
        $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
        $dto = new LoginRequestDTO($inputData);
        $result = $this->authService->login($dto);

        if (strtoupper($result['user']['role'] ?? '') === 'ADMIN') {
            $this->activityLogService->logActivity(
                (int)$result['user']['id'],
                'LOGIN',
                'users',
                (int)$result['user']['id'],
                "Admin " . $result['user']['username'] . " đăng nhập vào hệ thống",
                $_SERVER['REMOTE_ADDR'] ?? null
            );
        }

        http_response_code(200);
        echo json_encode([
            "status"  => "success",
            "message" => "Đăng nhập thành công!",
            "data"    => $result
        ], JSON_UNESCAPED_UNICODE);
    }

    public function logout(): void {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            try {
                $user = $this->authService->verifyToken($matches[1]);
                if ($user->isAdmin()) {
                    $this->activityLogService->logActivity(
                        $user->id,
                        'LOGOUT',
                        'users',
                        $user->id,
                        "Admin " . $user->username . " đăng xuất khỏi hệ thống",
                        $_SERVER['REMOTE_ADDR'] ?? null
                    );
                }
            } catch (\Exception $e) {
                // Ignore expired or invalid token errors on logout
            }
        }
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Đăng xuất thành công"
        ], JSON_UNESCAPED_UNICODE);
    }

    public function createAccount(): void {
        $currentUser = $this->requireAdmin();

        $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
        $dto = new RegisterRequestDTO($inputData);
        $role = strtoupper($inputData['role'] ?? 'JUDGE');

        if (!in_array($role, ['JUDGE', 'MENTOR'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vai trò không hợp lệ!"], JSON_UNESCAPED_UNICODE);
            return;
        }

        $account = $this->authService->registerAccountWithRole($dto, $role);

        $this->activityLogService->logActivity(
            $currentUser->id,
            'CREATE',
            'users',
            $account->id,
            "Đã tạo tài khoản " . $role . " mới: " . $account->username . " (" . $account->email . ")",
            $_SERVER['REMOTE_ADDR'] ?? null
        );

        http_response_code(201);
        echo json_encode([
            "status"  => "success",
            "message" => "Tạo tài khoản thành công!",
            "data"    => ["username" => $account->username, "email" => $account->email, "role" => $account->role]
        ], JSON_UNESCAPED_UNICODE);
    }

    private function requireAdmin(): object {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Yêu cầu phải có Token xác thực!"], JSON_UNESCAPED_UNICODE);
            exit(0);
        }
        $user = $this->authService->verifyToken($matches[1]);
        if (!$user->isAdmin()) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Chỉ Ban tổ chức (ADMIN) mới có quyền thực hiện!"], JSON_UNESCAPED_UNICODE);
            exit(0);
        }
        return $user;
    }
}
