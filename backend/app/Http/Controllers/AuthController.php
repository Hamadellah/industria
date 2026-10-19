<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/**
 * Authentification SPA via Laravel Sanctum (cookie de session + CSRF).
 * Aucun jeton n'est renvoyé au navigateur, donc rien à stocker dans localStorage.
 */
class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->safe()->only(['name', 'email', 'phone', 'password']));
        $user->refresh(); // récupère le rôle par défaut ("client") défini en base

        Auth::guard('web')->login($user);
        $this->regenerateSession($request);

        return (new UserResource($user))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function login(LoginRequest $request): UserResource
    {
        if (! Auth::guard('web')->attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Ces identifiants ne correspondent à aucun compte.'],
            ]);
        }

        $this->regenerateSession($request);

        return new UserResource(Auth::guard('web')->user());
    }

    public function logout(Request $request): Response
    {
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->noContent();
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function updateProfile(UpdateProfileRequest $request): UserResource
    {
        $user = $request->user();
        $data = $request->safe()->only(['name', 'email', 'phone']);

        if ($request->filled('password')) {
            $data['password'] = $request->input('password');
        }

        $user->update($data);

        return new UserResource($user->refresh());
    }

    private function regenerateSession(Request $request): void
    {
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }
    }
}
