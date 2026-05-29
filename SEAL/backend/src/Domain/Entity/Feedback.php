<?php

namespace App\Domain\Entity;

class Feedback
{
    private ?int $id = null;
    private int $judgeId;
    private int $teamId;
    private string $comment;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getJudgeId(): int
    {
        return $this->judgeId;
    }

    public function setJudgeId(int $judgeId): void
    {
        $this->judgeId = $judgeId;
    }

    public function getTeamId(): int
    {
        return $this->teamId;
    }

    public function setTeamId(int $teamId): void
    {
        $this->teamId = $teamId;
    }

    public function getComment(): string
    {
        return $this->comment;
    }

    public function setComment(string $comment): void
    {
        $this->comment = $comment;
    }
}