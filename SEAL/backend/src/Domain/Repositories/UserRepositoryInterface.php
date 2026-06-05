<?php

namespace App\Domain\Repositories;

use App\Domain\Entity\User;

interface UserRepositoryInterface
{
    public function findByEmail(string $email): ?User;
<<<<<<< HEAD

    public function findById(int $id): ?User;

    /** @return User[] */
=======
    
    public function findById(int $id): ?User;

>>>>>>> 10582f6c9c91c90ce92ed6181f19f3daa9b8a646
    public function findAll(): array;

    public function save(User $user): void;
}