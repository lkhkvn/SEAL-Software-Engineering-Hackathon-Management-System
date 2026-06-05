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
        
        // Lấy danh sách đội thi kèm số thành viên và trưởng nhóm
        $teamsQuery = "
            SELECT t.id, t.team_name as name, t.category, t.status, t.join_code as joinCode,
                   u.name as leaderName,
                   (SELECT COUNT(*) FROM users m WHERE m.team_id = t.id) as members,
                   (
                       SELECT GROUP_CONCAT(m.skills SEPARATOR ', ') 
                       FROM users m 
                       WHERE m.team_id = t.id AND m.skills IS NOT NULL
                   ) as skillsCombined
            FROM teams t
            LEFT JOIN users u ON t.leader_id = u.id
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
                "tech" => $techList
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
    // ROUTE 8: LẤY DANH SÁCH CUỘC THI (CÔNG KHAI - KHÔNG CẦN TOKEN)
    // GET /api/contests
    // ------------------------------------------------------------------------
    if ($path === '/api/contests' && $requestMethod === 'GET') {
        $conn = $entityManager->getConnection();

        $contests = $conn->executeQuery("
            SELECT id, name, category, description, location,
                   start_date, end_date, max_teams, status, prize, image, schedule, prize_details, rules, created_at
            FROM contests
            ORDER BY created_at DESC
        ")->fetchAllAssociative();

        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "data"   => $contests
        ], JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    // ------------------------------------------------------------------------
    // ROUTE 9: LẤY CHI TIẾT MỘT CUỘC THI (CÔNG KHAI)
    // GET /api/contests/{id}
    // ------------------------------------------------------------------------
    if (preg_match('#^/api/contests/(\d+)$#', $path, $m) && $requestMethod === 'GET') {
        $contestId = (int)$m[1];
        $conn = $entityManager->getConnection();

        $contest = $conn->executeQuery("
            SELECT id, name, category, description, location,
                   start_date, end_date, max_teams, status, prize, image, schedule, prize_details, rules, created_at
            FROM contests WHERE id = :id
        ", ['id' => $contestId])->fetchAssociative();

        if (!$contest) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Cuộc thi không tồn tại!"], JSON_UNESCAPED_UNICODE);
            exit(0);
        }

        http_response_code(200);
        echo json_encode(["status" => "success", "data" => $contest], JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    // ------------------------------------------------------------------------
    // ROUTE 10: TẠO CUỘC THI MỚI (YÊU CẦU QUYỀN ADMIN)
    // POST /api/admin/contests
    // ------------------------------------------------------------------------
    if ($path === '/api/admin/contests' && $requestMethod === 'POST') {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Yêu cầu phải có Token xác thực!"], JSON_UNESCAPED_UNICODE);
            exit(0);
        }
        $currentUser = $authService->verifyToken($matches[1]);
        if (!$currentUser->isAdmin()) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Chỉ Ban tổ chức (ADMIN) mới có quyền tạo cuộc thi!"], JSON_UNESCAPED_UNICODE);
            exit(0);
        }

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $name        = trim($data['name'] ?? '');
        $category    = trim($data['category'] ?? '');
        $description = trim($data['description'] ?? '');
        $location    = trim($data['location'] ?? '');
        $startDate   = trim($data['start_date'] ?? '');
        $endDate     = trim($data['end_date'] ?? '');
        $maxTeams    = (int)($data['max_teams'] ?? 50);
        $status      = strtoupper(trim($data['status'] ?? 'UPCOMING'));
        $prize       = trim($data['prize'] ?? '');
        $image       = trim($data['image'] ?? '');
        $schedule    = trim($data['schedule'] ?? '');
        $prizeDetails= trim($data['prize_details'] ?? '');
        $rules       = trim($data['rules'] ?? '');

        if (!$name || !$category || !$startDate || !$endDate) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu thông tin bắt buộc: tên, danh mục, ngày bắt đầu, ngày kết thúc!"], JSON_UNESCAPED_UNICODE);
            exit(0);
        }

        $allowedStatuses = ['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
        if (!in_array($status, $allowedStatuses)) {
            $status = 'UPCOMING';
        }

        $conn = $entityManager->getConnection();
        $conn->executeStatement("
            INSERT INTO contests (name, category, description, location, start_date, end_date, max_teams, status, prize, image, schedule, prize_details, rules, created_at)
            VALUES (:name, :category, :description, :location, :startDate, :endDate, :maxTeams, :status, :prize, :image, :schedule, :prizeDetails, :rules, NOW())
        ", [
            'name'        => $name,
            'category'    => $category,
            'description' => $description,
            'location'    => $location,
            'startDate'   => $startDate,
            'endDate'     => $endDate,
            'maxTeams'    => $maxTeams,
            'status'      => $status,
            'prize'       => $prize,
            'image'       => $image,
            'schedule'    => $schedule,
            'prizeDetails'=> $prizeDetails,
            'rules'       => $rules,
        ]);

        $newId = $conn->lastInsertId();

        http_response_code(201);
        echo json_encode([
            "status"  => "success",
            "message" => "Tạo cuộc thi mới thành công!",
            "data"    => ["id" => (int)$newId, "name" => $name]
        ], JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    // ------------------------------------------------------------------------
    // ROUTE 11: CẬP NHẬT CUỘC THI (YÊU CẦU QUYỀN ADMIN)
    // PUT /api/admin/contests/{id}
    // ------------------------------------------------------------------------
    if (preg_match('#^/api/admin/contests/(\d+)$#', $path, $m) && $requestMethod === 'PUT') {
        $contestId = (int)$m[1];
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Yêu cầu phải có Token xác thực!"], JSON_UNESCAPED_UNICODE);
            exit(0);
        }
        $currentUser = $authService->verifyToken($matches[1]);
        if (!$currentUser->isAdmin()) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Chỉ Ban tổ chức (ADMIN) mới có quyền cập nhật cuộc thi!"], JSON_UNESCAPED_UNICODE);
            exit(0);
        }

        $conn = $entityManager->getConnection();
        $existing = $conn->executeQuery("SELECT id FROM contests WHERE id = :id", ['id' => $contestId])->fetchAssociative();
        if (!$existing) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Cuộc thi không tồn tại!"], JSON_UNESCAPED_UNICODE);
            exit(0);
        }

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $name        = trim($data['name'] ?? '');
        $category    = trim($data['category'] ?? '');
        $description = trim($data['description'] ?? '');
        $location    = trim($data['location'] ?? '');
        $startDate   = trim($data['start_date'] ?? '');
        $endDate     = trim($data['end_date'] ?? '');
        $maxTeams    = (int)($data['max_teams'] ?? 50);
        $status      = strtoupper(trim($data['status'] ?? 'UPCOMING'));
        $prize       = trim($data['prize'] ?? '');
        $image       = trim($data['image'] ?? '');
        $schedule    = trim($data['schedule'] ?? '');
        $prizeDetails= trim($data['prize_details'] ?? '');
        $rules       = trim($data['rules'] ?? '');

        if (!$name || !$category || !$startDate || !$endDate) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu thông tin bắt buộc!"], JSON_UNESCAPED_UNICODE);
            exit(0);
        }

        $allowedStatuses = ['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
        if (!in_array($status, $allowedStatuses)) {
            $status = 'UPCOMING';
        }

        $conn->executeStatement("
            UPDATE contests
            SET name=:name, category=:category, description=:description,
                location=:location, start_date=:startDate, end_date=:endDate,
                max_teams=:maxTeams, status=:status, prize=:prize, image=:image,
                schedule=:schedule, prize_details=:prizeDetails, rules=:rules
            WHERE id=:id
        ", [
            'name'        => $name,
            'category'    => $category,
            'description' => $description,
            'location'    => $location,
            'startDate'   => $startDate,
            'endDate'     => $endDate,
            'maxTeams'    => $maxTeams,
            'status'      => $status,
            'prize'       => $prize,
            'image'       => $image,
            'schedule'    => $schedule,
            'prizeDetails'=> $prizeDetails,
            'rules'       => $rules,
            'id'          => $contestId,
        ]);

        http_response_code(200);
        echo json_encode([
            "status"  => "success",
            "message" => "Cập nhật cuộc thi thành công!",
            "data"    => ["id" => $contestId, "name" => $name]
        ], JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    // ------------------------------------------------------------------------
    // ROUTE 12: XOÁ CUỘC THI (YÊU CẦU QUYỀN ADMIN)
    // DELETE /api/admin/contests/{id}
    // ------------------------------------------------------------------------
    if (preg_match('#^/api/admin/contests/(\d+)$#', $path, $m) && $requestMethod === 'DELETE') {
        $contestId = (int)$m[1];
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Yêu cầu phải có Token xác thực!"], JSON_UNESCAPED_UNICODE);
            exit(0);
        }
        $currentUser = $authService->verifyToken($matches[1]);
        if (!$currentUser->isAdmin()) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Chỉ Ban tổ chức (ADMIN) mới có quyền xoá cuộc thi!"], JSON_UNESCAPED_UNICODE);
            exit(0);
        }

        $conn = $entityManager->getConnection();
        $existing = $conn->executeQuery("SELECT id, name FROM contests WHERE id = :id", ['id' => $contestId])->fetchAssociative();
        if (!$existing) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Cuộc thi không tồn tại!"], JSON_UNESCAPED_UNICODE);
            exit(0);
        }

        $conn->executeStatement("DELETE FROM contests WHERE id = :id", ['id' => $contestId]);

        http_response_code(200);
        echo json_encode([
            "status"  => "success",
            "message" => "Đã xoá cuộc thi \"" . $existing['name'] . "\" thành công!"
        ], JSON_UNESCAPED_UNICODE);
        exit(0);
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