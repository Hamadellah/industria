<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $users = User::withCount('demandes')
            ->when($request->query('q'), function ($q, $term) {
                $term = '%'.addcslashes($term, '%_\\').'%';
                $q->where(fn ($w) => $w->where('name', 'like', $term)->orWhere('email', 'like', $term));
            })
            ->when($request->query('role'), fn ($q, $role) => $q->where('role', $role))
            ->latest()
            ->paginate($request->integer('per_page', 10));

        return UserResource::collection($users);
    }

    public function updateRole(UpdateUserRoleRequest $request, User $user): UserResource|JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'Vous ne pouvez pas modifier votre propre rôle.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user->role = $request->input('role'); // le rôle n'est pas assignable en masse
        $user->save();

        return new UserResource($user->loadCount('demandes'));
    }
}
