<?php
$dbHost = 'db';
$dbUser = 'clean_user';
$dbPass = 'user_secret_password';
$dbName = 'CleanDb';

$conn = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $conn->exec("ALTER TABLE contests ADD COLUMN logo_url VARCHAR(255) DEFAULT NULL;");
} catch(Exception $e) {}

try {
    $conn->exec("ALTER TABLE contests ADD COLUMN cover_url VARCHAR(255) DEFAULT NULL;");
} catch(Exception $e) {}

try {
    $conn->exec("ALTER TABLE contests ADD COLUMN is_online TINYINT(1) DEFAULT 0;");
} catch(Exception $e) {}

try {
    $conn->exec("ALTER TABLE contests ADD COLUMN max_team_size INT DEFAULT 5;");
} catch(Exception $e) {}

try {
    $conn->exec("ALTER TABLE contests ADD COLUMN prize_pool VARCHAR(255) DEFAULT NULL;");
} catch(Exception $e) {}

echo "Added missing columns to contests table.\n";
