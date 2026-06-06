<?php
namespace App\Presentation;

use App\Services\TeamService;
use App\Services\AuthService;
use App\DTO\JoinTeamRequestDTO;
use Doctrine\ORM\EntityManagerInterface;
use Exception;

class TeamController {
    private TeamService $teamService;
    private AuthService $authService;
    private EntityManagerInterface $em;

    public function __construct(TeamService $teamService, AuthService $authService, EntityManagerInterface $em) {
        $this->teamService = $teamService;
        $this->authService = $authService;
        $this->em = $em;
    }

    public function createTeam(): void {
        try {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            
            if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Yêu cầu phải có Token xác thực!"], JSON_UNESCAPED_UNICODE);
                return;
            }
            
            $currentUser = $this->authService->verifyToken($matches[1]);
            
            $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
            $teamName = trim($inputData['name'] ?? '');
            $category  = trim($inputData['category'] ?? 'AI & ML');
            // Nhận mảng công nghệ từ frontend, ép kiểu an toàn
            $skills = [];
            if (!empty($inputData['skills']) && is_array($inputData['skills'])) {
                $skills = array_map('trim', $inputData['skills']);
                $skills = array_filter($skills);
                $skills = array_values($skills);
            }
            $skillsStr = implode(', ', $skills);

            if (empty($teamName)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Tên đội thi không được để trống!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $conn = $this->em->getConnection();

            // Kiểm tra tên đội đã tồn tại
            $existing = $conn->executeQuery("SELECT id FROM teams WHERE team_name = :name", ['name' => $teamName])->fetchOne();
            if ($existing) {
                http_response_code(409);
                echo json_encode(["status" => "error", "message" => "Tên đội thi này đã tồn tại!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            // Tạo mã invite code
            $prefix = strtoupper(substr(str_replace(' ', '', $teamName), 0, 2));
            if (strlen($prefix) < 2) $prefix = 'TM';
            $joinCode = $prefix . rand(1000, 9999);

            // Lưu vào bảng teams
            $conn->executeStatement("
                INSERT INTO teams (team_name, category, join_code, status, leader_id)
                VALUES (:teamName, :category, :joinCode, 'APPROVED', :leaderId)
            ", [
                'teamName' => $teamName,
                'category' => $category,
                'joinCode' => $joinCode,
                'leaderId' => $currentUser->id,
            ]);
            $teamId = (int)$conn->lastInsertId();

            // Lưu đội trưởng vào team_members (LEAD)
            $conn->executeStatement("
                INSERT INTO team_members (team_id, user_id, role_in_team)
                VALUES (:teamId, :userId, 'LEAD')
            ", ['teamId' => $teamId, 'userId' => $currentUser->id]);

            // Cập nhật users.team_id + skills của đội trưởng
            $conn->executeStatement("
                UPDATE users SET team_id = :teamId, skills = :skills WHERE id = :userId
            ", ['teamId' => $teamId, 'skills' => $skillsStr ?: null, 'userId' => $currentUser->id]);

            $result = [
                'teamId'   => $teamId,
                'teamName' => $teamName,
                'joinCode' => $joinCode,
            ];
            
            http_response_code(201);
            echo json_encode([
                "status" => "success",
                "message" => "Tạo đội thi và đăng ký tham gia thành công!",
                "data" => $result
            ], JSON_UNESCAPED_UNICODE);
            
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function joinTeam(): void {
        try {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            
            if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Yêu cầu phải có Token xác thực!"], JSON_UNESCAPED_UNICODE);
                return;
            }
            
            $currentUser = $this->authService->verifyToken($matches[1]);
            
            $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
            $joinCode  = trim($inputData['joinCode'] ?? '');

            if (empty($joinCode)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Vui lòng nhập mã tham gia!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $conn = $this->em->getConnection();

            // Tìm đội theo join_code
            $team = $conn->executeQuery("
                SELECT t.id, t.team_name,
                    (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) as member_count
                FROM teams t WHERE t.join_code = :joinCode
            ", ['joinCode' => $joinCode])->fetchAssociative();

            if (!$team) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Mã tham gia không hợp lệ hoặc đội không tồn tại!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            if ($team['member_count'] >= 5) {
                http_response_code(409);
                echo json_encode(["status" => "error", "message" => "Đội này đã đủ 5 thành viên!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            // Kiểm tra user đã trong team_members chưa
            $alreadyMember = $conn->executeQuery("
                SELECT id FROM team_members WHERE team_id = :teamId AND user_id = :userId
            ", ['teamId' => $team['id'], 'userId' => $currentUser->id])->fetchOne();

            if ($alreadyMember) {
                http_response_code(409);
                echo json_encode(["status" => "error", "message" => "Bạn đã là thành viên của đội này rồi!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            // Thêm vào team_members
            $conn->executeStatement("
                INSERT INTO team_members (team_id, user_id, role_in_team)
                VALUES (:teamId, :userId, 'MEMBER')
            ", ['teamId' => $team['id'], 'userId' => $currentUser->id]);

            // Cập nhật users.team_id
            $conn->executeStatement("
                UPDATE users SET team_id = :teamId WHERE id = :userId
            ", ['teamId' => $team['id'], 'userId' => $currentUser->id]);

            $result = ['teamId' => (int)$team['id'], 'teamName' => $team['team_name']];
            
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Tham gia đội thi thành công!",
                "data" => $result
            ], JSON_UNESCAPED_UNICODE);
            
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }
}
