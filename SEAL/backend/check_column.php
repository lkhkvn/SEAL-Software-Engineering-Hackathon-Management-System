<?php
require_once __DIR__ . '/vendor/autoload.php';
$entityManager = require __DIR__ . '/cli-config.php';

$conn = $entityManager->getConnection();

try {
    $result = $conn->executeQuery("SHOW COLUMNS FROM organizations LIKE 'cover_url'")->fetchAllAssociative();
    print_r($result);
} catch (Exception $e) { echo "error: " . $e->getMessage() . "\n"; }
