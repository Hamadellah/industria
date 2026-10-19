<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Http\Requests\UpdateStockRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'category_id' => ['nullable', 'integer'],
            'sort' => ['nullable', 'in:newest,price_asc,price_desc,popular'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        return ProductResource::collection(
            Product::with('category')
                ->filter($filters)
                ->sortBy($filters['sort'] ?? null)
                ->paginate($filters['per_page'] ?? 10)
                ->withQueryString()
        );
    }

    public function store(ProductRequest $request): Response
    {
        $data = $request->safe()->only(['name', 'price', 'description', 'category_id', 'stock']);
        $data['user_id'] = $request->user()->id;

        if ($request->hasFile('image')) {
            $data['image'] = $this->storeImage($request);
        }

        $product = Product::create($data);

        return (new ProductResource($product->load('category')))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Product $product): ProductResource
    {
        return new ProductResource($product->load('category'));
    }

    public function update(ProductRequest $request, Product $product): ProductResource
    {
        $data = $request->safe()->only(['name', 'price', 'description', 'category_id', 'stock']);

        if ($request->hasFile('image')) {
            $this->deleteStoredImage($product->image);
            $data['image'] = $this->storeImage($request);
        } elseif ($request->boolean('remove_image')) {
            $this->deleteStoredImage($product->image);
            $data['image'] = null;
        }

        $product->update($data);

        return new ProductResource($product->load('category'));
    }

    public function updateStock(UpdateStockRequest $request, Product $product): ProductResource
    {
        $product->update(['stock' => $request->integer('stock')]);

        return new ProductResource($product->load('category'));
    }

    public function destroy(Product $product): Response
    {
        // Suppression logique : l'historique des demandes reste lisible.
        // Les favoris et paniers qui référencent ce produit sont retirés.
        DB::transaction(function () use ($product) {
            $product->favoris()->delete();
            $product->paniers()->delete();
            $product->delete();
        });

        return response()->noContent();
    }

    /** Enregistre l'image sur le disque "public" (storage/app/public/products) et renvoie son chemin relatif. */
    private function storeImage(ProductRequest $request): string
    {
        $path = $request->file('image')->store('products', 'public');

        if (! $path) {
            throw ValidationException::withMessages([
                'image' => ["Impossible d'enregistrer l'image sur le serveur. Vérifiez les droits d'écriture de storage/app/public."],
            ]);
        }

        return $path;
    }

    private function deleteStoredImage(?string $path): void
    {
        // Les images de démonstration sont des URL absolues : rien à supprimer sur le disque.
        if ($path && ! preg_match('#^https?://#i', $path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
