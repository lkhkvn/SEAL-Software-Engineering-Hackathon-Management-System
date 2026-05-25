<?php

namespace App\Infrastructure\Mapper;

use App\Domain\Entity\User as DomainUser;
use App\Infrastructure\Model\UserModel as InfraUserModel;

class UserMapper
{
    /**
     * Chuyển từ Database Model (Doctrine) thành Thực thể Domain sạch
     */
    public static function toDomain(InfraUserModel $model): DomainUser
    {
        return new DomainUser(
            id: $model->id,
            username: $model->name,
            email: $model->email,
            password: $model->password,
            role: $model->role,
            phone: $model->phone,
            skills: $model->skills,
            teamId: $model->teamId
        );
    }

    /**
     * Chuyển từ Thực thể Domain thành Database Model để chuẩn bị lưu xuống DB
     */
    public static function toInfrastructure(DomainUser $domain, ?InfraUserModel $existingModel = null): InfraUserModel
    {
        $model = $existingModel ?? new InfraUserModel();
        
        if ($domain->id !== null) {
            $model->id = $domain->id;
        }
        $model->name = $domain->username;
        $model->email = $domain->email;
        $model->password = $domain->password;
        $model->role = $domain->role;
        $model->phone = $domain->phone;
        $model->skills = $domain->skills;
        $model->teamId = $domain->teamId;

        return $model;
    }
}