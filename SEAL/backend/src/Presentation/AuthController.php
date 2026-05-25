<?php

namespace App\Presentation\Controllers;

use App\Services\AuthService;
use App\DTO\RegisterRequestDTO;
use App\DTO\LoginRequestDTO;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route; // Khai báo thư viện Route để code chạy
use Exception;

class AuthController
{
    private AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Endpoint Đăng ký tài khoản
     * Địa chỉ: POST http://localhost:8000/api/auth/register
     */
    #[Route('/api/auth/register', name: 'api_auth_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true) ?? [];
            $dto = new RegisterRequestDTO($data);

            $user = $this->authService->register($dto);

            return new JsonResponse([
                'status' => 'success',
                'message' => 'Đăng ký tài khoản thành công!',
                'data' => [
                    'name' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role
                ]
            ], 201);
        } catch (Exception $e) {
            return new JsonResponse([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Endpoint Đăng nhập
     * Địa chỉ: POST http://localhost:8000/api/auth/login
     */
    #[Route('/api/auth/login', name: 'api_auth_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true) ?? [];
            $dto = new LoginRequestDTO($data);

            $result = $this->authService->login($dto);

            return new JsonResponse([
                'status' => 'success',
                'message' => 'Đăng nhập thành công!',
                'token' => $result['token'],
                'user' => $result['user']
            ], 200);
        } catch (Exception $e) {
            return new JsonResponse([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 401);
        }
    }
}