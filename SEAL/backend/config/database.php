<?php
// backend/config/database.php

return [
    'host'      => 'mysql_clean_db', // Kết nối qua mạng nội bộ Docker thông qua tên Container
    'port'      => '3306',
    'database'  => 'CleanDb',
    'username'  => 'clean_user',
    'password'  => 'user_secret_password',
    'charset'   => 'utf8mb4',
    'options'   => [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]
];