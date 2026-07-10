<?php
require_once __DIR__ . '/../vendor/autoload.php';
$em = require __DIR__ . '/../cli-config.php';
$conn = $em->getConnection();

try {
    $conn->executeStatement("ALTER TABLE mentor_tickets ADD response TEXT DEFAULT NULL");
    echo "<h3>Thành công: Đã thêm cột 'response' vào bảng 'mentor_tickets'!</h3>";
} catch (\Exception $e) {
    $msg = $e->getMessage();
    if (strpos($msg, 'Duplicate column name') !== false || strpos($msg, 'already exists') !== false) {
        echo "<h3>Thông báo: Cột 'response' đã tồn tại trong bảng 'mentor_tickets'.</h3>";
    } else {
        echo "<h3>Lỗi: " . $msg . "</h3>";
    }
}
