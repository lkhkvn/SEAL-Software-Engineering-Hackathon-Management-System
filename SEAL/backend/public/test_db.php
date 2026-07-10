<?php
require_once __DIR__ . '/../vendor/autoload.php';
$em = require __DIR__ . '/../cli-config.php';
$conn = $em->getConnection();

$result = $conn->executeQuery("SELECT * FROM contest_registrations WHERE contest_id = 9")->fetchAllAssociative();
echo json_encode($result);
