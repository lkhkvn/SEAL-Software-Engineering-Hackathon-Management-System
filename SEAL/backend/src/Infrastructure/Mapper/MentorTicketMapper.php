<?php
namespace App\Infrastructure\Mapper;

use App\Domain\Entity\MentorTicket as DomainTicket;
use App\Infrastructure\Model\MentorTicketModel;

class MentorTicketMapper
{
    public static function toDomain(MentorTicketModel $model): DomainTicket
    {
        return new DomainTicket(
            teamId: $model->teamId,
            topic: $model->topic,
            status: $model->status,
            mentorId: $model->mentorId,
            createdAt: $model->createdAt,
            response: $model->response,
            id: $model->id
        );
    }

    public static function toInfrastructure(DomainTicket $domain, ?MentorTicketModel $existingModel = null): MentorTicketModel
    {
        $model = $existingModel ?? new MentorTicketModel();
        $model->id = $domain->id;
        $model->teamId = $domain->teamId;
        $model->topic = $domain->topic;
        $model->status = $domain->status;
        $model->mentorId = $domain->mentorId;
        $model->response = $domain->response;
        if ($domain->createdAt) {
            $model->createdAt = $domain->createdAt;
        }
        return $model;
    }
}
