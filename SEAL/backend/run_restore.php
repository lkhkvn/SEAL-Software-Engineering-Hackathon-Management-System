<?php
$dbHost = 'db';
$dbUser = 'clean_user';
$dbPass = 'user_secret_password';
$dbName = 'CleanDb';

$conn = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$schemaSql = file_get_contents('/var/www/html/contests_schema.sql');
$conn->exec($schemaSql);

$dataSql = file_get_contents('/var/www/html/contests_data.sql');
$conn->exec($dataSql);

echo "Restored original contests table and data successfully!\n";
