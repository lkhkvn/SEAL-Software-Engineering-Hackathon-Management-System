<?php
require_once __DIR__ . '/vendor/autoload.php';
$entityManager = require __DIR__ . '/cli-config.php';

$conn = $entityManager->getConnection();

try {
    $conn->executeStatement("ALTER TABLE organizations ADD COLUMN cover_url VARCHAR(255) DEFAULT NULL;");
    echo "Added cover_url to organizations.\n";
} catch (Exception $e) { echo "orgs: " . $e->getMessage() . "\n"; }

try {
    $conn->executeStatement("ALTER TABLE blog_posts ADD COLUMN author_avatar_url VARCHAR(255) DEFAULT NULL;");
    echo "Added author_avatar_url to blog_posts.\n";
} catch (Exception $e) { echo "blogs: " . $e->getMessage() . "\n"; }

echo "Done.\n";
