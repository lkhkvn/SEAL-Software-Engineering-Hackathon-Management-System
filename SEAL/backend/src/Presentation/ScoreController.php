<?php

namespace App\Presentation;

use App\Services\ScoreService;
use App\Services\AuthService;

class ScoreController {
    private ScoreService $scoreService;
    private AuthService $authService;

    public function __construct(ScoreService $scoreService, AuthService $authService) {
        $this->scoreService = $scoreService;
        $this->authService = $authService;
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
            if (!$user || !$user->isJudge()) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Chỉ giám khảo mới được nhập điểm"]);
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

            echo json_encode([
                "status" => "success",
                "message" => "Đã lưu điểm thành công"
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
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