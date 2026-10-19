<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** N'expose jamais le mot de passe ni le remember_token. */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'demandes_count' => $this->whenCounted('demandes'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
