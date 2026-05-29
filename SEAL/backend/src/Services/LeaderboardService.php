<?php

namespace App\Services;

use App\Domain\Repositories\ScoreRepositoryInterface;

class LeaderboardService
{
    public function __construct(
        private ScoreRepositoryInterface $scoreRepository
        // Sau này bạn có thể inject thêm TeamRepositoryInterface để lấy tên Đội thi
    ) {}

    /**
     * Thuật toán lấy toàn bộ điểm, tính toán điểm trung bình có trọng số và sắp xếp thứ hạng
     */
    public function getCalculatedLeaderboard(): array
    {
        $allScores = $this->scoreRepository->findAll();
        $leaderboardData = [];

        // 1. Gom nhóm điểm theo từng Đội thi (team_id)
        foreach ($allScores as $score) {
            $teamId = $score->getTeamId();
            
            if (!isset($leaderboardData[$teamId])) {
                $leaderboardData[$teamId] = [
                    'team_id' => $teamId,
                    'total_weighted_score' => 0.0,
                    'total_weight' => 0.0
                ];
            }

            // Giả định thực thể Score có liên kết đến Criteria để lấy trọng số (weight)
            // Hoặc bạn sẽ tối ưu câu lệnh lấy weight này tại tầng Infrastructure Doctrine sau
            $criteria = $score->getCriteria(); 
            $weight = $criteria ? $criteria->getWeight() : 1.0;

            // Tính điểm có áp dụng trọng số: Điểm số * Hệ số tiêu chí
            $leaderboardData[$teamId]['total_weighted_score'] += ($score->getValue() * $weight);
            $leaderboardData[$teamId]['total_weight'] += $weight;
        }

        // 2. Tính điểm trung bình cuối cùng cho từng đội
        $finalRankings = [];
        foreach ($leaderboardData as $data) {
            $finalScore = $data['total_weight'] > 0 
                ? ($data['total_weighted_score'] / $data['total_weight']) 
                : 0.0;

            $finalRankings[] = [
                'team_id' => $data['team_id'],
                'final_score' => round($finalScore, 2) // Làm tròn 2 chữ số thập phân
            ];
        }

        // 3. Sắp xếp thứ hạng (Leaderboard) từ điểm cao xuống điểm thấp
        usort($finalRankings, function ($a, $b) {
            return $b['final_score'] <=> $a['final_score'];
        });

        return $finalRankings;
    }
}