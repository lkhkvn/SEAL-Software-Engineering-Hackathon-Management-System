<?php
namespace App\Domain\Repositories;

use App\Domain\Entity\MentorTicket;

interface MentorTicketRepositoryInterface
{
    public function save(MentorTicket $ticket): void;
    public function findById(int $id): ?MentorTicket;
    /** @return MentorTicket[] */
    public function findOpenTickets(): array;
    /** @return MentorTicket[] */
    public function findTicketsByTeam(int $teamId): array;
    /** @return MentorTicket[] */
    public function findTicketsByMentor(int $mentorId): array;
}
