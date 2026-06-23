<?php
namespace App\Presentation;

use App\Services\MentorTicketService;
use App\Services\AuthService;

class MentorController
{
    private MentorTicketService $mentorService;
    private AuthService $authService;

    public function __construct(MentorTicketService $mentorService, AuthService $authService) {
        $this->mentorService = $mentorService;
        $this->authService = $authService;
    }

    private function getAuthToken(): string {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Yêu cầu phải có Token xác thực!'], 401);
        }

        return $matches[1];
    }

    private function requireCurrentUser() {
        $token = $this->getAuthToken();
        try {
            return $this->authService->verifyToken($token);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Token không hợp lệ hoặc đã hết hạn'], 401);
        }
    }

    private function jsonResponse(array $data, int $status = 200): void {
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    // [POST] /api/mentor/tickets
    public function createTicket(): void {
        $user = $this->requireCurrentUser();
        if (!$user->teamId) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Bạn chưa có đội'], 403);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['topic'])) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Thiếu topic'], 400);
        }

        try {
            $this->mentorService->createTicket($user->teamId, $input['topic']);
            $this->jsonResponse(['status' => 'success', 'message' => 'Tạo yêu cầu thành công']);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }

    // [GET] /api/mentor/tickets/team
    public function getTeamTickets(): void {
        $user = $this->requireCurrentUser();
        if (!$user->teamId) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Bạn chưa có đội'], 403);
        }

        $tickets = $this->mentorService->getTicketsByTeam($user->teamId);
        $this->jsonResponse(['status' => 'success', 'data' => $tickets]);
    }

    // [GET] /api/mentor/tickets/open
    public function getOpenTickets(): void {
        $user = $this->requireCurrentUser();
        if (!$user->isMentor() && !$user->isAdmin()) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Không có quyền truy cập'], 403);
        }

        $tickets = $this->mentorService->getOpenTickets();
        $this->jsonResponse(['status' => 'success', 'data' => $tickets]);
    }

    // [GET] /api/mentor/tickets/my
    public function getMyAssignedTickets(): void {
        $user = $this->requireCurrentUser();
        if (!$user->isMentor() && !$user->isAdmin()) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Không có quyền truy cập'], 403);
        }

        $tickets = $this->mentorService->getTicketsByMentor($user->id);
        $this->jsonResponse(['status' => 'success', 'data' => $tickets]);
    }

    // [POST] /api/mentor/tickets/{id}/assign
    public function assignTicket(int $id): void {
        $user = $this->requireCurrentUser();
        if (!$user->isMentor() && !$user->isAdmin()) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Không có quyền truy cập'], 403);
        }

        try {
            $this->mentorService->assignMentor($id, $user->id);
            $this->jsonResponse(['status' => 'success', 'message' => 'Nhận hỗ trợ thành công']);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }

    // [POST] /api/mentor/tickets/{id}/resolve
    public function resolveTicket(int $id): void {
        $user = $this->requireCurrentUser();
        if (!$user->isMentor() && !$user->isAdmin()) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Không có quyền truy cập'], 403);
        }

        try {
            $this->mentorService->resolveTicket($id, $user->id);
            $this->jsonResponse(['status' => 'success', 'message' => 'Đã giải quyết yêu cầu']);
        } catch (\Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }
}
