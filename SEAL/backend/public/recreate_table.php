<?php
require_once __DIR__ . '/../vendor/autoload.php';
$em = require __DIR__ . '/../cli-config.php';
$conn = $em->getConnection();

try {
    $conn->executeStatement("
        CREATE TABLE IF NOT EXISTS contest_registrations (
            id INT AUTO_INCREMENT NOT NULL,
            contest_id INT NOT NULL,
            team_id INT NOT NULL,
            status VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
            registered_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY(id),
            INDEX IDX_contest_id (contest_id),
            INDEX IDX_team_id (team_id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
    ");

    $count = $conn->executeQuery("SELECT COUNT(*) FROM contest_registrations")->fetchOne();
    if ($count == 0) {
        $conn->executeStatement("
            INSERT INTO contest_registrations (contest_id, team_id, status) VALUES 
            (9, 1, 'PENDING'),
            (9, 2, 'PENDING'),
            (9, 5, 'PENDING')
        ");
    }

    echo "Recreated contest_registrations table successfully.";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
