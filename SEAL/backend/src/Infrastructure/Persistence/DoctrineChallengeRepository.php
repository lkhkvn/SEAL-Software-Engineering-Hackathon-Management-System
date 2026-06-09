<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Entity\Challenge;
use App\Domain\Repositories\ChallengeRepositoryInterface;
use App\Infrastructure\Mapper\ChallengeMapper;
use App\Infrastructure\Model\ChallengeModel;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Concrete Repository — Tầng Infrastructure implement contract của Domain.
 * Sử dụng Doctrine ORM để thao tác với DB.
 */
class DoctrineChallengeRepository implements ChallengeRepositoryInterface
{
    public function __construct(
        private readonly EntityManagerInterface $em
    ) {}

    public function findByContestId(int $contestId): ?Challenge
    {
        $repo  = $this->em->getRepository(ChallengeModel::class);
        $model = $repo->findOneBy(['contestId' => $contestId]);

        return $model ? ChallengeMapper::toDomain($model) : null;
    }

    public function save(Challenge $challenge): int
    {
        $model = ChallengeMapper::toModel($challenge);
        $this->em->persist($model);
        $this->em->flush();

        return $model->id;
    }

    public function update(Challenge $challenge): void
    {
        $repo  = $this->em->getRepository(ChallengeModel::class);
        $model = $repo->find($challenge->id);

        if (!$model) {
            throw new \RuntimeException("Đề bài không tồn tại trong database!");
        }

        // Cập nhật model từ domain entity (dùng mapper)
        ChallengeMapper::toModel($challenge, $model);
        $this->em->flush();
    }
}
