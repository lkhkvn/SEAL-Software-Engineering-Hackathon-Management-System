<?php

namespace App\DTO;

class CreateTeamRequestDTO 
{
    public function __construct(
        public readonly string $teamName,
        public readonly string $category = 'General',
        public readonly ?int $leaderId = null
    ) {}
}
