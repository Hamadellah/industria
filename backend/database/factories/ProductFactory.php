<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Product> */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => ucfirst(fake()->unique()->words(3, true)),
            'price' => fake()->randomFloat(2, 29, 2500),
            'description' => fake()->paragraph(3),
            'user_id' => User::factory()->admin(),
            'category_id' => Category::factory(),
            'stock' => fake()->numberBetween(1, 50),
            'image' => null,
        ];
    }

    public function outOfStock(): static
    {
        return $this->state(fn () => ['stock' => 0]);
    }
}
