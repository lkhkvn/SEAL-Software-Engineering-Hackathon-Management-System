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

        // Tìm đội của user qua users.team_id
        $row = $conn->executeQuery("
            SELECT t.id, t.team_name as name, t.join_code as joinCode, t.category,
                   t.max_members as maxMembers, t.status, t.leader_id as leaderId,
                   (SELECT COUNT(*) FROM users u2 WHERE u2.team_id = t.id) as memberCount
            FROM teams t
            INNER JOIN users u1 ON u1.team_id = t.id
            WHERE u1.id = :userId
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
                SELECT name, email, role, phone, cv_summary, cv_education, cv_experience, cv_portfolio_url, cv_theme, skills, avatar_url, date_of_birth
                FROM users
                WHERE id = :id
            ", ['id' => $currentUser->id])->fetchAssociative();

            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'data' => [
                    'name' => $row['name'] ?? '',
                    'email' => $row['email'] ?? '',
                    'role' => $row['role'] ?? '',
                    'phone' => $row['phone'] ?? '',
                    'summary' => $row['cv_summary'] ?? '',
                    'education' => $row['cv_education'] ?? '',
                    'experience' => $row['cv_experience'] ?? '',
                    'portfolioUrl' => $row['cv_portfolio_url'] ?? '',
                    'theme' => $row['cv_theme'] ?? 'ocean',
                    'skills' => $row['skills'] ?? '',
                    'avatarUrl' => $row['avatar_url'] ?? '',
                    'dateOfBirth' => $row['date_of_birth'] ?? '',
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
            $name = trim($input['name'] ?? '');
            $phone = trim($input['phone'] ?? '');
            $summary = trim($input['summary'] ?? '');
            $education = trim($input['education'] ?? '');
            $experience = trim($input['experience'] ?? '');
            $portfolioUrl = trim($input['portfolioUrl'] ?? '');
            $theme = trim($input['theme'] ?? 'ocean');
            $skills = trim($input['skills'] ?? '');
            $dateOfBirth = trim($input['dateOfBirth'] ?? '');

            if (!in_array($theme, ['ocean', 'emerald', 'sunset', 'midnight'])) {
                $theme = 'ocean';
            }

            // Validate date_of_birth format (YYYY-MM-DD)
            $dobValue = null;
            if (!empty($dateOfBirth)) {
                $d = \DateTime::createFromFormat('Y-m-d', $dateOfBirth);
                if ($d && $d->format('Y-m-d') === $dateOfBirth) {
                    $dobValue = $dateOfBirth;
                }
            }

            $conn = $this->em->getConnection();
            $conn->executeStatement("
                UPDATE users 
                SET name = COALESCE(NULLIF(:name, ''), name),
                    phone = :phone,
                    cv_summary = :summary,
                    cv_education = :education,
                    cv_experience = :experience,
                    cv_portfolio_url = :portfolioUrl,
                    cv_theme = :theme,
                    skills = :skills,
                    date_of_birth = :dateOfBirth
                WHERE id = :id
            ", [
                'name' => $name,
                'phone' => $phone ?: null,
                'summary' => $summary ?: null,
                'education' => $education ?: null,
                'experience' => $experience ?: null,
                'portfolioUrl' => $portfolioUrl ?: null,
                'theme' => $theme,
                'skills' => $skills ?: null,
                'dateOfBirth' => $dobValue,
                'id' => $currentUser->id
            ]);

            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Cập nhật CV thành công!'], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** POST /api/users/me/avatar - Upload ảnh đại diện */
    public function uploadAvatar(): void {
        try {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

            if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'Yêu cầu phải có Token xác thực!'], JSON_UNESCAPED_UNICODE);
                return;
            }

            $currentUser = $this->authService->verifyToken($matches[1]);

            // Kiểm tra file upload
            if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Vui lòng chọn ảnh đại diện!'], JSON_UNESCAPED_UNICODE);
                return;
            }

            $file = $_FILES['avatar'];
            $maxSize = 5 * 1024 * 1024; // 5MB

            if ($file['size'] > $maxSize) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Ảnh quá lớn! Giới hạn tối đa 5MB.'], JSON_UNESCAPED_UNICODE);
                return;
            }

            // Kiểm tra extension
            $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if (!in_array($ext, $allowedExts)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Chỉ hỗ trợ ảnh JPG, PNG, WebP, GIF.'], JSON_UNESCAPED_UNICODE);
                return;
            }

            // Kiểm tra MIME type
            $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->file($file['tmp_name']);
            if (!in_array($mimeType, $allowedMimes)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Nội dung file không phải ảnh hợp lệ.'], JSON_UNESCAPED_UNICODE);
                return;
            }

            // Tạo thư mục avatars
            $avatarDir = __DIR__ . '/../../storage/uploads/avatars/';
            if (!is_dir($avatarDir)) {
                mkdir($avatarDir, 0755, true);
            }

            // Xóa avatar cũ nếu có
            $conn = $this->em->getConnection();
            $oldAvatar = $conn->executeQuery("SELECT avatar_url FROM users WHERE id = :id", ['id' => $currentUser->id])->fetchOne();
            if ($oldAvatar) {
                $oldFilename = basename($oldAvatar);
                $oldPath = $avatarDir . $oldFilename;
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            }

            // Tạo tên file unique
            $uniqueName = 'avatar_' . $currentUser->id . '_' . time() . '.' . $ext;
            $destPath = $avatarDir . $uniqueName;

            if (!move_uploaded_file($file['tmp_name'], $destPath)) {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Không thể lưu ảnh lên server.'], JSON_UNESCAPED_UNICODE);
                return;
            }

            // Cập nhật DB
            $avatarUrl = '/api/avatars/' . $uniqueName;
            $conn->executeStatement("UPDATE users SET avatar_url = :url WHERE id = :id", [
                'url' => $avatarUrl,
                'id' => $currentUser->id
            ]);

            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => 'Upload ảnh đại diện thành công!',
                'data' => ['avatarUrl' => $avatarUrl]
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** GET /api/avatars/{filename} - Phục vụ file ảnh avatar */
    public function serveAvatar(string $filename): void {
        // Chống path traversal
        $filename = basename($filename);
        $filePath = __DIR__ . '/../../storage/uploads/avatars/' . $filename;

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
}
