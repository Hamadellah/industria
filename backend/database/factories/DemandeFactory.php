<?php

namespace Database\Factories;

use App\Models\Demande;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Demande> */
class DemandeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'product_id' => Product::factory(),
            'quantity' => fake()->numberBetween(1, 3),
            'unit_price' => fake()->randomFloat(2, 29, 2500),
            'reference' => 'CMD-'.strtoupper(Str::random(8)),
            'status' => Demande::STATUS_PENDING,
            'address' => fake()->streetAddress().', '.fake()->city().', Maroc',
        ];
    }

    public function validated(): static
    {
        return $this->state(fn () => ['status' => Demande::STATUS_VALIDATED]);
    }

    public function rejected(): static
    {
        return $this->state(fn () => ['status' => Demande::STATUS_REJECTED]);
    }
}
