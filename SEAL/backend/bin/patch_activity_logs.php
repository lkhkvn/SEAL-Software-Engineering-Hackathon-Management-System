<?php
// backend/bin/patch_activity_logs.php

require_once __DIR__ . '/../vendor/autoload.php';

try {
    echo "Starting database patch for admin_activity_logs...\n";
    $entityManager = require __DIR__ . '/../cli-config.php';
    $conn = $entityManager->getConnection();
    
    $sql = "CREATE TABLE IF NOT EXISTS admin_activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_id INT DEFAULT NULL,
        description TEXT NOT NULL,
        ip_address VARCHAR(45) DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_log_admin (admin_id),
        CONSTRAINT fk_log_admin FOREIGN KEY (admin_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;";
    
    $conn->executeStatement($sql);
    echo "SUCCESS: admin_activity_logs table created successfully!\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
