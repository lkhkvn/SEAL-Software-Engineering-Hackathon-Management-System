<?php

namespace App\Infrastructure\Mapper;

use App\Domain\Entity\Score as DomainScore;
use App\Infrastructure\Model\ScoreModel;

class ScoreMapper
{
    /**
     * Chuyển đổi từ Model Database (Doctrine) sang Entity Nghiệp vụ (Domain)
     */
    public static function toDomain(ScoreModel $model): DomainScore
    {
        $domain = new DomainScore();
        
        // Map các thuộc tính tương ứng
        $domain->setId($model->getId());
        $domain->setValue($model->getValue());
        $domain->setJudgeId($model->getJudgeId());
        $domain->setTeamId($model->getTeamId());
        $domain->setCriteriaId($model->getCriteriaId());
        
        return $domain;
    }

    /**
     * Chuyển đổi ngược từ Entity Nghiệp vụ (Domain) sang Model Database (Doctrine) để chuẩn bị lưu
     */
    public static function toModel(DomainScore $domain, ScoreModel $model = new ScoreModel()): ScoreModel
    {
        // Không map ID vì ID do database tự tăng (GeneratedValue)
        $model->setValue($domain->getValue());
        $model->setJudgeId($domain->getJudgeId());
        $model->setTeamId($domain->getTeamId());
        $model->setCriteriaId($domain->getCriteriaId());
        
        return $model;
    }
}