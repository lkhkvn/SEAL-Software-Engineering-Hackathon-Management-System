<?php
namespace App\Domain\Entity;

class MentorTicket
{
    public function __construct(
        public readonly int $teamId,
        public readonly string $topic,
        public readonly string $status = 'OPEN',
        public readonly ?int $mentorId = null,
        public readonly ?\DateTimeImmutable $createdAt = null,
        public readonly ?int $id = null
    ) {
    }

    public function withStatus(string $newStatus): self
    {
        return new self($this->teamId, $this->topic, $newStatus, $this->mentorId, $this->createdAt, $this->id);
    }

    public function withMentor(int $mentorId): self
    {
        return new self($this->teamId, $this->topic, 'ASSIGNED', $mentorId, $this->createdAt, $this->id);
    }
}
