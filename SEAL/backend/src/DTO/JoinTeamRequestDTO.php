<?php

namespace App\DTO;

class JoinTeamRequestDTO 
{
    public function __construct(
        public readonly string $joinCode
    ) {}
}
