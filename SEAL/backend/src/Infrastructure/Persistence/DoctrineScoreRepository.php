<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Repositories\ScoreRepositoryInterface;
use App\Domain\Entity\Score as DomainScore;
use App\Infrastructure\Model\ScoreModel;
use App\Infrastructure\Mapper\ScoreMapper;
use Doctrine\ORM\EntityManagerInterface;

class DoctrineScoreRepository implements ScoreRepositoryInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    public function findById(int $id): ?DomainScore
    {
        $scoreModel = $this->entityManager->find(ScoreModel::class, $id);
        if (!$scoreModel) {
            return null;
        }
        return ScoreMapper::toDomain($scoreModel);
    }

    public function save(DomainScore $score): void
    {
        $scoreModel = new ScoreModel();
        $scoreModel = ScoreMapper::toModel($score, $scoreModel);

        $this->entityManager->persist($scoreModel);
        $this->entityManager->flush();
    }

    public function findByTeamId(int $teamId): array
    {
        $repository = $this->entityManager->getRepository(ScoreModel::class);
        $scoreModels = $repository->findBy(['teamId' => $teamId]);

        return array_map([ScoreMapper::class, 'toDomain'], $scoreModels);
    }

    public function findAll(): array
    {
        $repository = $this->entityManager->getRepository(ScoreModel::class);
        $scoreModels = $repository->findAll();

        return array_map([ScoreMapper::class, 'toDomain'], $scoreModels);
    }
}