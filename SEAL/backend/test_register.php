<?php
require 'vendor/autoload.php';
require 'cli-config.php';
use App\DTO\RegisterRequestDTO;
use App\Services\AuthService;
use App\Infrastructure\Persistence\DoctrineUserRepository;

$userRepo = new DoctrineUserRepository($entityManager);
$authService = new AuthService($userRepo);
$dto = new RegisterRequestDTO(['username'=>'test1','email'=>'test1@test.com','password'=>'123456']);
try {
    $user = $authService->registerAccountWithRole($dto, 'JUDGE');
    echo 'OK: ' . $user->id;
} catch (\Exception $e) {
    echo 'Error: ' . $e->getMessage();
}
