<?php
require_once __DIR__ . '/vendor/autoload.php';

use Doctrine\ORM\Tools\Console\EntityManagerProvider\SingleManagerProvider;
use Doctrine\ORM\Tools\Console\ConsoleRunner;

// Nạp EntityManager từ file cli-config.php chuẩn mà bạn đã sửa ở bước trước
$entityManager = require __DIR__ . '/cli-config.php';

// Cấu hình Provider theo chuẩn Doctrine 3.0
$cli = ConsoleRunner::createApplication(new SingleManagerProvider($entityManager));

// Kích hoạt giao diện dòng lệnh
$cli->run();
