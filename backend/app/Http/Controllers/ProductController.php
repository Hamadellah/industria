<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'category_id' => ['nullable', 'integer'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0'],
            'in_stock' => ['nullable', 'boolean'],
            'sort' => ['nullable', 'in:newest,price_asc,price_desc,popular'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:48'],
        ]);

        $products = Product::query()
            ->with('category')
            ->filter($filters)
            ->sortBy($filters['sort'] ?? null)
            ->paginate($filters['per_page'] ?? 12)
            ->withQueryString();

        return ProductResource::collection($products);
    }

    public function show(Product $product): ProductResource
    {
        return new ProductResource($product->load('category'));
    }

    public function related(Product $product): AnonymousResourceCollection
    {
        $related = Product::with('category')
            ->where('category_id', $product->category_id)
            ->whereKeyNot($product->id)
            ->inRandomOrder()
            ->limit(4)
            ->get();

        return ProductResource::collection($related);
    }
}
