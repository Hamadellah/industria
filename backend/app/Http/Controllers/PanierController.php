<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddToCartRequest;
use App\Http\Requests\UpdateCartRequest;
use App\Http\Resources\PanierResource;
use App\Models\Panier;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class PanierController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json($this->payload($request));
    }

    public function store(AddToCartRequest $request): JsonResponse
    {
        $user = $request->user();
        $product = Product::findOrFail($request->integer('product_id'));
        $quantity = $request->integer('quantity', 1);

        $panier = Panier::firstOrNew(['user_id' => $user->id, 'product_id' => $product->id]);
        $newQuantity = ($panier->exists ? $panier->quantity : 0) + $quantity;

        $this->assertStock($product, $newQuantity);

        $panier->quantity = $newQuantity;
        $panier->save();

        return response()->json($this->payload($request), Response::HTTP_CREATED);
    }

    public function update(UpdateCartRequest $request, int $panier): JsonResponse
    {
        $item = $request->user()->paniers()->with('product')->findOrFail($panier);

        $this->assertStock($item->product, $request->integer('quantity'));

        $item->update(['quantity' => $request->integer('quantity')]);

        return response()->json($this->payload($request));
    }

    public function destroy(Request $request, int $panier): JsonResponse
    {
        $request->user()->paniers()->findOrFail($panier)->delete();

        return response()->json($this->payload($request));
    }

    public function clear(Request $request): Response
    {
        $request->user()->paniers()->delete();

        return response()->noContent();
    }

    private function assertStock(Product $product, int $quantity): void
    {
        if ($product->stock < 1) {
            throw ValidationException::withMessages([
                'quantity' => ["« {$product->name} » est en rupture de stock."],
            ]);
        }

        if ($quantity > $product->stock) {
            throw ValidationException::withMessages([
                'quantity' => ["Stock insuffisant pour « {$product->name} » : {$product->stock} disponible(s)."],
            ]);
        }
    }

    private function payload(Request $request): array
    {
        $items = $request->user()->paniers()
            ->whereHas('product')
            ->with('product.category')
            ->orderBy('created_at')
            ->get();

        $total = $items->sum(fn (Panier $item) => (float) $item->product->price * $item->quantity);

        return [
            'data' => PanierResource::collection($items)->resolve(),
            'count' => (int) $items->sum('quantity'),
            'total' => round($total, 2),
        ];
    }
}
