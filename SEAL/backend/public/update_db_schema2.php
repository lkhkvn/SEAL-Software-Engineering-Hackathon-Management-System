<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Doctrine\ORM\Tools\SchemaTool;

$em = require __DIR__ . '/../cli-config.php';
$schemaTool = new SchemaTool($em);
$classes = $em->getMetadataFactory()->getAllMetadata();

try {
    $schemaTool->updateSchema($classes, true); // true = saveMode
    echo json_encode(["status" => "success", "message" => "Database schema updated successfully."]);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
