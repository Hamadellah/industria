<?php

namespace Tests\Feature;

use App\Models\Favori;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FavoriTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_use_favorites(): void
    {
        $product = Product::factory()->create();

        $this->getJson('/api/favoris')->assertUnauthorized();
        $this->postJson("/api/favoris/{$product->id}")->assertUnauthorized();
    }

    public function test_client_can_add_list_and_remove_favorites(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson("/api/favoris/{$product->id}")->assertCreated();
        $this->getJson('/api/favoris')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $product->id);
        $this->getJson('/api/favoris/ids')->assertOk()->assertJsonPath('data.0', $product->id);

        $this->deleteJson("/api/favoris/{$product->id}")->assertNoContent();
        $this->assertDatabaseCount('favoris', 0);
    }

    public function test_adding_the_same_favorite_twice_does_not_create_a_duplicate(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson("/api/favoris/{$product->id}")->assertCreated();
        $this->postJson("/api/favoris/{$product->id}")->assertOk();

        $this->assertSame(1, Favori::where('user_id', $user->id)->count());
    }

    public function test_users_only_see_their_own_favorites(): void
    {
        $product = Product::factory()->create();
        Favori::factory()->create(['product_id' => $product->id]);
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/favoris')->assertOk()->assertJsonCount(0, 'data');
    }
}
