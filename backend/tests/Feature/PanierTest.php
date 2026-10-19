<?php

namespace Tests\Feature;

use App\Models\Panier;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PanierTest extends TestCase
{
    use RefreshDatabase;

    public function test_cart_requires_authentication(): void
    {
        $this->getJson('/api/cart')->assertUnauthorized();
    }

    public function test_client_can_add_update_and_remove_cart_items_with_totals(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['price' => 100, 'stock' => 10]);
        Sanctum::actingAs($user);

        $this->postJson('/api/cart', ['product_id' => $product->id, 'quantity' => 2])
            ->assertCreated()
            ->assertJsonPath('count', 2)
            ->assertJsonPath('total', 200);

        // Ajouter à nouveau incrémente la quantité (pas de doublon).
        $this->postJson('/api/cart', ['product_id' => $product->id])->assertCreated()->assertJsonPath('count', 3);
        $this->assertSame(1, Panier::where('user_id', $user->id)->count());

        $item = Panier::first();
        $this->patchJson("/api/cart/{$item->id}", ['quantity' => 5])->assertOk()->assertJsonPath('total', 500);

        $this->deleteJson("/api/cart/{$item->id}")->assertOk()->assertJsonPath('count', 0);
    }

    public function test_cannot_add_more_than_available_stock(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $product = Product::factory()->create(['stock' => 3]);

        $this->postJson('/api/cart', ['product_id' => $product->id, 'quantity' => 4])
            ->assertUnprocessable()->assertJsonValidationErrors('quantity');

        $this->postJson('/api/cart', ['product_id' => $product->id, 'quantity' => 3])->assertCreated();
        $this->postJson('/api/cart', ['product_id' => $product->id, 'quantity' => 1])->assertUnprocessable();
    }

    public function test_cannot_add_out_of_stock_product_or_set_invalid_quantity(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $empty = Product::factory()->outOfStock()->create();
        $ok = Product::factory()->create(['stock' => 5]);

        $this->postJson('/api/cart', ['product_id' => $empty->id])->assertUnprocessable();

        $item = Panier::factory()->create(['user_id' => $user->id, 'product_id' => $ok->id]);
        $this->patchJson("/api/cart/{$item->id}", ['quantity' => 0])->assertUnprocessable();
        $this->patchJson("/api/cart/{$item->id}", ['quantity' => 6])->assertUnprocessable();
    }

    public function test_a_user_cannot_modify_another_users_cart_item(): void
    {
        $item = Panier::factory()->create();
        Sanctum::actingAs(User::factory()->create());

        $this->patchJson("/api/cart/{$item->id}", ['quantity' => 1])->assertNotFound();
        $this->deleteJson("/api/cart/{$item->id}")->assertNotFound();
        $this->assertDatabaseHas('paniers', ['id' => $item->id]);
    }
}
