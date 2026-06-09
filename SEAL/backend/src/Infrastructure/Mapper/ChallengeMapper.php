<?php

namespace App\Infrastructure\Mapper;

use App\Domain\Entity\Challenge;
use App\Infrastructure\Model\ChallengeModel;

/**
 * Mapper: chuyển đổi hai chiều giữa Domain Entity và Infrastructure Model.
 * Đảm bảo tầng Domain không biết gì về Doctrine.
 */
class ChallengeMapper
{
    /**
     * Infrastructure Model → Domain Entity (khi đọc từ DB)
     */
    public static function toDomain(ChallengeModel $model): Challenge
    {
        return new Challenge(
            id:           $model->id,
            contestId:    $model->contestId,
            title:        $model->title,
            description:  $model->description,
            resources:    $model->resources,
            constraints:  $model->constraints,
            criteriaJson: $model->criteriaJson,
            releasedAt:   $model->releasedAt instanceof \DateTimeInterface
                              ? \DateTimeImmutable::createFromInterface($model->releasedAt)
                              : null,
            createdAt:    $model->createdAt instanceof \DateTimeInterface
                              ? \DateTimeImmutable::createFromInterface($model->createdAt)
                              : null,
            fileUrl:      $model->fileUrl,
            fileName:     $model->fileName,
        );
    }

    /**
     * Domain Entity → Infrastructure Model (khi ghi vào DB)
     */
    public static function toModel(Challenge $entity, ?ChallengeModel $model = null): ChallengeModel
    {
        $m = $model ?? new ChallengeModel();

        $m->contestId    = $entity->contestId;
        $m->title        = $entity->title;
        $m->description  = $entity->description;
        $m->resources    = $entity->resources;
        $m->constraints  = $entity->constraints;
        $m->criteriaJson = $entity->criteriaJson;
        $m->releasedAt   = $entity->releasedAt
                              ? \DateTime::createFromInterface($entity->releasedAt)
                              : null;
        $m->fileUrl      = $entity->fileUrl;
        $m->fileName     = $entity->fileName;

        if ($model === null) {
            // Chỉ đặt createdAt khi tạo mới
            $m->createdAt = new \DateTime();
        }

        return $m;
    }
}
