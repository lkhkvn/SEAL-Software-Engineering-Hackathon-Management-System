<?php

namespace App\Infrastructure\Model;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'criteria')]
class CriteriaModel
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(type: 'integer')]
    public ?int $id = null;

    #[ORM\Column(type: 'string', length: 100)]
    public string $name;

    // Sử dụng kiểu string cho decimal trong PHP thuộc tính để tránh lỗi làm tròn số thực
    #[ORM\Column(type: 'decimal', precision: 3, scale: 2)]
    public string $weight; 

    #[ORM\Column(name: 'max_score', type: 'integer', options: ['default' => 10])]
    public int $maxScore = 10;
}