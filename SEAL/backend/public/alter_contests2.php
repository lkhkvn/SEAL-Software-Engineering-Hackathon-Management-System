<?php
require_once __DIR__ . '/../vendor/autoload.php';
$em = require __DIR__ . '/../cli-config.php';
$conn = $em->getConnection();

try {
    // Add created_at if it's missing
    $conn->executeStatement("ALTER TABLE contests 
        ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
    ");
    echo "Thêm created_at thành công.\n";
} catch (\Exception $e) {
    echo "Lỗi add created_at: " . $e->getMessage() . "\n";
}
