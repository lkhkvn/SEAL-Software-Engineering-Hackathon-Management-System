<?php
require_once __DIR__ . '/../vendor/autoload.php';
$em = require __DIR__ . '/../cli-config.php';
$conn = $em->getConnection();

try {
    $conn->executeStatement("ALTER TABLE contests ADD logo_url VARCHAR(255) DEFAULT NULL");
    echo "Successfully added logo_url to contests table.\n";
} catch (\Exception $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "Column logo_url already exists.\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
