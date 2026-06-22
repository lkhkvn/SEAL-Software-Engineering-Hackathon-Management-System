<?php
// ============================================================================
// CORS & ERROR CONFIGURATION
// ============================================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Content-Type: application/json; charset=UTF-8");

ini_set('html_errors', 0);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ============================================================================
// AUTOLOAD & BOOTSTRAP
// ============================================================================
use App\Services\AuthService;
use App\Services\TeamService;
use App\Services\HackathonService;
use App\Services\LeaderboardService;
use App\Services\MilestoneService;
use App\Services\ScheduleService;
use App\Services\ChallengeService;
use App\Infrastructure\Persistence\DoctrineTeamRepository;
use App\Infrastructure\Persistence\DoctrineUserRepository;
use App\Infrastructure\Persistence\DoctrineChallengeRepository;
use App\Presentation\AuthController;
use App\Presentation\AdminUserController;
use App\Presentation\TeamController;
use App\Presentation\HackathonController;
use App\Presentation\LeaderboardController;
use App\Presentation\MilestoneController;
use App\Presentation\ScheduleController;
use App\Presentation\UserController;
use App\Presentation\ChallengeController;
use App\Services\NotificationService;
use App\Services\FileUploadService;
use App\Presentation\NotificationController;
use App\Services\ScoreService;
use App\Presentation\ScoreController;
use App\Services\ActivityLogService;

try {
    if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
        require_once __DIR__ . '/../vendor/autoload.php';
    } else {
        throw new Exception("Không tìm thấy thư mục vendor. Hãy chạy lệnh 'composer install'.");
    }

    if (file_exists(__DIR__ . '/../cli-config.php')) {
        $entityManager = require __DIR__ . '/../cli-config.php';
    } else {
        throw new Exception("Không tìm thấy file cấu hình cli-config.php.");
    }

    if (!($entityManager instanceof \Doctrine\ORM\EntityManagerInterface)) {
        throw new Exception("cli-config.php chưa trả về EntityManager hợp lệ.");
    }

    // ============================================================================
    // DEPENDENCY INJECTION (Khởi tạo Services & Controllers)
    // ============================================================================
    $userRepository       = new DoctrineUserRepository($entityManager);
    $authService          = new AuthService($userRepository);
    $teamRepository       = new DoctrineTeamRepository($entityManager);
    $teamService          = new TeamService($teamRepository, $entityManager);
    $hackathonService     = new HackathonService($entityManager);
    $leaderboardService   = new LeaderboardService($entityManager);
    $milestoneService     = new MilestoneService($entityManager);
    $scheduleService      = new ScheduleService($entityManager);
    $challengeRepository  = new DoctrineChallengeRepository($entityManager);
    $challengeService     = new ChallengeService($challengeRepository, $entityManager);
    $notificationService  = new NotificationService($entityManager);
    $fileUploadService    = new FileUploadService();

    $activityLogService    = new ActivityLogService($entityManager);

    $authController        = new AuthController($authService, $activityLogService);
    $adminUserController   = new AdminUserController($authService, $userRepository, $activityLogService);
    $teamController        = new TeamController($teamService, $authService, $entityManager);
    $hackathonController   = new HackathonController($hackathonService, $authService, $notificationService, $activityLogService);
    $leaderboardController = new LeaderboardController($leaderboardService);
    $milestoneController   = new MilestoneController($milestoneService, $authService, $activityLogService);
    $scheduleController    = new ScheduleController($scheduleService, $authService, $activityLogService);
    $userController        = new UserController($authService, $entityManager);
    $challengeController   = new ChallengeController($challengeService, $authService, $fileUploadService, $activityLogService);
    $notificationController= new NotificationController($notificationService, $authService);
    
    $scoreService          = new ScoreService($entityManager);
    $scoreController       = new ScoreController($scoreService, $authService, $notificationService, $activityLogService);

    // ============================================================================
    // ROUTER
    // ============================================================================
    $path   = str_replace('/index.php', '', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
    $method = $_SERVER['REQUEST_METHOD'];

    // ------------------------------------------------------------------
    // AUTH ROUTES
    // ------------------------------------------------------------------
    if ($path === '/api/auth/register' && $method === 'POST') {
        $authController->register(); exit(0);
    }
    if ($path === '/api/auth/login' && $method === 'POST') {
        $authController->login(); exit(0);
    }
    if ($path === '/api/auth/logout' && $method === 'POST') {
        $authController->logout(); exit(0);
    }
    // ------------------------------------------------------------------
    // USER ROUTES
    // ------------------------------------------------------------------
    if ($path === '/api/users/me/team' && $method === 'GET') {
        $userController->getMyTeam(); exit(0);
    }
    if ($path === '/api/users/me/cv' && $method === 'GET') {
        $userController->getCV(); exit(0);
    }
    if ($path === '/api/users/me/cv' && $method === 'POST') {
        $userController->updateCV(); exit(0);
    }

    if ($path === '/api/auth/create-judge' && $method === 'POST') {
        $authController->createJudge(); exit(0);
    }

    // ------------------------------------------------------------------
    // ADMIN USER ROUTES
    // ------------------------------------------------------------------
    if ($path === '/api/admin/users' && $method === 'GET') {
        $adminUserController->getAllUsers(); exit(0);
    }
    if ($path === '/api/admin/users/update-role' && $method === 'POST') {
        $adminUserController->updateRole(); exit(0);
    }
    if ($path === '/api/admin/activity-logs' && $method === 'GET') {
        $adminUserController->getActivityLogs(); exit(0);
    }

    // ------------------------------------------------------------------
    // LEADERBOARD & TEAMS LIST
    // ------------------------------------------------------------------
    if ($path === '/api/leaderboard' && $method === 'GET') {
        $leaderboardController->getLeaderboard(); exit(0);
    }
    if ($path === '/api/teams' && $method === 'GET') {
        $leaderboardController->getTeamsList(); exit(0);
    }

    // ------------------------------------------------------------------
    // TEAM ROUTES
    // ------------------------------------------------------------------
    if ($path === '/api/teams' && $method === 'POST') {
        $teamController->createTeam(); exit(0);
    }
    if (preg_match('#^/api/teams/(\d+)$#', $path, $m) && $method === 'PUT') {
        $teamController->updateTeam((int)$m[1]); exit(0);
    }
    if ($path === '/api/teams/join' && $method === 'POST') {
        $teamController->joinTeam(); exit(0);
    }
    if ($path === '/api/teams/match' && $method === 'POST') {
        $teamController->matchTeam(); exit(0);
    }
    if (preg_match('#^/api/teams/(\d+)$#', $path, $m) && $method === 'GET') {
        $teamController->getTeamById((int)$m[1]); exit(0);
    }
    if ($path === '/api/teams/apply' && $method === 'POST') {
        $teamController->applyTeam(); exit(0);
    }
    if ($path === '/api/teams/my-team/requests' && $method === 'GET') {
        $teamController->getMyTeamRequests(); exit(0);
    }
    if ($path === '/api/teams/my-team/submit' && $method === 'POST') {
        $teamController->submitProject(); exit(0);
    }
    if (preg_match('#^/api/teams/requests/(\d+)/approve$#', $path, $m) && $method === 'POST') {
        $teamController->approveRequest((int)$m[1]); exit(0);
    }
    if (preg_match('#^/api/teams/requests/(\d+)/reject$#', $path, $m) && $method === 'POST') {
        $teamController->rejectRequest((int)$m[1]); exit(0);
    }
    if ($path === '/api/teams/my-team/contests' && $method === 'GET') {
        $teamController->getMyTeamContests(); exit(0);
    }
    if ($path === '/api/teams/my-team/submission' && $method === 'GET') {
        $contestId = isset($_GET['contestId']) ? (int)$_GET['contestId'] : 0;
        $teamController->getMySubmission($contestId); exit(0);
    }
    // SECURE FILE DOWNLOAD
    if (preg_match('#^/api/submissions/file/(\d+)/([^/]+)$#', $path, $m) && $method === 'GET') {
        $teamController->downloadSubmissionFile((int)$m[1], $m[2]); exit(0);
    }

    // ------------------------------------------------------------------
    // HACKATHON PUBLIC ROUTES
    // ------------------------------------------------------------------
    if ($path === '/api/hackathons' && $method === 'GET') {
        $hackathonController->getAllHackathons(); exit(0);
    }
    if (preg_match('#^/api/hackathons/(\d+)$#', $path, $m) && $method === 'GET') {
        $hackathonController->getHackathonById((int)$m[1]); exit(0);
    }
    if (preg_match('#^/api/hackathons/(\d+)/register$#', $path, $m) && $method === 'POST') {
        $hackathonController->registerTeam((int)$m[1]); exit(0);
    }
    if ($path === '/api/hackathons' && $method === 'POST') {
        $hackathonController->createHackathon(); exit(0);
    }
    if (preg_match('#^/api/hackathons/(\d+)$#', $path, $m) && $method === 'PUT') {
        $hackathonController->updateHackathon((int)$m[1]); exit(0);
    }
    if (preg_match('#^/api/hackathons/(\d+)$#', $path, $m) && $method === 'DELETE') {
        $hackathonController->deleteHackathon((int)$m[1]); exit(0);
    }

    // ------------------------------------------------------------------
    // HACKATHON ADMIN ROUTES
    // ------------------------------------------------------------------
    if ($path === '/api/admin/hackathons' && $method === 'POST') {
        $hackathonController->createHackathon(); exit(0);
    }
    if (preg_match('#^/api/admin/hackathons/(\d+)/start$#', $path, $m) && $method === 'POST') {
        $hackathonController->startContest((int)$m[1]); exit(0);
    }
    if (preg_match('#^/api/admin/hackathons/(\d+)$#', $path, $m) && $method === 'PUT') {
        $hackathonController->updateHackathon((int)$m[1]); exit(0);
    }
    if (preg_match('#^/api/admin/hackathons/(\d+)$#', $path, $m) && $method === 'DELETE') {
        $hackathonController->deleteHackathon((int)$m[1]); exit(0);
    }
    if (preg_match('#^/api/admin/hackathons/(\d+)/teams$#', $path, $m) && $method === 'GET') {
        $hackathonController->getRegisteredTeams((int)$m[1]); exit(0);
    }
    if (preg_match('#^/api/admin/hackathons/(\d+)/teams/(\d+)$#', $path, $m) && $method === 'DELETE') {
        $hackathonController->removeTeam((int)$m[1], (int)$m[2]); exit(0);
    }
    if (preg_match('#^/api/admin/hackathons/(\d+)/teams/(\d+)/approve$#', $path, $m) && $method === 'POST') {
        $hackathonController->approveRegistration((int)$m[1], (int)$m[2]); exit(0);
    }
    if (preg_match('#^/api/admin/hackathons/(\d+)/teams/(\d+)/reject$#', $path, $m) && $method === 'POST') {
        $hackathonController->rejectRegistration((int)$m[1], (int)$m[2]); exit(0);
    }

    // ------------------------------------------------------------------
    // MILESTONE ROUTES
    // ------------------------------------------------------------------
    if (preg_match('#^/api/hackathons/(\d+)/milestones$#', $path, $m) && $method === 'GET') {
        $milestoneController->getByHackathon((int)$m[1]); exit(0);
    }
    if (preg_match('#^/api/hackathons/(\d+)/milestones$#', $path, $m) && $method === 'POST') {
        $milestoneController->create((int)$m[1]); exit(0);
    }
    if (preg_match('#^/api/milestones/(\d+)$#', $path, $m) && $method === 'PUT') {
        $milestoneController->update((int)$m[1]); exit(0);
    }
    if (preg_match('#^/api/milestones/(\d+)$#', $path, $m) && $method === 'DELETE') {
        $milestoneController->delete((int)$m[1]); exit(0);
    }

    // ------------------------------------------------------------------
    // SCHEDULE ROUTES
    // ------------------------------------------------------------------
    if ($path === '/api/schedules' && $method === 'GET') {
        $scheduleController->getAll(); exit(0);
    }
    if ($path === '/api/schedules' && $method === 'POST') {
        $scheduleController->create(); exit(0);
    }
    if (preg_match('#^/api/schedules/(\d+)$#', $path, $m) && $method === 'PUT') {
        $scheduleController->update((int)$m[1]); exit(0);
    }
    if (preg_match('#^/api/schedules/(\d+)$#', $path, $m) && $method === 'DELETE') {
        $scheduleController->delete((int)$m[1]); exit(0);
    }

    // ------------------------------------------------------------------
    // CHALLENGE (ĐỀ BÀI) ROUTES
    // ------------------------------------------------------------------
    // Public: Thí sinh lấy đề bài (kiểm tra thời gian start_date)
    if (preg_match('#^/api/hackathons/(\d+)/challenge$#', $path, $m) && $method === 'GET') {
        $challengeController->getForParticipant((int)$m[1]); exit(0);
    }
    // Admin: Xem đề bài đầy đủ
    if (preg_match('#^/api/admin/hackathons/(\d+)/challenge$#', $path, $m) && $method === 'GET') {
        $challengeController->getForAdmin((int)$m[1]); exit(0);
    }
    // Admin: Tạo / cập nhật đề bài
    if (preg_match('#^/api/admin/hackathons/(\d+)/challenge$#', $path, $m) && $method === 'POST') {
        $challengeController->upsert((int)$m[1]); exit(0);
    }
    // Admin: Phát đề thủ công ngay lập tức
    if (preg_match('#^/api/admin/hackathons/(\d+)/challenge/release$#', $path, $m) && $method === 'POST') {
        $challengeController->release((int)$m[1]); exit(0);
    }

    // Admin: Upload file đề bài
    if (preg_match('#^/api/admin/hackathons/(\d+)/challenge/upload$#', $path, $m) && $method === 'POST') {
        $challengeController->uploadFile((int)$m[1]); exit(0);
    }

    // ------------------------------------------------------------------
    // NOTIFICATION ROUTES
    // ------------------------------------------------------------------
    if ($path === '/api/notifications' && $method === 'GET') {
        $notificationController->list(); exit(0);
    }
    if (preg_match('#^/api/notifications/(\d+)/read$#', $path, $m) && $method === 'POST') {
        $notificationController->markRead((int)$m[1]); exit(0);
    }
    if ($path === '/api/notifications/read-all' && $method === 'POST') {
        $notificationController->markAllRead(); exit(0);
    }

    // ------------------------------------------------------------------
    // SCORE & JUDGING ROUTES
    // ------------------------------------------------------------------
    if ($path === '/api/judging/teams' && $method === 'GET') {
        $scoreController->getTeamsForJudging(); exit(0);
    }
    if ($path === '/api/scores' && $method === 'POST') {
        $scoreController->submitScores(); exit(0);
    }
    if ($path === '/api/admin/criteria' && $method === 'GET') {
        $scoreController->getAllCriteria(); exit(0);
    }
    if ($path === '/api/admin/criteria' && $method === 'POST') {
        $scoreController->createCriteria(); exit(0);
    }
    if (preg_match('#^/api/admin/criteria/(\d+)$#', $path, $m) && $method === 'DELETE') {
        $scoreController->deleteCriteria((int)$m[1]); exit(0);
    }
    if ($path === '/api/admin/assignments' && $method === 'GET') {
        $scoreController->getAssignments(); exit(0);
    }
    if ($path === '/api/admin/assignments/toggle' && $method === 'POST') {
        $scoreController->toggleAssignment(); exit(0);
    }

    // ------------------------------------------------------------------
    // 404 - NOT FOUND
    // ------------------------------------------------------------------
    http_response_code(404);
    echo json_encode([
        "status"  => "error",
        "message" => "Endpoint API không tồn tại trên hệ thống!"
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Lỗi Backend: " . $e->getMessage(),
        "file"    => $e->getFile(),
        "line"    => $e->getLine()
    ], JSON_UNESCAPED_UNICODE);
    exit(1);
}