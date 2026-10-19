<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Models\Favori;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FavoriController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $products = $request->user()
            ->favoriteProducts()
            ->with('category')
            ->orderByDesc('favoris.created_at')
            ->paginate(12);

        return ProductResource::collection($products);
    }

    /** Identifiants des produits favoris (pour afficher les cœurs sans N+1 côté client). */
    public function ids(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()->favoris()->pluck('product_id')->values(),
        ]);
    }

    public function store(Request $request, Product $product): JsonResponse
    {
        // firstOrCreate + index unique (user_id, product_id) : pas de doublon possible.
        $favori = Favori::firstOrCreate([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
        ]);

        return response()->json(
            ['message' => 'Produit ajouté aux favoris.', 'product_id' => $product->id],
            $favori->wasRecentlyCreated ? Response::HTTP_CREATED : Response::HTTP_OK
        );
    }

    public function destroy(Request $request, Product $product): Response
    {
        $request->user()->favoris()->where('product_id', $product->id)->delete();

        return response()->noContent();
    }
}
