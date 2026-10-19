<?php

namespace Tests\Feature;

use App\Models\Demande;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DemandeValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_validate_a_demande_and_stock_is_decremented(): void
    {
        $product = Product::factory()->create(['stock' => 10]);
        $demande = Demande::factory()->create(['product_id' => $product->id, 'quantity' => 4]);
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson("/api/admin/demandes/{$demande->id}/validate")
            ->assertOk()->assertJsonPath('data.status', 'validee');

        $this->assertSame(6, $product->fresh()->stock);
    }

    public function test_validation_fails_without_enough_stock_and_leaves_data_untouched(): void
    {
        $product = Product::factory()->create(['stock' => 2]);
        $demande = Demande::factory()->create(['product_id' => $product->id, 'quantity' => 3]);
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson("/api/admin/demandes/{$demande->id}/validate")
            ->assertUnprocessable()->assertJsonValidationErrors('stock');

        $this->assertSame(2, $product->fresh()->stock);
        $this->assertSame('en_attente', $demande->fresh()->status);
    }

    public function test_stock_never_goes_negative_when_two_demandes_compete_for_the_last_units(): void
    {
        $product = Product::factory()->create(['stock' => 3]);
        $first = Demande::factory()->create(['product_id' => $product->id, 'quantity' => 2]);
        $second = Demande::factory()->create(['product_id' => $product->id, 'quantity' => 2]);
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson("/api/admin/demandes/{$first->id}/validate")->assertOk();
        $this->postJson("/api/admin/demandes/{$second->id}/validate")->assertUnprocessable();

        $this->assertSame(1, $product->fresh()->stock);
        $this->assertSame('en_attente', $second->fresh()->status);
    }

    public function test_a_demande_cannot_be_processed_twice(): void
    {
        $product = Product::factory()->create(['stock' => 10]);
        $demande = Demande::factory()->create(['product_id' => $product->id, 'quantity' => 1]);
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson("/api/admin/demandes/{$demande->id}/validate")->assertOk();
        $this->postJson("/api/admin/demandes/{$demande->id}/validate")->assertStatus(409);
        $this->postJson("/api/admin/demandes/{$demande->id}/reject")->assertStatus(409);

        $this->assertSame(9, $product->fresh()->stock);
    }

    public function test_admin_can_reject_a_demande_without_touching_stock(): void
    {
        $product = Product::factory()->create(['stock' => 10]);
        $demande = Demande::factory()->create(['product_id' => $product->id, 'quantity' => 4]);
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson("/api/admin/demandes/{$demande->id}/reject")
            ->assertOk()->assertJsonPath('data.status', 'rejetee');

        $this->assertSame(10, $product->fresh()->stock);
    }

    public function test_admin_can_list_and_filter_all_demandes(): void
    {
        Demande::factory()->count(2)->create();
        Demande::factory()->validated()->create();
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/admin/demandes')->assertOk()->assertJsonCount(3, 'data');
        $this->getJson('/api/admin/demandes?status=validee')->assertOk()->assertJsonCount(1, 'data');
    }
}
