<?php
namespace App\Services;

use App\DTO\CreateTeamRequestDTO;
use App\DTO\JoinTeamRequestDTO;
use App\Infrastructure\Persistence\DoctrineTeamRepository;
use App\Domain\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Exception;

class TeamService {
    private DoctrineTeamRepository $teamRepo;
    private EntityManagerInterface $em;

    public function __construct(DoctrineTeamRepository $teamRepo, EntityManagerInterface $em) {
        $this->teamRepo = $teamRepo;
        $this->em = $em;
    }

    public function createTeam(CreateTeamRequestDTO $dto, User $currentUser): array {
        if (empty($dto->teamName)) {
            throw new Exception("Tên đội thi không được để trống!");
        }

        if ($this->teamRepo->findByName($dto->teamName)) {
            throw new Exception("Tên đội thi này đã tồn tại!");
        }

        $prefix = strtoupper(substr(str_replace(' ', '', $dto->teamName), 0, 2));
        if (empty($prefix) || strlen($prefix) < 2) {
            $prefix = 'TM';
        }
        $joinCode = $prefix . rand(100, 999);

        $teamId = $this->teamRepo->save($dto->teamName, $dto->category, $joinCode, $currentUser->id);

        $this->em->getConnection()->executeStatement("
            UPDATE users SET team_id = :teamId WHERE id = :userId
        ", [
            'teamId' => $teamId,
            'userId' => $currentUser->id
        ]);

        return [
            "teamId" => $teamId,
            "teamName" => $dto->teamName,
            "joinCode" => $joinCode
        ];
    }

    public function joinTeam(JoinTeamRequestDTO $dto, User $currentUser): array {
        if (empty($dto->joinCode)) {
            throw new Exception("Vui lòng nhập mã tham gia!");
        }

        $team = $this->teamRepo->findByJoinCode($dto->joinCode);
        if (!$team) {
            throw new Exception("Mã tham gia không chính xác hoặc đội thi không tồn tại!");
        }

        $this->em->getConnection()->executeStatement("
            UPDATE users SET team_id = :teamId WHERE id = :userId
        ", [
            'teamId' => $team['id'],
            'userId' => $currentUser->id
        ]);

        return [
            "teamId" => $team['id'],
            "teamName" => $team['team_name']
        ];
    }

    public function toggleLookingForTeam(User $currentUser, bool $status): void {
        $this->em->getConnection()->executeStatement("
            UPDATE users SET is_looking_for_team = :status WHERE id = :userId
        ", [
            'status' => $status ? 1 : 0,
            'userId' => $currentUser->id
        ]);
    }

    public function autoMatch(User $currentUser): ?array {
        $conn = $this->em->getConnection();
        
        // Find teams with less than max members
        $teamsQuery = "
            SELECT t.id, t.team_name as name, t.category,
                   (SELECT COUNT(*) FROM users m WHERE m.team_id = t.id) as members,
                   (SELECT GROUP_CONCAT(m.skills SEPARATOR ', ') FROM users m WHERE m.team_id = t.id) as team_skills
            FROM teams t
            HAVING members < 5
        ";
        
        $teams = $conn->executeQuery($teamsQuery)->fetchAllAssociative();
        
        // Very basic matching based on skills or just random for now
        if (empty($teams)) {
            return null;
        }
        
        // Return a suggested team (e.g. the first one lacking members)
        return [
            "teamId" => $teams[0]['id'],
            "teamName" => $teams[0]['name']
        ];
    }
}
