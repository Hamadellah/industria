<?php

namespace Tests\Feature;

use App\Models\Panier;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StockTest extends TestCase
{
    use RefreshDatabase;

    public function test_stock_cannot_be_set_negative_by_the_api(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $product = Product::factory()->create(['stock' => 2]);

        $this->patchJson("/api/admin/products/{$product->id}/stock", ['stock' => -1])
            ->assertUnprocessable()->assertJsonValidationErrors('stock');

        $this->assertSame(2, $product->fresh()->stock);
    }

    public function test_product_resource_reports_availability(): void
    {
        $available = Product::factory()->create(['stock' => 4]);
        $soldOut = Product::factory()->outOfStock()->create();

        $this->getJson("/api/products/{$available->id}")->assertJsonPath('data.in_stock', true);
        $this->getJson("/api/products/{$soldOut->id}")->assertJsonPath('data.in_stock', false)->assertJsonPath('data.stock', 0);
    }

    public function test_cart_is_checked_against_current_stock_when_submitting_a_demande(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock' => 1]);
        Panier::factory()->create(['user_id' => $user->id, 'product_id' => $product->id, 'quantity' => 1]);
        $product->update(['stock' => 0]);
        Sanctum::actingAs($user);

        $this->postJson('/api/demandes', ['address' => '12 rue Hassan II, Casablanca'])->assertUnprocessable();
        $this->assertDatabaseCount('demandes', 0);
    }
}
