<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * URL publique de l'image : URL absolue telle quelle, sinon fichier du disque "public".
     * L'URL est construite à partir de l'hôte de la requête courante (et non de APP_URL),
     * pour rester correcte quel que soit le port ou le nom d'hôte utilisé (localhost, 127.0.0.1, Docker…).
     */
    public function image_url_value(Request $request): ?string
    {
        $image = $this->resource->image;

        if (! $image) {
            return null;
        }

        return preg_match('#^https?://#i', $image)
            ? $image
            : $request->getSchemeAndHttpHost().'/storage/'.implode('/', array_map('rawurlencode', explode('/', ltrim($image, '/'))));
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'price' => (float) $this->price,
            'description' => $this->description,
            'stock' => $this->stock,
            'in_stock' => $this->stock > 0,
            'image' => $this->image,
            'image_url' => $this->image_url_value($request),
            'category_id' => $this->category_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'created_at' => $this->created_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
