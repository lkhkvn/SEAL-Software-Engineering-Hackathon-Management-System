<?php
require_once __DIR__ . '/vendor/autoload.php';

use Doctrine\DBAL\DriverManager;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\ORMSetup;

$config = ORMSetup::createAttributeMetadataConfiguration(
    paths: [__DIR__ . '/src/Infrastructure/Model'], 
    isDevMode: true
);

$connectionParams = [
    'dbname'   => 'CleanDb',
    'user'     => 'clean_user',
    'password' => 'user_secret_password',
    'host'     => 'db', 
    'port'     => 3306, 
    'driver'   => 'pdo_mysql',
    'charset'  => 'utf8mb4',
];

$connection = DriverManager::getConnection($connectionParams, $config);

// Reset table and insert again with correct encoding
$connection->executeStatement("SET FOREIGN_KEY_CHECKS = 0;");
$connection->executeStatement("TRUNCATE TABLE criteria");
$connection->executeStatement("SET FOREIGN_KEY_CHECKS = 1;");

$connection->executeStatement(
    "INSERT INTO criteria (name, weight, max_score) VALUES (?, ?, ?)",
    ['Tính sáng tạo & thực tế', 0.5, 10]
);

$connection->executeStatement(
    "INSERT INTO criteria (name, weight, max_score) VALUES (?, ?, ?)",
    ['Hoàn thiện kỹ thuật & UI/UX', 0.3, 10]
);

$connection->executeStatement(
    "INSERT INTO criteria (name, weight, max_score) VALUES (?, ?, ?)",
    ['Kỹ năng thuyết trình chung kết', 0.2, 10]
);

echo "Updated criteria charset properly.";
