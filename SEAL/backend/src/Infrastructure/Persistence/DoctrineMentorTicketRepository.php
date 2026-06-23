<?php
namespace App\Infrastructure\Persistence;

use App\Domain\Entity\MentorTicket as DomainTicket;
use App\Domain\Repositories\MentorTicketRepositoryInterface;
use App\Infrastructure\Model\MentorTicketModel;
use App\Infrastructure\Mapper\MentorTicketMapper;
use Doctrine\ORM\EntityManagerInterface;

class DoctrineMentorTicketRepository implements MentorTicketRepositoryInterface
{
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em) {
        $this->em = $em;
    }

    public function save(DomainTicket $ticket): void
    {
        $existingModel = $ticket->id ? $this->em->find(MentorTicketModel::class, $ticket->id) : null;
        $model = MentorTicketMapper::toInfrastructure($ticket, $existingModel);
        $this->em->persist($model);
        $this->em->flush();
    }

    public function findById(int $id): ?DomainTicket
    {
        $model = $this->em->find(MentorTicketModel::class, $id);
        return $model ? MentorTicketMapper::toDomain($model) : null;
    }

    public function findOpenTickets(): array
    {
        $models = $this->em->getRepository(MentorTicketModel::class)->findBy(['status' => 'OPEN'], ['createdAt' => 'DESC']);
        return array_map(fn($m) => MentorTicketMapper::toDomain($m), $models);
    }

    public function findTicketsByTeam(int $teamId): array
    {
        $models = $this->em->getRepository(MentorTicketModel::class)->findBy(['teamId' => $teamId], ['createdAt' => 'DESC']);
        return array_map(fn($m) => MentorTicketMapper::toDomain($m), $models);
    }

    public function findTicketsByMentor(int $mentorId): array
    {
        $models = $this->em->getRepository(MentorTicketModel::class)->findBy(['mentorId' => $mentorId], ['createdAt' => 'DESC']);
        return array_map(fn($m) => MentorTicketMapper::toDomain($m), $models);
    }
}
