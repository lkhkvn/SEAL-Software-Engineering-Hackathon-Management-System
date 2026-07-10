<?php
require_once __DIR__ . '/vendor/autoload.php';
$entityManager = require __DIR__ . '/cli-config.php';

use Doctrine\ORM\Tools\SchemaTool;

try {
    $tool = new SchemaTool($entityManager);
    $classes = $entityManager->getMetadataFactory()->getAllMetadata();
    $tool->updateSchema($classes);
    echo "All database schemas updated successfully!\n";
} catch (\Exception $e) {
    echo "Error updating schema: " . $e->getMessage() . "\n";
}
