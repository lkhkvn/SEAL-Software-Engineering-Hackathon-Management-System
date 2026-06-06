<?php

namespace App\Services; 

use App\Domain\Entity\User; 
use App\Domain\Repositories\UserRepositoryInterface; 
use App\DTO\RegisterRequestDTO; 
use App\DTO\LoginRequestDTO; 
use Exception; // ĐÃ SỬA: Xóa bỏ App\ để dùng Exception chuẩn của PHP toàn cục

class AuthService
{
    private UserRepositoryInterface $userRepository;

    // Injection Interface từ tầng Domain, đảm bảo tính độc lập
    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * Kịch bản xử lý Đăng ký tài khoản mới (Username, Email, Password)
     */
    public function register(RegisterRequestDTO $dto): User
    {
        // 1. Validation cơ bản đầu vào
        if (empty($dto->username)) {
            throw new Exception("Tên đăng nhập không được để trống!");
        }
        if (!filter_var($dto->email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Định dạng email không hợp lệ!");
        }
        if (strlen($dto->password) < 6) {
            throw new Exception("Mật khẩu phải chứa ít nhất 6 ký tự!");
        }

        // 2. Kiểm tra trùng lặp email trong hệ thống
        if ($this->userRepository->findByEmail($dto->email)) {
            throw new Exception("Email này đã được sử dụng!");
        }

        // 3. Mã hóa mật khẩu an toàn bằng thuật toán Bcrypt mặc định của PHP
        $hashedPassword = password_hash($dto->password, PASSWORD_BCRYPT);

        // 4. ĐÃ SỬA: Khởi tạo Entity User theo ĐÚNG thứ tự tham số trong file User.php của bạn
        // Thứ tự chuẩn: $username, $email, $password, còn các biến $role, $phone, $id... có giá trị mặc định nên không cần truyền vào đây.
        $user = new User(
            username: $dto->username,
            email: $dto->email,
            password: $hashedPassword
        );

        // 5. Lưu xuống cơ sở dữ liệu qua Repository
        $this->userRepository->save($user);

        return $user;
    }

    /**
     * Kịch bản xử lý Đăng nhập (Bằng chính xác Email & Password)
     */
    public function login(LoginRequestDTO $dto): array
    {
        // 1. Tìm kiếm User theo đúng Email
        $user = $this->userRepository->findByEmail($dto->email);

        // 2. Gọi hàm nghiệp vụ nội tại của Entity để đối chiếu mật khẩu
        if (!$user || !$user->verifyPassword($dto->password)) {
            throw new Exception("Email hoặc mật khẩu không chính xác!");
        }

        // 3. Tạo chuỗi Token bảo mật để duy trì phiên đăng nhập
        $token = $this->generateSecureToken($user);

        return [
            'token' => $token,
            'user' => [
                'id'       => $user->id,
                'username' => $user->username,
                'email'    => $user->email,
                'role'     => $user->role  // ✅ FIX: Bổ sung role để Frontend kiểm tra quyền Admin
            ]
        ];
    }


    /**
     * Tạo tài khoản Giám khảo (JUDGE) - Chỉ Admin mới có quyền gọi
     */
    public function registerJudge(RegisterRequestDTO $dto): User
    {
        if (empty($dto->username)) {
            throw new Exception("Tên đăng nhập không được để trống!");
        }
        if (!filter_var($dto->email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Định dạng email không hợp lệ!");
        }
        if (strlen($dto->password) < 6) {
            throw new Exception("Mật khẩu phải chứa ít nhất 6 ký tự!");
        }
        if ($this->userRepository->findByEmail($dto->email)) {
            throw new Exception("Email này đã được sử dụng!");
        }

        $hashedPassword = password_hash($dto->password, PASSWORD_BCRYPT);

        $judge = new User(
            username: $dto->username,
            email:    $dto->email,
            password: $hashedPassword,
            role:     'JUDGE'
        );

        $this->userRepository->save($judge);
        return $judge;
    }

    /**
     * Hàm hỗ trợ tạo mã Token bảo mật dạng JWT thủ công
     */
    private function generateSecureToken(User $user): string
    {
        $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        
        $payload = base64_encode(json_encode([
            'id'   => $user->id,
            'exp'  => time() + 86400 // Token có giá trị trong 24 giờ
        ]));

        // Khóa bí mật của hệ thống
        $secretKey = "SEAL_HACKATHON_SUPER_SECRET_KEY_2026";

        // Ký số bảo mật chống giả mạo
        $signature = hash_hmac('sha256', "$header.$payload", $secretKey, true);
        $signature = base64_encode($signature);

        return "$header.$payload.$signature";
    }

    /**
     * Kịch bản xử lý Xác thực Token
     */
    public function verifyToken(string $token): User
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new Exception("Token không hợp lệ!");
        }

        [$header, $payload, $signature] = $parts;

        $secretKey = "SEAL_HACKATHON_SUPER_SECRET_KEY_2026";
        $validSignature = base64_encode(hash_hmac('sha256', "$header.$payload", $secretKey, true));

        if (!hash_equals($validSignature, $signature)) {
            throw new Exception("Chữ ký Token không hợp lệ!");
        }

        $payloadData = json_decode(base64_decode($payload), true);
        if (!isset($payloadData['id']) || !isset($payloadData['exp'])) {
            throw new Exception("Dữ liệu Token không hợp lệ!");
        }

        if (time() > $payloadData['exp']) {
            throw new Exception("Token đã hết hạn!");
        }

        $user = $this->userRepository->findById((int)$payloadData['id']);
        if (!$user) {
            throw new Exception("Tài khoản không tồn tại!");
        }

        return $user;
    }
}