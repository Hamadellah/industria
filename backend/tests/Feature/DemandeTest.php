<?php

namespace Tests\Feature;

use App\Models\Demande;
use App\Models\Panier;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DemandeTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_submit_a_demande_from_the_cart(): void
    {
        $user = User::factory()->create();
        $a = Product::factory()->create(['price' => 100, 'stock' => 5]);
        $b = Product::factory()->create(['price' => 50, 'stock' => 5]);
        Panier::factory()->create(['user_id' => $user->id, 'product_id' => $a->id, 'quantity' => 2]);
        Panier::factory()->create(['user_id' => $user->id, 'product_id' => $b->id, 'quantity' => 1]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/demandes', ['address' => '12 rue Hassan II, Casablanca'])
            ->assertCreated()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.status', 'en_attente');

        $this->assertCount(1, array_unique($response->json('data.*.reference')));
        $this->assertDatabaseCount('demandes', 2);
        $this->assertDatabaseCount('paniers', 0);
        // Le stock n'est décrémenté qu'à la validation par l'administrateur.
        $this->assertSame(5, $a->fresh()->stock);
    }

    public function test_demande_requires_address_and_a_non_empty_cart(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/demandes', [])->assertUnprocessable()->assertJsonValidationErrors('address');
        $this->postJson('/api/demandes', ['address' => '12 rue Hassan II, Casablanca'])
            ->assertUnprocessable()->assertJsonValidationErrors('cart');
    }

    public function test_demande_is_refused_when_stock_became_insufficient_and_nothing_is_created(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock' => 5]);
        Panier::factory()->create(['user_id' => $user->id, 'product_id' => $product->id, 'quantity' => 4]);
        $product->update(['stock' => 2]);
        Sanctum::actingAs($user);

        $this->postJson('/api/demandes', ['address' => '12 rue Hassan II, Casablanca'])
            ->assertUnprocessable()->assertJsonValidationErrors('cart');

        $this->assertDatabaseCount('demandes', 0);
        $this->assertDatabaseCount('paniers', 1);
    }

    public function test_client_only_sees_own_demandes(): void
    {
        $user = User::factory()->create();
        Demande::factory()->count(2)->create(['user_id' => $user->id]);
        Demande::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/demandes')->assertOk()->assertJsonCount(2, 'data');
    }
}
