<?php
require_once __DIR__ . '/vendor/autoload.php';
$em = require __DIR__ . '/cli-config.php';
$conn = $em->getConnection();

try {
    $conn->executeStatement("ALTER TABLE users ADD avatar_url VARCHAR(255) DEFAULT NULL, ADD date_of_birth VARCHAR(10) DEFAULT NULL");
    echo "Successfully added columns to users table.\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
