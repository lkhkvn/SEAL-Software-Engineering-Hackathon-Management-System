<?php
// backend/cli-config.php
require_once __DIR__ . '/vendor/autoload.php';

use Doctrine\DBAL\DriverManager;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\ORMSetup;

$config = ORMSetup::createAttributeMetadataConfiguration(
    paths: [__DIR__ . '/src/Infrastructure/Model'], 
    isDevMode: true
);

$connectionParams = [
    'dbname'   => 'CleanDb',
    'user'     => 'root',
    'password' => 'root_secret_password',
    'host'     => 'db', 
    'port'     => 3306, 
    'driver'   => 'pdo_mysql',
];

$connection = DriverManager::getConnection($connectionParams, $config);
$entityManager = new EntityManager($connection, $config);

return $entityManager;
