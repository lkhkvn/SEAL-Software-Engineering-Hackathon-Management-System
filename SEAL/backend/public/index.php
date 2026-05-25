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