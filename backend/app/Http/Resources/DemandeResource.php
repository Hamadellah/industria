<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DemandeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'status' => $this->status,
            'address' => $this->address,
            'quantity' => $this->quantity,
            'unit_price' => (float) $this->unit_price,
            'total' => (float) $this->total,
            'product_id' => $this->product_id,
            'product' => new ProductResource($this->whenLoaded('product')),
            // Les informations utilisateur ne sont chargées que dans les vues administrateur.
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
