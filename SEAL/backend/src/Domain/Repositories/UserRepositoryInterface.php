<?php

namespace App\Domain\Repositories;

use App\Domain\Entity\User;

interface UserRepositoryInterface
{
    
    public function findByEmail(string $email): ?User;

    
    public function save(User $user): void;
}