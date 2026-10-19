<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PanierResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $price = (float) $this->product->price;

        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'quantity' => $this->quantity,
            'subtotal' => round($price * $this->quantity, 2),
            'product' => new ProductResource($this->whenLoaded('product')),
        ];
    }
}
