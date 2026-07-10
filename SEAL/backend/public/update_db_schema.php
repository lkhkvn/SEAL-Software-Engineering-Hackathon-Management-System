<?php
require_once __DIR__ . '/../vendor/autoload.php';
$em = require __DIR__ . '/../cli-config.php';
$conn = $em->getConnection();

try {
    $conn->executeStatement("ALTER TABLE submissions ADD project_avatar_url VARCHAR(255) DEFAULT NULL");
    echo "Added project_avatar_url to submissions.\n";
} catch (\Exception $e) {
    echo "Submissions error/exists: " . $e->getMessage() . "\n";
}

try {
    $conn->executeStatement("ALTER TABLE teams ADD logo_url VARCHAR(255) DEFAULT NULL");
    echo "Added logo_url to teams.\n";
} catch (\Exception $e) {
    echo "Teams error/exists: " . $e->getMessage() . "\n";
}
