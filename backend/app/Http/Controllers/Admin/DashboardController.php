<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\DemandeResource;
use App\Http\Resources\UserResource;
use App\Models\Category;
use App\Models\Demande;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $demandeCounts = Demande::selectRaw('status, count(*) as nb')->groupBy('status')->pluck('nb', 'status');

        // Demandes des 6 derniers mois (regroupées en PHP pour rester indépendant du SGBD).
        $start = now()->startOfMonth()->subMonths(5);
        $perMonth = Demande::where('created_at', '>=', $start)->get(['created_at'])
            ->groupBy(fn ($d) => $d->created_at->format('Y-m'))
            ->map->count();

        $months = collect(range(0, 5))->map(function ($i) use ($start, $perMonth) {
            $month = $start->copy()->addMonths($i);

            return [
                'month' => $month->format('Y-m'),
                'label' => $month->locale('fr')->translatedFormat('M Y'),
                'total' => (int) ($perMonth[$month->format('Y-m')] ?? 0),
            ];
        })->values();

        $categories = Category::withCount('products')->orderByDesc('products_count')->limit(8)
            ->get()->map(fn ($c) => ['name' => $c->name, 'products_count' => $c->products_count]);

        return response()->json([
            'totals' => [
                'users' => User::count(),
                'clients' => User::where('role', User::ROLE_CLIENT)->count(),
                'products' => Product::count(),
                'categories' => Category::count(),
                'demandes' => (int) $demandeCounts->sum(),
                'en_attente' => (int) ($demandeCounts[Demande::STATUS_PENDING] ?? 0),
                'validee' => (int) ($demandeCounts[Demande::STATUS_VALIDATED] ?? 0),
                'rejetee' => (int) ($demandeCounts[Demande::STATUS_REJECTED] ?? 0),
                'low_stock' => Product::where('stock', '<=', 5)->count(),
                'validated_revenue' => round((float) Demande::where('status', Demande::STATUS_VALIDATED)
                    ->selectRaw('coalesce(sum(unit_price * quantity), 0) as revenue')->value('revenue'), 2),
            ],
            'demandes_per_month' => $months,
            'products_per_category' => $categories,
            'recent_demandes' => DemandeResource::collection(
                Demande::with(['user', 'product'])->latest()->limit(6)->get()
            )->resolve(),
            'recent_users' => UserResource::collection(User::latest()->limit(5)->get())->resolve(),
        ]);
    }
}
