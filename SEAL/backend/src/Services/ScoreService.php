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
            SELECT DISTINCT
                t.id as teamId, 
                t.team_name as teamName, 
                t.category,
                s.project_name as projectName,
                s.description as projectDescription,
                s.github_url as githubUrl,
                s.demo_video_url as demoVideoUrl,
                s.file_url as fileUrl,
                COALESCE(cr.contest_id, s.contest_id) as contestId
            FROM teams t
            LEFT JOIN contest_registrations cr ON cr.team_id = t.id
            LEFT JOIN submissions s ON s.team_id = t.id
            WHERE cr.contest_id IS NOT NULL OR s.contest_id IS NOT NULL
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
                'fileUrl' => $team['fileUrl'],
                'contestId' => (int)$team['contestId'],
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
     * Create a new criterion
     */
    public function createCriteria(string $name, float $weight, int $maxScore): void {
        $conn = $this->em->getConnection();
        $conn->executeStatement(
            "INSERT INTO criteria (name, weight, max_score) VALUES (:name, :weight, :maxScore)",
            [
                'name' => $name,
                'weight' => $weight,
                'maxScore' => $maxScore
            ]
        );
    }

    /**
     * Delete a criterion
     */
    public function deleteCriteria(int $id): void {
        $conn = $this->em->getConnection();
        $conn->executeStatement("DELETE FROM criteria WHERE id = :id", ['id' => $id]);
    }

    /**
     * Get all judge-team assignments
     */
    public function getAssignments(): array {
        $conn = $this->em->getConnection();
        return $conn->executeQuery("SELECT id, judge_id as judgeId, team_id as teamId, assigned_at as assignedAt FROM judging_assignments")->fetchAllAssociative();
    }

    /**
     * Toggle assignment for a judge and a team
     */
    public function toggleAssignment(int $judgeId, int $teamId): void {
        $conn = $this->em->getConnection();
        $existing = $conn->executeQuery(
            "SELECT id FROM judging_assignments WHERE judge_id = :judgeId AND team_id = :teamId",
            ['judgeId' => $judgeId, 'teamId' => $teamId]
        )->fetchOne();

        if ($existing) {
            $conn->executeStatement("DELETE FROM judging_assignments WHERE id = :id", ['id' => $existing]);
        } else {
            $conn->executeStatement(
                "INSERT INTO judging_assignments (judge_id, team_id, assigned_at) VALUES (:judgeId, :teamId, NOW())",
                ['judgeId' => $judgeId, 'teamId' => $teamId]
            );
        }
    }

    public function getCriteria(): array {
        $conn = $this->em->getConnection();
        $criteria = $conn->executeQuery("SELECT id, name, max_score, weight FROM criteria")->fetchAllAssociative();
        
        if (empty($criteria)) {
            $defaults = [
                ['name' => 'Tính sáng tạo & thực tế', 'weight' => 0.50, 'max_score' => 10],
                ['name' => 'Hoàn thiện kỹ thuật & UI/UX', 'weight' => 0.30, 'max_score' => 10],
                ['name' => 'Kỹ năng thuyết trình chung kết', 'weight' => 0.20, 'max_score' => 10],
            ];
            foreach ($defaults as $item) {
                $conn->executeStatement(
                    "INSERT INTO criteria (name, weight, max_score) VALUES (?, ?, ?)",
                    [$item['name'], $item['weight'], $item['max_score']]
                );
            }
            $criteria = $conn->executeQuery("SELECT id, name, max_score, weight FROM criteria")->fetchAllAssociative();
        }
        
        return array_map(function($c) {
            return [
                'id' => (int)$c['id'],
                'name' => $c['name'],
                'max_score' => (int)$c['max_score'],
                'weight' => (float)$c['weight']
            ];
        }, $criteria);
    }
}
