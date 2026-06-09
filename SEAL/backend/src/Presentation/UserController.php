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
                   (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) as memberCount
            FROM teams t
            INNER JOIN team_members tm ON tm.team_id = t.id
            WHERE tm.user_id = :userId
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
}
