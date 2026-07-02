<?php
namespace App\Presentation;

use App\Services\HackathonService;
use App\Services\AuthService;
use App\Services\NotificationService;
use App\Services\ActivityLogService;
use Exception;


class HackathonController {
    private HackathonService $hackathonService;
    private AuthService $authService;
    private NotificationService $notificationService;
    private ActivityLogService $activityLogService;

    public function __construct(
        HackathonService $hackathonService,
        AuthService $authService,
        NotificationService $notificationService,
        ActivityLogService $activityLogService
    ) {
        $this->hackathonService = $hackathonService;
        $this->authService = $authService;
        $this->notificationService = $notificationService;
        $this->activityLogService = $activityLogService;
    }

    public function getAllHackathons(): void {
        $this->hackathonService->syncContestStatuses($this->notificationService);
        $contests = $this->hackathonService->getAllHackathons();
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "data"   => $contests
        ], JSON_UNESCAPED_UNICODE);
    }

    public function getHackathonById(int $id): void {
        $this->hackathonService->syncContestStatuses($this->notificationService);
        $contest = $this->hackathonService->getHackathonById($id);
        if (!$contest) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Cuộc thi không tồn tại!"], JSON_UNESCAPED_UNICODE);
            return;
        }

        http_response_code(200);
        echo json_encode(["status" => "success", "data" => $contest], JSON_UNESCAPED_UNICODE);
    }

    public function registerTeam(int $contestId): void {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Thiếu token!"], JSON_UNESCAPED_UNICODE);
            return;
        }

        try {
            $currentUser = $this->authService->verifyToken($matches[1]);
            $inputData = json_decode(file_get_contents('php://input'), true);
            $teamId = $inputData['team_id'] ?? null;

            if (!$teamId) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Thiếu ID đội thi!"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $this->hackathonService->registerTeamToHackathon($contestId, $teamId, $currentUser->id);

            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Đăng ký cuộc thi thành công!"], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            $code = $e->getMessage() === "Thiếu token!" || strpos($e->getMessage(), "Token") !== false ? 401 : 400;
            if ($e->getMessage() === "Chỉ đội trưởng mới có quyền đăng ký thi đấu!") $code = 403;
            if ($e->getMessage() === "Đội thi không tồn tại!" || $e->getMessage() === "Cuộc thi không tồn tại!") $code = 404;
            
            http_response_code($code);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function startContest(int $id): void {
        $currentUser = $this->requireAdmin();
        try {
            $result = $this->hackathonService->startContest($id, $this->notificationService);

            $this->activityLogService->logActivity(
                $currentUser->id,
                'UPDATE',
                'contests',
                $id,
                "Bắt đầu cuộc thi và phát đề bài cho cuộc thi ID: " . $id,
                $_SERVER['REMOTE_ADDR'] ?? null
            );

            http_response_code(200);
            echo json_encode([
                "status"  => "success",
                "message" => "Đã bắt đầu cuộc thi và phát thông báo thành công!",
                "data"    => $result
            ], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** POST /api/admin/hackathons */
    public function createHackathon(): void {
        $currentUser = $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        $name     = trim($data['name']     ?? '');
        $category = trim($data['category'] ?? '');
        $start    = trim($data['start_date'] ?? '');
        $end      = trim($data['end_date']   ?? '');

        if (!$name || !$category || !$start || !$end) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Thiếu thông tin bắt buộc: tên, danh mục, ngày bắt đầu, ngày kết thúc!'], JSON_UNESCAPED_UNICODE);
            return;
        }

        $newId = $this->hackathonService->createHackathon($data);

        $this->activityLogService->logActivity(
            $currentUser->id,
            'CREATE',
            'contests',
            $newId,
            "Tạo mới cuộc thi: " . $name,
            $_SERVER['REMOTE_ADDR'] ?? null
        );

        http_response_code(201);
        echo json_encode(['status' => 'success', 'message' => 'Tạo cuộc thi mới thành công!', 'data' => ['id' => $newId, 'name' => $name]], JSON_UNESCAPED_UNICODE);
    }

    /** PUT /api/admin/hackathons/{id} */
    public function updateHackathon(int $id): void {
        $currentUser = $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        $name     = trim($data['name']     ?? '');
        $category = trim($data['category'] ?? '');
        $start    = trim($data['start_date'] ?? '');
        $end      = trim($data['end_date']   ?? '');

        if (!$name || !$category || !$start || !$end) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Thiếu thông tin bắt buộc!'], JSON_UNESCAPED_UNICODE);
            return;
        }

        $this->hackathonService->updateHackathon($id, $data);

        $this->activityLogService->logActivity(
            $currentUser->id,
            'UPDATE',
            'contests',
            $id,
            "Cập nhật cuộc thi: " . $name,
            $_SERVER['REMOTE_ADDR'] ?? null
        );

        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Cập nhật cuộc thi thành công!', 'data' => ['id' => $id, 'name' => $name]], JSON_UNESCAPED_UNICODE);
    }

    /** DELETE /api/admin/hackathons/{id} */
    public function deleteHackathon(int $id): void {
        $currentUser = $this->requireAdmin();
        $name = $this->hackathonService->deleteHackathon($id);

        $this->activityLogService->logActivity(
            $currentUser->id,
            'DELETE',
            'contests',
            $id,
            "Xóa cuộc thi: " . $name,
            $_SERVER['REMOTE_ADDR'] ?? null
        );

        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => "Đã xoá cuộc thi \"$name\" thành công!"], JSON_UNESCAPED_UNICODE);
    }

    /** GET /api/admin/hackathons/{id}/teams */
    public function getRegisteredTeams(int $id): void {
        $this->requireAdmin();
        try {
            $teams = $this->hackathonService->getRegisteredTeams($id);
            http_response_code(200);
            echo json_encode(['status' => 'success', 'data' => $teams], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** GET /api/hackathons/{id}/teams (Public) */
    public function getPublicRegisteredTeams(int $id): void {
        try {
            $teams = $this->hackathonService->getRegisteredTeams($id);
            // Return all teams regardless of status so users can see pending teams
            http_response_code(200);
            echo json_encode(['status' => 'success', 'data' => array_values($teams)], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** GET /api/hackathons/{id}/submissions (Public) */
    public function getPublicSubmissions(int $id): void {
        try {
            $submissions = $this->hackathonService->getSubmissions($id);
            http_response_code(200);
            echo json_encode(['status' => 'success', 'data' => $submissions], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** GET /api/hackathons/{id}/participants (Public) */
    public function getPublicParticipants(int $id): void {
        try {
            $participants = $this->hackathonService->getContestParticipants($id);
            
            // Parse skills JSON string into array if needed, and set default avatars
            foreach ($participants as &$p) {
                $p['skills'] = $p['skills'] ? json_decode($p['skills'], true) : [];
                if (!is_array($p['skills'])) {
                    // if it wasn't valid json, try exploding by comma or just empty array
                    $p['skills'] = $p['skills'] ? explode(',', $p['skills']) : [];
                }
                
                if (empty($p['avatar_url'])) {
                    $p['avatar_url'] = 'https://ui-avatars.com/api/?name=' . urlencode($p['name']) . '&background=random';
                }
            }
            
            http_response_code(200);
            echo json_encode(['status' => 'success', 'data' => array_values($participants)], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** DELETE /api/admin/hackathons/{id}/teams/{teamId} */
    public function removeTeam(int $contestId, int $teamId): void {
        $currentUser = $this->requireAdmin();
        try {
            $this->hackathonService->removeTeam($contestId, $teamId);

            $this->activityLogService->logActivity(
                $currentUser->id,
                'REMOVE_TEAM',
                'teams',
                $teamId,
                "Loại đội thi ID: " . $teamId . " khỏi cuộc thi ID: " . $contestId,
                $_SERVER['REMOTE_ADDR'] ?? null
            );

            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Đã xóa đội thi khỏi cuộc thi thành công!'], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** POST /api/admin/hackathons/{contestId}/teams/{teamId}/approve */
    public function approveRegistration(int $contestId, int $teamId): void {
        $currentUser = $this->requireAdmin();
        try {
            $this->hackathonService->approveRegistration($contestId, $teamId);

            $this->activityLogService->logActivity(
                $currentUser->id,
                'APPROVE_TEAM',
                'teams',
                $teamId,
                "Duyệt đơn đăng ký của đội thi ID: " . $teamId . " tham gia cuộc thi ID: " . $contestId,
                $_SERVER['REMOTE_ADDR'] ?? null
            );

            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Đã duyệt đội thi thành công!'], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** POST /api/admin/hackathons/{contestId}/teams/{teamId}/reject */
    public function rejectRegistration(int $contestId, int $teamId): void {
        $currentUser = $this->requireAdmin();
        try {
            $this->hackathonService->rejectRegistration($contestId, $teamId);

            $this->activityLogService->logActivity(
                $currentUser->id,
                'REJECT_TEAM',
                'teams',
                $teamId,
                "Từ chối đơn đăng ký của đội thi ID: " . $teamId . " tham gia cuộc thi ID: " . $contestId,
                $_SERVER['REMOTE_ADDR'] ?? null
            );

            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Đã từ chối đội thi thành công!'], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** POST /api/admin/hackathons/upload-image */
    public function uploadImage(): void {
        $this->requireAdmin();
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Lỗi tải ảnh lên!'], JSON_UNESCAPED_UNICODE);
            return;
        }

        $file = $_FILES['file'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Chỉ chấp nhận ảnh (jpg, png, gif, svg, webp)!'], JSON_UNESCAPED_UNICODE);
            return;
        }

        $uploadDir = __DIR__ . '/../../storage/uploads/images/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $newName = uniqid('hackathon_') . '.' . $ext;
        if (move_uploaded_file($file['tmp_name'], $uploadDir . $newName)) {
            $url = '/api/images/' . $newName;
            http_response_code(200);
            echo json_encode(['status' => 'success', 'url' => $url], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Lưu file thất bại!'], JSON_UNESCAPED_UNICODE);
        }
    }

    /** GET /api/images/{filename} - Serve uploaded hackathon images */
    public function serveImage(string $filename): void {
        $filename = basename($filename);
        $filePath = __DIR__ . '/../../storage/uploads/images/' . $filename;

        if (!file_exists($filePath)) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Ảnh không tồn tại.'], JSON_UNESCAPED_UNICODE);
            return;
        }

        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($filePath);

        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . filesize($filePath));
        header('Cache-Control: public, max-age=31536000');
        readfile($filePath);
    }

    private function requireAdmin(): \App\Domain\Entity\User {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Yêu cầu phải có Token xác thực!'], JSON_UNESCAPED_UNICODE);
            exit(0);
        }
        $user = $this->authService->verifyToken($matches[1]);
        if (!$user->isAdmin()) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Chỉ Ban tổ chức (ADMIN) mới có quyền thực hiện!'], JSON_UNESCAPED_UNICODE);
            exit(0);
        }
        return $user;
    }
}

