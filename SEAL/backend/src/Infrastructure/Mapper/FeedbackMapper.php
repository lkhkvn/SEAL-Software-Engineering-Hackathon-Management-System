<?php

namespace App\Infrastructure\Mapper;

use App\Domain\Entity\Feedback as DomainFeedback;
use App\Infrastructure\Model\FeedbackModel;

class FeedbackMapper
{
    public static function toDomain(FeedbackModel $model): DomainFeedback
    {
        $domain = new DomainFeedback();
        $domain->setId($model->getId());
        $domain->setJudgeId($model->getJudgeId());
        $domain->setTeamId($model->getTeamId());
        $domain->setComment($model->getComment());
        
        return $domain;
    }

    public static function toModel(DomainFeedback $domain, FeedbackModel $model = new FeedbackModel()): FeedbackModel
    {
        $model->setJudgeId($domain->getJudgeId());
        $model->setTeamId($domain->getTeamId());
        $model->setComment($domain->getComment());
        
        return $model;
    }
}