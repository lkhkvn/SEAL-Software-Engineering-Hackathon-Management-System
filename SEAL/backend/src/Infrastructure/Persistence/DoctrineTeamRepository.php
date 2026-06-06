<?php
namespace App\Infrastructure\Persistence;

use App\Domain\Entity\Team as DomainTeam;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\DBAL\Connection;

class DoctrineTeamRepository {
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em) {
        $this->em = $em;
    }

    public function findByJoinCode(string $joinCode): ?array {
        $conn = $this->em->getConnection();
        return $conn->executeQuery("SELECT id, team_name, category FROM teams WHERE join_code = :joinCode", ['joinCode' => $joinCode])->fetchAssociative() ?: null;
    }

    public function findByName(string $name): ?array {
        $conn = $this->em->getConnection();
        return $conn->executeQuery("SELECT id FROM teams WHERE team_name = :name", ['name' => $name])->fetchAssociative() ?: null;
    }

    public function save(string $teamName, string $category, string $joinCode, int $leaderId): int {
        $conn = $this->em->getConnection();
        $conn->executeStatement("
            INSERT INTO teams (team_name, category, join_code, status, leader_id) 
            VALUES (:teamName, :category, :joinCode, 'APPROVED', :leaderId)
        ", [
            'teamName' => $teamName,
            'category' => $category,
            'joinCode' => $joinCode,
            'leaderId' => $leaderId
        ]);

        $teamId = (int)$conn->lastInsertId();

        $conn->executeStatement("
            INSERT INTO team_members (team_id, user_id, role_in_team)
            VALUES (:teamId, :userId, 'LEAD')
        ", [
            'teamId' => $teamId,
            'userId' => $leaderId
        ]);

        return $teamId;
    }
}
