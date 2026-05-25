<?php

namespace App\Domain\Entity;

class Configuration 
{
    public function __construct(
        public readonly ?int $id,
        public readonly string $configKey, // Ví dụ: 'OPEN_TIME', 'CLOSE_TIME'
        public readonly string $configValue
    ) {}
}