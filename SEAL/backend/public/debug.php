<?php
require_once __DIR__ . '/../vendor/autoload.php';
$em = require __DIR__ . '/../cli-config.php';
$conn = $em->getConnection();
try {
    $result = $conn->executeQuery("DESCRIBE contests")->fetchAllAssociative();
    echo json_encode($result);
} catch (\Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
