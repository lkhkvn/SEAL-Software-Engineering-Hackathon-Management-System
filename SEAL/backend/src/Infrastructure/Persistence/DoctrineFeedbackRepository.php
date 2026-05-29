<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Repositories\FeedbackRepositoryInterface;
use App\Domain\Entity\Feedback as DomainFeedback;
use App\Infrastructure\Model\FeedbackModel;
use App\Infrastructure\Mapper\FeedbackMapper;
use Doctrine\ORM\EntityManagerInterface;

class DoctrineFeedbackRepository implements FeedbackRepositoryInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    /**
     * Lưu nhận xét của Giám khảo xuống MySQL thông qua Doctrine
     */
    public function save(DomainFeedback $feedback): void
    {
        $feedbackModel = new FeedbackModel();
        $feedbackModel = FeedbackMapper::toModel($feedback, $feedbackModel);

        $this->entityManager->persist($feedbackModel);
        $this->entityManager->flush();
    }

    /**
     * Lấy danh sách nhận xét theo mã đội thi
     * @return DomainFeedback[]
     */
    public function findByTeamId(int $teamId): array
    {
        $repository = $this->entityManager->getRepository(FeedbackModel::class);
        $feedbackModels = $repository->findBy(['teamId' => $teamId]);

        return array_map([FeedbackMapper::class, 'toDomain'], $feedbackModels);
    }
}