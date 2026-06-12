<?php
namespace App\Presentation;

use App\Services\AuthService;
use Doctrine\ORM\EntityManagerInterface;
use Exception;

class UserController {
    public function __construct(
        private AuthService $authService,
        private EntityManagerInterface $em
    ) {}

    /** GET /api/users/me/team - Lấy đội hiện tại của user đang đăng nhập */
    public function getMyTeam(): void {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Yêu cầu phải có Token xác thực!'], JSON_UNESCAPED_UNICODE);
            return;
        }

        $currentUser = $this->authService->verifyToken($matches[1]);
        $conn = $this->em->getConnection();

        // Tìm đội của user qua team_members hoặc users.team_id
        $row = $conn->executeQuery("
            SELECT t.id, t.team_name as name, t.join_code as joinCode, t.category,
                   t.max_members as maxMembers, t.status, t.leader_id as leaderId,
                   (SELECT COUNT(*) FROM team_members tm2 WHERE tm2.team_id = t.id) as memberCount
            FROM teams t
            INNER JOIN team_members tm1 ON tm1.team_id = t.id
            WHERE tm1.user_id = :userId
            LIMIT 1
        ", ['userId' => $currentUser->id])->fetchAssociative();

        if (!$row) {
            http_response_code(200);
            echo json_encode(['status' => 'success', 'data' => null], JSON_UNESCAPED_UNICODE);
            return;
        }

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'data'   => [
                'id'          => (int)$row['id'],
                'name'        => $row['name'],
                'joinCode'    => $row['joinCode'],
                'category'    => $row['category'],
                'maxMembers'  => (int)$row['maxMembers'],
                'memberCount' => (int)$row['memberCount'],
                'status'      => $row['status'],
                'isLeader'    => (int)$row['leaderId'] === $currentUser->id,
            ]
        ], JSON_UNESCAPED_UNICODE);
    }

    /** GET /api/users/me/cv - Lấy thông tin CV hiện tại của user đang đăng nhập */
    public function getCV(): void {
        try {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

            if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'Yêu cầu phải có Token xác thực!'], JSON_UNESCAPED_UNICODE);
                return;
            }

            $currentUser = $this->authService->verifyToken($matches[1]);
            
            $conn = $this->em->getConnection();
            $row = $conn->executeQuery("
                SELECT cv_summary, cv_education, cv_experience, cv_portfolio_url, cv_theme, skills
                FROM users
                WHERE id = :id
            ", ['id' => $currentUser->id])->fetchAssociative();

            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'data' => [
                    'summary' => $row['cv_summary'] ?? '',
                    'education' => $row['cv_education'] ?? '',
                    'experience' => $row['cv_experience'] ?? '',
                    'portfolioUrl' => $row['cv_portfolio_url'] ?? '',
                    'theme' => $row['cv_theme'] ?? 'ocean',
                    'skills' => $row['skills'] ?? ''
                ]
            ], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** POST /api/users/me/cv - Cập nhật CV của user đang đăng nhập */
    public function updateCV(): void {
        try {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

            if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'Yêu cầu phải có Token xác thực!'], JSON_UNESCAPED_UNICODE);
                return;
            }

            $currentUser = $this->authService->verifyToken($matches[1]);
            
            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $summary = trim($input['summary'] ?? '');
            $education = trim($input['education'] ?? '');
            $experience = trim($input['experience'] ?? '');
            $portfolioUrl = trim($input['portfolioUrl'] ?? '');
            $theme = trim($input['theme'] ?? 'ocean');
            $skills = trim($input['skills'] ?? '');

            if (!in_array($theme, ['ocean', 'emerald', 'sunset', 'midnight'])) {
                $theme = 'ocean';
            }

            $conn = $this->em->getConnection();
            $conn->executeStatement("
                UPDATE users 
                SET cv_summary = :summary,
                    cv_education = :education,
                    cv_experience = :experience,
                    cv_portfolio_url = :portfolioUrl,
                    cv_theme = :theme,
                    skills = :skills
                WHERE id = :id
            ", [
                'summary' => $summary ?: null,
                'education' => $education ?: null,
                'experience' => $experience ?: null,
                'portfolioUrl' => $portfolioUrl ?: null,
                'theme' => $theme,
                'skills' => $skills ?: null,
                'id' => $currentUser->id
            ]);

            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Cập nhật CV thành công!'], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }
}
