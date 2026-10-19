<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'price',
        'description',
        'user_id',
        'category_id',
        'stock',
        'image',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'stock' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function demandes(): HasMany
    {
        return $this->hasMany(Demande::class);
    }

    public function favoris(): HasMany
    {
        return $this->hasMany(Favori::class);
    }

    public function paniers(): HasMany
    {
        return $this->hasMany(Panier::class);
    }

    /** Recherche, filtres et tri du catalogue. */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['q'] ?? null, function (Builder $q, string $term) {
                $term = addcslashes($term, '%_\\');
                $q->where('name', 'like', "%{$term}%");
            })
            ->when($filters['category_id'] ?? null, fn (Builder $q, $id) => $q->where('category_id', $id))
            ->when(isset($filters['min_price']) && $filters['min_price'] !== '', fn (Builder $q) => $q->where('price', '>=', $filters['min_price']))
            ->when(isset($filters['max_price']) && $filters['max_price'] !== '', fn (Builder $q) => $q->where('price', '<=', $filters['max_price']))
            ->when(isset($filters['in_stock']) && filter_var($filters['in_stock'], FILTER_VALIDATE_BOOLEAN), fn (Builder $q) => $q->where('stock', '>', 0));
    }

    public function scopeSortBy(Builder $query, ?string $sort): Builder
    {
        return match ($sort) {
            'price_asc' => $query->orderBy('price')->orderByDesc('id'),
            'price_desc' => $query->orderByDesc('price')->orderByDesc('id'),
            // Popularité = nombre de demandes + nombre de favoris.
            'popular' => $query
                ->orderByRaw('(select count(*) from demandes where demandes.product_id = products.id) + (select count(*) from favoris where favoris.product_id = products.id) desc')
                ->orderByDesc('id'),
            default => $query->orderByDesc('created_at')->orderByDesc('id'),
        };
    }
}
