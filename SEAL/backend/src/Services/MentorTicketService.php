<?php
namespace App\Services;

use App\Domain\Entity\MentorTicket;
use App\Domain\Repositories\MentorTicketRepositoryInterface;

class MentorTicketService
{
    private MentorTicketRepositoryInterface $repository;

    public function __construct(MentorTicketRepositoryInterface $repository) {
        $this->repository = $repository;
    }

    public function createTicket(int $teamId, string $topic): void
    {
        $ticket = new MentorTicket($teamId, $topic);
        $this->repository->save($ticket);
    }

    public function getOpenTickets(): array
    {
        return $this->repository->findOpenTickets();
    }

    public function getTicketsByTeam(int $teamId): array
    {
        return $this->repository->findTicketsByTeam($teamId);
    }

    public function getTicketsByMentor(int $mentorId): array
    {
        return $this->repository->findTicketsByMentor($mentorId);
    }

    public function assignMentor(int $ticketId, int $mentorId): void
    {
        $ticket = $this->repository->findById($ticketId);
        if (!$ticket) {
            throw new \Exception("Yêu cầu không tồn tại");
        }
        if ($ticket->status !== 'OPEN') {
            throw new \Exception("Yêu cầu đã được nhận hoặc đã hoàn tất");
        }
        $updatedTicket = $ticket->withMentor($mentorId);
        $this->repository->save($updatedTicket);
    }

    public function resolveTicket(int $ticketId, int $mentorId, ?string $response = null): void
    {
        $ticket = $this->repository->findById($ticketId);
        if (!$ticket) {
            throw new \Exception("Yêu cầu không tồn tại");
        }
        if ($ticket->mentorId !== $mentorId) {
            throw new \Exception("Bạn không phải người được giao xử lý yêu cầu này");
        }
        $updatedTicket = $ticket->withStatus('RESOLVED');
        if ($response !== null) {
            $updatedTicket = $updatedTicket->withResponse($response);
        }
        $this->repository->save($updatedTicket);
    }
}
