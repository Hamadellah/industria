<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Demande extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'en_attente';
    public const STATUS_VALIDATED = 'validee';
    public const STATUS_REJECTED = 'rejetee';

    protected $fillable = [
        'user_id',
        'product_id',
        'quantity',
        'unit_price',
        'reference',
        'status',
        'address',
    ];

    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'quantity' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function getTotalAttribute(): string
    {
        return number_format($this->unit_price * $this->quantity, 2, '.', '');
    }
}
