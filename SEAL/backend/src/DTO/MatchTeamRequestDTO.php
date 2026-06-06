<?php

namespace App\DTO;

class MatchTeamRequestDTO 
{
    public function __construct(
        public readonly bool $isLookingForTeam
    ) {}
}
