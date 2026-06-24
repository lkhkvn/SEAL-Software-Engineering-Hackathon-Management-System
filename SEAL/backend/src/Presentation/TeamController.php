<?php
namespace App\Presentation;

use App\Services\TeamService;
use App\Services\AuthService;
use App\DTO\JoinTeamRequestDTO;
use App\Domain\Entity\User;
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

    private function getAuthToken(): string {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            throw new Exception("Yêu cầu phải có Token xác thực!");
        }

        return $matches[1];
    }

    private function requireCurrentUser(): User {
        $token = $this->getAuthToken();
        return $this->authService->verifyToken($token);
    }

    public function createTeam(): void {
        try {
            $currentUser = $this->requireCurrentUser();

            if ($currentUser->teamId !== null) {
                http_response_code(409);
                echo json_encode(["status" => "error", "message" => "Bạn đã thuộc về một đội thi khác!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
            $teamName = trim($inputData['name'] ?? $inputData['team_name'] ?? '');
            $category  = trim($inputData['category'] ?? 'AI & ML');
            $skills = [];
            if (!empty($inputData['skills']) && is_array($inputData['skills'])) {
                $skills = array_filter(array_map('trim', $inputData['skills']));
            }
            $skillsStr = implode(', ', $skills);

            $maxMembers = (int)($inputData['max_members'] ?? 5);
            if ($maxMembers < 1 || $maxMembers > 10) {
                $maxMembers = 5;
            }

            if (empty($teamName)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Tên đội thi không được để trống!"], JSON_UNESCAPED_UNICODE);
                return;
            }
            if (strlen($teamName) < 3 || strlen($teamName) > 80) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Tên đội thi phải có từ 3 đến 80 ký tự!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $conn = $this->em->getConnection();
            $existing = $conn->executeQuery("SELECT id FROM teams WHERE team_name = :name", ['name' => $teamName])->fetchOne();
            if ($existing) {
                http_response_code(409);
                echo json_encode(["status" => "error", "message" => "Tên đội thi này đã tồn tại!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $joinCode = null;
            $attempt = 0;
            do {
                $prefix = strtoupper(substr(str_replace(' ', '', $teamName), 0, 2));
                if (strlen($prefix) < 2) {
                    $prefix = 'TM';
                }
                $joinCode = $prefix . rand(1000, 9999);
                $existingJoin = $conn->executeQuery("SELECT id FROM teams WHERE join_code = :joinCode", ['joinCode' => $joinCode])->fetchOne();
                $attempt++;
            } while ($existingJoin && $attempt < 10);

            if ($existingJoin) {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Không thể tạo mã tham gia độc nhất, vui lòng thử lại."], JSON_UNESCAPED_UNICODE);
                return;
            }

            $conn->executeStatement("
                INSERT INTO teams (team_name, category, join_code, status, max_members, leader_id)
                VALUES (:teamName, :category, :joinCode, 'APPROVED', :maxMembers, :leaderId)
            ", [
                'teamName' => $teamName,
                'category' => $category,
                'joinCode' => $joinCode,
                'maxMembers' => $maxMembers,
                'leaderId' => $currentUser->id,
            ]);
            $teamId = (int)$conn->lastInsertId();

            $conn->executeStatement("
                INSERT INTO team_members (team_id, user_id, role_in_team)
                VALUES (:teamId, :userId, 'LEAD')
            ", ['teamId' => $teamId, 'userId' => $currentUser->id]);

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
            if (http_response_code() === 200) {
                http_response_code(400);
            }
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function updateTeam(int $teamId): void {
        try {
            $currentUser = $this->requireCurrentUser();
            $inputData = json_decode(file_get_contents('php://input'), true) ?? [];

            $teamName = isset($inputData['team_name']) ? trim($inputData['team_name']) : (isset($inputData['name']) ? trim($inputData['name']) : null);
            $category = isset($inputData['category']) ? trim($inputData['category']) : null;
            $status = isset($inputData['status']) ? strtoupper(trim($inputData['status'])) : null;

            if ($teamName !== null && $teamName === '') {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Tên đội thi không được để trống!"], JSON_UNESCAPED_UNICODE);
                return;
            }
            if ($teamName !== null && (strlen($teamName) < 3 || strlen($teamName) > 80)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Tên đội thi phải có từ 3 đến 80 ký tự!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $allowedStatuses = ['APPROVED', 'PENDING', 'LOCKED'];
            if ($status !== null && !in_array($status, $allowedStatuses, true)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Trạng thái đội không hợp lệ!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $conn = $this->em->getConnection();
            $team = $conn->executeQuery("SELECT id, team_name, category, status, leader_id FROM teams WHERE id = :teamId", ['teamId' => $teamId])->fetchAssociative();
            if (!$team) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Đội không tồn tại!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            if (!$currentUser->isAdmin() && (int)$team['leader_id'] !== $currentUser->id) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Bạn không có quyền sửa đội này."], JSON_UNESCAPED_UNICODE);
                return;
            }

            $updates = [];
            $params = ['teamId' => $teamId];

            if ($teamName !== null) {
                if ($teamName !== $team['team_name']) {
                    $existing = $conn->executeQuery("SELECT id FROM teams WHERE team_name = :name AND id != :teamId", ['name' => $teamName, 'teamId' => $teamId])->fetchOne();
                    if ($existing) {
                        http_response_code(409);
                        echo json_encode(["status" => "error", "message" => "Tên đội thi này đã tồn tại!"], JSON_UNESCAPED_UNICODE);
                        return;
                    }
                }
                $updates[] = 'team_name = :teamName';
                $params['teamName'] = $teamName;
            }

            if ($category !== null) {
                $updates[] = 'category = :category';
                $params['category'] = $category;
            }

            if ($status !== null) {
                $updates[] = 'status = :status';
                $params['status'] = $status;
            }

            if (empty($updates)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Vui lòng cung cấp ít nhất một trường để cập nhật!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $sql = "UPDATE teams SET " . implode(', ', $updates) . " WHERE id = :teamId";
            $conn->executeStatement($sql, $params);

            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Cập nhật thông tin đội thi thành công!",
                "data" => [
                    'teamId' => $teamId,
                    'teamName' => $teamName ?? $team['team_name'],
                    'category' => $category ?? $team['category'] ?? null,
                    'status' => $status ?? $team['status'] ?? null,
                ]
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            if (http_response_code() === 200) {
                http_response_code(400);
            }
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
                SELECT t.id, t.team_name, t.max_members,
                    (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) as member_count
                FROM teams t WHERE t.join_code = :joinCode
            ", ['joinCode' => $joinCode])->fetchAssociative();

            if (!$team) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Mã tham gia không hợp lệ hoặc đội không tồn tại!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            if ($team['member_count'] >= $team['max_members']) {
                http_response_code(409);
                echo json_encode(["status" => "error", "message" => "Đội này đã đạt số lượng tối đa (" . $team['max_members'] . " người)!"], JSON_UNESCAPED_UNICODE);
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

    /** POST /api/teams/match */
    public function matchTeam(): void {
        try {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

            if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Yêu cầu phải có Token xác thực!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $currentUser = $this->authService->verifyToken($matches[1]);
            $inputData   = json_decode(file_get_contents('php://input'), true) ?? [];
            $isLooking   = (bool)($inputData['isLookingForTeam'] ?? false);

            $this->teamService->toggleLookingForTeam($currentUser, $isLooking);

            $match = null;
            if ($isLooking) {
                $match = $this->teamService->autoMatch($currentUser);
            }

            http_response_code(200);
            echo json_encode([
                "status"  => "success",
                "message" => "Cập nhật trạng thái thành công!",
                "match"   => $match
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** GET /api/teams/{id} */
    public function getTeamById(int $teamId): void {
        try {
            $conn = $this->em->getConnection();

            $team = $conn->executeQuery(
                "SELECT t.id, t.team_name as name, t.category, t.status, t.join_code as joinCode, t.max_members as maxMembers,
                        u.id as leaderId, u.name as leaderName, u.email as leaderEmail
                 FROM teams t
                 LEFT JOIN users u ON t.leader_id = u.id
                 WHERE t.id = :teamId",
                ['teamId' => $teamId]
            )->fetchAssociative();

            if (!$team) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Đội không tồn tại!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $members = $conn->executeQuery(
                "SELECT u.id, u.name, u.email, u.skills, u.avatar_url, u.date_of_birth, tm.role_in_team as role
                 FROM team_members tm
                 JOIN users u ON tm.user_id = u.id
                 WHERE tm.team_id = :teamId",
                ['teamId' => $teamId]
            )->fetchAllAssociative();

            $memberCount = count($members);

            $leader = null;
            if (!empty($team['leaderId'])) {
                $leader = [
                    'id' => (int)$team['leaderId'],
                    'name' => $team['leaderName'],
                    'email' => $team['leaderEmail'] ?? null
                ];
            }

            $membersClean = array_map(function($m) {
                return [
                    'id' => (int)$m['id'],
                    'name' => $m['name'],
                    'email' => $m['email'] ?? null,
                    'skills' => $m['skills'] ?? null,
                    'role' => $m['role'] ?? 'MEMBER',
                    'avatarUrl' => $m['avatar_url'] ?? null,
                    'dateOfBirth' => $m['date_of_birth'] ?? null
                ];
            }, $members);

            $result = [
                'id' => (int)$team['id'],
                'name' => $team['name'],
                'category' => $team['category'],
                'status' => $team['status'],
                'joinCode' => $team['joinCode'],
                'maxMembers' => (int)$team['maxMembers'],
                'membersCount' => $memberCount,
                'leader' => $leader,
                'members' => $membersClean
            ];

            http_response_code(200);
            echo json_encode(["status" => "success", "data" => $result], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }
    public function applyTeam(): void {
        try {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

            if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Yêu cầu phải có Token xác thực!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $currentUser = $this->authService->verifyToken($matches[1]);
            
            // Check if user is already in a team
            if ($currentUser->teamId !== null) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Bạn đã tham gia một đội thi rồi!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $joinCode = trim($input['joinCode'] ?? '');
            $message = trim($input['message'] ?? '');

            if (empty($joinCode)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Vui lòng nhập mã tham gia!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $conn = $this->em->getConnection();

            // Find team
            $team = $conn->executeQuery("
                SELECT t.id, t.team_name, t.max_members, t.leader_id,
                    (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) as member_count
                FROM teams t WHERE t.join_code = :joinCode
            ", ['joinCode' => $joinCode])->fetchAssociative();

            if (!$team) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Mã tham gia không hợp lệ hoặc đội không tồn tại!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            if ($team['leader_id'] === $currentUser->id) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Bạn là trưởng nhóm này rồi!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            if ($team['member_count'] >= $team['max_members']) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Đội này đã đạt số lượng tối đa thành viên!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            // Check if there is already a pending request for this team
            $existing = $conn->executeQuery("
                SELECT id, status FROM team_join_requests 
                WHERE team_id = :teamId AND user_id = :userId AND status = 'PENDING'
            ", ['teamId' => $team['id'], 'userId' => $currentUser->id])->fetchOne();

            if ($existing) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Bạn đã gửi yêu cầu ứng tuyển và đang chờ duyệt!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            // Create join request
            $conn->executeStatement("
                INSERT INTO team_join_requests (team_id, user_id, message, status, created_at)
                VALUES (:teamId, :userId, :message, 'PENDING', NOW())
            ", [
                'teamId' => $team['id'],
                'userId' => $currentUser->id,
                'message' => $message ?: null
            ]);

            http_response_code(201);
            echo json_encode([
                "status" => "success",
                "message" => "Gửi đơn ứng tuyển thành công! Vui lòng chờ đội trưởng duyệt."
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function getMyTeamRequests(): void {
        try {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

            if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Yêu cầu phải có Token xác thực!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $currentUser = $this->authService->verifyToken($matches[1]);
            $conn = $this->em->getConnection();

            // Find if this user is a leader of any team
            $team = $conn->executeQuery("
                SELECT id, team_name, max_members
                FROM teams WHERE leader_id = :leaderId
            ", ['leaderId' => $currentUser->id])->fetchAssociative();

            if (!$team) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Bạn không phải trưởng nhóm!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            // Get pending requests with candidate details (including CV and skills)
            $requests = $conn->executeQuery("
                SELECT r.id as requestId, r.message, r.created_at as createdAt,
                       u.id as userId, u.name as userName, u.email as userEmail, u.skills as userSkills,
                       u.cv_summary as cvSummary, u.cv_education as cvEducation, 
                       u.cv_experience as cvExperience, u.cv_portfolio_url as cvPortfolioUrl, u.cv_theme as cvTheme
                FROM team_join_requests r
                INNER JOIN users u ON u.id = r.user_id
                WHERE r.team_id = :teamId AND r.status = 'PENDING'
                ORDER BY r.created_at ASC
            ", ['teamId' => $team['id']])->fetchAllAssociative();

            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "data" => $requests
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function approveRequest(int $requestId): void {
        try {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

            if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Yêu cầu phải có Token xác thực!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $currentUser = $this->authService->verifyToken($matches[1]);
            $conn = $this->em->getConnection();

            // Find request
            $request = $conn->executeQuery("
                SELECT r.id, r.team_id, r.user_id, r.status,
                       t.leader_id, t.max_members,
                       (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) as member_count
                FROM team_join_requests r
                INNER JOIN teams t ON t.id = r.team_id
                WHERE r.id = :id
            ", ['id' => $requestId])->fetchAssociative();

            if (!$request) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Yêu cầu không tồn tại!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            if ($request['leader_id'] !== $currentUser->id) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Bạn không có quyền duyệt yêu cầu của đội này!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            if ($request['status'] !== 'PENDING') {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Yêu cầu này đã được xử lý rồi!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            if ($request['member_count'] >= $request['max_members']) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Đội của bạn đã đạt số lượng tối đa thành viên!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            // Check if applicant is already in a team
            $applicantTeam = $conn->executeQuery("
                SELECT team_id FROM users WHERE id = :userId
            ", ['userId' => $request['user_id']])->fetchOne();

            if ($applicantTeam !== null) {
                // Applicant already joined another team in the meantime. We should reject this request.
                $conn->executeStatement("
                    UPDATE team_join_requests SET status = 'REJECTED' WHERE id = :id
                ", ['id' => $requestId]);

                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Thí sinh này đã gia nhập đội khác!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            // Start transaction
            $conn->beginTransaction();
            try {
                // 1. Update request status to APPROVED
                $conn->executeStatement("
                    UPDATE team_join_requests SET status = 'APPROVED' WHERE id = :id
                ", ['id' => $requestId]);

                // 2. Reject all other pending requests for this user
                $conn->executeStatement("
                    UPDATE team_join_requests SET status = 'REJECTED' 
                    WHERE user_id = :userId AND id != :id AND status = 'PENDING'
                ", ['userId' => $request['user_id'], 'id' => $requestId]);

                // 3. Add to team_members
                $conn->executeStatement("
                    INSERT INTO team_members (team_id, user_id, role_in_team, joined_at)
                    VALUES (:teamId, :userId, 'MEMBER', NOW())
                ", ['teamId' => $request['team_id'], 'userId' => $request['user_id']]);

                // 4. Update users.team_id
                $conn->executeStatement("
                    UPDATE users SET team_id = :teamId WHERE id = :userId
                ", ['teamId' => $request['team_id'], 'userId' => $request['user_id']]);

                $conn->commit();
            } catch (Exception $txEx) {
                $conn->rollBack();
                throw $txEx;
            }

            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Duyệt thành viên thành công!"], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function rejectRequest(int $requestId): void {
        try {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

            if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Yêu cầu phải có Token xác thực!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $currentUser = $this->authService->verifyToken($matches[1]);
            $conn = $this->em->getConnection();

            // Find request
            $request = $conn->executeQuery("
                SELECT r.id, r.team_id, r.status, t.leader_id
                FROM team_join_requests r
                INNER JOIN teams t ON t.id = r.team_id
                WHERE r.id = :id
            ", ['id' => $requestId])->fetchAssociative();

            if (!$request) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Yêu cầu không tồn tại!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            if ($request['leader_id'] !== $currentUser->id) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Bạn không có quyền từ chối yêu cầu của đội này!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            if ($request['status'] !== 'PENDING') {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Yêu cầu này đã được xử lý rồi!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            // Update status to REJECTED
            $conn->executeStatement("
                UPDATE team_join_requests SET status = 'REJECTED' WHERE id = :id
            ", ['id' => $requestId]);

            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Từ chối yêu cầu thành công!"], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }
    public function submitProject(): void {
        try {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

            if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Yêu cầu phải có Token xác thực!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $currentUser = $this->authService->verifyToken($matches[1]);
            
            if (!$currentUser->teamId) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Bạn chưa tham gia đội thi nào!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            // Hỗ trợ form-data
            $projectName = trim($_POST['projectName'] ?? '');
            $description = trim($_POST['description'] ?? '');
            $githubUrl = trim($_POST['githubUrl'] ?? '');
            $demoVideoUrl = trim($_POST['demoVideoUrl'] ?? '');
            $contestId = (int)($_POST['contestId'] ?? 0);

            if (empty($projectName) || empty($description) || $contestId <= 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Vui lòng chọn sự kiện và điền đầy đủ tên dự án, mô tả!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $conn = $this->em->getConnection();

            // Lấy thông tin leader_id của đội
            $team = $conn->executeQuery("SELECT leader_id FROM teams WHERE id = :teamId", ['teamId' => $currentUser->teamId])->fetchAssociative();
            
            if (!$team || (int)$team['leader_id'] !== $currentUser->id) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Chỉ đội trưởng mới có quyền nộp dự án!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            // Kiểm tra deadline
            $challenge = $conn->executeQuery("SELECT submission_deadline FROM contest_problems WHERE contest_id = :contestId", ['contestId' => $contestId])->fetchAssociative();
            if ($challenge && !empty($challenge['submission_deadline'])) {
                $deadline = new \DateTime($challenge['submission_deadline']);
                if (new \DateTime() > $deadline) {
                    http_response_code(400);
                    echo json_encode(["status" => "error", "message" => "Đã hết hạn nộp bài cho sự kiện này!"], JSON_UNESCAPED_UNICODE);
                    return;
                }
            } else {
                $contest = $conn->executeQuery("SELECT end_date FROM contests WHERE id = :contestId", ['contestId' => $contestId])->fetchAssociative();
                if ($contest) {
                    $endDate = new \DateTime($contest['end_date']);
                    $endDate->setTime(23, 59, 59);
                    if (new \DateTime() > $endDate) {
                        http_response_code(400);
                        echo json_encode(["status" => "error", "message" => "Đã hết hạn nộp bài cho sự kiện này!"], JSON_UNESCAPED_UNICODE);
                        return;
                    }
                }
            }

            // Kiểm tra đăng ký sự kiện và trạng thái duyệt
            $registration = $conn->executeQuery("SELECT status FROM contest_registrations WHERE team_id = :teamId AND contest_id = :contestId", [
                'teamId' => $currentUser->teamId,
                'contestId' => $contestId
            ])->fetchAssociative();

            if (!$registration) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Đội của bạn chưa đăng ký tham gia sự kiện này!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            if ($registration['status'] !== 'APPROVED') {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Đăng ký của đội bạn hiện đang chờ duyệt hoặc đã bị từ chối!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $fileUrl = null;
            if (isset($_FILES['projectFile']) && $_FILES['projectFile']['error'] === UPLOAD_ERR_OK) {
                $fileService = new \App\Services\FileUploadService();
                $uploadResult = $fileService->uploadSubmissionFile($_FILES['projectFile'], $currentUser->teamId, $contestId);
                $fileUrl = $uploadResult['url'];
            }

            // Check if submission already exists for this specific contest
            $existingSub = $conn->executeQuery("SELECT id, file_url FROM submissions WHERE team_id = :teamId AND contest_id = :contestId", [
                'teamId' => $currentUser->teamId,
                'contestId' => $contestId
            ])->fetchAssociative();

            if ($existingSub) {
                $updateParams = [
                    'projectName' => $projectName,
                    'description' => $description,
                    'githubUrl' => $githubUrl,
                    'demoVideoUrl' => $demoVideoUrl,
                    'id' => $existingSub['id']
                ];
                $updateSql = "UPDATE submissions SET project_name = :projectName, description = :description, github_url = :githubUrl, demo_video_url = :demoVideoUrl";
                if ($fileUrl) {
                    $updateSql .= ", file_url = :fileUrl";
                    $updateParams['fileUrl'] = $fileUrl;

                    // Delete old file if exists
                    if (!empty($existingSub['file_url'])) {
                        $oldUrl = $existingSub['file_url'];
                        $oldFilePath = '';
                        if (str_starts_with($oldUrl, '/uploads/')) {
                            $oldFilePath = __DIR__ . '/../../public' . $oldUrl;
                        } else if (str_starts_with($oldUrl, '/api/submissions/file/')) {
                            $oldFilePath = __DIR__ . '/../../storage/uploads/submissions/' . str_replace('/api/submissions/file/', '', $oldUrl);
                        }
                        if ($oldFilePath && file_exists($oldFilePath)) {
                            unlink($oldFilePath);
                        }
                    }
                }
                $updateSql .= " WHERE id = :id";
                $conn->executeStatement($updateSql, $updateParams);
            } else {
                // Insert
                $conn->executeStatement("
                    INSERT INTO submissions (team_id, contest_id, project_name, description, github_url, demo_video_url, file_url, submitted_at)
                    VALUES (:teamId, :contestId, :projectName, :description, :githubUrl, :demoVideoUrl, :fileUrl, NOW())
                ", [
                    'teamId' => $currentUser->teamId,
                    'contestId' => $contestId,
                    'projectName' => $projectName,
                    'description' => $description,
                    'githubUrl' => $githubUrl,
                    'demoVideoUrl' => $demoVideoUrl,
                    'fileUrl' => $fileUrl
                ]);
            }

            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Nộp dự án thành công!"], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }


    public function getMySubmission(int $contestId): void {
        try {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

            if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Yêu cầu phải có Token xác thực!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $currentUser = $this->authService->verifyToken($matches[1]);
            
            if (!$currentUser->teamId) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Bạn chưa tham gia đội thi nào!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $conn = $this->em->getConnection();

            // Kiểm tra đăng ký sự kiện và trạng thái duyệt
            $registration = $conn->executeQuery("SELECT status FROM contest_registrations WHERE team_id = :teamId AND contest_id = :contestId", [
                'teamId' => $currentUser->teamId,
                'contestId' => $contestId
            ])->fetchAssociative();

            if (!$registration) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Đội của bạn chưa đăng ký tham gia sự kiện này!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            if ($registration['status'] !== 'APPROVED') {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Đăng ký của đội bạn hiện đang chờ duyệt hoặc đã bị từ chối!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $submission = $conn->executeQuery("SELECT project_name as projectName, description, github_url as githubUrl, demo_video_url as demoVideoUrl, file_url as fileUrl FROM submissions WHERE team_id = :teamId AND contest_id = :contestId", [
                'teamId' => $currentUser->teamId,
                'contestId' => $contestId
            ])->fetchAssociative();

            if ($submission) {
                http_response_code(200);
                echo json_encode(["status" => "success", "data" => $submission], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(200);
                echo json_encode(["status" => "success", "data" => null], JSON_UNESCAPED_UNICODE);
            }

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    
    /**
     * POST /api/teams/{id}/members - Add a member to a team (leader only)
     */
    public function addMember(int $teamId): void {
        try {
            $currentUser = $this->requireCurrentUser();
            // Ensure current user is the leader of the team
            $conn = $this->em->getConnection();
            $team = $conn->executeQuery("SELECT leader_id, max_members FROM teams WHERE id = :teamId", ['teamId' => $teamId])->fetchAssociative();
            if (!$team) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Đội không tồn tại!"], JSON_UNESCAPED_UNICODE);
                return;
            }
            if ((int)$team['leader_id'] !== $currentUser->id && !$currentUser->isAdmin()) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Bạn không có quyền thêm thành viên!"], JSON_UNESCAPED_UNICODE);
                return;
            }
            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $userId = (int)($input['userId'] ?? 0);
            if ($userId <= 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "userId không hợp lệ!"], JSON_UNESCAPED_UNICODE);
                return;
            }
            // Check if user already in a team
            $existingTeam = $conn->executeQuery("SELECT team_id FROM users WHERE id = :userId", ['userId' => $userId])->fetchOne();
            if ($existingTeam !== null) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Thành viên này đã thuộc một đội khác!"], JSON_UNESCAPED_UNICODE);
                return;
            }
            // Check max members
            $memberCount = $conn->executeQuery("SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = :teamId", ['teamId' => $teamId])->fetchOne();
            if ($memberCount >= $team['max_members']) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Đội đã đạt số lượng thành viên tối đa!"], JSON_UNESCAPED_UNICODE);
                return;
            }
            // Add member
            $conn->beginTransaction();
            $conn->executeStatement("INSERT INTO team_members (team_id, user_id, role_in_team) VALUES (:teamId, :userId, 'MEMBER')", ['teamId' => $teamId, 'userId' => $userId]);
            $conn->executeStatement("UPDATE users SET team_id = :teamId WHERE id = :userId", ['teamId' => $teamId, 'userId' => $userId]);
            $conn->commit();
            http_response_code(201);
            echo json_encode(["status" => "success", "message" => "Thêm thành viên thành công!"] , JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            if (isset($conn) && $conn->isTransactionActive()) {
                $conn->rollBack();
            }
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /**
     * DELETE /api/teams/{id}/members/{userId} - Remove a member (leader or self)
     */
    public function removeMember(int $teamId, int $userId): void {
        try {
            $currentUser = $this->requireCurrentUser();
            $conn = $this->em->getConnection();
            $team = $conn->executeQuery("SELECT leader_id FROM teams WHERE id = :teamId", ['teamId' => $teamId])->fetchAssociative();
            if (!$team) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Đội không tồn tại!"], JSON_UNESCAPED_UNICODE);
                return;
            }
            // Permission: leader can remove any member, member can remove self, admin can remove anyone
            $isLeader = ((int)$team['leader_id'] === $currentUser->id);
            $isSelf = ($currentUser->id === $userId);
            if (!($isLeader || $isSelf || $currentUser->isAdmin())) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Bạn không có quyền xóa thành viên này!"], JSON_UNESCAPED_UNICODE);
                return;
            }
            // Ensure the user is actually a member of the team
            $memberExists = $conn->executeQuery("SELECT id FROM team_members WHERE team_id = :teamId AND user_id = :userId", ['teamId' => $teamId, 'userId' => $userId])->fetchOne();
            if (!$memberExists) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Thành viên không thuộc đội này!"], JSON_UNESCAPED_UNICODE);
                return;
            }
            $conn->beginTransaction();
            // Delete from team_members
            $conn->executeStatement("DELETE FROM team_members WHERE team_id = :teamId AND user_id = :userId", ['teamId' => $teamId, 'userId' => $userId]);
            // Reset user's team_id
            $conn->executeStatement("UPDATE users SET team_id = NULL WHERE id = :userId", ['userId' => $userId]);
            // If the removed member was the leader, optionally transfer leadership to null (or keep unchanged, here we keep unchanged)
            $conn->commit();
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Xóa thành viên thành công!"], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            if (isset($conn) && $conn->isTransactionActive()) {
                $conn->rollBack();
            }
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /**
     * DELETE /api/teams/{id} - Delete a team (leader or admin)
     */
    public function deleteTeam(int $teamId): void {
        try {
            $currentUser = $this->requireCurrentUser();
            $conn = $this->em->getConnection();
            $team = $conn->executeQuery("SELECT leader_id FROM teams WHERE id = :teamId", ['teamId' => $teamId])->fetchAssociative();
            if (!$team) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Đội không tồn tại!"], JSON_UNESCAPED_UNICODE);
                return;
            }
            if ((int)$team['leader_id'] !== $currentUser->id && !$currentUser->isAdmin()) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Bạn không có quyền xóa đội này!"], JSON_UNESCAPED_UNICODE);
                return;
            }
            $conn->beginTransaction();
            // Remove members and reset their team_id
            $conn->executeStatement("UPDATE users SET team_id = NULL WHERE team_id = :teamId", ['teamId' => $teamId]);
            $conn->executeStatement("DELETE FROM team_members WHERE team_id = :teamId", ['teamId' => $teamId]);
            // Delete pending join requests
            $conn->executeStatement("DELETE FROM team_join_requests WHERE team_id = :teamId", ['teamId' => $teamId]);
            // Finally delete the team
            $conn->executeStatement("DELETE FROM teams WHERE id = :teamId", ['teamId' => $teamId]);
            $conn->commit();
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Xóa đội thành công!"] , JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            if (isset($conn) && $conn->isTransactionActive()) {
                $conn->rollBack();
            }
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /**
     * POST /api/teams/{id}/leave - Member leaves the team (or leader can disband)
     */
    public function leaveTeam(int $teamId): void {
        try {
            $currentUser = $this->requireCurrentUser();
            $conn = $this->em->getConnection();
            $team = $conn->executeQuery("SELECT leader_id FROM teams WHERE id = :teamId", ['teamId' => $teamId])->fetchAssociative();
            if (!$team) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Đội không tồn tại!"], JSON_UNESCAPED_UNICODE);
                return;
            }
            $isLeader = ((int)$team['leader_id'] === $currentUser->id);
            // If leader leaves, we treat as team deletion (optional). Here we prevent leader from leaving without assigning new leader.
            if ($isLeader) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Trưởng nhóm không thể rời đội mà không chuyển quyền!"], JSON_UNESCAPED_UNICODE);
                return;
            }
            // Remove member from team
            $this->removeMember($teamId, $currentUser->id);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /**
     * PUT /api/teams/{id}/leader - Assign new leader (current leader only)
     */
    public function changeLeader(int $teamId): void {
        try {
            $currentUser = $this->requireCurrentUser();
            $conn = $this->em->getConnection();
            $team = $conn->executeQuery("SELECT leader_id FROM teams WHERE id = :teamId", ['teamId' => $teamId])->fetchAssociative();
            if (!$team) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Đội không tồn tại!"], JSON_UNESCAPED_UNICODE);
                return;
            }
            if ((int)$team['leader_id'] !== $currentUser->id && !$currentUser->isAdmin()) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Bạn không có quyền chuyển trưởng nhóm!"], JSON_UNESCAPED_UNICODE);
                return;
            }
            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $newLeaderId = (int)($input['newLeaderId'] ?? 0);
            if ($newLeaderId <= 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "newLeaderId không hợp lệ!"], JSON_UNESCAPED_UNICODE);
                return;
            }
            // Verify new leader is a member of the team
            $memberCheck = $conn->executeQuery("SELECT id FROM team_members WHERE team_id = :teamId AND user_id = :userId", ['teamId' => $teamId, 'userId' => $newLeaderId])->fetchOne();
            if (!$memberCheck) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Người dùng không phải là thành viên của đội!"], JSON_UNESCAPED_UNICODE);
                return;
            }
            $conn->beginTransaction();
            // Update role of previous leader to MEMBER
            $conn->executeStatement("UPDATE team_members SET role_in_team = 'MEMBER' WHERE team_id = :teamId AND user_id = :oldLeaderId", ['teamId' => $teamId, 'oldLeaderId' => $team['leader_id']]);
            // Update new leader role
            $conn->executeStatement("UPDATE team_members SET role_in_team = 'LEAD' WHERE team_id = :teamId AND user_id = :newLeaderId", ['teamId' => $teamId, 'newLeaderId' => $newLeaderId]);
            // Update teams table
            $conn->executeStatement("UPDATE teams SET leader_id = :newLeaderId WHERE id = :teamId", ['newLeaderId' => $newLeaderId, 'teamId' => $teamId]);
            $conn->commit();
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Đổi trưởng nhóm thành công!"] , JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            if (isset($conn) && $conn->isTransactionActive()) {
                $conn->rollBack();
            }
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }
    public function getMyTeamContests(): void {
        try {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

            if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Yêu cầu phải có Token xác thực!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $currentUser = $this->authService->verifyToken($matches[1]);
            
            if (!$currentUser->teamId) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Bạn chưa tham gia đội thi nào!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $conn = $this->em->getConnection();
            $contests = $conn->executeQuery("
                SELECT c.id, c.name, c.start_date, c.end_date, cr.registered_at 
                FROM contests c
                INNER JOIN contest_registrations cr ON cr.contest_id = c.id
                WHERE cr.team_id = :teamId
            ", ['teamId' => $currentUser->teamId])->fetchAllAssociative();

            http_response_code(200);
            echo json_encode(["status" => "success", "data" => $contests], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /**
     * Download bảo mật file đính kèm
     */
    public function downloadSubmissionFile(int $contestId, string $filename): void {
        try {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            // Allow token via query string for direct browser downloads
            if (empty($authHeader) && isset($_GET['token'])) {
                $authHeader = 'Bearer ' . $_GET['token'];
            }

            if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                http_response_code(401);
                echo "Yêu cầu xác thực Token!";
                return;
            }

            $currentUser = $this->authService->verifyToken($matches[1]);

            // Trích xuất team_id từ filename (format: team_123_...)
            $parts = explode('_', $filename);
            $fileTeamId = null;
            if (count($parts) >= 2 && $parts[0] === 'team') {
                $fileTeamId = (int)$parts[1];
            }

            // Kiểm tra quyền: Admin hoặc Giám khảo được xem tất cả. Thí sinh chỉ được xem file của đội mình.
            if (!$currentUser->isAdmin() && !$currentUser->isJudge()) {
                if ($fileTeamId !== null && $fileTeamId !== $currentUser->teamId) {
                    http_response_code(403);
                    echo "Bạn không có quyền tải file của đội khác!";
                    return;
                }
            }

            $filePath = realpath(__DIR__ . '/../../storage/uploads/submissions/' . $contestId . '/' . $filename);
            if (!$filePath || !file_exists($filePath)) {
                http_response_code(404);
                echo "File không tồn tại!";
                return;
            }

            // Tránh Path Traversal
            $baseStorageDir = realpath(__DIR__ . '/../../storage/uploads/submissions/');
            if (strpos($filePath, $baseStorageDir) !== 0) {
                http_response_code(403);
                echo "Truy cập không hợp lệ!";
                return;
            }

            // Trả về file
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->file($filePath);

            header('Content-Description: File Transfer');
            header('Content-Type: ' . $mimeType);
            header('Content-Disposition: inline; filename="' . basename($filePath) . '"');
            header('Expires: 0');
            header('Cache-Control: must-revalidate');
            header('Pragma: public');
            header('Content-Length: ' . filesize($filePath));
            readfile($filePath);
            exit;

        } catch (\Exception $e) {
            http_response_code(400);
            echo "Lỗi: " . $e->getMessage();
        }
    }
}
