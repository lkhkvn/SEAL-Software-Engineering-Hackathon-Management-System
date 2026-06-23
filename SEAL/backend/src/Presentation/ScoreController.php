<?php

namespace App\Presentation;

use App\Services\ScoreService;
use App\Services\AuthService;
use App\Services\NotificationService;
use App\Services\ActivityLogService;

class ScoreController {
    private ScoreService $scoreService;
    private AuthService $authService;
    private NotificationService $notificationService;
    private ActivityLogService $activityLogService;

    public function __construct(
        ScoreService $scoreService,
        AuthService $authService,
        NotificationService $notificationService,
        ActivityLogService $activityLogService
    ) {
        $this->scoreService = $scoreService;
        $this->authService = $authService;
        $this->notificationService = $notificationService;
        $this->activityLogService = $activityLogService;
    }

    /**
     * Lấy danh sách đội thi kèm dự án cho Giám khảo chấm điểm
     */
    public function getTeamsForJudging(): void {
        try {
            $user = $this->getCurrentUser();
            if (!$user || (!$user->isJudge() && !$user->isAdmin())) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Forbidden"]);
                return;
            }

            $teams = $this->scoreService->getTeamsForJudging();
            $criteria = $this->scoreService->getCriteria();

            echo json_encode([
                "status" => "success",
                "data" => [
                    "teams" => $teams,
                    "criteria" => $criteria
                ]
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => ltrim($e->getMessage())]);
        }
    }

    /**
     * Nộp điểm cho một đội
     */
    public function submitScores(): void {
        try {
            $user = $this->getCurrentUser();
            if (!$user || (!$user->isJudge() && !$user->isAdmin())) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Chỉ giám khảo hoặc Ban tổ chức mới được nhập điểm"]);
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $teamId = $input['teamId'] ?? null;
            $scores = $input['scores'] ?? null; // Array of ['criteria_id' => X, 'score' => Y, 'feedback' => '']

            if (!$teamId || !is_array($scores)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Thiếu teamId hoặc scores"]);
                return;
            }

            $this->scoreService->submitScores($user->id, $teamId, $scores);
            $this->notificationService->notifyTeamScored($teamId, $user->id);

            echo json_encode([
                "status" => "success",
                "message" => "Đã lưu điểm thành công"
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    public function getAllCriteria(): void {
        try {
            $this->requireAdmin();
            $criteria = $this->scoreService->getCriteria();
            echo json_encode(["status" => "success", "data" => $criteria], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function createCriteria(): void {
        try {
            $currentUser = $this->requireAdmin();
            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $name = trim($input['name'] ?? '');
            $weight = (float)($input['weight'] ?? 0);
            $maxScore = (int)($input['maxScore'] ?? 10);

            if (empty($name) || $weight <= 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Tên tiêu chí và trọng số không được để trống!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $this->scoreService->createCriteria($name, $weight, $maxScore);

            $this->activityLogService->logActivity(
                $currentUser->id,
                'CREATE',
                'criteria',
                null,
                "Tạo tiêu chí chấm điểm mới: " . $name . ", trọng số: " . ($weight * 100) . "%, điểm tối đa: " . $maxScore,
                $_SERVER['REMOTE_ADDR'] ?? null
            );

            echo json_encode(["status" => "success", "message" => "Đã tạo tiêu chí thành công!"], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function deleteCriteria(int $id): void {
        try {
            $currentUser = $this->requireAdmin();
            $this->scoreService->deleteCriteria($id);

            $this->activityLogService->logActivity(
                $currentUser->id,
                'DELETE',
                'criteria',
                $id,
                "Xóa tiêu chí chấm điểm ID: " . $id,
                $_SERVER['REMOTE_ADDR'] ?? null
            );

            echo json_encode(["status" => "success", "message" => "Đã xóa tiêu chí thành công!"], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function getAssignments(): void {
        try {
            $this->requireAdmin();
            $assignments = $this->scoreService->getAssignments();
            echo json_encode(["status" => "success", "data" => $assignments], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function toggleAssignment(): void {
        try {
            $currentUser = $this->requireAdmin();
            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $judgeId = (int)($input['judgeId'] ?? 0);
            $teamId = (int)($input['teamId'] ?? 0);

            if ($judgeId <= 0 || $teamId <= 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Thiếu thông tin judgeId hoặc teamId!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $this->scoreService->toggleAssignment($judgeId, $teamId);

            $this->activityLogService->logActivity(
                $currentUser->id,
                'ASSIGN_JUDGE',
                'judging_assignments',
                null,
                "Thay đổi phân công chấm thi cho Giám khảo ID: " . $judgeId . " đối với Đội thi ID: " . $teamId,
                $_SERVER['REMOTE_ADDR'] ?? null
            );

            echo json_encode(["status" => "success", "message" => "Cập nhật phân công thành công!"], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    private function requireAdmin(): \App\Domain\Entity\User {
        $user = $this->getCurrentUser();
        if (!$user || !$user->isAdmin()) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Chỉ Ban tổ chức (ADMIN) mới có quyền truy cập!"], JSON_UNESCAPED_UNICODE);
            exit(0);
        }
        return $user;
    }

    private function getCurrentUser() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            throw new \Exception("Yêu cầu phải có Token xác thực!");
        }
        return $this->authService->verifyToken($matches[1]);
    }
}