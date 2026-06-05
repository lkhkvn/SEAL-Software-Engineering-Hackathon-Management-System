<?php

namespace App\Presentation;

use App\Services\LeaderboardService;
use Exception;

class LeaderboardController
{
    public function __construct(
        private LeaderboardService $leaderboardService
    ) {}

    public function handleGetLeaderboard(): void
    {
        header('Content-Type: application/json');

        try {
            $rankings = $this->leaderboardService->getCalculatedLeaderboard();

            echo json_encode([
                'status' => 'success',
                'data' => $rankings
            ]);
        } catch (Exception $e) {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode([
                'status' => 'error',
                'message' => 'Không thể tải bảng xếp hạng lúc này.'
            ]);
        }
    }
}