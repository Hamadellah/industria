<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\DemandeResource;
use App\Models\Demande;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class DemandeController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate(['status' => ['nullable', 'in:en_attente,validee,rejetee']]);

        $demandes = Demande::with(['user', 'product.category'])
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->when($request->query('q'), function ($q, $term) {
                $term = '%'.addcslashes($term, '%_\\').'%';
                $q->where(function ($w) use ($term) {
                    $w->where('reference', 'like', $term)
                        ->orWhereHas('user', fn ($u) => $u->where('name', 'like', $term)->orWhere('email', 'like', $term))
                        ->orWhereHas('product', fn ($p) => $p->withTrashed()->where('name', 'like', $term));
                });
            })
            ->latest()
            ->paginate($request->integer('per_page', 10));

        return DemandeResource::collection($demandes);
    }

    /**
     * Validation d'une demande : le stock est vérifié puis décrémenté dans une transaction,
     * avec une mise à jour conditionnelle atomique (stock >= quantité) pour empêcher la survente.
     */
    public function validateDemande(Demande $demande): DemandeResource
    {
        DB::transaction(function () use ($demande) {
            $locked = Demande::whereKey($demande->id)->lockForUpdate()->firstOrFail();

            if ($locked->status !== Demande::STATUS_PENDING) {
                throw new ConflictHttpException('Cette demande a déjà été traitée.');
            }

            $affected = Product::withTrashed()
                ->whereKey($locked->product_id)
                ->where('stock', '>=', $locked->quantity)
                ->decrement('stock', $locked->quantity);

            if ($affected !== 1) {
                throw ValidationException::withMessages([
                    'stock' => ['Stock insuffisant pour valider cette demande.'],
                ]);
            }

            $locked->update(['status' => Demande::STATUS_VALIDATED]);
        });

        return new DemandeResource($demande->refresh()->load(['user', 'product.category']));
    }

    public function reject(Demande $demande): DemandeResource
    {
        DB::transaction(function () use ($demande) {
            $locked = Demande::whereKey($demande->id)->lockForUpdate()->firstOrFail();

            if ($locked->status !== Demande::STATUS_PENDING) {
                throw new ConflictHttpException('Cette demande a déjà été traitée.');
            }

            $locked->update(['status' => Demande::STATUS_REJECTED]);
        });

        return new DemandeResource($demande->refresh()->load(['user', 'product.category']));
    }
}
