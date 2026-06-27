<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Services\AuthService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    use ApiResponseTrait;

    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $this->authService->registerUser($request->validated());
        return $this->successResponse($data, 'Registrasi berhasil', 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $data = $this->authService->loginUser($request->validated());
        return $this->successResponse($data, 'Login berhasil');
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return $this->successResponse(null, 'Logout berhasil');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->successResponse($request->user(), 'Data profil berhasil diambil');
    }
}