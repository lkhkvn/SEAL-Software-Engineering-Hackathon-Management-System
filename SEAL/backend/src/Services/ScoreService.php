<?php

namespace App\Services;

use Doctrine\ORM\EntityManagerInterface;
use PDO;

class ScoreService {
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em) {
        $this->em = $em;
    }

    /**
     * Get teams with their submissions for the judge to review.
     */
    public function getTeamsForJudging(): array {
        $conn = $this->em->getConnection();
        
        $sql = "
            SELECT 
                t.id as teamId, 
                t.team_name as teamName, 
                t.category,
                s.project_name as projectName,
                s.description as projectDescription,
                s.github_url as githubUrl,
                s.demo_video_url as demoVideoUrl
            FROM teams t
            LEFT JOIN submissions s ON s.team_id = t.id
        ";
        
        $teams = $conn->executeQuery($sql)->fetchAllAssociative();
        
        // Convert keys to match JS frontend expectations
        return array_map(function($team) {
            return [
                'teamId' => (int)$team['teamId'],
                'teamName' => $team['teamName'],
                'category' => $team['category'],
                'projectName' => $team['projectName'],
                'projectDescription' => $team['projectDescription'],
                'githubUrl' => $team['githubUrl'],
                'demoVideoUrl' => $team['demoVideoUrl'],
            ];
        }, $teams);
    }

    /**
     * Submit scores for a team by a judge.
     */
    public function submitScores(int $judgeId, int $teamId, array $scores): void {
        $conn = $this->em->getConnection();
        
        $conn->beginTransaction();
        try {
            foreach ($scores as $scoreData) {
                // Check if score already exists for this judge, team, criteria
                $existing = $conn->executeQuery(
                    "SELECT id FROM scores WHERE judge_id = :judgeId AND team_id = :teamId AND criteria_id = :criteriaId",
                    [
                        'judgeId' => $judgeId,
                        'teamId' => $teamId,
                        'criteriaId' => $scoreData['criteria_id']
                    ]
                )->fetchOne();

                if ($existing) {
                    $conn->executeStatement(
                        "UPDATE scores SET score = :score, feedback = :feedback WHERE id = :id",
                        [
                            'score' => $scoreData['score'],
                            'feedback' => $scoreData['feedback'] ?? null,
                            'id' => $existing
                        ]
                    );
                } else {
                    $conn->executeStatement(
                        "INSERT INTO scores (judge_id, team_id, criteria_id, score, feedback) VALUES (:judgeId, :teamId, :criteriaId, :score, :feedback)",
                        [
                            'judgeId' => $judgeId,
                            'teamId' => $teamId,
                            'criteriaId' => $scoreData['criteria_id'],
                            'score' => $scoreData['score'],
                            'feedback' => $scoreData['feedback'] ?? null
                        ]
                    );
                }
            }
            $conn->commit();
        } catch (\Exception $e) {
            $conn->rollBack();
            throw $e;
        }
    }

    /**
     * Get all criteria from db.
     */
    public function getCriteria(): array {
        return $this->em->getConnection()->executeQuery("SELECT id, name, max_score, weight FROM criteria")->fetchAllAssociative();
    }
}
