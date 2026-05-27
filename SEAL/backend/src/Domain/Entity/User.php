<?php

namespace App\Domain\Entity;

class User 
{
    public function __construct(
        // 1. Các tham số BẮT BUỘC (Client gửi lên qua Postman) xếp lên đầu
        public readonly string $username,
        public readonly string $email,
        public readonly string $password,

        // 2. Các tham số KHÔNG BẮT BUỘC (Có giá trị mặc định) xếp ra phía sau
        public readonly string $role = 'PARTICIPANT', // Mặc định là Thí sinh nếu không truyền
        public readonly ?string $phone = null,
        public readonly ?string $skills = null, // Dành cho thí sinh tự do
        public readonly ?int $teamId = null,    // Chỉ lưu ID của Team dưới dạng số nguyên thuần túy
        public readonly ?int $id = null         // ID tự tăng ban đầu sẽ là null
    ) {}

    public function isAdmin(): bool 
    { 
        return strtoupper($this->role) === 'ADMIN'; 
    }

    public function isParticipant(): bool 
    { 
        return strtoupper($this->role) === 'PARTICIPANT'; 
    }

    public function isJudge(): bool 
    { 
        return strtoupper($this->role) === 'JUDGE'; 
    }

    public function verifyPassword(string $password): bool 
    {
        return password_verify($password, $this->password);
    }

    public function withRole(string $role): User
    {
        return new User(
            username: $this->username,
            email: $this->email,
            password: $this->password,
            role: $role,
            phone: $this->phone,
            skills: $this->skills,
            teamId: $this->teamId,
            id: $this->id
        );
    }
}