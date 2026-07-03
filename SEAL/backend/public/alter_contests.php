<?php
require_once __DIR__ . '/../vendor/autoload.php';
$em = require __DIR__ . '/../cli-config.php';
$conn = $em->getConnection();

try {
    // Thêm các cột bị thiếu vào bảng contests
    $conn->executeStatement("ALTER TABLE contests 
        ADD COLUMN prize VARCHAR(255) DEFAULT NULL,
        ADD COLUMN prize_details TEXT DEFAULT NULL,
        ADD COLUMN image VARCHAR(255) DEFAULT NULL,
        ADD COLUMN logo_url VARCHAR(255) DEFAULT NULL,
        ADD COLUMN schedule TEXT DEFAULT NULL,
        ADD COLUMN organizer VARCHAR(255) DEFAULT NULL,
        ADD COLUMN criteria TEXT DEFAULT NULL
    ");

    echo "Thêm các cột thành công.";
} catch (\Exception $e) {
    echo "Lỗi: " . $e->getMessage();
}
