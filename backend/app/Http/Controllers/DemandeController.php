<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDemandeRequest;
use App\Http\Resources\DemandeResource;
use App\Models\Demande;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class DemandeController extends Controller
{
    /** Historique des demandes du client connecté. */
    public function index(Request $request): AnonymousResourceCollection
    {
        $demandes = $request->user()->demandes()
            ->with('product.category')
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return DemandeResource::collection($demandes);
    }

    /**
     * Transforme le panier en demandes (une ligne par produit, regroupées par référence).
     * Aucun paiement : la demande est simplement enregistrée avec l'adresse de livraison.
     */
    public function store(StoreDemandeRequest $request): JsonResponse
    {
        $user = $request->user();

        $demandes = DB::transaction(function () use ($request, $user) {
            $items = $user->paniers()->orderBy('id')->get();

            if ($items->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => ['Votre panier est vide.'],
                ]);
            }

            $reference = 'CMD-'.strtoupper(Str::random(8));
            $created = collect();

            foreach ($items as $item) {
                $product = Product::whereKey($item->product_id)->lockForUpdate()->first();

                if (! $product) {
                    throw ValidationException::withMessages([
                        'cart' => ['Un produit de votre panier n\'est plus disponible.'],
                    ]);
                }

                if ($product->stock < $item->quantity) {
                    throw ValidationException::withMessages([
                        'cart' => ["Stock insuffisant pour « {$product->name} » : {$product->stock} disponible(s), {$item->quantity} demandé(s)."],
                    ]);
                }

                $created->push(Demande::create([
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                    'quantity' => $item->quantity,
                    'unit_price' => $product->price,
                    'reference' => $reference,
                    'status' => Demande::STATUS_PENDING,
                    'address' => $request->input('address'),
                ]));
            }

            $user->paniers()->delete();

            return $created;
        });

        // Recharge en vraie collection Eloquent avec les relations nécessaires à la ressource.
        $demandes = Demande::with('product.category')->whereIn('id', $demandes->pluck('id'))->orderBy('id')->get();

        return DemandeResource::collection($demandes)->response()->setStatusCode(Response::HTTP_CREATED);
    }
}
