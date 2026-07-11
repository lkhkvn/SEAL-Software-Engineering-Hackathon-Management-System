<?php

namespace App\Services;

use Doctrine\ORM\EntityManagerInterface;
use Pusher\Pusher;
use Exception;

/**
 * Service: NotificationService
 * Tạo in-app notification cho user và broadcast real-time qua Pusher.
 */
class NotificationService
{
    private EntityManagerInterface $em;
    private ?Pusher $pusher = null;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
        $this->initPusher();
    }

    private function initPusher(): void
    {
        try {
            $this->pusher = new Pusher(
                '826f5659b34e42b3583a',  // key
                '8d32ee23b7cddf9e2889',  // secret
                '2164688',               // app_id
                [
                    'cluster' => 'ap1',
                    'useTLS'  => true,
                ]
            );
        } catch (\Throwable $e) {
            // Pusher init thất bại → chỉ dùng DB fallback
            $this->pusher = null;
        }
    }

    /**
     * Gửi thông báo "đề bài đã phát" đến tất cả thành viên
     * của các đội đã đăng ký cuộc thi.
     */
    public function notifyAllTeams(int $contestId, string $contestName, ?string $challengeTitle = null): void
    {
        $conn = $this->em->getConnection();

        // Lấy tất cả user thuộc đội đã đăng ký contest
        $users = $conn->executeQuery("
            SELECT DISTINCT tm.user_id, u.name AS user_name
            FROM contest_registrations cr
            JOIN team_members tm ON tm.team_id = cr.team_id
            JOIN users u ON u.id = tm.user_id
            WHERE cr.contest_id = :contestId
        ", ['contestId' => $contestId])->fetchAllAssociative();

        if (empty($users)) return;

        $title   = "🚀 Cuộc thi \"{$contestName}\" đã bắt đầu!";
        $message = $challengeTitle
            ? "Đề bài \"{$challengeTitle}\" đã được phát chính thức. Hãy vào trang cuộc thi để xem ngay!"
            : "Đề bài đã được phát chính thức. Hãy vào trang cuộc thi để xem ngay!";

        // Batch INSERT notifications
        foreach ($users as $user) {
            $conn->executeStatement("
                INSERT INTO notifications (user_id, contest_id, type, title, message, is_read, created_at)
                VALUES (:userId, :contestId, 'CHALLENGE_RELEASED', :title, :message, 0, NOW())
            ", [
                'userId'    => $user['user_id'],
                'contestId' => $contestId,
                'title'     => $title,
                'message'   => $message,
            ]);
        }

        // Broadcast qua Pusher (real-time)
        $this->broadcastChallengeReleased($contestId, [
            'contest_id'   => $contestId,
            'contest_name' => $contestName,
            'title'        => $title,
            'message'      => $message,
        ]);
    }

    /**
     * Pusher broadcast event "challenge-released" trên channel "contest-{id}"
     */
    private function broadcastChallengeReleased(int $contestId, array $payload): void
    {
        if (!$this->pusher) return;
        try {
            // Đổi kênh từ "contest-{id}" thành "global-notifications" để trùng khớp với Frontend
            $this->pusher->trigger("global-notifications", 'challenge-released', $payload);
        } catch (\Throwable $e) {
            // Pusher thất bại → không crash app, chỉ log
            error_log('[Pusher Error] ' . $e->getMessage());
        }
    }

    /**
     * Gửi thông báo "Dự án đã được chấm điểm" đến các thành viên trong đội
     */
    public function notifyTeamScored(int $teamId, int $judgeId): void
    {
        $conn = $this->em->getConnection();

        // Lấy tất cả user thuộc đội (bao gồm cả trưởng nhóm và thành viên)
        $users = $conn->executeQuery("
            SELECT DISTINCT user_id
            FROM team_members
            WHERE team_id = :teamId
            UNION
            SELECT leader_id as user_id
            FROM teams
            WHERE id = :teamId
        ", ['teamId' => $teamId])->fetchAllAssociative();

        if (empty($users)) return;

        // Lấy tên đội
        $team = $conn->executeQuery("SELECT team_name, category FROM teams WHERE id = :teamId", ['teamId' => $teamId])->fetchAssociative();
        $teamName = $team['team_name'] ?? 'Đội của bạn';

        $title = "✅ Dự án đã được chấm điểm!";
        $message = "Dự án của đội {$teamName} vừa được Giám khảo hoàn tất việc chấm điểm. Bạn có thể kiểm tra lại trên Bảng xếp hạng!";

        foreach ($users as $user) {
            if (!$user['user_id']) continue;
            $conn->executeStatement("
                INSERT INTO notifications (user_id, contest_id, type, title, message, is_read, created_at)
                VALUES (:userId, NULL, 'PROJECT_SCORED', :title, :message, 0, NOW())
            ", [
                'userId'  => $user['user_id'],
                'title'   => $title,
                'message' => $message,
            ]);
        }

        // Broadcast qua Pusher (real-time)
        if ($this->pusher) {
            try {
                // Broadcast lên global-notifications (để đơn giản)
                $this->pusher->trigger('global-notifications', 'project-scored', [
                    'team_id' => $teamId,
                    'title'   => $title,
                    'message' => $message,
                ]);
            } catch (\Throwable $e) {
                error_log('[Pusher Error] ' . $e->getMessage());
            }
        }
    }

    /**
     * Tự động kiểm tra và tạo thông báo nếu có Milestone sắp đến hạn (trong vòng 24h) (Đề xuất 2)
     */
    public function checkAndNotifyApproachingMilestones(int $userId): void
    {
        $conn = $this->em->getConnection();

        // 1. Lấy team_id của user
        $teamId = $conn->executeQuery("SELECT team_id FROM users WHERE id = :userId", ['userId' => $userId])->fetchOne();
        if (!$teamId) {
            return;
        }

        // 2. Lấy danh sách cuộc thi mà đội này đã đăng ký tham gia
        $contests = $conn->executeQuery("
            SELECT contest_id 
            FROM contest_registrations 
            WHERE team_id = :teamId AND status = 'APPROVED'
        ", ['teamId' => $teamId])->fetchAllAssociative();

        if (empty($contests)) {
            return;
        }

        $contestIds = array_map(function($c) { return (int)$c['contest_id']; }, $contests);
        $contestIdsStr = implode(',', $contestIds);

        // 3. Tìm các milestone của những cuộc thi này sắp đến hạn trong vòng 24 giờ tiếp theo
        $milestones = $conn->executeQuery("
            SELECT m.id, m.name, m.due_date, m.hackathon_id, c.name AS contest_name
            FROM milestones m
            INNER JOIN contests c ON c.id = m.hackathon_id
            WHERE m.hackathon_id IN ($contestIdsStr)
              AND m.due_date IS NOT NULL
              AND m.due_date > NOW()
              AND m.due_date <= DATE_ADD(NOW(), INTERVAL 24 HOUR)
        ")->fetchAllAssociative();

        foreach ($milestones as $m) {
            $title = "⏰ Sắp đến hạn chót Milestone: {$m['name']}";
            $message = "Mốc thời gian \"{$m['name']}\" của cuộc thi \"{$m['contest_name']}\" sẽ đến hạn chót vào lúc " . date('H:i d/m/Y', strtotime($m['due_date'])) . ". Hãy hoàn thành và nộp bài đúng hạn!";

            // 4. Kiểm tra xem đã gửi thông báo loại này cho user về mốc này chưa
            $pattern = "%mốc thời gian \"{$m['name']}\"%";
            $exists = $conn->executeQuery("
                SELECT 1 FROM notifications 
                WHERE user_id = :userId 
                  AND type = 'MILESTONE_DEADLINE_APPROACHING' 
                  AND message LIKE :pattern
            ", [
                'userId' => $userId,
                'pattern' => $pattern
            ])->fetchOne();

            if (!$exists) {
                // 5. Thêm thông báo vào DB
                $conn->executeStatement("
                    INSERT INTO notifications (user_id, contest_id, type, title, message, is_read, created_at)
                    VALUES (:userId, :contestId, 'MILESTONE_DEADLINE_APPROACHING', :title, :message, 0, NOW())
                ", [
                    'userId' => $userId,
                    'contestId' => $m['hackathon_id'],
                    'title' => $title,
                    'message' => $message
                ]);

                // 6. Broadcast qua Pusher
                if ($this->pusher) {
                    try {
                        $this->pusher->trigger('global-notifications', 'milestone-approaching', [
                            'user_id' => $userId,
                            'contest_id' => $m['hackathon_id'],
                            'title' => $title,
                            'message' => $message
                        ]);
                    } catch (\Throwable $ex) {
                        error_log('[Pusher Error] ' . $ex->getMessage());
                    }
                }
            }
        }
    }

    /**
     * Lấy danh sách thông báo của 1 user (mới nhất trước).
     */
    public function getUserNotifications(int $userId, int $limit = 20): array
    {
        $this->checkAndNotifyApproachingMilestones($userId);

        $conn = $this->em->getConnection();
        return $conn->executeQuery("
            SELECT n.id, n.contest_id, n.type, n.title, n.message, n.is_read,
                   n.created_at, c.name AS contest_name
            FROM notifications n
            LEFT JOIN contests c ON c.id = n.contest_id
            WHERE n.user_id = :userId
            ORDER BY n.created_at DESC
            LIMIT " . (int)$limit . "
        ", ['userId' => $userId])->fetchAllAssociative();
    }

    /**
     * Đếm số thông báo chưa đọc.
     */
    public function countUnread(int $userId): int
    {
        $conn = $this->em->getConnection();
        return (int) $conn->executeQuery(
            "SELECT COUNT(*) FROM notifications WHERE user_id = :userId AND is_read = 0",
            ['userId' => $userId]
        )->fetchOne();
    }

    /**
     * Đánh dấu thông báo đã đọc (chỉ của đúng user).
     */
    public function markAsRead(int $notifId, int $userId): void
    {
        $conn = $this->em->getConnection();
        $conn->executeStatement(
            "UPDATE notifications SET is_read = 1 WHERE id = :id AND user_id = :userId",
            ['id' => $notifId, 'userId' => $userId]
        );
    }

    /**
     * Đánh dấu tất cả thông báo của user là đã đọc.
     */
    public function markAllAsRead(int $userId): void
    {
        $conn = $this->em->getConnection();
        $conn->executeStatement(
            "UPDATE notifications SET is_read = 1 WHERE user_id = :userId AND is_read = 0",
            ['userId' => $userId]
        );
    }
}
