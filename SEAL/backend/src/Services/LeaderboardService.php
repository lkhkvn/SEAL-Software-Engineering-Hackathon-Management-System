<?php
namespace App\Services;

use Doctrine\ORM\EntityManagerInterface;
use Exception;

class LeaderboardService {
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em) {
        $this->em = $em;
    }

    public function getLeaderboard(): array {
        $conn = $this->em->getConnection();

        $teams = $conn->executeQuery("SELECT id, team_name as name, category FROM teams")->fetchAllAssociative();

        $leaderboard = array_map(function($team) use ($conn) {
            $teamId = (int)$team['id'];

            $innovation   = $conn->executeQuery("SELECT COALESCE(AVG(score), 0) FROM scores WHERE team_id = :teamId AND criteria_id = 1", ['teamId' => $teamId])->fetchOne();
            $technical    = $conn->executeQuery("SELECT COALESCE(AVG(score), 0) FROM scores WHERE team_id = :teamId AND criteria_id = 2", ['teamId' => $teamId])->fetchOne();
            $presentation = $conn->executeQuery("SELECT COALESCE(AVG(score), 0) FROM scores WHERE team_id = :teamId AND criteria_id = 3", ['teamId' => $teamId])->fetchOne();
            $feasibility  = $conn->executeQuery("SELECT COALESCE(AVG(score), 0) FROM scores WHERE team_id = :teamId AND criteria_id = 4", ['teamId' => $teamId])->fetchOne();

            $memberCount = $conn->executeQuery("SELECT COUNT(*) FROM users WHERE team_id = :teamId", ['teamId' => $teamId])->fetchOne();

            $skillsCombined = $conn->executeQuery("SELECT GROUP_CONCAT(skills SEPARATOR ', ') FROM users WHERE team_id = :teamId AND skills IS NOT NULL", ['teamId' => $teamId])->fetchOne();

            $techList = [];
            if (!empty($skillsCombined)) {
                $skills = explode(',', $skillsCombined);
                foreach ($skills as $skill) {
                    $trimmed = trim($skill);
                    if (!empty($trimmed) && !in_array($trimmed, $techList)) {
                        $techList[] = $trimmed;
                    }
                }
            }
            if (empty($techList)) {
                $techList = ['React', 'Node.js'];
            }
            $techList = array_slice($techList, 0, 3);

            $totalScore = (float)$innovation + (float)$technical + (float)$presentation + (float)$feasibility;

            return [
                "teamId"       => $teamId,
                "team"         => $team['name'],
                "category"     => $team['category'],
                "innovation"   => round((float)$innovation, 1),
                "technical"    => round((float)$technical, 1),
                "presentation" => round((float)$presentation, 1),
                "feasibility"  => round((float)$feasibility, 1),
                "score"        => round($totalScore, 1),
                "members"      => (int)$memberCount,
                "tech"         => $techList
            ];
        }, $teams);

        usort($leaderboard, function($a, $b) {
            if ($b['score'] == $a['score']) return 0;
            return ($b['score'] < $a['score']) ? -1 : 1;
        });

        foreach ($leaderboard as $index => &$entry) {
            $entry['rank'] = $index + 1;
        }

        return $leaderboard;
    }

    public function getTeamsList(): array {
        $conn = $this->em->getConnection();

        $teamsQuery = "
            SELECT t.id, t.team_name as name, t.category, t.status, t.join_code as joinCode, t.max_members as maxMembers,
                   u.name as leaderName,
                   (SELECT COUNT(*) FROM users m WHERE m.team_id = t.id) as members,
                   (
                       SELECT GROUP_CONCAT(m.skills SEPARATOR ', ')
                       FROM users m
                       WHERE m.team_id = t.id AND m.skills IS NOT NULL
                   ) as skillsCombined,
                   s.project_name as projectName,
                   s.description as projectDescription,
                   s.github_url as githubUrl,
                   s.demo_video_url as demoVideoUrl
            FROM teams t
            LEFT JOIN users u ON t.leader_id = u.id
            LEFT JOIN submissions s ON s.team_id = t.id
        ";

        $teams = $conn->executeQuery($teamsQuery)->fetchAllAssociative();

        return array_map(function($team) use ($conn) {
            $teamId = (int)$team['id'];

            $scoreQuery = "
                SELECT COALESCE(SUM(avg_score), 0) as total_score
                FROM (
                    SELECT AVG(score) as avg_score
                    FROM scores
                    WHERE team_id = :teamId
                    GROUP BY criteria_id
                ) as crit_scores
            ";
            $totalScore = $conn->executeQuery($scoreQuery, ['teamId' => $teamId])->fetchOne();

            $techList = [];
            if (!empty($team['skillsCombined'])) {
                $skills = explode(',', $team['skillsCombined']);
                foreach ($skills as $skill) {
                    $trimmed = trim($skill);
                    if (!empty($trimmed) && !in_array($trimmed, $techList)) {
                        $techList[] = $trimmed;
                    }
                }
            }
            if (empty($techList)) {
                $techList = ['HTML', 'CSS', 'Javascript'];
            }
            $techList = array_slice($techList, 0, 4);

            return [
                "id"         => $teamId,
                "name"       => $team['name'],
                "members"    => (int)$team['members'],
                "maxMembers" => (int)$team['maxMembers'],
                "category"   => $team['category'],
                "status"     => $team['status'],
                "joinCode"   => $team['joinCode'],
                "leaderName" => $team['leaderName'],
                "score"      => (float)number_format((float)$totalScore, 1),
                "tech"       => $techList,
                "project"    => $team['projectName'] ? [
                    "name"         => $team['projectName'],
                    "description"  => $team['projectDescription'],
                    "githubUrl"    => $team['githubUrl'],
                    "demoVideoUrl" => $team['demoVideoUrl']
                ] : null
            ];
        }, $teams);
    }
}