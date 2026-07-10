<?php
namespace App\Presentation;

use App\Services\LeaderboardService;
use Exception;

class LeaderboardController {
    public function __construct(
        private LeaderboardService $leaderboardService
    ) {}

    public function getLeaderboard(): void {
        $contestId = isset($_GET['contestId']) ? (int)$_GET['contestId'] : 0;
        $rankings = $this->leaderboardService->getLeaderboard($contestId);
        http_response_code(200);
        echo json_encode(['status' => 'success', 'data' => $rankings], JSON_UNESCAPED_UNICODE);
    }

    public function getTeamsList(): void {
        $teams = $this->leaderboardService->getTeamsList();
        http_response_code(200);
        echo json_encode(['status' => 'success', 'data' => $teams], JSON_UNESCAPED_UNICODE);
    }
}