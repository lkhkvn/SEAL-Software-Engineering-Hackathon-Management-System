<?php

namespace App\Infrastructure\Model;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'configurations')]
#[ORM\Index(name: 'idx_config_key', columns: ['config_key'])]
class ConfigurationModel
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(type: 'integer')]
    public ?int $id = null;

    // Doctrine khuyên dùng snake_case dưới DB (config_key) thay vì camelCase
    #[ORM\Column(name: 'config_key', type: 'string', length: 50, unique: true)]
    public string $configKey;

    #[ORM\Column(name: 'config_value', type: 'string', length: 100)]
    public string $configValue;
}