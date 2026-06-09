<?php
namespace App\Services;

use Doctrine\ORM\EntityManagerInterface;
use Exception;


class HackathonService {
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em) {
        $this->em = $em;
    }

    public function getAllHackathons(): array {
        $conn = $this->em->getConnection();
        return $conn->executeQuery("
            SELECT id, name, category, description, location,
                   start_date, end_date, max_teams, status, prize, image, schedule, prize_details, rules, organizer, registration_deadline, criteria, created_at,
                   (SELECT COUNT(*) FROM contest_registrations WHERE contest_id = contests.id) as registered_teams_count
            FROM contests
            ORDER BY created_at DESC
        ")->fetchAllAssociative();
    }

    public function getHackathonById(int $id): ?array {
        $conn = $this->em->getConnection();
        $contest = $conn->executeQuery("
            SELECT id, name, category, description, location,
                   start_date, end_date, max_teams, status, prize, image, schedule, prize_details, rules, organizer, registration_deadline, criteria, created_at,
                   (SELECT COUNT(*) FROM contest_registrations WHERE contest_id = contests.id) as registered_teams_count
            FROM contests WHERE id = :id
        ", ['id' => $id])->fetchAssociative();

        return $contest ?: null;
    }

    public function registerTeamToHackathon(int $contestId, int $teamId, int $currentUserId): void {
        $conn = $this->em->getConnection();

        // Kiểm tra user có phải trưởng nhóm không
        $team = $conn->executeQuery("SELECT leader_id FROM teams WHERE id = ?", [$teamId])->fetchAssociative();
        if (!$team) {
            throw new Exception("Đội thi không tồn tại!");
        }
        if ($team['leader_id'] !== $currentUserId) {
            throw new Exception("Chỉ đội trưởng mới có quyền đăng ký thi đấu!");
        }

        // Kiểm tra cuộc thi
        $contest = $conn->executeQuery("
            SELECT max_teams, 
            (SELECT COUNT(*) FROM contest_registrations WHERE contest_id = contests.id) as registered_count 
            FROM contests WHERE id = ?
        ", [$contestId])->fetchAssociative();

        if (!$contest) {
            throw new Exception("Cuộc thi không tồn tại!");
        }

        if ($contest['registered_count'] >= $contest['max_teams']) {
            throw new Exception("Cuộc thi đã đủ số lượng đội đăng ký!");
        }

        // Kiểm tra đã đăng ký chưa
        $exists = $conn->executeQuery("SELECT 1 FROM contest_registrations WHERE contest_id = ? AND team_id = ?", [$contestId, $teamId])->fetchOne();
        if ($exists) {
            throw new Exception("Đội của bạn đã đăng ký tham gia cuộc thi này rồi!");
        }

        $conn->executeStatement("INSERT INTO contest_registrations (contest_id, team_id) VALUES (?, ?)", [$contestId, $teamId]);
    }

    public function createHackathon(array $data): int {
        $conn = $this->em->getConnection();
        $status = strtoupper(trim($data['status'] ?? 'UPCOMING'));
        if (!in_array($status, ['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'])) {
            $status = 'UPCOMING';
        }

        $conn->executeStatement("
            INSERT INTO contests (name, category, description, location, start_date, end_date,
                max_teams, status, prize, image, schedule, prize_details, rules, organizer,
                registration_deadline, criteria, created_at)
            VALUES (:name, :category, :description, :location, :startDate, :endDate,
                :maxTeams, :status, :prize, :image, :schedule, :prizeDetails, :rules, :organizer,
                :registrationDeadline, :criteria, NOW())
        ", [
            'name'                 => trim($data['name']        ?? ''),
            'category'             => trim($data['category']    ?? ''),
            'description'          => trim($data['description'] ?? ''),
            'location'             => trim($data['location']    ?? ''),
            'startDate'            => trim($data['start_date']  ?? ''),
            'endDate'              => trim($data['end_date']    ?? ''),
            'maxTeams'             => (int)($data['max_teams']  ?? 50),
            'status'               => $status,
            'prize'                => trim($data['prize']        ?? ''),
            'image'                => trim($data['image']        ?? ''),
            'schedule'             => trim($data['schedule']     ?? ''),
            'prizeDetails'         => trim($data['prize_details'] ?? ''),
            'rules'                => trim($data['rules']        ?? ''),
            'organizer'            => trim($data['organizer']    ?? ''),
            'registrationDeadline' => trim($data['registration_deadline'] ?? '') ?: null,
            'criteria'             => trim($data['criteria']    ?? ''),
        ]);

        return (int)$conn->lastInsertId();
    }

    public function updateHackathon(int $id, array $data): void {
        $conn = $this->em->getConnection();
        $existing = $conn->executeQuery("SELECT id FROM contests WHERE id = :id", ['id' => $id])->fetchAssociative();
        if (!$existing) {
            throw new Exception("Cuộc thi không tồn tại!");
        }

        $status = strtoupper(trim($data['status'] ?? 'UPCOMING'));
        if (!in_array($status, ['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'])) {
            $status = 'UPCOMING';
        }

        $conn->executeStatement("
            UPDATE contests
            SET name=:name, category=:category, description=:description, location=:location,
                start_date=:startDate, end_date=:endDate, max_teams=:maxTeams, status=:status,
                prize=:prize, image=:image, schedule=:schedule, prize_details=:prizeDetails,
                rules=:rules, organizer=:organizer, registration_deadline=:registrationDeadline,
                criteria=:criteria
            WHERE id=:id
        ", [
            'name'                 => trim($data['name']        ?? ''),
            'category'             => trim($data['category']    ?? ''),
            'description'          => trim($data['description'] ?? ''),
            'location'             => trim($data['location']    ?? ''),
            'startDate'            => trim($data['start_date']  ?? ''),
            'endDate'              => trim($data['end_date']    ?? ''),
            'maxTeams'             => (int)($data['max_teams']  ?? 50),
            'status'               => $status,
            'prize'                => trim($data['prize']        ?? ''),
            'image'                => trim($data['image']        ?? ''),
            'schedule'             => trim($data['schedule']     ?? ''),
            'prizeDetails'         => trim($data['prize_details'] ?? ''),
            'rules'                => trim($data['rules']        ?? ''),
            'organizer'            => trim($data['organizer']    ?? ''),
            'registrationDeadline' => trim($data['registration_deadline'] ?? '') ?: null,
            'criteria'             => trim($data['criteria']    ?? ''),
            'id'                   => $id,
        ]);
    }

    public function deleteHackathon(int $id): string {
        $conn = $this->em->getConnection();
        $existing = $conn->executeQuery("SELECT id, name FROM contests WHERE id = :id", ['id' => $id])->fetchAssociative();
        if (!$existing) {
            throw new Exception("Cuộc thi không tồn tại!");
        }
        $conn->executeStatement("DELETE FROM contests WHERE id = :id", ['id' => $id]);
        return $existing['name'];
    }

    /**
     * Bắt đầu cuộc thi: chuyển status → ACTIVE, release đề bài, gửi thông báo.
     */
    public function startContest(int $contestId, NotificationService $notificationService): array
    {
        $conn = $this->em->getConnection();

        $contest = $conn->executeQuery(
            "SELECT id, name, status FROM contests WHERE id = :id",
            ['id' => $contestId]
        )->fetchAssociative();

        if (!$contest) {
            throw new Exception("Cuộc thi không tồn tại!");
        }

        if ($contest['status'] === 'COMPLETED' || $contest['status'] === 'CANCELLED') {
            throw new Exception("Không thể bắt đầu cuộc thi đã kết thúc hoặc đã huỷ!");
        }

        // 1. Cập nhật trạng thái → ACTIVE
        $conn->executeStatement(
            "UPDATE contests SET status = 'ACTIVE' WHERE id = :id",
            ['id' => $contestId]
        );

        // 2. Release đề bài (nếu chưa release)
        $challenge = $conn->executeQuery(
            "SELECT id, title, released_at FROM contest_problems WHERE contest_id = :contestId",
            ['contestId' => $contestId]
        )->fetchAssociative();

        $challengeTitle = null;
        if ($challenge) {
            $challengeTitle = $challenge['title'];
            if (!$challenge['released_at']) {
                $conn->executeStatement(
                    "UPDATE contest_problems SET released_at = NOW() WHERE contest_id = :contestId",
                    ['contestId' => $contestId]
                );
            }
        }

        // 3. Gửi thông báo đến tất cả thành viên đội đã đăng ký
        $notificationService->notifyAllTeams($contestId, $contest['name'], $challengeTitle);

        return [
            'contest_id'   => $contestId,
            'contest_name' => $contest['name'],
            'has_challenge' => $challenge !== false,
        ];
    }
}

