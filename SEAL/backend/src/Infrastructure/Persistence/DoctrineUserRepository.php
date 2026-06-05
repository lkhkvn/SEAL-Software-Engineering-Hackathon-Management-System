<?php
namespace App\Infrastructure\Persistence;

use App\Domain\Entity\User as DomainUser;
use App\Domain\Repositories\UserRepositoryInterface; // Gọi ngược từ Domain về
use App\Infrastructure\Model\UserModel;
use App\Infrastructure\Mapper\UserMapper;

use Doctrine\ORM\EntityManagerInterface; 

class DoctrineUserRepository implements UserRepositoryInterface {
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em) {
        $this->em = $em;
    }

    public function findByEmail(string $email): ?DomainUser {
        $model = $this->em->getRepository(UserModel::class)->findOneBy(['email' => $email]);
        return $model ? UserMapper::toDomain($model) : null;
    }

    public function findById(int $id): ?DomainUser {
<<<<<<< HEAD
        $model = $this->em->find(UserModel::class, $id);
        return $model ? UserMapper::toDomain($model) : null;
    }

    /** @return DomainUser[] */
    public function findAll(): array {
        $models = $this->em->getRepository(UserModel::class)->findAll();
        return array_map(fn($m) => UserMapper::toDomain($m), $models);
=======
        $model = $this->em->getRepository(UserModel::class)->find($id);
        return $model ? UserMapper::toDomain($model) : null;
    }

    public function findAll(): array {
        $models = $this->em->getRepository(UserModel::class)->findAll();
        return array_map(fn($model) => UserMapper::toDomain($model), $models);
>>>>>>> 10582f6c9c91c90ce92ed6181f19f3daa9b8a646
    }

    public function save(DomainUser $user): void {
        $existingModel = $user->id ? $this->em->find(UserModel::class, $user->id) : null;
        $model = UserMapper::toInfrastructure($user, $existingModel);
        $this->em->persist($model);
        $this->em->flush();
    }
}