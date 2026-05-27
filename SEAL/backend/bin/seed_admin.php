<?php
// backend/bin/seed_admin.php

require_once __DIR__ . '/../vendor/autoload.php';

use App\Domain\Entity\User;
use App\Infrastructure\Persistence\DoctrineUserRepository;

// Nạp cấu hình Doctrine
$entityManager = require __DIR__ . '/../cli-config.php';

$userRepository = new DoctrineUserRepository($entityManager);

$email = 'admin1@gmail.com';
$password = 'hack123';
$role = 'ADMIN';

// Kiểm tra xem admin đã tồn tại chưa
if ($userRepository->findByEmail($email)) {
    echo "Tài khoản ADMIN ($email) đã tồn tại.\n";
    exit(0);
}

// Khởi tạo thực thể User với vai trò ADMIN
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
$adminUser = new User(
    username: 'Admin Hệ Thống',
    email: $email,
    password: $hashedPassword,
    role: $role
);

$userRepository->save($adminUser);

echo "Tạo tài khoản ADMIN thành công!\n";
echo "Email: $email\n";
echo "Mật khẩu: $password\n";
