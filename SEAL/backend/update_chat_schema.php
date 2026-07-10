<?php
require_once __DIR__ . '/vendor/autoload.php';
$entityManager = require __DIR__ . '/cli-config.php';

use Doctrine\ORM\Tools\SchemaTool;

try {
    $tool = new SchemaTool($entityManager);
    $classes = [
        $entityManager->getClassMetadata(\App\Infrastructure\Model\ChatMessageModel::class)
    ];
    $tool->createSchema($classes);
    echo "Schema created successfully!\n";
} catch (\Exception $e) {
    echo "Error creating schema: " . $e->getMessage() . "\n";
}
