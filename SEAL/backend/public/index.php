<?php
// ============================================================================
// 1. CẤU HÌNH BẢO MẬT CORS & HIỂN THỊ LỖI ĐỂ DEBUG
// ============================================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Content-Type: application/json; charset=UTF-8");

// TẮT HIỂN THỊ LỖI RA RESPONSE (tránh làm hỏng JSON)
// Warning/Notice sẽ được ghi vào error log thay vì in ra màn hình
ini_set('html_errors', 0);
ini_set('display_errors', 0);   // <-- TẮT: không in error ra response body
ini_set('log_errors', 1);       // Ghi lỗi vào PHP error log để debug
error_reporting(E_ALL);

// Giải quyết Preflight Request (Request OPTIONS tự động từ trình duyệt)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Thêm App\ vào đầu các Namespace để khớp với cấu trúc thư mục trong src/
use App\Services\AuthService;
use App\Infrastructure\Persistence\DoctrineUserRepository; 
use App\DTO\RegisterRequestDTO;
use App\DTO\LoginRequestDTO;

try {
    // ============================================================================
    // 2. IMPORT CÁC THƯ VIỆN & TỰ ĐỘNG TẢI CLASS (AUTOLOAD)
    // ============================================================================
    // Lùi lại 1 cấp thư mục (/../) vì file index.php đang nằm trong thư mục public/
    if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
        require_once __DIR__ . '/../vendor/autoload.php';
    } else {
        throw new Exception("Không tìm thấy thư mục vendor. Hãy chạy lệnh 'composer install' bên trong container backend.");
    }

    // Nạp file cấu hình Doctrine từ gốc dự án
    if (file_exists(__DIR__ . '/../cli-config.php')) {
        $entityManager = require __DIR__ . '/../cli-config.php';
    } else {
        throw new Exception("Không tìm thấy file cấu hình cli-config.php ở thư mục gốc.");
    }

    // Kiểm tra an toàn xem biến trả về có phải EntityManager hợp lệ không
    if (!($entityManager instanceof \Doctrine\ORM\EntityManagerInterface)) {
        throw new Exception("File cli-config.php chưa trả về một thực thể (instance) hợp lệ của EntityManager.");
    }

    // Khởi tạo tầng hạ tầng (Repository) và tầng nghiệp vụ (Service)
    $userRepository = new DoctrineUserRepository($entityManager);
    $authService = new AuthService($userRepository);

    // ============================================================================
    // 3. BỘ ĐỊNH TUYẾN ROUTER THỦ CÔNG (ĐỌC ĐƯỜNG DẪN URL)
    // ============================================================================
    $requestUri = $_SERVER['REQUEST_URI'];
    $requestMethod = $_SERVER['REQUEST_METHOD'];

    // Loại bỏ "index.php" ra khỏi chuỗi URL nếu có để lọc chính xác path
    $path = parse_url($requestUri, PHP_URL_PATH);
    $path = str_replace('/index.php', '', $path);

    // ------------------------------------------------------------------------
    // ROUTE 1: ĐĂNG KÝ TÀI KHOẢN
    // ------------------------------------------------------------------------
    if ($path === '/api/auth/register' && $requestMethod === 'POST') {
        // Đọc dữ liệu JSON thô gửi từ React lên
        $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
        
        // ĐÃ SỬA: Truyền trực tiếp $inputData vào hàm khởi tạo của DTO
        $dto = new RegisterRequestDTO($inputData);

        // Thực thi nghiệp vụ đăng ký tài khoản
        $user = $authService->register($dto);

        // Phản hồi kết quả về dạng JSON cho React nhận diện
        http_response_code(201); // 201 Created
        echo json_encode([
            "status" => "success",
            "message" => "Đăng ký tài khoản thành công!",
            "data" => [
                "username" => $user->username,
                "email" => $user->email
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    // ------------------------------------------------------------------------
    // ROUTE 2: ĐĂNG NHẬP
    // ------------------------------------------------------------------------
    if ($path === '/api/auth/login' && $requestMethod === 'POST') {
        // Đọc dữ liệu JSON thô gửi từ React lên
        $inputData = json_decode(file_get_contents('php://input'), true) ?? [];

        // Khởi tạo DTO đăng nhập từ dữ liệu JSON nhận được
        $dto = new LoginRequestDTO($inputData);

        // Thực thi nghiệp vụ xác thực đăng nhập
        $result = $authService->login($dto);

        // Phản hồi token về cho React lưu vào localStorage
        http_response_code(200); // 200 OK
        echo json_encode([
            "status" => "success",
            "message" => "Đăng nhập thành công!",
            "data" => $result
        ], JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    // ------------------------------------------------------------------------
    // ROUTE 3: ADMIN TẠO TÀI KHOẢN GIÁM KHẢO (JUDGE)
    // ------------------------------------------------------------------------
    if ($path === '/api/auth/create-judge' && $requestMethod === 'POST') {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            throw new Exception("Yêu cầu phải có Token xác thực hợp lệ!");
        }

        // Lấy Token và xác minh bằng AuthService
        $token = $matches[1];
        $currentUser = $authService->verifyToken($token);

        // Kiểm tra quyền Admin
        if (!$currentUser->isAdmin()) {
            http_response_code(403);
            echo json_encode([
                "status" => "error",
                "message" => "Chỉ Ban tổ chức (ADMIN) mới có quyền tạo Giám khảo!"
            ], JSON_UNESCAPED_UNICODE);
            exit(0);
        }

        // Thực thi nghiệp vụ tạo Giám khảo
        $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
        $dto = new RegisterRequestDTO($inputData);
        $judge = $authService->registerJudge($dto);

        http_response_code(201);
        echo json_encode([
            "status" => "success",
            "message" => "Tạo tài khoản Giám khảo thành công!",
            "data" => [
                "username" => $judge->username,
                "email" => $judge->email,
                "role" => $judge->role
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    // ------------------------------------------------------------------------
    // ROUTE 4: LẤY DANH SÁCH TẤT CẢ NGƯỜI DÙNG (YÊU CẦU QUYỀN ADMIN)
    // ------------------------------------------------------------------------
    if ($path === '/api/admin/users' && $requestMethod === 'GET') {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            throw new Exception("Yêu cầu phải có Token xác thực hợp lệ!");
        }

        $token = $matches[1];
        $currentUser = $authService->verifyToken($token);

        if (!$currentUser->isAdmin()) {
            http_response_code(403);
            echo json_encode([
                "status" => "error",
                "message" => "Chỉ Ban tổ chức (ADMIN) mới có quyền truy cập!"
            ], JSON_UNESCAPED_UNICODE);
            exit(0);
        }

        $users = $userRepository->findAll();
        $userDataList = array_map(function($user) {
            return [
                "id" => $user->id,
                "username" => $user->username,
                "email" => $user->email,
                "role" => $user->role,
                "phone" => $user->phone,
                "skills" => $user->skills,
                "teamId" => $user->teamId
            ];
        }, $users);

        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "data" => $userDataList
        ], JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    // ------------------------------------------------------------------------
    // ROUTE 5: CẬP NHẬT VAI TRÒ NGƯỜI DÙNG (YÊU CẦU QUYỀN ADMIN)
    // ------------------------------------------------------------------------
    if ($path === '/api/admin/users/update-role' && $requestMethod === 'POST') {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            throw new Exception("Yêu cầu phải có Token xác thực hợp lệ!");
        }

        $token = $matches[1];
        $currentUser = $authService->verifyToken($token);

        if (!$currentUser->isAdmin()) {
            http_response_code(403);
            echo json_encode([
                "status" => "error",
                "message" => "Chỉ Ban tổ chức (ADMIN) mới có quyền thay đổi vai trò!"
            ], JSON_UNESCAPED_UNICODE);
            exit(0);
        }

        $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
        $userId = $inputData['userId'] ?? null;
        $newRole = $inputData['role'] ?? null;

        if (!$userId || !$newRole) {
            throw new Exception("Thiếu thông tin userId hoặc vai trò (role)!");
        }

        $allowedRoles = ['ADMIN', 'JUDGE', 'PARTICIPANT'];
        if (!in_array(strtoupper($newRole), $allowedRoles)) {
            throw new Exception("Vai trò mới không hợp lệ!");
        }

        $targetUser = $userRepository->findById((int)$userId);
        if (!$targetUser) {
            throw new Exception("Người dùng không tồn tại!");
        }

        $updatedUser = $targetUser->withRole(strtoupper($newRole));
        $userRepository->save($updatedUser);

        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Cập nhật vai trò người dùng thành công!",
            "data" => [
                "id" => $updatedUser->id,
                "username" => $updatedUser->username,
                "email" => $updatedUser->email,
                "role" => $updatedUser->role
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    // ------------------------------------------------------------------------
    // ROUTE 6: LẤY DANH SÁCH ĐỘI THI (REAL DATA)
    // ------------------------------------------------------------------------
    if ($path === '/api/teams' && $requestMethod === 'GET') {
        $conn = $entityManager->getConnection();
        
        // Lấy danh sách đội thi kèm số thành viên, trưởng nhóm và thông tin dự án
        $teamsQuery = "
            SELECT t.id, t.team_name as name, t.category, t.status, t.join_code as joinCode,
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
        
        // Định dạng lại các trường cho khớp với Frontend
        $formattedTeams = array_map(function($team) use ($conn) {
            $teamId = (int)$team['id'];
            
            // Tính tổng điểm trung bình các tiêu chí chấm điểm
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
            
            // Lấy danh sách công nghệ chính từ kỹ năng thành viên
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
                "id" => $teamId,
                "name" => $team['name'],
                "members" => (int)$team['members'],
                "category" => $team['category'],
                "status" => $team['status'],
                "joinCode" => $team['joinCode'],
                "leaderName" => $team['leaderName'],
                "score" => (float)number_format((float)$totalScore, 1),
                "tech" => $techList,
                "project" => $team['projectName'] ? [
                    "name" => $team['projectName'],
                    "description" => $team['projectDescription'],
                    "githubUrl" => $team['githubUrl'],
                    "demoVideoUrl" => $team['demoVideoUrl']
                ] : null
            ];
        }, $teams);

        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "data" => $formattedTeams
        ], JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    // ------------------------------------------------------------------------
    // ROUTE 7: LẤY BẢNG XẾP HẠNG (REAL DATA)
    // ------------------------------------------------------------------------
    if ($path === '/api/leaderboard' && $requestMethod === 'GET') {
        $conn = $entityManager->getConnection();
        
        $teams = $conn->executeQuery("SELECT id, team_name as name, category FROM teams")->fetchAllAssociative();
        
        $leaderboard = array_map(function($team) use ($conn) {
            $teamId = (int)$team['id'];
            
            // Lấy điểm trung bình từng tiêu chí của đội
            $innovation = $conn->executeQuery("SELECT COALESCE(AVG(score), 0) FROM scores WHERE team_id = :teamId AND criteria_id = 1", ['teamId' => $teamId])->fetchOne();
            $technical = $conn->executeQuery("SELECT COALESCE(AVG(score), 0) FROM scores WHERE team_id = :teamId AND criteria_id = 2", ['teamId' => $teamId])->fetchOne();
            $presentation = $conn->executeQuery("SELECT COALESCE(AVG(score), 0) FROM scores WHERE team_id = :teamId AND criteria_id = 3", ['teamId' => $teamId])->fetchOne();
            $feasibility = $conn->executeQuery("SELECT COALESCE(AVG(score), 0) FROM scores WHERE team_id = :teamId AND criteria_id = 4", ['teamId' => $teamId])->fetchOne();
            
            // Lấy thông tin thành viên & công nghệ
            $memberCount = $conn->executeQuery("SELECT COUNT(*) FROM users WHERE team_id = :teamId", ['teamId' => $teamId])->fetchOne();
            
            $skillsQuery = "SELECT GROUP_CONCAT(skills SEPARATOR ', ') FROM users WHERE team_id = :teamId AND skills IS NOT NULL";
            $skillsCombined = $conn->executeQuery($skillsQuery, ['teamId' => $teamId])->fetchOne();
            
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
                "teamId" => $teamId,
                "team" => $team['name'],
                "category" => $team['category'],
                "innovation" => round((float)$innovation, 1),
                "technical" => round((float)$technical, 1),
                "presentation" => round((float)$presentation, 1),
                "feasibility" => round((float)$feasibility, 1),
                "score" => round($totalScore, 1),
                "members" => (int)$memberCount,
                "tech" => $techList
            ];
        }, $teams);
        
        // Sắp xếp bảng xếp hạng theo tổng điểm giảm dần
        usort($leaderboard, function($a, $b) {
            if ($b['score'] == $a['score']) {
                return 0;
            }
            return ($b['score'] < $a['score']) ? -1 : 1;
        });
        
        // Gán thứ hạng
        foreach ($leaderboard as $index => &$entry) {
            $entry['rank'] = $index + 1;
        }

        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "data" => $leaderboard
        ], JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    // ------------------------------------------------------------------------
    // API: ĐĂNG KÝ / TẠO / THAM GIA ĐỘI THI (REAL DATA)
    // ------------------------------------------------------------------------
    if ($path === '/api/teams' && $requestMethod === 'POST') {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            throw new Exception("Yêu cầu phải có Token xác thực hợp lệ!");
        }

        $token = $matches[1];
        $currentUser = $authService->verifyToken($token);

        $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
        $teamName = $inputData['name'] ?? '';
        $category = $inputData['category'] ?? 'AI & ML';
        
        if (empty($teamName)) {
            throw new Exception("Tên đội thi không được để trống!");
        }

        $conn = $entityManager->getConnection();
        
        // Kiểm tra xem tên đội đã tồn tại chưa
        $existingTeam = $conn->executeQuery("SELECT id FROM teams WHERE team_name = :name", ['name' => $teamName])->fetchOne();
        if ($existingTeam) {
            throw new Exception("Tên đội thi này đã tồn tại!");
        }

        // Tạo mã join code ngẫu nhiên dạng AI123, CW456...
        $prefix = strtoupper(substr(str_replace(' ', '', $teamName), 0, 2));
        if (empty($prefix) || strlen($prefix) < 2) {
            $prefix = 'TM';
        }
        $joinCode = $prefix . rand(100, 999);

        // Chèn đội thi vào bảng teams
        $conn->executeStatement("
            INSERT INTO teams (team_name, category, join_code, status, leader_id) 
            VALUES (:teamName, :category, :joinCode, 'APPROVED', :leaderId)
        ", [
            'teamName' => $teamName,
            'category' => $category,
            'joinCode' => $joinCode,
            'leaderId' => $currentUser->id
        ]);

        $teamId = $conn->lastInsertId();

        // Cập nhật team_id cho người tạo (Trưởng nhóm)
        $conn->executeStatement("
            UPDATE users SET team_id = :teamId WHERE id = :userId
        ", [
            'teamId' => $teamId,
            'userId' => $currentUser->id
        ]);

        http_response_code(201);
        echo json_encode([
            "status" => "success",
            "message" => "Tạo đội thi và đăng ký tham gia thành công!",
            "data" => [
                "teamId" => (int)$teamId,
                "teamName" => $teamName,
                "joinCode" => $joinCode
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    if ($path === '/api/teams/join' && $requestMethod === 'POST') {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            throw new Exception("Yêu cầu phải có Token xác thực hợp lệ!");
        }

        $token = $matches[1];
        $currentUser = $authService->verifyToken($token);

        $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
        $joinCode = $inputData['joinCode'] ?? '';

        if (empty($joinCode)) {
            throw new Exception("Vui lòng nhập mã tham gia!");
        }

        $conn = $entityManager->getConnection();
        
        // Tìm đội thi theo mã joinCode
        $team = $conn->executeQuery("SELECT id, team_name FROM teams WHERE join_code = :joinCode", ['joinCode' => $joinCode])->fetchAssociative();
        if (!$team) {
            throw new Exception("Mã tham gia không chính xác hoặc đội thi không tồn tại!");
        }

        // Cập nhật team_id cho người dùng
        $conn->executeStatement("
            UPDATE users SET team_id = :teamId WHERE id = :userId
        ", [
            'teamId' => $team['id'],
            'userId' => $currentUser->id
        ]);

        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Tham gia đội thi thành công!",
            "data" => [
                "teamId" => (int)$team['id'],
                "teamName" => $team['team_name']
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    // ------------------------------------------------------------------------
    // API: HACKATHONS
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    // API: HACKATHONS
    // ------------------------------------------------------------------------
    if ($path === '/api/hackathons' && $requestMethod === 'POST') {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            throw new Exception("Yêu cầu phải có Token xác thực hợp lệ!");
        }

        $token = $matches[1];
        $currentUser = $authService->verifyToken($token);

        if (!$currentUser->isAdmin()) {
            http_response_code(403);
            echo json_encode([
                "status" => "error",
                "message" => "Chỉ Ban tổ chức (ADMIN) mới có quyền tạo cuộc thi!"
            ], JSON_UNESCAPED_UNICODE);
            exit(0);
        }

        $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
        $hackathon = new \App\Infrastructure\Model\HackathonModel();
        $hackathon->name = $inputData['name'] ?? 'Untitled Hackathon';
        $hackathon->description = $inputData['description'] ?? null;
        if (!empty($inputData['startDate'])) $hackathon->startDate = new \DateTime($inputData['startDate']);
        if (!empty($inputData['endDate'])) $hackathon->endDate = new \DateTime($inputData['endDate']);
        if (!empty($inputData['registrationStart'])) $hackathon->registrationStart = new \DateTime($inputData['registrationStart']);
        if (!empty($inputData['registrationEnd'])) $hackathon->registrationEnd = new \DateTime($inputData['registrationEnd']);
        if (!empty($inputData['status'])) $hackathon->status = $inputData['status'];
        if (!empty($inputData['category'])) $hackathon->category = $inputData['category'];
        if (!empty($inputData['location'])) $hackathon->location = $inputData['location'];
        if (isset($inputData['maxTeams'])) $hackathon->maxTeams = (int)$inputData['maxTeams'];

        $entityManager->persist($hackathon);
        $entityManager->flush();

        http_response_code(201);
        echo json_encode(["status" => "success", "message" => "Hackathon created", "id" => $hackathon->id], JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    if ($path === '/api/hackathons' && $requestMethod === 'GET') {
        $repo = $entityManager->getRepository(\App\Infrastructure\Model\HackathonModel::class);
        $hackathons = $repo->findAll();
        $data = array_map(function($h) {
            return [
                "id" => $h->id,
                "name" => $h->name,
                "description" => $h->description,
                "startDate" => $h->startDate ? $h->startDate->format('c') : null,
                "endDate" => $h->endDate ? $h->endDate->format('c') : null,
                "registrationStart" => $h->registrationStart ? $h->registrationStart->format('c') : null,
                "registrationEnd" => $h->registrationEnd ? $h->registrationEnd->format('c') : null,
                "status" => $h->status,
                "category" => $h->category,
                "location" => $h->location,
                "maxTeams" => $h->maxTeams
            ];
        }, $hackathons);
        http_response_code(200);
        echo json_encode(["status" => "success", "data" => $data], JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    if (preg_match('#^/api/hackathons/(\d+)$#', $path, $matches)) {
        $id = (int)$matches[1];
        $repo = $entityManager->getRepository(\App\Infrastructure\Model\HackathonModel::class);
        $hackathon = $repo->find($id);

        if (!$hackathon) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Hackathon not found"], JSON_UNESCAPED_UNICODE);
            exit(0);
        }

        if ($requestMethod === 'GET') {
            http_response_code(200);
            echo json_encode(["status" => "success", "data" => [
                "id" => $hackathon->id,
                "name" => $hackathon->name,
                "description" => $hackathon->description,
                "startDate" => $hackathon->startDate ? $hackathon->startDate->format('c') : null,
                "endDate" => $hackathon->endDate ? $hackathon->endDate->format('c') : null,
                "registrationStart" => $hackathon->registrationStart ? $hackathon->registrationStart->format('c') : null,
                "registrationEnd" => $hackathon->registrationEnd ? $hackathon->registrationEnd->format('c') : null,
                "status" => $hackathon->status,
                "category" => $hackathon->category,
                "location" => $hackathon->location,
                "maxTeams" => $hackathon->maxTeams
            ]], JSON_UNESCAPED_UNICODE);
            exit(0);
        }

        if ($requestMethod === 'PUT') {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches_token)) {
                throw new Exception("Yêu cầu phải có Token xác thực hợp lệ!");
            }

            $token = $matches_token[1];
            $currentUser = $authService->verifyToken($token);

            if (!$currentUser->isAdmin()) {
                http_response_code(403);
                echo json_encode([
                    "status" => "error",
                    "message" => "Chỉ Ban tổ chức (ADMIN) mới có quyền cập nhật cuộc thi!"
                ], JSON_UNESCAPED_UNICODE);
                exit(0);
            }

            $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
            if (isset($inputData['name'])) $hackathon->name = $inputData['name'];
            if (isset($inputData['description'])) $hackathon->description = $inputData['description'];
            if (isset($inputData['startDate'])) $hackathon->startDate = new \DateTime($inputData['startDate']);
            if (isset($inputData['endDate'])) $hackathon->endDate = new \DateTime($inputData['endDate']);
            if (isset($inputData['registrationStart'])) $hackathon->registrationStart = new \DateTime($inputData['registrationStart']);
            if (isset($inputData['registrationEnd'])) $hackathon->registrationEnd = new \DateTime($inputData['registrationEnd']);
            if (isset($inputData['status'])) $hackathon->status = $inputData['status'];
            if (isset($inputData['category'])) $hackathon->category = $inputData['category'];
            if (isset($inputData['location'])) $hackathon->location = $inputData['location'];
            if (isset($inputData['maxTeams'])) $hackathon->maxTeams = (int)$inputData['maxTeams'];

            $entityManager->flush();
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Hackathon updated"], JSON_UNESCAPED_UNICODE);
            exit(0);
        }

        if ($requestMethod === 'DELETE') {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches_token)) {
                throw new Exception("Yêu cầu phải có Token xác thực hợp lệ!");
            }

            $token = $matches_token[1];
            $currentUser = $authService->verifyToken($token);

            if (!$currentUser->isAdmin()) {
                http_response_code(403);
                echo json_encode([
                    "status" => "error",
                    "message" => "Chỉ Ban tổ chức (ADMIN) mới có quyền xóa cuộc thi!"
                ], JSON_UNESCAPED_UNICODE);
                exit(0);
            }

            $entityManager->remove($hackathon);
            $entityManager->flush();
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Hackathon deleted"], JSON_UNESCAPED_UNICODE);
            exit(0);
        }
    }

    // ------------------------------------------------------------------------
    // API: MILESTONES
    // ------------------------------------------------------------------------
    if (preg_match('#^/api/hackathons/(\d+)/milestones$#', $path, $matches)) {
        $hackathonId = (int)$matches[1];
        $repo = $entityManager->getRepository(\App\Infrastructure\Model\MilestoneModel::class);

        if ($requestMethod === 'POST') {
            $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
            $milestone = new \App\Infrastructure\Model\MilestoneModel();
            $milestone->hackathonId = $hackathonId;
            $milestone->name = $inputData['name'] ?? 'Untitled Milestone';
            $milestone->description = $inputData['description'] ?? null;
            if (!empty($inputData['dueDate'])) $milestone->dueDate = new \DateTime($inputData['dueDate']);

            $entityManager->persist($milestone);
            $entityManager->flush();

            http_response_code(201);
            echo json_encode(["status" => "success", "message" => "Milestone created", "id" => $milestone->id], JSON_UNESCAPED_UNICODE);
            exit(0);
        }

        if ($requestMethod === 'GET') {
            $milestones = $repo->findBy(['hackathonId' => $hackathonId]);
            $data = array_map(function($m) {
                return [
                    "id" => $m->id,
                    "hackathonId" => $m->hackathonId,
                    "name" => $m->name,
                    "description" => $m->description,
                    "dueDate" => $m->dueDate ? $m->dueDate->format('c') : null
                ];
            }, $milestones);
            http_response_code(200);
            echo json_encode(["status" => "success", "data" => $data], JSON_UNESCAPED_UNICODE);
            exit(0);
        }
    }

    // ------------------------------------------------------------------------
    // API: SCHEDULES
    // ------------------------------------------------------------------------
    if ($path === '/api/schedules') {
        $repo = $entityManager->getRepository(\App\Infrastructure\Model\ScheduleModel::class);

        if ($requestMethod === 'POST') {
            $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
            $schedule = new \App\Infrastructure\Model\ScheduleModel();
            $schedule->title = $inputData['title'] ?? 'Untitled Event';
            $schedule->description = $inputData['description'] ?? null;
            if (!empty($inputData['hackathonId'])) $schedule->hackathonId = (int)$inputData['hackathonId'];
            if (!empty($inputData['startTime'])) $schedule->startTime = new \DateTime($inputData['startTime']);
            else $schedule->startTime = new \DateTime(); // Require start time
            if (!empty($inputData['endTime'])) $schedule->endTime = new \DateTime($inputData['endTime']);
            $schedule->location = $inputData['location'] ?? null;

            $entityManager->persist($schedule);
            $entityManager->flush();

            http_response_code(201);
            echo json_encode(["status" => "success", "message" => "Schedule created", "id" => $schedule->id], JSON_UNESCAPED_UNICODE);
            exit(0);
        }

        if ($requestMethod === 'GET') {
            // Optional filter by hackathonId
            $hackathonId = $_GET['hackathonId'] ?? null;
            $criteria = [];
            if ($hackathonId) {
                $criteria['hackathonId'] = (int)$hackathonId;
            }
            $schedules = $repo->findBy($criteria);
            
            $data = array_map(function($s) {
                return [
                    "id" => $s->id,
                    "hackathonId" => $s->hackathonId,
                    "title" => $s->title,
                    "description" => $s->description,
                    "startTime" => $s->startTime ? $s->startTime->format('c') : null,
                    "endTime" => $s->endTime ? $s->endTime->format('c') : null,
                    "location" => $s->location
                ];
            }, $schedules);

            http_response_code(200);
            echo json_encode(["status" => "success", "data" => $data], JSON_UNESCAPED_UNICODE);
            exit(0);
        }
    }

    // ------------------------------------------------------------------------
    // LỖI 404: KHÔNG TÌM THẤY ENDPOINT PHÙ HỢP
    // ------------------------------------------------------------------------
    http_response_code(404);
    echo json_encode([
        "status" => "error",
        "message" => "Endpoint API không tồn tại trên hệ thống!"
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    // ============================================================================
    // 4. BỘ ĐÓN ĐẦU VÀ XỬ LÝ LỖI TOÀN CỤC (BAO GỒM CẢ EXCEPTION VÀ FATAL ERROR)
    // ============================================================================
    http_response_code(500); // Trả về lỗi hệ thống nhưng đóng gói bằng JSON sạch
    echo json_encode([
        "status" => "error",
        "message" => "Lỗi Backend: " . $e->getMessage(),
        "file" => $e->getFile(),
        "line" => $e->getLine()
    ], JSON_UNESCAPED_UNICODE);
    exit(1);
}