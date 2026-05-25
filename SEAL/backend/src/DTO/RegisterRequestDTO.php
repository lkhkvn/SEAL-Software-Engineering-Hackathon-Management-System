<?php

namespace App\DTO;

class RegisterRequestDTO
{
    public string $username;
    public string $email;
    public string $password;

    public function __construct(array $data)
    {
        // Nhận dữ liệu tối giản: tên đăng nhập, email và mật khẩu
        $this->username = $data['username'] ?? $data['name'] ?? ''; // Hỗ trợ switch từ 'name' sang 'username' nếu cần
        $this->email    = $data['email'] ?? '';
        $this->password = $data['password'] ?? '';
    }
}