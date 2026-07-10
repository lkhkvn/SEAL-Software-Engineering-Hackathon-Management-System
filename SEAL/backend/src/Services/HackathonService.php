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
                   start_date, end_date, max_teams, status, prize, image, logo_url, schedule, prize_details, rules, organizer, registration_deadline, criteria, created_at,
                   (SELECT COUNT(*) FROM contest_registrations WHERE contest_id = contests.id) as registered_teams_count
            FROM contests
            ORDER BY created_at DESC
        ")->fetchAllAssociative();
    }

    public function getHackathonById(int $id): ?array {
        $conn = $this->em->getConnection();
        $contest = $conn->executeQuery("
            SELECT id, name, category, description, location,
                   start_date, end_date, max_teams, status, prize, image, logo_url, schedule, prize_details, rules, organizer, registration_deadline, criteria, created_at,
                   (SELECT COUNT(*) FROM contest_registrations WHERE contest_id = contests.id) as registered_teams_count
            FROM contests WHERE id = :id
        ", ['id' => $id])->fetchAssociative();

        return $contest ?: null;
    }

    public function registerTeamToHackathon(int $contestId, int $teamId, int $currentUserId): void {
        $conn = $this->em->getConnection();

        $conn->beginTransaction();
        try {
            // Kiểm tra user có phải trưởng nhóm không
            $team = $conn->executeQuery("SELECT leader_id FROM teams WHERE id = ?", [$teamId])->fetchAssociative();
            if (!$team) {
                throw new Exception("Đội thi không tồn tại!");
            }
            if ($team['leader_id'] !== $currentUserId) {
                throw new Exception("Chỉ đội trưởng mới có quyền đăng ký thi đấu!");
            }

            // Kiểm tra cuộc thi và KHÓA dòng cuộc thi để tránh tranh chấp đăng ký (Race Condition)
            $contest = $conn->executeQuery("
                SELECT max_teams, registration_deadline
                FROM contests WHERE id = ? FOR UPDATE
            ", [$contestId])->fetchAssociative();

            if (!$contest) {
                throw new Exception("Cuộc thi không tồn tại!");
            }

            // Đếm số lượng đội đã đăng ký
            $registeredCount = (int)$conn->executeQuery("
                SELECT COUNT(*) FROM contest_registrations WHERE contest_id = ?
            ", [$contestId])->fetchOne();

            if ($registeredCount >= $contest['max_teams']) {
                throw new Exception("Cuộc thi đã đủ số lượng đội đăng ký!");
            }

            // Kiểm tra thời gian đăng ký (realtime deadline check)
            if (!empty($contest['registration_deadline'])) {
                $deadline = new \DateTime($contest['registration_deadline']);
                $deadline->setTime(23, 59, 59); // Hết ngày deadline
                if (new \DateTime() > $deadline) {
                    throw new Exception("Đã hết hạn đăng ký cho cuộc thi này!");
                }
            }

            // Kiểm tra đã đăng ký chưa
            $exists = $conn->executeQuery("SELECT 1 FROM contest_registrations WHERE contest_id = ? AND team_id = ?", [$contestId, $teamId])->fetchOne();
            if ($exists) {
                throw new Exception("Đội của bạn đã đăng ký tham gia cuộc thi này rồi!");
            }

            $conn->executeStatement("INSERT INTO contest_registrations (contest_id, team_id) VALUES (?, ?)", [$contestId, $teamId]);
            $conn->commit();
        } catch (Exception $e) {
            $conn->rollBack();
            throw $e;
        }
    }

    public function createHackathon(array $data): int {
        $conn = $this->em->getConnection();
        $status = strtoupper(trim($data['status'] ?? 'UPCOMING'));
        if (!in_array($status, ['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'])) {
            $status = 'UPCOMING';
        }

        $conn->executeStatement("
            INSERT INTO contests (name, category, description, location, start_date, end_date,
                max_teams, status, prize, image, logo_url, schedule, prize_details, rules, organizer,
                registration_deadline, criteria, created_at)
            VALUES (:name, :category, :description, :location, :startDate, :endDate,
                :maxTeams, :status, :prize, :image, :logoUrl, :schedule, :prizeDetails, :rules, :organizer,
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
            'logoUrl'              => trim($data['logo_url']     ?? ''),
            'schedule'             => trim($data['schedule']     ?? ''),
            'prizeDetails'         => trim($data['prize_details'] ?? ''),
            'rules'                => trim($data['rules']        ?? ''),
            'organizer'            => trim($data['organizer']    ?? ''),
            'registrationDeadline' => trim($data['registration_deadline'] ?? '') ?: null,
            'criteria'             => trim($data['criteria']    ?? ''),
        ]);

        $newId = (int)$conn->lastInsertId();
        
        // Đồng bộ tiêu chí vào bảng criteria
        $this->syncCriteria($newId, trim($data['criteria'] ?? ''));

        return $newId;
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
                prize=:prize, image=:image, logo_url=:logoUrl, schedule=:schedule, prize_details=:prizeDetails,
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
            'logoUrl'              => trim($data['logo_url']     ?? ''),
            'schedule'             => trim($data['schedule']     ?? ''),
            'prizeDetails'         => trim($data['prize_details'] ?? ''),
            'rules'                => trim($data['rules']        ?? ''),
            'organizer'            => trim($data['organizer']    ?? ''),
            'registrationDeadline' => trim($data['registration_deadline'] ?? '') ?: null,
            'criteria'             => trim($data['criteria']    ?? ''),
            'id'                   => $id,
        ]);

        // Đồng bộ tiêu chí vào bảng criteria
        $this->syncCriteria($id, trim($data['criteria'] ?? ''));
    }

    private function syncCriteria(int $contestId, string $criteriaJson): void {
        $conn = $this->em->getConnection();
        $data = json_decode($criteriaJson, true);
        if (!$data || !isset($data['items']) || !is_array($data['items'])) return;
        
        $existing = $conn->executeQuery("SELECT id, name FROM criteria")->fetchAllAssociative();
        $existingMap = [];
        foreach ($existing as $row) {
            $existingMap[$row['name']] = $row['id'];
        }
        
        foreach ($data['items'] as $item) {
            $name = trim($item['name'] ?? '');
            $weight = (float)($item['weight'] ?? 0) / 100; // convert percentage to decimal
            if ($name === '' || $weight <= 0) continue;
            
            if (isset($existingMap[$name])) {
                $conn->executeStatement("UPDATE criteria SET weight = ?, max_score = ? WHERE id = ?", [$weight, 10, $existingMap[$name]]);
            } else {
                $conn->executeStatement("INSERT INTO criteria (name, weight, max_score) VALUES (?, ?, ?)", [$name, $weight, 10]);
            }
        }
    }

    public function deleteHackathon(int $id): string {
        $conn = $this->em->getConnection();
        $existing = $conn->executeQuery("SELECT id, name FROM contests WHERE id = :id", ['id' => $id])->fetchAssociative();
        if (!$existing) {
            throw new Exception("Cuộc thi không tồn tại!");
        }
        
        $conn->beginTransaction();
        try {
            // Xóa toàn bộ các bản ghi con liên quan để tránh rác dữ liệu (Bug 2)
            $conn->executeStatement("DELETE FROM milestones WHERE hackathon_id = :id", ['id' => $id]);
            $conn->executeStatement("DELETE FROM schedules WHERE hackathon_id = :id", ['id' => $id]);
            $conn->executeStatement("DELETE FROM submissions WHERE contest_id = :id", ['id' => $id]);
            $conn->executeStatement("DELETE FROM contest_registrations WHERE contest_id = :id", ['id' => $id]);
            $conn->executeStatement("DELETE FROM contest_problems WHERE contest_id = :id", ['id' => $id]);
            $conn->executeStatement("DELETE FROM contests WHERE id = :id", ['id' => $id]);
            $conn->commit();
        } catch (Exception $e) {
            $conn->rollBack();
            throw $e;
        }
        
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
            'challenge_released' => $challenge ? true : false,
            'notifications_sent' => true
        ];
    }

    public function getRegisteredTeams(int $contestId): array {
        $conn = $this->em->getConnection();
        $teams = $conn->executeQuery("
            SELECT t.id, t.team_name as name, t.category as description, t.leader_id, cr.registered_at, cr.status,
                   u.name as leader_name, u.email as leader_email,
                   (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) as member_count
            FROM teams t
            INNER JOIN contest_registrations cr ON cr.team_id = t.id
            LEFT JOIN users u ON u.id = t.leader_id
            WHERE cr.contest_id = :contestId
            ORDER BY cr.registered_at DESC
        ", ['contestId' => $contestId])->fetchAllAssociative();
        return $teams;
    }

    public function getSubmissions(int $contestId): array {
        $conn = $this->em->getConnection();
        $submissions = $conn->executeQuery("
            SELECT s.id, s.project_name, s.description, s.github_url, s.demo_video_url, s.file_url, s.submitted_at, s.project_avatar_url,
                   t.id as team_id, t.team_name, t.category, t.logo_url
            FROM submissions s
            INNER JOIN teams t ON s.team_id = t.id
            WHERE s.contest_id = :contestId
            ORDER BY s.submitted_at DESC
        ", ['contestId' => $contestId])->fetchAllAssociative();
        return $submissions;
    }

    public function getContestParticipants(int $contestId): array {
        $conn = $this->em->getConnection();
        $participants = $conn->executeQuery("
            SELECT DISTINCT u.id, u.name, u.avatar_url, u.skills, t.team_name as project
            FROM users u
            INNER JOIN teams t ON u.team_id = t.id
            LEFT JOIN contest_registrations cr ON cr.team_id = t.id AND cr.contest_id = :contestId
            LEFT JOIN submissions s ON s.team_id = t.id AND s.contest_id = :contestId
            WHERE cr.contest_id = :contestId OR s.contest_id = :contestId
            ORDER BY u.name ASC
        ", ['contestId' => $contestId])->fetchAllAssociative();

        return $participants;
    }

    public function removeTeam(int $contestId, int $teamId): void {
        $conn = $this->em->getConnection();
        
        $conn->beginTransaction();
        try {
            // Delete the team's submission for this contest if any
            $conn->executeStatement("DELETE FROM submissions WHERE contest_id = :contestId AND team_id = :teamId", [
                'contestId' => $contestId,
                'teamId' => $teamId
            ]);

            // Delete the registration
            $deleted = $conn->executeStatement("DELETE FROM contest_registrations WHERE contest_id = :contestId AND team_id = :teamId", [
                'contestId' => $contestId,
                'teamId' => $teamId
            ]);

            if ($deleted === 0) {
                throw new Exception("Đội thi chưa đăng ký hoặc không tồn tại trong cuộc thi này!");
            }

            $conn->commit();
        } catch (\Exception $e) {
            $conn->rollBack();
            throw $e;
        }
    }

    public function approveRegistration(int $contestId, int $teamId): void {
        $conn = $this->em->getConnection();
        $exists = $conn->executeQuery("SELECT 1 FROM contest_registrations WHERE contest_id = ? AND team_id = ?", [$contestId, $teamId])->fetchOne();
        if (!$exists) {
            throw new Exception("Đơn đăng ký không tồn tại!");
        }
        $conn->executeStatement("UPDATE contest_registrations SET status = 'APPROVED' WHERE contest_id = ? AND team_id = ?", [$contestId, $teamId]);
    }

    public function rejectRegistration(int $contestId, int $teamId): void {
        $conn = $this->em->getConnection();
        $exists = $conn->executeQuery("SELECT 1 FROM contest_registrations WHERE contest_id = ? AND team_id = ?", [$contestId, $teamId])->fetchOne();
        if (!$exists) {
            throw new Exception("Đơn đăng ký không tồn tại!");
        }
        $conn->executeStatement("UPDATE contest_registrations SET status = 'REJECTED' WHERE contest_id = ? AND team_id = ?", [$contestId, $teamId]);
    }

    public function syncContestStatuses(?NotificationService $notificationService = null): void {
        $conn = $this->em->getConnection();
        
        $todayStr = (new \DateTime())->format('Y-m-d H:i:s');
        
        // Optimize query to ONLY fetch contests that need status synchronization
        $contests = $conn->executeQuery("
            SELECT id, name, status, start_date, end_date 
            FROM contests 
            WHERE status != 'CANCELLED' 
              AND (
                  (status != 'UPCOMING' AND :today < start_date) OR
                  (status != 'ACTIVE' AND :today >= start_date AND :today <= end_date) OR
                  (status != 'COMPLETED' AND :today > end_date)
              )
        ", ['today' => $todayStr])->fetchAllAssociative();
        
        if (empty($contests)) {
            return;
        }
        
        foreach ($contests as $contest) {
            $contestId = (int)$contest['id'];
            $currentStatus = $contest['status'];
            $startDate = $contest['start_date'];
            $endDate = $contest['end_date'];
            
            $expectedStatus = $currentStatus;
            if ($todayStr < $startDate) {
                $expectedStatus = 'UPCOMING';
            } elseif ($todayStr >= $startDate && $todayStr <= $endDate) {
                $expectedStatus = 'ACTIVE';
            } else {
                $expectedStatus = 'COMPLETED';
            }
            
            if ($currentStatus !== $expectedStatus) {
                $conn->executeStatement("UPDATE contests SET status = ? WHERE id = ?", [$expectedStatus, $contestId]);
                
                // Nếu tự động kích hoạt cuộc thi thành ACTIVE, phát đề bài và thông báo
                if ($expectedStatus === 'ACTIVE') {
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

                    if ($notificationService) {
                        try {
                            $notificationService->notifyAllTeams($contestId, $contest['name'], $challengeTitle);
                        } catch (\Exception $e) {
                            // Bỏ qua lỗi thông báo để tránh block luồng chính
                        }
                    }
                }
            }
        }
    }
}
